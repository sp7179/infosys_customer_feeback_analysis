"use client"
import { useRef, useState } from "react"

export default function ImageUploader({ userid, currentPhoto, onPhotoChange }) {
    const inputRef = useRef()
    const [preview, setPreview] = useState(currentPhoto)
    const [uploading, setUploading] = useState(false)

    const handleFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
        setUploading(true)

        const form = new FormData()
        form.append("file", file)

        const res = await fetch(`/api/profile/upload/${userid}`, { method: "POST", body: form })
        const data = await res.json()
        if (res.ok && data.photo) onPhotoChange(data.photo)
        setUploading(false)
    }

    return (
        <div className="flex flex-col items-center">
            <img
                src={preview || "/default-avatar.png"}
                alt="preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-purple-400"
            />
            <button
                type="button"
                onClick={() => inputRef.current.click()}
                className="mt-2 text-sm text-purple-400 hover:text-purple-300"
            >
                {uploading ? "Uploading..." : "Change Photo"}
            </button>
            <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>
    )
}
