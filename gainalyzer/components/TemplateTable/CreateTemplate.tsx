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
import { toast } from "sonner"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { RiDeleteBinLine } from "react-icons/ri";
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import ExerciseSelectRow from "../ExercisePopupSelector/ExerciseSelectRow";

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
    name: string;
}

type Template = {
    id: string;
    name: string;
    template_exercises: TemplateExercise[];
}

type props = {
    open: boolean;
    onClose: () => void;
    exercises: Exercise[];
    templates: Template[];
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
    supabase: SupabaseClient;
    user: User | null;
}

export default function CreateTemplate({ open, onClose, exercises, templates, setTemplates, supabase, user }: props) {
    // const [open, setOpen] = useState(false); // if the dialog is open
    const [step, setStep] = useState<view>("createTemplate"); // to conditionally render either the createTemplate form or the selectExercises form
    const [templateName, setTemplateName] = useState("");
    const [templateExercises, setTemplateExercises] = useState<Exercise[]>([]); // exercises added to this template
    const [errorMessage, setErrorMessage] = useState("");

    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(templateExercises);
    const [loading, setLoading] = useState(false);


    // reset all the template stuff when we open he modal
    function handleOpen() {
        // setOpen(true);
        setTemplateExercises([]);
        setTemplateName("");
        setStep("createTemplate");
        setErrorMessage("");
    }

    function handleClose() {
        // setOpen(false);
        //setStep("createTemplate");
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

    // When we press "Save" button to submit. Not just clicking the checkbox.
    function handleSaveExercises() {
        setTemplateExercises(selectedExercises);
        setStep("createTemplate");
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    async function handleCreateTemplate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!user) return;

        const templateExerciseIds = templateExercises.map(e => e.id);

        // Custom atomic function to insert workout_template and all template_exercises.
        // Either all are successful or we undo everything.
        const { error } = await supabase.rpc("create_template_with_exercises", {
            template_name: templateName,
            user_id: user.id,
            exercise_ids: templateExerciseIds
        })

        if (error) {
            console.error("Error creating workout template: ", error);
            toast.error("Error creating template.");
            return
        }
        toast.success("Template created successfully!")

        handleClose();
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogTrigger asChild>
                    <button className="button mb-3" onClick={handleOpen}>Create Template</button>
                </DialogTrigger>

                {step === "createTemplate" &&
                    <DialogContent className="sm:max-w-md flex flex-col justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-center">New Template</DialogTitle>
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
                                    className={`input template-name-input border-[#333333] w-full border rounded-md px-3 py-2 text-sm focus:outline-none ${errorMessage
                                        ? "border-red-500 focus:ring-red-400"
                                        : ""
                                        }`}
                                />
                                {errorMessage && (
                                    <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <h3 className="">Exercises</h3>
                                <button
                                    type="button"
                                    className="button"
                                    onClick={handleGoToSelectExercises}
                                >
                                    Add Exercises
                                </button>

                            </div>
                            <div className="template-exercises border rounded-lg p-2">
                                {templateExercises.length > 0 ?
                                    <ul className="flex flex-col divide-y divide-white/10">
                                        {templateExercises.map((templateExercise) => (
                                            <li
                                                key={templateExercise.id}
                                                className="flex justify-between items-center py-2 px-3 rounded-md transition-colors"
                                            >
                                                <span className="text-sm font-medium">{templateExercise.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTemplateExercise(templateExercise.id)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors hover:cursor-pointer"
                                                    title="Remove exercise"
                                                >
                                                    <RiDeleteBinLine className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    :
                                    <div className="flex justify-center items-center h-30">
                                        <p className="text-gray-500">No Exercises.</p>
                                    </div>
                                }
                            </div>

                            <div className="flex w-full border-t-[#333333] ">
                                <button
                                    className="button w-full"
                                    type="submit"
                                    disabled={!templateName.trim() || (templateExercises.length < 1)}
                                >
                                    Save
                                </button>
                            </div>

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
        </div >
    )
}

