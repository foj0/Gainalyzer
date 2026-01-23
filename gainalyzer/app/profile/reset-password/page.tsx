'use client'

import { Suspense } from "react"
import ResetPasswordPage from "./ResetPasswordPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordPage />
        </Suspense>
    )
}
