import AccountForm from './account-form'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'

export default async function Account() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // console.log(user)

    // Prevent access to this page if not yet registered or confirmed.
    if (!user) {
        redirect('/login')
    }
    if (!user.confirmed_at) {
        redirect('/auth/check-email')
    }

    return (
        <>
            <div className="fixed top-4 right-4">
                <ThemeToggle />
            </div>
            <AccountForm user={user} />
        </>
    )
}
