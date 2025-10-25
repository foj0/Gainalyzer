import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SupabaseClient, User } from "@supabase/supabase-js"
import { BiEditAlt } from "react-icons/bi";
import { Tooltip } from 'react-tooltip';
import { toast } from "sonner";

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type props = {
    user: User | null;
    supabase: SupabaseClient;
    exercise: Exercise;
}

export default function EditExerciseDialog({ user, supabase, exercise }: props) {
    const [name, setName] = useState<string>(exercise.name);

    async function handleSubmit() {
        if (!user) return;

        if (exercise.name.toLowerCase() === name.toLowerCase()) {
            toast.warning("Exercise name already in use.");
            return
        }

        const { error } = await supabase
            .from("exercises")
            .update(
                {
                    name: name,
                },
            )
            .eq("user_id", user.id)
            .eq("id", exercise.id);

        if (error) {
            console.error("Error updating exercise name: ", error);
            toast.error("Failed to update exercise name");
            return;
        } else {
            toast.success("Exercise name was updated");
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
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex justify-center">
                        <button className="flex justify-center items-center gap-2 cursor-pointer">
                            <a id="Edit">
                                <BiEditAlt className="text-gray-500 hover:cursor-pointer" />
                            </a>
                            <Tooltip
                                anchorSelect="#Edit"
                                content="Edit exercise"
                            />
                        </button>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Exercise</DialogTitle>
                        <DialogDescription>
                            Change the name of the exercise.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <input placeholder="name"
                                value={name}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                className="search-input w-full p-4 py-2 rounded-lg placeholder-gray-500 focus:outline-none"
                            />
                            <div className="flex w-full">
                                <button
                                    className="button mt-3 w-20"
                                    type="submit"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
