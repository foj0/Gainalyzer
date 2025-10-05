"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";

export default function HelloSection() {
    return (
        <>
            <div className="flex flex-col justify-between sm:flex-row gap-2">
                <div className="text-2xl">
                    Welcome <span className="font-bold">User Name</span> 👋
                </div>
                <Link
                    href="/log"
                    className="flex flex-row items-center gap-2 rounded-md bg-[#5db15d] px-4 py-2 text-white hover:bg-[#479141]"
                >
                    <LuPlus size={20} />
                    <span>Add Today&apos;s Log</span>
                </Link>
            </div >
            <div className="flex flex-col sm:flex-row mt-6">
                <div className="flex flex-col flex-1">
                    current weight
                </div>
                <div className="flex flex-col flex-1">
                    Avg weight
                </div>
                <div className="flex flex-col flex-1">
                    Avg calories
                </div>
            </div>
        </>
    )
}

