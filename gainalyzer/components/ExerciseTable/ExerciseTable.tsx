"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import ExerciseRow from "./ExerciseRow";

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type Log = {
    id: number;
    log_id: number;
    exercise_id: number;
    notes: string;
    weight: number;
    reps: number;
}



export default function ExerciseTable() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        async function fetchUser() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Error fetching user: ", error);
                return;
            }
            if (!user) return;
            setUser(user);
        }
        fetchUser();
    }, []);

    function handleCreateExercise() {
        return;
    }

    async function fetchExercises() {
        if (!user) return;

        const { data: exercises, error } = await supabase
            .from("exercises")
            .select("id, user_id, name")
            .eq("user_id", user.id)

        if (error) {
            console.error("Error fetching exercises: ", error);
            return;
        }
        if (!exercises) return;

        setExercises(exercises);
    }

    function openEditModal(exercise: Exercise) {
        return;
    }

    function deleteExercise(exercise: Exercise) {
        return
    }

    return (
        <div>
            <h1 className="flex justify-center text-xl font-semibold m-10">Your Exercises</h1>

            <div className="flex justify-between items-center ">
                <p>Exercises</p>
                <button className="button mb-3" onClick={handleCreateExercise}>Create Exercise</button>
            </div>

            {/* List of user exercises */}
            <div className="border border-gray-700">
                {exercises.map(e => (
                    <ExerciseRow
                        key={e.id}
                        exercise={e}
                        onEdit={() => openEditModal(e)}
                        onDelete={() => deleteExercise(e)}
                    />

                ))}



            </div>

        </div>
    );

}

