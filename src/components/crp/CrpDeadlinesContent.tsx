"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { roundClass } from "./CrpCollegesContent";

const ROUND_LABEL: Record<string, string> = {
  SCEA: "SCEA",
  ED: "ED",
  ED2: "ED II",
  EA: "EA",
  RD: "RD",
  ROLLING: "Rolling",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function daysUntil(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function CrpDeadlinesContent() {
  const trpc = useTRPC();
  const { data: apps = [] } = useQuery(trpc.crpStudent.listApplications.queryOptions());

  const dated = apps.filter((a) => a.deadline).sort((a, b) => a.deadline!.localeCompare(b.deadline!));
  const undated = apps.filter((a) => !a.deadline);

  return (
    <>
      <div className="crp-phead">
        <h1>Deadlines</h1>
        <div className="meta">
          <strong>{dated.length}</strong> with a date set
        </div>
      </div>

      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Upcoming</h2>
          </div>

          {dated.length === 0 ? (
            <div className="crp-empty">
              <p>No deadlines yet. Set a deadline on a college from the Colleges page and it shows here.</p>
            </div>
          ) : (
            <div className="crp-col-list">
              {dated.map((a) => {
                const d = daysUntil(a.deadline!);
                const cd = a.submitted ? "Sent" : d < 0 ? "Overdue" : `D-${d}`;
                const cls = a.submitted ? "done" : d <= 14 ? "hot" : "";
                return (
                  <div className="crp-dl-row" key={a.id}>
                    <span className={`crp-cd ${cls}`}>{cd}</span>
                    <CollegeLogo name={a.college.name} logoUrl={a.college.logoUrl} />
                    <div>
                      <div className="nm" style={{ fontWeight: 600, fontSize: 14 }}>
                        {a.college.name}
                      </div>
                      <div className="crp-dl-date">{fmtDate(a.deadline!)}</div>
                    </div>
                    <div className="crp-dl-meta">
                      <span className={`crp-round-tag ${roundClass(a.round)}`}>
                        {a.round ? ROUND_LABEL[a.round] : "No round"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {undated.length > 0 && (
          <section className="crp-card c12">
            <div className="crp-chead">
              <h2>No deadline set</h2>
            </div>
            <div className="crp-col-list">
              {undated.map((a) => (
                <div className="crp-dl-row" key={a.id}>
                  <span className="crp-cd" style={{ color: "var(--faint)" }}>
                    —
                  </span>
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
          </section>
        )}
      </div>
    </>
  );
}
