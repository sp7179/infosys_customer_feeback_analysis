"use client";
import { motion } from "framer-motion";

export default function ErrorNotify({ message }) {
    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 px-5 py-3 bg-rose-700/90 text-white rounded-xl shadow-xl border border-rose-400/40 backdrop-blur-md"
        >
            <div className="font-semibold">Error</div>
            <div className="text-sm opacity-90">{message}</div>
        </motion.div>
    );
}
