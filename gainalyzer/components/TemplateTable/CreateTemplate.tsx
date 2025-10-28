import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { RiDeleteBinLine } from "react-icons/ri";
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import ExerciseSelectRow from "../ExercisePopupSelector/ExerciseSelectRow"


type view = "createTemplate" | "selectExercises";

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
    supabase: SupabaseClient;
    user: User | null;
}


export default function CreateTemplate({ exercises, setTemplates, supabase, user }: props) {
    // const [open, setOpen] = useState(false); // if the dialog is open
    const [step, setStep] = useState<view>("createTemplate"); // to conditionally render either the createTemplate form or the selectExercises form
    const [templateName, setTemplateName] = useState("");
    const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]); // exercises added to this template
    const [exerciseName, setExerciseName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(templateExercises);
    const [loading, setLoading] = useState(false);


    function handleOpen() {
        // setOpen(true);
        setStep("createTemplate");
        setErrorMessage("");
    }

    function handleClose() {
        // setOpen(false);
        setStep("createTemplate");
    }

    function handleGoToSelectExercises() {
        // Initialize selector with current exercises
        setSelectedExercises(templateExercises);
        setStep("selectExercises");
    }


    function handleRemoveTemplateExercise(id: string) {
        setTemplateExercises(prev => prev.filter(ex => ex.id != id));
    }

    // SelectExercises popup functions 
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
        // setOpen(false);
        setStep("createTemplate");
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    // TODO: on submit we convert Exercise to Template Exercise to store in Supabase
    async function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!user) return;

        const name = templateName.trim();
        if (!name || templateExercises.length === 0) return;

        // ... DB insert logic here ...
        console.log("Creating template:", name, templateExercises);

        handleClose();
    }

    return (
        <div>
            <Dialog >
                <DialogTrigger asChild>

                    <button className="button mb-3" onClick={handleOpen}>Create Template</button>
                </DialogTrigger>
                {step === "createTemplate" &&

                    <DialogContent className="sm:max-w-md flex flex-col justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-center">Create New Workout Template</DialogTitle>
                            <DialogDescription className="text-center">
                                Add exercises to this template to make it easier to log workouts.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleCreateTemplate}
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

                            <DialogClose>
                                <div className="flex ">
                                    <button
                                        className="text-sm bg-blue-400 w-fit px-2 py-1 rounded-md disabled:bg-gray-600 disabled:cursor-default cursor-pointer"
                                        type="submit"
                                        disabled={!templateName.trim() || (templateExercises.length < 1)}
                                    >
                                        Create
                                    </button>
                                </div>
                            </DialogClose>
                            {(<ul>
                                {templateExercises.map((templateExercise) => (
                                    <li key={templateExercise.id}>
                                        <div className="flex justify-between m-2">
                                            {templateExercise.name}
                                            <RiDeleteBinLine onClick={() => handleRemoveTemplateExercise(templateExercise.id)} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            )}
                            <button
                                type="button"
                                className="button mb-3"
                                onClick={handleGoToSelectExercises}
                            >
                                Add Exercises
                            </button>

                        </form>
                    </DialogContent>
                }
                {step === "selectExercises" &&
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
                        </DialogFooter>
                        <div className="flex justify-center w-full mt-3">
                            <button className="text-sm bg-gray-500 px-2 py-1 rounded-md" onClick={() => setStep("createTemplate")}>
                                Cancel
                            </button>
                            <button
                                className="button w-5/10"
                                onClick={handleSaveExercises}
                            >
                                Save
                            </button>

                        </div>
                    </DialogContent>
                }
            </Dialog>
        </div>
    )
}

