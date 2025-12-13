"use client"

import { Line } from "react-chartjs-2"
import { motion } from "framer-motion"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export default function VersionTrend({ versions = [] }) {
    if (!versions || versions.length === 0) return null

    const labels = versions.map(v => v.version)
    const f1scores = versions.map(v => v.metrics?.f1 || 0)

    const data = {
        labels,
        datasets: [
            {
                label: "F1 Score",
                data: f1scores,
                borderColor: "rgba(147,51,234,1)",
                backgroundColor: "rgba(147,51,234,0.3)",
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: "#a855f7",
                tension: 0.3
            }
        ]
    }

    const options = {
        responsive: true,
        plugins: {
            legend: { labels: { color: "#ddd" } }
        },
        scales: {
            x: { ticks: { color: "#aaa" } },
            y: { ticks: { color: "#aaa" }, min: 0, max: 1 }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-2xl"
        >
            <h3 className="text-xl font-semibold text-purple-300 mb-4">
                Model Version Performance Trend
            </h3>

            <Line data={data} options={options} />

            {/* Badges */}
            <div className="flex gap-3 mt-4">
                {versions.map((v, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/20 shadow-md backdrop-blur-md"
                    >
                        {v.version}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
