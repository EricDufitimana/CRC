import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');
  const isStudentRoute = request.nextUrl.pathname.startsWith('/dashboard/student');
  const isProtectedRoute = isAdminRoute || isStudentRoute;
  const isSetupRoute = request.nextUrl.pathname.startsWith('/setup');

  if (!user && isProtectedRoute && !isSetupRoute) {
    console.log('🚫 Unauthorized access attempt:', {
      pathname: request.nextUrl.pathname,
      redirectingTo: '/login',
      timestamp: new Date().toISOString()
    });
    
    // no user, redirect to login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isProtectedRoute && !isSetupRoute) {
    // Create admin client for database queries
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      if (isAdminRoute) {
        // Check if user is an admin
        const { data: admin, error: adminError } = await adminClient
          .from('admin')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (adminError || !admin) {
          console.log('🚫 Admin access denied:', {
            pathname: request.nextUrl.pathname,
            userId: user.id,
            error: adminError?.message || 'Admin not found',
            timestamp: new Date().toISOString()
          });
          
          // User is not an admin, redirect to admin-verification page
          const url = request.nextUrl.clone()
          url.pathname = '/admin-verification'
          return NextResponse.redirect(url)
        }

        console.log('✅ Admin access granted:', {
          pathname: request.nextUrl.pathname,
          userId: user.id,
          adminId: admin.id,
          timestamp: new Date().toISOString()
        });
      }

      if (isStudentRoute) {
        // Check if user is a student and get their setup status from profiles
        const { data: student, error: studentError } = await adminClient
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError || !student) {
          console.log('🚫 Student access denied:', {
            pathname: request.nextUrl.pathname,
            userId: user.id,
            error: studentError?.message || 'Student not found',
            timestamp: new Date().toISOString()
          });
          
          // User is not a student, redirect to admin-verification page
          const url = request.nextUrl.clone()
          url.pathname = '/admin-verification'
          return NextResponse.redirect(url)
        }

        // Check setup completion status from profiles table
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('has_setup')
          .eq('user_id', user.id)
          .single();

        if (profileError || !profile) {
          console.log('🚫 Profile not found:', {
            pathname: request.nextUrl.pathname,
            userId: user.id,
            error: profileError?.message || 'Profile not found',
            timestamp: new Date().toISOString()
          });
          
          // Profile not found, redirect to setup
          const url = request.nextUrl.clone()
          url.pathname = '/setup'
          return NextResponse.redirect(url)
        }

        // Check if student has completed setup
        if (!profile.has_setup) {
          console.log('🚫 Student setup not completed:', {
            pathname: request.nextUrl.pathname,
            userId: user.id,
            studentId: student.id,
            hasCompletedSetup: profile.has_setup,
            timestamp: new Date().toISOString()
          });
          
          // Student hasn't completed setup, redirect to setup page
          const url = request.nextUrl.clone()
          url.pathname = '/setup'
          return NextResponse.redirect(url)
        }

        console.log('✅ Student access granted:', {
          pathname: request.nextUrl.pathname,
          userId: user.id,
          studentId: student.id,
          hasCompletedSetup: profile.has_setup,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('❌ Middleware authorization error:', error);
      // On error, redirect to admin-verification page
      const url = request.nextUrl.clone()
      url.pathname = '/admin-verification'
      return NextResponse.redirect(url)
    }
  }

  // Handle setup route - prevent access if setup is already completed
  if (user && isSetupRoute) {
    // Create admin client for database queries
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      // Check if user is a student and get their setup status
      const { data: student, error: studentError } = await adminClient
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (student && !studentError) {
        // Check setup completion status from profiles table
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('has_setup')
          .eq('user_id', user.id)
          .single();

        if (profile && !profileError && profile.has_setup) {
          console.log('🚫 Setup already completed, redirecting to dashboard:', {
            pathname: request.nextUrl.pathname,
            userId: user.id,
            studentId: student.id,
            hasCompletedSetup: profile.has_setup,
            timestamp: new Date().toISOString()
          });
          
          // Setup already completed, redirect to student dashboard
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard/student'
          return NextResponse.redirect(url)
        }

        console.log('✅ Student accessing setup page:', {
          pathname: request.nextUrl.pathname,
          userId: user.id,
          studentId: student.id,
          hasCompletedSetup: profile?.has_setup || false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.log('❌ Setup route middleware error:', error);
      // On error, allow access to setup page
    }
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