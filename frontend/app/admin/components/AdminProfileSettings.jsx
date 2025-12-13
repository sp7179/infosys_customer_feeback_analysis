"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminProfileSettings() {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const [form, setForm] = useState({
        username: "",
        oldPassword: "",
        newPassword: "",
    });

    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load current admin username
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/admin/settings", {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.username) setForm(s => ({ ...s, username: data.username }));
            } catch { }
        }
        load();
    }, []);

    // Save admin profile changes
    async function save(e) {
        e.preventDefault();
        setMsg(null);

        if (!form.username || !form.oldPassword || !form.newPassword) {
            return setMsg({ type: "error", text: "All fields required." });
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`,
                },
                body: JSON.stringify({
                    username: form.username,
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                }),
            });

            const text = await res.text();
            if (!res.ok) setMsg({ type: "error", text });
            else {
                setMsg({ type: "success", text });
                setForm(s => ({ ...s, oldPassword: "", newPassword: "" }));
            }
        } catch (err) {
            setMsg({ type: "error", text: "Network error" });
        }
        setLoading(false);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ---------------- LEFT PANEL — Profile Settings ---------------- */}
            <motion.form
                onSubmit={save}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0b0b0b] p-6 rounded-2xl border border-white/10 shadow-xl"
            >
                <h2 className="text-xl font-semibold text-white mb-4">Admin Profile Settings</h2>

                <div className="grid gap-3">
                    <label className="text-sm text-white/70">Username</label>
                    <input
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                        placeholder="admin"
                    />

                    <label className="text-sm text-white/70">Old Password</label>
                    <div className="relative">
                        <input
                            type={showOld ? "text" : "password"}
                            value={form.oldPassword}
                            onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                            placeholder="current password"
                        />
                        <img
                            src={showOld ? "/eye-off.png" : "/eye.png"}
                            className="absolute right-3 top-2 w-5 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => setShowOld(!showOld)}
                        />
                    </div>

                    <label className="text-sm text-white/70">New Password</label>
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                            placeholder="new password"
                        />
                        <img
                            src={showNew ? "/eye-off.png" : "/eye.png"}
                            className="absolute right-3 top-2 w-5 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => setShowNew(!showNew)}
                        />
                    </div>

                    {msg && (
                        <div
                            className={`px-3 py-2 rounded text-sm ${msg.type === "error"
                                    ? "bg-rose-700/30 text-rose-300"
                                    : "bg-emerald-700/20 text-emerald-300"
                                }`}
                        >
                            {msg.text}
                        </div>
                    )}

                    <div className="flex gap-3 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition shadow"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setForm({ username: "", oldPassword: "", newPassword: "" });
                                setMsg(null);
                            }}
                            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </motion.form>

            {/* ---------------- RIGHT PANEL — Add/Delete Admin ---------------- */}
            <NewAdminPanel />

        </div>
    );
}

/* ============================================================
   ADD / DELETE ADMIN PANEL
   ============================================================ */

function NewAdminPanel() {
    const [form, setForm] = useState({
        username: "",
        admin_id: "",
        password: "",
    });

    const [showPwd, setShowPwd] = useState(false);


    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    async function addAdmin(e) {
        e.preventDefault();
        setMsg(null);

        const res = await fetch("/api/admin/add-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`
            },
            body: JSON.stringify(form),
        });

        const text = await res.text();
        if (!res.ok) setMsg({ type: "error", text });
        else {
            setMsg({ type: "success", text });
            setForm({ username: "", admin_id: "", password: "" });
        }
    }

    async function deleteAdmin(e) {
        e.preventDefault();
        setMsg(null);

        const res = await fetch("/api/admin/delete-admin", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`
            },
            body: JSON.stringify({
                username: form.username,
                admin_id: form.admin_id
            }),
        });

        const text = await res.text();
        if (!res.ok) setMsg({ type: "error", text });
        else {
            setMsg({ type: "success", text });
            setForm({ username: "", admin_id: "", password: "" });
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b0b0b] p-6 rounded-2xl border border-white/10 shadow-xl"
        >
            <h2 className="text-xl font-semibold text-white mb-4">Add / Delete Admin</h2>

            <div className="grid gap-3">
                <label className="text-sm text-white/70">Admin ID (optional)</label>
                <input
                    value={form.admin_id}
                    onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                    placeholder="Optional ID"
                />

                <label className="text-sm text-white/70">Username</label>
                <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                    placeholder="admin2"
                />

                <label className="text-sm text-white/70">Password (for add only)</label>
                <div className="relative">
                    <input
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none"
                        placeholder="password"
                    />
                    <img
                        src={showPwd ? "/eye-off.png" : "/eye.png"}
                        className="absolute right-3 top-2 w-5 cursor-pointer opacity-70 hover:opacity-100"
                        onClick={() => setShowPwd(!showPwd)}
                    />
                </div>


                {msg && (
                    <div
                        className={`px-3 py-2 rounded text-sm ${msg.type === "error"
                                ? "bg-rose-700/30 text-rose-300"
                                : "bg-emerald-700/20 text-emerald-300"
                            }`}
                    >
                        {msg.text}
                    </div>
                )}

                <div className="flex gap-3 mt-3">
                    <button
                        onClick={addAdmin}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow"
                        type="button"
                    >
                        Add Admin
                    </button>

                    <button
                        onClick={deleteAdmin}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition shadow"
                        type="button"
                    >
                        Delete Admin
                    </button>
                </div>
            </div>
        </motion.form>
    );
}
