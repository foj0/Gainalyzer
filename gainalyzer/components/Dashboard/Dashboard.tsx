"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

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

export default function Dashboard() {
    const supabase = createClient();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return;
            }
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
                .eq("user_id", user.id);

            const userLogs = response.data as SupabaseLogResult[] | null; // cast the response as our defined type
            const error = response.error;


            if (error && error.code !== "PGRST116") { // 116 = no rows found
                console.error("Error fetching log:", error);
                return;
            } else if (userLogs) {
                console.log("Raw logs", userLogs)

                // TODO: do I even need to format then? since i have the supabaseLogResult exactly how I wnat it alreazdy
                // Yeah i still do cause the same is ugly without formatting
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


                // const shapedLogs: Log[] = (userLogs as RawLog[]).map((log) => ({
                //     bodyweight: log.bodyweight,
                //     calories: log.calories,
                //     log_date: log.log_date,
                //     log_exercises: (log.log_exercises ?? []).map((ex: RawExercise): Exercise => ({
                //         exercise_id: ex.exercise_id,
                //         weight: ex.weight,
                //         reps: ex.reps,
                //         notes: ex.notes,
                //         exercises: {
                //             name: ex.exercises?.name ?? "", // fallback in case null
                //         },
                //     })),
                // }));

                setLogs(formattedLogs);
                setLoading(false);
            }
        }

        fetchLogs();
    }, [supabase]);

    console.log("logs", logs);

    // useEffect(() => {
    //     async function fetchLogs() {
    //         const { data, error } = await supabase
    //             .from("logs")
    //             .select("log_date, bodyweight, calories")
    //             .order("log_date", { ascending: true });
    //
    //         if (error) {
    //             console.error("Error fetching logs:", error);
    //         } else if (data) {
    //             // Filter out logs without bodyweight if needed
    //             const filtered = data
    //                 .filter((log) => log.bodyweight !== null)
    //                 .map((log) => ({
    //                     log_date: log.log_date,
    //                     bodyweight: log.bodyweight,
    //                     calories: log.calories,
    //                 }));
    //             setLogs(filtered);
    //         }
    //
    //         setLoading(false);
    //     }
    //
    //     fetchLogs();
    // }, [supabase]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Bodyweight</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={logs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="log_date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="bodyweight"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

