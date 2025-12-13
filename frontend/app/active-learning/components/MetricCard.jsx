"use client"

import { motion } from "framer-motion"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

export default function MetricCard({ title, value, history = [] }) {
    const chartData = {
        labels: history.map((_, i) => i + 1),
        datasets: [
            {
                data: history,
                borderColor: "rgba(167, 139, 250, 1)",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0
            }
        ]
    }

    const chartOptions = {
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { display: false } },
        responsive: true,
        maintainAspectRatio: false
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.03 }}
            className="relative p-6 rounded-2xl bg-white/10 border border-purple-500/20 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
            {/* Glowing background */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-fuchsia-500/10 blur-2xl opacity-50 pointer-events-none"></div>

            <div className="relative z-10">
                <p className="text-sm text-gray-300 mb-1">{title}</p>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-4xl font-bold text-purple-300 drop-shadow-md"
                >
                    {value}
                </motion.h2>

                {/* Sparkline */}
                <div className="h-14 mt-4">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </motion.div>
    )
}
