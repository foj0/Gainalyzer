import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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


type ExerciseOption = { id: string; name: string }

type ExerciseComboboxProps = {
    exercises: ExerciseOption[]
    setExercises: React.Dispatch<React.SetStateAction<ExerciseOption[]>>
    value: string | null      // selected exercise id
    onChange: (id: string | null) => void
}

export function ExerciseCombobox({ exercises, setExercises, value, onChange }: ExerciseComboboxProps) {
    const [open, setOpen] = useState(false)

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
                                    value={exercise.name} // use name to filter search results
                                    onSelect={() => {
                                        // store the id in state, not the name
                                        // If the user clicked the exercise that’s already selected, deselect it. Otherwise, select the clicked exercise.
                                        const newId = value === exercise.id ? null : exercise.id
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
