"use client";

import { Clock, FileText, Users, CheckCircle2, XCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../zenith/src/components/ui/tooltip";

interface AssignmentsMetricsProps {
  assignmentData: {
    title: string;
    workshop_title: string | null;
    created_at: string;
    submission_idate: string;
  } | null;
  metrics: {
    total_students: number;
    total_submitted: number;
  };
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString(undefined, { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });
}

export function AssignmentsMetrics({ assignmentData, metrics }: AssignmentsMetricsProps) {
  const notSubmitted = metrics.total_students - metrics.total_submitted;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-base font-medium">
          {"Workshop: " + (assignmentData?.workshop_title || "N/A")}
        </div>
        <div className="hidden md:flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 text-violet-700 px-3 py-1 text-xs">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {`${formatDateTime(assignmentData?.created_at)} — ${formatDateTime(assignmentData?.submission_idate)}`}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Assignment Name */}
        <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-neutral-500">Assignment Name</p>
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="text-sm font-medium truncate cursor-pointer">
                    {assignmentData?.title || "N/A"}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{assignmentData?.title || "N/A"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* Total Students */}
        <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total Students</p>
            <div className="text-sm font-medium">{metrics.total_students}</div>
          </div>
        </div>
        {/* Total Submitted */}
        <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
          <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total Submitted</p>
            <div className="text-sm font-medium">{metrics.total_submitted}</div>
          </div>
        </div>
        {/* Not Submitted */}
        <div className="flex items-center gap-3 rounded-xl border p-3 bg-white">
          <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Not Submitted</p>
            <div className="text-sm font-medium">{notSubmitted}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

