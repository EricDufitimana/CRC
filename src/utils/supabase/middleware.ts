import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Debug logging for authentication state
  console.log('🔍 Middleware Debug:', {
    pathname: request.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id || 'no-user',
    userEmail: user?.email || 'no-email',
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'no-user-agent'
  });

  // Check if user is trying to access protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard/admin') || 
                          request.nextUrl.pathname.startsWith('/dashboard/student');

  if (!user && isProtectedRoute) {
    console.log('🚫 Unauthorized access attempt:', {
      pathname: request.nextUrl.pathname,
      redirectingTo: '/login',
      timestamp: new Date().toISOString()
    });
    
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isProtectedRoute) {
    console.log('✅ Authorized access:', {
      pathname: request.nextUrl.pathname,
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date().toISOString()
    });
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}