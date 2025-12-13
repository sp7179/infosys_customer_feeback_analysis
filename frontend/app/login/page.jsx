"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const router = useRouter()

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-3xl font-bold text-center mb-2 bg-linear-to-br from-purple-400 to-violet-400 bg-clip-text text-transparent">
                            {isLogin ? "Welcome Back" : "Join SentimentAI"}
                        </h2>
                        <p className="text-center text-gray-400 mb-8">
                            {isLogin ? "Sign in to your account" : "Create a new account"}
                        </p>

                        {isLogin ? (
                            <LoginForm onSuccess={() => router.push("/upload")} />
                        ) : (
                            <RegisterForm onSuccess={() => setIsLogin(true)} />
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                >
                                    {isLogin ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
