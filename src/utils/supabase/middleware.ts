import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log(' [Middleware] Processing request:', request.url);
  console.log(' [Middleware] Pathname:', request.nextUrl.pathname);

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

  console.log(' [Middleware] User authentication status:', !!user);
  if (user) {
    console.log(' [Middleware] User ID:', user.id);
    console.log(' [Middleware] User email:', user.email);
  }

  // Check if user is trying to access protected routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');
  const isStudentRoute = request.nextUrl.pathname.startsWith('/dashboard/student');
  const isCreateAdminRoute = request.nextUrl.pathname === '/create-admin';
  const isProtectedRoute = isAdminRoute || isStudentRoute;
  const isSetupRoute = request.nextUrl.pathname.startsWith('/setup');

  console.log(' [Middleware] Route analysis:', {
    isAdminRoute,
    isStudentRoute,
    isCreateAdminRoute,
    isProtectedRoute,
    isSetupRoute,
  });

  if (!user && isProtectedRoute && !isSetupRoute) {
    // no user, redirect to login page
    console.log(' [Middleware] No user detected, redirecting to login');
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    console.log(' [Middleware] Redirect URL:', url.toString());
    return NextResponse.redirect(url)
  }

  if (user && isProtectedRoute && !isSetupRoute) {
    console.log(' [Middleware] User authenticated, checking permissions...');

    // Create admin client for database queries
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {


      if (isAdminRoute) {
        console.log(' [Middleware] Checking admin access...');
        // Check if user is an admin
        const { data: admin, error: adminError } = await adminClient
          .from('admin')
          .select('id, first_name, last_name, email')
          .eq('user_id', user.id)
          .single();

        console.log(' [Middleware] Admin check result:', { admin, error: adminError });

        if (adminError || !admin) {
          // User is not an admin, redirect to admin-verification page
          console.log(' [Middleware] User is not admin, redirecting to admin-verification');
          const url = request.nextUrl.clone()
          url.pathname = '/admin-verification'
          return NextResponse.redirect(url)
        }

        console.log(' [Middleware] Admin access confirmed:', admin);
      }

      if (isStudentRoute) {
        console.log(' [Middleware] Checking student access...');
        // Check if user is a student and get their setup status from profiles
        const { data: student, error: studentError } = await adminClient
          .from('students')
          .select('id, student_id, first_name, last_name, email')
          .eq('user_id', user.id)
          .single();

        console.log(' [Middleware] Student check result:', { student, error: studentError });

        if (studentError || !student) {
          // User is not a student, redirect to admin-verification page
          console.log(' [Middleware] User is not student, redirecting to admin-verification');
          const url = request.nextUrl.clone()
          url.pathname = '/admin-verification'
          return NextResponse.redirect(url)
        }

        // Check setup completion status from profiles table
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('has_setup, role')
          .eq('user_id', user.id)
          .single();

        console.log(' [Middleware] Profile check result:', { profile, error: profileError });

        if (profileError || !profile) {
          // Profile not found, redirect to setup
          console.log(' [Middleware] Profile not found, redirecting to setup');
          const url = request.nextUrl.clone()
          url.pathname = '/setup'
          return NextResponse.redirect(url)
        }

        // Check if student has completed setup
        if (!profile.has_setup) {
          // Student hasn't completed setup, redirect to setup page
          console.log(' [Middleware] Student setup not completed, redirecting to setup');
          const url = request.nextUrl.clone()
          url.pathname = '/setup'
          return NextResponse.redirect(url)
        }

        console.log(' [Middleware] Student access confirmed:', { student, profile });
      }
    } catch (error) {
      console.error(' [Middleware] Error in permission check:', error);
      // On error, redirect to admin-verification page
      const url = request.nextUrl.clone()
      url.pathname = '/admin-verification'
      return NextResponse.redirect(url)
    }
  }

  // Handle setup route - prevent access if setup is already completed
  if (user && isSetupRoute) {
    console.log(' [Middleware] User accessing setup route, checking status...');
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

      console.log(' [Middleware] Setup route - student check:', { student, error: studentError });

      if (student && !studentError) {
        // Check setup completion status from profiles table
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select('has_setup')
          .eq('user_id', user.id)
          .single();

        console.log(' [Middleware] Setup route - profile check:', { profile, error: profileError });

        if (profile && !profileError && profile.has_setup) {
          // Setup already completed, redirect to student dashboard
          console.log(' [Middleware] Setup already completed, redirecting to student dashboard');
          const url = request.nextUrl.clone()
          url.pathname = '/dashboard/student'
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error(' [Middleware] Error in setup route check:', error);
      // On error, allow access to setup page
    }
  }

  console.log(' [Middleware] Request processing completed, allowing access');

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