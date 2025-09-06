"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, User, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showToastSuccess, showToastError } from "@/components/toasts";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  // Check for success/error messages from registration - run once on component mount
  useEffect(() => {
    // Only show toast once per component mount
    if (toastShownRef.current) {
      return;
    }

    const message = searchParams.get('message');
    const error = searchParams.get('error');
    const errorDetails = searchParams.get('details');

    // Handle success messages
    if (message === 'google_signup_success') {
      console.log('Showing success toast for account creation');
      showToastSuccess({
        headerText: "Account created successfully!",
        paragraphText: "Your account is ready. You can now sign in with Google."
      });
      toastShownRef.current = true;
    } else if (message === 'already_registered') {
      console.log('Showing success toast for existing account');
      showToastSuccess({
        headerText: "Account already exists!",
        paragraphText: "You can now sign in with your existing account."
      });
      toastShownRef.current = true;
    }

    // Handle error messages
    if (error) {
      console.log('Showing error toast for:', error);
      let errorMessage = "An error occurred during registration.";
      
      switch (error) {
        case 'session_error':
          errorMessage = "Session error occurred. Please try again.";
          break;
        case 'no_session':
          errorMessage = "No active session found. Please try registering again.";
          break;
        case 'student_not_found':
          errorMessage = errorDetails || "Student record not found. Please contact support.";
          break;
        case 'email_already_registered':
          errorMessage = errorDetails || "An account with this email already exists.";
          break;
        case 'callback_failed':
          errorMessage = "Registration callback failed. Please try again.";
          break;
        default:
          errorMessage = "Registration failed. Please try again.";
      }

      showToastError({
        headerText: "Registration Error",
        paragraphText: errorMessage
      });
      toastShownRef.current = true;
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar py-4">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeft className="size-5" />
          Back to Landing Page
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Choose Your Role
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select how you'd like to access the CRC platform
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/login/admin" className="block group">
              <Card className="w-full border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Admin</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manage students and platform</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login/student" className="block group">
              <Card className="w-full border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Student</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access resources and submit essays</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="mt-8">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-300">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:text-orange-600"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 