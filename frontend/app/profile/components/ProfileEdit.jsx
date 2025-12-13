"use client"
import { useState } from "react"
import ImageUploader from "./ImageUploader"

export default function ProfileEdit({ profile, userid, onSave, onCancel }) {
    const [form, setForm] = useState({ ...profile })
    const [saving, setSaving] = useState(false)
    const [photo, setPhoto] = useState(profile.photo || "")

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            await fetch(`/api/profile/set/${userid}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, photo }),
            })
            onSave()
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 text-white">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-purple-300">Edit Profile</h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-red-400">✖ Cancel</button>
            </div>

            <div className="flex justify-center">
                <ImageUploader userid={userid} currentPhoto={photo} onPhotoChange={setPhoto} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["fullName", "displayName", "email", "phone", "city", "website"].map((f) => (
                    <div key={f}>
                        <label className="block text-sm text-gray-400 mb-1 capitalize">{f}</label>
                        <input
                            type="text"
                            name={f}
                            value={form[f] || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                        />
                    </div>
                ))}
                <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={form.bio || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white/5 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    )
}
