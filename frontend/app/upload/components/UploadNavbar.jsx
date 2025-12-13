"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect, useRef, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ModelSelector from "./ModelSelector"
import ProfileModal from "../../profile/components/ProfileModal"
import SecurityModal from "../../profile/components/SecurityModal"

export default function UploadNavbar() {
    const router = useRouter()
    const [userName, setUserName] = useState("")
    const [userid, setUserid] = useState("")
    const [showProfile, setShowProfile] = useState(false)
    const [showSecurity, setShowSecurity] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)
    const [profilePic, setProfilePic] = useState("/default-avatar.png")

    useEffect(() => {
        setUserName(localStorage.getItem("userName") || "User")
        setUserid(localStorage.getItem("userid") || "")
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [userid])

    useEffect(() => {
        if (userid) {
            fetch(`/api/profile/get/${userid}`)
                .then((res) => res.json())
                .then((data) => setProfilePic(data?.profile?.photo || "/default-avatar.png"))
                .catch(() => setProfilePic("/default-avatar.png"))
        }

    }, [userid])

    const handleLogout = () => {
        localStorage.removeItem("authToken")
        localStorage.removeItem("userName")
        localStorage.removeItem("userid")
        router.push("/")
    }

    const blurActive = showProfile || showSecurity

    return (
        <>
            <nav
                className={`bg-white/5 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50 transition-all ${blurActive ? "opacity-60" : ""
                    }`}
            >
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => router.push("/upload")}
                            className="text-2xl font-bold bg-linear-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                        >
                            SentimentAI
                        </button>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => router.push("/visuals")}
                                className="text-gray-300 hover:text-purple-400 transition-colors font-medium"
                            >
                                Visuals
                            </button>
                            <ModelSelector />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative" ref={menuRef}>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <img
                                src={profilePic}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border border-purple-400 object-cover"
                            />
                            <span>
                                Welcome, <span className="text-purple-300 font-semibold">{userName}</span>
                            </span>
                        </div>


                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="px-4 py-2 text-gray-300 hover:text-purple-400 transition-colors font-medium flex items-center gap-1"
                        >
                            Menu
                            <motion.span
                                animate={{ rotate: menuOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                ▾
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {menuOpen && (
                                <motion.div
                                    key="menu"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="absolute right-0 top-12 bg-gray-900/90 backdrop-blur-xl border border-purple-500/20 rounded-xl shadow-lg overflow-hidden w-44 z-60"
                                >
                                    <div className="flex flex-col divide-y divide-purple-500/20">
                                        <button
                                            onClick={() => {
                                                setShowProfile(true)
                                                setMenuOpen(false)
                                            }}
                                            className="px-4 py-2 text-left text-gray-300 hover:bg-purple-500/20 transition-all"
                                        >
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowSecurity(true)
                                                setMenuOpen(false)
                                            }}
                                            className="px-4 py-2 text-left text-gray-300 hover:bg-purple-500/20 transition-all"
                                        >
                                            Security
                                        </button>
                                        {/* NEW: Active Learning entry */}
                                        <button
                                            onClick={() => {
                                                router.push("/active-learning")
                                                setMenuOpen(false)
                                            }}
                                            className="px-4 py-2 text-left text-purple-300 hover:bg-purple-500/10 transition-all font-medium"
                                        >
                                            Active Learning
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 text-left text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </nav>

            {/* Modals */}
            {showProfile && <ProfileModal userid={userid} onClose={() => setShowProfile(false)} />}
            {showSecurity && <SecurityModal userid={userid} onClose={() => setShowSecurity(false)} />}
        </>
    )
}
