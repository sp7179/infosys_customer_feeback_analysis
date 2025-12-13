"use client"

import { motion } from "framer-motion"
import MetricCard from "./MetricCard"

export default function PerformanceCharts({ metrics }) {
    if (!metrics || !metrics.metrics) return null

    const m = metrics.metrics

    // Prepare small history array for sparkline placeholders
    const fakeHistory = [
        m.f1 - 0.03,
        m.f1 - 0.01,
        m.f1 - 0.02,
        m.f1,
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="p-6 rounded-3xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-2xl space-y-8"
        >
            <h3 className="text-2xl font-bold text-purple-300 mb-6">
                Overall Model Performance
            </h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Accuracy" value={m.accuracy.toFixed(3)} history={fakeHistory} />
                <MetricCard title="F1 Score" value={m.f1.toFixed(3)} history={fakeHistory} />
                <MetricCard title="Precision" value={m.precision.toFixed(3)} history={fakeHistory} />
                <MetricCard title="Recall" value={m.recall.toFixed(3)} history={fakeHistory} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="mt-6 text-gray-300 text-sm"
            >
                Trained on <span className="text-purple-300 font-semibold">{metrics.n_samples}</span> samples.
            </motion.div>
        </motion.div>
    )
}
