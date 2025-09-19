'use client'
import { signInWithGoogle, signupWithEmailPassword } from '@/app/login/actions'
import gainalyzerLogo from '@/public/gainalyzerlogo.png'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const RegisterComponent = () => {
    const router = useRouter()
    const [isSubmitDisabled, setIsSubmitdisabled] = useState<boolean>(true)
    const [emailError, setEmailError] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    const [fullnameError, setFullnameError] = useState<string>('')
    const [signupError, setSignupError] = useState<string>('')
    const [checkEmailMsg, setCheckEmailMsg] = useState<string>('')

    interface registerInfo {
        email: string,
        password: string,
        fullname: string
    }

    const [inputs, setInputs] = useState<registerInfo>({
        email: '',
        password: '',
        fullname: '',
    });


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const email: string = e.target.value
        setInputs((prevInputs) => ({ ...prevInputs, email: email }))
    }

    // Debounced email validation
    useEffect(() => {
        const validateEmail = (email: string) => {
            const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            return emailRegEx.test(email)
        }

        const email = inputs.email
        if (email == '') {
            setEmailError('')
            return
        }

        // wait 300ms before updating in case we keep typing
        const timeout = setTimeout(() => {
            if (!validateEmail(email)) {
                setEmailError('Enter a valid email address.')
            } else {
                setEmailError('')
            }
        }, 300)

        // useEffect clean up function
        // If inputs.email is updated again before 300ms clear this timeout
        return () => clearTimeout(timeout)
    }, [inputs.email])


    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prevInputs) => ({ ...prevInputs, password: e.target.value }))
    }

    // Debounced password validation
    useEffect(() => {
        const password = inputs.password
        if (password === '') {
            setPasswordError('')
            return
        }

        // wait 300ms before updating in case we keep typing
        const timeout = setTimeout(() => {
            if (password.length >= 6) {
                setPasswordError('')
            } else {
                setPasswordError('Create a password at least 6 characters long.')
            }

            return () => clearTimeout(timeout)
        }, 300)

        // useEffect clean up function
        // If inputs.password is updated again before 300ms clear this timeout
        return () => clearTimeout(timeout)

    }, [inputs.password])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs((prevInputs) => ({ ...prevInputs, fullname: e.target.value }))
    }

    // Debounced fullname validation
    useEffect(() => {
        const validateFullname = (fullname: string) => {
            const nameRegEx = /^[A-Za-z]+( [A-Za-z]+)*$/
            return nameRegEx.test(fullname)
        }

        const fullname = inputs.fullname
        if (fullname == '') {
            setFullnameError('')
            return
        }

        // wait 300ms before updating in case we keep typing
        const timeout = setTimeout(() => {
            if (!validateFullname(fullname)) {
                setFullnameError('Enter a valid name.')
            } else {
                setFullnameError('')
            }
        }, 300)

        // useEffect clean up function
        // If inputs.fullname is updated again before 300ms clear this timeout
        return () => clearTimeout(timeout)
    }, [inputs.fullname])


    // ensure all inputs are filled in and valid to enable the submit button
    useEffect(() => {
        const inputsFilled: boolean = (inputs.email !== '' && inputs.password !== '' && inputs.fullname !== '')
        if (!inputsFilled || emailError !== '' || passwordError !== '' || fullnameError !== '') {
            setIsSubmitdisabled(true)
        } else {
            setIsSubmitdisabled(false)
        }
    }, [inputs.email, inputs.password, inputs.fullname, emailError, passwordError, fullnameError])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const result = await signupWithEmailPassword(formData)

        if (result?.message) {
            setCheckEmailMsg(result.message)
        }

        if (result?.error) {
            setSignupError(result.error)
        } else if (result?.redirect) {
            router.push(result.redirect)
        }
    }

    return (
        <div className='[@media(min-width:460px)]:border [@media(min-width:460px)]:border-[#333333] rounded pl-10 pr-10 pb-10 w-90 mx-auto '>

            <div className='relative pt-15 pb-15 w-full max-w-md mx-auto aspect-[822/148]'>
                <Image
                    src={gainalyzerLogo}
                    alt='gainalyzer logo'
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes='(max-width: 768px) 100vw, 
                    (max-width: 1024px) 50vw, 
                    33vw'
                />
            </div>

            <div className='register'>
                < form onSubmit={handleSubmit} className='flex flex-col' >

                    <label
                        className='input input-bordered flex flex-col items-center gap-2 '>
                        <input type='email'
                            onChange={handleEmailChange} className={`grow ${emailError ? 'border-red-400' : 'border-[#333]'}`} placeholder='Email' value={inputs.email} name='email' required maxLength={254} />
                        <>{emailError && <div className='text-red-400'>{emailError}</div>}</>
                    </label>

                    <label className='input input-bordered flex flex-col items-center gap-2'>
                        <input type='password' onChange={handlePasswordChange} className={`grow border-[#333] ${passwordError ? 'border-red-400' : 'border-[#333]'}`} placeholder='Password' value={inputs.password} name='password' required maxLength={128} />
                        <>{passwordError && <div className='text-red-400'>{passwordError}</div>}</>
                    </label>

                    <label className='input input-bordered flex flex-col items-center gap-2'>
                        <input type='text' onChange={handleNameChange} className={`grow border-[#333] ${fullnameError ? 'border-red-400' : 'border-[#333]'}`} placeholder='Full Name' value={inputs.fullname} name='fullname' required maxLength={128} />
                        <>{fullnameError && <div className='text-red-400'>{fullnameError}</div>}</>
                    </label>

                    <button className='button mt-3' disabled={isSubmitDisabled} >Sign Up</button>

                    <div className='flex items-center justify-center m-3'>
                        <p>OR</p>
                    </div>

                    <button type='button' className='button' onClick={signInWithGoogle}>Log in with Google</button>

                </form >


                <>
                    {signupError &&
                        <div className='text-red-400 text-center mt-5'>
                            {signupError}
                        </div>
                    }
                </>
                <>
                    {checkEmailMsg &&
                        <div className='text-center mt-5'>
                            {checkEmailMsg}
                        </div>
                    }
                </>

                <div className='flex flex-row justify-center mt-5'>
                    <p>Have an account? <span className='LoginLink text-blue-400 cursor-pointer'><Link href='/login'>Log in</Link></span></p>
                </div>
            </div >

        </div >
    )
}

export default RegisterComponent
