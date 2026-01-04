import { Skeleton } from "@/zenith/components/ui/skeleton";

export function CrcClassEditLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Back to Classes Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
      </div>

      {/* Assign Students Section Skeleton */}
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-full mb-3" />
            <div className="max-h-64 overflow-auto space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-sm p-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-full mb-3" />
            <div className="max-h-64 overflow-auto space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-1">
                  <Skeleton className="h-4 flex-1 mr-2" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

