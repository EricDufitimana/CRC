"use client";

import { Skeleton } from "@/zenith/components/ui/skeleton";

export function WorkshopsLoading() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />

      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}
