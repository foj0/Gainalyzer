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
import HelloSection from "./HelloSection";
import ExerciseBodyweightChart from "./ExercerciseBodyweightChart";
import { Scale, Flame, TrendingUp, Drumstick, Flag, Utensils } from "lucide-react"
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
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
    const [fullName, setFullName] = useState<string>("");

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);
            const userFullName = user?.identities
                ?.find((identity) => identity.identity_data?.full_name)
                ?.identity_data?.full_name || "User";
            setFullName(userFullName);
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
        console.log(user);
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
        <div className="flex flex-col w-full gap-6">

            <HelloSection fullName={fullName} />


            {/* <div className="flex justify-center text-xl mt-4 ml-4 mb-2">Quick Stats</div> */}
            {/* <div className="flex flex-col sm:flex-row sm:justify-around px-4 py-3 text-md w-full rounded-lg"> */}
            {/* <div className="flex sm:flex-col gap-2"> */}
            {/*     <div>Current Weight:</div> */}
            {/*     <div>{quickStats?.currentBodyweight ?? "N/A"}<span> {quickStats?.currentBodyweight != null ? "lbs" : ""} </span></div> */}
            {/* </div> */}

            {/* <div className="flex sm:flex-col gap-2"> */}
            {/*     <div>Avg Weight:</div> */}
            {/*     <div>{quickStats?.avgBodyweight ?? "N/A"}<span> {quickStats?.avgBodyweight != null ? " lbs" : ""} </span></div> */}
            {/* </div> */}
            {/*     <div className="flex sm:flex-col gap-2"> */}
            {/*         <div>Avg Calories:</div> */}
            {/*         <div>{quickStats?.avgCalories ?? "N/A"}<span> {quickStats?.avgCalories != null ? " lbs" : ""} </span></div> */}
            {/*     </div> */}
            {/* </div> */}

            <div className="flex flex-col gap-6">
                {/* Quickstats Section */}
                <div className="dashboard-section">
                    <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                    {/* Mobile: 2x2 grid; Desktop: flex row */}
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:gap-6 flex-1">

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Scale className="text-blue-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Current Weight</h3>
                                <p className="text-lg font-medium">175 lbs</p>
                                <p className="text-sm font-light text-gray-500">as of Oct 10, 2025</p>
                            </div>
                        </div>

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <TrendingUp className="text-green-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Avg Weight</h3>
                                <p className="text-lg font-medium">174.3 lbs</p>
                                <p className="text-sm font-light text-gray-500">for the last 7 days</p>
                            </div>
                        </div>


                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Flame className="text-orange-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Today's Calories</h3>
                                <p className="text-lg font-medium">2,300 kcal</p>
                            </div>
                        </div>

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Drumstick className="text-purple-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Today's Protein</h3>
                                <p className="text-lg font-medium">140g</p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Goals Section */}
                <div className="dashboard-section">
                    <h2 className="text-lg font-semibold mb-2">Goals</h2>
                    <div className="dashboard-section flex flex-col gap-4 sm:flex-row sm:gap-6">
                        {/* Bodyweight Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1 p-4">
                            <h3 className="text-lg font-medium mb-1">Bodyweight Goal</h3>
                            <p className="text-sm text-gray-500 mb-2">Goal: 190 lbs</p>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div className="bg-blue-500 h-full w-[60%]" />
                            </div>
                            <p className="text-xs mt-1 text-gray-600">+5 lbs gained / 5 lbs left</p>
                        </div>

                        {/* Daily Calories Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1 p-4">
                            <h3 className="text-lg font-medium mb-3">Daily Calorie Goal</h3>
                            <div className="flex justify-between items-center">
                                <div className="w-35 flex items-center ml-5">
                                    <CircularProgressbarWithChildren minValue={0} maxValue={2500} value={2150}>
                                        <div style={{ fontSize: 12, marginTop: -5 }}>
                                            <strong>2150 kcal</strong>
                                        </div>
                                    </CircularProgressbarWithChildren>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <Flag className="text-blue-500 w-6 h-6" />
                                        <div>
                                            <h3 className="text-sm font-semibold">Goal</h3>
                                            <p className="text-lg font-medium">2500</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Utensils className="text-blue-500 w-6 h-6" />
                                        <div>
                                            <h3 className="text-sm font-semibold">Remaining</h3>
                                            <p className="text-lg font-medium">150</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exercise Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1 p-4">
                            <h3 className="text-lg font-medium mb-1">Exercise Goal</h3>
                            <p className="text-sm text-gray-500 mb-2">Bench 225 × 1</p>
                            <p className="text-xs text-gray-600">Closest: 205 × 3 (est. 230)</p>
                        </div>
                    </div>
                </div>

                {/* Add Goals Button */}
                {/* <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 mt-2 self-start"> */}
                {/*     Add Goals */}
                {/* </button> */}

            </div>

            <div className="flex flex-col gap-6 ">
                <div className="dashboard-section">
                    <h2 className="text-lg font-semibold mb-2">Progress and Analysis</h2>
                    <div className="flex flex-col lg:flex-row justify-center gap-6">
                        {/* <BodyweightChart logs={logs} /> */}
                        <ExerciseBodyweightChart logs={logs} userExercises={userExercises} />


                        <div className="dashboard-section-1 w-5/10 p-4">
                            AI Analysis of bodyweight and exercise progress.
                            Have some AI related image, and a big button and header
                            saying click to analyze results.
                        </div>

                    </div>
                </div>
            </div>

            {/* <div className="flex flex-col lg:flex-row justify-center gap-6"> */}
            {/*     <div className="dashboard-section-1 w-4/10 h-100"> */}
            {/*         table carousel of exercise logs */}
            {/*         one at a time */}
            {/*     </div> */}
            {/*     <div className="dashboard-section-1 w-6/10"> */}
            {/*         daily calorie chart over the past 7 days */}
            {/*         or some other bar chart. */}
            {/*     </div> */}
            {/* </div> */}

        </div >
    );
}
