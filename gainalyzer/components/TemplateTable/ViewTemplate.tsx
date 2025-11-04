import { useState } from "react";
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
    template: Template;
    templateExercises: TemplateExercise[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
}

const ViewTemplate = ({ template, templateExercises, open, setOpen, children }: Props) => {
    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>

                <DialogContent className="sm:max-w-md flex flex-col justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-center mb-3">{template.name}</DialogTitle>
                        <div>
                            <div
                                className="flex flex-col gap-4 flex-1 justify-center"
                            >
                                <div className="template-exercises rounded-lg p-2">
                                    {templateExercises.length > 0 ?
                                        <ul className="flex flex-col ">
                                            {template.template_exercises.map((templateExercise) => (
                                                <li
                                                    key={templateExercise.id}
                                                    className="flex justify-between items-center py-2 px-3 rounded-md transition-colors"
                                                >
                                                    <span className="">{templateExercise.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        :
                                        <div className="flex justify-center items-center h-30">
                                            <p className="text-gray-500">No Exercises.</p>
                                        </div>
                                    }
                                </div>
                            </div>

                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default ViewTemplate
