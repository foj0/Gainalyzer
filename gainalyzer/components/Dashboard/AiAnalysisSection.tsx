import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Dumbbell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareAiLogs } from "@/utils/prepareAiLogs";

type Exercise = {
    weight: number | null;
    reps: number | null;
    notes: string | null;
    name: string;
}

type Log = {
    bodyweight: number | null;
    calories: number | null;
    protein: number | null;
    log_date: string;
    exercises: Exercise[];
};

type Props = {
    selectedExercise: string;
    logs: Log[];
    dateRange: "7d" | "30d" | "90d" | "180d" | "365d" | "all";
    units: string;
}

export function AiAnalysisSection({ selectedExercise, logs, dateRange, units }: Props) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState(""); // Text that types out gradually
    const [showPrompt, setShowPrompt] = useState(true);

    async function handleAnalyze() {
        setAnalyzing(true);
        setShowPrompt(false);

        // RESET BOTH STATES CLEANLY
        setDisplayedText("");
        setAnalysisText(null);

        // timeout to simulate analysis taking time
        setTimeout(async () => {
            const aiLogs = prepareAiLogs(logs, selectedExercise, dateRange, units);
            console.log("pre", aiLogs);

            const response = await fetch("http://localhost:5151/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    exercise: selectedExercise,
                    logs: aiLogs,
                })
            });

            console.log("Response: ", response);
            const data = await response.json();
            setAnalysisText(data.message);
            setAnalyzing(false);
        }, 2500);
    }

    // typing animation
    useEffect(() => {
        if (!analysisText) return;
        setDisplayedText(""); // reset
        let index = 0;
        let text = "";

        const interval = setInterval(() => {

            // STOP before going out of bounds
            if (index == analysisText.length) {
                clearInterval(interval);
                return;
            }

            text += analysisText[index];
            setDisplayedText(text);
            index++;
        }, 25);

        return () => clearInterval(interval);

    }, [analysisText]);

    // reset the analyze text when a diff exercise is selected
    useEffect(() => {
        setShowPrompt(true);
    }, [selectedExercise])

    return (
        <div className="dashboard-section-1 flex flex-col items-center justify-center text-center p-6 w-full lg:w-1/2">
            <h2 className="text-lg font-semibold mb-2">AI Gains Analysis</h2>
            <Brain className="h-10 w-10 text-blue-500 mb-3" />

            {!analysisText && !analyzing && showPrompt && (
                <div className="text-md text-muted-foreground mb-4">
                    <p>Curious how your training’s going?
                        Let AI analyze your progress on {" "}
                        <span className="font-medium">
                            {selectedExercise || "your selected exercise"}
                        </span> {" "}
                        and give personalized
                        feedback on your strength and bodyweight trends.</p>
                </div>
            )}

            {analyzing && (
                <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <p>Analyzing your data...</p>
                </div>
            )}

            <AnimatePresence>
                {analysisText && (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mt-4 text-sm text-left max-w-sm leading-relaxed"
                    >
                        <div className="inline-flex">
                            <span>{displayedText} <span className="animate-pulse">▋</span>
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!analyzing && (
                <Button variant="gainalyze" onClick={handleAnalyze} className="mt-4">
                    <Dumbbell className="h-10 w-10 text-blue-500" />
                    Gainalyze
                </Button>
            )}

        </div>
    );
}
