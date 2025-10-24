import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { Tooltip } from 'react-tooltip';
import { toast } from "sonner";
import { RiDeleteBinLine } from "react-icons/ri";


type Exercise = {
    id: string;
    user_id: string;
    name: string;
}


type props = {
    user: User;
    supabase: SupabaseClient;
    exercise: Exercise;
    setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
}

export default function DeleteExerciseAlert({ user, supabase, exercise, setExercises }: props) {
    const [name, setName] = useState<string>(exercise.name);

    async function handleDelete() {
        const { error } = await supabase
            .from("exercises")
            .delete()
            .eq("user_id", user.id)
            .eq("id", exercise.id);

        if (error) {
            console.error("Error deleting exercise: ", error);
            toast.error("Failed to delete exercise.");
            return;
        } else {
            // Immediately update local state without refresh
            setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
            toast.success("Exercise was deleted");
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newName: string = e.target.value;
        setName(newName);
    }

    function handleInputBlur() {
        if (name == "") setName(exercise.name);
    }

    return (
        <div>
            <AlertDialog>
                <AlertDialogTrigger>
                    <div className="flex justify-center hover:cursor-pointer">
                        <a id="Delete">
                            <RiDeleteBinLine className="text-gray-500 hover:cursor-pointer" />
                        </a>
                        <Tooltip
                            anchorSelect="#Delete"
                            content="Delete exercise"
                        />
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this exercise.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>
                            <div className="hover:cursor-pointer" onClick={handleDelete}>
                                Continue
                            </div>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
