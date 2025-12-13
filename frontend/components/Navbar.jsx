import { useRouter } from "next/navigation"

export default function Navbar() {
    const router = useRouter()

    return (
        <nav className="bg-white/5 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.push("/")}
                    className="text-2xl font-bold bg-linear-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                    SentimentAI
                </button>

                <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2 bg-linear-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                >
                    Login
                </button>
                
            </div>
        </nav>
    )
}