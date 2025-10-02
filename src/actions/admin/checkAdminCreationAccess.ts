"use server";

import { createClient } from '@supabase/supabase-js';

const ALLOWED_USER_ID = "de333332-1435-4fd5-a128-0337b5078888";

export async function checkAdminCreationAccess() {
  try {
   const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated' };
    }

    if (session.user.id !== ALLOWED_USER_ID) {
      return { authorized: false, error: 'Not authorized' };
    }

    return { authorized: true, user: session.user };
  } catch (error) {
    console.error('Authorization check failed:', error);
    return { authorized: false, error: 'Authorization check failed' };
  }
}
