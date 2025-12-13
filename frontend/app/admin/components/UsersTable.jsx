// components/UsersTable.jsx
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * UsersTable component
 * - Fetches /api/admin/users (proxy) with Bearer token from sessionStorage
 * - Shows list, search, view details modal, delete action
 */

function getToken() {
    return sessionStorage.getItem("ADMIN_TOKEN") || "";
}

async function apiFetch(path, opts = {}) {
    const token = sessionStorage.getItem("ADMIN_TOKEN") || "";
    const defaultHeaders = { ...(opts.headers || {}) };

    // ensure JSON content-type for body requests when not provided
    if (opts.body && !defaultHeaders["Content-Type"]) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`/api/admin/users${path || ""}`, {
        ...opts,
        headers: defaultHeaders,
    });
    return res;
}


export default function UsersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState(null);
    const [page, setPage] = useState(1);
    const perPage = 25;

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, refreshKey]);

    async function loadUsers() {
        setLoading(true);
        try {
            const res = await apiFetch(`?page=${page}&per_page=${perPage}`);
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            // Expecting { users: [...], total: N } or an array
            if (Array.isArray(data)) setUsers(data);
            else if (data.users) setUsers(data.users);
            else setUsers([]);
        } catch (e) {
            alert("Load users error: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        if (!q) return users;
        const s = q.toLowerCase();
        return users.filter(u => (u.username || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s) || (u._id || "").toLowerCase().includes(s));
    }, [users, q]);

    async function handleDelete(id) {
        if (!confirm("Delete user permanently?")) return;
        try {
            const res = await apiFetch(``, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
            if (!res.ok) throw new Error(await res.text());
            setRefreshKey(k => k + 1);
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }

    function openDetails(u) {
        setSelected(u);
    }

    function closeDetails() {
        setSelected(null);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Users</h3>
                    <p className="text-sm text-slate-500">List of registered users — search, inspect, delete.</p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by username / email / id"
                        className="px-3 py-2 border rounded bg-white dark:bg-slate-900"
                    />
                    <button onClick={() => setRefreshKey(k => k + 1)} className="px-3 py-2 rounded bg-blue-500 text-white">Refresh</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="px-3 py-2">ID</th>
                            <th className="px-3 py-2">Username</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Created</th>
                            <th className="px-3 py-2 w-36">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-3 py-8 text-center">Loading…</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">No users</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900">
                                <td className="px-3 py-3 align-top font-mono text-xs max-w-[200px] truncate">{u._id}</td>
                                <td className="px-3 py-3">{u.name || "-"}</td>
                                <td className="px-3 py-3">{u.userid || "-"}</td>
                                <td className="px-3 py-3">{(u.created_at || u.createdAt) ? new Date(u.created_at || u.createdAt).toLocaleString() : "-"}</td>

                                <td className="px-3 py-3">
                                    <div className="flex gap-2">
                                        <button className="px-2 py-1 rounded bg-sky-600 text-white text-sm" onClick={() => openDetails(u)}>View</button>
                                        <button className="px-2 py-1 rounded bg-rose-50 text-rose-600 text-sm border" onClick={() => handleDelete(u._id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination simple controls */}
            <div className="flex items-center justify-between text-sm text-slate-500">
                <div>Showing {filtered.length} users</div>
                <div className="flex items-center gap-2">
                    <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-white border">Prev</button>
                    <div className="px-2">Page {page}</div>
                    <button onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded bg-white border">Next</button>
                </div>
            </div>

            {/* Details modal */}
            {selected ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={closeDetails} />
                    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold text-lg">{selected.username || "User"}</h4>
                                <div className="text-sm text-slate-500">ID: <span className="font-mono text-xs">{selected._id}</span></div>
                            </div>
                            <div>
                                <button onClick={closeDetails} className="px-3 py-1 rounded bg-blue-500 text-white">Close</button>
                            </div>
                        </div>

                        <div className="mt-4 text-sm space-y-2">
                            <div><strong>Email:</strong> {selected.email || "-"}</div>
                            <div><strong>Created:</strong> {selected.created_at ? new Date(selected.created_at).toLocaleString() : "-"}</div>
                            <div><strong>Other:</strong></div>
                            <pre className="mt-2 bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs overflow-auto">{JSON.stringify(selected, null, 2)}</pre>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </div>
    );
}
