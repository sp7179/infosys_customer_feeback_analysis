"use client"
import { useEffect, useState } from "react"
import ProfileView from "./ProfileView"
import ProfileEdit from "./ProfileEdit"

export default function ProfileModal({ userid, onClose }) {
    const [profile, setProfile] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [loading, setLoading] = useState(true)

    const loadProfile = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/get/${userid}`)
            const data = await res.json()
            setProfile(data.profile || {})
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadProfile() }, [userid])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* blur background */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => !editMode && onClose()}
            />

            {/* main box */}
            <div
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
                className="relative bg-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto p-6"
                onKeyDown={(e) => e.key === "Escape" && onClose()}
            >
                {loading ? (
                    <p className="text-center text-gray-400">Loading profile...</p>
                ) : editMode ? (
                    <ProfileEdit
                        profile={profile}
                        userid={userid}
                        onSave={() => {
                            setEditMode(false)
                            loadProfile()
                        }}
                        onCancel={() => setEditMode(false)}
                    />
                ) : (
                    <ProfileView profile={profile} onEdit={() => setEditMode(true)} onClose={onClose} />
                )}
            </div>
        </div>
    )
}
