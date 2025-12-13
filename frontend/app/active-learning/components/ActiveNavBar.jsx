"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function ActiveNavBar() {
    const router = useRouter()

    const links = [
        { label: "Upload", path: "/upload" },
        { label: "Aspect Analysis", path: "/visuals" },
        { label: "Active Learning", path: "/active-learning?tab=dashboard" },
        { label: "Home", path: "/" },
        { label: "Dashboard", path: "/active-learning?tab=dashboard" },
        
    ]

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-white/10 backdrop-blur-xl border-b border-purple-500/20 shadow-lg sticky top-0 z-50"
        >
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">

                {/* Logo */}
                <motion.h1
                    whileHover={{ scale: 1.06 }}
                    className="text-3xl font-bold bg-linear-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    SentimentAI
                </motion.h1>

                {/* Navigation Links */}
                <div className="flex gap-8">
                    {links.map((l, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.08, color: "#C084FC" }}
                            onClick={() => router.push(l.path)}
                            className="text-gray-300 font-medium hover:text-purple-300 transition-all"
                        >
                            {l.label}
                        </motion.button>
                    ))}
                </div>

                {/* User bubble */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-fuchsia-600 border border-purple-400 shadow-lg"
                />
            </div>
        </motion.nav>
    )
}
