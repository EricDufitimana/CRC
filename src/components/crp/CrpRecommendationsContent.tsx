"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastSuccess } from "@/components/toasts/ToastSuccess";
import { showToastError } from "@/components/toasts/ToastError";

const RECS_KEY = [["crpStudent", "listRecommendations"]];

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className={`crp-toggle ${on ? "on" : ""}`} onClick={onClick} type="button">
      <span className="tick">✓</span>
      {label}
    </button>
  );
}

export function CrpRecommendationsContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: recs = [] } = useQuery(trpc.crpStudent.listRecommendations.queryOptions());
  const invalidate = () => queryClient.invalidateQueries({ queryKey: RECS_KEY });

  const addMutation = useMutation(trpc.crpStudent.addRecommendation.mutationOptions());
  const updateMutation = useMutation(trpc.crpStudent.updateRecommendation.mutationOptions());
  const removeMutation = useMutation(trpc.crpStudent.removeRecommendation.mutationOptions());

  const [recommender, setRecommender] = useState("");
  const [role, setRole] = useState("");
  const [forSchools, setForSchools] = useState("");

  const submit = () => {
    if (!recommender.trim()) return;
    addMutation.mutate(
      { recommender: recommender.trim(), role: role.trim() || null, forSchools: forSchools.trim() || null },
      {
        onSuccess: () => {
          invalidate();
          setRecommender("");
          setRole("");
          setForSchools("");
          showToastSuccess({ headerText: "Recommender added", paragraphText: "Track their progress here." });
        },
        onError: (e) =>
          showToastError({ headerText: "Couldn't add", paragraphText: e.message || "Try again." }),
      }
    );
  };

  const toggle = (id: string, field: "requested" | "bragSheet" | "submitted", value: boolean) =>
    updateMutation.mutate({ id, [field]: value }, { onSuccess: invalidate });

  const remove = (id: string) => removeMutation.mutate({ id }, { onSuccess: invalidate });

  return (
    <>
      <div className="crp-phead">
        <h1>Recommendations</h1>
        <div className="meta">
          <strong>{recs.length}</strong> {recs.length === 1 ? "recommender" : "recommenders"}
        </div>
      </div>

      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Add a recommender</h2>
          </div>
          <div className="crp-form">
            <div className="crp-field">
              <label>Recommender</label>
              <input
                className="crp-input"
                placeholder="e.g. ASYV Mentor"
                value={recommender}
                onChange={(e) => setRecommender(e.target.value)}
              />
            </div>
            <div className="crp-field">
              <label>Role / subject</label>
              <input
                className="crp-input"
                placeholder="e.g. Counsellor"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div className="crp-field full">
              <label>For schools</label>
              <input
                className="crp-input"
                placeholder="e.g. Yale (primary) + others"
                value={forSchools}
                onChange={(e) => setForSchools(e.target.value)}
              />
            </div>
            <div className="crp-form-actions">
              <button className="crp-btn" onClick={submit} disabled={!recommender.trim() || addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add recommender"}
              </button>
            </div>
          </div>
        </section>

        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Recommenders</h2>
          </div>
          {recs.length === 0 ? (
            <div className="crp-empty">
              <p>No recommenders yet. Add each teacher, mentor, or counsellor writing for you.</p>
            </div>
          ) : (
            <div>
              {recs.map((r) => (
                <div className="crp-rec-row" key={r.id}>
                  <div className="crp-rec-id">
                    <div className="nm">{r.recommender}</div>
                    <div className="rl">
                      {[r.role, r.forSchools].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="crp-toggles">
                    <Toggle label="Requested" on={r.requested} onClick={() => toggle(r.id, "requested", !r.requested)} />
                    <Toggle label="Brag sheet" on={r.bragSheet} onClick={() => toggle(r.id, "bragSheet", !r.bragSheet)} />
                    <Toggle label="Submitted" on={r.submitted} onClick={() => toggle(r.id, "submitted", !r.submitted)} />
                    <button className="crp-remove" title="Remove" onClick={() => remove(r.id)}>
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
