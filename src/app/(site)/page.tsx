"use client";
import { lazy, Suspense } from "react";
import Hero from "@/components/Hero";
import ScrollUp from "@/components/Common/ScrollUp";
import { getSession } from "@/hooks/getSession";

// Lazy load non-critical components for better initial load
const About = lazy(() => import("@/components/About"));
const Features = lazy(() => import("@/components/Features"));
const CallToAction = lazy(() => import("@/components/CallToAction"));
const HorizontalFaq = lazy(() => import("@/components/Faq/HorizontalFaq"));
const Team = lazy(() => import("@/components/Team"));
const Contact = lazy(() => import("@/components/Contact"));

export default function Home() {
  // Safely get session data with error handling
  let userId = null;
  let isLoading = true;
  
  try {
    const sessionData = getSession();
    userId = sessionData?.userId || null;
    isLoading = sessionData?.isLoading || false;
  } catch (error) {
    console.log('Home: getSession error (treating as no user):', error);
    isLoading = false;
  }

  // Performance-optimized component loading
  return (
    <main>
      <ScrollUp />
      {/* Critical above-the-fold content loads immediately */}
      <Hero />
      
      {/* Non-critical sections load lazily with smooth fallbacks */}
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <About />
      </Suspense>
      
      <Suspense fallback={<div className="h-80 bg-gray-50 animate-pulse" />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
        <CallToAction />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <HorizontalFaq />
      </Suspense>
      
      <Suspense fallback={<div className="h-80 bg-gray-50 animate-pulse" />}>
        <Team />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse" />}>
        <Contact />
      </Suspense>
    </main>
  );
}
