"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function SentimentChart({ data }) {
    const chartData = [
        { name: "Positive", value: data.pos || 0, color: "#10b981" },
        { name: "Neutral", value: data.neu || 0, color: "#6b7280" },
        { name: "Negative", value: data.neg || 0, color: "#ef4444" },
    ];

    return (
        <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-purple-300 mb-4">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} reviews`} />
                </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-green-400 text-2xl font-bold">{data.pos}</p>
                    <p className="text-green-300 text-sm mt-1">Positive ({data.pos_percent.toFixed(1)}%)</p>
                </div>
                <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-2xl font-bold">{data.neu}</p>
                    <p className="text-gray-300 text-sm mt-1">Neutral ({data.neu_percent.toFixed(1)}%)</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-red-400 text-2xl font-bold">{data.neg}</p>
                    <p className="text-red-300 text-sm mt-1">Negative ({data.neg_percent.toFixed(1)}%)</p>
                </div>
            </div>
        </div>
    )
}
