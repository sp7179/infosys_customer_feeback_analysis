"use client"

import { useState } from "react"

export default function DownloadButton({ visual }) {
    const [loading, setLoading] = useState(false)

    const handleDownload = () => {
        if (!visual || !visual.result?.report_download) {
            alert("No report available to download")
            return
        }

        setLoading(true)
        try {
            // Decode Base64 CSV content
            const csvContent = atob(visual.result.report_download)

            // Create a Blob and download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${visual.name || "report"}-report.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error("Download error:", err)
            alert("Failed to download report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="px-6 py-2 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
            </svg>
            {loading ? "Downloading..." : "Download CSV"}
        </button>
    )
}
