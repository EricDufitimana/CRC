'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { getVanillaClient } from '@/trpc/client';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the next URL from query params
      const searchParams = new URLSearchParams(window.location.search);
      const nextUrl = searchParams.get('next') || '/account-check';

      // --- DIAGNOSTIC LOGS: full context at page load ---
      console.log('[Auth Callback] ===== PAGE LOADED =====');
      console.log('[Auth Callback] Full URL:', window.location.href);
      console.log('[Auth Callback] Search params:', window.location.search);
      console.log('[Auth Callback] Next URL param:', nextUrl);
      console.log('[Auth Callback] All URL params:', Object.fromEntries(searchParams.entries()));
      console.log('[Auth Callback] Referrer:', document.referrer);
      console.log('[Auth Callback] localStorage keys:', Object.keys(localStorage));
      console.log('[Auth Callback] pendingStudentCode:', localStorage.getItem('pendingStudentCode'));
      console.log('[Auth Callback] pendingAdminData:', localStorage.getItem('pendingAdminData'));
      // Log all cookies visible to JS (httpOnly ones won't show)
      console.log('[Auth Callback] document.cookie (non-httpOnly):', document.cookie || '(empty)');

      try {
        console.log('[Auth Callback] Calling supabase.auth.getSession()...');

        // Get the session - OAuth should have already established it via cookies
        let { data, error } = await supabase.auth.getSession();

        console.log('[Auth Callback] getSession() result:', {
          hasSession: !!data.session,
          sessionUserId: data.session?.user?.id,
          sessionUserEmail: data.session?.user?.email,
          sessionExpiresAt: data.session?.expires_at,
          accessTokenPresent: !!data.session?.access_token,
          error: error ? { message: error.message, status: error.status } : null,
        });

        if (error) {
          console.error('[Auth Callback] getSession() error:', error);
          router.push('/login?error=session_error');
          return;
        }

        if (!data.session) {
          console.warn('[Auth Callback] No session on first attempt — waiting 1s then retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          console.log('[Auth Callback] Retrying supabase.auth.getSession()...');
          const retryData = await supabase.auth.getSession();
          console.log('[Auth Callback] Retry getSession() result:', {
            hasSession: !!retryData.data.session,
            sessionUserId: retryData.data.session?.user?.id,
            retryError: retryData.error ? { message: retryData.error.message } : null,
          });

          if (!retryData.data.session) {
            console.error('[Auth Callback] Still no session after retry.');
            console.error('[Auth Callback] This usually means:');
            console.error('[Auth Callback]   1. The auth code was not exchanged server-side (check /api/auth/callback logs)');
            console.error('[Auth Callback]   2. The Supabase session cookies were not set (check for cookie domain/SameSite issues)');
            console.error('[Auth Callback]   3. The redirect URL did not go through /api/auth/callback first');
            console.error('[Auth Callback] Current cookies at retry:', document.cookie || '(empty)');
            router.push('/login?error=no_session');
            return;
          }

          // Use the retried session data
          data = retryData.data;
        }

        const user = data.session.user;
        console.log('[Auth Callback] Session established. User:', { id: user.id, email: user.email });

        // Get vanilla tRPC client for direct mutations
        const trpc = getVanillaClient();

        // Check for pending admin data first
        const pendingAdminData = localStorage.getItem('pendingAdminData');
        localStorage.removeItem('pendingAdminData'); // Clean up

        console.log('[Auth Callback] Checking for pending registration data...');
        console.log('[Auth Callback] pendingAdminData present:', !!pendingAdminData);

        if (pendingAdminData) {
          console.log('[Auth Callback] Found pendingAdminData:', pendingAdminData);
          
          try {
            const adminData = JSON.parse(pendingAdminData);
            console.log('[Auth Callback] Parsed adminData:', adminData);

            // Call tRPC to create admin record
            console.log('[Auth Callback] Calling trpc.auth.registerAdmin.mutate...');
            await trpc.auth.registerAdmin.mutate({
              userId: user.id,
              email: user.email || '',
              honorific: adminData.honorific,
              firstName: adminData.firstName,
              lastName: adminData.lastName,
              role: adminData.role,
              token: adminData.token,
            });

            console.log('Admin account created successfully');
            
            router.push('/dashboard/admin');
          } catch (parseError) {
            console.error('Error parsing admin data or creating admin:', parseError);
            router.push('/login?error=admin_creation_failed');
          }
        } else {
          // Check for student code (existing functionality)
          const studentCode = localStorage.getItem('pendingStudentCode');
          localStorage.removeItem('pendingStudentCode'); // Clean up

          console.log('[Auth Callback] pendingStudentCode present:', !!studentCode, '| value:', studentCode);

          if (studentCode) {
            console.log('[Auth Callback] Registering student with code:', studentCode);

            try {
              // Call tRPC to create student record
              console.log('[Auth Callback] Calling trpc.auth.registerStudent.mutate with:', { userId: user.id, studentCode, email: user.email });
              const result = await trpc.auth.registerStudent.mutate({
                userId: user.id,
                studentCode,
                email: user.email,
              });

              console.log('[Auth Callback] registerStudent result:', result);
              
              // Send welcome email
              if (result.email) {
                try {
                  await trpc.auth.sendWelcomeEmail.mutate({ email: result.email });
                } catch (emailErr) {
                  console.error('Failed to send welcome email:', emailErr);
                }
              }
              
              router.push('/login?message=google_signup_success');
            } catch (studentErr) {
              console.error('Error creating student:', studentErr);
              
              const errorMessage = studentErr instanceof Error ? studentErr.message : 'Unknown error occurred';
              
              // Handle specific error codes
              if (studentErr instanceof Error && 'code' in studentErr) {
                const code = (studentErr as any).code;
                if (code === 'NOT_FOUND') {
                  router.push(`/login?error=student_not_found&details=${encodeURIComponent(errorMessage)}`);
                } else if (code === 'CONFLICT') {
                  router.push(`/login?error=already_registered&details=${encodeURIComponent(errorMessage)}`);
                } else {
                  router.push(`/login?error=student_update_failed&details=${encodeURIComponent(errorMessage)}`);
                }
              } else {
                router.push(`/login?error=student_update_failed&details=${encodeURIComponent(errorMessage)}`);
              }
            }
          } else {
            console.log('No pending data found, redirecting to next URL:', nextUrl);
            router.push(nextUrl);
          }
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        {/* Simple Loading Spinner */}
        <div className="mb-8">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
        </div>

        {/* Clean Typography */}
        <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Setting up your account
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your registration
        </p>
      </div>
    </div>
  );
}