"use client"

import { motion } from "framer-motion"

export default function ParticleBackground() {
    const particles = Array.from({ length: 25 }) // number of glowing dots

    return (
        <div className="absolute inset-0 overflow-hidden -z-10">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 10 + 6 + "px",
                        height: Math.random() * 10 + 6 + "px",
                        top: Math.random() * 100 + "%",
                        left: Math.random() * 100 + "%",
                        background: `radial-gradient(circle, rgba(200,100,255,0.7), transparent 70%)`,
                        filter: "blur(1px)",
                    }}
                    animate={{
                        y: [0, Math.random() * 30 - 15],
                        x: [0, Math.random() * 30 - 15],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 6 + Math.random() * 8,
                        repeat: Infinity,
                        repeatType: "mirror",
                    }}
                />
            ))}
        </div>
    )
}
