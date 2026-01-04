"use client";

import { Skeleton } from "@/zenith/components/ui/skeleton";

export function OpportunityTrackerLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 opacity-60" />
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-full md:max-w-md rounded-2xl" />
        <div className="flex gap-4 border-b border-gray-100 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4 shadow-none">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="pt-4 grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="pt-4 border-t border-gray-50 flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
