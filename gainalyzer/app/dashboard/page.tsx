import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation'
import Link from "next/link";
import Image from 'next/image'
import Sidebar from "@/components/Sidebar/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import Dashboard from "@/components/Dashboard/Dashboard";

// in NextJS App Router, functions exported as async are treated as a server component by default not browser.
export default async function Page() {
    const supabase = await createClient()
    const session = await supabase.auth.getUser()

    // if not signed in redirect to login page
    if (!session.data.user) {
        redirect('/login')
    }

    // destructure some data from session
    // Pull out only user, user_metadata, and app_metadata from the session
    const {
        data: {
            user,
            user: { user_metadata, app_metadata },
        },
    } = session
    const { name, email, user_name, avatar_url } = user_metadata
    // console.log(session);

    // async function fetchUserLogs() {
    //     if (!user) return;
    //     // const { data: logs, error } = await supabase
    //     //     .from("logs")
    //     //     .select(
    //     //         "log_date, bodyweight, calories"
    //     //     )
    //     //     .eq("user_id", user.id);
    //
    //     const { data: logs, error } = await supabase
    //         .from("logs")
    //         .select(`
    //         log_date,
    //         bodyweight,
    //         calories,
    //         log_exercises (
    //             exercise_id,
    //             weight,
    //             reps,
    //             notes,
    //             exercises!inner(name)
    //         )
    //     `)
    //         .eq("user_id", user.id)
    //
    //     if (error && error.code !== "PGRST116") { // 116 = no rows found
    //         console.error("Error fetching log:", error);
    //         return;
    //     } else {
    //         console.log("returning logs")
    //         return logs;
    //     }
    // }
    //
    // const logs = await fetchUserLogs();
    // if (logs) console.log("logs:", logs);

    // if logged in show home page info
    return (
        <div className="min-h-screen">
            <Sidebar />
            <div className="md:pl-[200px] xl:pl-[300px]">

                {/* Main content area */}
                <main className="max-w-screen 2xl:max-w-3/4 mx-auto mt-16 md:mt-0 space-y-6">
                    {/* Mess around with the width maybe? Too wide looks odd. */}
                    {/* <main className="max-w-screen mx-auto mt-16 md:mt-0 space-y-6"> */}
                    <div className="flex items-center justify-center p-6">
                        <Dashboard />
                    </div>
                </main >
            </div >
        </div>
    );
}
