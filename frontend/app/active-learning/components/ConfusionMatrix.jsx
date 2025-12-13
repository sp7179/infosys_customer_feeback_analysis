"use client"

import { motion } from "framer-motion"
import React from "react"

export default function ConfusionMatrix({ labels = [], matrix = [] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-2xl"
        >
            <h3 className="text-xl font-semibold text-purple-300 mb-6">
                Confusion Matrix
            </h3>

            <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-2">
                {/* Top Labels */}
                <div></div>
                {labels.map((l, i) => (
                    <div
                        key={i}
                        className="text-center text-gray-300 font-medium"
                    >
                        Pred {l}
                    </div>
                ))}

                {/* Rows */}
                {matrix.map((row, i) => (
                    <React.Fragment key={`row-${i}`}>
                        <div className="text-gray-300 font-medium">
                            Actual {labels[i]}
                        </div>

                        {row.map((val, j) => (
                            <motion.div
                                key={`cell-${i}-${j}`}
                                whileHover={{ scale: 1.1 }}
                                className="p-4 text-center rounded-xl text-white font-semibold"
                                style={{
                                    background: `rgba(168, 85, 247, ${0.15 + (val / 50) * 0.6})`,
                                    boxShadow: val > 5 ? "0 0 20px rgba(168,85,247,0.4)" : ""
                                }}
                            >
                                {val}
                            </motion.div>
                        ))}
                    </React.Fragment>
                ))}

            </div>
        </motion.div>
    )
}
