import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentAssignmentsLoading() {
  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold font-cal-sans">Assignments</h2>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">All assignments</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 px-6 py-3">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-neutral-100 p-0 overflow-hidden bg-white">
                  <div className="flex items-stretch">
                    {/* Left rail skeleton */}
                    <div className="w-28 shrink-0 border-r border-neutral-100 bg-neutral-50 py-4 flex flex-col items-center justify-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <div className="text-center">
                        <Skeleton className="h-3 w-10 mx-auto mb-1" />
                        <Skeleton className="h-6 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-8 mx-auto" />
                      </div>
                    </div>
                    {/* Main body skeleton */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/2 mt-2" />
                          <Skeleton className="h-4 w-3/4 mt-3" />
                        </div>
                        <Skeleton className="h-9 w-28 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
