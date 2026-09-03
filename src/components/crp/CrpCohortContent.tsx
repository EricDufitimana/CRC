"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/zenith/components/ui/button";
import { Input } from "@/zenith/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/zenith/components/ui/table";
import { GraduationCap, Check, Loader2 } from "lucide-react";
import { CrpAdminTabs } from "./CrpAdminTabs";
import { EmptyState } from "@/components/ui/empty-state";
import { showToastSuccess } from "@/components/toasts/ToastSuccess";
import { showToastError } from "@/components/toasts/ToastError";

function deadlineLabel(iso: string | null) {
  if (!iso) return { text: "—", hot: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = Math.round((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
  return { text: d < 0 ? "Overdue" : `D-${d}`, hot: d <= 14 };
}

export function CrpCohortContent() {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cohort = [] } = useQuery(trpc.crpAdmin.getCohortOverview.queryOptions());
  const { data: allStudents = [] } = useQuery(trpc.studentManagement.getStudents.queryOptions(undefined));
  const { data: participantIds = [] } = useQuery(trpc.crpAdmin.getParticipantIds.queryOptions());
  const inCrp = useMemo(() => new Set(participantIds), [participantIds]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [["crpAdmin", "getCohortOverview"]] });
    queryClient.invalidateQueries({ queryKey: [["crpAdmin", "getParticipantIds"]] });
  };
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const appoint = useMutation(trpc.crpAdmin.appointStudent.mutationOptions());
  const remove = useMutation(trpc.crpAdmin.removeParticipant.mutationOptions());

  const toggle = (studentId: string, name: string) => {
    const isIn = inCrp.has(studentId);
    const m = isIn ? remove : appoint;
    setTogglingId(studentId);
    m.mutate(
      { studentId },
      {
        onSuccess: () => {
          invalidate();
          showToastSuccess({
            headerText: isIn ? "Removed from CRP" : "Appointed to CRP",
            paragraphText: isIn ? `${name} no longer has CRP access.` : `${name} can now open the CRP Workspace.`,
          });
        },
        onError: () =>
          showToastError({ headerText: "Something went wrong", paragraphText: `Couldn't update ${name}. Try again.` }),
        onSettled: () => setTogglingId(null),
      }
    );
  };

  const [term, setTerm] = useState("");
  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return (allStudents as any[])
      .filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.student_id?.toLowerCase?.().includes(q)
      )
      .slice(0, 25);
  }, [term, allStudents]);

  return (
    <div className="p-8">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-cal-sans text-gray-900 mb-1">College Readiness</h1>
            <p className="text-gray-600 text-sm">Appoint students and track everyone&apos;s application progress.</p>
          </div>
          <CrpAdminTabs />
        </div>

        {/* Appoint students */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Add students to the program</h2>
          <Input
            placeholder="Search students by name, email, or ID…"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="max-w-md"
          />
          {term.trim() && (
            <div className="mt-3 divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm text-gray-500 py-3">No students match &ldquo;{term}&rdquo;.</p>
              ) : (
                results.map((s) => {
                  const isIn = inCrp.has(s.id);
                  const busy = togglingId === s.id;
                  return (
                    <div className="flex items-center gap-3 py-3" key={s.id}>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{s.full_name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {[s.grade, s.email].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </div>
                      <Button
                        variant={isIn ? "secondary" : "outline"}
                        size="sm"
                        className="gap-1 h-9"
                        disabled={busy}
                        onClick={() => toggle(s.id, s.full_name)}
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isIn ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <GraduationCap className="h-3.5 w-3.5" />
                        )}
                        {isIn ? "In CRP" : "Appoint"}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Cohort */}
        {cohort.length === 0 ? (
          <EmptyState
            image="/images/empty-state/empty-resources.svg"
            headerText="No students in the program yet"
            subtext="Search above to appoint students to the College Readiness Program."
            imageClassName="-ml-8 w-48 h-48"
            imageSize="custom"
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">
                Cohort · {cohort.length} {cohort.length === 1 ? "student" : "students"}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Completion</TableHead>
                    <TableHead className="text-xs">Essays</TableHead>
                    <TableHead className="text-xs">To review</TableHead>
                    <TableHead className="text-xs">Colleges</TableHead>
                    <TableHead className="text-xs text-right">Next deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohort.map((s) => {
                    const dl = deadlineLabel(s.nextDeadline);
                    return (
                      <TableRow
                        key={s.studentId}
                        className="cursor-pointer"
                        onClick={() => router.push(`/dashboard/admin/crp/${s.studentId}`)}
                      >
                        <TableCell className="py-3">
                          <div className="font-medium text-sm text-gray-900">{s.fullName}</div>
                          <div className="text-xs text-gray-500">{s.grade ?? "—"}</div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold tabular-nums text-gray-900 w-9">{s.completion}%</span>
                            <span className="inline-flex w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <i className="h-full rounded-full bg-gray-900" style={{ width: `${s.completion}%` }} />
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-sm tabular-nums text-gray-700">
                          {s.submittedEssays}/{s.totalEssays}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md text-xs font-semibold tabular-nums ${
                              s.reviewerSent > 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {s.reviewerSent}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-sm tabular-nums text-gray-700">{s.colleges}</TableCell>
                        <TableCell
                          className={`py-3 text-right text-sm font-medium tabular-nums ${
                            dl.hot ? "text-orange-600" : "text-gray-700"
                          }`}
                        >
                          {dl.text}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
