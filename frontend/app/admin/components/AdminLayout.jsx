"use client";

import { motion } from "framer-motion";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminContentSwitcher from "./AdminContentSwitcher";
import AdminFooter from "./AdminFooter";



export default function AdminLayout() {
    return (
        <div className="w-full h-screen flex bg-[#0a0a0a] text-white overflow-hidden">

            {/* -------- LEFT SIDEBAR --------
            <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-60 h-full border-r border-white/10 bg-black/20 backdrop-blur-md"
            >
                <AdminSidebar />
            </motion.aside> */}

            {/* -------- MAIN AREA -------- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* HEADER */}
                <AdminHeader />

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AdminContentSwitcher />
                </div>

                {/* FOOTER */}
                <AdminFooter />

            </div>
        </div>
    );
}
