"use client";

import React from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    LineChart,
    Line,
} from "recharts";

export default function AspectSentiment({ data }) {
    // data might either be the object mapping or wrapped as data.result.aspect_sentiment
    const aspectData = data?.result?.aspect_sentiment || data || {};
    const entries = Object.entries(aspectData);

    if (!entries.length) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-center text-purple-300">
                <h3 className="text-xl font-bold mb-2">Aspect-Based Sentiment</h3>
                <p className="text-sm text-gray-400">No aspect sentiment data available.</p>
            </div>
        );
    }

    // Colors: positive, neutral, negative
    const COLORS = ["#10b981", "#6b7280", "#ef4444"];

    return (
        <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">
                Aspect-Based Sentiment (16 Categories)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {entries.map(([aspectKey, stats], idx) => {
                    const name = aspectKey.replace(/_/g, " ").toUpperCase();
                    const pos = stats.pos || 0;
                    const neu = stats.neu || 0;
                    const neg = stats.neg || 0;
                    const confidence = typeof stats.confidence !== "undefined" ? stats.confidence : 0;
                    const severity = typeof stats.severity_score !== "undefined" ? stats.severity_score : Math.round((neg / Math.max(1, pos + neu + neg)) * 100);

                    // Pie data
                    const pieData = [
                        { name: "Positive", value: pos },
                        { name: "Neutral", value: neu },
                        { name: "Negative", value: neg },
                    ];

                    // Trend: if backend supplied an aspect-level trend array (e.g. last 7) use it; else derive small fake trend
                    const trend = stats.trend || (stats._trend_counts ? stats._trend_counts : null);
                    // create small trend points if not present (fallback simple)
                    const trendData = trend
                        ? trend.map((v, i) => ({ x: i, y: typeof v === "object" ? v.total || (v.pos || 0) - (v.neg || 0) : v }))
                        : [{ x: 0, y: pos }, { x: 1, y: pos - neg }, { x: 2, y: pos }];

                    return (
                        <div
                            key={aspectKey}
                            className="p-3 bg-white/6 rounded-xl border border-purple-500/10 shadow-sm hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-md font-semibold text-purple-100">{name}</h4>
                                <div className="text-xs text-gray-300">conf: <span className="font-semibold">{Math.round(confidence * 100)}%</span></div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Donut */}
                                <div className="w-24 h-24 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                innerRadius="60%"
                                                outerRadius="80%"
                                                paddingAngle={4}
                                            >
                                                {pieData.map((entry, i) => (
                                                    <Cell key={i} fill={COLORS[i]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Right summary: stacked bar + stats */}
                                <div className="flex-1">
                                    <div className="text-sm text-gray-300 mb-2 flex items-center justify-between">
                                        <div>Pos: <span className="font-semibold text-green-400">{pos}</span></div>
                                        <div>Neu: <span className="font-semibold text-gray-400">{neu}</span></div>
                                        <div>Neg: <span className="font-semibold text-red-400">{neg}</span></div>
                                    </div>

                                    <div style={{ height: 40 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[{ name, positive: pos, neutral: neu, negative: neg }]}>
                                                <XAxis dataKey="name" hide />
                                                <Tooltip />
                                                <Bar dataKey="positive" stackId="a" fill={COLORS[0]} />
                                                <Bar dataKey="neutral" stackId="a" fill={COLORS[1]} />
                                                <Bar dataKey="negative" stackId="a" fill={COLORS[2]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Severity strip */}
                                    <div className="mt-2">
                                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-2 rounded-full"
                                                style={{
                                                    width: `${severity}%`,
                                                    background: severity > 66 ? "linear-gradient(90deg,#ef4444,#f97316)" : severity > 33 ? "linear-gradient(90deg,#f59e0b,#f97316)" : "linear-gradient(90deg,#10b981,#60a5fa)",
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Severity: <span className="font-semibold">{severity}%</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* mini-sparkline */}
                            <div className="mt-3 h-14">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <Line type="monotone" dataKey="y" stroke="#a78bfa" strokeWidth={2} dot={false} />
                                        <Tooltip />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
