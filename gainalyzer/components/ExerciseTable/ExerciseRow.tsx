import { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { BsChevronDown } from "react-icons/bs";
import { TbLoader2 } from "react-icons/tb";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Tooltip } from "react-tooltip";
import EditExerciseDialog from "./EditExerciseDialog";
import DeleteExerciseAlert from "./DeleteExerciseAlert";

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type ExerciseRowProps = {
    supabase: SupabaseClient;
    user: User;
    exercise: Exercise;
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
}

export default function ExerciseRow({ supabase, user, exercise, setExercises }: ExerciseRowProps) {
    const [logs, setLogs] = useState<any>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function toggleDropdown() {
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
                .eq("logs.user_id", user.id) // ✅ filter through join
                .order("created_at", { ascending: false });

            console.log(data);
            setLogs(data || []);
            setLoading(false);

        }
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
                        <EditExerciseDialog user={user} supabase={supabase} exercise={exercise} />
                        <DeleteExerciseAlert user={user} supabase={supabase} exercise={exercise} setExercises={setExercises} />
                    </div>
                </div>
                {open && (
                    <div className="p-2">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <TbLoader2 className="animate-spin" />
                            </div>
                        ) : logs.length > 0 ? (
                            <table className="text-sm">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="text-left px-4 py-1">Weight (lbs)</th>
                                        <th className="text-left px-4 py-1">Reps</th>
                                        <th className="text-left px-4 py-1">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.logs.id}>
                                            <td className="px-4 py-1">{log.weight}</td>
                                            <td className="px-4 py-1">{log.reps}</td>
                                            <td className="px-4 py-1">{log.logs?.log_date}</td>
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
