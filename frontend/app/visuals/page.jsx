"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import UploadNavbar from "@/app/upload/components/UploadNavbar"
import VisualSidebar from "./components/VisualSidebar"
import VisualDisplay from "./components/VisualDisplay"



export default function VisualsPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [visuals, setVisuals] = useState([])
    const [selectedVisual, setSelectedVisual] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load currentVisual from localStorage on first render
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("currentVisual")
            if (stored) {
                setSelectedVisual(JSON.parse(stored))
            }
        }
    }, [])

    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (!token) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
            fetchVisuals()
        }
    }, [router])

    const fetchVisuals = async () => {
        try {
            const response = await fetch("/api/visuals/getAll", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
            })
            const data = await response.json()
            setVisuals(data.visuals || [])

            // Only auto-select first visual if nothing is stored
            const stored = localStorage.getItem("currentVisual");
            if (!stored && data.visuals?.length > 0) {
                setSelectedVisual(data.visuals[0]);
                localStorage.setItem("currentVisual", JSON.stringify(data.visuals[0]));
            }
        } catch (err) {
            console.error("Failed to fetch visuals:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectVisual = (visual) => {
        setSelectedVisual(visual)
        localStorage.setItem("currentVisual", JSON.stringify(visual))
    }

    if (!isAuthenticated || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-violet-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
            <UploadNavbar />

            <div className="flex h-[calc(100vh-80px)]">
                <VisualSidebar
                    visuals={visuals}
                    selectedVisual={selectedVisual}
                    onSelectVisual={handleSelectVisual}
                    onRefresh={fetchVisuals}
                />

                <div className="flex-1 overflow-auto">
                    {selectedVisual ? (
                        <VisualDisplay visual={selectedVisual} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <p className="text-gray-400 text-lg">No visualizations yet</p>
                                <p className="text-gray-500 text-sm mt-2">Upload a CSV file to create your first analysis</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    
        </div>
    )
}
