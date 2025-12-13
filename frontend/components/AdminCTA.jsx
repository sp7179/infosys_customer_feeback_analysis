"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminCTA() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center mt-4 animate-slide-in-up" style={{ animationDelay: "0.45s" }}>

            {/* --- Admin Panel Button (Matches Get Started Style) --- */}
            <motion.button
                onClick={() => router.push("/admin")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="
                px-8 py-4 rounded-xl font-semibold text-white
                bg-linear-to-br from-fuchsia-500 to-violet-600
                shadow-2xl shadow-fuchsia-500/40
                hover:shadow-fuchsia-500/60
                transition-all duration-300
                relative overflow-hidden group
            "
            >
                <div className="absolute inset-0 bg-linear-to-br from-fuchsia-400/30 to-violet-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <span className="relative flex items-center gap-2">
                    Admin Panel
                    <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>
            </motion.button>

            {/* --- Animated Description --- */}
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-4 text-sm text-gray-300 max-w-md leading-relaxed"
            >
                Manage models, datasets, configurations, logs & system settings
                with a unified, professional admin interface.
            </motion.p>

        </div>
    );

}
