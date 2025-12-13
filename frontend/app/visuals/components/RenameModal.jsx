"use client"

import { useState } from "react"

export default function RenameModal({ visualId, currentName, onRename, onClose }) {
    const [newName, setNewName] = useState(currentName)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (newName.trim()) {
            onRename(visualId, newName)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-purple-300 mb-4">Rename Visualization</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                        >
                            Rename
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-white/10 text-gray-300 font-semibold rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
