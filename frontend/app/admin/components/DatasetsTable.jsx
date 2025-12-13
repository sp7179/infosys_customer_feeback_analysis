"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DatasetsTable() {
    const [datasets, setDatasets] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("admin_token") || "";

        fetch("/api/admin/datasets", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data =>
                setDatasets((data.datasets || []).map(d => ({
                    name: d.filename,
                    count: d.rows,
                    createdAt: d.createdAt || new Date().toISOString()
                })))
            );

    }, []);


    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e0e0e] p-6 rounded-2xl shadow-lg border border-white/10"
        >
            <h2 className="text-2xl font-bold mb-4 text-white">Datasets</h2>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-white/10 text-white">
                            <th className="p-3 text-left">Dataset Name</th>
                            <th className="p-3 text-left">Records</th>
                            <th className="p-3 text-left">Uploaded</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {datasets.map((d, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/10 text-white hover:bg-white/5 transition"
                            >
                                <td className="p-3">{d.name}</td>
                                <td className="p-3">{d.count}</td>
                                <td className="p-3">{new Date(d.createdAt).toLocaleString()}</td>

                                <td className="p-3 flex gap-3">
                                    <button className="px-3 py-1 bg-green-600 rounded-lg text-white">
                                        View
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
