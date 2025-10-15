"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LuPlus } from "react-icons/lu";

export default function HelloSection({ fullName }: { fullName: string }) {
    return (
        <>
            <div className="flex flex-col justify-center items-center gap-2">
                <div className="text-3xl text-center flex flex-col md:flex-row">
                    Welcome&nbsp;<span className="font-bold">{fullName}</span> &nbsp;👋
                </div>
                <Link
                    href="/log"
                    className="flex flex-row items-center gap-2 rounded-md bg-[#5db15d] px-4 py-2 text-white text-xs hover:bg-[#479141] w-fit"
                >
                    <LuPlus size={20} />
                    <span>Add Today&apos;s Log</span>
                </Link>
            </div >
        </>
    )
}

