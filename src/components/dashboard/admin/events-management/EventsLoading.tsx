"use client";

import { Skeleton } from "@/zenith/components/ui/skeleton";

export function EventsLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 opacity-60" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Sidebar Skeleton */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 ml-2" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl opacity-60" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>

        {/* Grid Skeleton */}
        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
