import { useState, useEffect } from "react";

export function useLogInputs() {
    const [weight, setWeight] = useState("");
    const [calories, setCalories] = useState("");
    const [protein, setProtein] = useState("");

    // restore values from local storage on mount
    // useEffect(() => {
    //     const savedWeight = localStorage.getItem("log_weight");
    //     const savedCalories = localStorage.getItem("log_calories");
    //     if (savedWeight) setWeight(savedWeight);
    //     if (savedCalories) setCalories(savedCalories);
    // }, []);
    //
    // save to local storage on change
    // useEffect(() => {
    //     localStorage.setItem("log_weight", weight);
    // }, [weight]);
    //
    // useEffect(() => {
    //     localStorage.setItem("log_calories", calories);
    // }, [calories]);

    return {
        weight,
        setWeight,
        calories,
        setCalories,
        protein,
        setProtein,
    }
}

