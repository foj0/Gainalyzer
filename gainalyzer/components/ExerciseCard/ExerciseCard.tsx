import { XIcon } from "lucide-react"

// Exercise in log (UI only)
type LogExercise = {
    id: string        // log_exercises.id - unique per log entry
    exercise_id: string // real exercise UUID
    name: string
    weight: string      // maps to log_exercises.weight
    reps: string        // maps to log_exercises.reps
    notes: string       // maps to log_exercises.notes
}

type ExerciseCardProps = {
    id: string // log_exercise id (UI key)
    name: string
    weight: string
    reps: string
    notes: string
    // onChange: (id: string, field: string, value: string) => void
    onChange: (id: string, field: keyof Omit<LogExercise, 'id' | 'exercise_id' | 'name'>, value: string) => void
    onDelete: (id: string) => void
}

export function ExerciseCard({
    id, name, weight, reps, notes, onChange, onDelete,
}: ExerciseCardProps) {

    // Validation for inputs
    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        const inputId = e.target.id;

        if (inputId === "weight") {
            // Allow digits, optional decimal, and at most one digit after decimal
            const weightRegex = /^\d*(?:\.\d?)?$/;
            if (weightRegex.test(val)) onChange(id, "weight", val);
        } else if (inputId === "reps") {
            // Only allow whole numbers
            const repsRegex = /^\d*$/;
            if (repsRegex.test(val)) {
                onChange(id, "reps", val);
            }
        }
    }

    function handleWeightBlur() {
        if (weight.endsWith(".")) {
            onChange(id, "weight", weight.slice(0, -1)); // strip trailing dot
        }
    }

    return (
        <>
            <div className="exercise-card w-full sm:w-auto flex flex-col px-2 py-2 gap-y-4">

                <div className="flex justify-between">
                    <h3 className="font-semibold">{name}</h3>
                    <button
                        onClick={() => onDelete(id)}
                        className="text-red-400 cursor-pointer"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {/* val and on change needed */}
                {/* Weight */}
                <div className="flex justify-center">
                    <div className="flex flex-col w-35 items-center gap-2">
                        <div>
                            {/* TODO: load dynamic weight metric */}
                            lbs
                        </div>
                        <input
                            id="weight"
                            className="log-input py-1 text-right"
                            placeholder="0"
                            value={weight}
                            type="text"
                            onChange={handleInput}
                            onBlur={handleWeightBlur}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                        />
                        {/* onChange={} className={`grow`} placeholder='Email' value={inputs.email} name='email' required maxLength={254} /> */} </div>

                    {/* Reps */}
                    <div className="flex flex-col w-35 justify-center items-center gap-2">
                        <div>
                            Reps
                        </div>
                        <input
                            id="reps"
                            className="log-input py-1 text-right"
                            placeholder="0"
                            type="text"
                            value={reps}
                            onChange={handleInput}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={3}
                        />
                    </div>
                </div>

                <div className="flex flex-col items-left w-full gap-2">
                    <div className="text-left">Notes:</div>
                    <div className="flex">
                        <textarea
                            className="exercise-note focus:outline-0 px-2 py-1 resize-none w-full"
                            rows={1}
                            value={notes}
                            onChange={(e) => onChange(id, "notes", e.target.value)}
                            placeholder="notes"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

