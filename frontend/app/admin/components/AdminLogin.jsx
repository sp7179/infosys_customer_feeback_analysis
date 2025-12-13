// components/AdminLogin.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, admin_id: adminId }),
            });
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Login failed");
            }
            const data = await res.json();
            // token expected in data.access_token
            const token = data.access_token || data.token || "";
            if (!token) throw new Error("No token returned");
            // store token in sessionStorage (non-persistent)
            sessionStorage.setItem("ADMIN_TOKEN", token);
            document.cookie = `admin_token=${token}; path=/;`;

            sessionStorage.setItem("ADMIN_USER", username || "");
            sessionStorage.setItem("ADMIN_SECTION", "dashboard");
            setTimeout(() => router.replace("/admin"), 50);

        } catch (e) {
            setErr(e.message || "Login error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
            >
                <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">Admin Login</h2>
                <p className="text-sm text-slate-500 mb-4">Enter admin credentials. Session-only token, will not persist.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-slate-600">Admin ID (optional)</label>
                        <input
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-slate-900"
                            placeholder="0000"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-600">Username</label>
                        <input
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-slate-900"
                            placeholder="user"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-600">Password</label>
                        <div className="relative">
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded bg-white dark:bg-slate-900"
                                placeholder="••••••"
                            />
                            <img
                                src={showPassword ? "/eye-off.png" : "/eye.png"}
                                className="absolute right-3 top-2 w-5 cursor-pointer opacity-70 hover:opacity-100"
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                    </div>

                    {err ? <div className="text-rose-600 text-sm">{err}</div> : null}

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setUsername("");
                                setPassword("");
                                setAdminId("");
                                setErr("");
                            }}
                            className="text-sm text-slate-500 hover:underline"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
