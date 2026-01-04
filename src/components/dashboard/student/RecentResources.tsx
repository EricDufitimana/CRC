import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Briefcase, ArrowRight } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";

const formatPageLabel = (cat: string) => {
  return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getPagePath = (cat: string) => {
  if (cat.includes('opportunities')) return '/dashboard/student/opportunities';
  return '/dashboard/student/resources';
};

const timeAgo = (dateInput: string | Date | null) => {
  if (!dateInput) return "";
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
  ];
  for (const [intervalSeconds, label] of intervals) {
    const count = Math.floor(seconds / intervalSeconds);
    if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

export function RecentResources() {
  const trpc = useTRPC();
  const { data: recentResources } = useSuspenseQuery(trpc.studentDashboard.getRecentResources.queryOptions());

  return (
    <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">New content added</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-6 py-3">
          {recentResources.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">No new content.</div>
          ) : (
            <div className="space-y-3">
              {recentResources.map((c) => (
                <Link key={c.id} href={getPagePath(c.category || '')} className="block">
                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50">
                    <span className={`h-8 w-8 rounded-full grid place-items-center ${c.category?.includes('opportunities') ? 'bg-yearcolors-s4' : 'bg-yearcolors-ey'}`}>
                      {c.category?.includes('opportunities') ? (
                        <Briefcase className="h-4 w-4 text-neutral-900" />
                      ) : (
                        <FileText className="h-4 w-4 text-neutral-900" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-neutral-500">{formatPageLabel(c.category || 'resource')} • {c.created_at ? timeAgo(c.created_at) : ''}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
