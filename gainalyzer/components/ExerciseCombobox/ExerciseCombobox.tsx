import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"


type ExerciseOption = { id: string; name: string }

type ExerciseComboboxProps = {
    exercises: ExerciseOption[]
    setExercises: React.Dispatch<React.SetStateAction<ExerciseOption[]>>
    value: string | null      // selected exercise id
    onChange: (id: string | null) => void
}

export function ExerciseCombobox({ exercises, setExercises, value, onChange }: ExerciseComboboxProps) {
    const [open, setOpen] = useState(false)
    const supabase = createClient();

    // fetch user exercises
    useEffect(() => {
        async function fetchExercises() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("exercises")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });
            //TODO: change to alphabetical ordering

            if (error) {
                console.error(error)
            } else if (data) {
                setExercises((data as any).map((ex: any) => ({
                    id: ex.id,
                    name: ex.name
                })))
            }
        }

        fetchExercises();
    }, [setExercises, supabase]);


    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? exercises.find((exercise) => exercise.id === value)?.name
                        : "Select exercise..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search exercise..." />
                    <CommandList>
                        <CommandEmpty>No exercise found.</CommandEmpty>
                        <CommandGroup>
                            {exercises.map((exercise) => (
                                <CommandItem
                                    key={exercise.id}
                                    value={exercise.id}
                                    onSelect={(currentId) => {
                                        const newId = currentId === value ? null : currentId
                                        onChange(newId)
                                        setOpen(false)
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === exercise.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {exercise.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
