"use client"

import { motion } from "framer-motion"

export default function ActiveFooter() {
    return (
        <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mt-20 w-full py-4 bg-linear-to-t from-black/40 to-transparent 
                       border-t border-purple-500/20 backdrop-blur-xl"
        >
            <div className="container mx-auto px-6 text-center space-y-4">

                {/* Floating Glow Circles */}
                <div className="relative flex justify-center">
                    <div className="absolute w-40 h-40 bg-purple-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="absolute w-56 h-56 bg-fuchsia-500/20 blur-3xl rounded-full animate-pulse delay-300" />
                </div>

                <motion.h2
                    whileHover={{ scale: 1.05 }}
                    className="text-2xl font-semibold text-purple-300"
                >
                    SentimentAI — Active Learning Engine
                </motion.h2>

                <p className="text-gray-400 text-sm max-w-xl mx-auto">
                    Continuously enhancing prediction accuracy through real-time feedback,
                    retraining, and intelligent model improvement.
                </p>

                <p className="text-gray-500 text-xs pt-6">
                    © {new Date().getFullYear()} SentimentAI • Powered By TL-RL + DistilBERT Models
                </p>
            </div>
        </motion.footer>
    )
}
