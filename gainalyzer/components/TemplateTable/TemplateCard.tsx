import { SupabaseClient, User } from "@supabase/supabase-js";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TemplateExercise = {
    id: string;
    template_id: string;
    exercise_id: string;
    name: string;
};

type Props = {
    supabase: SupabaseClient;
    user: User;
    templateName: string;
    templateExercises: TemplateExercise[];
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function TemplateCard({
    supabase,
    user,
    templateName,
    templateExercises,
    onEdit,
    onDelete,
}: Props) {
    // Only show first 5 exercises
    const displayedExercises = templateExercises.slice(0, 5);
    const exerciseList = displayedExercises.map((ex) => ex.name).join(", ");

    return (
        <div
            className="relative bg-white/5 border border-white/10 rounded-2xl p-4 h-[150px] w-[150px]
      hover:bg-white/10 transition-all shadow-sm cursor-pointer"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg truncate">{templateName}</h3>

                {/* Edit/Delete menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-white/10 rounded-md">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a1a] border border-gray-700">
                        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Exercise list */}
            <p
                className="text-sm text-gray-500 whitespace-pre-wrap break-words overflow-hidden 
        text-ellipsis line-clamp-5"
            >
                {exerciseList}
                {templateExercises.length > 5 ? ", ..." : ""}
            </p>
        </div>
    );
}
