import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LuCirclePlus } from "react-icons/lu";
import { useState, useEffect } from "react";
import { ExerciseCombobox } from "@/components/ExerciseCombobox/ExerciseCombobox";
import { NewExercise } from "./NewExercise";
import { createClient } from "@/utils/supabase/client"
import { SupabaseClient, User } from "@supabase/supabase-js";

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

type Props = {
    supabase: SupabaseClient;
    user: User;
    templates: Template[];
}

const AddTemplate = ({ supabase, user, templates }) => {

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
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex">
                        <button className="text-blue-500 flex items-center gap-2 cursor-pointer hover:underline">
                            Add Template
                        </button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Template</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        List templates

                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddTemplate
