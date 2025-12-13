"use client"

import React from "react"
import { motion } from "framer-motion"

/**
 * SuggestionsVisual.jsx
 * - Apple-style / Dashboard suggestion cards
 * - Shows: suggestion text, root cause, action steps, impact gauge, AI-weight bar, priority badge
 * - Props:
 *    data: Array of suggestion objects (see backend shape)
 *    impactScore: global impact (number)
 */

export default function SuggestionsVisual({ data = [], impactScore = 0 }) {
    const suggestions = Array.isArray(data) && data.length > 0
        ? data
        : [{
            aspect: "general",
            suggestion: "Maintain current performance.",
            priority: "low",
            weight_percent: 0,
            root_cause: "No major issues detected.",
            action_steps: [],
            impact_gain: 5,
            ai_weight: 0
        }]

    const priorityStyles = {
        high: "bg-gradient-to-r from-red-500 to-orange-400 text-white",
        medium: "bg-yellow-400 text-black",
        low: "bg-gray-700 text-white",
    }

    const ImpactGauge = ({ value = 0, size = 64 }) => {
        const pct = Math.max(0, Math.min(100, value))
        const stroke = 8
        const r = (size - stroke) / 2
        const c = 2 * Math.PI * r
        const dash = (pct / 100) * c
        return (
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="inline-block">
                <defs>
                    <linearGradient id="g1" x1="0%" x2="100%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
                <g transform={`translate(${size / 2},${size / 2})`}>
                    <circle r={r} fill="none" stroke="#0f1724" strokeWidth={stroke} />
                    <circle
                        r={r}
                        fill="none"
                        stroke="url(#g1)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${c - dash}`}
                        transform={`rotate(-90)`}
                    />
                    <text x="0" y="4" textAnchor="middle" fontSize="12" fill="white" fontWeight={700}>
                        {Math.round(pct)}%
                    </text>
                </g>
            </svg>
        )
    }

    const AiWeightBar = ({ value = 0 }) => {
        const pct = Math.max(0, Math.min(100, value))
        const bg = pct > 66 ? "bg-green-400" : pct > 33 ? "bg-yellow-400" : "bg-red-400"
        return (
            <div className="w-32 h-2 bg-white/6 rounded overflow-hidden">
                <div style={{ width: `${pct}%` }} className={`${bg} h-full`} />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45 }}
            className="w-full"
        >
            <div className="rounded-2xl p-6 bg-linear-to-br from-white/5 to-white/3 border border-white/6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-extrabold tracking-tight">Top Suggestions</h3>
                        <p className="text-sm text-gray-300">Actionable, prioritized recommendations with root causes and steps.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-300 text-right">
                            <div className="text-[10px] uppercase text-gray-400">Global impact</div>
                            <div className="text-lg font-bold text-white">{Math.round(impactScore)}%</div>
                        </div>
                        <ImpactGauge value={impactScore} size={66} />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {suggestions.map((sugg, idx) => (
                        <motion.div
                            key={`${sugg.aspect}-${idx}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 rounded-2xl bg-linear-to-b from-[#081026]/70 to-[#071025]/50 border border-white/6 shadow-md flex gap-4"
                        >
                            <div className="shrink-0 flex flex-col items-center justify-center">
                                <ImpactGauge value={sugg.impact_gain || 0} size={64} />
                                <div className="mt-2 text-xs text-gray-400">Impact</div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-md bg-white/6 text-xs font-semibold uppercase tracking-wide text-gray-200">
                                                {sugg.aspect}
                                            </span>

                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyles[sugg.priority] || priorityStyles.medium}`}>
                                                {sugg.priority}
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-200">{sugg.suggestion}</p>

                                        {sugg.root_cause && (
                                            <p className="mt-2 text-xs text-gray-400 italic">Root cause: {sugg.root_cause}</p>
                                        )}

                                        {Array.isArray(sugg.action_steps) && sugg.action_steps.length > 0 && (
                                            <ul className="mt-2 text-xs text-gray-300 list-disc ml-4">
                                                {sugg.action_steps.slice(0, 3).map((st, i) => (
                                                    <li key={i}>{st}</li>
                                                ))}
                                            </ul>
                                        )}

                                        {sugg.example && (
                                            <div className="mt-2 text-xs text-gray-400 italic">Sample: “{sugg.example}”</div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <div className="text-xs text-gray-400">AI weight</div>
                                        <AiWeightBar value={sugg.ai_weight || 0} />
                                        <div className="mt-3 text-xs text-gray-400">Confidence</div>
                                        <div className="w-28 h-2 rounded-full bg-white/6 overflow-hidden mt-1">
                                            <div style={{ width: `${sugg.weight_percent || 0}%` }} className="h-full bg-linear-to-r from-[#7c3aed] to-[#ec4899]" />
                                        </div>

                                        <button className="mt-4 px-3 py-1 rounded-md bg-white/6 text-sm font-semibold hover:bg-white/8">View details</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}
