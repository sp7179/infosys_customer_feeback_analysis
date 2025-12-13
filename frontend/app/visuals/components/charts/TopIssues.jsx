"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

export default function TopIssues({ data }) {
    if (!data || data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-gray-400 flex items-center justify-center gap-2"
            >
                <AlertTriangle className="w-5 h-5 text-purple-400" />
                No top issues found.
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-lg"
        >
            <h3 className="text-2xl font-bold text-purple-300 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-purple-400" />
                🔥 Top Issues
            </h3>

            <div className="space-y-4">
                {data.slice(0, 5).map((issue, idx) => {
                    // percent display: prefer percent field, fallback to count heuristics
                    const percent = (issue.percent !== undefined && Number(issue.percent)) ? Number(issue.percent) : (issue.count ? Math.min(100, (issue.count * 2)) : 0)
                    const label = issue.label || issue.keyword || issue.issue || "Unknown"
                    const example = issue.example || ""
                    const severity = issue.severity ?? Math.round(percent)
                    const impact = issue.impact ?? Math.round(percent * 1.2)

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                            className="flex items-center justify-between p-4 bg-purple-500/5 rounded-xl shadow-sm border border-purple-500/20 hover:scale-[1.01] hover:bg-purple-500/10 transition-transform duration-200"
                        >
                            <div className="flex flex-col w-full mr-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-200 font-semibold text-sm">{label}</span>
                                    <div className="text-xs text-gray-400">({issue.count ?? ""})</div>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.9, type: "spring", stiffness: 120 }}
                                        className="h-full bg-linear-to-r from-red-500 via-pink-500 to-orange-400 shadow-md"
                                    />
                                </div>

                                {/* keywords & example */}
                                <div className="mt-2 text-xs text-gray-300 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {Array.isArray(issue.keywords) && issue.keywords.slice(0, 3).map((k, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-gray-200">{k}</span>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-400">Severity: <span className="font-semibold">{severity}%</span></div>
                                </div>

                                {example && (
                                    <div className="mt-2 text-xs text-gray-400 italic">
                                        "{example}"
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end min-w-[72px]">
                                <motion.span
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: idx * 0.12 }}
                                    className="text-purple-400 font-bold text-lg"
                                >
                                    {percent.toFixed(1)}%
                                </motion.span>

                                <div className="text-xs text-gray-400 mt-1">
                                    Impact: <span className="font-semibold text-orange-300">{impact}</span>
                                </div>

                                {/* mini sparkline using trend if available */}
                                {issue.trend && Array.isArray(issue.trend) && (
                                    <div className="mt-2 w-20 h-6 flex items-center justify-center">
                                        <svg viewBox="0 0 40 12" className="w-full h-full">
                                            <polyline
                                                fill="none"
                                                stroke="#a78bfa"
                                                strokeWidth="1.5"
                                                points={issue.trend.map((v, i) => `${(i * (40 / (issue.trend.length - 1))).toFixed(2)},${12 - (Math.min(10, v) / Math.max(1, issue.trend.reduce((a, b) => Math.max(a, b), 0)) * 10).toFixed(2)}`).join(" ")}
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </motion.div>
    )
}
