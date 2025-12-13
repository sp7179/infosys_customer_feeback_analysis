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

export default function PRCurve({ curves = {} }) {
    if (!curves || Object.keys(curves).length === 0) return null

    const colors = {
        pos: "#a855f7",
        neg: "#ec4899",
        neu: "#3b82f6"
    }

    const datasets = Object.entries(curves).map(([cls, data]) => ({
        label: cls.toUpperCase(),
        data: data.recall.map((r, i) => ({ x: r, y: data.precision[i] })),
        borderColor: colors[cls] || "#fff",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
        shadowColor: colors[cls],
    }))

    const chartData = { datasets }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                labels: { color: "#ddd" }
            },
            tooltip: {
                callbacks: {
                    label: (ctx) =>
                        `P: ${ctx.parsed.y.toFixed(2)}, R: ${ctx.parsed.x.toFixed(2)}`
                }
            }
        },
        scales: {
            x: { ticks: { color: "#aaa" }, title: { display: true, text: "Recall", color: "#ccc" } },
            y: { ticks: { color: "#aaa" }, title: { display: true, text: "Precision", color: "#ccc" } }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-2xl"
        >
            <h3 className="text-xl font-semibold text-purple-300 mb-4">
                Precision–Recall Curve
            </h3>

            <Line data={chartData} options={chartOptions} />
        </motion.div>
    )
}
