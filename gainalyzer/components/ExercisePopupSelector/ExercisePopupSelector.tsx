import { useState, useEffect } from "react"
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
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import ExerciseRow from "../ExerciseTable/ExerciseRow"



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
    setParentOpen: React.Dispatch<React.SetStateAction<boolean>> // to temporarily close the parent popup so we don't have too much clutter on screen

}

export default function ExercisePopupSelector({ exercises, setExercises, supabase, user, setParentOpen }: props) {
    const [open, setOpen] = useState(false)
    const [exerciseName, setExerciseName] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);


    async function handleNewExerciseSubmit(e: React.FormEvent<HTMLFormElement>) {
        setOpen(false);
        setParentOpen(true);
        return;
        // e.preventDefault()
        // if (!user) return;
        //
        // const trimmedName = exerciseName.trim()
        // if (!trimmedName) return
        //
        // // Prevent duplicates (case-insensitive)
        // const duplicate = exercises.some(
        //     (ex) => ex.name.toLowerCase() === trimmedName.toLowerCase()
        // )
        // if (duplicate) {
        //     setErrorMessage("This exercise already exists.")
        //     return
        // }
        //
        // // Insert new exercise into DB
        // const { data, error } = await supabase
        //     .from("exercises")
        //     .insert([{ name: trimmedName, user_id: user.id }])
        //     .select()
        //     .single()
        //
        // if (error) {
        //     console.error(error)
        // } else if (data) {
        //     // Add the newly created exercise to the exercises list. No refresh needed
        //     // Sort alphabetically so new exercises is added to correct spot
        //     setExercises((prev) => {
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

    // useEffect(() => {
    //     if (open) {
    //         setParentOpen(false);
    //     } else {
    //         setParentOpen(true);
    //     }
    // }, [open])

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


    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>

                    <button className="button mb-3">Add Exercises</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md flex flex-col justify-between max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center">Add Exercises</DialogTitle>
                        <DialogDescription className="text-center">
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative w-full max-w-sm mb-2">
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

                    {/* List of user exercises */}
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <TbLoader2 className="animate-spin" />
                        </div>
                    ) :
                        filteredExercises.length > 0 ?
                            <div className="border border-[#333333] max-h-[60vh] overflow-y-auto">
                                {filteredExercises.map(e => (
                                    <ExerciseRow
                                        key={e.id}
                                        supabase={supabase}
                                        user={user}
                                        exercise={e}
                                        setExercises={setExercises}
                                    />

                                ))}
                            </div>
                            :
                            <div className="flex justify-center text-gray-500">No exercises.</div>
                    }



                    <form
                        onSubmit={handleNewExerciseSubmit}
                        className="flex flex-col gap-4 flex-1 justify-center"
                    >
                        <div className="flex flex-1 flex-col">
                        </div>

                        <button
                            className="button"
                            type="submit"
                            disabled={!exerciseName.trim()}
                        >
                            Add
                        </button>
                    </form>

                </DialogContent>
            </Dialog>
        </div>
    )
}


