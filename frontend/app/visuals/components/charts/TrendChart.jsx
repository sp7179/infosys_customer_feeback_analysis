"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

export default function TrendChart({ data }) {
    const [chartData, setChartData] = useState([])

    // ✅ Load from props or localStorage safely
    useEffect(() => {
        let trendData =
            data?.result?.trend_over_time ||
            data ||
            JSON.parse(localStorage.getItem("currentVisual"))?.result?.trend_over_time ||
            []

        if (Array.isArray(trendData) && trendData.length) {
            setChartData(trendData)
        }
    }, [data])

    if (!chartData.length) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-center text-purple-300">
                <h3 className="text-xl font-bold mb-2">Sentiment Trends Over Time</h3>
                <p className="text-sm text-gray-400">No trend data available.</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="bg-linear-to-br from-purple-900/30 via-indigo-900/20 to-purple-950/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-500"
        >
            <h3 className="text-2xl font-bold text-purple-300 mb-6 text-center tracking-wide">
                Sentiment Trends Over Time
            </h3>

            <ResponsiveContainer width="100%" height={380}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" opacity={0.3} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        angle={-20}
                        textAnchor="end"
                        height={60}
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
                    <Legend />

                    {/* Glowing animated sentiment lines */}
                    <Line
                        type="monotone"
                        dataKey="pos"
                        name="Positive"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, stroke: "#10b981", fill: "#10b981" }}
                        activeDot={{ r: 6, stroke: "#34d399", fill: "#10b981" }}
                        animationDuration={1200}
                    />
                    <Line
                        type="monotone"
                        dataKey="neu"
                        name="Neutral"
                        stroke="#6b7280"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, stroke: "#6b7280", fill: "#6b7280" }}
                        activeDot={{ r: 6, stroke: "#9ca3af", fill: "#6b7280" }}
                        animationDuration={1300}
                    />
                    <Line
                        type="monotone"
                        dataKey="neg"
                        name="Negative"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, stroke: "#ef4444", fill: "#ef4444" }}
                        activeDot={{ r: 6, stroke: "#f87171", fill: "#ef4444" }}
                        animationDuration={1400}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    )
}
