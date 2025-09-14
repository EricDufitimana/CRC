"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { ExtrudingComponent } from "../animation/ExtrudingComponent";
import { useSession } from "@/hooks/getSession";

const GetStartedButton = () => {
  // Safely get session data with error handling
  let userId = null;
  let adminId = null;
  let isLoading = false;
  
  try {
    const sessionData = useSession();
    userId = sessionData?.userId || null;
    adminId = sessionData?.adminId || null;
    isLoading = sessionData?.isLoading || false;
  } catch (error) {
    console.log('GetStartedButton: getSession error (treating as no user):', error);
    // Keep all values as null/false - user not logged in
  }

  return (
    <ExtrudingComponent
      delay={0.2}
      springBounce={0.4}
      duration={0.6}
      scaleFrom={0.8}
      scaleTo={1}
      autoPlay={true}
    >
      {userId ? (
        // User is logged in - show dashboard button
        <Link
          href={adminId ? "/dashboard/admin" : "/dashboard/student"}
          className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-secondary border border-secondary text-white font-medium rounded-md  shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Go to Dashboard</span>
          <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
        </Link>
      ) : (
        // User is not logged in - show get started button
        <Link
          href="/register"
          className="group inline-flex items-center justify-center gap-3 px-7 py-3 bg-dark border border-dark text-white font-medium rounded-md hover:bg-gray-800 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition-all duration-200 ease-linear"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
        </Link>
      )}
    </ExtrudingComponent>
  );
};

export default GetStartedButton;
