"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import ExerciseRow from "./ExerciseRow";
import { Search } from "lucide-react";

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
    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

    async function fetchUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error("Error fetching user: ", error);
            return;
        }
        if (!user) return;
        setUser(user);
    }

    async function fetchExercises() {
        if (!user) return;

        const { data: exercises, error } = await supabase
            .from("exercises")
            .select("id, user_id, name")
            .eq("user_id", user.id)
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching exercises: ", error);
            return;
        }
        if (!exercises) return;

        setExercises(exercises);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchExercises();
    }, [user]);

    useEffect(() => {
        if (exerciseSearch == "") {
            setFilteredExercises(exercises);
        } else {
            const searchFilteredExercises = exercises.filter((exercise) => (exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())));
            setFilteredExercises(searchFilteredExercises);
        }
    }, [exercises, exerciseSearch]);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    function handleCreateExercise() {
        return;
    }

    function openEditModal(exercise: Exercise) {
        return;
    }

    function deleteExercise(exercise: Exercise) {
        return
    }

    return (
        <div className="p-2">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold mt-5">Exercises</h1>
                <p className="text-sm text-gray-500">View, create, edit, and delete your exercises.</p>
            </div>

            <div className="flex justify-between items-center mt-5 mb-5 exercise-row">
                <div className="relative w-50 max-w-sm mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search Exercises"
                        className="search-input w-full pl-10 pr-4 py-2 rounded-lg placeholder-gray-500 focus:outline-none"
                        onChange={handleInputChange}
                        value={exerciseSearch}
                        name="exerciseSearch"
                    />
                </div>
                <button className="button mb-3" onClick={handleCreateExercise}>Create Exercise</button>
            </div>

            <div className="flex justify-end">
            </div>

            {/* List of user exercises */}
            {filteredExercises.length > 0 ?
                <div className="dashboard-section-1 border border-[#333333]">
                    {filteredExercises.map(e => (
                        <ExerciseRow
                            key={e.id}
                            supabase={supabase}
                            user={user}
                            exercise={e}
                            onEdit={() => openEditModal(e)}
                            onDelete={() => deleteExercise(e)}
                            setExercises={setExercises}
                        />

                    ))}
                </div>
                :
                <div className="flex justify-center text-gray-500">No exercises.</div>
            }

        </div>
    );

}

