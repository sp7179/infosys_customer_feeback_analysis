"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SentimentChart from "./charts/SentimentChart"
import AspectSentiment from "./charts/AspectSentiment"
import TrendChart from "./charts/TrendChart"
import KeywordCloud from "./charts/KeywordCloud"
import ConfidenceHistogram from "./charts/ConfidenceHistogram"
import ReviewsList from "./ReviewsList"
import DownloadButton from "./DownloadButton"
import ParticleBackground from "./charts/ParticleBackground"
import TopIssues from "./charts/TopIssues"
import SuggestionsVisual from "./charts/SuggestionsVisual"
import SmallAspectComparison from "./charts/SmallAspectComparison";
import SmallIssueSuggestionComparison from "./charts/SmallIssueSuggestionComparison";


export default function VisualDisplay({ visual }) {
    

    // Load visual data from localStorage
    const [activeTab, setActiveTab] = useState("overview")

    if (!visual) {
        return (
            <div className="flex h-full items-center justify-center text-purple-400 text-lg font-semibold">
                Loading visualization data...
            </div>
        )
    }

    const result = visual.result || {}
    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "reviews", label: "Reviews", icon: "📝" },
        { id: "aspects", label: "Aspects", icon: "🎯" },
        { id: "trends", label: "Trends", icon: "📈" },
        { id: "keywords", label: "Keywords", icon: "🏷️" },
        { id: "topissues", label: "Top Issues", icon: "⚠️" },
        { id: "suggestions", label: "Suggestions", icon: "💡" }
    ]

    return (
        <div className="h-full flex flex-col relative bg-linear-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
            {/* PARTICLE BACKGROUND */}
            <ParticleBackground />

            {/* HEADER */}
            <motion.div
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="p-6 backdrop-blur-lg bg-white/5 border-b border-purple-500/20 shadow-xl z-10"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-4xl font-extrabold bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
                            {visual.name}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Model: <span className="text-purple-300 font-medium">{visual.model}</span> • Reviews:{" "}
                            <span className="text-purple-300 font-medium">{visual.review_count}</span> • Created:{" "}
                            {new Date(visual.created_at).toLocaleString()}
                        </p>
                    </div>
                    <DownloadButton visual={visual} />
                </div>

                {/* TABS */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap backdrop-blur-sm ${activeTab === tab.id
                                    ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* CONTENT */}
            <div className="flex-1 overflow-auto p-6 relative z-10">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW */}
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* left column: sentiment + confidence */}
                            <div className="space-y-6">
                                {result.sentiment_distribution && (
                                    <SentimentChart data={result.sentiment_distribution} />
                                )}
                                {result.confidence_overview && (
                                    <ConfidenceHistogram data={result.confidence_overview} />
                                )}
                            </div>

                            {/* right column: two compact visuals */}
                            <div className="space-y-6">
                                <SmallAspectComparison data={result.aspect_sentiment} />
                                <SmallIssueSuggestionComparison
                                    issues={result.top_issues}
                                    suggestions={result.suggestions}
                                />
                            </div>
                        </motion.div>
                    )}


                    {/* REVIEWS */}
                    {activeTab === "reviews" && (
                        <motion.div
                            key="reviews"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {result?.per_review_summary?.length > 0 ? (
                                <ReviewsList reviews={result.per_review_summary} sentiment_distribution={result.sentiment_distribution} />
                            ) : (
                                <p className="text-gray-400 text-center mt-6">
                                    No reviews available.
                                </p>
                            )}
                        </motion.div>
                    )}

                    {/* ASPECTS */}
                    {activeTab === "aspects" && (
                        <motion.div
                            key="aspects"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        staggerChildren: 0.15,
                                        duration: 0.5,
                                    }
                                }
                            }}
                            className="w-full"
                        >
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                {result.aspect_sentiment && (
                                    <AspectSentiment data={result.aspect_sentiment} />
                                )}
                            </motion.div>
                        </motion.div>
                    )}


                    {/* TRENDS */}
                    {activeTab === "trends" && (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {result.trend_over_time ? (
                                <TrendChart data={result.trend_over_time} />
                            ) : (
                                <p className="text-gray-400 text-center mt-6">
                                    Trend data not available.
                                </p>
                            )}
                        </motion.div>
                    )}
                    {/* SUGGESTIONS */}
                    {activeTab === "suggestions" && (
                        <motion.div
                            key="suggestions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.45 }}
                            className="w-full"
                        >
                            <SuggestionsVisual data={result.suggestions} impactScore={result.impact_score} />
                        </motion.div>
                    )}

                    {/* KEYWORDS */}
                    {activeTab === "keywords" && (
                        <motion.div
                            key="keywords"
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                show: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        staggerChildren: 0.15,
                                        duration: 0.5,
                                    }
                                }
                            }}
                            className="flex flex-col gap-6"
                        >
                            {/* Wordcloud */}
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                                {result.wordcloud_data ? (
                                    <KeywordCloud data={result.wordcloud_data} />
                                ) : (
                                    <p className="text-gray-400 text-center mt-6">
                                        No keyword data available.
                                    </p>
                                )}
                            </motion.div>

                            

                            
                        </motion.div>
                    )}

                    {/* TOP ISSUES TAB */}
                    {activeTab === "topissues" && (
                        <motion.div
                            key="topissues"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-6"
                        >
                            <TopIssues data={result.top_issues} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
