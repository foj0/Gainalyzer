"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import BodyweightChart from "./BodyweightChart";
import ExerciseBodyweightChart from "./ExercerciseBodyweightChart";

// raw type of what supabase returns
type SupabaseLogResult = {
    log_date: string;
    bodyweight: number | null;
    calories: number | null;
    log_exercises: {
        weight: number | null;
        reps: number | null;
        notes: string | null;
        exercises: {
            name: string;
        };
    }[];
};

// to format the log result
type Exercise = {
    weight: number | null;
    reps: number | null;
    notes: string | null;
    name: string;
}

type Log = {
    bodyweight: number | null;
    calories: number | null;
    log_date: string;
    exercises: Exercise[];
};

type QuickStats = {
    currentBodyweight: number | null;
    avgBodyweight: number | null;
    avgCalories: number | null;
}

export default function Dashboard() {
    const supabase = createClient();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userExercises, setUserExercises] = useState<{ id: string, name: string }[] | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);
        }
        fetchUser();
    }, [supabase])

    useEffect(() => {
        async function fetchUserExercises() {
            if (!user) return;

            const response = await supabase
                .from("exercises")
                .select("id, name")
                .eq("user_id", user.id)

            // console.log("response", response);
            const exercises = response.data;
            setUserExercises(exercises);
        }

        fetchUserExercises();
    }, [supabase, user])

    useEffect(() => {
        async function fetchLogs() {
            if (!user) return;

            // console.log("fetching logs")
            const response = await supabase
                .from("logs")
                .select(`
                            log_date,
                            bodyweight,
                            calories,
                            log_exercises (
                                weight,
                                reps,
                                notes,
                                exercises!inner(name)
                            )
                        `)
                .eq("user_id", user.id)
            // logs returned in oldest -> newest order

            const userLogs = response.data as SupabaseLogResult[] | null; // cast the response as our defined type
            const error = response.error;

            if (error && error.code !== "PGRST116") { // 116 = no rows found
                console.error("Error fetching log:", error);
                return;
            } else if (userLogs) {
                // console.log("Raw logs", userLogs)

                const formattedLogs: Log[] = userLogs.map((log) => (
                    {
                        log_date: log.log_date,
                        bodyweight: log.bodyweight,
                        calories: log.calories,
                        exercises: (log.log_exercises).map((exercise) => (
                            {
                                weight: exercise.weight,
                                reps: exercise.reps,
                                notes: exercise.notes,
                                name: exercise.exercises.name,
                            }
                        )),
                    }
                ));

                setLogs(formattedLogs);
                setLoading(false);
            }
        }

        fetchLogs();
    }, [supabase, user]);

    function calculateAverageBWCals(logs: Log[]) {
        if (!logs || logs.length === 0) {
            return { avgBW: null, avgCal: null };
        }

        // find cutoff date (7 days ago from today)
        const today = new Date();
        const cutoff = new Date();
        cutoff.setDate(today.getDate() - 6); // includes today + 6 days back

        let totalBW = 0;
        let countBW = 0;
        let totalCal = 0;
        let countCal = 0;

        // get the weight and cals for the last 7 days and compute avgs
        for (let i = logs.length - 1; i >= 0; i--) {
            const log = logs[i];
            const d = new Date(log.log_date);

            if (d < cutoff) break; // stop once we’re before cutoff

            if (log.bodyweight != null) {
                totalBW += log.bodyweight;
                countBW++;
            }

            if (log.calories != null) {
                totalCal += log.calories;
                countCal++;
            }
        }

        return {
            avgBW: countBW > 0 ? parseFloat((totalBW / countBW).toFixed(1)) : null,
            avgCal: countCal > 0 ? totalCal / countCal : null
        };
    }

    useEffect(() => {
        let mostRecentLog: Log | undefined;
        let currentBodyweight = null;
        let avgBodyweight = null;
        let avgCalories = null;


        if (logs && logs.length > 0) {
            mostRecentLog = logs[logs.length - 1];
            if (mostRecentLog.bodyweight) {
                currentBodyweight = mostRecentLog.bodyweight;
            }

            const averages = calculateAverageBWCals(logs);
            avgBodyweight = averages.avgBW;
            avgCalories = averages.avgCal;
        }
        setQuickStats(
            {
                currentBodyweight: currentBodyweight ?? null,
                avgBodyweight: avgBodyweight ?? null,
                avgCalories: avgCalories ?? null
            }
        )

    }, [logs])

    if (loading) return <p>Loading...</p>;
    return (
        <div className="flex flex-col w-full">

            <div className="dashboard-section-1 w-full ">
                <div className="flex justify-center text-xl mt-4 ml-4 mb-2">Quick Stats</div>
                <div className="flex flex-col sm:flex-row sm:justify-around gap-4 px-4 py-3 text-md w-full rounded-lg">
                    {/* weight */}
                    <div className="flex sm:flex-col gap-2">
                        <div>Current Weight:</div>
                        <div>{quickStats?.currentBodyweight ?? "N/A"}<span> {quickStats?.currentBodyweight != null ? "lbs" : ""} </span></div>
                    </div>

                    <div className="flex sm:flex-col gap-2">
                        <div>Avg Weight:</div>
                        <div>{quickStats?.avgBodyweight ?? "N/A"}<span> {quickStats?.avgBodyweight != null ? " lbs" : ""} </span></div>
                    </div>

                    {/* cals */}
                    <div className="flex sm:flex-col gap-2">
                        <div>Avg Calories:</div>
                        <div>{quickStats?.avgCalories ?? "N/A"}<span> {quickStats?.avgCalories != null ? " lbs" : ""} </span></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-center mt-10 gap-4">
                <BodyweightChart logs={logs} />
                <ExerciseBodyweightChart logs={logs} userExercises={userExercises} />
            </div>

        </div>
    );
}
