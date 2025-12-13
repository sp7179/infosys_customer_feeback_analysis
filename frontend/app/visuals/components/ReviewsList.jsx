"use client";

import { useState } from "react";

export default function ReviewsList({ reviews = [], sentiment_distribution = {} }) {
    const [filter, setFilter] = useState("all");

    const filteredReviews =
        filter === "all" ? reviews : reviews.filter((r) => r.sentiment === filter);

    const getSentimentColor = (sentiment) => {
        switch (sentiment) {
            case "pos":
                return "bg-green-500/10 border-green-500/30 text-green-300";
            case "neg":
                return "bg-red-500/10 border-red-500/30 text-red-300";
            default:
                return "bg-gray-500/10 border-gray-500/30 text-gray-300";
        }
    };

    const getSentimentLabel = (sentiment) => {
        switch (sentiment) {
            case "pos":
                return "Positive";
            case "neg":
                return "Negative";
            default:
                return "Neutral";
        }
    };

    // Extract global distribution
    const posPct = sentiment_distribution?.pos_percent ?? 0;
    const negPct = sentiment_distribution?.neg_percent ?? 0;
    const neuPct = sentiment_distribution?.neu_percent ?? 0;

    // For per-review percentage of its class
    const getClassPercent = (sentiment) => {
        if (sentiment === "pos") return posPct;
        if (sentiment === "neg") return negPct;
        return neuPct;
    };

    return (
        <div>
            {/* Header with Filters + Global Distribution */}
            <div className="flex items-center justify-between gap-4 mb-6">
                {/* Filter Buttons */}
                <div className="flex gap-2">
                    {["all", "pos", "neu", "neg"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                    ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                                    : "bg-white/5 text-gray-400 border border-purple-500/10 hover:bg-white/10"
                                }`}
                        >
                            {f === "all"
                                ? "All"
                                : f === "pos"
                                    ? "Positive"
                                    : f === "neg"
                                        ? "Negative"
                                        : "Neutral"}
                        </button>
                    ))}
                </div>

                {/* Global POS/NEG/NEU summary */}
                <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="text-xs text-gray-400">Global %</div>
                    <div className="flex items-center gap-2">
                        <div className="text-[12px] px-2 py-1 rounded-md bg-green-800/20 text-green-200">
                            Pos {posPct}%
                        </div>
                        <div className="text-[12px] px-2 py-1 rounded-md bg-red-800/20 text-red-200">
                            Neg {negPct}%
                        </div>
                        <div className="text-[12px] px-2 py-1 rounded-md bg-gray-800/20 text-gray-200">
                            Neu {neuPct}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div
                        key={review.id}
                        className="bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 shadow-md transition hover:shadow-lg"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">

                                {/* Beautiful FeedbackID Badge */}
                                <div className="px-2 py-1 rounded-md bg-white/10 text-xs text-gray-300 font-semibold border border-white/20 shadow-sm">
                                    {review.feedback_id}
                                </div>

                                {/* Sentiment Badge */}
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                                        review.sentiment
                                    )}`}
                                >
                                    {getSentimentLabel(review.sentiment)} • {Number(review.vader_pos_pct ?? review.vader_neg_pct ?? review.vader_neu_pct ?? getClassPercent(review.sentiment)).toFixed(2)}%

                                </span>
                            </div>

                            <span className="text-sm text-gray-400">
                                Confidence: {Math.min(100, review.confidence <= 1 ? review.confidence * 100 : review.confidence).toFixed(1)}%
                            </span>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-300 leading-relaxed">
                            {review.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
