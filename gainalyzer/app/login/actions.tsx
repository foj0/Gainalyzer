'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

// takes in a provider name ('google') and return an async function
const signInWith = (provider: Provider) => async () => {

    const supabase = await createClient()

    // const siteUrl = process.env.SITE_URL;
    //
    // if (!siteUrl) {
    //     throw new Error("SITE_URL is not defined");
    // }
    //
    // const auth_callback_url = `${siteUrl}/auth/callback`

    const auth_callback_url = `${process.env.SITE_URL}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
            queryParams: { // forces google account chooser every time
                prompt: 'select_account',
            }
        },
    })

    console.log(data)

    if (error) {
        console.log(error)
    }

    // redirects to your provider signin page
    if (data.url) {
        redirect(data.url)
    }
}

const signInWithGoogle = signInWith('google')


async function loginWithEmailPassword(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error, data: authData } = await supabase.auth.signInWithPassword(data)

    if (error || !authData.user) {
        return { error: "Sorry, your password was incorrect. Please double-check your password." }
    }

    if (authData?.user) {
        console.log(authData.user)
    }

    if (!authData?.user?.confirmed_at) {
        console.log("User not yet confirmed.")
        return { redirect: '/check-email' }
    }

    // fetch user profile data
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('id', authData.user.id)
        .single()

    if (profileError) {
        console.error(profileError)
        return { error: 'Something went wrong loading your profile.' }
    }

    revalidatePath('/', 'layout')

    return { redirect: '/dashboard' }

    // if (profile?.is_complete) {
    //     return { redirect: '/' }
    // } else {
    //     return { redirect: '/profile' }
    // }
}

async function signupWithEmailPassword(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: signupData, error } = await supabase.auth.signUp(data)

    if (signupData) {
        console.log(signupData)
        console.log(signupData.user)
        console.log(signupData.user?.identities)
    }

    if (error) {
        console.error('signup error:', error)
        return { error: 'There was an error signing up. Please try again.' }
    }

    // If email confirmations are enabled, this will be null until confirmed
    // // might need to change this to some other condition like if user !== none or something
    if (!signupData?.user?.email_confirmed_at) {
        // redirect('/auth/check-email')
        return { message: "If this email is not yet registered, you'll receive a confirmation email. Otherwise, try logging in instead." }
    }

    // if user has already registered with Google Provider, add the password to their account
    if (signupData?.user && signupData?.user?.identities?.some(id => id.provider === 'google')) {
        console.log("trying to update user password")
        const { error } = await supabase.auth.updateUser({
            password: data.password
        })

        if (error) {
            console.error("Failed to add password to Google account:", error)
            return { error: "Could not set a password for this account." }
        }

        console.log("successfully updated password")
    }

    revalidatePath('/', 'layout')
    return { redirect: '/profile' }
}

export { signInWithGoogle, loginWithEmailPassword, signupWithEmailPassword }
