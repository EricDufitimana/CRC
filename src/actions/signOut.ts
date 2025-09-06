"use server"

import { createClient } from '@/utils/supabase/server';

export async function signOut() {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
    
    console.log('User signed out successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out');
  }
}