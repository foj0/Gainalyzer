// Client Component client - To access Supabase from Client Components, which run in the browser.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    // Create a supabase client on the browser with project's credentials
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
