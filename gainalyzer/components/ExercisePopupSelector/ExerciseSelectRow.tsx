import { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { TbLoader2 } from "react-icons/tb";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Tooltip } from "react-tooltip";
import { CheckIcon } from '@heroicons/react/16/solid'
import { Checkbox } from "@/components/ui/checkbox"

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type ExerciseRowProps = {
    supabase: SupabaseClient;
    user: User | null;
    exercise: Exercise;
    selectedExercises: Exercise[];
    setSelectedExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
    units: string | null;
}

export default function ExerciseSelectRow({ supabase, user, exercise, selectedExercises, setSelectedExercises, units }: ExerciseRowProps) {
    const [logs, setLogs] = useState<any>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [enabled, setEnabled] = useState(false);
    const enabled = selectedExercises.some(ex => ex.id === exercise.id);

    // Helper conversion functions to convert from lbs to kg
    const convertFromBase = (lbs: number | null) => {
        if (lbs === null || lbs === undefined) return "";
        if (units === "kg") {
            return (lbs * 0.45359237).toFixed(1); // to string
        }
        // if weight is already in lbs just return that, no need to convert
        return lbs.toString();
    }

    async function toggleDropdown() {
        if (!user) return;
        setOpen(!open);
        if (!open && logs.length === 0) {
            setLoading(true);
            const { data } = await supabase
                .from("log_exercises")
                .select(`
                    weight, reps, notes,
                    logs!inner(id, log_date, user_id)
                  `)
                .eq("exercise_id", exercise.id)
                .eq("logs.user_id", user.id) // filter through join
                .order("created_at", { ascending: false });

            setLogs(data || []);
            setLoading(false);

        }
    }

    function handleCheckboxToggle(checked: boolean) {
        // setEnabled(checked);

        setSelectedExercises(prev => {
            if (checked) {
                // Add this exercise if it’s not already in the list
                if (!prev.some(ex => ex.id === exercise.id)) {
                    return [...prev, exercise];
                }
                return prev; // no duplicates
            } else {
                // Remove this exercise
                return prev.filter(ex => ex.id !== exercise.id);
            }
        });
    }

    return (
        <div className="exercise-row p-4">
            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <span>{exercise.name}</span>
                    <div className="flex gap-6">
                        <a id="ChevronDown">
                            <BsChevronDown
                                className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""} hover:cursor-pointer`}
                                onClick={toggleDropdown}
                            />
                        </a>
                        <Tooltip
                            anchorSelect="#ChevronDown"
                            content="View logs"
                        />
                        <Checkbox
                            checked={enabled}
                            onCheckedChange={handleCheckboxToggle}
                            className="group size-6 rounded-md bg-white/10 p-1 ring-1 ring-white/15 
                            ring-inset focus:not-data-focus:outline-none data-checked:bg-white 
                            data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
                        >
                            <CheckIcon className="hidden size-4 fill-black group-data-checked:block" />
                        </Checkbox>
                    </div>
                </div>
                {open && (
                    <div className="p-2">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <TbLoader2 className="animate-spin" />
                            </div>
                        ) : logs.length > 0 ? (
                            <table className="exercise-dropdown-table text-sm">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="text-left px-6 py-1">Date</th>
                                        <th className="text-left px-6 py-1">Weight ({units})</th>
                                        <th className="text-left px-6 py-1">Reps</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log: any) => (
                                        <tr key={log.logs.id}>
                                            <td className="px-6 py-2">{log.logs?.log_date}</td>
                                            <td className="px-6 py-2">{convertFromBase(log.weight)}</td>
                                            <td className="px-6 py-2">{log.reps}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-400 text-center py-2">
                                No logs for this exercise yet.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
