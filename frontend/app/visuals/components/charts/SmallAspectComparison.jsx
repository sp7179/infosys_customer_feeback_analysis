"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function SmallAspectComparison({ data = {} }) {
    if (!data || Object.keys(data).length === 0) {
        return null;
    }

    // Convert object → array
    const aspects = Object.keys(data).map((key) => ({
        aspect: key.replace(/_/g, " "),
        pos: data[key].pos,
        neg: data[key].neg,
        neu: data[key].neu,
        severity: data[key].severity_score,
    }));

    // Sort by severity (descending) → show top 5 only
    const topAspects = aspects
        .sort((a, b) => b.severity - a.severity)
        .slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-purple-500/20 shadow-lg"
        >
            <h3 className="text-lg font-semibold text-purple-300 mb-3">
                🔍 Top 5 Aspects (Severity)
            </h3>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topAspects} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="aspect"
                            type="category"
                            width={90}
                            tick={{ fill: "#ddd", fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "rgba(20,20,40,0.9)",
                                border: "1px solid #8b5cf6",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />

                        <Bar
                            dataKey="severity"
                            fill="url(#aspectGradient)"
                            barSize={12}
                            radius={[6, 6, 6, 6]}
                            animationDuration={900}
                        />

                        <defs>
                            <linearGradient id="aspectGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
