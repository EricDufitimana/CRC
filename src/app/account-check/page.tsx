"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUserData } from "../../hooks/useUserData";

export default function AccountCheckPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [accountExists, setAccountExists] = useState(false);
  const { userId, adminId, isLoading: userDataLoading } = useUserData();

  useEffect(() => {
    console.log('Account check page: useEffect triggered');
    console.log('userId:', userId);
    console.log('adminId:', adminId);
    console.log('userDataLoading:', userDataLoading);
    
    // Simulate verification process
    const timer = setTimeout(async () => {
      console.log('Account check page: Timer completed, checking account...');
      setIsLoading(false);
      setVerificationComplete(true);
      
      // Check if user account exists in students table
      if (userId) {
        console.log('Account check page: Checking if user exists in students table...');
        
        // Check if user exists in students table
        const studentResponse = await fetch('/api/check-user-exists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, table: 'students' })
        });

        if (!studentResponse.ok) {
          console.error('Account check page: API error:', studentResponse.status);
          setAccountExists(false);
          setDebugInfo('Error checking account status');
          return;
        }

        const studentData = await studentResponse.json();
        const studentExists = studentData.exists;
        console.log('Account check page: Student exists:', studentExists);

        if (studentExists) {
          console.log('Account check page: User account exists, redirecting to student dashboard');
          setAccountExists(true);
          setDebugInfo(`Account found in database, redirecting to student dashboard...`);
          
          // Show redirect loader
          setRedirecting(true);
          
          // Redirect to student dashboard
          setTimeout(() => {
            window.location.href = '/dashboard/student';
          }, 1500);
        } else {
          console.log('Account check page: No user account found in database');
          setAccountExists(false);
          setDebugInfo('No user account found in database - account creation required');
        }
      } else {
        console.log('Account check page: No userId available');
        setAccountExists(false);
        setDebugInfo('No userId available - please log in first');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userId, adminId, userDataLoading]);

  if (isLoading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Checking Account...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we verify your account status
          </p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-green-500 rounded-full animate-spin"></div>
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

  if (accountExists) {
    return null; // This shouldn't render if redirecting is working
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Large Illustration */}
        <div className="mb-12">
          <div className="relative  w-128 h-96 mx-auto mb-8">
            <Image
              src="/images/illustrations/user-hasnt-created.png"
              alt="Account Not Created"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Minimal Message */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-cal-sans text-gray-900 dark:text-white mb-4">
            Account Not Found
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            It looks like you haven't created your account yet. Please sign up to get started.
          </p>
          
       
        </div>

        {/* Minimal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Link
            href="/register"
            className="inline-flex items-center px-6 py-2 bg-green-600 text-white text-lg font-medium rounded-xl shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-green-700 group"
          >
            <ArrowLeft className="w-5 h-5 mr-3 transition-transform duration-300 text-sm group-hover:-translate-x-1 group-hover:scale-110" />
            Create Account
          </Link>
          
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg font-medium rounded-xl hover:bg-gray-200 border border-gray-300 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200 "
          >
            <Shield className="w-5 h-5 mr-3 text-sm" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
