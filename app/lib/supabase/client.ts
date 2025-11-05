import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Keep the session alive
        persistSession: true,
        // Auto refresh token before expiry
        autoRefreshToken: true,
        // Detect session in URL for OAuth flows
        detectSessionInUrl: true,
        // Use PKCE flow for better security
        flowType: 'pkce',
      },
    }
  )
}
