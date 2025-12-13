"use client"

import { motion } from "framer-motion"

export default function ActiveIntro({ onStart }) {
    return (
        <div className="relative py-24 mb-10">
            {/* Floating blobs */}
            <div className="absolute -top-20 left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl animate-float pointer-events-none"></div>
            <div className="absolute top-1/3 right-0 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center max-w-3xl mx-auto relative z-10"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7 }}
                    className="text-5xl font-bold bg-linear-to-br from-purple-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-xl"
                >
                    Active Learning Lab
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.7 }}
                    className="text-gray-300 text-lg mt-4 max-w-xl mx-auto leading-relaxed"
                >
                    Improve your AI sentiment model by testing real feedback, analyzing performance, retraining with new data, and monitoring growth.
                </motion.p>

                <motion.button
                    onClick={onStart}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 px-10 py-4 rounded-xl bg-linear-to-br from-purple-500 to-fuchsia-600 text-white font-semibold shadow-xl hover:shadow-purple-500/40 backdrop-blur-md"
                >
                    🚀 Get Started
                </motion.button>
            </motion.div>
        </div>
    )
}
