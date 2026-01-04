"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import Image from "next/image";
import { ClipboardCheck, ArrowRight } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

const timeAgo = (dateInput: string | Date | null) => {
  if (!dateInput) return '';
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
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
};

export function RecentAssignments() {
  const trpc = useTRPC();
  const { data: assignments } = useSuspenseQuery(
    trpc.studentDashboard.getLatestAssignments.queryOptions({ limit: 5 })
  );

  return (
    <Card className="border-0 shadow-sm ring-1 ring-black/5 flex flex-col overflow-hidden min-h-0 m-0.5 h-[calc(100%-6px)]">
      <CardHeader className="pb-1 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">New assignments</CardTitle>
          <Link href="/dashboard/student/assignments">
            <Button variant="ghost" size="sm" className="h-7">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-6 py-3">
          {!assignments || assignments.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center py-8 overflow-hidden h-short:py-0 text-center">
              <div className="relative w-60 h-60 h-short:w-40 h-short:h-40">
                <Image
                  src="/images/dashboard/empty-assignments.png"
                  alt="No assignments"
                  fill
                  className="opacity-95 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 h-short:space-y-2">
              {assignments.map((a) => (
                <Link key={a.id} href="/dashboard/student/assignments" className="block">
                  <div className="flex items-start gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50">
                    <span className="h-8 w-8 rounded-full bg-yearcolors-ey grid place-items-center">
                      <ClipboardCheck className="h-4 w-4 text-neutral-900" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-neutral-500">
                        {a.submission_style === 'google_link' ? 'Google link submission' : 'File upload'}
                        {a.created_at ? ` • ${timeAgo(a.created_at)}` : ''}
                      </p>
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
