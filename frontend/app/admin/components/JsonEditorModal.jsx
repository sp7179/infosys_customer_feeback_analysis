"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";


export default function JsonEditorModal({ open, onClose, initial = null, data = null, onSave }) {
    
    if (!open) return null;

    const [jsonText, setJsonText] = useState(JSON.stringify(initial ?? data ?? {}, null, 2));

    function save() {
        try {
            const parsed = JSON.parse(jsonText);
            onSave(parsed);
            onClose();
        } catch (e) {
            alert("Invalid JSON format!");
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-[#111] border border-white/10 rounded-2xl shadow-xl p-6 w-[90%] max-w-3xl"
                >
                    <h2 className="text-xl text-white font-semibold mb-4">
                        Edit JSON
                    </h2>

                    <textarea
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        className="w-full h-72 p-3 bg-black/40 border border-white/20 text-white rounded-lg outline-none font-mono text-sm"
                    />

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={save}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
                        >
                            Save
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
