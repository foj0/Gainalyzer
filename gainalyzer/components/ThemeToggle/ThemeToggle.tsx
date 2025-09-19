"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (

        // Just click the button to switch, no dropdown menu
        <Button variant="outline" size="icon" className="bg-transparent hover:bg-transparent mr-2"
            onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}>
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button >

        // <DropdownMenu>
        //     <DropdownMenuTrigger asChild>
        //         <Button variant="outline" size="icon" className="bg-transparent hover:bg-transparent">
        //             <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        //             <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        //             <span className="sr-only">Toggle theme</span>
        //         </Button>
        //     </DropdownMenuTrigger>
        //     <DropdownMenuContent align="end">
        //         <DropdownMenuItem onClick={() => setTheme("light")}>
        //             Light
        //         </DropdownMenuItem>
        //         <DropdownMenuItem onClick={() => setTheme("dark")}>
        //             Dark
        //         </DropdownMenuItem>
        //         <DropdownMenuItem onClick={() => setTheme("system")}>
        //             System
        //         </DropdownMenuItem>
        //     </DropdownMenuContent>
        // </DropdownMenu>
    )
}
