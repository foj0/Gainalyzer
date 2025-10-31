"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import CreateExercise from "../ExerciseTable/CreateExercise";
import CreateTemplate from "./CreateTemplate";
import { IoAdd } from "react-icons/io5";
import TemplateCard from "./TemplateCard";

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

type TemplateExercise = {
    id: string;
    template_id: string;
    exercise_id: string;
    name: string;
}

type Template = {
    id: string;
    name: string;
    template_exercises: TemplateExercise[];
}

export default function TemplateTable() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        const { data: exercises, error } = await supabase
            .from("exercises")
            .select("id, user_id, name")
            .eq("user_id", user.id)
            .order("name", { ascending: true });

        if (error) {
            console.error("Error fetching exercises: ", error);
            return;
        }
        if (!exercises) {
            setLoading(false);
            return;
        }
        setExercises(exercises);
        setLoading(false);
    }

    async function fetchTemplates() {
        if (!user) return;

        setLoading(true);
        const { data: templates, error } = await supabase
            .from("workout_templates")
            .select(`
                id,
                name,
                template_exercises (
                    id,
                    template_id,
                    exercise_id,
                    exercise:exercises (name)
                )
              `)
            .eq("user_id", user.id)
            .order("name", { ascending: true });
        if (error) {
            console.error("Error fetching templates: ", error);
            return;
        }
        if (!exercises) {
            setLoading(false);
            return;
        }

        const formatted = templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            template_exercises: t.template_exercises.map((te: any) => ({
                id: te.id,
                template_id: te.template_id,
                exercise_id: te.exercise_id,
                name: te.exercise.name
            }))
        }));
        console.log(formatted);
        setTemplates(formatted);
        setLoading(false);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchExercises();
        fetchTemplates();
    }, [user]);

    // TODO: Need to do something to refresh when a template is edited/deleted
    // useEffect(() => {
    //     fetchTemplates();
    // }, [templates])

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    return (
        <div>
            {user ? (

                <div className="p-2">
                    < div className="flex justify-between items-center mt-5 mb-5 exercise-row" >
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold ">Workout Templates</h1>
                            <p className="text-sm text-gray-500 mb-3">Create and edit your own custom workouts.</p>
                        </div>
                        <CreateTemplate exercises={exercises} templates={templates} setTemplates={setTemplates} supabase={supabase} user={user} />
                    </div >

                    {/* List of user workout templates */}
                    {
                        loading ? (
                            <div className="flex justify-center py-4">
                                <TbLoader2 className="animate-spin" />
                            </div>
                        ) :

                            templates.length > 0 ?
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] grid-flow-row place-items-center gap-4">
                                    {templates.map((t) => (
                                        <TemplateCard
                                            key={t.id}
                                            supabase={supabase}
                                            user={user}
                                            template={t}
                                            templateExercises={t.template_exercises}
                                            setTemplates={setTemplates}
                                        />
                                    ))}
                                </div>
                                :
                                <div className="flex justify-center text-gray-500">No workout templates.</div>
                    }
                </div>
            )
                :
                <></>
            }

        </div >
    );
}
