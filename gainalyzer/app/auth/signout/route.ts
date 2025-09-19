// In Next.JS App Router, API routes are file-based and correspond to urls like /auth/signout/
// Routes should export functions named POST, GET, PUT, DELETE, etc.
// req: NextRequest are nextJS version of the standard fetch API: Request
//  and contains all info about the request: headers, method, url, body, cookies, etc.
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const supabase = await createClient()

    // Check if a user's logged in
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    revalidatePath('/', 'layout')
    return NextResponse.redirect(new URL('/', req.url), {
        status: 302,
    })
}
