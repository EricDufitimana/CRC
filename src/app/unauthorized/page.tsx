"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUserData } from "../../hooks/useUserData";

export default function UnauthorizedPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const { userId, adminId, isLoading: userDataLoading } = useUserData();

  useEffect(() => {
    console.log('Unauthorized page: useEffect triggered');
    console.log('userId:', userId);
    console.log('adminId:', adminId);
    console.log('userDataLoading:', userDataLoading);
    
    // Simulate verification process
    const timer = setTimeout(() => {
      console.log('Unauthorized page: Timer completed, checking authorization...');
      setIsLoading(false);
      setVerificationComplete(true);
      
      // Check if user should be redirected
      if (adminId) {
        console.log('Unauthorized page: User is admin, should redirect to admin dashboard');
        setDebugInfo(`Admin user detected (ID: ${adminId}), redirecting...`);
        // Show redirect loader for admin users
        setRedirecting(true);
        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard/admin';
        }, 1500);
    
      } else {
        console.log('Unauthorized page: No user ID or admin ID found');
        setDebugInfo('No user ID or admin ID found - staying on unauthorized page');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userId, adminId, userDataLoading]);

  if (isLoading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Verifying Access...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your account permissions
          </p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Taking you to your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Large Illustration */}
        <div className="mb-12 ml-8">
          <div className="relative w-128 h-96 mx-auto mb-8">
            <Image
              src="/images/illustrations/unauthorized-access.png"
              alt="Unauthorized Access"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Minimal Message */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-cal-sans text-gray-900 dark:text-white mb-4">
            Oops! Access Restricted
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            You don't have permission to access this area. Please check your credentials or contact support if you believe this is an error.
          </p>
          
          {/* Debug Information */}
         
        </div>

        {/* Minimal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-4 bg-primary text-white text-md font-medium rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-primary/80 group"
          >
            <ArrowLeft className="w-5 h-5 mr-3 transition-transform duration-300 text-sm group-hover:-translate-x-1 group-hover:scale-110" />
            Back to Login
          </Link>
          
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-[15px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-md font-medium rounded-xl hover:bg-gray-200 border border-gray-300 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 "
          >
            <Shield className="w-5 h-5 mr-3 text-sm" />
            Contact Support
          </Link>
        </div>

      
      </div>
    </div>
  );
}
