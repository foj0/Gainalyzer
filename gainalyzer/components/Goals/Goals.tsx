"use client"

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import Link from "next/link"
import { Dumbbell, Flame, Scale } from "lucide-react"
import { ExerciseCombobox } from "../ExerciseCombobox/ExerciseCombobox";
import { toast } from "sonner";



const supabase = createClient();

type ExerciseOption = { id: string; name: string }

type Goal = {
    type: string;
    target_value: string;
    exercise_id: string;
    target_weight: string;
    target_reps: string;
}

type StrengthGoal = {
    exercise_id: string;
    weight: number;
    reps: number;
}

export default function GoalsPage() {
    const [user, setUser] = useState<any>(null);
    const [exercises, setExercises] = useState<ExerciseOption[]>([]);

    const [bodyweightGoal, setBodyweightGoal] = useState("");
    const [calorieGoal, setCalorieGoal] = useState("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [weightGoal, setWeightGoal] = useState("");
    const [repsGoal, setRepsGoal] = useState("");
    let existingGoals = new Map();
    let newGoals = new Map();

    //TODO: extistingGoals set to all empty at first
    //Then we fetch and update the existingGoals.
    //When we hit save to update goals,
    //we first check each goal type to see if it's the same
    //as the existing goals.
    //If it's not then we add the object to a changed [] list
    //and upsert changed

    // fetch User and their Exercises to select from
    useEffect(() => {
        async function fetchUserAndExercises() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user);

            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .eq("user_id", user.id)
                .order("name", { ascending: true });

            if (error) {
                console.error(error);
            } else if (data) {
                setExercises((data as any).map((ex: any) => ({
                    id: ex.id,
                    name: ex.name
                })))
            }
        }

        fetchUserAndExercises();
    }, []);


    async function fetchGoals() {
        if (!user) return;

        const { data: goals, error } = await supabase
            .from("goals")
            .select("type, target_value, exercise_id, target_weight, target_reps")
            .eq("user_id", user.id)
        // .maybeSingle();

        if (error) {
            console.error("Error fetching goals:", error.message);
            return;
        }

        console.log("users existing goals: ", goals);

        if (goals) {
            goals.forEach((goal) => {
                existingGoals.set(goal.type, goal);
            });
        }
        console.log("Goalmap", existingGoals);
    }

    // fetch and set users existing goals
    useEffect(() => {
        fetchGoals();
    }, [user])



    function checkForNewGoals() {
        return
    }

    // save or update Users Goals
    async function handleSaveGoals() {
        if (!user) return;

        checkForNewGoals();

        try {
            const error = await supabase
                .from("goals")
                .upsert(
                    newGoals,
                    { onConflict: 'user_id,type' }
                );

        } catch (err) {
            console.error("Error saving goals: ", err);
            toast.error("Failed to save goals.");
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const val = event.target.value;
        const inputId = event.target.id;
        if (inputId === "bodyweight") {
            // Allow digits, optional decimal, and at most ONE digit after decimal
            const weightRegex = /^\d*(?:\.\d?)?$/;
            if (weightRegex.test(val)) setBodyweightGoal(val);
        } else if (inputId === "calories") {
            // Only allow digits (no decimals)
            const caloriesRegex = /^\d*$/;
            if (caloriesRegex.test(val)) setCalorieGoal(val);
        } else if (inputId === "exerciseWeight") {
            // allow two decimals
            const weightRegex = /^\d*(?:\.\d{0,2})?$/;
            if (weightRegex.test(val)) setWeightGoal(val);
        } else if (inputId === "reps") {
            // only digits
            const regex = /^\d*$/;
            if (regex.test(val)) setRepsGoal(val);
        }
    }

    function handleBlur() {
        // Blur is when you click off an input field
        if (bodyweightGoal.endsWith(".")) {
            setBodyweightGoal(bodyweightGoal.slice(0, -1)); // remove any trailing dot
        }
        if (calorieGoal.endsWith(".")) {
            setCalorieGoal(calorieGoal.slice(0, -1)); // remove any trailing dot
        }
        if (weightGoal.endsWith(".")) {
            setWeightGoal(weightGoal.slice(0, -1)); // remove any trailing dot
        }
        if (calorieGoal.endsWith(".")) {
            setCalorieGoal(calorieGoal.slice(0, -1)); // remove any trailing dot
        }
    }

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
                        id="bodyweight"
                        type="text"
                        placeholder="170"
                        className="w-24 text-right"
                        value={bodyweightGoal}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
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
                        id="calories"
                        type="text"
                        placeholder="2200"
                        className="w-24 text-right"
                        value={calorieGoal}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                    />
                    <span>kcal</span>
                </div>
            </section>

            {/* Strength Goals */}
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
                        exercises={exercises}
                        setExercises={setExercises}
                        value={selectedExerciseId}
                        onChange={setSelectedExerciseId}
                    />
                    <div className="flex items-center gap-2">
                        <Input
                            id="exerciseWeight"
                            type="text"
                            placeholder="225"
                            className="w-20 text-right"
                            value={weightGoal}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        <span>x</span>
                        <Input
                            id="reps"
                            type="text"
                            placeholder="1"
                            className="w-16 text-right"
                            value={repsGoal}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                    </div>
                </div>
            </section>

            <div className="flex justify-center">
                <Button className="px-6" onClick={handleSaveGoals}>Save Goals</Button>
            </div>
        </main>
    )
}
