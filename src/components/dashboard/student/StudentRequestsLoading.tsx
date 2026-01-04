import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentRequestsLoading() {
  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold font-cal-sans">Requests</h2>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Your submissions</CardTitle>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-64 rounded-xl" />
                <Skeleton className="h-9 w-40 rounded-xl" />
                <Skeleton className="h-9 w-40 rounded-xl" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 px-6 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-neutral-100 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded-md" />
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
