#!/usr/bin/env python3
"""
Config Manager Tk (standalone)
- Edits SQLite config DB used by backend (data/config.db)
- Tables: issue_clusters(cluster, keywords JSON),
          aspect_keywords(aspect, keywords JSON),
          suggestion_map(aspect, suggestion TEXT),
          advanced_suggestions(aspect, data JSON),
          settings(k, v TEXT)
Run: python tools/config_manager_tk.py
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, filedialog
import sqlite3, json, os, sys
from pathlib import Path
from typing import List, Tuple

USE_HTTP = os.getenv("DEPLOY") == "1"
ADMIN_API = os.getenv("ADMIN_API", "http://localhost:8000/admin")


# ---------- CONFIG ----------
ROOT = Path(__file__).resolve().parents[1]  # project root (one level up from tools/)


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]    # ← VERY IMPORTANT
DB_PATH = BASE_DIR / "data" / "config.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)



# ---------- DB HELPERS ----------
def _conn():
    return sqlite3.connect(str(DB_PATH))

def ensure_tables():
    conn = _conn()
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS issue_clusters (cluster TEXT PRIMARY KEY, keywords TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS aspect_keywords (aspect TEXT PRIMARY KEY, keywords TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS suggestion_map (aspect TEXT PRIMARY KEY, suggestion TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS advanced_suggestions (aspect TEXT PRIMARY KEY, data TEXT)")
    conn.commit()
    conn.close()

def fetch_all(table: str) -> List[Tuple]:
    conn = _conn(); cur = conn.cursor()
    if table == "settings":
        cur.execute("SELECT k, v FROM settings ORDER BY k")
    elif table == "issue_clusters":
        cur.execute("SELECT cluster, keywords FROM issue_clusters ORDER BY cluster")
    elif table == "aspect_keywords":
        cur.execute("SELECT aspect, keywords FROM aspect_keywords ORDER BY aspect")
    elif table == "suggestion_map":
        cur.execute("SELECT aspect, suggestion FROM suggestion_map ORDER BY aspect")
    elif table == "advanced_suggestions":
        cur.execute("SELECT aspect, data FROM advanced_suggestions ORDER BY aspect")
    rows = cur.fetchall(); conn.close(); return rows

def upsert_kv(table: str, key: str, value: str):
    # if USE_HTTP:
    #     import requests
    #     requests.post(f"{ADMIN_API}/config", json={
    #         "table": table,
    #         "key": key,
    #         "value": value
    #     })
    #     return
        
    conn = _conn(); cur = conn.cursor()
    if table == "settings":
        cur.execute("REPLACE INTO settings(k,v) VALUES(?,?)", (key, value))
    elif table == "issue_clusters":
        cur.execute("REPLACE INTO issue_clusters(cluster,keywords) VALUES(?,?)", (key, value))
    elif table == "aspect_keywords":
        cur.execute("REPLACE INTO aspect_keywords(aspect,keywords) VALUES(?,?)", (key, value))
    elif table == "suggestion_map":
        cur.execute("REPLACE INTO suggestion_map(aspect,suggestion) VALUES(?,?)", (key, value))
    elif table == "advanced_suggestions":
        cur.execute("REPLACE INTO advanced_suggestions(aspect,data) VALUES(?,?)", (key, value))
    conn.commit(); conn.close()

def delete_key(table: str, key: str):
    # if USE_HTTP:
    #     import requests
    #     requests.delete(f"{ADMIN_API}/config/{table}/{key}")
    #     return
    conn = _conn(); cur = conn.cursor()
    if table == "settings":
        cur.execute("DELETE FROM settings WHERE k=?", (key,))
    elif table == "issue_clusters":
        cur.execute("DELETE FROM issue_clusters WHERE cluster=?", (key,))
    elif table == "aspect_keywords":
        cur.execute("DELETE FROM aspect_keywords WHERE aspect=?", (key,))
    elif table == "suggestion_map":
        cur.execute("DELETE FROM suggestion_map WHERE aspect=?", (key,))
    elif table == "advanced_suggestions":
        cur.execute("DELETE FROM advanced_suggestions WHERE aspect=?", (key,))
    conn.commit(); conn.close()



# ---------- JSON editor dialog ----------
class JsonEditor(tk.Toplevel):
    def __init__(self, master, title="Edit JSON", initial=None):
        super().__init__(master)
        self.title(title)
        self.geometry("720x480")
        self.transient(master)
        self.resizable(True, True)
        self.initial = initial or ""
        lbl = ttk.Label(self, text="Edit JSON (arrays/objects allowed). Press Save when valid.")
        lbl.pack(padx=8, pady=(8,0), anchor="w")
        self.txt = tk.Text(self, wrap="none", font=("Consolas", 11))
        self.txt.pack(fill="both", expand=True, padx=8, pady=6)
        self.txt.insert("1.0", json.dumps(initial, indent=2) if not isinstance(initial, str) else initial)
        btns = ttk.Frame(self)
        btns.pack(fill="x", padx=8, pady=8)
        ttk.Button(btns, text="Validate & Save", command=self.on_save).pack(side="right")
        ttk.Button(btns, text="Cancel", command=self.destroy).pack(side="right", padx=6)
        self.result = None

    def on_save(self):
        s = self.txt.get("1.0", "end").strip()
        if not s:
            messagebox.showerror("Empty", "JSON cannot be empty.")
            return
        try:
            parsed = json.loads(s)
        except Exception as e:
            messagebox.showerror("Invalid JSON", f"JSON parse error:\n{e}")
            return
        self.result = parsed
        self.destroy()

# ---------- Small utilities ----------
def show_error(title, msg):
    messagebox.showerror(title, msg)

# ---------- Main App ----------
class ConfigManagerApp(tk.Tk):
    TABLES = [
        ("Issue Clusters", "issue_clusters", "cluster", "keywords", True),
        ("Aspect Keywords", "aspect_keywords", "aspect", "keywords", True),
        ("Suggestion Map", "suggestion_map", "aspect", "suggestion", False),
        ("Advanced Suggestions", "advanced_suggestions", "aspect", "data", True),
        ("Settings", "settings", "k", "v", False), ]

    def __init__(self):
        super().__init__()
        self.title("Config Manager - SQLite (config.db)")
        self.geometry("1050x700")
        style = ttk.Style(self)
        style.theme_use("clam" if "clam" in style.theme_names() else style.theme_use())
        self.create_widgets()

    def create_widgets(self):
        # Top toolbar
        toolbar = ttk.Frame(self)
        toolbar.pack(fill="x", padx=8, pady=6)
        ttk.Label(toolbar, text=f"DB: {DB_PATH}").pack(side="left")
        ttk.Button(toolbar, text="Init/Ensure Tables", command=self.on_init_db).pack(side="right")
        ttk.Button(toolbar, text="Import JSON", command=self.on_import).pack(side="right", padx=6)
        ttk.Button(toolbar, text="Export JSON", command=self.on_export).pack(side="right")
        # Notebook
        self.nb = ttk.Notebook(self)
        self.nb.pack(fill="both", expand=True, padx=8, pady=6)
        self.tabs = {}
        for title, table, key_col, val_col, is_json in self.TABLES:
            frame = ttk.Frame(self.nb)
            self.nb.add(frame, text=title)
            self.tabs[table] = frame
            self._build_table_tab(frame, table, key_col, val_col, is_json)

    def _build_table_tab(self, parent, table, key_col, val_col, is_json):
        # ----- Top bar -----
        top = ttk.Frame(parent)
        top.pack(fill="x", padx=6, pady=6)

        ttk.Label(top, text=f"Table: {table}").pack(side="left")

        search_var = tk.StringVar()
        ttk.Entry(top, textvariable=search_var, width=25).pack(side="left", padx=8)

        ttk.Button(top, text="Refresh",
                command=lambda t=table: self.load_table(t)).pack(side="right")
        ttk.Button(top, text="Delete",
                command=lambda t=table, k=key_col: self.on_delete_selected(t, k)).pack(side="right", padx=6)
        ttk.Button(top, text="Edit",
                command=lambda t=table, k=key_col, v=val_col, j=is_json:
                self.on_edit_selected(t, k, v, j)).pack(side="right", padx=6)
        ttk.Button(top, text="Add",
                command=lambda t=table, k=key_col, v=val_col, j=is_json:
                self.on_add(t, k, v, j)).pack(side="right", padx=6)

        # ----- Frame for table + scrollbars -----
        table_frame = ttk.Frame(parent)
        table_frame.pack(fill="both", expand=True, padx=6, pady=(0,6))

        # Treeview
        cols = (key_col, val_col)
        tv = ttk.Treeview(table_frame, columns=cols, show="headings")

        tv.heading(key_col, text=key_col)
        tv.heading(val_col, text=val_col)

        tv.column(key_col, width=250, anchor="w", stretch=False)
        tv.column(val_col, width=1000, anchor="w", stretch=True)

        tv.pack(side="left", fill="both", expand=True)

        # ----- Scrollbars -----
        vs = ttk.Scrollbar(table_frame, orient="vertical", command=tv.yview)
        vs.pack(side="right", fill="y")
        tv.configure(yscrollcommand=vs.set)

        hs = ttk.Scrollbar(parent, orient="horizontal", command=tv.xview)
        hs.pack(fill="x")
        tv.configure(xscrollcommand=hs.set)

        # Store ref
        parent._tree = tv

        # Double-click to edit
        tv.bind("<Double-1>", lambda e, t=table, k=key_col, v=val_col, j=is_json:
                self.on_edit_selected(t, k, v, j))

        # Load initial
        self.load_table(table)


    def load_table(self, table: str):
        try:
            rows = fetch_all(table)
        except Exception as e:
            show_error("DB Error", str(e))
            return
        frame = self.tabs[table]
        tv = frame._tree
        tv.delete(*tv.get_children())
        for r in rows:
            key = r[0]
            val = r[1]
            # pretty print JSON columns
            try:
                if val and (table in ("issue_clusters","aspect_keywords","advanced_suggestions")):
                    pretty = json.dumps(json.loads(val), ensure_ascii=False)
                else:
                    pretty = val or ""
            except Exception:
                pretty = val or ""
            tv.insert("", "end", values=(key, pretty))

    def _selected(self, table: str):
        frame = self.tabs[table]
        tv = frame._tree
        sel = tv.selection()
        if not sel:
            return None
        return tv.item(sel[0])["values"]

    def on_add(self, table, key_col, val_col, is_json):
        key = simpledialog.askstring("Key", f"Enter {key_col} value (unique):")
        if not key:
            return
        if is_json:
            editor = JsonEditor(self, title=f"Edit JSON for {key}", initial=[])
            self.wait_window(editor)
            if editor.result is None:
                return
            value = json.dumps(editor.result)
        else:
            value = simpledialog.askstring("Value", f"Enter {val_col} value:")
            if value is None:
                return
        try:
            upsert_kv(table, key, value)
            self.load_table(table)
        except Exception as e:
            show_error("Insert Error", str(e))

    def on_edit_selected(self, table, key_col, val_col, is_json):
        sel = self._selected(table)
        if not sel:
            messagebox.showinfo("Select", "Please select a row to edit.")
            return
        key = sel[0]; raw_val = sel[1] or ""
        if is_json:
            # try parse existing
            try:
                parsed = json.loads(raw_val)
            except Exception:
                parsed = raw_val
            editor = JsonEditor(self, title=f"Edit {key}", initial=parsed)
            self.wait_window(editor)
            if editor.result is None:
                return
            new_val = json.dumps(editor.result)
        else:
            new_val = simpledialog.askstring("Edit Value", f"Edit value for {key}:", initialvalue=raw_val)
            if new_val is None:
                return
        try:
            upsert_kv(table, key, new_val)
            self.load_table(table)
        except Exception as e:
            show_error("Update Error", str(e))

    def on_delete_selected(self, table, key_col):
        sel = self._selected(table)
        if not sel:
            messagebox.showinfo("Select", "Please select a row to delete.")
            return
        key = sel[0]
        if not messagebox.askyesno("Confirm", f"Delete {key} from {table}?"):
            return
        try:
            delete_key(table, key)
            self.load_table(table)
        except Exception as e:
            show_error("Delete Error", str(e))

    def on_init_db(self):
        try:
            ensure_tables()
            messagebox.showinfo("OK", f"Tables ensured at: {DB_PATH}")
            # refresh all
            for _, table, _, _, _ in self.TABLES:
                self.load_table(table)
        except Exception as e:
            show_error("Init Error", str(e))

    def on_export(self):
        file = filedialog.asksaveasfilename(defaultextension=".json", filetypes=[("JSON","*.json")])
        if not file:
            return
        payload = {}
        try:
            for _, table, _, _, _ in self.TABLES:
                payload[table] = [list(r) for r in fetch_all(table)]
            with open(file, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            messagebox.showinfo("Exported", f"Exported to {file}")
        except Exception as e:
            show_error("Export Error", str(e))

    def on_import(self):
        file = filedialog.askopenfilename(filetypes=[("JSON","*.json")])
        if not file:
            return
        if not messagebox.askyesno("Confirm", f"Import will REPLACE matching keys from {file}. Continue?"):
            return
        try:
            with open(file, "r", encoding="utf-8") as f:
                payload = json.load(f)
            # payload expected: {table: [[k,v],...], ...}
            for table, rows in payload.items():
                for row in rows:
                    if len(row) < 2: continue
                    k, v = row[0], row[1]
                    # try to store JSON as text (stringify if object)
                    if isinstance(v, (dict, list)):
                        v = json.dumps(v, ensure_ascii=False)
                    upsert_kv(table, k, v)
            messagebox.showinfo("Imported", "Import completed.")
            for _, table, _, _, _ in self.TABLES:
                self.load_table(table)
        except Exception as e:
            show_error("Import Error", str(e))

# ---------- main ----------
def main():
    if not DB_PATH.exists():
        # attempt to create DB & tables
        try:
            ensure_tables()
        except Exception as e:
            messagebox.showerror("DB Error", f"Cannot create DB at {DB_PATH}:\n{e}")
            sys.exit(1)
    app = ConfigManagerApp()
    app.mainloop()

if __name__ == "__main__":
    main()
