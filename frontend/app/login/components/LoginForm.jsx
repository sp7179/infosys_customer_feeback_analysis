"use client"

import { useState } from "react"

export default function LoginForm({ onSuccess }) {
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    // 👁️ New states for eye toggle
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, password }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Login failed")
                return
            }

            localStorage.setItem("authToken", data.token)
            localStorage.setItem("userid", data.userid)      // single user key
            localStorage.setItem("userName", data.name)
            onSuccess()
        } catch {
            setError("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                <input
                    type="text"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="unique_userid"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="••••••••"
                    />
                    <img
                        src={showPassword ? "/eye-off.png" : "/eye.png"}
                        alt="toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
            >
                {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>
    )
}
