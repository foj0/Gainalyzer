'use client'
import RegisterComponent from '@/components/LoginRegister/RegisterComponent'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'

const Page = () => {
    return (
        <>
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>
            <div className='flex flex-col items-center justify-center h-screen gap-4'>
                <RegisterComponent />
            </div>
        </>
    )
}

export default Page

