import { supabase } from "@/lib/supabase"

export const useSupabase = () => {
  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id
  }

  return { getSession, getUser, getUserId }
}