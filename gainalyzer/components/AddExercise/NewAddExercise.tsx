import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { LuCirclePlus } from "react-icons/lu";
import { useState, useEffect } from "react";
import { ExerciseCombobox } from "@/components/ExerciseCombobox/ExerciseCombobox";
import { NewExercise } from "./NewExercise";
import { createClient } from "@/utils/supabase/client"
import AddTemplate from "./AddTemplate";
import { SupabaseClient, User } from "@supabase/supabase-js";

type Tab = "exercise" | "template";

type Exercise = {
    id: string
    name: string
}

type Props = {
    exercises: Exercise[];
    supabase: SupabaseClient;
    user: User;
    onAdd: (exercises: Exercise[]) => void;
}

{/* <div className="tabs w-fit font-extralight text-base"> */ }
{/*     <div className="flex items-center"> */ }
{/*         <p className={`tab ${tab === "exercise" ? "tab-selected" : ""} flex items-center justify-center my-1 hover:cursor-pointer`} */ }
{/*             onClick={() => setTab("exercise")} */ }
{/*         > */ }
{/*             Exercise */ }
{/*         </p> */ }
{/*         <p className={`tab ${tab === "template" ? "tab-selected" : ""} flex items-center justify-center my-1 hover:cursor-pointer `} */ }
{/*             onClick={() => setTab("template")} */ }
{/*         > */ }
{/*             Template */ }
{/*         </p> */ }
{/*     </div> */ }
{/* </div> */ }


export const NewAddExercise = ({ exercises, supabase, user, onAdd }: Props) => {
    const [tab, setTab] = useState<Tab>("exercise");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [refreshKey, setRefreshKey] = useState(0); // updated when we add an exercise in NewExercise to trigger a refetch

    return (
        <div>
            {/* Tabs */}
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
                    <VisuallyHidden>
                        <DialogHeader>
                            <DialogTitle>Add to Log</DialogTitle>
                        </DialogHeader>
                    </VisuallyHidden>

                    <div className="flex justify-center mb-4 border-b border-white/10">
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
                        <div className="flex flex-col gap-2">

                            Exercise stuff
                        </div>
                    }


                    {tab === "template" &&
                        <div className="flex flex-col gap-2">

                            Template stuff
                        </div>
                    }

                </DialogContent>
            </Dialog>
        </div>
    )
}
