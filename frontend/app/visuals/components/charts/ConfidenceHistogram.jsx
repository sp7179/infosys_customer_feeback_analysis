"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

export default function ConfidenceHistogram({ data }) {
    const [chartData, setChartData] = useState([])
    const [average, setAverage] = useState(0)
    const [median, setMedian] = useState(0)

    // ✅ Load from props or localStorage safely
    useEffect(() => {
        let confidenceData =
            data?.result?.confidence_overview ||
            data ||
            JSON.parse(localStorage.getItem("currentVisual"))?.result?.confidence_overview ||
            {}

        if (confidenceData?.histogram && confidenceData.histogram.length) {
            setChartData(confidenceData.histogram)
            setAverage(confidenceData.average || 0)
            setMedian(confidenceData.median || 0)
        }
    }, [data])

    if (!chartData.length) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-center text-purple-300">
                <h3 className="text-xl font-bold mb-2">Confidence Distribution</h3>
                <p className="text-sm text-gray-400">No confidence data available.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-linear-to-br from-purple-900/30 via-indigo-900/20 to-purple-950/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-500"
        >
            <h3 className="text-2xl font-bold text-purple-300 mb-4 text-center tracking-wide">Confidence Distribution</h3>

            <motion.div
                className="mb-6 grid grid-cols-2 gap-4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="bg-purple-500/10 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors duration-300">
                    <p className="text-gray-400 text-sm">Average Confidence</p>
                    <motion.p
                        key={average}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-purple-300 text-3xl font-extrabold"
                    >
                        {(average * 100).toFixed(1)}%
                    </motion.p>
                </div>

                <div className="bg-purple-500/10 rounded-xl p-4 text-center hover:bg-purple-500/20 transition-colors duration-300">
                    <p className="text-gray-400 text-sm">Median Confidence</p>
                    <motion.p
                        key={median}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-purple-300 text-3xl font-extrabold"
                    >
                        {(median * 100).toFixed(1)}%
                    </motion.p>
                </div>
            </motion.div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
                    <XAxis
                        dataKey="range"
                        stroke="#9ca3af"
                        angle={-30}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "1px solid #4b5563",
                            borderRadius: "0.5rem",
                        }}
                        labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#colorGradient)"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#c084fc" stopOpacity={0.9} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
