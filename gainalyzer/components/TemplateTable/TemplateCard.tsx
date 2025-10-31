import { useState } from "react";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { MoreVertical } from "lucide-react";
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import DeleteTemplateAlert from "./DeleteTemplateAlert";
import { toast } from "sonner";
import { RiDeleteBinLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { Tooltip } from 'react-tooltip';
import { BiEditAlt } from "react-icons/bi";
import EditTemplate from "./EditTemplate";
import ViewTemplate from "./ViewTemplate";
import { FaRegEye } from "react-icons/fa";

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
    supabase: SupabaseClient;
    user: User;
    template: Template;
    templateExercises: TemplateExercise[];
    setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
};

export default function TemplateCard({
    supabase,
    user,
    template,
    setTemplates
}: Props) {

    // Only show first 5 exercises
    const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>(template.template_exercises);
    const displayedExercises = templateExercises.slice(0, 5);
    const exerciseList = displayedExercises.map((ex) => ex.name).join(", ");
    const [editOpen, setEditOpen] = useState(false);

    return (
        <div>
            <div
                className="relative bg-white/5 border border-white/10 rounded-2xl p-4 h-[150px] w-[150px]
                              hover:bg-white/10 transition-all shadow-sm "
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-1">
                    <h1 className="text-lg truncate">{template.name}</h1>

                    {/* Edit/Delete menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="template-dropdown-menu"
                        >
                            <ViewTemplate
                                template={template}
                                templateExercises={templateExercises}
                            >
                                <DropdownMenuItem
                                    className="hover:cursor-pointer flex items-center"
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-end gap-1 hover:cursor-pointer">
                                        <FaRegEye className="text-orange-300" />
                                        <p>View</p>
                                    </div>
                                </DropdownMenuItem>
                            </ViewTemplate>
                            <EditTemplate
                                supabase={supabase}
                                user={user}
                                template={template}
                                templateExercises={templateExercises}
                                setTemplateExercises={setTemplateExercises}
                                setTemplates={setTemplates}
                            >
                                <DropdownMenuItem
                                    className="hover:cursor-pointer flex items-center"
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-end gap-1 hover:cursor-pointer">
                                        <BiEditAlt className="text-blue-400 hover:cursor-pointer" />
                                        <p>Edit</p>
                                    </div>
                                </DropdownMenuItem>
                            </EditTemplate>

                            <DeleteTemplateAlert
                                supabase={supabase}
                                user={user}
                                template={template}
                                setTemplates={setTemplates}
                            >
                                <DropdownMenuItem
                                    className="hover:cursor-pointer flex items-center"
                                    onSelect={(e) => e.preventDefault()}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-end gap-1 hover:cursor-pointer">
                                        <RxCross2 className="text-red-500" />
                                        <p>Delete</p>
                                    </div>
                                </DropdownMenuItem>
                            </DeleteTemplateAlert>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Exercise list */}
                <p
                    className="text-left text-sm text-gray-500 whitespace-pre-wrap break-words overflow-hidden 
        text-ellipsis line-clamp-5"
                >
                    {exerciseList}
                    {templateExercises.length > 5 ? ", ..." : ""}
                </p>
            </div >



        </div >
    );
}
