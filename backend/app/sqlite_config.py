# app/sqlite_config.py
import sqlite3, json, os
from typing import Dict, Any

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]    # ← VERY IMPORTANT
DB_PATH = BASE_DIR / "data" / "config.db"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)



def _conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db(path: str = DB_PATH):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS issue_clusters (cluster TEXT PRIMARY KEY, keywords TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS aspect_keywords (aspect TEXT PRIMARY KEY, keywords TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS suggestion_map (aspect TEXT PRIMARY KEY, suggestion TEXT)""")
    cur.execute("""CREATE TABLE IF NOT EXISTS advanced_suggestions (aspect TEXT PRIMARY KEY, data TEXT)""")
    conn.commit()
    conn.close()

def load_all() -> Dict[str, Any]:
    """
    Returns dict with keys:
     - TOP_N_ISSUES (int)
     - ISSUE_CLUSTERS (dict)
     - ASPECT_KEYWORDS (dict)
     - SUGGESTION_MAP (dict)
     - ADVANCED_SUGGESTION_DATA (dict)
    If DB empty, returns empty dict.
    """
    conn = _conn()
    cur = conn.cursor()

    out = {}
    # settings
    cur.execute("SELECT v FROM settings WHERE k='TOP_N_ISSUES'")
    r = cur.fetchone()
    if r:
        out["TOP_N_ISSUES"] = int(r[0])
    # issue clusters
    cur.execute("SELECT cluster, keywords FROM issue_clusters")
    ic = {}
    for cluster, keywords in cur.fetchall():
        ic[cluster] = json.loads(keywords)
    if ic:
        out["ISSUE_CLUSTERS"] = ic
    # aspects
    cur.execute("SELECT aspect, keywords FROM aspect_keywords")
    ak = {}
    for aspect, keywords in cur.fetchall():
        ak[aspect] = json.loads(keywords)
    if ak:
        out["ASPECT_KEYWORDS"] = ak
    # suggestion_map
    cur.execute("SELECT aspect, suggestion FROM suggestion_map")
    sm = {r[0]: r[1] for r in cur.fetchall()}
    if sm:
        out["SUGGESTION_MAP"] = sm
    # advanced suggestions
    cur.execute("SELECT aspect, data FROM advanced_suggestions")
    adv = {}
    for aspect, data in cur.fetchall():
        adv[aspect] = json.loads(data)
    if adv:
        out["ADVANCED_SUGGESTION_DATA"] = adv

    conn.close()
    return out





# ---- ADMIN CRUD HELPERS (ADD THESE) ----

def set_setting(key: str, value: str):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("REPLACE INTO settings (k, v) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def set_issue_cluster(cluster: str, keywords: list):
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "REPLACE INTO issue_clusters (cluster, keywords) VALUES (?, ?)",
        (cluster, json.dumps(keywords))
    )
    conn.commit()
    conn.close()

def delete_issue_cluster(cluster: str):
    conn = _conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM issue_clusters WHERE cluster=?", (cluster,))
    conn.commit()
    conn.close()

def save_aspect_keywords(aspect: str, keywords: list):
    conn = _conn()
    cur = conn.cursor()
    cur.execute(
        "REPLACE INTO aspect_keywords (aspect, keywords) VALUES (?, ?)",
        (aspect, json.dumps(keywords))
    )
    conn.commit()
    conn.close()
