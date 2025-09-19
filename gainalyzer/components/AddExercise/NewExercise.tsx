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

type ExerciseOption = { id: string; name: string }

type NewExerciseProps = {
    exercises: ExerciseOption[]
    setExercises: React.Dispatch<React.SetStateAction<ExerciseOption[]>>
}

export const NewExercise = ({ exercises, setExercises }: NewExerciseProps) => {
    const supabase = createClient();
    const [open, setOpen] = useState(false)
    const [exerciseName, setExerciseName] = useState("")
    const [errorMessage, setErrorMessage] = useState("")

    async function handleNewExerciseSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
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

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
            setExercises((prev) => [
                ...prev,
                { id: data.id, name: data.name }
            ])
            toast.success(`Exercise "${data.name}" created.`)
        }

        setExerciseName("")
        setErrorMessage("")
        setOpen(false)
    }

    async function handleDeleteExercise(id: number) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);

        if (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="text-blue-400 cursor-pointer">New</button>
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
