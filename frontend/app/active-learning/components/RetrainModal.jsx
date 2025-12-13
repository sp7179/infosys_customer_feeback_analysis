"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function RetrainModal({ jobId, onClose }) {
    const [status, setStatus] = useState(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!jobId) return
        const interval = setInterval(async () => {
            const res = await fetch(`/api/active-learning/status/${jobId}`)
            const data = await res.json()

            setStatus(data.status)
            setProgress(data.progress)

            if (data.status === "done" || data.status === "failed") {
                clearInterval(interval)
                setTimeout(() => onClose(), 1300)
            }
        }, 800)

        return () => clearInterval(interval)
    }, [jobId])

    if (!jobId) return null

    const pct = progress
    const color = pct < 50 ? "#f97316" : pct < 80 ? "#a855f7" : "#10b981"

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="p-10 rounded-3xl bg-white/10 border border-purple-500/20 shadow-2xl backdrop-blur-xl w-[380px] text-center"
            >
                <h2 className="text-xl font-semibold text-purple-300 mb-6">
                    Retraining Model
                </h2>

                <div className="relative mx-auto w-40 h-40">
                    {/* Background circle */}
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                            fill="none"
                        />

                        {/* Progress circle */}
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke={color}
                            strokeWidth="12"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="440"
                            strokeDashoffset={440 - (440 * pct) / 100}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            style={{
                                filter: `drop-shadow(0 0 10px ${color})`
                            }}
                        />
                    </svg>

                    {/* Value */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <p style={{ color }} className="text-3xl font-bold">
                            {pct}%
                        </p>
                    </motion.div>
                </div>

                <p className="mt-4 text-gray-300 text-sm tracking-wide">
                    {status === "running" && "Training in progress..."}
                    {status === "queued" && "Queued... waiting for worker"}
                    {status === "done" && (
                        <span className="text-green-400 font-semibold">
                            Completed!
                        </span>
                    )}
                    {status === "failed" && (
                        <span className="text-red-400 font-semibold">
                            Failed!
                        </span>
                    )}
                </p>

                <button
                    onClick={() => onClose()}
                    className="mt-6 px-6 py-2 rounded-xl bg-white/10 border border-purple-500/30 hover:bg-purple-500/10 transition text-purple-200 font-medium"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    )
}
