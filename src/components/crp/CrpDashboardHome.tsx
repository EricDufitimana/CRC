"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { roundClass } from "./CrpCollegesContent";
import { PIPELINE, weightedCompletion } from "./pipeline";

const ROUND_LABEL: Record<string, string> = {
  SCEA: "SCEA", ED: "ED", ED2: "ED II", EA: "EA", RD: "RD", ROLLING: "Rolling",
};

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso + "T00:00:00").getTime() - today.getTime()) / 86400000);
}

export function CrpDashboardHome({ firstName }: { firstName: string }) {
  const trpc = useTRPC();
  const { data: apps = [] } = useQuery(trpc.crpStudent.listApplications.queryOptions());
  const { data: essays = [] } = useQuery(trpc.crpStudent.listEssays.queryOptions());
  const { data: tasks = [] } = useQuery(trpc.crpStudent.listTasks.queryOptions());
  const openTodos = tasks.filter((t) => !t.done).length;

  const next = apps
    .filter((a) => a.deadline && !a.submitted)
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))[0];

  // Welcome state only when there's nothing at all yet.
  if (apps.length === 0 && essays.length === 0) {
    return (
      <>
        <div className="crp-phead">
          <h1>Dashboard</h1>
          <div className="meta">
            <strong>{firstName}</strong>
            <span className="sep" />
            Let&apos;s build your college list
          </div>
        </div>
        <div className="crp-grid">
          <section className="crp-card hero c8">
            <div className="crp-chead">
              <h2>Welcome to your workspace</h2>
            </div>
            <div className="crp-empty">
              <div className="big" style={{ color: "#fff" }}>
                Start with the colleges you&apos;re applying to
              </div>
              <p style={{ color: "rgba(234,240,233,.72)" }}>
                Add your schools, set each deadline and round, then track every supplement
                through drafting, review, and submission — all in one place.
              </p>
              <Link href="/crp/colleges" className="crp-btn ghost">
                Add your first college →
              </Link>
            </div>
          </section>
          <aside className="crp-card tint-peach c4">
            <div className="crp-chead">
              <h2>Next up</h2>
            </div>
            <div className="crp-empty">
              <div className="big">No deadlines yet</div>
              <p style={{ color: "rgba(138,74,30,.8)" }}>
                Once you add a college and its deadline, your soonest one shows here.
              </p>
            </div>
          </aside>
        </div>
      </>
    );
  }

  const statuses = essays.map((e) => e.status);
  const pct = weightedCompletion(statuses);
  const counts = PIPELINE.map((p) => ({ ...p, count: statuses.filter((s) => s === p.value).length }));
  const submittedEssays = counts.find((c) => c.value === "submitted")?.count ?? 0;
  const total = essays.length;
  const maxCount = Math.max(1, ...counts.map((c) => c.count));
  const d = next ? daysUntil(next.deadline!) : null;

  return (
    <>
      <div className="crp-phead">
        <h1>Dashboard</h1>
        <div className="meta">
          <strong>{firstName}</strong>
          <span className="sep" />
          {apps.length} {apps.length === 1 ? "college" : "colleges"} · {total} essays
        </div>
      </div>

      <div className="crp-grid">
        {/* weighted completion */}
        <section className="crp-card hero c4">
          <div className="crp-chead">
            <h2>Weighted completion</h2>
          </div>
          <div className="crp-hnum">{pct}%</div>
          <div className="crp-hsub">
            <b>{total}</b> {total === 1 ? "essay" : "essays"} tracked
          </div>
          <div className="crp-hramp">
            {total === 0 ? (
              <span style={{ flex: 1, background: "rgba(255,255,255,.16)" }} />
            ) : (
              counts
                .filter((c) => c.count > 0)
                .map((c) => <span key={c.value} style={{ flex: c.count, background: c.color }} />)
            )}
          </div>
          <div className="crp-hstats">
            <div className="crp-hstat"><div className="k">Essays</div><div className="v">{total}</div></div>
            <div className="crp-hstat"><div className="k">Submitted</div><div className="v">{submittedEssays}</div></div>
            <div className="crp-hstat"><div className="k">Open to-dos</div><div className="v">{openTodos}</div></div>
          </div>
        </section>

        {/* pipeline */}
        <section className="crp-card c5">
          <div className="crp-chead">
            <h2>Essay pipeline</h2>
          </div>
          {counts.map((c) => (
            <div className="crp-pl-row" key={c.value}>
              <span className="nm">
                <i className="crp-dot" style={{ background: c.color }} />
                {c.label}
              </span>
              <span className="crp-pl-bar">
                <i style={{ width: `${(c.count / maxCount) * 100}%`, background: c.color }} />
              </span>
              <span className={`crp-pl-ct ${c.count === 0 ? "z" : ""}`}>{c.count}</span>
            </div>
          ))}
        </section>

        {/* next up */}
        <aside className={`crp-card ${next ? "tint-peach" : ""} c3`}>
          <div className="crp-chead">
            <h2>Next up</h2>
          </div>
          {next ? (
            <>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 800, fontSize: 22, marginTop: 2, color: "#5E3011" }}>
                {next.college.name}
              </div>
              <div style={{ fontFamily: "var(--disp)", fontWeight: 800, fontSize: 44, lineHeight: 0.95, color: "var(--orange-deep)", margin: "6px 0 2px" }}>
                {d! < 0 ? "Overdue" : `D-${d}`}
              </div>
              <div style={{ fontSize: 12, color: "rgba(94,48,17,.8)", fontFamily: "var(--mono)" }}>
                {next.round ? ROUND_LABEL[next.round] : "No round"} ·{" "}
                {new Date(next.deadline! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
            </>
          ) : (
            <div className="crp-empty">
              <div className="big">All set</div>
              <p style={{ color: "var(--muted)" }}>No upcoming deadlines.</p>
            </div>
          )}
        </aside>

        {/* college list */}
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>College list</h2>
            <Link href="/crp/colleges" className="crp-draft">Manage ↗</Link>
          </div>
          {apps.length === 0 ? (
            <div className="crp-empty">
              <p>No colleges yet. <Link href="/crp/colleges" className="crp-draft">Add one →</Link></p>
            </div>
          ) : (
            <div className="crp-col-list">
              {apps.map((a) => (
                <div className="crp-dl-row" key={a.id}>
                  <CollegeLogo name={a.college.name} logoUrl={a.college.logoUrl} />
                  <div className="nm" style={{ fontWeight: 600, fontSize: 14 }}>
                    {a.college.name}
                  </div>
                  <div className="crp-dl-meta">
                    <span className={`crp-round-tag ${roundClass(a.round)}`}>
                      {a.round ? ROUND_LABEL[a.round] : "No round"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
