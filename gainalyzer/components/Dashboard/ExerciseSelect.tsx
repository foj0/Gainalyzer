import { useState, useRef, useEffect } from "react";

interface Exercise {
    id: string;
    name: string;
}

interface Props {
    userExercises: Exercise[] | null;
    selectedExercise: string;
    setSelectedExercise: (value: string) => void;
}

export default function ExerciseSelect({ userExercises, selectedExercise, setSelectedExercise }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative w-40 m-2">
            <button
                className="w-full border rounded px-2 py-1 text-sm text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedExercise || "Select exercise"}
            </button>

            {isOpen && (
                <ul className="exercise-select absolute left-0 top-full w-full rounded shadow-lg z-10 max-h-60 overflow-auto">
                    {userExercises?.map((exercise) => (
                        <li
                            key={exercise.id}
                            className="px-2 py-1 hover:bg-blue-700 cursor-pointer"
                            onClick={() => {
                                setSelectedExercise(exercise.name);
                                setIsOpen(false);
                            }}
                        >
                            {exercise.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

