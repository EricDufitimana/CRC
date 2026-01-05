import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/account-check';

  console.log('🔐 [Auth Callback] Processing OAuth callback');
  console.log('🔐 [Auth Callback] Code present:', !!code);
  console.log('🔐 [Auth Callback] Next URL:', next);

  if (code) {
    try {
      const supabase = await createClient();
      
      console.log('🔄 [Auth Callback] Exchanging code for session...');
      
      // This is where the PKCE verifier is available (in cookies)
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ [Auth Callback] Error exchanging code:', error);
        return NextResponse.redirect(
          new URL(`/auth/error?message=${encodeURIComponent(error.message)}`, requestUrl.origin)
        );
      }

      console.log('✅ [Auth Callback] Session established successfully');

      // Redirect to the next page (account-check, admin dashboard, etc.)
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (error) {
      console.error('❌ [Auth Callback] Unexpected error:', error);
      return NextResponse.redirect(
        new URL('/auth/error?message=Authentication failed', requestUrl.origin)
      );
    }
  }

  console.log('⚠️ [Auth Callback] No code provided, redirecting to login');
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
