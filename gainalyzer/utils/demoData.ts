import { useMemo, useCallback, useEffect, useState } from "react";
// import { ResponsiveContainer, Legend, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { Select } from "@radix-ui/react-select";
import ExerciseSelect from "@/components/Dashboard/ExerciseSelect";

export type Exercise = {
    name: string;
    orm: number;
}

// Log type that we're given as a prop
export type Log = {
    bodyweight: number | null;
    log_date: string;
    exercises: Exercise[];
};

// Log type once we process for the selected exercise. Only contains info for the exercise we want.
export type ExerciseLog = {
    bodyweight: number | null;
    log_date: string;
    exercise_name: string | null;
    orm: number | null;
}

export interface ChartData {
    filledLogs: ExerciseLog[];
    xTicks: string[];
    bwDomain: { bwMin: number; bwMax: number };
    exDomain: { exMin: number; exMax: number };
    yTickCount: number;
}

// The two types for ExerciseSelect
// interface Exercise {
//     id: string;
//     name: string;
// }
//
// interface Props {
//     userExercises: Exercise[] | null;
//     selectedExercise: string;
//     setSelectedExercise: (value: string) => void;
// }


export const demoLogs: Log[] = [
    {
        log_date: "2025-06-23",
        bodyweight: 153.2,
        exercises: [
            {
                name: "bench press",
                orm: 205,
            }
        ]
    },
    {
        log_date: "2025-07-04",
        bodyweight: 155.7,
        exercises: [
            {
                name: "bench press",
                orm: 207,
            }
        ]
    },
    {
        log_date: "2025-07-12",
        bodyweight: 156.4,
        exercises: [
            {
                name: "bench press",
                orm: 209,
            }

        ]
    },
    {
        log_date: "2025-07-19",
        bodyweight: 158.7,
        exercises: [
            {
                name: "bench press",
                orm: 208,
            }

        ]
    },
    {
        log_date: "2025-07-24",
        bodyweight: 157.5,
        exercises: [
            {
                name: "bench press",
                orm: 211,
            }

        ]
    },
    {
        log_date: "2025-07-29",
        bodyweight: 159.1,
        exercises: [
            {
                name: "bench press",
                orm: 213,
            }

        ]
    },
    {
        log_date: "2025-08-08",
        bodyweight: 159.5,
        exercises: [
            {
                name: "bench press",
                orm: 214,
            }

        ]
    },
    {
        log_date: "2025-08-12",
        bodyweight: 161.5,
        exercises: [
            {
                name: "bench press",
                orm: 212,
            }

        ]
    },
    {
        log_date: "2025-08-25",
        bodyweight: 159.1,
        exercises: [
            {
                name: "bench press",
                orm: 216,
            }

        ]
    },
    {
        log_date: "2025-08-29",
        bodyweight: 161.7,
        exercises: [
            {
                name: "bench press",
                orm: 218,
            }

        ]
    },
    {
        log_date: "2025-09-05",
        bodyweight: 161.3,
        exercises: [
            {
                name: "bench press",
                orm: 221,
            }

        ]
    },
    {
        log_date: "2025-09-08",
        bodyweight: 163,
        exercises: [
            {
                name: "bench press",
                orm: 220,
            }

        ]
    },
    {
        log_date: "2025-09-11",
        bodyweight: 164.3,
        exercises: [
            {
                name: "bench press",
                orm: 223,
            }

        ]
    },
    {
        log_date: "2025-09-11",
        bodyweight: 164.3,
        exercises: [
            {
                name: "bench press",
                orm: 224,
            }

        ]
    },
    {
        log_date: "2025-09-17",
        bodyweight: 163,
        exercises: [
            {
                name: "bench press",
                orm: 227,
            }

        ]
    },
    {
        log_date: "2025-09-18",
        bodyweight: 163.2,
        exercises: [
            {
                name: "bench press",
                orm: 226,
            }

        ]
    },
    {
        log_date: "2025-09-19",
        bodyweight: 165,
        exercises: [
            {
                name: "bench press",
                orm: 228,
            }

        ]
    },
    {
        log_date: "2025-09-20",
        bodyweight: 163.8,
        exercises: [
            {
                name: "bench press",
                orm: 229,
            }
        ]
    },
    {
        log_date: "2025-09-22",
        bodyweight: 165,
        exercises: [
            {
                name: "bench press",
                orm: 230,
            }
        ]
    },
    {
        log_date: "2025-09-23",
        bodyweight: 163.2,
        exercises: [
            {
                name: "bench press",
                orm: 231,
            }
        ]
    },
    {
        log_date: "2025-09-24",
        bodyweight: 163.9,
        exercises: [
            {
                name: "bench press",
                orm: 232,
            }
        ]
    },
    {
        log_date: "2025-09-29",
        bodyweight: 165.2,
        exercises: [
            {
                name: "bench press",
                orm: 233,
            }
        ]
    },
    {
        log_date: "2025-10-09",
        bodyweight: 166.3,
        exercises: [
            {
                name: "bench press",
                orm: 233,
            }
        ]
    },
    {
        log_date: "2025-10-21",
        bodyweight: 167.2,
        exercises: [
            {
                name: "bench press",
                orm: 235,
            }
        ]
    },
    {
        log_date: "2025-11-05",
        bodyweight: 170,
        exercises: [
            {
                name: "bench press",
                orm: 240,
            }
        ]
    },
]

export const demoExercises: { id: string, name: string }[] = [
    {
        id: "1",
        name: "Bench Press"
    }
]
