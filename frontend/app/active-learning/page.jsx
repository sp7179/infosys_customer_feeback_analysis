"use client"

import { useState, useEffect } from "react"
import ActiveIntro from "./components/ActiveIntro"
import ActiveDashboard from "./components/ActiveDashboard"
import ActiveFooter from "./components/ActiveFooter"
import ActiveNavBar from "./components/ActiveNavBar"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams } from "next/navigation";


export default function ActiveLearningPage() {
    const [started, setStarted] = useState(false);
    const search = useSearchParams();
    useEffect(() => {
        const tab = search.get("tab");
        if (tab) {
            // ensure dashboard shows and set initial segment
            sessionStorage.setItem("ACTIVE_SECTION", tab);
            setStarted(true);
        }
    }, [search]);


    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-950 text-white px-4 pb-24 pt-10">
            <ActiveNavBar />

            {/* Floating ambient lights */}
            <div className="pointer-events-none">
                <div className="fixed top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
                <div className="fixed bottom-20 right-20 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-3xl animate-float-slow" />
                <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-float-slower" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {!started ? (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.6 }}
                        >
                            <ActiveIntro onStart={() => setStarted(true)} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="mt-10"
                        >
                            <ActiveDashboard />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <ActiveFooter />
        </div>
    )
}
