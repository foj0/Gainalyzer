import { useState, useRef, useEffect } from "react";

export default function FloatingSelect({ options }: { options: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("");
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
        <div ref={containerRef} className="relative w-40">
            <button
                className="w-full border rounded px-2 py-1 text-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected || "Select exercise"}
            </button>

            {isOpen && (
                <ul className="absolute left-0 top-full w-full bg-blue-500 text-white rounded shadow-lg z-10 max-h-60 overflow-auto">
                    {options.map((option) => (
                        <li
                            key={option}
                            className="px-2 py-1 hover:bg-blue-700 cursor-pointer"
                            onClick={() => {
                                setSelected(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

