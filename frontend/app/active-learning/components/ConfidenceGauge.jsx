"use client"

import { motion } from "framer-motion"

export default function ConfidenceGauge({ value = 0 }) {
    const pct = Math.round(value * 100)

    // Color transitions based on confidence
    const color =
        pct < 50
            ? "#ef4444"     // red
            : pct < 75
                ? "#f97316"     // orange
                : "#a855f7"     // purple green

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
        >
            <div className="relative w-40 h-40">
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="none"
                    />

                    {/* Progress circle */}
                    <motion.circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray="440"
                        strokeDashoffset={440 - (440 * pct) / 100}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="drop-shadow-[0_0_10px]"
                        style={{
                            filter: `drop-shadow(0 0 10px ${color})`
                        }}
                    />
                </svg>

                {/* Inner percentage */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <span
                        className="text-3xl font-bold"
                        style={{ color }}
                    >
                        {pct}%
                    </span>
                </motion.div>
            </div>

            <p className="text-gray-300 text-sm mt-2">Confidence</p>
        </motion.div>
    )
}
