import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation'
import Sidebar from "@/components/Sidebar/Sidebar";
import Goals from "@/components/Goals/Goals";

export default async function Page() {
    const supabase = await createClient()
    const session = await supabase.auth.getUser()

    // if not signed in redirect to login page
    if (!session.data.user) {
        redirect('/login')
    }

    // if logged in show home page info
    return (
        <div className="min-h-screen">
            <Sidebar />
            {/* padding to make main centered in the remaining space */}
            <div className="md:pl-[200px] xl:pl-[300px]">

                {/* Main content area */}
                <main className="max-w-screen 2xl:max-w-3/4 mx-auto mt-16 md:mt-0 space-y-6">
                    {/* Mess around with the width maybe? Too wide looks odd. */}
                    {/* <main className="max-w-screen mx-auto mt-16 md:mt-0 space-y-6"> */}
                    <Goals />
                </main>
            </div>
        </div>
    );
}
