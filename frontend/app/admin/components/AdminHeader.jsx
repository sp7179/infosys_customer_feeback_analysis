"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReturnButton from "./ReturnButton";

export default function AdminHeader() {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState("");

    useEffect(() => {
        const stored = sessionStorage.getItem("ADMIN_USER");
        if (stored) setAdminUser(stored);
    }, []);

    function logout() {
        sessionStorage.removeItem("ADMIN_TOKEN");
        sessionStorage.removeItem("ADMIN_USER");
        sessionStorage.removeItem("ADMIN_SECTION");

        router.push("/"); // go back to home
    }

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-full h-16 border-b border-white/10 bg-black/20
                 backdrop-blur-md flex items-center justify-between px-6"
        >
            {/* LEFT — PAGE TITLE */}
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-wide">
                    Admin Panel
                </h1>
            </div>
            <ReturnButton to="/" />

            {/* RIGHT — ADMIN NAME + LOGOUT */}
            <div className="flex items-center gap-4">
                {adminUser && (
                    <span className="text-gray-300 text-sm">
                        Logged in as: <span className="text-white">{adminUser}</span>
                    </span>
                )}

                <button
                    onClick={logout}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700
                     text-white text-sm transition-all shadow-lg"
                >
                    Logout
                </button>
            </div>
        </motion.header>
    );
}
