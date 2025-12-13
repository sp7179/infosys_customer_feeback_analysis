"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ModelsTable() {
    const [models, setModels] = useState([]);

    useEffect(() => {
        fetch("/api/admin/models")
            .then(res => res.json())
            .then(data => {
                const list = (data.jobs || data.models || []).map(item => {
                    const updated = item.updatedAt || item.updated_at || item.createdAt || item.created_at || item.metrics?.created_at;
                    return {
                        id: item.name || item.version || String(item._id),
                        name: item.name || `model-${item.version || String(item._id).slice(-6)}`,
                        version: item.version || item.model_version || "",
                        updatedAt: updated || null,
                        _raw: item
                    };
                });
                setModels(list);
            });
    }, []);


    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e0e0e] p-6 rounded-2xl shadow-lg border border-white/10"
        >
            <h2 className="text-2xl font-bold mb-4 text-white">Models</h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/10 text-white">
                            <th className="p-3 text-left">Model Name</th>
                            <th className="p-3 text-left">Version</th>
                            <th className="p-3 text-left">Last Updated</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {models.map((m, i) => (
                            <motion.tr
                                key={m.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/10 text-white hover:bg-white/5 transition"
                            >
                                <td className="p-3">{m.name}</td>
                                <td className="p-3">{m.version}</td>
                                <td className="p-3">
                                    {m.updatedAt ? (() => {
                                        const d = new Date(m.updatedAt);
                                        return isNaN(d) ? "—" : d.toLocaleString();
                                    })() : "—"}
                                </td>


                                <td className="p-3 flex gap-3">
                                    <button className="px-3 py-1 bg-blue-600 rounded-lg text-white">
                                        Update
                                    </button>
                                    <button className="px-3 py-1 bg-red-600 rounded-lg text-white">
                                        Delete
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
