"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function KeywordCloud({ data }) {
    const [wordData, setWordData] = useState({ positive: [], negative: [] })

    // ✅ Fetch safely from props or localStorage
    useEffect(() => {
        let cloudData =
            data?.result?.wordcloud_data ||
            data ||
            JSON.parse(localStorage.getItem("currentVisual"))?.result?.wordcloud_data ||
            {}

        setWordData({
            positive: cloudData.positive || [],
            negative: cloudData.negative || [],
        })
    }, [data])

    const allWords = [...wordData.positive, ...wordData.negative]
    const maxCount = Math.max(...allWords.map((w) => w.count || 0), 1)

    if (!allWords.length) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-center text-purple-300">
                <h3 className="text-xl font-bold mb-2">Keyword Cloud</h3>
                <p className="text-sm text-gray-400">No keyword data available.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* 🌿 Positive Keywords */}
            <motion.div
                className="bg-linear-to-br from-green-900/20 via-emerald-900/10 to-green-950/20 backdrop-blur-xl border border-green-400/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:shadow-[0_0_40px_rgba(16,185,129,0.25)] transition-all duration-500"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-2xl font-bold text-green-300 mb-4 text-center tracking-wide">Positive Keywords</h3>
                <motion.div
                    layout
                    className="flex flex-wrap justify-center gap-3"
                    transition={{ staggerChildren: 0.03 }}
                >
                    {wordData.positive.map((word, idx) => (
                        <motion.span
                            key={`pos-${idx}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.02 }}
                            whileHover={{
                                scale: 1.2,
                                textShadow: "0 0 10px rgba(16,185,129,0.6)",
                            }}
                            className="px-4 py-2 bg-green-500/10 text-green-300 rounded-full font-medium border border-green-500/30 cursor-default select-none"
                            style={{
                                fontSize: `${0.9 + (word.count / maxCount) * 0.8}rem`,
                            }}
                        >
                            {word.word} <span className="opacity-60">({word.count})</span>
                        </motion.span>
                    ))}
                </motion.div>
            </motion.div>

            {/* 🔥 Negative Keywords */}
            <motion.div
                className="bg-linear-to-br from-red-900/20 via-rose-900/10 to-red-950/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:shadow-[0_0_40px_rgba(239,68,68,0.25)] transition-all duration-500"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h3 className="text-2xl font-bold text-red-300 mb-4 text-center tracking-wide">Negative Keywords</h3>
                <motion.div
                    layout
                    className="flex flex-wrap justify-center gap-3"
                    transition={{ staggerChildren: 0.03 }}
                >
                    {wordData.negative.map((word, idx) => (
                        <motion.span
                            key={`neg-${idx}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.02 }}
                            whileHover={{
                                scale: 1.2,
                                textShadow: "0 0 10px rgba(239,68,68,0.6)",
                            }}
                            className="px-4 py-2 bg-red-500/10 text-red-300 rounded-full font-medium border border-red-500/30 cursor-default select-none"
                            style={{
                                fontSize: `${0.9 + (word.count / maxCount) * 0.8}rem`,
                            }}
                        >
                            {word.word} <span className="opacity-60">({word.count})</span>
                        </motion.span>
                    ))}
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
