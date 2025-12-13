"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ConfidenceGauge from "./ConfidenceGauge"
import ClassPercents from "./ClassPercents"

export default function FeedbackFlow({ onOpenDashboard }) {
    const [text, setText] = useState("")
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    async function analyze() {
        if (!text.trim()) return
        setLoading(true)
        try {
            const res = await fetch("/api/active-learning/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            })
            const raw = await res.json()

            // Normalizer (safe)
            const probs = raw.probabilities || raw.probs || raw.predictions || {}
            const normalizedProbs = Object.fromEntries(
                Object.entries(probs).map(([k, v]) => [k, Number(v) > 1 ? Number(v) / 100 : Number(v) || 0])
            )
            const label = raw.label || raw.predicted || Object.keys(normalizedProbs).sort((a, b) => normalizedProbs[b] - normalizedProbs[a])[0] || "unknown"
            let confidence = (raw.confidence !== undefined) ? (raw.confidence > 1 ? raw.confidence / 100 : raw.confidence) : Math.max(...Object.values(normalizedProbs), 0)

            setResult({
                label,
                probabilities: normalizedProbs,
                confidence: Math.min(Math.max(Number(confidence) || 0, 0), 1)
            })
        } catch (e) {
            console.error("Analyze error", e)
            alert("Analysis failed — check console")
        } finally {
            setLoading(false)
        }
    }

    function resetForAnother() {
        setText("")
        setResult(null)
        setLoading(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-white/6 border border-purple-500/20 backdrop-blur-xl shadow-lg space-y-6"
        >
            <h3 className="text-xl font-semibold text-purple-300">Enter Feedback</h3>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type review / feedback..."
                className="w-full p-4 h-32 rounded-xl bg-black/20 border border-purple-500/20 text-gray-200 placeholder-gray-500 outline-none"
            />

            <div className="flex gap-3">
                <button
                    onClick={analyze}
                    className="flex-1 py-2 rounded-xl bg-linear-to-r from-purple-500 to-fuchsia-600 text-white font-semibold"
                >
                    {loading ? "Analyzing..." : "Analyze"}
                </button>

                <button
                    onClick={() => { if (onOpenDashboard) onOpenDashboard() }}
                    className="py-2 px-4 rounded-xl border border-purple-500/30 text-purple-200"
                >
                    Open Retrain Dashboard
                </button>
            </div>

            {/* Result area */}
            {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="pt-4">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <ConfidenceGauge value={result.confidence} />
                        <div className="flex-1">
                            <p className="text-gray-300 mb-2">Prediction: <span className="font-bold text-purple-300 capitalize">{result.label}</span></p>
                            <ClassPercents probs={result.probabilities} />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button onClick={resetForAnother} className="py-2 px-4 rounded-xl bg-white/5 text-white">Upload another feedback</button>
                        <button onClick={() => { /* optional: send feedback to backend */ }} className="py-2 px-4 rounded-xl border border-purple-500/30 text-purple-200">Save / Send</button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
