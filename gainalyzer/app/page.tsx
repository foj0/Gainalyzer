import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation'
import Link from "next/link";
import Image from 'next/image'
import Sidebar from "@/components/Sidebar/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";

// in NextJS App Router, functions exported as async are treated as a server component by default not browser.
export default async function Dashboard() {
    const supabase = await createClient()

    const session = await supabase.auth.getUser()

    // if not signed in redirect to login page
    if (!session.data.user) {
        redirect('/login')
    }

    // destructure some data from session
    const {
        data: {
            user: { user_metadata, app_metadata },
        },
    } = session

    const { name, email, user_name, avatar_url } = user_metadata

    console.log(session);
    // if logged in show home page info
    return (
        <div className="flex flex-row">
            {/* Sidebar navigation on the left */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <Sidebar />

            {/* Main content area */}
            <main className="flex-1 justify-center text-center md:ml-[200px] xl:ml-[300px] mt-16 md:mt-0 p-6">
                Home page
            </main >


        </div >
    );
}
