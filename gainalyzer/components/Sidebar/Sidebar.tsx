"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Menu } from "@headlessui/react"
import { MenuIcon, XIcon } from "lucide-react"
import { ChevronUp, ChevronDown, Settings } from "lucide-react"
import gainalyzerLogo from '@/public/gainalyzerlogo.png'
import { useTheme } from "next-themes"
import { Squash as Hamburger } from 'hamburger-react'
import { usePathname } from "next/navigation"
import { ThemeToggle } from "../ThemeToggle/ThemeToggle"

export default function Sidebar() {
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const settingsRef = useRef<HTMLDivElement>(null)
    const pathname = usePathname()

    const links = [
        { href: "/dashboard", label: "Dashboard" }, // change to "/dashboard" later
        { href: "/log", label: "Log" },
        { href: "/goals", label: "Goals" },
        { href: "/exercises", label: "Exercises" },
        { href: "/profile", label: "Profile" },
        { href: "/about", label: "About" },
    ]

    // TODO: ADD BREAK LINE IMG THING BEFORE SIGN OUT

    const { theme, setTheme } = useTheme()

    // Close More dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false)
            }
        }

        if (isSettingsOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        // Cleanup on unmount
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isSettingsOpen])

    return (
        <>
            {/*Desktop sidebar*/}
            <aside className="navigation hidden md:flex flex-col fixed top-0 left-0 h-screen md:w-[200px] xl:w-[300px] p-4">

                {/* Logo */}
                <div className="relative flex justify-left cursor-pointer mb-8 w-full max-w-md mx-auto aspect-[822/148]"
                    onClick={() => window.location.href = "/"}
                >
                    <Image
                        src={gainalyzerLogo}
                        alt="Gainalyzer Logo"
                        priority
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, 
                        (max-width: 1024px) 50vw, 
                        33vw"
                    />
                </div>

                {/* Navigation */}
                <nav className="flex flex-col">
                    {links.map(link => {
                        const isActive = pathname === link.href

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-2 py-4 rounded-md link ${isActive ? "selected" : ""}`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Section (Settings) */}
                <div className="relative mt-auto" ref={settingsRef}>
                    <div
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="navigation-settings flex items-center justify-between w-full px-4 py-3 cursor-pointer rounded-md"
                    >
                        <span className={`flex items-center gap-2 ${isSettingsOpen ? "font-bold" : ""}`}>
                            {/* <Settings size={18} /> */}
                            <MenuIcon className="w-6 h-6" />
                            More
                        </span>
                        {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {isSettingsOpen && (
                        <div className="settings-popup absolute bottom-full mb-2 p-2 left-0 w-[250px] rounded-md shadow-lg">
                            <div className="settings-item block w-full px-4 py-2 text-left cursor-pointer rounded-md">
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-4 pl-1"
                                >
                                    <Settings size={25} />
                                    Settings
                                </Link>
                            </div>
                            <div className="settings-item block w-full px-4 py-2 text-left cursor-pointer rounded-md"
                                onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}>
                                <ThemeToggle />
                                Change Appearance
                            </div>

                            {/* Divider line */}
                            <div className="border-t border-neutral-700 my-2" />

                            <span
                                onClick={async () => {
                                    await fetch("/auth/signout", { method: "POST" });
                                    window.location.href = "/dashboard"; // redirect
                                }}
                                className="settings-item block w-full px-4 py-2 cursor-pointer rounded-md"
                            >
                                Sign Out
                            </span>
                        </div>)}
                </div>

            </aside >

            {/*Mobile Hamburger*/}
            < div className="navigation md:hidden flex justify-between items-center p-4 fixed top-0 left-0 right-0 z-50" >
                <Image
                    className="cursor-pointer"
                    src={gainalyzerLogo}
                    alt="Logo"
                    width={200}
                    height={32}
                    style={{ objectFit: "contain" }}
                    onClick={() => window.location.href = "/dashboard"}
                />
                {/* <button onClick={() => setIsHamburgerOpen(!isHamburgerOpen)} aria-label="Toggle menu"> */}
                {/*     {isHamburgerOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />} */}
                {/* </button> */}
                <Hamburger toggled={isHamburgerOpen} toggle={setIsHamburgerOpen} size={18} />
            </div >

            {/*Mobile Dropdown Menu*/}
            {
                isHamburgerOpen && (
                    <div className="navigation md:hidden fixed top-16 left-0 right-0 flex flex-col p-4 space-y-4 z-40">
                        {links.map(link => {
                            const isActive = pathname === link.href

                            return (
                                <Link key={link.href} href={link.href}
                                    onClick={() => setIsHamburgerOpen(false)}
                                    className={`block p-2 rounded-md link ${isActive ? "selected" : ""}`}
                                >
                                    {link.label}
                                </Link>

                            )
                        })}

                        <Link href="/settings" className={`block p-2 rounded-md link ${pathname === "/settings" ? "selected" : ""}`}>
                            Settings
                        </Link>
                        <div className="block p-2 rounded-md cursor-pointer link"
                            onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")}>
                            Change Appearance
                        </div>

                        {/* Divider line */}
                        <div className="border-t border-neutral-700 my-2" />

                        <span
                            onClick={async () => {
                                await fetch("/auth/signout", { method: "POST" });
                                window.location.href = "/"; // redirect
                            }}
                            className="block p-2 rounded-md cursor-pointer link"
                        >
                            Sign Out
                        </span>
                    </div>
                )
            }
        </>
    )
}

