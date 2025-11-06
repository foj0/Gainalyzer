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
import { NewAddExercise } from "@/components/AddExercise/NewAddExercise";
import { ExerciseCard } from "@/components/ExerciseCard/ExerciseCard";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { convertForDisplay, convertForSaving } from "@/utils/units";

// create client once at module scope
const supabase = createClient();

// Exercise in user library (DB)
type DbExercise = {
    id: string;  // UUID from DB
    user_id: string;
    name: string;
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

function lbsToKg(lbs: number) {
    return lbs * 0.45359237;
}

export default function LogPage() {

    const [user, setUser] = useState<any>(null);
    const [units, setUnits] = useState<string>("");

    // --- Date and user input ---
    const [date, setDate] = useState<Date | undefined>(new Date());
    const { weight, setWeight, calories, setCalories, protein, setProtein } = useLogInputs();

    // --- Exercises created in the user's library ---
    const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);

    // --- Exercises added to this log ---
    const [exercises, setExercises] = useState<LogExercise[]>([]);

    // fetch user and their preferred measurment units on mount
    useEffect(() => {
        async function loadUser() {
            const { data: { user }, error: user_error } = await supabase.auth.getUser();
            if (user_error) {
                console.log("Error fetching user", user_error);
                return;
            }
            if (user) {
                setUser(user);
                const { data, error: units_error } = await supabase
                    .from("profiles")
                    .select("units")
                    .eq("id", user.id)
                    .single();
                if (units_error) {
                    console.log("Error fetching preferred units", units_error);
                    return;
                }
                if (data) {
                    console.log(data.units, "hello")
                    setUnits(data.units);
                }
            }

        }
        loadUser();
    }, []);

    useEffect(() => {
        console.log(units, "units changed")

    }, [units])

    async function fetchLogForDate(selectedDate: Date) {
        if (!user) return;

        console.log(selectedDate);
        // manually construct the date to avoid timezone issues
        const logDate = [
            selectedDate.getFullYear(),
            String(selectedDate.getMonth() + 1).padStart(2, "0"),
            String(selectedDate.getDate()).padStart(2, "0"),
        ].join("-");
        console.log(logDate);

        const { data: log, error } = await supabase
            .from("logs")
            .select(`
            id,
            bodyweight,
            calories,
            protein,
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

        // Helper conversion functions to convert from lbs to kg
        const convertFromBase = (lbs: number | null) => {
            if (lbs === null || lbs === undefined) return "";
            if (units === "kg") {
                return (lbs * 0.45359237).toFixed(1); // to string
            }
            // since weight is already in lbs just return that, no need to convert
            return lbs.toString();
        };

        if (log) {
            // Populate weight and calories and protein
            setWeight(convertFromBase(log.bodyweight)); // bodyweight converted to users preffered units
            setCalories(log.calories?.toString() ?? "");
            setProtein(log.protein?.toString() ?? "");

            // Map exercises from log_exercises
            setExercises(
                log.log_exercises.map((le: any) => {
                    const exercise = le.exercises; // should be a single object
                    return {
                        id: le.id,             // use log_exercises id as UI key
                        exercise_id: exercise.id, // UUID from exercises table
                        name: exercise.name,
                        weight: convertFromBase(le.weight),
                        reps: le.reps?.toString() ?? "",
                        notes: le.notes || ""
                    } as LogExercise;
                })
            );
        } else {
            // Reset fields if no log
            setWeight("");
            setCalories("");
            setProtein("");
            setExercises([]);
        }
    }

    // Refetch log whenever the date changes and user is loaded
    useEffect(() => {
        if (!user || !units) return;  // ensure units is loaded first so we load the correct units
        if (date && user) fetchLogForDate(date);
    }, [user, units, date]);


    // --- Save log to DB ---
    async function handleSaveLog() {
        if (!user || !date) return;

        const logDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");

        function convertToBase(value: string) {
            const num = parseFloat(value);
            if (isNaN(num)) return null;
            return units === "kg" ? Number((num / 0.45359237).toFixed(1)) : num;
        }

        try {
            // 1️⃣ Upsert the main log row (user_id + log_date)
            const { data: logData, error: logError } = await supabase
                .from("logs")
                .upsert(
                    {
                        user_id: user.id,
                        log_date: logDate,
                        bodyweight: convertToBase(weight),
                        calories: calories || null,
                        protein: protein || null,
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
                            weight: convertToBase(ex.weight),
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

    // new function to add multiple exercises at once.
    // Maybe add a template exercises which can be null. if null then we know
    // we're adding exercises otherwise we know we're adding a template
    function handleAddExercises(exercises: DbExercise[]) {
        return;
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
        // Allow digits, optional decimal, and at most ONE digit after decimal
        const oneDecimalRegex = /^\d*(?:\.\d?)?$/;
        // Only allow digits (no decimals)
        const wholeNumbersRegex = /^\d*$/;
        if (inputId === "bodyweight") {
            if (oneDecimalRegex.test(val)) setWeight(val);
        } else if (inputId === "calories") {
            if (wholeNumbersRegex.test(val)) setCalories(val);
        } else if (inputId === "protein") {
            if (wholeNumbersRegex.test(val)) setProtein(val);
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

                        {/* Wrap entire section in a centered container */}
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-8 px-4 py-2 max-w-xl mx-auto">

                            {[
                                { id: "bodyweight", label: "Weight", value: weight, unit: units, onBlur: handleWeightBlur, maxLength: 6 },
                                { id: "calories", label: "Calories", value: calories, unit: "cal", maxLength: 5 },
                                { id: "protein", label: "Protein", value: protein, unit: "g", maxLength: 5 },
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-center items-center gap-2 w-full sm:w-auto"
                                >
                                    {/* Label (fixed width, right-aligned for even spacing) */}
                                    <div className="w-20 text-right">{item.label}</div>

                                    {/* Input (uniform width) */}
                                    <input
                                        id={item.id}
                                        className="log-input py-1 w-24 text-right"
                                        placeholder="0"
                                        value={item.value}
                                        onChange={handleLogInput}
                                        onBlur={item.onBlur}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={item.maxLength}
                                    />

                                    {/* Units (aligned left, same width for all) */}
                                    <div className="w-10 text-left">{item.unit}</div>
                                </div>
                            ))}
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
                                            units={units}
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
                            {/* <AddExercise onAdd={handleAddExercise} /> */}
                            <NewAddExercise logExercises={exercises} setLogExercises={setExercises} supabase={supabase} user={user} onAdd={handleAddExercises} />
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
