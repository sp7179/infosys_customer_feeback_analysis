"use client"

import { useState, useEffect } from "react"

export default function RegisterForm({ onSuccess }) {
    const [name, setName] = useState("")
    const [userid, setUserid] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const [useridTaken, setUseridTaken] = useState(false)
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        combo: false,
        special: false,
    })

    // 👁️ New states for eye toggle
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    // 🟣 Debounce userid availability check
    useEffect(() => {
        if (!userid.trim()) return
        const delay = setTimeout(async () => {
            try {
                const res = await fetch(`/api/users/check-userid?userid=${userid}`)
                const data = await res.json()
                setUseridTaken(data.exists)
            } catch {
                setUseridTaken(false)
            }
        }, 600)
        return () => clearTimeout(delay)
    }, [userid])

    // 🟣 Password live validation
    useEffect(() => {
        setPasswordChecks({
            length: password.length >= 8,
            combo: /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        })
    }, [password])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (useridTaken) {
            setError("Userid already taken")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // ensure all rules ok
        if (!Object.values(passwordChecks).every(Boolean)) {
            setError("Password does not meet all requirements")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, userid, password }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.message || "Registration failed")
                return
            }
            onSuccess()
        } catch {
            setError("Server not reachable. Please retry.")
        } finally {
            setLoading(false)
        }
    }

    // helper render for ❌ red lines
    const renderPasswordErrors = () => {
        const fails = []
        if (!passwordChecks.length) fails.push("❌ atleast 8 characters")
        if (!passwordChecks.combo) fails.push("❌ contain characters and numbers, upper case also")
        if (!passwordChecks.special) fails.push("❌ atleast a special character")
        return fails.map((f, i) => (
            <p key={i} className="text-red-400 text-xs mt-1">{f}</p>
        ))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                <input
                    type="text"
                    value={userid}
                    onChange={(e) => setUserid(e.target.value)}
                    required
                    className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${useridTaken ? "border-red-500" : "border-purple-500/30 focus:border-purple-500"
                        }`}
                    placeholder="unique_userid"
                />
                {useridTaken && <p className="text-red-400 text-xs mt-1">❌ userid already taken</p>}
            </div>

            {/* 🟣 Password field with eye toggle */}
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
                {renderPasswordErrors()}
            </div>

            {/* 🟣 Confirm Password field with eye toggle */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="••••••••"
                    />
                    <img
                        src={showConfirm ? "/eye-off.png" : "/eye.png"}
                        alt="toggle"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2 w-5 h-5 cursor-pointer opacity-70 hover:opacity-100"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50"
            >
                {loading ? "Creating account..." : "Sign Up"}
            </button>
        </form>
    )
}
