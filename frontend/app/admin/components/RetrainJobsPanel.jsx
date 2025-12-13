"use client";
import { useEffect, useState } from "react";
import JsonEditorModal from "./JsonEditorModal";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react"; // if lucide not installed, remove icon import and element

export default function RetrainJobsPanel() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logModal, setLogModal] = useState({ open: false, data: null });


    useEffect(() => {
        const token = sessionStorage.getItem("ADMIN_TOKEN") || "";
        fetch("/api/admin/retrain_jobs", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => {
                if (!r.ok) throw new Error("Fetch failed");
                return r.json();
            })
            .then((d) => setJobs(d.retrain_jobs || []))
            .catch(() => setJobs([]))
            .finally(() => setLoading(false));
    }, []);

    function statusBadge(status) {
        const s = (status || "").toLowerCase();
        const map = {
            queued: "bg-yellow-600/20 text-yellow-300 border-yellow-700",
            running: "bg-blue-600/15 text-blue-300 border-blue-700",
            done: "bg-emerald-600/15 text-emerald-300 border-emerald-700",
            failed: "bg-rose-600/15 text-rose-300 border-rose-700",
        };
        const cls = map[s] || "bg-gray-600/15 text-gray-200 border-gray-700";
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: s === "done" ? "#4ade80" : s === "queued" ? "#f59e0b" : s === "running" ? "#60a5fa" : s === "failed" ? "#fb7185" : "#9ca3af" }} />
                {status || "—"}
            </span>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-linear-to-br from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-white/6"
        >
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 p-2 shadow">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-extrabold text-white">Retrain Jobs</h3>
                            <p className="text-sm text-slate-400">Recent model retraining jobs & metrics (read-only).</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Total Jobs</div>
                        <div className="text-lg font-semibold text-white">{jobs.length}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading retrain jobs…</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">No retrain jobs found.</div>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((j) => {
                            const id = j._id || j.job_id || String(Math.random()).slice(2, 10);
                            const jobId = j.job_id || id;
                            const status = j.status || "unknown";
                            const mv = j.model_version || j.result_metrics?.model_version || "—";
                            const metrics = j.result_metrics || {};
                            const createdAt = j.createdAt || j.created_at || j._created || null;
                            const displayDate = createdAt ? (isNaN(new Date(createdAt)) ? "—" : new Date(createdAt).toLocaleString()) : "—";

                            return (
                                <motion.div
                                    key={id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white/2 rounded-lg p-4 border border-white/6"
                                >
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="font-mono text-xs text-slate-300 bg-white/3 px-2 py-1 rounded">{jobId}</div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold text-white truncate">{j.name || mv || `job-${String(id).slice(-6)}`}</div>
                                                <div className="text-xs text-slate-400">version: <span className="text-slate-200 font-medium ml-1">{mv}</span></div>
                                            </div>
                                            <div className="mt-1 text-xs text-slate-400">created: <span className="text-slate-200 ml-1">{displayDate}</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div>{statusBadge(status)}</div>

                                        <div className="hidden sm:flex flex-col items-end text-right">
                                            <div className="text-xs text-slate-400">metrics</div>
                                            <div className="text-sm font-mono text-white">
                                                acc: {metrics.accuracy ?? "-"} &nbsp;
                                                f1: {metrics.f1 ?? "-"} &nbsp;
                                                p: {metrics.precision ?? "-"} &nbsp;
                                                r: {metrics.recall ?? "-"}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 rounded-md bg-sky-600 text-white text-sm hover:scale-[1.02]">Details</button>
                                            <button
                                                onClick={() => setLogModal({ open: true, data: j })}
                                                className="px-3 py-1 rounded-md border border-white/10 bg-transparent text-sm text-white/80 hover:bg-white/10"
                                            >
                                                View Logs
                                            </button>

                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}


                <JsonEditorModal
                    open={logModal.open}
                    title="Job Log"
                    initial={logModal.data}
                    isReadOnly={true}
                    onClose={() => setLogModal({ open: false, data: null })}
                    onSave={() => { }}
                />
            </div>
        </motion.div>
    );
}
