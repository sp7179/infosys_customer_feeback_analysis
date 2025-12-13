"use client"

import { useEffect, useState } from "react"

export default function VersionHistory() {
    const [history, setHistory] = useState([])

    useEffect(() => {
        async function load() {
            const res = await fetch("/api/active-learning/models")
            const data = await res.json()
            setHistory(data)
        }
        load()
    }, [])

    if (!history.length) return null

    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-purple-500/20 backdrop-blur">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
                Model Versions
            </h3>

            <div className="space-y-3">
                {history.map((v) => (
                    <div
                        key={v.version}
                        className="bg-black/20 p-3 rounded-xl flex justify-between"
                    >
                        <span className="text-gray-300">Version {v.version}</span>
                        <span className="text-purple-300">{v.metrics?.f1}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
