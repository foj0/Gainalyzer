import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Dumbbell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiAnalysisSection({ selectedExercise }: { selectedExercise: string | null }) {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState(""); // Text that types out gradually

    async function handleAnalyze() {
        setAnalyzing(true);
        setAnalysisText(null);
        setDisplayedText("");

        // simulate API delay (replace with actual AI call)
        await new Promise((r) => setTimeout(r, 2000));

        // Example response — replace with AI output
        const response = `Your ${selectedExercise || "exercise"} performance is trending upward. 
       You've steadily increased your estimated 1RM over the last 4 weeks while keeping bodyweight stable. 
       Keep adding small progressive overloads each session. 💪`;

        setAnalysisText(response);
        setAnalyzing(false);
    }

    // typing animation
    useEffect(() => {
        if (!analysisText) return;

        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + analysisText[index]);
            index++;
            if (index >= analysisText.length) clearInterval(interval);
        }, 25); // speed in ms between characters

        return () => clearInterval(interval);
    }, [analysisText]);

    return (
        <div className="dashboard-section-1 flex flex-col items-center justify-center text-center p-6 w-full lg:w-1/2">
            <h2 className="text-lg font-semibold mb-2">AI Gains Analysis</h2>
            <Brain className="h-10 w-10 text-blue-500 mb-3" />

            {!analysisText && !analyzing && (
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



            {/*TODO: Add a "Regenerate Analysis button after text finishes"*/}
            {!analyzing && (
                <Button variant="gainalyze" onClick={handleAnalyze}>
                    <Dumbbell className="h-10 w-10 text-blue-500" />
                    Gainalyze
                </Button>
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
                        {displayedText}
                        <span className="animate-pulse">▋</span> {/* typing cursor */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
