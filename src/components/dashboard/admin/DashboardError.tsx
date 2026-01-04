"use client";

import { ArrowCounterClockwise, House } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error?: Error;
  reset?: () => void;
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-6 p-4">
      {/* Error Image */}
      <div className="relative h-64 w-64">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dashboard/dashboard-error.svg"
          alt="Dashboard Error"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="text-center mb-8 space-y-2 max-w-md">
        {/* Error heading */}
        <h2 className="text-2xl font-bold tracking-tight text-foreground font-cal-sans">
          Something went wrong
        </h2>

        {/* Error message */}
        <p className="text-muted-foreground font-light text-md">
          We encountered an unexpected error while loading this page. Please try again or return to the home page.
        </p>

        {/* Optional detailed error for debugging - kept subtle */}
        {error?.message && (
          <p className="text-xs text-muted-foreground/50 font-mono mt-2 break-all">
            Error details: {error.message}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3  min-w-[200px]">
        <Button
          onClick={reset || (() => window.location.reload())}
          className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,0,0,0.2)] transition duration-200"
        >
          <ArrowCounterClockwise size={18} weight="bold" />
          Try Again
        </Button>

        <Button
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="gap-2 rounded-xl" 
        >
          <House size={18} weight="bold" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

