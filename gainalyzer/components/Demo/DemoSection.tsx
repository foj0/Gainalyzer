'use client'
import { useState, useEffect } from "react";
import DemoChart from "./DemoChart";
import { Exercise, Log, ExerciseLog, ChartData, demoLogs as logs, demoExercises as userExercises } from '@/utils/demoData';


// export default function DemoChart({ logs, userExercises, units, dateRange, setDateRange, selectedExercise, setSelectedExercise }: Props) {

export default function DemoSection() {
    // selections for the chart and ai-analysis
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "180d" | "365d" | "all">("all");
    const [selectedExercise, setSelectedExercise] = useState<string>("");
    return (
        <DemoChart
            logs={logs}
            userExercises={userExercises}
            units={"lbs"} dateRange={dateRange}
            setDateRange={setDateRange}
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
        />
    );
}

