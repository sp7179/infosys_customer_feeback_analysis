"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import JsonEditorModal from "./JsonEditorModal";

/* ---------------------------------------------
   TABLE META (Your SQLite → Admin Tables)
----------------------------------------------*/
const TABLES_META = [
    { title: "Issue Clusters", key: "issue_clusters", keyCol: "cluster", valCol: "keywords", isJson: true },
    { title: "Aspect Keywords", key: "aspect_keywords", keyCol: "aspect", valCol: "keywords", isJson: true },
    { title: "Suggestion Map", key: "suggestion_map", keyCol: "aspect", valCol: "suggestion", isJson: false },
    { title: "Advanced Suggestions", key: "advanced_suggestions", keyCol: "aspect", valCol: "data", isJson: true },
    { title: "Top Issues", key: "settings", keyCol: "key", valCol: "value", isJson: false },

];

/* ---------------------------------------------
   ADMIN TOKEN + API FETCH
----------------------------------------------*/
function useAdminToken() {
    return sessionStorage.getItem("ADMIN_TOKEN") || "";
}

function apiFetch(path, opts = {}) {
    const token = sessionStorage.getItem("ADMIN_TOKEN");

    const headers = {
        "Content-Type": "application/json",
        ...(opts.headers || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`/api/admin${path}`, {
        ...opts,
        headers,
    });
}


/* ---------------------------------------------
   MAIN COMPONENT
----------------------------------------------*/
export default function DataManagement() {
    const [meta] = useState(TABLES_META);
    const [activeKey, setActiveKey] = useState(meta[0].key);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [jsonModal, setJsonModal] = useState({ open: false, table: null, key: null, value: null });
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAll();
    }, []);

    /* ---------------------------------------------
       LOAD ALL CONFIG TABLES
    ----------------------------------------------*/
    async function loadAll() {
        setLoading(true);
        try {
            const res = await apiFetch("/config");
            if (!res.ok) throw new Error(await res.text());
            const payload = await res.json();
            const normalized = {};

            normalized.settings = payload.TOP_N_ISSUES
                ? [["TOP_N_ISSUES", String(payload.TOP_N_ISSUES)]]
                : [];


            normalized.issue_clusters = payload.ISSUE_CLUSTERS
                ? Object.entries(payload.ISSUE_CLUSTERS).map(([k, v]) => [k, JSON.stringify(v)])
                : [];

            normalized.aspect_keywords = payload.ASPECT_KEYWORDS
                ? Object.entries(payload.ASPECT_KEYWORDS).map(([k, v]) => [k, JSON.stringify(v)])
                : [];

            normalized.suggestion_map = payload.SUGGESTION_MAP
                ? Object.entries(payload.SUGGESTION_MAP).map(([k, v]) => [k, String(v)])
                : [];

            normalized.advanced_suggestions = payload.ADVANCED_SUGGESTION_DATA
                ? Object.entries(payload.ADVANCED_SUGGESTION_DATA).map(([k, v]) => [k, JSON.stringify(v)])
                : [];

            setData(normalized);
        } catch (e) {
            alert("Load error: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    /* ---------------------------------------------
       SEARCH + FILTER
    ----------------------------------------------*/
    const rows = useMemo(() => {
        return (data[activeKey] || []).filter((row) => {
            if (!search) return true;
            const s = search.toLowerCase();
            return row[0].toLowerCase().includes(s) || row[1].toLowerCase().includes(s);
        });
    }, [data, activeKey, search]);

    /* ---------------------------------------------
       CRUD: ADD / EDIT / DELETE
    ----------------------------------------------*/
    async function saveToBackend(table, key, value) {
        const payload = { table: table === "settings" ? "settings" : table, key, value };

        const res = await apiFetch("/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
    }

    async function handleAdd() {
        const table = activeKey;
        const tmeta = meta.find((m) => m.key === table);

        const key = prompt(`Enter ${tmeta.keyCol} (unique):`);
        if (!key) return;

        if (tmeta.isJson) {
            setJsonModal({ open: true, table, key, value: [] });
            return;
        }

        const value = prompt(`Enter ${tmeta.valCol}:`);
        if (value === null) return;

        await saveToBackend(table, key, value);
        await loadAll();
    }

    async function handleEdit(rowKey, rawVal) {
        const table = activeKey;
        const tmeta = meta.find((m) => m.key === table);

        if (tmeta.isJson) {
            let parsed = null;
            try {
                parsed = JSON.parse(rawVal);
            } catch {
                parsed = rawVal;
            }
            setJsonModal({ open: true, table, key: rowKey, value: parsed });
            return;
        }

        const newVal = prompt(`Edit value for ${rowKey}:`, rawVal);
        if (newVal === null) return;

        await saveToBackend(table, rowKey, newVal);
        await loadAll();
    }

    async function handleDelete(rowKey) {
        if (!confirm(`Delete ${rowKey}?`)) return;

        const res = await apiFetch("/config", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ table: activeKey, key: rowKey }),
        });

        if (!res.ok) alert("Delete failed");
        else await loadAll();
    }

    /* ---------------------------------------------
       IMPORT / EXPORT
    ----------------------------------------------*/
    async function handleImport(ev) {
        const file = ev.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        try {
            const payload = JSON.parse(text);
            for (const [table, rows] of Object.entries(payload)) {
                for (const row of rows) {
                    let parsed = row[1];
                    try {
                        parsed = JSON.parse(row[1]);
                    } catch { }
                    await saveToBackend(table, row[0], parsed);
                }
            }
            await loadAll();
            alert("Import complete");
        } catch (e) {
            alert("Import parse error: " + e.message);
        }
    }

    function handleExport() {
        const out = {};
        for (const table of meta) {
            out[table.key] = data[table.key] || [];
        }
        const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `config-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /* ---------------------------------------------
       JSX UI (Cleaned + Elegant)
    ----------------------------------------------*/
    return (
        <div className="p-4 w-full">

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-semibold mb-1">Data Management</h2>
                <p className="text-sm text-gray-400 mb-5">
                    Edit Issue Clusters, Aspect Keywords, Suggestion Maps, Advanced Suggestions, and Settings.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {meta.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setActiveKey(m.key)}
                        className={`px-3 py-2 rounded-lg text-sm border 
              ${activeKey === m.key ? "bg-blue-600 text-white" : "bg-white/5 text-gray-300 border-white/10"}`}
                    >
                        {m.title}
                    </button>
                ))}

                <div className="ml-auto">
                    <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mb-4">
                <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg" onClick={handleAdd}>Add</button>
                <button
                    className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg"
                    onClick={handleExport}
                >
                    Export
                </button>

                <label className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg cursor-pointer">
                    Import
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                </label>
            </div>

            {/* Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-auto">
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading…</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-white/10 text-gray-300">
                            <tr>
                                <th className="p-3 text-left">Key</th>
                                <th className="p-3 text-left">Value</th>
                                <th className="p-3 text-left w-40">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-6 text-gray-500">No data</td>
                                </tr>
                            ) : (
                                rows.map((r) => (
                                    <tr key={r[0]} className="border-b border-white/10 hover:bg-white/5">
                                        <td className="p-3 align-top">{r[0]}</td>
                                        <td className="p-3 align-top whitespace-pre-wrap text-xs max-w-[500px]">{r[1]}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => handleEdit(r[0], r[1])}>Edit</button>
                                                <button className="px-2 py-1 bg-red-600 text-white rounded text-sm" onClick={() => handleDelete(r[0])}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <JsonEditorModal
                open={jsonModal.open}
                initial={jsonModal.value}
                title={jsonModal.key ? `Edit ${jsonModal.key}` : "Edit JSON"}
                onClose={() => setJsonModal({ open: false, table: null, key: null, value: null })}
                onSave={(obj) => {
                    saveToBackend(jsonModal.table, jsonModal.key, obj)
                        .then(() => {
                            setJsonModal({ open: false });
                            loadAll();
                        })
                        .catch((e) => alert("Save error: " + e.message));
                }}
            />
        </div>
    );
}
