"use client"
import { useState } from "react"

export default function SecurityModal({ userid, onClose }) {
    const [editMode, setEditMode] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [msg, setMsg] = useState("")
    const [loading, setLoading] = useState(false)
    const [checks, setChecks] = useState({ length: false, combo: false, special: false })

    // 🟣 Eye toggle states
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const validateLive = (val) => {
        setChecks({
            length: val.length >= 8,
            combo: /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(val),
        })
    }

    const handleSave = async () => {
        if (newPassword !== confirm) return setMsg("❌ Passwords do not match")
        setLoading(true)
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userid, currentPassword, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                setMsg("✅ Password changed successfully")
                setTimeout(() => { setEditMode(false); setMsg("") }, 1500)
            } else setMsg("❌ " + (data.message || "Failed"))
        } finally { setLoading(false) }
    }

    const renderFails = () => {
        const f = []
        if (!checks.length) f.push("❌ atleast 8 characters")
        if (!checks.combo) f.push("❌ contain characters and numbers, upper case also")
        if (!checks.special) f.push("❌ atleast a special character")
        return f.map((x, i) => <p key={i} className="text-red-400 text-xs">{x}</p>)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

            <div
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
                className="relative bg-gray-900 border border-purple-500/30 rounded-2xl w-[90%] max-w-md p-6 text-white"
            >
                <h2 className="text-xl font-semibold text-purple-300 mb-4">Security</h2>

                {!editMode ? (
                    <>
                        <p className="text-gray-400 text-sm mb-2">User ID</p>
                        <p className="text-white mb-4">{userid}</p>

                        <p className="text-gray-400 text-sm mb-2">Password</p>
                        <p className="tracking-widest mb-6">••••••••</p>

                        <div className="flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg">Close</button>
                            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-purple-600 rounded-lg">Change Password</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-3">
                            {/* 🔹 Current Password */}
                            <div>
                                <label className="block text-sm text-gray-400">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white"
                                    />
                                    <img
                                        src={showCurrent ? "/eye.png" : "/eye-off.png"}
                                        alt="toggle"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-2.5 w-5 h-5 cursor-pointer opacity-75 hover:opacity-100"
                                    />
                                </div>
                            </div>

                            {/* 🔹 New Password */}
                            <div>
                                <label className="block text-sm text-gray-400">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => { setNewPassword(e.target.value); validateLive(e.target.value) }}
                                        className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white"
                                    />
                                    <img
                                        src={showNew ? "/eye.png" : "/eye-off.png"}
                                        alt="toggle"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-2.5 w-5 h-5 cursor-pointer opacity-75 hover:opacity-100"
                                    />
                                </div>
                                {renderFails()}
                            </div>

                            {/* 🔹 Confirm Password */}
                            <div>
                                <label className="block text-sm text-gray-400">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white"
                                    />
                                    <img
                                        src={showConfirm ? "/eye.png" : "/eye-off.png"}
                                        alt="toggle"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-2.5 w-5 h-5 cursor-pointer opacity-75 hover:opacity-100"
                                    />
                                </div>
                            </div>
                        </div>

                        {msg && <p className="mt-3 text-sm text-center">{msg}</p>}

                        <div className="flex justify-end gap-3 mt-5">
                            <button
                                onClick={() => { setEditMode(false); setMsg("") }}
                                className="px-4 py-2 bg-gray-700 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
