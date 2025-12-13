"use client"

import { useState, useEffect } from "react"

export default function ModelSelector() {
    const [currentModel, setCurrentModel] = useState("vader")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchCurrentModel()
    }, [])

    const fetchCurrentModel = async () => {
        try {
            const response = await fetch("/api/model/get")
            let data = {}
            try { data = await response.json() } catch { }
            if (!response.ok) throw new Error(data.message || "Backend not connected")

            setCurrentModel(data.current_model || "vader")
            setError("")
        } catch (err) {
            console.error("Failed to fetch model:", err)
            setError("Backend server not connected")
        }
    }

    const handleModelChange = async (model) => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/model/set", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
            })

            if (!response.ok) throw new Error("Failed to change model")

            setCurrentModel(model)
            setIsOpen(false)
            setError("")
        } catch (err) {
            console.error("Failed to change model:", err)
            setError("Backend server not connected")
        } finally {
            setIsLoading(false)
        }
    }

    const models = [
        { id: "vader", name: "Vader", description: "Fast & Reliable", icon: "⚡", color: "from-purple-500 to-violet-500" },
        { id: "huggingface", name: "siebert", description: "Advanced NLP", icon: "🧠", color: "from-violet-500 to-pink-500" },
        { id: "tl_model", name: "TL Classifier", description: "Custom Model", icon: "🎯", color: "from-pink-500 to-blue-500" },
    ]

    const currentModelData = models.find((m) => m.id === currentModel)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-6 py-3 bg-linear-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-500/30 transition-all duration-300 flex items-center gap-3 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 group"
            >
                <span className="text-lg">{currentModelData?.icon}</span>
                <div className="text-left">
                    <div className="text-xs text-gray-400">Current Model</div>
                    <div className="text-sm font-semibold">{currentModelData?.name}</div>
                </div>
                <svg
                    className={`w-5 h-5 transition-transform duration-300 ml-auto ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-3 right-0 bg-slate-800/95 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl z-50 min-w-max overflow-hidden animate-slide-in-up">
                    {models.map((model, index) => (
                        <button
                            key={model.id}
                            onClick={() => handleModelChange(model.id)}
                            disabled={isLoading}
                            className={`w-full text-left px-6 py-4 hover:bg-purple-500/20 transition-all duration-200 border-b border-purple-500/10 last:border-b-0 flex items-center gap-3 group relative overflow-hidden ${currentModel === model.id ? "bg-purple-500/30 text-purple-300" : "text-gray-300 hover:text-purple-300"
                                }`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div
                                className={`absolute inset-0 bg-linear-to-r ${model.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                            ></div>
                            <span className="text-2xl">{model.icon}</span>
                            <div className="relative z-10">
                                <div className="font-semibold">{model.name}</div>
                                <div className="text-xs text-gray-400">{model.description}</div>
                            </div>
                            {currentModel === model.id && (
                                <svg className="w-5 h-5 ml-auto text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
