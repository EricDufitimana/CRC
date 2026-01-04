"use client";

import { Skeleton } from "@/zenith/components/ui/skeleton";

export function AnnouncementsLoading() {
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
              <Skeleton className="h-12 w-full rounded-2xl opacity-40" />
            </div>
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>

        {/* Table Skeleton */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6 text-right" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-4 border-b border-gray-50 flex justify-between">
              <Skeleton className="h-4 w-[40%]" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <div className="flex justify-end gap-2">
                 <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
