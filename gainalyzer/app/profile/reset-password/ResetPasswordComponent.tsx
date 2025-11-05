'use client'
import { useState, useEffect } from "react"
import gainalyzerLogo from '@/public/gainalyzerlogo.png'
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
// maybe change password form as well, but the submit button doesn't need to be
// disabled, just have it not do anything if fields aren't filled out.

export default function ResetPasswordComponent() {
    const [newPassword, setNewPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    const [confirmError, setConfirmError] = useState<string>('')
    const [newPasswordEntered, setNewPasswordEntered] = useState<boolean>(false)
    const [submitErrorMsg, setSubmitErrorMsg] = useState<string>('')
    const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('')

    const handleChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value)
    }

    const handleChangeConfirmPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(event.target.value)
    }

    // Debounced password validation
    useEffect(() => {
        const password = newPassword
        if (password === '') {
            setPasswordError('')
            return
        }

        const timeout = setTimeout(() => {
            if (password.length >= 6) {
                setPasswordError('')
                setNewPasswordEntered(true)
            } else {
                setPasswordError('Enter a password at least 6 characters long.')
                setNewPasswordEntered(false)
            }

            return () => clearTimeout(timeout)
        }, 300)

        return () => clearTimeout(timeout)

    }, [newPassword])


    // Debounced confirm password validation
    useEffect(() => {
        const password = confirmPassword
        if (password === '') {
            setConfirmError('')
            return
        }

        const timeout = setTimeout(() => {
            if (password.length >= 6) {
                setConfirmError('')
            } else {
                setConfirmError('Your passwords do not match')
            }

            return () => clearTimeout(timeout)
        }, 300)

        return () => clearTimeout(timeout)

    }, [confirmPassword])



    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitErrorMsg('')
        setSubmitSuccessMsg('')

        if (newPassword !== confirmPassword) {
            setSubmitErrorMsg('New passwords do not match')
            return
        }

        try {
            const supabase = createClient()
            const { data, error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) {
                setSubmitErrorMsg(error.message)
                return
            }
            setSubmitSuccessMsg("Password updated successfully!")

            // fetch session from data to confirm
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                // redirect to account page as a logged in user
                window.location.href = '/account'
            }

        } catch (err) {
            console.error('Unexpected error when resetting password:', err)
            setSubmitErrorMsg('Something went wrong. Please try again.')
        }
    }

    return (
        <div>
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
            <h1>Reset your password</h1>
            <p>6-character minimum; case sensitive</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New Password:</label>
                    <input type='password' onChange={handleChangeNewPassword} className={`grow border-[#333] ${passwordError ? 'border-red-500' : 'border-[#333]'}`} value={newPassword} name='newPassword' required maxLength={128} />
                    {passwordError && <div className='text-red-500'>{passwordError}</div>}
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type='password' onChange={handleChangeConfirmPassword} className={`grow border-[#333] ${confirmError ? 'border-red-500' : 'border-[#333]'}`} value={confirmPassword} name='confirmPassword' required maxLength={128} />
                    {confirmError && <div className='text-red-500'>{confirmError}</div>}
                </div>
                <div className='flex flex-row mt-5'>
                    <button type='button' className='button mr-5'><Link href='/'>Cancel</Link></button>
                    <button type='submit' className='button'>Confirm</button>
                </div>
                <div className='mt-3'>
                    {submitErrorMsg && <div className='text-red-500'>{submitErrorMsg}</div>}
                    {submitSuccessMsg && <div className='text-green-500'>{submitSuccessMsg}</div>}
                </div>
            </form>
        </div>
    )
}
