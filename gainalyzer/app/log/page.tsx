'use client'
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker/DatePicker";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react"
import Sidebar from "@/components/Sidebar/Sidebar"
import { useLogInputs } from "@/hooks/useLogInputs";
import { AddExercise } from "@/components/AddExercise/AddExercise";
import { ExerciseCard } from "@/components/ExerciseCard/ExerciseCard";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";


// Exercise in user library (DB)
type DbExercise = {
    id: string  // UUID from DB
    name: string
}

// Exercise in log (UI only)
type LogExercise = {
    id: string        // React unique key (string)
    exercise_id: string // real exercise UUID from DbExercise
    name: string
    weight: string
    reps: string
    notes: string
}

export default function LogPage() {

    const supabase = createClient();

    // --- Date and user input ---
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { weight, setWeight, calories, setCalories } = useLogInputs();
    const [weightMetric, setWeightMetric] = useState("lbs");

    // --- Exercises created in the user's library ---
    const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);

    // --- Exercises added to this log ---
    const [exercises, setExercises] = useState<LogExercise[]>([]);


    async function fetchExercisesFromDb() {
        return
    }

    useEffect(() => {
        fetchExercisesFromDb();
    }, []);

    async function fetchLogForDate(selectedDate: Date) {
        return
    }

    // Refetch log whenever the date changes
    useEffect(() => {
        if (date) fetchLogForDate(date);
    }, [date]);


    // --- Adding an exercise ---
    function handleAddExercise(exercise: { id: string; name: string }) {
        // Prevent duplicates in current log
        if (exercises.some((ex) => ex.exercise_id === exercise.id)) return;

        setExercises((prev) => [
            ...prev,
            {
                id: `${Date.now()}-${Math.random()}`, // unique id
                exercise_id: exercise.id,
                name: exercise.name,
                weight: "",
                reps: "",
                notes: "",
            },
        ]);
    }

    // --- Updating an exercise field ---
    function handleExerciseChange(id: string, field: string, value: string) {
        setExercises((prev) =>
            prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
        );
    }

    // --- Deleting an exercise ---
    function handleExerciseDelete(id: string) {
        setExercises((prev) => prev.filter((ex) => ex.id !== id));
    }

    // --- Save log to DB ---
    async function handleSaveLog() {
        return
    }

    // --- Date Navigation ---
    function handleDateArrowClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (!date) return;

        const newDate = new Date(date); // clone so we don't mutate same obj
        if (event.currentTarget.id === "previous") {
            newDate.setDate(newDate.getDate() - 1)
        } else {
            newDate?.setDate(newDate.getDate() + 1)
        }
        setDate(newDate)
    }

    function handleLogInput(event: React.ChangeEvent<HTMLInputElement>) {
        const val = event.target.value;
        const inputId = event.target.id;
        if (inputId === "bodyweight") {
            // Allow digits, optional decimal, and at most ONE digit after decimal
            const weightRegex = /^\d*(?:\.\d?)?$/;
            if (weightRegex.test(val)) setWeight(val);
        } else if (inputId === "calories") {
            // Only allow digits (no decimals)
            const caloriesRegex = /^\d*$/;
            if (caloriesRegex.test(val)) setCalories(val);
        }
    }

    function handleWeightBlur() {
        // Blur is when you click off an input field
        if (weight.endsWith(".")) {
            setWeight(weight.slice(0, -1)); // remove any trailing dot
        }
    }

    function formatDate(date: Date | undefined) {
        const d = date ?? new Date(); // fallback to today's date if undefined
        const months = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun",
            "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"
        ];
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${month} ${day}, ${year}`;
    }

    return (
        // <div className="flex flex-row">
        <div className="min-h-screen">

            <Sidebar />

            {/* padding to make main centered in the remaining space */}
            <div className="md:pl-[200px] xl:pl-[300px]">

                <main className="max-w-3xl mx-auto mt-16 md:mt-0 p-6 space-y-6">
                    {/* <main className="flex flex-col md:ml-[200px] xl:ml-[300px] mt-16 md:mt-0 p-6 justify-center text-center space-y-6 w-full lg:w-1/2 md:w-3/4 mx-auto"> */}

                    {/* Date section */}
                    <div className="log-section p-2 flex flex-col justify-center items-center">
                        <div className="flex items-center">
                            <button id="previous" className="date-button" onClick={handleDateArrowClick}>
                                <ChevronLeftIcon size={20}></ChevronLeftIcon>
                                <span>Previous</span>
                            </button>
                            <div className="sm:pl-4 sm:pr-4">

                                <h1 id="date" className="sm:text-2xl">
                                    {formatDate(date)}
                                </h1>

                            </div>
                            <button id="next" className="date-button" onClick={handleDateArrowClick}>
                                <span>Next</span>
                                <ChevronRightIcon size={20}></ChevronRightIcon>
                            </button>
                        </div>

                        <div className="flex gap-2 justify-center items-center">
                            <DatePicker date={date} setDate={setDate} />
                            <span className="hidden sm:block">Pick Date</span>
                        </div>

                    </div>

                    {/* Weight and Cals Section */}
                    <div className="log-section p-2">
                        <div className="flex justify-center text-xl mb-4">Weigh-In & Calorie Log</div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 px-2 py-2">

                            {/* weight */}
                            <div className="flex justify-center items-center gap-2">
                                <div>
                                    Weight
                                </div>
                                <input
                                    id="bodyweight"
                                    className="log-input py-1 w-20 text-right"
                                    placeholder="0"
                                    value={weight}
                                    onChange={handleLogInput}
                                    onBlur={handleWeightBlur}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                />
                                {/* use oninput filter to not allow letters */}
                                <span>{weightMetric}</span>
                                {/* onChange={} className={`grow`} placeholder='Email' value={inputs.email} name='email' required maxLength={254} /> */} </div>

                            {/* cals */}
                            <div className="flex justify-center items-center gap-2">
                                <div>
                                    Calories
                                </div>
                                <input
                                    id="calories"
                                    className="log-input py-1 w-20 text-right"
                                    placeholder="0"
                                    value={calories}
                                    onChange={handleLogInput}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={5}
                                />
                                <span>kcal</span>
                            </div>
                        </div>
                    </div>

                    {/* Exercise Section */}
                    {/* Exercises List */}
                    <div className="log-section p-2">

                        {/* Show exercises label once exercises have been added */}
                        {exercises.length > 0 && (
                            <div className="flex justify-center text-xl mb-4">Exercises</div>
                        )}

                        <div className="flex flex-wrap justify-center gap-4">
                            {exercises.map((exercise) => (
                                <ExerciseCard
                                    key={exercise.id}          // ✅ React only key - use unique id from DB
                                    id={exercise.id}           // ✅ pass down as prop for ExerciseCard logic
                                    name={exercise.name}
                                    weight={exercise.weight}
                                    reps={exercise.reps}
                                    notes={exercise.notes}
                                    onChange={handleExerciseChange}
                                    onDelete={handleExerciseDelete}
                                />
                            ))}
                        </div>

                        {/* Add Exercise Button */}
                        <div className={`${exercises.length > 0 ? "mt-8" : ""}`}>
                            <AddExercise onAdd={handleAddExercise} />
                        </div>
                    </div>

                    {/* Form submit save button */}
                    <div className="flex justify-center">
                        <button className="button w-full" onClick={handleSaveLog}>
                            Save
                        </button>
                    </div>

                </main >
            </div>
        </div>
    )
}
