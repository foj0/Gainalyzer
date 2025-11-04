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
import { SupabaseClient, User } from "@supabase/supabase-js";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import ExerciseSelectRow from "../ExercisePopupSelector/ExerciseSelectRow";
import { initial } from "lodash";

type view = "editTemplate" | "selectExercises";

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
    template: Template;
    templateExercises: TemplateExercise[];
    setTemplateExercises: React.Dispatch<React.SetStateAction<TemplateExercise[]>>;
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
    supabase: SupabaseClient;
    user: User | null;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditTemplate = ({ templateExercises, setTemplateExercises, template, setTemplates, supabase, user, open, setOpen }: props) => {
    if (!user) return;
    const [step, setStep] = useState<view>("editTemplate"); // to conditionally render either the editTemplate form or the selectExercises form
    const [exercises, setExercises] = useState([]);
    const [templateName, setTemplateName] = useState(template.name);

    // NOTE: We first edit/add/delete exercises from the template as type Exercise.
    // We convert them to type TemplateExercise in the edit handler where we
    // update the database.
    // So we're basically creating a new template and replacing the old one.

    // Map the templateExercises into type Exercise so we can initialize newTemplateExercises and selectedExercises.
    const initialExercises = templateExercises.map((te: TemplateExercise) => ({
        id: te.exercise_id,
        user_id: user.id,
        name: te.name,
    }));

    // New array of template exercises that we'll update. Initialize as the starting set of exercises.
    const [newTemplateExercises, setNewTemplateExercises] = useState<Exercise[]>(initialExercises);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>(initialExercises);
    const [exerciseSearch, setExerciseSearch] = useState<string>("")
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // fetch user exercises
    useEffect(() => {
        async function fetchExercises() {
            if (!user) return;

            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .eq("user_id", user.id)
                .order("name", { ascending: true });

            if (error) {
                console.error(error);
            } else if (data) {
                setExercises((data as any).map((ex: any) => ({
                    id: ex.id,
                    user_id: ex.user_id,
                    name: ex.name
                })))
            }
        }

        fetchExercises();
    }, []);

    // reset all the template stuff when we open the modal
    function handleOpen() {
        setOpen(true);
        setNewTemplateExercises(initialExercises);
        setTemplateName(template.name);
        setStep("editTemplate");
        setErrorMessage("");
    }

    function handleClose() {
        setOpen(false);
    }

    function handleGoToSelectExercises() {
        // Initialize selector with current exercises
        setSelectedExercises(newTemplateExercises);
        setStep("selectExercises");
    }

    function handleRemoveTemplateExercise(id: string) {
        setNewTemplateExercises(prev => prev.filter(ex => ex.id != id));
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
        setNewTemplateExercises(selectedExercises);
        setStep("editTemplate");
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    async function handleEditTemplate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!user) return;

        const templateExerciseIds = newTemplateExercises.map(e => e.id);

        // Custom atomic function to insert workout_template and all template_exercises.
        // Either all are successful or we undo everything.
        // We convert the Exercises into TemplateExercises?
        const { data, error } = await supabase.rpc("update_template_with_exercises", {
            p_template_id: template.id,
            p_template_name: templateName,
            p_exercise_ids: templateExerciseIds,
        });

        if (error) {
            console.error("Error editing workout template: ", error);
            toast.error("Error editing template.");
            return
        }


        if (data) {
            console.log(data);
            toast.success("Template updated successfully!");
            setTemplates(prev => prev.map(t => t.id === data.id ? data : t));
            setTemplateExercises(data.template_exercises);
        }

        handleClose();
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                {step === "editTemplate" &&
                    <DialogContent className="sm:max-w-md flex flex-col justify-between">
                        <DialogHeader>
                            <DialogTitle className="text-center">Edit Template</DialogTitle>
                            <DialogDescription className="text-center">
                                Add exercises to this template to make it easier to log workouts.
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={handleEditTemplate}
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
                                        {newTemplateExercises.map((templateExercise) => (
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
                            <button className="text-sm bg-gray-500 px-2 py-1 rounded-md" onClick={() => setStep("editTemplate")}>
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
    );
}

export default EditTemplate;
