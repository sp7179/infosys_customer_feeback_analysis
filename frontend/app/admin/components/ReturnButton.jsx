"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ReturnButton({ to = "/admin/dashboard" }) {
    const router = useRouter();

    return (
        <motion.button
            onClick={() => router.push(to)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg
                 hover:bg-white/20 transition shadow-lg backdrop-blur-sm"
        >
            ← Return
        </motion.button>
    );
}
