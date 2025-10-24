import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation'
import Sidebar from "@/components/Sidebar/Sidebar";
import Dashboard from "@/components/Dashboard/Dashboard";
import ExerciseTable from "@/components/ExerciseTable/ExerciseTable";

export default async function ExercisesPage() {
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
    return (
        <div className="min-h-screen">
            <Sidebar />
            <div className="md:pl-[200px] xl:pl-[300px]">

                {/* Main content area */}
                <main className="max-w-screen 2xl:max-w-6/12 mx-auto mt-16 md:mt-0 space-y-6">
                    {/* <main className="max-w-screen mx-auto mt-16 md:mt-0 space-y-6"> */}
                    <ExerciseTable />
                </main>
            </div>
        </div>
    );
}
