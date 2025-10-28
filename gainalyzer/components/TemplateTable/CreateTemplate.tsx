import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { SupabaseClient, User } from "@supabase/supabase-js"
import ExercisePopupSelector from "../ExercisePopupSelector/ExercisePopupSelector"

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type TemplateExercise = {
    id: string;
    template_id: string;
    exercise_id: string;
}


type Template = {
    id: string;
    user_id: string;
    name: string;
    exercises: TemplateExercise[];
}


type props = {
    exercises: Exercise[]
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>
    // setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>
    // setRefreshKey: React.Dispatch<React.SetStateAction<number>>
    supabase: SupabaseClient;
    user: User | null;
}

export default function CreateTemplate({ exercises, setTemplates, supabase, user }: props) {
    const [open, setOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]); // exercises added to this template
    const [exerciseName, setExerciseName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleNewTemplateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!user) return;

        const trimmedName = templateName.trim()
        if (!trimmedName) return

        return;

        // // Insert new exercise into DB
        // const { data, error } = await supabase
        //     .from("workoute_templates")
        //     .insert([{ user_id: user.id, name: trimmedName, }])
        //     .select()
        //     .single()
        // const { data, error } = await supabase
        //     .from("template_exercises")
        //     .insert()
        //
        // if (error) {
        //     console.error(error)
        // } else if (data) {
        //     // Add the newly created exercise to the exercises list. No refresh needed
        //     // Sort alphabetically so new exercises is added to correct spot
        //     setTemplates((prev) => {
        //         const updated = [
        //             ...prev,
        //             { id: data.id, user_id: user.id, name: data.name },
        //         ];
        //         return updated.sort((a, b) => a.name.localeCompare(b.name));
        //     });
        //     toast.success(`Exercise "${data.name}" created.`)
        //     //setRefreshKey(prev => prev + 1)
        // }
        //
        // setExerciseName("")
        // setErrorMessage("")
        // setOpen(false)
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>

                    <button className="button mb-3">Create Template</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md flex flex-col justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-center">Create New Workout Template</DialogTitle>
                        <DialogDescription className="text-center">
                            Add exercises to this template to make it easier to log workouts.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleNewTemplateSubmit}
                        className="flex flex-col gap-4 flex-1 justify-center"
                    >
                        <div className="flex flex-1 flex-col">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Template Name"
                                value={templateName}
                                onChange={(e) => {
                                    setTemplateName(e.target.value)
                                    setErrorMessage("") // clear error while typing
                                }}
                                className={`input w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${errorMessage
                                    ? "border-red-500 focus:ring-red-400"
                                    : ""
                                    }`}
                            />
                            {errorMessage && (
                                <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
                            )}
                        </div>

                        <button
                            className="text-sm bg-blue-400 w-fit px-2 py-1 rounded-md disabled:bg-gray-600 disabled:cursor-default cursor-pointer"
                            type="submit"
                            disabled={!templateName.trim() || (templateExercises.length < 1)}
                        >
                            Create
                        </button>
                    </form>
                    {/* List exercises added here */}
                    <div>
                        Exercises
                    </div>
                    <ExercisePopupSelector exercises={exercises} setExercises={setTemplateExercises} supabase={supabase} user={user} setParentOpen={setOpen} />



                </DialogContent>
            </Dialog>
        </div>
    )
}

