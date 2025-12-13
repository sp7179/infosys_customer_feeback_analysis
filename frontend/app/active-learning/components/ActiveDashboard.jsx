"use client"

import { useEffect, useState } from "react"
import PerformanceCharts from "./PerformanceCharts"
import ConfidenceGauge from "./ConfidenceGauge"
import ClassPercents from "./ClassPercents"
import ConfidenceHistogram from "./ConfidenceHistogram"
import ConfusionMatrix from "./ConfusionMatrix"
import PRCurve from "./PRCurve"
import VersionTrend from "./VersionTrend"
import UncertainSamplesTable from "./UncertainSamplesTable"
import UploadRetrain from "./UploadRetrain"
import RetrainModal from "./RetrainModal"
import FeedbackFlow from "./FeedbackFlow"
import ActiveSidebar from "./ActiveSidebar";
import ActiveContentSwitcher from "./ActiveContentSwitcher";




export default function ActiveDashboard() {
    const [metrics, setMetrics] = useState(null)
    const [confMatrix, setConfMatrix] = useState(null)
    const [confidenceDist, setConfidenceDist] = useState(null)
    const [prCurve, setPrCurve] = useState(null)
    const [versions, setVersions] = useState([])
    const [uncertain, setUncertain] = useState([])
    const [jobId, setJobId] = useState(null)
    const [section, setSection] = useState("overview");


    const loadData = async () => {
        const [m, cm, cd, pr, vt, us] = await Promise.all([
            fetch("/api/active-learning/latest").then(r => r.json()),
            fetch("/api/active-learning/confusion").then(r => r.json()),
            fetch("/api/active-learning/confidence-dist").then(r => r.json()),
            fetch("/api/active-learning/pr-curve").then(r => r.json()),
            fetch("/api/active-learning/version-trend").then(r => r.json()),
            fetch("/api/active-learning/uncertain").then(r => r.json()),
        ])

        setMetrics(m)
        setConfMatrix(cm)
        setConfidenceDist(cd)
        setPrCurve(pr)
        setVersions(vt)
        setUncertain(us)
    }

    useEffect(() => {
        loadData()
        

    }, [])

    return (
        <div className="flex gap-6 w-full mt-8">
            {/* --- NEW CLEAN DASHBOARD LAYOUT WITH SIDEBAR + SWITCHER --- */}

            

                {/* LEFT SIDEBAR */}
            {section !== "feedback" && (
                <ActiveSidebar active={section} onChange={setSection} />
            )}


                {/* RIGHT CONTENT */}
                <div className="flex-1">
                    <ActiveContentSwitcher
                        section={section}
                        components={{

                            /* =======================
                               OVERVIEW SEGMENT
                            ======================== */
                            overview: (
                                metrics && (
                                    <div className="space-y-12 mt-8">

                                        {/* Row 1: Full width performance */}
                                        <PerformanceCharts metrics={metrics} />

                                        
                                    </div>
                                )
                            ),


                            /* =======================
                               CLASS PERCENTS SEGMENT
                            ======================== */
                            classpercents: (
                                metrics && (
                                    <div className="grid grid-cols-1 place-items-center mt-10 padding-box">

                                        <div className="flex justify-center mt-32">

                                            <ConfidenceGauge value={metrics.metrics.confidence || metrics.metrics.f1} />
                                        </div>

                                    



                                    </div>
                                )
                            ),



                            /* =======================
                               CONFUSION SEGMENT
                            ======================== */
                            confusion: (
                                confMatrix && (
                                    <ConfusionMatrix labels={confMatrix.labels} matrix={confMatrix.matrix} />
                                )
                            ),

                            /* =======================
                               DISTRIBUTION SEGMENT
                            ======================== */
                            distribution: (
                                confidenceDist && (
                                    <ConfidenceHistogram
                                        bins={confidenceDist.bins}
                                        counts={confidenceDist.counts}
                                        pctBelow={confidenceDist.pct_below_0_5}
                                    />
                                )
                            ),

                            /* =======================
                               PRECISION-RECALL SEGMENT
                            ======================== */
                            prcurve: (
                                prCurve && <PRCurve curves={prCurve} />
                            ),

                            /* =======================
                               VERSION TREND SEGMENT
                            ======================== */
                            versions: (
                                versions && <VersionTrend versions={versions} />
                            ),

                            /* =======================
                               UNCERTAIN SAMPLES SEGMENT
                            ======================== */
                            uncertain: (
                                uncertain && <UncertainSamplesTable samples={uncertain} />
                            ),

                            /* =======================
                               RETRAIN SEGMENT (NEW)
                            ======================== */
                            retrain: (
                                <div className="mt-10">
                                    <UploadRetrain onStart={(job) => setJobId(job)} />
                                </div>
                            ),

                            /* =======================
                               FEEDBACK INPUT SEGMENT
                            ======================== */
                        feedback: <FeedbackFlow onOpenDashboard={() => { sessionStorage.setItem("ACTIVE_SECTION", "retrain"); setSection("retrain"); }} />

                        }}
                    />
                </div>
            

            {/* Retrain modal remains globally active */}
            {jobId && <RetrainModal jobId={jobId} onClose={() => setJobId(null)} />}

        </div>
    )

}
