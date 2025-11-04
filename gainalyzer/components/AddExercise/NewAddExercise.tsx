import { Search } from "lucide-react";
import { TbLoader2 } from "react-icons/tb";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { LuPlus } from "react-icons/lu";
import { LuCirclePlus } from "react-icons/lu";
import { useState, useEffect } from "react";
import { ExerciseCombobox } from "@/components/ExerciseCombobox/ExerciseCombobox";
import { NewExercise } from "./NewExercise";
import { createClient } from "@/utils/supabase/client"
import AddTemplate from "./AddTemplate";
import { SupabaseClient, User } from "@supabase/supabase-js";
import ExerciseSelectRow from "../ExercisePopupSelector/ExerciseSelectRow";
import { BsChevronDown } from "react-icons/bs";

type Tab = "exercise" | "template";

type Exercise = {
    id: string
    user_id: string;
    name: string
}

type LogExercise = {
    id: string        // log_exercises.id - unique per log entry
    exercise_id: string // real exercise UUID
    name: string
    weight: string      // maps to log_exercises.weight
    reps: string        // maps to log_exercises.reps
    notes: string       // maps to log_exercises.notes
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

type Props = {
    logExercises: LogExercise[];
    setLogExercises: React.Dispatch<React.SetStateAction<LogExercise[]>>;
    supabase: SupabaseClient;
    user: User;
    onAdd: (exercises: Exercise[]) => void;
}

type TemplateItemProps = {
    template: Template;
    onAddTemplate: (templateId: string) => void;
};
const TemplateItem = ({ template, onAddTemplate }: TemplateItemProps) => {
    return (
        <div className="flex flex-col pb-2 mb-2 border-b border-[#333333] ">
            <div className="flex justify-between items-center">
                <h1>{template.name}</h1>
                <button className="cursor-pointer" onClick={() => onAddTemplate(template.id)}>
                    <div className="flex items-center">
                        <LuPlus size={20} />
                        Add
                    </div>

                </button>
            </div>
            <div>
                <ul>
                    {template.template_exercises.map(te => (
                        <li key={te.id} className="text-gray-500 text-sm">
                            {te.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export const NewAddExercise = ({ logExercises, setLogExercises, supabase, user, onAdd }: Props) => {
    const [open, setOpen] = useState<boolean>(false);
    const [tab, setTab] = useState<Tab>("exercise");
    const [refreshKey, setRefreshKey] = useState(0); // updated when we add an exercise in NewExercise to trigger a refetch
    const [exerciseSearch, setExerciseSearch] = useState<string>("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);

    useEffect(() => {
        async function fetchExercises() {
            if (!user) return;
            const { data, error } = await supabase
                .from("exercises")
                .select("id, user_id, name")
                .eq("user_id", user.id)
                .order("name", { ascending: true })

            if (error) {
                console.error(error);
                return;
            } else if (data) {
                setExercises((data).map((exercise) => ({
                    id: exercise.id,
                    user_id: exercise.user_id,
                    name: exercise.name
                })));
            }
        }

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

        fetchExercises();
        fetchTemplates();
    }, [user])

    useEffect(() => {
        if (exerciseSearch == "") {
            setFilteredExercises(exercises);
        } else {
            const searchFilteredExercises = exercises.filter((exercise) => (exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())));
            setFilteredExercises(searchFilteredExercises);
        }
    }, [exercises, exerciseSearch]);

    // so that when we delete an exercise card from log it reflects in the exercise select checkboxes
    useEffect(() => {
        setSelectedExercises(logExercises.map(ex => (
            {
                id: ex.id,
                user_id: "",
                name: ex.name,
            })));

    }, [logExercises])

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newInput: string = e.target.value;
        setExerciseSearch(newInput);
    }

    // When we press "Save" button to submit selected exercises
    function handleSaveExercises() {
        setLogExercises(selectedExercises.map((ex) => (
            {
                id: ex.id,
                exercise_id: ex.id,
                name: ex.name,
                weight: "",
                reps: "",
                notes: "",
            }
        )));
        setOpen(false);
    }

    function handleAddTemplateToLog(templateId: string) {
        const template = templates.find(t => t.id == templateId);
        if (!template) return;

        setLogExercises(prev => {
            // Get a list of exercise_ids already in the log
            const existingIds = new Set(prev.map(ex => ex.exercise_id));

            // Filter out exercises that already exist
            const newExercises = template.template_exercises
                .filter(te => !existingIds.has(te.exercise_id))
                .map(te => ({
                    id: te.exercise_id,
                    exercise_id: te.exercise_id,
                    name: te.name,
                    weight: "",
                    reps: "",
                    notes: "",
                }));

            return [...prev, ...newExercises];
        });
        setTab("exercise")
        setOpen(false);
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className="flex justify-center">
                        <button className="flex justify-center items-center gap-2 cursor-pointer">
                            <LuCirclePlus size={25} />
                            Add Exercise
                        </button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>Add to Log</DialogTitle>
                        </DialogHeader>
                    </VisuallyHidden>

                    {/* Tabs to switch between selecting exercises or adding a template */}
                    <div className="flex justify-center mb-4 border-b border-[#333333]">
                        <div className="tabs font-extralight text-base">
                            <div className="flex items-center">
                                <p className={`tab ${tab === "exercise" ? "tab-selected" : ""} flex items-center justify-center my-1 hover:cursor-pointer`}
                                    onClick={() => setTab("exercise")}
                                >
                                    Exercise
                                </p>
                                <p className={`tab ${tab === "template" ? "tab-selected" : ""} flex items-center justify-center my-1 hover:cursor-pointer `}
                                    onClick={() => setTab("template")}
                                >
                                    Template
                                </p>
                            </div>
                        </div>
                    </div>

                    {tab === "exercise" &&
                        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">

                            <VisuallyHidden>
                                <DialogDescription>
                                    Select exercises to add to the log.
                                </DialogDescription>
                            </VisuallyHidden>

                            <div className="flex justify-center text-lg medium mb-2">
                                <h1>Select Exercises to Add</h1>
                            </div>
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
                                    <div className="border border-[#333333] overflow-y-auto">
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
                            <div className="flex justify-center w-full mt-3">
                                <button
                                    className="button w-5/10"
                                    onClick={handleSaveExercises}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    }


                    {tab === "template" &&
                        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                            <VisuallyHidden>
                                <DialogDescription>
                                    Select a template to add to the log.
                                </DialogDescription>
                            </VisuallyHidden>

                            <div className="flex justify-center text-lg medium mb-2">
                                <h1>Add a Workout Template</h1>
                            </div>

                            <div className="custom-border-color p-4">
                                {
                                    templates.length == 0 ?
                                        <div>No Templates.</div>
                                        :
                                        <ul className='w-full'>
                                            {templates.map(t => (
                                                <li key={t.id}>
                                                    <TemplateItem template={t} onAddTemplate={handleAddTemplateToLog} />
                                                </li>
                                            ))}
                                        </ul>
                                }
                            </div>
                        </div>
                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}
