"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { showToastSuccess } from "@/components/toasts/ToastSuccess";
import { showToastError } from "@/components/toasts/ToastError";

const ROUNDS: { value: string; label: string }[] = [
  { value: "", label: "Round" },
  { value: "SCEA", label: "SCEA" },
  { value: "ED", label: "ED" },
  { value: "ED2", label: "ED II" },
  { value: "EA", label: "EA" },
  { value: "RD", label: "RD" },
  { value: "ROLLING", label: "Rolling" },
];

const APPS_KEY = [["crpStudent", "listApplications"]];

type Round = "SCEA" | "ED" | "ED2" | "EA" | "RD" | "ROLLING";

type SearchResult = {
  scorecardId: string;
  name: string;
  city: string | null;
  state: string | null;
  domain: string | null;
  logoUrl: string | null;
};

export function roundClass(round: string | null) {
  if (round === "SCEA" || round === "ED" || round === "ED2" || round === "EA") return "early";
  if (round === "RD" || round === "ROLLING") return "reg";
  return "none";
}

export function CrpCollegesContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data: apps = [] } = useQuery(trpc.crpStudent.listApplications.queryOptions());
  const search = useQuery(
    trpc.crpStudent.searchColleges.queryOptions(
      { query: debounced },
      { enabled: debounced.length >= 2 }
    )
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: APPS_KEY });

  const addMutation = useMutation(trpc.crpStudent.addApplication.mutationOptions());
  const updateMutation = useMutation(trpc.crpStudent.updateApplication.mutationOptions());
  const removeMutation = useMutation(trpc.crpStudent.removeApplication.mutationOptions());

  const results: SearchResult[] = (search.data as SearchResult[] | undefined) ?? [];

  const addCollege = (r: SearchResult) => {
    setOpen(false);
    setTerm("");
    addMutation.mutate(
      { scorecardId: r.scorecardId, name: r.name, city: r.city, state: r.state, domain: r.domain },
      {
        onSuccess: () => {
          invalidate();
          showToastSuccess({ headerText: "Added", paragraphText: `${r.name} is on your list.` });
        },
        onError: (e) =>
          showToastError({
            headerText: "Couldn't add college",
            paragraphText: e.message || "Try again.",
          }),
      }
    );
  };

  const updateField = (
    id: string,
    patch: Partial<{ round: Round | null; deadline: string | null; submitted: boolean }>
  ) => {
    updateMutation.mutate({ id, ...patch }, { onSuccess: invalidate });
  };

  const remove = (id: string, name: string) => {
    removeMutation.mutate(
      { id },
      {
        onSuccess: () => {
          invalidate();
          showToastSuccess({ headerText: "Removed", paragraphText: `${name} removed from your list.` });
        },
      }
    );
  };

  return (
    <>
      <div className="crp-phead">
        <h1>Colleges</h1>
        <div className="meta">
          <strong>{apps.length}</strong>
          {apps.length === 1 ? " college" : " colleges"}
        </div>
      </div>

      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Add a college</h2>
          </div>
          <div className="crp-search-wrap">
            <input
              className="crp-search"
              placeholder="Search colleges — e.g. Yale, Amherst, MIT…"
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {open && debounced.length >= 2 && (
              <div className="crp-results">
                {search.isLoading && <div className="crp-search-note">Searching…</div>}
                {search.isError && <div className="crp-search-note">Search is unavailable right now.</div>}
                {results.length === 0 && !search.isLoading && !search.isError && (
                  <div className="crp-search-note">No matches. Try a different spelling.</div>
                )}
                {results.map((r) => (
                  <button key={r.scorecardId} className="crp-result" onClick={() => addCollege(r)}>
                    <CollegeLogo name={r.name} logoUrl={r.logoUrl} />
                    <span className="nm">{r.name}</span>
                    <span className="loc">{[r.city, r.state].filter(Boolean).join(", ")}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Your list</h2>
          </div>

          {apps.length === 0 ? (
            <div className="crp-empty">
              <p>No colleges yet. Search above to add the schools you&apos;re applying to.</p>
            </div>
          ) : (
            <div className="crp-col-list">
              {apps.map((a) => (
                <div className="crp-col-row" key={a.id}>
                  <div className="crp-col-id">
                    <CollegeLogo name={a.college.name} logoUrl={a.college.logoUrl} />
                    <div>
                      <div className="nm">{a.college.name}</div>
                      <div className="loc">
                        {[a.college.city, a.college.state].filter(Boolean).join(", ") || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="crp-controls">
                    <select
                      className="crp-select"
                      value={a.round ?? ""}
                      onChange={(e) => updateField(a.id, { round: (e.target.value || null) as Round | null })}
                    >
                      {ROUNDS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className="crp-date"
                      value={a.deadline ?? ""}
                      onChange={(e) => updateField(a.id, { deadline: e.target.value || null })}
                    />
                    <label className="crp-sub">
                      <input
                        type="checkbox"
                        checked={a.submitted}
                        onChange={(e) => updateField(a.id, { submitted: e.target.checked })}
                      />
                      Submitted
                    </label>
                    <button
                      className="crp-remove"
                      title={`Remove ${a.college.name}`}
                      onClick={() => remove(a.id, a.college.name)}
                    >
                      ×
                    </button>
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
