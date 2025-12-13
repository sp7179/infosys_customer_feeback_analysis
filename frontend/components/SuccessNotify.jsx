"use client";
import { motion } from "framer-motion";

export default function SuccessNotify({ message }) {
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 px-5 py-3 bg-emerald-600/90 text-white rounded-xl shadow-xl border border-emerald-400/40 backdrop-blur-md"
        >
            <div className="font-semibold">Success</div>
            <div className="text-sm opacity-90">{message}</div>
        </motion.div>
    );
}
