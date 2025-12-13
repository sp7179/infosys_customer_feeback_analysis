"use client"

import { motion } from "framer-motion"

export default function ConfidenceHistogram({ bins = [], counts = [], pctBelow = 0 }) {
    if (!bins.length || !counts.length) return null

    const maxCount = Math.max(...counts)

    return (
        <motion.div
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <h3 className="text-xl font-semibold text-purple-300 mb-6">
                Confidence Distribution
            </h3>

            <div className="relative flex items-end gap-2 h-48 mt-4">
                {/* Bars */}
                {counts.map((c, i) => {
                    const height = (c / maxCount) * 100

                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className="flex-1 rounded-md bg-linear-to-t from-purple-600/40 to-purple-400/70 shadow-lg hover:shadow-purple-500/50 relative group"
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/70 text-xs opacity-0 group-hover:opacity-100 transition">
                                {c} items
                            </div>
                        </motion.div>
                    )
                })}

                {/* 0.5 threshold line */}
                <div className="absolute left-1/2 h-full w-0.5 bg-fuchsia-400/60 shadow-md"></div>
                <p className="absolute left-1/2 -bottom-6 -translate-x-1/2 text-xs text-fuchsia-300">
                    0.5 threshold
                </p>
            </div>

            <p className="text-gray-300 mt-6 text-sm">
                <span className="text-fuchsia-400 font-semibold">{Math.round(pctBelow * 100)}%</span>
                {' '}predictions below confidence 0.5
            </p>
        </motion.div>
    )
}
