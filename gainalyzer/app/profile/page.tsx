import ProfileForm from './profile-form'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import Sidebar from '@/components/Sidebar/Sidebar'

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
            <div className="min-h-screen">
                <Sidebar />
                <div className="md:pl-[200px] xl:pl-[300px]">

                    {/* Main content area */}
                    <main className="max-w-screen 2xl:max-w-4/12 mx-auto mt-16 md:mt-0 space-y-6 p-4">
                        {/* <main className="max-w-screen mx-auto mt-16 md:mt-0 space-y-6"> */}
                        <ProfileForm user={user} />
                    </main>
                </div>
            </div>
        </>
    )
}
