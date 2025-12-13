"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminUserGrowthChart() {
    const [trend, setTrend] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/admin/users/history", {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` },
                });

                if (!res.ok) return setTrend([]);

                const payload = await res.json();
                const hist = payload.history || [];

                setTrend(
                    hist.sort((a, b) => new Date(a.date) - new Date(b.date))
                );
            } catch {
                setTrend([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <ChartBox>Loading growth data…</ChartBox>;
    if (!trend.length) return <ChartBox>No user history found.</ChartBox>;

    const maxVal = Math.max(...trend.map(t => t.count), 1);

    return (
        <ChartBox title={`User Growth (last ${trend.length} days)`}>
            <div className="relative h-48 flex items-end gap-4 overflow-visible">
                {trend.map((t, i) => {
                    const barHeight = Math.round((t.count / maxVal) * 180);

                    return (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: barHeight }}
                                transition={{ duration: 0.5, delay: i * 0.05 }}
                                className="w-8 rounded-lg bg-linear-to-t from-emerald-600 to-emerald-400 shadow-lg"
                            />
                            <div className="text-xs text-gray-300 w-12 text-center truncate">{t.date}</div>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Source: /api/admin/users/history
            </p>
        </ChartBox>
    );
}

function ChartBox({ title, children }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            {title && <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>}
            {children}
        </div>
    );
}
