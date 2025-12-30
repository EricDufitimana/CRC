import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    console.log('🧪 [Test Auth API] Starting auth test...');
    
    // Get cookies for debugging
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('🧪 [Test Auth API] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Check for Supabase auth cookies specifically
    const supabaseCookies = allCookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('auth') ||
      c.name.includes('sb-')
    );
    console.log('🧪 [Test Auth API] Supabase-related cookies:', supabaseCookies.map(c => c.name));
    
    // Create Supabase client
    console.log('🧪 [Test Auth API] Creating Supabase client...');
    const supabase = await createClient();
    
    // Try to get session
    console.log('🧪 [Test Auth API] Getting session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ [Test Auth API] Session error:', sessionError);
    } else {
      console.log('🧪 [Test Auth API] Session exists:', !!session);
      if (session) {
        console.log('🧪 [Test Auth API] Session user ID:', session.user?.id);
        console.log('🧪 [Test Auth API] Session expires at:', session.expires_at);
      }
    }
    
    // Try to get user
    console.log('🧪 [Test Auth API] Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ [Test Auth API] User error:', userError);
    } else {
      console.log('🧪 [Test Auth API] User exists:', !!user);
      if (user) {
        console.log('🧪 [Test Auth API] User ID:', user.id);
        console.log('🧪 [Test Auth API] User email:', user.email);
      }
    }
    
    // Return comprehensive response
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cookies: {
        total: allCookies.length,
        supabaseRelated: supabaseCookies.length,
        cookieNames: allCookies.map(c => c.name),
        supabaseCookieNames: supabaseCookies.map(c => c.name),
      },
      session: {
        exists: !!session,
        userId: session?.user?.id || null,
        expiresAt: session?.expires_at || null,
        error: sessionError ? {
          message: sessionError.message,
          status: sessionError.status,
          name: sessionError.name,
        } : null,
      },
      user: {
        exists: !!user,
        id: user?.id || null,
        email: user?.email || null,
        error: userError ? {
          message: userError.message,
          status: userError.status,
          name: userError.name,
        } : null,
      },
    });
  } catch (error) {
    console.error('❌ [Test Auth API] Exception:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : 'Unknown error',
    }, { status: 500 });
  }
}

