import LoginComponent from "@/components/LoginRegister/LoginComponent"
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle"

const Page = () => {
    return (
        <>
            {/* can also use fixed to keep it there even when scrolling */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className='flex flex-col items-center justify-center h-screen gap-4'>
                <LoginComponent />
            </div>
        </>
    )
}

export default Page
