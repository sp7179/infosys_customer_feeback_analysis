"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UploadLoader from "./UploadLoader"
import UploadSuccess from "./UploadSuccess"

export default function UploadForm() {
    const router = useRouter()
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [visual, setVisual] = useState(null) // ✅ store full visual
    const [dragActive, setDragActive] = useState(false)

    // Load existing visual from localStorage on mount
    useEffect(() => {
        const savedVisual = localStorage.getItem("currentVisual")
        if (savedVisual) {
            const visualObj = JSON.parse(savedVisual)
            setVisual(visualObj)
            setSuccess(true)
        }
    }, [])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (!["text/csv", "text/plain", "application/json"].includes(selectedFile.type)) {
                setError("Please upload a CSV, TXT, or JSON file")
                return
            }
            // Clear old visual when uploading new file
            localStorage.removeItem("currentVisual")
            setFile(selectedFile)
            setError("")
            setSuccess(false)
            setVisual(null)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
        else if (e.type === "dragleave") setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const droppedFile = e.dataTransfer.files?.[0]
        if (droppedFile) {
            if (!["text/csv", "text/plain", "application/json"].includes(droppedFile.type)) {
                setError("Please upload a CSV, TXT, or JSON file")
                return
            }
            // Clear old visual when uploading new file
            localStorage.removeItem("currentVisual")
            setFile(droppedFile)
            setError("")
            setSuccess(false)
            setVisual(null)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            setError("Please select a file")
            return
        }

        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload/analyze", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: formData,
            })

            const data = await response.json()
            if (!response.ok) {
                setError(data.message || "Upload failed")
                return
            }

            // ✅ Store the full visual object
            setVisual(data)
            localStorage.setItem("currentVisual", JSON.stringify(data))
            setSuccess(true)
        } catch (err) {
            setError("An error occurred during upload")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <UploadLoader />

    if (success) {
        return (
            <UploadSuccess
                visual={visual} // ✅ pass full visual
                onNewUpload={() => {
                    // Clear current visual for new upload
                    localStorage.removeItem("currentVisual")
                    setSuccess(false)
                    setFile(null)
                    setVisual(null)
                }}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl backdrop-blur-sm animate-slide-in-up flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div
                className={`relative bg-linear-to-br from-purple-500/5 to-violet-500/5 backdrop-blur-md border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${dragActive
                    ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-purple-500/30 hover:border-purple-500/50 hover:bg-purple-500/5"
                    }`}
                onClick={() => document.getElementById("fileInput").click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="relative z-10">
                    <svg
                        className={`w-20 h-20 mx-auto mb-4 text-purple-400 transition-all duration-300 ${dragActive ? "scale-110" : "group-hover:scale-105"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                    <h3 className="text-2xl font-semibold text-purple-300 mb-2 group-hover:text-purple-200 transition-colors">
                        Drop your file here
                    </h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">or click to browse</p>
                    <p className="text-sm text-gray-500">CSV, TXT, or JSON files supported • Max 50MB</p>
                </div>
                <input id="fileInput" type="file" onChange={handleFileChange} accept=".csv,.txt,.json" className="hidden" />
            </div>

            {file && (
                <div className="bg-linear-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30 rounded-xl p-6 flex items-center justify-between animate-bounce-in backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-purple-300 font-semibold">{file.name}</p>
                            <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            )}

            <button
                type="submit"
                disabled={!file}
                className="w-full py-4 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 active:scale-95 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-linear-to-r from-purple-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze Feedback
                </span>
            </button>
        </form>
    )
}
