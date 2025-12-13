"use client"
import { useState, useEffect } from "react"
import ProfileModal from "./components/ProfileModal"

export default function ProfilePage() {
    const [open, setOpen] = useState(true)
    const [userid, setUserid] = useState("")

    useEffect(() => {
        setUserid(localStorage.getItem("userid") || "")
    }, [])

    return (
        <>
            {open && userid && (
                <ProfileModal userid={userid} onClose={() => setOpen(false)} />
            )}
        </>
    )
}
