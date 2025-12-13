export default function UploadLoader() {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-violet-600 rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-slate-900 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-violet-600 rounded-full animate-pulse"></div>
                </div>
            </div>
            <h3 className="text-2xl font-bold text-purple-300 mb-2">Analyzing Feedback</h3>
            <p className="text-gray-400 text-center max-w-md">
                Our AI is processing your reviews and extracting sentiment insights...
            </p>
            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
        </div>
    )
}
