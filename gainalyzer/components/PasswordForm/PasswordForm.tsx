"use client";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { useState, useCallback, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { type User } from "@supabase/supabase-js"

interface PasswordFormProps {
    user: User | null
    hasPassword: boolean
}

// React functional component expecting props of type PasswordFormProps
// Since we know the prop type we can destructure in the function signature.
const PasswordForm: React.FC<PasswordFormProps> = ({ user, hasPassword }) => {

    interface passwordInfo {
        currentPassword: string,
        newPassword: string,
        confirmPassword: string,
    }

    const [inputs, setInputs] = useState<passwordInfo>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [passwordError, setPasswordError] = useState<string>('')
    const [confirmError, setConfirmError] = useState<string>('')
    const [newPasswordEntered, setNewPasswordEntered] = useState<boolean>(false)
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(true)
    const [submitErrorMsg, setSubmitErrorMsg] = useState<string>('')
    const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('')

    const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prevInputs) => ({ ...prevInputs, currentPassword: e.target.value }))
    }

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prevInputs) => ({ ...prevInputs, newPassword: e.target.value }))
    }

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prevInputs) => ({ ...prevInputs, confirmPassword: e.target.value }))
    }


    // Debounced password validation
    useEffect(() => {
        const password = inputs.newPassword
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

    }, [inputs.newPassword])


    // Debounced confirm password validation
    useEffect(() => {
        const password = inputs.confirmPassword
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

    }, [inputs.confirmPassword])


    useEffect(() => {
        // TODO: There's a weird bug where if you delete confirmPassword
        // and then re fill it in correctly the submit button fails the third check

        const { currentPassword, newPassword, confirmPassword } = inputs

        let disabled = false

        // If user has a password, check currentPassword too
        if (hasPassword && currentPassword.trim() === '') {
            // console.log("1")
            disabled = true
        }

        // Always check newPassword & confirmPassword
        if (newPassword.trim() === '' || confirmPassword.trim() === '') {
            // console.log("2")
            disabled = true
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            // console.log("3")
            disabled = true
        }

        setSubmitDisabled(disabled)

    }, [inputs, hasPassword])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setSubmitErrorMsg('')
        setSubmitSuccessMsg('')

        if (inputs.newPassword !== inputs.confirmPassword) {
            setSubmitErrorMsg('New passwords do not match')
            return
        }

        try {
            const supabase = await createClient()
            const { data, error: rpcError } = await supabase
                .rpc("change_user_password", {
                    current_plain_password: inputs.currentPassword,
                    new_plain_password: inputs.newPassword,
                    require_current_password: hasPassword
                })

            if (rpcError) {
                setSubmitErrorMsg(rpcError.message)
                return
            }

            // TODO: Add a snack bar popup saying password was updated?

            setSubmitSuccessMsg('Successfully updated password.')
            setInputs({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setSubmitDisabled(true)

        } catch (err) {
            console.error('Unexpected error when updating password:', err)
            setSubmitErrorMsg('Something went wrong. Please try again.')
        }
    }

    return (
        <div>
            <Dialog >
                <DialogTrigger asChild>
                    <button className='button'>Add/Reset Password</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Password</DialogTitle>
                        <DialogDescription>
                            Add a password to your account or change your existing one.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="grid flex-1 gap-2">
                            <form onSubmit={handleSubmit}>
                                {hasPassword &&
                                    <div>
                                        <label>Current Password:</label>
                                        <input className='border border-[#333]' type='password' value={inputs.currentPassword} onChange={handleCurrentPasswordChange} required />
                                    </div>
                                }
                                <div>
                                    <label>New Password:</label>
                                    <input className='border border-[#333]' type='password' value={inputs.newPassword} onChange={handleNewPasswordChange} required />
                                    <div className='text-red-500'>{passwordError}</div>
                                </div>
                                <div>
                                    <label>Confirm Password:</label>
                                    <input className='border border-[#333]' type='password' value={inputs.confirmPassword} onChange={handleConfirmPasswordChange} required />
                                    <div className='text-red-500'>{confirmError}</div>
                                </div>
                                <button className='button mt-3' type='submit' disabled={submitDisabled}>Update Password</button>
                                <div className='text-red-500'>{submitErrorMsg}</div>
                                <div className='text-red-500'>{submitSuccessMsg}</div>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PasswordForm
