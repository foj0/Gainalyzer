"use client"

import { useState } from "react";

type Exercise = {
    id: string;
    user_id: string;
    name: string;
}

type ExerciseRowProps = {
    exercise: Exercise;
    onDelete: () => void;
    onEdit: () => void;
}

export default function ExerciseRow({ exercise, onDelete, onEdit }: ExerciseRowProps) {
    const [logs, setLogs] = useState("");

}
