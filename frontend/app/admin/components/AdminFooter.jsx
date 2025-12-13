"use client";

import { motion } from "framer-motion";

export default function AdminFooter() {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="
        w-full py-4 px-6 
        border-t border-white/10 
        bg-white/5 
        backdrop-blur-md 
        text-gray-300 
        flex items-center justify-between
      "
        >
            <span className="text-sm">
                © {new Date().getFullYear()} <span className="text-white">Infosys Admin Panel</span>
            </span>

            <span className="text-xs text-gray-400">
                Built with ❤️ • Optimized UX • Animated Layout
            </span>
        </motion.footer>
    );
}
