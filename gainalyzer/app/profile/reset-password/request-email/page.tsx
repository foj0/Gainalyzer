"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import gainalyzerLogo from '@/public/gainalyzerlogo.png'
import Image from 'next/image'
import Link from "next/link"

export default function ResetPasswordRequestPage() {
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [message, setMessage] = useState("")
    const [disableSubmit, setDisableSubmit] = useState(true)

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password/update`,
        })

        if (error) {
            setMessage(error.message)
        } else {
            setMessage("Password reset email sent! Check your inbox.")
        }
    }

    // Debounced email validation
    useEffect(() => {
        const validateEmail = (email: string) => {
            const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            return emailRegEx.test(email)
        }

        if (email == '') {
            setEmailError('')
            setDisableSubmit(true)
            return
        }

        // wait 300ms before updating in case we keep typing
        const timeout = setTimeout(() => {
            if (!validateEmail(email)) {
                setEmailError('Enter a valid email address.')
                setDisableSubmit(true)
            } else {
                setEmailError('')
                setDisableSubmit(false)
            }
        }, 300)

        // useEffect clean up function
        // If inputs.email is updated again before 300ms clear this timeout
        return () => clearTimeout(timeout)
    }, [email])


    return (
        <div className='flex flex-col items-center justify-center h-screen gap-4'>
            <div className="[@media(min-width:460px)]:border [@media(min-width:460px)]:border-[#333333] rounded pl-10 pr-10 pb-10 w-90 mx-auto ">
                <div className="relative pt-15 pb-15 w-full max-w-md mx-auto aspect-[822/148]">
                    <Image
                        src={gainalyzerLogo}
                        alt="gainalyzer logo"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 768px) 100vw, 
                    (max-width: 1024px) 50vw, 
                    33vw"
                    />
                </div>
                <div className="max-w-md mx-auto text-center">
                    <h1 className="text-xl font-bold mb-4">Forgot your password?</h1>
                    <p>Enter your email and we&apos;ll send you a link to reset your account password.</p>
                    <form onSubmit={handleSendEmail} className="space-y-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 w-full rounded mt-3"
                            required
                        />
                        <>{emailError && <div className='text-red-500'>{emailError}</div>}</>
                        <button
                            type="submit"
                            className="button bg-blue-600 p-2 w-full rounded mt-3"
                            disabled={disableSubmit}
                        >
                            Send Reset Link
                        </button>
                    </form>
                    <div className='mt-3'>
                        <Link href="/login" className="hover:underline">Go back</Link>
                    </div>
                    {message && <p className="mt-3 text-sm">{message}</p>}
                </div>
            </div>
        </div>
    )
}

