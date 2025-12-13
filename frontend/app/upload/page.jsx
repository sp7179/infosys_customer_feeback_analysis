"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import UploadNavbar from "./components/UploadNavbar"
import UploadForm from "./components/UploadForm"
import Footer from "../../components/Footer";

export default function UploadPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (!token) {
            router.push("/login")
        } else {
            setIsAuthenticated(true)
        }
    }, [router])

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-violet-400"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
            <UploadNavbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2 bg-linear-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                        Upload Feedback
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Upload your CSV or TXT file containing customer reviews for sentiment analysis
                    </p>

                    <UploadForm />
                </div>
            </div>
            <Footer />
        </div>
    )
}
