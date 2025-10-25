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

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type props = {
    exercises: Exercise[]
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>
    // setRefreshKey: React.Dispatch<React.SetStateAction<number>>
    supabase: SupabaseClient;
    user: User | null;
}

export default function CreateExercise({ exercises, setExercises, supabase, user }: props) {
    const [open, setOpen] = useState(false)
    const [exerciseName, setExerciseName] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    async function handleNewExerciseSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!user) return;

        const trimmedName = exerciseName.trim()
        if (!trimmedName) return

        // Prevent duplicates (case-insensitive)
        const duplicate = exercises.some(
            (ex) => ex.name.toLowerCase() === trimmedName.toLowerCase()
        )
        if (duplicate) {
            setErrorMessage("This exercise already exists.")
            return
        }

        // Insert new exercise into DB
        const { data, error } = await supabase
            .from("exercises")
            .insert([{ name: trimmedName, user_id: user.id }])
            .select()
            .single()

        if (error) {
            console.error(error)
        } else if (data) {
            // Add the newly created exercise to the exercises list. No refresh needed
            // Sort alphabetically so new exercises is added to correct spot
            setExercises((prev) => {
                const updated = [
                    ...prev,
                    { id: data.id, user_id: user.id, name: data.name },
                ];
                return updated.sort((a, b) => a.name.localeCompare(b.name));
            });
            toast.success(`Exercise "${data.name}" created.`)
            //setRefreshKey(prev => prev + 1)
        }

        setExerciseName("")
        setErrorMessage("")
        setOpen(false)
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>

                    <button className="button mb-3">Create Exercise</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md h-[250px] flex flex-col justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-center">Create New Exercise</DialogTitle>
                        <DialogDescription className="text-center">
                            Add a new exercise to your list. You’ll be able to log it later.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleNewExerciseSubmit}
                        className="flex flex-col gap-4 flex-1 justify-center"
                    >
                        <div className="flex flex-1 flex-col">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="Add Name"
                                value={exerciseName}
                                onChange={(e) => {
                                    setExerciseName(e.target.value)
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
                            className="button"
                            type="submit"
                            disabled={!exerciseName.trim()}
                        >
                            Create
                        </button>
                    </form>

                </DialogContent>
            </Dialog>
        </div>
    )
}

