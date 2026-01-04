import { Skeleton } from "@/zenith/components/ui/skeleton";

export function CrcClassManagementLoading() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-7 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Create Form Skeleton */}
        <div className="rounded-2xl border bg-gradient-to-br from-white to-neutral-50 p-5">
          <div className="flex items-end gap-3">
            <Skeleton className="h-10 flex-[3]" />
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-10 w-72" />

        {/* Table Skeleton */}
        <div className="rounded-2xl border overflow-hidden bg-white">
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

