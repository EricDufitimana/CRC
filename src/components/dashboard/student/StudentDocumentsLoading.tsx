import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/ContentSkeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudentDocumentsLoading() {
  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-8 px-2" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold font-cal-sans">Documents</h2>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 overflow-hidden min-h-0">
        <Card className="border-0 shadow-sm ring-1 ring-black/5 m-0.5 h-[calc(100%-6px)] flex flex-col overflow-hidden min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg">Manage your documents</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 px-6 py-3">
            <div className="space-y-6">
              {/* Academic Report Section Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
                <div className="rounded-xl border border-neutral-100 p-4 bg-white">
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>

              {/* Resume Link Section Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Save Button Skeleton */}
              <div className="pt-4 border-t border-neutral-200">
                <Skeleton className="h-10 w-40 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
