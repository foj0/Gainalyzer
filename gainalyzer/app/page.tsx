import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation'
import Link from "next/link";
import Image from 'next/image'
import { CgProfile } from "react-icons/cg";
import { IoPersonCircleSharp } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import Sidebar from "@/components/Sidebar/Sidebar";
import phoneportrait from '@/public/phoneportrait.png';
import FeaturesSection from "@/components/FeatureSection/FeatureSection";
import Demo from "@/components/Demo/DemoSection";

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
    // return (
    //     <div className="flex flex-row">
    //         {/* Sidebar navigation on the left */}
    //         <div className="absolute top-4 right-4 z-50">
    //             <ThemeToggle />
    //         </div>
    //         <Sidebar />
    //
    //         {/* Main content area */}
    //         <main className="flex-1 justify-center text-center md:ml-[200px] xl:ml-[300px] mt-16 md:mt-0 p-6">
    //             Home page
    //         </main >
    //
    //
    //     </div >
    // );
    //bg-[#5cb25a]

    return (
        <div className="bg-white">

            <div className="min-h-1/2 flex flex-col"
                style={{
                    background: "radial-gradient(circle at bottom left, #74c0db 0%, #74c0db 12%, #5cb25a 40%, #5cb25a 100%)"
                }}
            >

                {/* NAV */}
                < div className="flex justify-center">
                    <nav className="w-full sm:w-1/2 flex justify-between items-center px-4 py-4">
                        <h1 className="text-2xl font-bold text-white">Gainalyzer</h1>
                        <div className="flex gap-4">
                            <Link
                                href="/login"
                            >
                                <IoPersonCircleSharp className="text-white" size={30} />
                            </Link>
                        </div>
                    </nav>

                </div>

                {/* HERO */}
                <div className="flex flex-col sm:flex-row justify-center items-center">

                    <header className="flex flex-col items-center text-center sm:text-left pt-20 pb-16 px-6">
                        <div className="flex flex-col">
                            <h2 className="text-3xl sm:text-6xl font-semibold text-white mb-4">
                                <p>Analyze your gains.</p>
                                <p>Make progress.</p>
                            </h2>
                            <p className="text-lg text-white max-w-2xl mb-10">
                                Track your workouts and analyze your progress using AI.
                            </p>
                            <div className="flex justify-center sm:justify-start gap-4">
                                <a
                                    href="/login"
                                    className="flex items-baseline gap-3 px-6 py-3 bg-white text-[#5cb25a] rounded-3xl text-xl font-bold hover:bg-[#e6e6e6] transition cursor-pointer"
                                >
                                    <p>START TODAY</p>
                                    <FaChevronRight size={15} />
                                </a>
                            </div>
                        </div>
                    </header>

                    {/* 1.97 */}
                    <div className="drop-shadow-[25px_25px_20px_rgba(0,0,0,0.50)] mb-20">
                        <Image
                            src={phoneportrait}
                            alt="phone demo image"
                            width={250}
                            height={492}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full bg-[#151824] h-[300px] px-4 flex items-center justify-center">
                <p className="text-center text-white text-4xl font-bold tracking-wide">
                    Your fitness journey deserves clarity.
                </p>
            </div>

            {/* FEATURES */}

            <div className="mt-15">
                <FeaturesSection />
            </div>

            <div className="flex h-[300px] justify-center items-center"
                style={{
                    background: "radial-gradient(circle at bottom left, #74c0db 0%, #74c0db 5%, #5cb25a 30%, #5cb25a 100%)"
                }}
            >
                <p className="text-white text-4xl font-bold">Your workouts tell a story—We help you read it.</p>
            </div>


            {/* 
                TODO: Have a little demo chart where you can select exercises and see your bodyweight/1rm 
                Have a few exercises preset and filled with some demo data. And have the bodyweight mimic
                consistent lean bulk.
                Similar to the demo on leetcode.com
                But overall design similar to myfitnesspal.com
            */}

            <div className="flex justify-center mt-5">
                <h2 className="text-4xl text-black text-bold">Demo</h2>
            </div>

            <div className="flex justify-center">
                <div className="my-10 w-full max-w-4xl bg-white shadow-xl rounded-2xl p-4">
                    <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-6 my-10">
                <div className="dashboard-section">
                    <h2 className="text-lg font-semibold mb-1">Progress and Analysis</h2>
                    <div className="flex flex-col lg:flex-row justify-center gap-6">
                        <Demo />
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="flex justify-center text-center py-6 text-sm bg-[#151824] h-[300px] ">
                © {new Date().getFullYear()} Gainalyzer, inc. All rights reserved.
            </footer>
        </div >
    );
}
