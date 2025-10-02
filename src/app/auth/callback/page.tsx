'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback page loaded');
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          router.push('/login?error=session_error');
          return;
        }

        if (!data.session) {
          console.log('No session found');
          router.push('/login?error=no_session');
          return;
        }

        const user = data.session.user;
        console.log('User authenticated:', user.id);

        // Check for pending admin data first
        const pendingAdminData = localStorage.getItem('pendingAdminData');
        localStorage.removeItem('pendingAdminData'); // Clean up

        if (pendingAdminData) {
          console.log('Admin data found:', pendingAdminData);
          
          try {
            const adminData = JSON.parse(pendingAdminData);
            
            // Call our custom callback API to create admin record
            const response = await fetch('/api/auth/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: user.id,
                admin_data: adminData
              })
            });

            if (response.ok) {
              console.log('Admin account created successfully');
              router.push('/login?message=admin_created_success');
            } else {
              const errorData = await response.json();
              console.error('Error creating admin:', errorData);
              
              // Extract error details properly
              let errorDetails = 'Unknown error occurred';
              if (errorData.details) {
                errorDetails = errorData.details;
              } else if (errorData.message) {
                errorDetails = errorData.message;
              }
              
              router.push(`/login?error=admin_creation_failed&details=${encodeURIComponent(errorDetails)}`);
            }
          } catch (parseError) {
            console.error('Error parsing admin data:', parseError);
            router.push('/login?error=admin_data_parse_failed');
          }
        } else {
          // Check for student code (existing functionality)
          const studentCode = localStorage.getItem('pendingStudentCode');
          localStorage.removeItem('pendingStudentCode'); // Clean up

          if (studentCode) {
            console.log('Student code found:', studentCode);
            
            // Call our custom callback API to create student record
            const response = await fetch('/api/auth/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: user.id,
                student_code: studentCode
              })
            });

            if (response.ok) {
              console.log('Student account created/updated successfully');
              router.push('/login?message=google_signup_success');
            } else {
              const errorData = await response.json();
              console.error('Error creating student:', errorData);
              
              // Extract error details properly
              let errorDetails = 'Unknown error occurred';
              if (errorData.details) {
                errorDetails = errorData.details;
              } else if (errorData.message) {
                errorDetails = errorData.message;
              }
              
              // Handle specific error codes
              if (errorData.code === 'STUDENT_NOT_FOUND') {
                router.push(`/login?error=student_not_found&details=${encodeURIComponent(errorDetails)}`);
              } else if (errorData.code === 'ALREADY_REGISTERED') {
                router.push(`/login?error=already_registered&details=${encodeURIComponent(errorDetails)}`);
              } else if (errorData.code === 'CONFLICT') {
                router.push(`/login?error=student_conflict&details=${encodeURIComponent(errorDetails)}`);
              } else {
                router.push(`/login?error=student_update_failed&details=${encodeURIComponent(errorDetails)}`);
              }
            }
          } else {
            console.log('No pending data found, redirecting to login');
            router.push('/login?message=google_signup_success');
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