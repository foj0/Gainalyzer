import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                text: 'var(--foreground)',
            },
            backgroundImage: {
                "blue-corner-to-green":
                    "radial-gradient(circle at bottom left, #0054b4 0%, #0054b4 10%, #5cb25a 40%, #5cb25a 100%)",
            },
        },
    },
    plugins: [],
};

export default config;
