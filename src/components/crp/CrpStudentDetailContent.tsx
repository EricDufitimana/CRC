"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { STATUS_LABEL, STATUS_CHIP } from "./pipeline";

const ROUND_LABEL: Record<string, string> = {
  SCEA: "SCEA", ED: "ED", ED2: "ED II", EA: "EA", RD: "RD", ROLLING: "Rolling",
};

function roundTagClass(round: string | null) {
  if (round === "SCEA" || round === "ED" || round === "ED2" || round === "EA") return "bg-lime-100 text-lime-800";
  if (round === "RD" || round === "ROLLING") return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-400";
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Chip({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`text-xs font-medium rounded-full px-2.5 py-1 ${
        on ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
      }`}
    >
      {children}
    </span>
  );
}

export function CrpStudentDetailContent({ studentId }: { studentId: string }) {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.crpAdmin.getStudentDetail.queryOptions({ studentId }));

  if (!data) {
    return (
      <div className="p-8">
        <Link href="/dashboard/admin/crp" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          ← Cohort
        </Link>
      </div>
    );
  }

  const { student, completion, applications, essays, recommendations, tasks } = data;
  const emailHref = student.email
    ? `mailto:${student.email}?subject=${encodeURIComponent("Your college applications")}`
    : undefined;

  return (
    <div className="p-8">
      <div className="space-y-6">
        <Link href="/dashboard/admin/crp" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
          ← Cohort
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold font-cal-sans text-gray-900 mb-1">{student.fullName}</h1>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">{completion}%</span> complete · {student.grade ?? "—"} ·{" "}
              {essays.length} essays · {applications.length} colleges
            </p>
          </div>
          {emailHref && (
            <a
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              href={emailHref}
            >
              Email student
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Colleges & deadlines">
            {applications.length === 0 ? (
              <p className="text-sm text-gray-500">No colleges added yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {applications.map((a) => (
                  <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={a.id}>
                    <CollegeLogo name={a.college.name} logoUrl={a.college.logoUrl} size={30} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{a.college.name}</div>
                      <div className="text-xs text-gray-500 tabular-nums">
                        {a.deadline ? fmtDate(a.deadline) : "No deadline"}
                        {a.submitted ? " · Submitted" : ""}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold rounded-md px-2 py-0.5 ${roundTagClass(a.round)}`}>
                      {a.round ? ROUND_LABEL[a.round] : "No round"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Recommendations">
            {recommendations.length === 0 ? (
              <p className="text-sm text-gray-500">None yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recommendations.map((r) => (
                  <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 flex-wrap" key={r.id}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900">{r.recommender}</div>
                      <div className="text-xs text-gray-500">{[r.role, r.forSchools].filter(Boolean).join(" · ") || "—"}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Chip on={r.requested}>Requested</Chip>
                      <Chip on={r.bragSheet}>Brag sheet</Chip>
                      <Chip on={r.submitted}>Submitted</Chip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card title="Essays">
          {essays.length === 0 ? (
            <p className="text-sm text-gray-500">No essays tracked yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {essays.map((e) => (
                <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 flex-wrap" key={e.id}>
                  {e.college ? (
                    <CollegeLogo name={e.college.name} logoUrl={e.college.logoUrl} size={30} />
                  ) : (
                    <span className="w-[30px] h-[30px] rounded-[9px] grid place-items-center bg-gray-900 text-white text-[10px] font-bold flex-none">
                      CA
                    </span>
                  )}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{e.type}</span>
                      <span className="text-xs text-gray-400">{e.college ? e.college.name : "Shared"}</span>
                      {e.words && <span className="text-xs text-gray-400 tabular-nums">· {e.words}</span>}
                    </div>
                    {e.prompt && <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">{e.prompt}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_CHIP[e.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABEL[e.status] ?? e.status}
                    </span>
                    {e.draftLink ? (
                      <a className="text-sm font-medium text-gray-900 underline decoration-2 decoration-gray-300 underline-offset-2 hover:decoration-gray-900" href={e.draftLink} target="_blank" rel="noopener noreferrer">
                        Open ↗
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">No draft</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="To-do">
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {tasks.map((t) => (
                <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0" key={t.id}>
                  <span
                    className={`mt-0.5 w-[18px] h-[18px] rounded-md grid place-items-center text-[11px] font-bold flex-none ${
                      t.done ? "bg-gray-900 text-white" : "border border-gray-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm ${t.done ? "text-gray-400 line-through" : "text-gray-800"}`}>{t.task}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {t.area && <span className="text-[10.5px] text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">{t.area}</span>}
                      {t.priority && (
                        <span
                          className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${
                            t.priority === "high"
                              ? "bg-orange-600 text-white"
                              : t.priority === "medium"
                              ? "bg-amber-200 text-amber-900"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {t.priority}
                        </span>
                      )}
                      {t.due && <span className="text-[11px] text-gray-400 tabular-nums">{fmtDate(t.due)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
