import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

// Regular client (respects RLS) - for client-side and user operations
export const supabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )
  }
  return supabaseInstance
}