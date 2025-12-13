"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import OverviewCards from "./OverviewCards";
import UsersTable from "./UsersTable";
import ModelsTable from "./ModelsTable";
import LogsTable from "./LogsTable";
import DatasetsTable from "./DatasetsTable";
import ConfigTable from "./ConfigTable";
import DataManagement from "./DataManagement";
import AdminProfileSettings from "./AdminProfileSettings";
import RetrainJobsPanel from "./RetrainJobsPanel";


/**
 * AdminContentSwitcher
 * - Shows one admin section at a time
 * - Reads/writes sessionStorage.ADMIN_SECTION so sidebar or other UI can switch sections
 * - If sessionStorage is not set, defaults to "dashboard"
 */

const SECTIONS = [
    { id: "dashboard", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "models", label: "Models" },
    { id: "logs", label: "Logs" },
    { id: "retrain-jobs", label: "Retrain Jobs" },
    { id: "datasets", label: "Datasets" },
    { id: "config", label: "Config" },
    { id: "data-management", label: "Data Management" },
    { id: "profile-settings", label: "Profile" }
    


];

function readSection() {
    return sessionStorage.getItem("ADMIN_SECTION") || "dashboard";
}

export default function AdminContentSwitcher({ initial }) {
    const [section, setSection] = useState(initial || readSection());

    useEffect(() => {
        // keep sessionStorage in sync so other components (sidebar) can request changes
        sessionStorage.setItem("ADMIN_SECTION", section);
    }, [section]);

    useEffect(() => {
        // listen for external changes (e.g., sidebar writes to sessionStorage)
        function onStorage(e) {
            if (e.key === "ADMIN_SECTION" && e.newValue && e.newValue !== section) {
                setSection(e.newValue);
            }
        }
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [section]);

    function renderSection() {
        switch (section) {
            case "dashboard":
                return <OverviewCards />;
            case "users":
                return <UsersTable />;
            case "models":
                return <ModelsTable />;
            case "logs":
                return <LogsTable />;
            case "datasets":
                return <DatasetsTable />;
            case "retrain-jobs":
                return <RetrainJobsPanel />;
            case "profile-settings":
                return <AdminProfileSettings />;
            case "config":
                return <ConfigTable />;
            case "data-management":
                return <DataManagement />;
            default:
                return <OverviewCards />;
        }
    }

    return (
        <div className="w-full h-full flex flex-col gap-6">
            {/* Top quick-selector: small pill tabs (useful if sidebar not wired) */}
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 flex-wrap"
            >
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSection(s.id)}
                        className={`px-3 py-1 rounded-full text-sm transition
              ${section === s.id ? "bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white/5 text-gray-300 border border-white/6"}`}
                    >
                        {s.label}
                    </button>
                ))}
            </motion.div>

            {/* Animated content container */}
            <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full"
            >

                {renderSection()}
            </motion.div>
        </div>
    );
}
