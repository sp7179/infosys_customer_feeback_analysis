"use client"

import { motion } from "framer-motion"

export default function ClassPercents({ probs = {} }) {
    if (!probs || Object.keys(probs).length === 0) return null

    const colors = {
        pos: "from-green-400 to-emerald-500",
        neg: "from-red-400 to-pink-500",
        neu: "from-blue-400 to-violet-500",
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-xl"
        >
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
                Sentiment Distribution
            </h3>

            <div className="space-y-5">
                {Object.entries(probs).map(([label, value], idx) => {
                    const pct = Math.round(value * 100)

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="flex justify-between mb-1">
                                <span className="capitalize text-gray-300">{label}</span>
                                <span className="text-purple-300 font-semibold">{pct}%</span>
                            </div>

                            <div className="w-full h-4 bg-black/20 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`h-full bg-linear-to-r ${colors[label]} shadow-lg`}
                                    style={{
                                        filter: `drop-shadow(0 0 8px rgba(168,85,247,0.4))`
                                    }}
                                />
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
