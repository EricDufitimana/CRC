"use client";

import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardErrorProps {
  error?: Error;
  reset?: () => void;
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 rounded-4xl">
      <Card className="w-full max-w-md border-red-200 bg-white dark:bg-gray-800 shadow-xl">
        <CardContent className="pt-12 pb-8 px-8 text-center">
          {/* Error icon */}
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 p-6">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          {/* Error heading */}
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white font-cal-sans">
            Something Went Wrong
          </h2>
          
          {/* Error message */}
          <p className="mb-2 text-gray-600 dark:text-gray-400">
            We encountered an error while loading your dashboard.
          </p>
          
          {/* Error details (if available) */}
          {error?.message && (
            <div className="mt-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/10 p-3 border border-red-100 dark:border-red-800">
              <p className="text-xs text-red-800 dark:text-red-300 font-mono break-words">
                {error.message}
              </p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {reset && (
              <Button
                onClick={reset}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
          
          {/* Support hint */}
          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

