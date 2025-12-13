"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import Footer from "../components/Footer";
import AdminCTA from "../components/AdminCTA";
import SuccessNotify from "@/components/SuccessNotify";
import ErrorNotify from "@/components/ErrorNotify";



export default function Home() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("authToken")
        if (token) {
            router.push("/upload")
        } else {
            setIsLoading(false)
        }
    }, [router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-violet-400"></div>
            </div>
        )
    }

    return (
        <>
        {success && <SuccessNotify message={success} />}
        {error && <ErrorNotify message={error} />}
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            <Navbar />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
                <div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <div className="mb-8 inline-block">
                        <span className="px-4 py-2 bg-linear-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-full text-sm font-semibold text-purple-300 backdrop-blur-sm">
                            ✨ Advanced Sentiment Analysis Platform
                        </span>
                    </div>

                    <h1 className="text-7xl font-bold mb-6 bg-linear-to-br from-purple-400 via-violet-400 to-purple-600 bg-clip-text text-transparent animate-slide-in-up">
                        SentimentAI
                    </h1>

                    <p className="text-2xl text-gray-300 mb-4 font-light animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
                        Professional Review Analysis for Your Feedback
                    </p>

                    <p
                        className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-in-up"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Analyze customer reviews, extract actionable insights, and understand sentiment patterns with advanced AI
                        models. 
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
                        <div className="group relative bg-linear-to-br. from-purple-500/10 to-violet-500/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-purple-400/0 to-violet-400/0 group-hover:from-purple-400/5 group-hover:to-violet-400/5 transition-all duration-500"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    📊
                                </div>
                                <h3 className="text-xl font-semibold text-purple-300 mb-3 group-hover:text-purple-200 transition-colors">
                                    Advanced Analytics
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Comprehensive sentiment distribution, aspect analysis, and trend tracking
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-linear-to-br from-violet-500/10 to-pink-500/10 backdrop-blur-md border border-violet-500/20 rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/20 overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-violet-400/0 to-pink-400/0 group-hover:from-violet-400/5 group-hover:to-pink-400/5 transition-all duration-500"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    🤖
                                </div>
                                <h3 className="text-xl font-semibold text-violet-300 mb-3 group-hover:text-violet-200 transition-colors">
                                    Multiple Models
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Switch between Vader, Siebert, and TL Classification models
                                </p>
                            </div>
                        </div>

                        <div className="group relative bg-linear-to-br from-pink-500/10 to-blue-500/10 backdrop-blur-md border border-pink-500/20 rounded-2xl p-8 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/20 overflow-hidden">
                            <div className="absolute inset-0 bg-linear-to-br from-pink-400/0 to-blue-400/0 group-hover:from-pink-400/5 group-hover:to-blue-400/5 transition-all duration-500"></div>
                            <div className="relative z-10">
                                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    💾
                                </div>
                                <h3 className="text-xl font-semibold text-pink-300 mb-3 group-hover:text-pink-200 transition-colors">
                                    Save & Export
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Store analyses and download detailed CSV reports instantly
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                            onClick={() => {
                                setSuccess("Redirecting to login…");      // <-- show toast
                                setTimeout(() => router.push("/login"), 600);   // <-- smooth delay + redirect
                            }}

                        className="px-8 py-4 bg-linear-to-br from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 animate-slide-in-up relative overflow-hidden group"
                        style={{ animationDelay: "0.4s" }}
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-purple-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center gap-2" >
                            Get Started
                            <svg
                                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </button>

                    <div className="mt-6">
                        <AdminCTA />
                    </div>



                    <div
                        className="mt-20 grid grid-cols-3 gap-8 pt-12 border-t border-purple-500/20 animate-slide-in-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                            <p className="text-gray-400">Reviews Analyzed</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-violet-400 mb-2">99%</div>
                            <p className="text-gray-400">Accuracy Rate</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-pink-400 mb-2">3</div>
                            <p className="text-gray-400">AI Models</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
        </>
    )
}
