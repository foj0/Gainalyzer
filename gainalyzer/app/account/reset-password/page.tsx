'use client'

import ResetPasswordComponent from "./ResetPasswordComponent"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function Page() {
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get("type")
    const [sessionChecked, setSessionChecked] = useState(false)
    const [sessionValid, setSessionValid] = useState(false)
    const [valid, setValid] = useState(false)
    const [loading, setLoading] = useState(true)

    // validate user came to this page through email recovery link 
    useEffect(() => {
        const url = new URL(window.location.href)
        const type = url.searchParams.get("type")

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (type === "recovery" && session) {
                setValid(true)
            } else {
                router.replace("/login")
            }
        })

    }, [supabase, router])

    if (!valid) {
        return null // prevent flicker before redirect
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <div className="[@media(min-width:460px)]:border [@media(min-width:460px)]:border-[#333333] rounded pl-10 pr-10 pb-10 w-90 mx-auto ">
                <ResetPasswordComponent />
            </div>
        </div>

    )
}
