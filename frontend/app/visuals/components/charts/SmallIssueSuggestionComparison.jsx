"use client";

import { motion } from "framer-motion";
import {
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    Tooltip,
    Legend,
} from "recharts";

/**
 * Props:
 *  - issues: [{ keyword, impact, count, percent }]
 *  - suggestions: [{ aspect, priority, impact_gain }]
 *
 * Visual idea:
 *  - X axis = issue impact (or percent)
 *  - Y axis = frequency/count
 *  - Bubble size = suggestion priority (high->big)
 *  - Bubble color = priority (high:red, medium:amber, low:green)
 */

const PRIORITY_TO_SIZE = { high: 180, medium: 110, low: 60 };
const PRIORITY_TO_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

function _mapItems(issues = [], suggestions = []) {
    return (issues || []).slice(0, 6).map((iss, idx) => {
        const keyword = iss.keyword || iss.aspect || `issue-${idx}`;
        const sug = (suggestions || []).find((s) =>
            (s.aspect || "").toLowerCase() === (keyword || "").toLowerCase()
        );
        const priority = sug ? (sug.priority || "low") : "low";
        const impact = iss.impact ?? iss.percent ?? 0;
        const count = iss.count ?? 1;
        return {
            keyword,
            impact: Number(impact),
            count: Number(count),
            priority,
            size: PRIORITY_TO_SIZE[priority] || 60,
            color: PRIORITY_TO_COLOR[priority] || "#60a5fa",
        };
    });
}

export default function SmallIssueSuggestionComparison({ issues = [], suggestions = [] }) {
    const points = _mapItems(issues, suggestions);

    if (!points.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="p-4 rounded-xl bg-white/6 backdrop-blur-md border border-purple-500/15"
            >
                <div className="text-sm font-semibold text-gray-200">Issues · Suggestions</div>
                <div className="text-xs text-gray-400 mt-2">No issue/suggestion data available</div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="p-4 rounded-xl bg-white/6 backdrop-blur-md border border-purple-500/15 shadow-sm"
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="text-sm font-semibold text-gray-100">Top issues · Suggestions</div>
                    <div className="text-xs text-gray-400 mt-0.5">impact · frequency · priority</div>
                </div>
                <div className="text-xs text-gray-300">Top {points.length}</div>
            </div>

            <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 6, right: 8, bottom: 6, left: 6 }}>
                        <XAxis
                            dataKey="impact"
                            name="impact"
                            type="number"
                            domain={["auto", "auto"]}
                            tick={{ fill: "#cbd5e1", fontSize: 11 }}
                        />
                        <YAxis
                            dataKey="count"
                            name="count"
                            type="number"
                            domain={[0, "auto"]}
                            tick={{ fill: "#cbd5e1", fontSize: 11 }}
                        />
                        <ZAxis dataKey="size" range={[60, 200]} />
                        <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            contentStyle={{ background: "rgba(6,8,23,0.95)", border: "1px solid rgba(124,58,237,0.12)" }}
                            formatter={(value, name, props) => {
                                if (name === "size") {
                                    return [props.payload.priority, "Priority"];
                                }
                                if (name === "impact") {
                                    return [`${value}`, "Impact"];
                                }
                                if (name === "count") {
                                    return [`${value}`, "Count"];
                                }
                                return [value, name];
                            }}
                            labelFormatter={() => ""}
                        />

                        {/* render bubbles grouped by priority color */}
                        {["high", "medium", "low"].map((p) => {
                            const d = points.filter((pt) => pt.priority === p);
                            if (!d.length) return null;
                            return (
                                <Scatter
                                    key={p}
                                    name={p}
                                    data={d}
                                    fill={PRIORITY_TO_COLOR[p]}
                                />
                            );
                        })}
                        <Legend
                            wrapperStyle={{ color: "#cbd5e1", fontSize: 11 }}
                            payload={[
                                { value: "High priority", type: "circle", color: PRIORITY_TO_COLOR.high },
                                { value: "Medium priority", type: "circle", color: PRIORITY_TO_COLOR.medium },
                                { value: "Low priority", type: "circle", color: PRIORITY_TO_COLOR.low },
                            ]}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-3 text-xs text-gray-300 space-y-1">
                {points.map((p) => (
                    <div key={p.keyword} className="flex justify-between">
                        <div className="truncate max-w-[60%]">{p.keyword}</div>
                        <div className="flex items-center gap-3 text-right">
                            <div className="text-[12px] px-2 py-0.5 rounded-md" style={{ background: `${p.color}22` }}>
                                <span style={{ color: p.color }} className="font-medium">{p.priority}</span>
                            </div>
                            <div className="text-gray-400">{p.impact}%</div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
