"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AdminMetricsChart from "./AdminMetricsChart";
import AdminUserGrowthChart from "./AdminUserGrowthChart";



export default function OverviewCards() {
    const [stats, setStats] = useState({
        users: 0,
        models: 0,
        datasets: 0,
        logs: 0,
    });

    async function loadStats() {
        const res = await fetch("/api/admin/users", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` }
,
        });
        const users = await res.json();

        const modelsRes = await fetch("/api/admin/models", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` }
,
        });
        const models = await modelsRes.json();

        const dsRes = await fetch("/api/admin/datasets", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` }
,
        });
        const datasets = await dsRes.json();

        const logsRes = await fetch("/api/admin/logs", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}` }
,
        });
        const logs = await logsRes.json();

        setStats({
            users: Array.isArray(users) ? users.length : users.users?.length || users.total || 0,
            models: models.jobs?.length || models.models?.length || 0,
            datasets: datasets.datasets?.length || 0,
            logs: logs.logs?.length || 0,
        });
    }

    useEffect(() => {
        loadStats();
    }, []);

    const cardStyle =
        "flex flex-col gap-2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg hover:scale-[1.03] hover:bg-white/[0.08] transition-all";

    return (
        <div className="flex flex-col gap-6">
            {/* ---------- STATS CARDS ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Users", value: stats.users },
                    { label: "Models", value: stats.models },
                    { label: "Datasets", value: stats.datasets },
                    { label: "Logs", value: stats.logs },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cardStyle}
                    >
                        <div className="text-4xl font-bold text-white">{item.value}</div>
                        <div className="text-white/60 text-sm">{item.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ---------- CHARTS ROW (SIDE-BY-SIDE) ---------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminMetricsChart />
                <AdminUserGrowthChart />
            </div>


            
        </div>
    );
}
