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
    user: User | null;
    supabase: SupabaseClient;
    template: Template;
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
    children: React.ReactNode; // will be the <DropdownMenuItem>
}

export default function DeleteTemplateAlert({ user, supabase, template, setTemplates, children }: props) {

    async function handleDelete() {
        if (!user) return;

        // will also delete any related template_exercise rows by cascading on foreign key
        const { error } = await supabase
            .from("workout_templates")
            .delete()
            .eq("user_id", user.id)
            .eq("id", template.id);

        if (error) {
            console.error("Error deleting template: ", error);
            toast.error("Failed to delete template.");
            return;
        } else {
            setTemplates((prev) => prev.filter((t) => t.id !== template.id));
            toast.success("Template deleted successfully!");
        }
    }


    // <div className="flex justify-center hover:cursor-pointer">
    //     <a id="Delete" className="w-full">
    //         <div className="flex items-center gap-1">
    //             <RiDeleteBinLine className="text-gray-500 hover:cursor-pointer" />
    //             <p>Delete</p>
    //         </div>
    //     </a>
    //     <Tooltip
    //         anchorSelect="#Delete"
    //         content="Delete template"
    //     />
    // </div>

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {/* You can pass any React node as the trigger use asChild */}
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this template.
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
    )
}

