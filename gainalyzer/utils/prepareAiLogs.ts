// utils/prepareAiLogs.ts

export type AiExercise = {
    weight: number;
    reps: number;
    est1rm: number;
};

export type AiLog = {
    date: string;
    bodyweight: number | null;
    calories: number | null;
    protein: number | null;
    exercise: AiExercise | null;
};

// helper kg/lbs conversion function
function convertFromBase(value: number | null, units: string): number | null {
    if (value == null) return null;
    return units === "kg" ? +(value * 0.45359237).toFixed(1) : value;
    // toFixed returns to string but the + converts it back to number
}

export function prepareAiLogs(
    rawLogs: any[],
    selectedExercise: string,
    dateRange: string,
    units: string
): AiLog[] {
    if (!rawLogs || rawLogs.length === 0) return [];

    const today = new Date();

    // Sort ascending by date
    const sortedLogs = [...rawLogs].sort(
        (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    );

    // Determine start date
    let startDate: Date;
    if (dateRange === "all") {
        startDate = sortedLogs.length ? new Date(sortedLogs[0].log_date) : new Date();
    } else {
        startDate = new Date();
        startDate.setDate(today.getDate() - (parseInt(dateRange) - 1));
    }

    // Filter logs inside date range
    const rangeFiltered = sortedLogs.filter(
        (log) => new Date(log.log_date) >= startDate
    );

    //  Keep ONLY logs that contain the selected exercise
    const exerciseFiltered = rangeFiltered.filter((log) =>
        log.exercises.some((ex: any) => ex.name === selectedExercise)
    );

    // Prepare a clean AI dataset for selected exercise
    const aiLogs: AiLog[] = exerciseFiltered.map((log) => {
        // Find the selected exercise for this day
        const ex = log.exercises?.find(
            (x: any) => x.name === selectedExercise
        );
        const weight = convertFromBase(ex.weight, units); // ensure weight's in correct units

        // Compute estimated 1RM if weight + reps available
        let est1rm: number | null = null;
        if (weight != null && ex?.reps != null) {
            est1rm = weight / (1.0278 - 0.0278 * ex.reps);
        }

        return {
            date: log.log_date,
            bodyweight: convertFromBase(log.bodyweight, units),
            calories: log.calories ?? null,
            protein: log.protein ?? null,
            exercise: ex
                ? {
                    weight: Number(weight),
                    reps: ex.reps,
                    est1rm: est1rm!,
                }
                : null,
        };
    });

    return aiLogs;
}

