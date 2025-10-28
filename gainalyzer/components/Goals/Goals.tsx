"use client"

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react";
import Link from "next/link"
import { Dumbbell, Flame, Scale } from "lucide-react"
import { ExerciseCombobox } from "../ExerciseCombobox/ExerciseCombobox";
import { toast } from "sonner";



const supabase = createClient();

type ExerciseOption = { id: string; name: string }

export default function GoalsPage() {
    const [user, setUser] = useState<any>(null);
    const [exercises, setExercises] = useState<ExerciseOption[]>([]);

    const [bodyweightStart, setBodyweightStart] = useState("");
    const [bodyweightGoal, setBodyweightGoal] = useState("");
    const [calorieGoal, setCalorieGoal] = useState("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
    const [weightGoal, setWeightGoal] = useState("");
    const [repsGoal, setRepsGoal] = useState("");
    const existingGoalsRef = useRef(new Map());

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
            .select("type, target_value, exercise_id, target_weight, target_reps, start_bodyweight")
            .eq("user_id", user.id)

        if (error) {
            console.error("Error fetching goals:", error.message);
            return;
        }

        const goalMap = new Map();
        if (goals) {
            goals.forEach((goal) => {
                goalMap.set(goal.type, goal);
            });

            existingGoalsRef.current = goalMap


            setBodyweightStart(goalMap.get("bodyweight")?.start_bodyweight ?? "");
            setBodyweightGoal(goalMap.get("bodyweight")?.target_value ?? "");
            setCalorieGoal(goalMap.get("calories")?.target_value ?? "");
            setSelectedExerciseId(goalMap.get("strength")?.exercise_id);
            setWeightGoal(goalMap.get("strength")?.target_weight ?? "");
            setRepsGoal(goalMap.get("strength")?.target_reps ?? "");


            console.log("existingGoals Map:", goalMap);
            const bodyweightGoalObj = goalMap.get("bodyweight");
            console.log("bodyweightGoalObj:", bodyweightGoalObj);
            console.log("target_value:", bodyweightGoalObj?.target_value);
            console.log("Number(target_value):", Number(bodyweightGoalObj?.target_value));

        }
    }

    useEffect(() => {
        fetchGoals();
    }, [user])

    function checkForNewGoals() {
        let newGoals = [];

        const existingBody = existingGoalsRef.current.get("bodyweight");
        const existingCals = existingGoalsRef.current.get("calories");
        const existingStrength = existingGoalsRef.current.get("strength");

        // BODYWEIGHT GOAL
        if (
            !existingBody ||
            Number(bodyweightGoal) !== Number(existingBody.target_value) ||
            Number(bodyweightStart) != Number(existingBody.start_bodyweight)
        ) {
            newGoals.push({
                user_id: user.id,
                type: "bodyweight",
                start_bodyweight: Number(bodyweightStart),
                target_value: Number(bodyweightGoal),
            });
        }

        // CALORIES GOAL
        if (
            !existingCals ||
            Number(calorieGoal) !== Number(existingCals.target_value)
        ) {
            newGoals.push({
                user_id: user.id,
                type: "calories",
                target_value: Number(calorieGoal),
            });
        }

        // STRENGTH GOAL
        if (!existingStrength) {
            // no existing strength goal, must have exercise selected
            if (selectedExerciseId === null) {
                toast.warning("You must select an exercise before saving a strength goal.");
                return [];
            }
            newGoals.push({
                user_id: user.id,
                type: "strength",
                exercise_id: selectedExerciseId,
                target_weight: Number(weightGoal),
                target_reps: Number(repsGoal),
            });
        } else {
            const exerciseChanged =
                selectedExerciseId !== existingStrength.exercise_id &&
                selectedExerciseId !== null;

            const weightChanged =
                Number(weightGoal) !== Number(existingStrength.target_weight);
            const repsChanged =
                Number(repsGoal) !== Number(existingStrength.target_reps);

            if (exerciseChanged || weightChanged || repsChanged) {
                if (selectedExerciseId === null) {
                    toast.error("You must select an exercise before saving a strength goal.");
                    return [];
                }
                newGoals.push({
                    user_id: user.id,
                    type: "strength",
                    exercise_id: selectedExerciseId,
                    target_weight: Number(weightGoal),
                    target_reps: Number(repsGoal),
                });
            }
        }

        console.log(
            {
                existingGoals: existingGoalsRef.current,
                existing: Number(existingGoalsRef.current.get("bodyweight")?.target_value),
                current: Number(bodyweightGoal)
            }
        )

        return newGoals;
    }

    // save or update Users Goals
    async function handleSaveGoals() {
        if (!user) return;

        const newGoals = checkForNewGoals();
        if (newGoals.length === 0) {
            toast.info("No changes to goals detected.");
            return;
        }

        const { error } = await supabase
            .from("goals")
            .upsert(
                newGoals,
                { onConflict: 'user_id,type' }
            );

        if (error) {
            console.error("Error saving goals: ", error.message);
            toast.error("Failed to save goals.");
            return
        }

        // update the ref with latest values
        newGoals.forEach((goal) => existingGoalsRef.current.set(goal.type, goal));

        toast.success("Goals saved.");
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const val = event.target.value;
        const inputId = event.target.id;
        if (inputId === "bodyweightGoal") {
            // Allow digits, optional decimal, and at most ONE digit after decimal
            const weightRegex = /^\d*(?:\.\d?)?$/;
            if (weightRegex.test(val)) setBodyweightGoal(val);
        } else if (inputId === "bodyweightStart") {
            const weightRegex = /^\d*(?:\.\d?)?$/;
            if (weightRegex.test(val)) setBodyweightStart(val);
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
        // remove trailing dots
        const startStr = String(bodyweightStart);
        const goalStr = String(bodyweightGoal); // bodyweight goal
        const calStr = String(calorieGoal);
        const weightGoalStr = String(weightGoal); // strength goal

        if (startStr.endsWith(".")) {
            setBodyweightStart(startStr.slice(0, -1));
        }
        if (goalStr.endsWith(".")) {
            setBodyweightGoal(goalStr.slice(0, -1));
        }
        if (calStr.endsWith(".")) {
            setCalorieGoal(calStr.slice(0, -1));
        }
        if (weightGoalStr.endsWith(".")) {
            setWeightGoal(weightGoalStr.slice(0, -1));
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
                <div className="flex flex-col">
                    <span className="mb-2">Starting weight</span>
                    <div className="flex items-center gap-2">
                        <Input
                            id="bodyweightStart"
                            type="text"
                            placeholder="start"
                            className="w-24 text-right"
                            value={bodyweightStart}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        <span>lbs</span>
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="mb-2">Target weight</span>
                    <div className="flex items-center gap-2">
                        <Input
                            id="bodyweightGoal"
                            type="text"
                            placeholder="target"
                            className="w-24 text-right"
                            value={bodyweightGoal}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        <span>lbs</span>
                    </div>
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
                    Choose an exercise and your target set (weight × reps). We’ll track
                    your progress using an estimated One Rep Max.
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
                            placeholder="weight"
                            className="w-20 text-right"
                            value={weightGoal}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                        />
                        <span>x</span>
                        <Input
                            id="reps"
                            type="text"
                            placeholder="reps"
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
