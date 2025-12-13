"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import RenameModal from "./RenameModal"
import { useEffect } from "react"

export default function VisualSidebar({ visuals, selectedVisual, onSelectVisual, onRefresh }) {
    const router = useRouter()
    const [renameModal, setRenameModal] = useState(null)

    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = JSON.parse(localStorage.getItem("currentVisual") || "{}");
            setActiveId(stored?._id);
        }
    }, []);


    const handleRename = async (visualId, newName) => {
        try {
            await fetch(`/api/visuals/rename/${visualId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ name: newName }),
            })
            onRefresh()
            setRenameModal(null)
        } catch (err) {
            console.error("Failed to rename:", err)
        }
    }

    const handleDelete = async (visualId) => {
        if (!confirm("Are you sure you want to delete this visualization?")) return
        try {
            await fetch(`/api/visuals/delete/${visualId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            })
            onRefresh()
        } catch (err) {
            console.error("Failed to delete:", err)
        }
    }

    return (
        <motion.div
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-72 bg-linear-to-b from-[#0a0015]/90 via-[#1b0036]/80 to-[#32005a]/70 backdrop-blur-2xl 
                       border-r border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.25)] flex flex-col relative overflow-hidden"
        >
            {/* subtle animated gradient lines */}
            <motion.div
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,215,0,0.1)_0%,rgba(168,85,247,0.1)_50%,rgba(255,105,180,0.1)_100%)] bg-size-[200%_200%] pointer-events-none"
            />

            {/* --- Header --- */}
            <div className="p-4 border-b border-purple-500/20 relative z-10">
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168,85,247,0.5)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => router.push("/upload")}
                    className="w-full py-2 bg-linear-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg 
                               hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Visual
                </motion.button>
            </div>

            {/* --- Visuals List --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative z-10">
                <AnimatePresence>
                    {visuals.length === 0 ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-500 text-sm text-center py-8"
                        >
                            No visualizations yet
                        </motion.p>
                    ) : (
                        visuals.map((visual, index) => {
                            const isActive = visual._id === activeId || visual.id === activeId;

                            return (
                                <motion.div
                                    key={visual._id || visual.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                        onSelectVisual(visual)
                                        localStorage.setItem("currentVisual", JSON.stringify(visual))
                                        setActiveId(visual._id || visual.id);
                                    }}
                                    className={`p-3 rounded-xl cursor-pointer border transition-all duration-500 relative overflow-hidden 
                                        ${isActive
                                        ? "bg-linear-to-r from-purple-500/40 via-violet-600/30 to-fuchsia-500/40 border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.8)] scale-[1.03]"

                                            : "bg-white/5 border-purple-500/10 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                                        }`}
                                >
                                    {/* animated glow behind active visual */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeGlow"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.6, scale: [1, 1.03, 1] }}
                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.25)_0%,transparent_70%)] blur-xl rounded-xl pointer-events-none"

                                        />
                                    )}

                                    <div className="flex items-start justify-between gap-2 relative z-10">
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-semibold truncate 
                                                ${isActive ? "text-yellow-300 drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" : "text-purple-200"}
                                            `}>
                                                {visual.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(visual.created_at).toLocaleString("en-IN", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        {/* --- Action Buttons --- */}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setRenameModal(visual._id || visual.id)
                                                }}
                                                className="p-1 hover:bg-purple-500/20 rounded transition-colors"
                                                title="Rename"
                                            >
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDelete(visual._id || visual.id)
                                                }}
                                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* animated “ACTIVE” tag */}
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="absolute top-1 right-2 text-[10px] font-bold text-yellow-300 uppercase tracking-widest"
                                        >
                                            ACTIVE
                                        </motion.span>
                                    )}
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* --- Rename Modal --- */}
            {renameModal && (
                <RenameModal
                    visualId={renameModal}
                    currentName={visuals.find((v) => v._id === renameModal || v.id === renameModal)?.name}
                    onRename={handleRename}
                    onClose={() => setRenameModal(null)}
                />
            )}
        </motion.div>
    )
}
