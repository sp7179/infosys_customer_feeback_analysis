// components/LogsTable.jsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import JsonEditorModal from "./JsonEditorModal";

export default function LogsTable() {
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [logModal, setLogModal] = useState({ open: false, data: null });

    useEffect(() => {
        loadLogs();
        // eslint-disable-next-line
    }, []);

    async function loadLogs() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/logs", {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` },
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (e) {
            console.error("Failed to load logs", e);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        if (!filter) return logs;
        const s = filter.toLowerCase();
        return logs.filter((l) =>
            (l.message || "").toLowerCase().includes(s) ||
            (l.type || "").toLowerCase().includes(s) ||
            (l.level || "").toLowerCase().includes(s) ||
            (l.context && JSON.stringify(l.context).toLowerCase().includes(s))
        );
    }, [logs, filter]);

    return (
        <>
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-[#0e0e0e] rounded-2xl shadow-lg border border-white/8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">System Logs</h2>
                        <p className="text-sm text-slate-400">Recent system events — click <span className="font-semibold">View</span> to inspect full JSON.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            placeholder="Search logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white/6 text-white outline-none border border-white/10 w-64"
                        />
                        <div className="text-sm text-slate-400">{logs.length} items</div>
                    </div>
                </div>

                <div className="bg-white/3 rounded-lg overflow-hidden border border-white/6">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5 text-white/80">
                            <tr>
                                <th className="p-3 text-left w-64">Time</th>
                                <th className="p-3 text-left">Type</th>
                                <th className="p-3 text-left">Message</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3} className="p-6 text-center text-slate-400">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={3} className="p-6 text-center text-slate-500">No logs</td></tr>
                            ) : filtered.map((log, i) => {
                                const ts = log.timestamp ? new Date(log.timestamp).toLocaleString() : "—";
                                const level = (log.level || log.type || "info").toLowerCase();
                                const badgeColor = level === "error" ? "bg-rose-600/15 text-rose-300" : level === "warn" ? "bg-yellow-700/10 text-yellow-300" : "bg-emerald-600/10 text-emerald-200";

                                return (
                                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/10 hover:bg-white/5 transition">
                                        <td className="p-3 w-64 text-sm text-slate-200">{ts}</td>
                                        <td className="p-3">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                                                {level}
                                            </span>
                                        </td>
                                        <td className="p-3 flex justify-between items-center gap-4">
                                            <div className="truncate max-w-[70%] text-white/90">{log.message || "-"}</div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setLogModal({ open: true, data: log })}
                                                    className="px-3 py-1 rounded bg-sky-600 text-white text-sm hover:scale-[1.02]"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <JsonEditorModal
                open={logModal.open}
                initial={logModal.data}
                title="Log Details"
                isReadOnly={true}
                onClose={() => setLogModal({ open: false, data: null })}
                onSave={() => { }}
            />
        </>
    );
}
