"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export default function UploadRetrain() {
    const [file, setFile] = useState(null)
    const [uploaded, setUploaded] = useState(false)
    const [datasetId, setDatasetId] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleUpload() {
        if (!file) return alert("Upload a CSV first.")

        const form = new FormData()
        form.append("file", file)
        setLoading(true)

        const res = await fetch("/api/active-learning/upload", {
            method: "POST",
            body: form
        })

        const data = await res.json()
        setLoading(false)

        if (data.dataset_id) {
            setDatasetId(data.dataset_id)
            setUploaded(true)
        }
    }

    async function handleRetrain() {
        if (!datasetId) return alert("Upload first.")

        const res = await fetch("/api/active-learning/retrain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dataset_id: datasetId,
                include_feedbacks: true,
                base_model_version: "v1"
            })
        })

        const data = await res.json()
        alert("Retrain job started: " + data.job_id)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-2xl bg-white/10 border border-purple-500/20 backdrop-blur-xl shadow-xl space-y-6"
        >
            <h3 className="text-xl font-semibold text-purple-300">
                Model Retraining
            </h3>

            {/* Upload Area */}
            <label
                className="block w-full p-8 rounded-2xl border-2 border-dashed border-purple-500/40 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300"
            >
                <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <p className="text-gray-300 mb-2">
                    {file ? (
                        <span className="text-purple-300 font-semibold">
                            {file.name}
                        </span>
                    ) : (
                        "Click to upload training CSV"
                    )}
                </p>

                <p className="text-gray-500 text-sm">.csv only</p>
            </label>

            {/* Upload Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                className="w-full py-3 bg-linear-to-r from-purple-500 to-fuchsia-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-fuchsia-500/40"
            >
                {loading ? "Uploading..." : "Upload CSV"}
            </motion.button>

            {/* Retrain Button */}
            {uploaded && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleRetrain}
                    className="w-full py-3 bg-linear-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-green-500/40"
                >
                    Start Retraining
                </motion.button>
            )}
        </motion.div>
    )
}
