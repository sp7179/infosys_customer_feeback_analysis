"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const MENU = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "models", label: "Models" },
    { id: "datasets", label: "Datasets" },
    { id: "logs", label: "Logs" },
    { id: "config", label: "Config" },
    { id: "data-management", label: "Data Management" },
];

export default function AdminSidebar() {
    //  FIX this — remove sessionStorage from initial render
    const [active, setActive] = useState("dashboard");

    // 🔥 Keep your sync logic the same
    useEffect(() => {
        function syncSection() {
            const section = sessionStorage.getItem("ADMIN_SECTION");
            if (section) setActive(section);
        }
        syncSection();
        window.addEventListener("storage", syncSection);
        return () => window.removeEventListener("storage", syncSection);
    }, []);

    // 🔥 No change needed here
    function switchSection(id) {
        setActive(id);
        sessionStorage.setItem("ADMIN_SECTION", id);
        window.dispatchEvent(new Event("storage"));
    }


    return (
        <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full h-full bg-white/5 border-r border-white/10 p-4 flex flex-col gap-2 backdrop-blur-md"
        >
            <h2 className="text-white text-xl font-semibold mb-4">Admin Panel</h2>

            <nav className="flex flex-col gap-1">
                {MENU.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => switchSection(item.id)}
                        className={`px-4 py-2 text-left rounded-lg transition-all
              ${active === item.id
                                ? "bg-blue-600/80 text-white shadow-md scale-[1.02]"
                                : "text-gray-300 hover:bg-white/10"
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>
        </motion.div>
    );
}
