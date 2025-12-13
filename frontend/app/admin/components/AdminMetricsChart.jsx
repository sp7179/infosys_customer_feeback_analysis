"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";


export default function AdminMetricsChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch("/api/admin/models/history", {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` },
                });

                if (!res.ok) return setData([]);

                const payload = await res.json();
                const hist = payload.history || [];

                setData(
                    hist.sort((a, b) => a.version.localeCompare(b.version))
                );
            } catch {
                setData([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <ChartBox>Loading chart…</ChartBox>;
    if (!data.length) return <ChartBox>No model metrics available.</ChartBox>;

    const maxAcc = Math.max(...data.map(d => d.accuracy), 1);

    return (
        <ChartBox title="Model Accuracy (latest)">
            <div className="relative h-48 flex items-end gap-4 overflow-visible">

                {data.map((d, i) => {
                    const barHeight = Math.round((d.accuracy / maxAcc) * 180); // pixel height

                    return (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: barHeight }}
                                transition={{ duration: 0.6, delay: i * 0.07 }}
                                className="w-10 rounded-lg bg-linear-to-t from-blue-700 to-blue-400 shadow-lg"
                            />
                            <div className="text-xs text-gray-300">{d.version}</div>
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-gray-500 mt-2">
                Accuracy shown as fraction (0–1). Source: /api/admin/models/history
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
