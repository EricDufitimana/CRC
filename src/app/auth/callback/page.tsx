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
      console.log(' [Auth Callback Page] Next URL from params:', nextUrl);
      try {
        console.log(' [Auth Callback Page] Page loaded');
        
        // Get the session - OAuth should have already established it via cookies
        let { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error(' [Auth Callback Page] Error getting session:', error);
          router.push('/login?error=session_error');
          return;
        }

        if (!data.session) {
          console.log(' [Auth Callback Page] No session found - waiting for OAuth to complete');
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try again
          const retryData = await supabase.auth.getSession();
          if (!retryData.data.session) {
            console.error(' [Auth Callback Page] Still no session after retry');
            router.push('/login?error=no_session');
            return;
          }

          // Use the retried session data
          data = retryData.data;
        }

        const user = data.session.user;
        console.log(' [Auth Callback Page] User authenticated:', user.id);

        // Get vanilla tRPC client for direct mutations
        const trpc = getVanillaClient();

        // Check for pending admin data first
        const pendingAdminData = localStorage.getItem('pendingAdminData');
        localStorage.removeItem('pendingAdminData'); // Clean up

        if (pendingAdminData) {
          console.log('Admin data found:', pendingAdminData);
          
          try {
            const adminData = JSON.parse(pendingAdminData);
            
            // Call tRPC to create admin record
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

          if (studentCode) {
            console.log('Student code found:', studentCode);
            
            try {
              // Call tRPC to create student record
              const result = await trpc.auth.registerStudent.mutate({
                userId: user.id,
                studentCode,
                email: user.email,
              });

              console.log('Student account created/updated successfully');
              
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