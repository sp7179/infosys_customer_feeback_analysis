"use client"

import { motion } from "framer-motion"

export default function UncertainSamplesTable({ samples = [] }) {
    if (!samples || samples.length === 0)
        return (
            <p className="text-gray-400 italic text-sm">
                No uncertain predictions (confidence \u003C 0.5)
            </p>
        )

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-xl"
        >
            <h3 className="text-xl font-semibold text-purple-300 mb-6">
                Uncertain Predictions (confidence \u003C 0.5)
            </h3>

            <div className="overflow-hidden rounded-xl border border-purple-500/20">
                <table className="w-full text-left">
                    <thead className="bg-purple-500/10 text-purple-300">
                        <tr>
                            <th className="py-3 px-4">Text</th>
                            <th className="py-3 px-4">Predicted</th>
                            <th className="py-3 px-4">Confidence</th>
                            <th className="py-3 px-4">Model</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-purple-500/10">
                        {samples.map((s, i) => (
                            <motion.tr
                                key={s._id || i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="hover:bg-purple-500/10 transition-colors"
                            >
                                <td className="py-3 px-4 text-gray-200 max-w-lg truncate">
                                    {s.text}
                                </td>
                                <td className="py-3 px-4 capitalize text-gray-300">
                                    {s.predicted}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="text-fuchsia-300 font-semibold">
                                        {(s.confidence * 100).toFixed(1)}%
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-gray-400">
                                    {s.model_version}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}
