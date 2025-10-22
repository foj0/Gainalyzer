"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
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
import { AiAnalysisSection } from "./AiAnalysisSection";
import { Scale, Flame, TrendingUp, Drumstick, Flag, Utensils, Brain, Dumbbell } from "lucide-react"
import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// raw type of what supabase returns
type SupabaseLogResult = {
    log_date: string;
    bodyweight: number | null;
    calories: number | null;
    protein: number | null;
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
    protein: number | null;
    log_date: string;
    exercises: Exercise[];
};

type QuickStats = {
    currentBodyweight: number | null;
    avgBodyweight: number | null;
    calories: number | null;
    protein: number | null;
    date: string | null;
}

type ProgressBarProps = {
    value: number; // 0 to 100
    label?: string;
}

type StrengthPR = {
    ORM: number | null;
    set: { weight: number, reps: number };
}


export default function Dashboard() {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState<string>("");
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);
    const [userExercises, setUserExercises] = useState<{ id: string, name: string }[] | null>(null);

    // info for goals
    const [bodyweightStart, setBodyweightStart] = useState("");
    const [bodyweightGoal, setBodyweightGoal] = useState("");
    const [bwProgDesc, setBwProgDesc] = useState("");
    const [calorieGoal, setCalorieGoal] = useState("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [weightGoal, setWeightGoal] = useState("");
    const [repsGoal, setRepsGoal] = useState("");
    const [strengthPR, setStrengthPR] = useState<StrengthPR | null>(null);
    const goalsRef = useRef(new Map());

    // fetch user
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


    // get all of the users logs and reformat them to our Log type
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
                            protein,
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
                const formattedLogs: Log[] = userLogs.map((log) => (
                    {
                        log_date: log.log_date,
                        bodyweight: log.bodyweight,
                        calories: log.calories,
                        protein: log.protein,
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

    function formatDate(date: Date | undefined) {
        const d = date ?? new Date(); // fallback to today's date if undefined
        const months = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun",
            "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"
        ];
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${month} ${day}, ${year}`;
    }

    // pull info from the most recent log and update quick stats section
    useEffect(() => {
        let mostRecentLog: Log | undefined;
        let currentBodyweight = null;
        let avgBodyweight = null;
        let calories = null;
        let protein = null;
        let date = null;
        let formattedDate = null;


        if (logs && logs.length > 0) {
            mostRecentLog = logs[logs.length - 1];
            if (mostRecentLog.bodyweight) {
                currentBodyweight = mostRecentLog.bodyweight;
            }
            if (mostRecentLog.log_date) {
                date = new Date(mostRecentLog.log_date);
                formattedDate = formatDate(date)
            }

            const averages = calculateAverageBWCals(logs);
            avgBodyweight = averages.avgBW;
            calories = averages.avgCal; // TODO: update to just todays calories
            protein = mostRecentLog.protein;
        }
        setQuickStats(
            {
                currentBodyweight: currentBodyweight ?? null,
                avgBodyweight: avgBodyweight ?? null,
                calories: calories ?? null,
                protein: protein ?? null,
                date: formattedDate ?? null,
            }
        )
        console.log("quickstats current bw: ", quickStats?.currentBodyweight)
        console.log("raw cbw", currentBodyweight)

    }, [logs])

    // get users exercises to pass into chart for selection
    useEffect(() => {
        async function fetchUserExercises() {
            if (!user) return;

            const response = await supabase
                .from("exercises")
                .select("id, name")
                .eq("user_id", user.id)

            const exercises = response.data;
            setUserExercises(exercises);
        }

        fetchUserExercises();
    }, [supabase, user])

    function fetchStrengthPR() {
        const goalExerciseName = userExercises?.find(ex => ex.id === goalsRef.current.get("strength")?.exercise_id)?.name;
        let maxORM = null;
        let bestSet = { weight: 0, reps: 0 };
        for (let log of logs) {
            for (let ex of log.exercises) {
                let estORM
                if (ex.name === goalExerciseName && ex.weight && ex.reps) {
                    estORM = ex.weight / (1.0278 - 0.0278 * ex.reps);
                    if (maxORM === null || estORM > maxORM) {
                        maxORM = estORM;
                        bestSet = { weight: ex.weight, reps: ex.reps };
                    }
                    break; // there won't be more than 1 of this exercise per log
                }
            }
        }

        if (maxORM != null) {
            setStrengthPR({ ORM: maxORM, set: bestSet });
        }
    }

    useEffect(() => {
        async function fetchUserGoals() {
            if (!user) return;

            const { data: goals, error } = await supabase
                .from("goals")
                .select("type, target_value, exercise_id, target_weight, target_reps, start_bodyweight")
                .eq("user_id", user.id)

            if (error) {
                console.error("Error fetching goals:", error.message);
                return;
            }

            if (goals) {
                const goalMap = new Map();
                goals.forEach((goal) => {
                    goalMap.set(goal.type, goal);
                });

                goalsRef.current = goalMap
                console.log("goalmap", goalMap);


                const bwStart = goalMap.get("bodyweight")?.start_bodyweight ?? "";
                const bwGoal = goalMap.get("bodyweight")?.target_value ?? "";
                setBodyweightStart(bwStart);
                setBodyweightGoal(bwGoal);
                setCalorieGoal(goalMap.get("calories")?.target_value ?? "");
                setSelectedExerciseId(goalMap.get("strength")?.exercise_id);
                setWeightGoal(goalMap.get("strength")?.target_weight ?? "");
                setRepsGoal(goalMap.get("strength")?.target_reps ?? "");

                if (bwStart != "" && bwGoal != "") {
                    const bodyweightProgress = Number(bwStart) - Number(quickStats?.currentBodyweight);
                    console.log("currentBW: ", quickStats?.currentBodyweight);
                    let bodyweightProgressDesc = ""
                    if (bodyweightProgress <= 0) {
                        bodyweightProgressDesc = `+${Math.abs(bodyweightProgress).toFixed(1)} lbs from starting weight`
                    } else {
                        bodyweightProgressDesc = `-${Math.abs(bodyweightProgress).toFixed(1)} lbs from starting weight`
                    }
                    setBwProgDesc(bodyweightProgressDesc);
                }
            }
        }

        fetchUserGoals();
        fetchStrengthPR();
    }, [user, quickStats])


    function ProgressBar({ value, label }: ProgressBarProps) {
        console.log("value: ", value)
        const val = value * 100;
        console.log("val: ", val)
        return (
            <div className="w-full bg-gray-800 rounded-full h-4 relative">
                <div className={`bg-blue-500 rounded-full h-4`}
                    style={{ width: `${val}%` }}
                >
                </div>
                <span className="absolute text-xs top-0 right-5">{label} lbs</span>

            </div >
        );
    }


    if (loading) return <p>Loading...</p>;
    return (
        <div className="flex flex-col w-full gap-6">

            <HelloSection fullName={fullName} />

            <div className="flex flex-col gap-4">
                {/* Quickstats Section */}
                <div className="dashboard-section">
                    <h2 className="text-lg font-semibold mb-1">Today's Stats</h2>
                    {/* Mobile: 2x2 grid; Desktop: flex row */}
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:gap-6 flex-1">

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Scale className="text-blue-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Current Weight</h3>
                                <p className="text-lg font-medium">
                                    {quickStats?.currentBodyweight ?? "N/A"}
                                    <span> {quickStats?.currentBodyweight != null ? "lbs" : ""} </span>
                                </p>
                                {
                                    quickStats?.currentBodyweight != null ?
                                        <p className="text-sm font-light text-gray-500">as of {quickStats?.date}</p>
                                        :
                                        <></>
                                }
                            </div>
                        </div>

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <TrendingUp className="text-green-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Avg Weight</h3>
                                <p className="text-lg font-medium">
                                    {quickStats?.avgBodyweight ?? "N/A"}
                                    <span> {quickStats?.avgBodyweight != null ? "lbs" : ""} </span>
                                </p>
                                {
                                    quickStats?.avgBodyweight != null ?
                                        <p className="text-sm font-light text-gray-500">last 7 days</p>
                                        :
                                        <p className="text-sm font-light text-gray-500">missing log info</p>
                                }
                            </div>
                        </div>


                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Flame className="text-orange-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Avg Calories</h3>
                                <p className="text-lg font-medium">
                                    {quickStats?.calories ?? "N/A"}
                                    <span> {quickStats?.calories != null ? "kcal" : ""} </span>
                                </p>
                                {
                                    quickStats?.calories != null ?
                                        <p className="text-sm font-light text-gray-500">last 7 days</p>
                                        :
                                        <p className="text-sm font-light text-gray-500">missing log info</p>
                                }
                            </div>
                        </div>

                        <div className="dashboard-section-1 flex items-center gap-3 p-4 flex-1">
                            <Drumstick className="text-purple-500 w-6 h-6" />
                            <div>
                                <h3 className="text-sm font-semibold">Today's Protein</h3>
                                <p className="text-lg font-medium">
                                    {quickStats?.protein ?? "N/A"}
                                    <span> {quickStats?.protein != null ? "g" : ""} </span>
                                </p>
                                {
                                    quickStats?.protein == null ?
                                        <p className="text-sm font-light text-gray-500">missing log info</p>
                                        :
                                        <></>
                                }
                            </div>
                        </div>

                    </div>
                </div>


                {/* Goals Section */}
                <div className="dashboard-section">

                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold mb-1">Goals</h2>
                        <Link
                            href="/goals"
                            className="px-2 rounde d-md underline hover:cursor-pointer"
                        >
                            Set goals
                        </Link>
                    </div>
                    <div className="dashboard-section flex flex-col gap-4 sm:flex-row sm:gap-6">

                        {/* Bodyweight Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1/3 p-4 min-h-[200px]">
                            {(goalsRef.current.get("bodyweight")?.target_value != null &&
                                goalsRef.current.get("bodyweight")?.target_value != 0)
                                ?
                                <>
                                    <h3 className="text-lg font-semibold mb-3">Bodyweight Goal</h3>

                                    <div className="flex flex-col flex-1 ">
                                        <div className="flex justify-between">
                                            <p className="text-sm mb-2">Start: {bodyweightStart} lbs</p>
                                            <p className="text-sm mb-2">Goal: {bodyweightGoal} lbs</p>
                                        </div>
                                        <ProgressBar value={(Number(quickStats?.currentBodyweight) / Number(bodyweightGoal))} label={Number(quickStats?.currentBodyweight).toFixed(1)} />
                                        <p className="text-sm mt-1 text-gray-400">{bwProgDesc}</p>
                                        <p className="text-sm mt-1 text-gray-400">{(Number(bodyweightGoal) - Number(quickStats?.currentBodyweight)).toFixed(1)} lbs to go!</p>
                                    </div>
                                </>
                                :
                                <div className="flex flex-1 items-center">
                                    <p className="text-center text-gray-400">You haven't set your bodyweight goal yet</p>
                                </div>
                            }
                        </div>

                        {/* Daily Calories Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1/3 p-4 min-h-[200px]">
                            {(goalsRef.current.get("calories")?.target_value != null &&
                                goalsRef.current.get("calories")?.target_value != 0)

                                ?

                                <>
                                    <h3 className="text-lg font-semibold mb-3">Daily Calorie Goal</h3>
                                    <div className="flex flex-1 justify-center items-center gap-8 sm:gap-8">
                                        <div className="flex w-30 items-center mb-4">
                                            <CircularProgressbarWithChildren minValue={0} maxValue={goalsRef.current.get("calories")?.target_value ?? 0} value={quickStats?.calories ?? 0}
                                                styles={buildStyles({
                                                    pathColor: '#3b82f6',   // filled (progress) part — Tailwind blue-500
                                                    trailColor: '#1e2939',  // unfilled / empty ring — your desired gray
                                                    textColor: '#e5e7eb',
                                                })}
                                            >
                                                <div style={{ fontSize: 12, marginTop: -5 }}>
                                                    <div className="flex flex-col text-center">
                                                        <strong className="text-lg">{((goalsRef.current.get("calories")?.target_value - ((quickStats?.calories) ?? 0)))}</strong>
                                                        <p className="">remaining</p>
                                                    </div>
                                                </div>
                                            </CircularProgressbarWithChildren>
                                        </div>
                                        <div className="flex flex-col justify-around gap-3">
                                            <div className="flex gap-3">
                                                <Flag className="w-6 h-6 text-orange-400" />
                                                <div>
                                                    <h3 className="text-base font-semibold">Goal</h3>
                                                    <p className="text-base font-medium">{goalsRef.current.get("calories")?.target_value ?? 0}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Utensils className="w-6 h-6 text-blue-400" />
                                                <div>
                                                    <h3 className="text-base font-semibold">Food</h3>
                                                    <p className="text-base font-medium">{(quickStats?.calories ?? 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>

                                :

                                <div className="flex flex-1 items-center">
                                    <p className="text-center text-gray-400">You haven't set your daily calorie goal yet</p>
                                </div>
                            }
                        </div>

                        {/* Strength Goal */}
                        <div className="dashboard-section-1 flex flex-col flex-1/3 p-4 bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-800 min-h-[200px]">
                            {(goalsRef.current.get("strength")?.target_weight != null &&
                                goalsRef.current.get("strength")?.target_weight != 0)
                                ? (
                                    <>
                                        <h3 className="text-lg font-semibold mb-3 tracking-wide">
                                            Strength Goal
                                        </h3>

                                        <div className="flex flex-col gap-2 text-gray-200">
                                            {/* Exercise Info */}
                                            <div className="flex justify-between items-center">
                                                <p className="font-medium text-base">
                                                    {userExercises?.find(ex => ex.id === goalsRef.current.get("strength")?.exercise_id)?.name}
                                                </p>
                                                <p className="text-sm text-gray-400 italic">
                                                    Goal Set
                                                </p>
                                            </div>

                                            {/* Target */}
                                            <div className="flex justify-between text-sm">
                                                <p className="text-gray-400">
                                                    Target:
                                                </p>
                                                <p className="font-semibold text-gray-100">
                                                    {goalsRef.current.get("strength")?.target_weight} lbs × {goalsRef.current.get("strength")?.target_reps} reps
                                                </p>
                                            </div>

                                            {/* Goal 1RM */}
                                            <div className="flex justify-between text-sm border-b border-zinc-800 pb-2 mb-2">
                                                <p className="text-gray-400">Estimated 1RM</p>
                                                <p className="font-semibold">
                                                    {(goalsRef.current.get("strength")?.target_weight / (1.0278 - 0.0278 * goalsRef.current.get("strength")?.target_reps)).toFixed(0)} lbs
                                                </p>
                                            </div>

                                            {/* PR Section */}
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm text-gray-400">{strengthPR != null ? "Your Best Set" : null}</p>

                                                {strengthPR != null ? (
                                                    <div className="flex justify-between items-center bg-zinc-800/50 px-3 py-2 rounded-lg border border-zinc-700">
                                                        <div>
                                                            <p className="text-sm text-gray-200">
                                                                {strengthPR.set.weight} lbs × {strengthPR.set.reps} reps
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Est. 1RM: <span className="text-gray-100 font-medium">{(strengthPR.ORM ?? 0).toFixed(0)} lbs</span>
                                                            </p>
                                                        </div>

                                                        {/* Small progress ring style indicator */}
                                                        <div className="font-bold text-sm">
                                                            {Math.min(100, ((strengthPR.ORM ?? 0) /
                                                                (goalsRef.current.get("strength")?.target_weight / (1.0278 - 0.0278 * goalsRef.current.get("strength")?.target_reps)) * 100)
                                                            ).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic text-center py-2">
                                                        No PR set yet
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )
                                : (
                                    <div className="flex flex-1 items-center justify-center text-gray-500 italic">
                                        You haven’t set your strength goal yet
                                    </div>
                                )
                            }
                        </div>

                    </div>

                </div>

                {/*Chart and analysis section*/}
                <div className="flex flex-col gap-6 ">
                    <div className="dashboard-section">
                        <h2 className="text-lg font-semibold mb-1">Progress and Analysis</h2>
                        <div className="flex flex-col lg:flex-row justify-center gap-6">
                            {/* <BodyweightChart logs={logs} /> */}
                            <ExerciseBodyweightChart logs={logs} userExercises={userExercises} />

                            <AiAnalysisSection selectedExercise={"Bench Press"} />

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

            </div>
        </div>
    );
}
