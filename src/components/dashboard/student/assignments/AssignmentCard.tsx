"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SubmissionForm } from "./SubmissionForm";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  submission_style: "google_link" | "file_upload";
  due_date: string | null;
  created_at: string | null;
  workshop: { id: string; title: string } | null;
  status: "submitted" | "not_submitted";
}

interface AssignmentCardProps {
  assignment: Assignment;
  isOpen: boolean;
  onOpenForm: (id: string | null) => void;
  refetch: () => void;
}

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

const formatDue = (iso: string | null) => {
  if (!iso) return { month: "—", day: "—", year: "" };
  const d = new Date(iso);
  return {
    month: d.toLocaleString("en-US", { month: "short" }),
    day: String(d.getDate()).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
};

const getRowStatus = (status: string, dueDate: string | null) => {
  const now = Date.now();
  const dueMs = dueDate ? new Date(dueDate).getTime() : null;
  if (status === "submitted") return { label: "CLOSED", color: "bg-neutral-200 text-neutral-700 hover:bg-neutral-200" };
  if (dueMs !== null && dueMs < now) return { label: "OVERDUE", color: "bg-red-100 text-red-700 hover:bg-red-100" };
  return { label: "ACTIVE", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" };
};

export function AssignmentCard({ assignment, isOpen, onOpenForm, refetch }: AssignmentCardProps) {
  const due = formatDue(assignment.due_date);
  const rowStatus = getRowStatus(assignment.status, assignment.due_date);

  return (
    <div className="rounded-xl border border-neutral-100 p-0 overflow-hidden bg-white">
      <div className="flex items-stretch">
        {/* Left date/status rail */}
        <div className="w-28 shrink-0 flex flex-col items-center justify-center gap-2 border-r border-neutral-100 bg-neutral-50 py-4">
          <Badge className={`text-[10px] tracking-wide ${rowStatus.color}`}>{rowStatus.label}</Badge>
          <div className="text-center">
            <div className="text-xs text-neutral-500 uppercase">{due.month}</div>
            <div className="text-2xl font-semibold leading-none">{due.day}</div>
            <div className="text-[10px] text-neutral-400">{due.year}</div>
          </div>
        </div>

        {/* Main body */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{assignment.title}</p>
                <Badge className={`${assignment.status === 'submitted' ? 'bg-green-200 border border-green-600 hover:bg-green-200  text-green-600' : 'bg-red-200 border border-red-600 text-red-600 hover:bg-red-200'} text-[10px]`}>
                  {assignment.status === 'submitted' ? 'Submitted' : 'Not submitted'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 truncate">
                {assignment.workshop?.title ?? 'Workshop'} • {assignment.submission_style === 'google_link' ? 'Google link' : 'File upload'}
                {assignment.created_at ? ` • Posted ${timeAgo(assignment.created_at)}` : ''}
              </p>
              {assignment.description && (
                <p className="mt-2 text-xs text-neutral-650 line-clamp-2">{assignment.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isOpen && assignment.status !== 'submitted' && (
                <Button
                  onClick={() => onOpenForm(assignment.id)}
                  className="relative overflow-hidden text-white shadow-md rounded-xl bg-orange-500 hover:bg-orange-500/70"
                >
                  <span className="pointer-events-none absolute inset-0 animate-pulse bg-white/10" />
                  Submit now
                </Button>
              )}
            </div>
          </div>

          {isOpen && (
            <div className="mt-4 rounded-lg border border-neutral-100 p-3 bg-neutral-50">
              <SubmissionForm
                assignment={assignment}
                onCancel={() => onOpenForm(null)}
                onSuccess={() => {
                  onOpenForm(null);
                  refetch();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
