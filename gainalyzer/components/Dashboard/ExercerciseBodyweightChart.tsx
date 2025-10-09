import { useMemo, useCallback, useEffect, useState } from "react";
import { ResponsiveContainer, Legend, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, TooltipProps, TooltipContentProps } from "recharts";
import { Select } from "@radix-ui/react-select";
import ExerciseSelect from "./ExerciseSelect";

type Exercise = {
    weight: number | null;
    reps: number | null;
    notes: string | null;
    name: string;
}

// Log type that we're given as a prop
type Log = {
    bodyweight: number | null;
    log_date: string;
    exercises: Exercise[];
};

// Log type once we process for the selected exercise. Only contains info for the exercise we want.
type ExerciseLog = {
    bodyweight: number | null;
    log_date: string;
    exercise_name: string | null;
    weight: number | null;
    reps: number | null;
    strength: number | null; // estimated 1RM
    // on hover over the data point it should show the weight and reps
}

interface ChartData {
    filledLogs: ExerciseLog[];
    xTicks: string[];
    bwDomain: { bwMin: number; bwMax: number };
    exDomain: { exMin: number; exMax: number };
    yTickCount: number;
}

export default function ExerciseBodyweightChart({ logs, userExercises }: { logs: Log[], userExercises: { id: string, name: string }[] | null }) {
    const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "180d" | "365d" | "all">("all");
    const [selectedExercise, setSelectedExercise] = useState<string>("");
    const [isMobile, setIsMobile] = useState(false);

    // set selectedExercise as the most recently logged exercise
    useEffect(() => {
        if (!selectedExercise && logs.length > 0) {
            for (let i = logs.length - 1; i >= 0; i--) {
                const exercises = logs[i].exercises;
                if (exercises.length > 0) {
                    setSelectedExercise(exercises[exercises.length - 1].name);
                    break;
                }
            }
        }
    }, [logs, selectedExercise]); // only run when logs change, or basically just on mount

    // Check if windowsize is mobile size on mount and resize
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const handleResize = () => setIsMobile(window.innerWidth < 640);

        // on window resize, after stopped resizing for 100ms call handleResize. So we don't spam it.
        const debouncedResize = () => {
            clearTimeout(timer);          // cancel previous pending call
            timer = setTimeout(handleResize, 100); // schedule new call
        };

        window.addEventListener("resize", debouncedResize);

        // call once immediately on mount
        handleResize();

        // cleanup
        return () => {
            window.removeEventListener("resize", debouncedResize);
            clearTimeout(timer);
        };
    }, []);

    // 🔹 All chart data computed
    const chartData = useMemo((): ChartData => {
        const today = new Date();

        // 0️⃣ sort logs by date ascending (oldest → newest)
        const sortedLogs = [...logs].sort(
            (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
        );

        // 1️⃣ determine start date
        let startDate: Date;
        if (dateRange === "all") {
            startDate = sortedLogs.length ? new Date(sortedLogs[0].log_date) : new Date();
        } else {
            startDate = new Date();
            const daysAgo = parseInt(dateRange);
            startDate.setDate(today.getDate() - (daysAgo - 1));
        }

        // 2️⃣ filter logs within date range
        const filteredLogs = sortedLogs.filter((log) => new Date(log.log_date) >= startDate);

        // 3️⃣ convert to ExerciseLog for the selected exercise
        const exerciseLogs: ExerciseLog[] = filteredLogs.map((log) => {
            const exercise = log.exercises.find((ex) => ex.name === selectedExercise);
            let strength: number | null = null;

            if (exercise?.weight != null && exercise?.reps != null) {
                // Matt Brzycki 1RM formula
                strength = exercise.weight / (1.0278 - 0.0278 * exercise.reps);
            }

            return {
                bodyweight: log.bodyweight,
                log_date: log.log_date,
                exercise_name: exercise?.name ?? null,
                weight: exercise?.weight ?? null,
                reps: exercise?.reps ?? null,
                strength,
            };
        });

        // 4️⃣ fill missing dates
        const logMap = new Map(exerciseLogs.map((l) => [l.log_date, l]));
        const filledLogs: ExerciseLog[] = [];
        const cursor = new Date(startDate);

        while (cursor <= today) {
            const dateStr = cursor.toISOString().split("T")[0];
            if (logMap.has(dateStr)) {
                filledLogs.push(logMap.get(dateStr)!);
            } else {
                filledLogs.push({
                    log_date: dateStr,
                    bodyweight: null,
                    exercise_name: null,
                    weight: null,
                    reps: null,
                    strength: null,
                });
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        // 4️⃣ compute domains
        const bodyweights = filledLogs.map((l) => l.bodyweight).filter((v): v is number => v != null);
        let paddedBwMin = 0, paddedBwMax = 0;
        let yTickCount = 4;

        if (bodyweights.length) {
            const minWeight = Math.min(...bodyweights);
            const maxWeight = Math.max(...bodyweights);
            paddedBwMin = Math.floor(minWeight / 5) * 5 - 5;
            paddedBwMax = Math.ceil(maxWeight / 5) * 5 + 5;
            const yRange = paddedBwMax - paddedBwMin;
            if (yRange <= 15) yTickCount = 4;
            else if (yRange <= 30) yTickCount = 6;
            else if (yRange <= 50) yTickCount = 8;
            else yTickCount = 10;
        }

        const strengths = filledLogs.map((l) => l.strength).filter((v): v is number => v != null);
        let paddedExMin = 0, paddedExMax = 0;

        if (strengths.length) {
            const minStrength = Math.min(...strengths);
            const maxStrength = Math.max(...strengths);
            paddedExMin = Math.floor(minStrength / 10) * 10 - 10;
            paddedExMax = Math.ceil(maxStrength / 10) * 10 + 10;
        }

        // 5️⃣ compute X ticks, Y axis domains, etc.
        let intervalDays = 1;
        if (dateRange === "7d") intervalDays = 1;
        else if (dateRange === "30d") intervalDays = 7;
        else if (dateRange === "90d") intervalDays = isMobile ? 14 : 7;
        else if (dateRange === "180d") intervalDays = isMobile ? 30 : 14;
        else if (dateRange === "365d") intervalDays = isMobile ? 60 : 30;
        else if (dateRange === "all") {
            const totalDays = Math.ceil(
                (today.getTime() - new Date(filteredLogs[0].log_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            const maxTicks = isMobile ? 8 : 12;
            intervalDays = Math.ceil(totalDays / maxTicks);
        }

        const xTicks: string[] = [];
        const tickCursor = new Date(startDate);
        while (tickCursor <= today) {
            xTicks.push(tickCursor.toISOString().split("T")[0]);
            tickCursor.setDate(tickCursor.getDate() + intervalDays);
        }

        return {
            filledLogs,
            xTicks,
            bwDomain: { bwMin: paddedBwMin, bwMax: paddedBwMax },
            exDomain: { exMin: paddedExMin, exMax: paddedExMax },
            yTickCount,
        };
    }, [logs, dateRange, selectedExercise, isMobile]);

    // 🔹 Now just destructure chartData to pass in the variables to recharts
    const { filledLogs: preparedLogs, xTicks, bwDomain, exDomain, yTickCount } = chartData;

    const unitMap: Record<string, string> = {
        bodyweight: "lbs",
        calories: "kcal",
        reps: "reps",
    };

    function CustomTooltip<ValueType extends string | number = number, NameType extends string = string>(
        { active, payload, label }: TooltipContentProps<ValueType, NameType>
    ) {
        // active is true since we're hovering over a point
        // payload is an array of obj representing the data at that point
        // label is the x axis value
        if (active && payload && payload.length) {
            return (
                // Displays:
                // Date:
                // Value1, Unit1
                // Value2, Unit2
                // ...
                <div className="">
                    <p className="">{label}</p>
                    {payload.map((entry, idx) => {
                        const { value, dataKey, color } = entry;
                        const unit = unitMap[dataKey as string] ?? "";

                        return (
                            // style={{color}} uses stroke line color
                            <p key={idx}>
                                {value} {unit}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    }

    return (
        <div className="dashboard-section-1 rounded-lg shadow lg:w-5/10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold m-2">Weight & Strength</h2>
                <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value as string)}
                    className="w-30 border rounded px-2 py-1 text-sm m-2 max-h-20 overflow-y-auto"
                >
                    <option value="" disabled>
                        Select exercise
                    </option>
                    {userExercises != null
                        ? userExercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.name}>
                                {exercise.name}
                            </option>
                        ))
                        : null}
                </select>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm m-2"
                >
                    <option value="7d">1 Week</option>
                    <option value="30d">1 Month</option>
                    <option value="90d">3 Months</option>
                    <option value="180d">6 Months</option>
                    <option value="365d">1 Year</option>
                    <option value="all">All</option>
                </select>
            </div>


            <ResponsiveContainer width="100%" height={isMobile ? 200 : 450}>
                <LineChart
                    data={preparedLogs}
                    margin={{ top: 5, right: 0, left: 0, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="" stroke="#e5e7eb" strokeOpacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="log_date"
                        ticks={xTicks}
                        interval={0}
                        tickLine={false}
                        axisLine={true}
                        tickFormatter={(dateStr) => {
                            const d = new Date(dateStr);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        tickMargin={isMobile ? 10 : 20}
                        padding={isMobile ? { left: 10 } : { left: 20 }}
                    />
                    <YAxis
                        domain={[bwDomain.bwMin, bwDomain.bwMax]}
                        tickCount={yTickCount}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        yAxisId="left"
                    />
                    <YAxis
                        domain={[exDomain.exMin, exDomain.exMax]}
                        tickCount={yTickCount}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 12 : 15, fill: "#6b7280" }}
                        yAxisId="right"
                        orientation="right"
                    />
                    <Tooltip
                        labelFormatter={(dateStr) => {
                            const d = new Date(dateStr);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        content={CustomTooltip}
                    />

                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        content={(props) => {
                            const { payload } = props;
                            return (
                                <div className="flex justify-center flex-wrap gap-2 mt-5">
                                    {payload?.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-1">
                                            {/* Colored icon */}
                                            <div
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: entry.color }} // dynamic color
                                            />
                                            {/* Label */}
                                            <span className="text-gray-700">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="bodyweight" stroke="green" strokeWidth={3} dot={{ r: 1 }} connectNulls />
                    <Line yAxisId="right" type="monotone" dataKey="strength" stroke="red" strokeWidth={3} dot={{ r: 1 }} connectNulls />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
