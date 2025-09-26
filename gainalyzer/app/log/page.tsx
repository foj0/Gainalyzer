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

// create client once at module scope
const supabase = createClient();

// Exercise in user library (DB)
type DbExercise = {
    id: string  // UUID from DB
    name: string
}

// Exercise in log (UI only)
type LogExercise = {
    id: string        // log_exercises.id - unique per log entry
    exercise_id: string // real exercise UUID
    name: string
    weight: string      // maps to log_exercises.weight
    reps: string        // maps to log_exercises.reps
    notes: string       // maps to log_exercises.notes
}

export default function LogPage() {

    const [user, setUser] = useState<any>(null);

    // --- Date and user input ---
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { weight, setWeight, calories, setCalories } = useLogInputs();
    const [weightMetric, setWeightMetric] = useState("lbs");

    // --- Exercises created in the user's library ---
    const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);

    // --- Exercises added to this log ---
    const [exercises, setExercises] = useState<LogExercise[]>([]);

    // fetch user once on mount
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        }
        loadUser();
    }, []);

    async function fetchLogForDate(selectedDate: Date) {
        if (!user) return;

        const logDate = selectedDate.toISOString().split("T")[0];

        const { data: log, error } = await supabase
            .from("logs")
            .select(`
            id,
            bodyweight,
            calories,
            log_exercises (
                id,
                exercise_id,
                weight,
                reps,
                notes,
                exercises!inner(id, name)
            )
        `)
            .eq("user_id", user.id)
            .eq("log_date", logDate)
            .single();

        if (error && error.code !== "PGRST116") { // 116 = no rows found
            console.error("Error fetching log:", error);
            return;
        }

        if (log) {
            // Populate weight and calories
            setWeight(log.bodyweight?.toString() ?? "");
            setCalories(log.calories?.toString() ?? "");

            // Map exercises from log_exercises
            setExercises(
                log.log_exercises.map((le: any) => {
                    const exercise = le.exercises; // should be a single object
                    return {
                        id: le.id,             // use log_exercises id as UI key
                        exercise_id: exercise.id, // UUID from exercises table
                        name: exercise.name,
                        weight: le.weight?.toString() ?? "",
                        reps: le.reps?.toString() ?? "",
                        notes: le.notes || ""
                    } as LogExercise;
                })
            );
        } else {
            // Reset fields if no log
            setWeight("");
            setCalories("");
            setExercises([]);
        }
    }

    // Refetch log whenever the date changes and user is loaded
    useEffect(() => {
        if (date && user) fetchLogForDate(date);
    }, [date, user]);

    // --- Save log to DB ---
    async function handleSaveLog() {
        if (!user || !date) return;

        const logDate = date.toISOString().split("T")[0];

        try {
            // 1️⃣ Upsert the main log row (user_id + log_date)
            const { data: logData, error: logError } = await supabase
                .from("logs")
                .upsert(
                    {
                        user_id: user.id,
                        log_date: logDate,
                        bodyweight: weight || null,
                        calories: calories || null,
                    },
                    { onConflict: "user_id, log_date" } // conflict target
                )
                .select()
                .single();

            if (logError) throw logError;

            // 2️⃣ Remove old log_exercises for this log
            const { error: deleteError } = await supabase
                .from("log_exercises")
                .delete()
                .eq("log_id", logData.id);

            if (deleteError) throw deleteError;

            // 3️⃣ Insert current exercises for this log
            if (exercises.length > 0) {
                const { error: insertError } = await supabase
                    .from("log_exercises")
                    .insert(
                        exercises.map((ex) => ({
                            log_id: logData.id,
                            exercise_id: ex.exercise_id, // DB UUID
                            weight: ex.weight ? parseFloat(ex.weight) : null,
                            reps: ex.reps ? parseInt(ex.reps) : null,
                            notes: ex.notes || null,
                        }))
                    );

                if (insertError) throw insertError;
            }

            toast.success("Log saved successfully!");
        } catch (err) {
            console.error("Error saving log:", err);
            toast.error("Failed to save log.");
        }
    }


    // --- Adding an exercise ---
    function handleAddExercise(exercise: { id: string; name: string }) {
        // Prevent duplicates in current log
        if (exercises.some((ex) => ex.exercise_id === exercise.id)) {
            toast.warning("Cannot add duplicate exercises.")
            return;
        }

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
                                <span>Prev</span>
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
                                {/* onChange={} className={`grow`} placeholder='Email' value={inputs.email} name='email' required maxLength={254} /> */}
                            </div>

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
                    <div className="log-section relative p-2 min-h-[35vh] sm:min-h-[60vh] flex flex-col">
                        <div className="flex justify-center text-xl mb-4">Exercises</div>
                        {exercises.length > 0 ? (
                            <>
                                <div className="flex flex-wrap justify-center gap-4 mb-15">
                                    {exercises.map((exercise) => (
                                        <ExerciseCard
                                            key={exercise.id} // React only key - use unique id from DB 
                                            id={exercise.id} // pass down as prop for ExerciseCard logic
                                            name={exercise.name}
                                            weight={exercise.weight}
                                            reps={exercise.reps}
                                            notes={exercise.notes}
                                            onChange={handleExerciseChange}
                                            onDelete={handleExerciseDelete}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-[#8e8e8e] flex flex-1 text-center items-center justify-center whitespace-pre-wrap">
                                No exercises.
                                <br />
                                Click the button below
                                <br />
                                to add some.
                            </p>
                        )}
                        {/* Add Exercise Button */}
                        <div className={`absolute left-0 right-0 bottom-0 mb-2 ${exercises.length > 0 ? "mt-8" : ""}`}>
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
