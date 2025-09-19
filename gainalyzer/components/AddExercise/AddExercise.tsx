import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { LuCirclePlus } from "react-icons/lu";
import { useState } from "react";
import { ExerciseCombobox } from "@/components/ExerciseCombobox/ExerciseCombobox";
import { NewExercise } from "./NewExercise";

type ExerciseOption = { id: string; name: string }

export const AddExercise = ({ onAdd }: { onAdd: (exercise: ExerciseOption) => void }) => {
    const [exercises, setExercises] = useState<ExerciseOption[]>([])
    const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

    function handleAdd(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedExerciseId) return

        // Find selected exercise object
        const exercise = exercises.find((ex) => ex.id === selectedExerciseId)
        if (!exercise) return

        onAdd(exercise)              // pass the full {id, name} object
        setSelectedExerciseId(null)  // reset combobox

        console.log("Adding exercise:", exercise)
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex justify-center">
                        <button className="flex justify-center items-center gap-2 cursor-pointer">
                            <LuCirclePlus size={25} />
                            Add Exercise
                        </button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Exercise</DialogTitle>
                        <DialogDescription>
                            Pick an exercise or create a new one.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">

                        {/* Create New Exercise Dialog */}
                        <NewExercise exercises={exercises} setExercises={setExercises} />

                        <form onSubmit={handleAdd} className="flex flex-col">
                            <ExerciseCombobox
                                exercises={exercises}
                                setExercises={setExercises}
                                value={selectedExerciseId}
                                onChange={setSelectedExerciseId}
                            />
                            <div className="flex w-full">
                                <button
                                    className="button mt-3 w-full"
                                    type="submit"
                                    disabled={!selectedExerciseId}
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
