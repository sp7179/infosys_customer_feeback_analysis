"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import SuccessNotify from "@/components/SuccessNotify";
import ErrorNotify from "@/components/ErrorNotify";


export default function UploadSuccess({ visual, onNewUpload }) { // ✅ Receive full visual object as prop
    const router = useRouter()

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Handle "Upload Another" button
    const handleNewUpload = () => {
        localStorage.removeItem("currentVisual")
        onNewUpload()
    }

    // Handle "View Visualization" button
    const handleViewVisualization = () => {
        if (!visual) return // safety check
        localStorage.setItem("currentVisual", JSON.stringify(visual)) // ✅ store full visual object
        router.push("/visuals")
    }

    return (
        <>

        {success && <SuccessNotify message={success} />}
        {error && <ErrorNotify message={error} />}

        <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-8 animate-bounce">
                <svg className="w-24 h-24 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <h3 className="text-3xl font-bold text-green-400 mb-2">Analysis Complete!</h3>
            <p className="text-gray-400 text-center max-w-md mb-8">
                Your sentiment analysis has been successfully saved. Click below to view your visualization.
            </p>

            <div className="flex gap-4">
                    <button
                        onClick={() => handleViewVisualization() && setSuccess("Visualization Loaded Successfully!")}
                        className="px-8 py-3 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                    >
                        View Visualization
                    </button>

                <button
                    onClick={handleNewUpload}
                    className="px-8 py-3 bg-white/10 border border-purple-500/30 text-purple-300 font-semibold rounded-lg hover:bg-white/20 transition-colors"
                >
                    Upload Another
                </button>
            </div>
        </div>

        </>
    )
}
