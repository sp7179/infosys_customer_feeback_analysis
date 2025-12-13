"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ConfigTable() {
    const [items, setItems] = useState([]);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    async function loadConfig() {
        const res = await fetch("/api/admin/config", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`
 },
        });
        const data = await res.json();
        setItems(data.config || []);
    }

    async function addItem() {
        const res = await fetch("/api/admin/config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`,
            },
            body: JSON.stringify({ key: newKey, value: newValue }),
        });
        if (!newKey.trim()) return alert("Key required");

        if (!res.ok) return alert("Add failed: " + await res.text());
        setNewKey(""); setNewValue(""); await loadConfig();

    }

    async function deleteItem(key) {
        const res = await fetch("/api/admin/config", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("ADMIN_TOKEN") || ""}`,
            },
            body: JSON.stringify({ key }), // or { table: "settings", key } if needed
        });
        if (!res.ok) return alert("Delete failed: " + await res.text());
        await loadConfig();
    }


    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/10 shadow-xl"
        >
            <h2 className="text-xl text-white font-semibold mb-4">Configuration</h2>

            {/* Add row */}
            <div className="flex gap-2 mb-4">
                <input
                    placeholder="key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg w-1/3"
                />
                <input
                    placeholder="value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg w-2/3"
                />
                <button
                    onClick={addItem}
                    className="px-3 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
                >
                    Add
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-white text-sm">
                    <thead>
                        <tr className="bg-white/10">
                            <th className="p-3 text-left">Key</th>
                            <th className="p-3 text-left">Value</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-b border-white/10 hover:bg-white/5 transition"
                            >
                                <td className="p-3">{item.key}</td>
                                <td className="p-3">{item.value}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-lg"
                                    >
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
