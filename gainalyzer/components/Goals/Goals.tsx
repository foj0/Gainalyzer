"use client"

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button"
import { useState } from "react";
import Link from "next/link"
import { Dumbbell, Flame, Scale } from "lucide-react"
import { ExerciseCombobox } from "../ExerciseCombobox/ExerciseCombobox";

// function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
//     const val = event.target.value;
//     const inputId = event.target.id;
//     if (inputId === "bodyweight") {
//         // Allow digits, optional decimal, and at most ONE digit after decimal
//         const weightRegex = /^\d*(?:\.\d?)?$/;
//         if (weightRegex.test(val)) setBodyweight(val);
//     } else if (inputId === "calories") {
//         // Only allow digits (no decimals)
//         const caloriesRegex = /^\d*$/;
//         if (caloriesRegex.test(val)) setCalories(val);
//     }
// }
//
// function handleWeightBlur() {
//     // Blur is when you click off an input field
//     if (bodyweight.endsWith(".")) {
//         setBodyweight(bodyweight.slice(0, -1)); // remove any trailing dot
//     }
// }

export default function GoalsPage() {
    const [bodyweightGoal, setBodyweightGoal] = useState("")
    const [calorieGoal, setCalorieGoal] = useState("")
    const [exercise, setExercise] = useState<string | null>(null)
    const [weight, setWeight] = useState("")
    const [reps, setReps] = useState("")

    return (
        <main className="max-w-2xl mx-auto mt-10 p-6 space-y-8">
            <h1 className="text-2xl font-bold text-center mb-6">Set Your Goals</h1>

            {/* Bodyweight Goal */}
            <section className="dashboard-section-1 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Scale className="text-blue-500" /> Bodyweight Goal
                </div>
                <p className="text-sm text-muted-foreground">
                    Track your progress toward your target bodyweight.
                </p>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="170"
                        className="w-24 text-right"
                        value={bodyweightGoal}
                        onChange={(e) => setBodyweightGoal(e.target.value)}
                    />
                    <span>lbs</span>
                </div>
            </section>

            {/* Calorie Goal */}
            <section className="dashboard-section-1 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Flame className="text-orange-500" /> Daily Calorie Goal
                </div>
                <p className="text-sm text-muted-foreground">
                    Set your target daily calorie intake.
                </p>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        placeholder="2200"
                        className="w-24 text-right"
                        value={calorieGoal}
                        onChange={(e) => setCalorieGoal(e.target.value)}
                    />
                    <span>kcal</span>
                </div>
            </section>

            {/* Strength Goal */}
            <section className="dashboard-section-1 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <Dumbbell className="text-green-500" /> Strength Goal
                </div>
                <p className="text-sm text-muted-foreground">
                    Choose an exercise and your target set (weight × reps). We’ll estimate
                    your one-rep max and track progress automatically.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <ExerciseCombobox
                        exercises={[]} // your fetched exercise options
                        setExercises={() => { }}
                        value={exercise}
                        onChange={setExercise}
                    />
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="225"
                            className="w-20 text-right"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                        />
                        <span>x</span>
                        <Input
                            type="number"
                            placeholder="1"
                            className="w-16 text-right"
                            value={reps}
                            onChange={(e) => setReps(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-center">
                <Button className="px-6">Save Goals</Button>
            </div>
        </main>
    )
}
