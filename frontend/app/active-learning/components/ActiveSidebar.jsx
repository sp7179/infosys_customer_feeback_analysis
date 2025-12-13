"use client";

import { motion } from "framer-motion";

const MENU = [
    { id: "overview", label: "Overview" },
    { id: "classpercents", label: "Confidence Score" },
    { id: "confusion", label: "Confusion Matrix" },
    { id: "distribution", label: "Distribution" },
    { id: "prcurve", label: "PR Curve" },
    { id: "versions", label: "Model Versions" },
    { id: "uncertain", label: "Uncertain Samples" },
    { id: "retrain", label: "Retrain Model" },      
    { id: "feedback", label: "Feedback Input" }
];


export default function ActiveSidebar({ active, onChange }) {
    return (
        <div className="h-full w-64 bg-black/30 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col shadow-xl">

            <h2 className="text-white text-xl font-semibold tracking-tight mb-6">
                Active Learning
            </h2>

            <div className="flex flex-col gap-1">
                {MENU.map((m) => {
                    const isActive = active === m.id;

                    return (
                        <motion.button
                            key={m.id}
                            onClick={() => onChange(m.id)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`px-4 py-2 rounded-lg text-left transition-all
                                ${isActive
                                    ? "bg-purple-600/60 text-white shadow-lg shadow-purple-700/20"
                                    : "text-gray-300 hover:bg-white/10"
                                }`}
                        >
                            <div className="flex items-center gap-2 relative">

                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute -left-3 w-1 h-6 bg-purple-400 rounded-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}

                                <span className="relative z-10">{m.label}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <div className="mt-auto pt-6 text-xs text-gray-500">
                <p>Infosys Active Learning System</p>
            </div>
        </div>
    );
}
