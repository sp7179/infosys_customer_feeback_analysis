"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ActiveContentSwitcher({ section, components }) {
    // components = { overview: <>, feedback: <>, confusion: <>, uncertain: <> ... }

    return (
        <div className="w-full relative">
            <AnimatePresence mode="wait">
                <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full"
                >
                    {components[section] || (
                        <div className="text-gray-300 text-center py-10">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <p className="text-lg font-light">
                                    No component found for section:
                                </p>
                                <p className="text-purple-300 font-mono mt-2">{section}</p>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
