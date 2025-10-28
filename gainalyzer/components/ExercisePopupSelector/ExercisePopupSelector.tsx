import { useState, useEffect } from "react"

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Apple, Wallet } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
    InnerDialog,
    InnerDialogTrigger,
    InnerDialogContent,
    InnerDialogHeader,
    InnerDialogFooter,
    InnerDialogTitle,
    InnerDialogDescription,
} from "@/components/ui/dialog"

import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import ExerciseSelectRow from "./ExerciseSelectRow"
import { Checkbox } from "@headlessui/react"

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type props = {
    exercises: Exercise[]
    templateExercises: Exercise[]
    setTemplateExercises: React.Dispatch<React.SetStateAction<Exercise[]>>
    // setRefreshKey: React.Dispatch<React.SetStateAction<number>>
    supabase: SupabaseClient;
    user: User | null;

}

export default function ExercisePopupSelector({ exercises, templateExercises, setTemplateExercises, supabase, user }: props) {
    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(templateExercises);
    const [loading, setLoading] = useState(false);


    // Reset local selection whenever popup opens
    useEffect(() => {
        if (open) {
            setSelectedExercises(templateExercises);
        }
    }, [open, templateExercises]);


    useEffect(() => {
        if (exerciseSearch == "") {
            setFilteredExercises(exercises);
        } else {
            const searchFilteredExercises = exercises.filter((exercise) => (exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())));
            setFilteredExercises(searchFilteredExercises);
        }
    }, [exercises, exerciseSearch]);

    // When we press "add" to submit. Not just clicking the checkbox.
    function handleSaveExercises() {
        setTemplateExercises(selectedExercises);
        setOpen(false);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }


    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="button mb-3">Add Exercises</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md flex flex-col justify-between max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center mb-4">Select Exercises</DialogTitle>
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


                {loading ? (
                    <div className="flex justify-center py-4">
                        <TbLoader2 className="animate-spin" />
                    </div>
                ) :
                    filteredExercises.length > 0 ?
                        <div className="border border-[#333333] max-h-[60vh] overflow-y-auto">
                            {filteredExercises.map(e => (
                                <ExerciseSelectRow
                                    key={e.id}
                                    supabase={supabase}
                                    user={user}
                                    exercise={e}
                                    templateExercises={templateExercises}
                                    selectedExercises={selectedExercises}
                                    setSelectedExercises={setSelectedExercises}
                                />

                            ))}
                        </div>
                        :
                        <div className="flex justify-center text-gray-500">No exercises.</div>
                }

                <DialogFooter>
                    <div className="flex justify-center w-full mt-3">
                        <DialogClose asChild>
                            <button
                                className="button w-5/10"
                                onClick={handleSaveExercises}
                            >
                                save
                            </button>
                        </DialogClose>
                    </div>

                </DialogFooter>
            </DialogContent>
        </Dialog>

    );
}
