"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CollegeLogo } from "./CollegeLogo";
import { PIPELINE, EssayStatus } from "./pipeline";
import { showToastSuccess } from "@/components/toasts/ToastSuccess";
import { showToastError } from "@/components/toasts/ToastError";

const ESSAYS_KEY = [["crpStudent", "listEssays"]];
const COMMON_TYPES = [
  "Personal Essay",
  "Activities List",
  "Additional Info",
  "Honors",
  "Why School / Major",
  "Short answers",
  "Supplement",
  "Community / Diversity",
];

export function CrpEssaysContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: apps = [] } = useQuery(trpc.crpStudent.listApplications.queryOptions());
  const { data: essays = [] } = useQuery(trpc.crpStudent.listEssays.queryOptions());

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ESSAYS_KEY });
  const addMutation = useMutation(trpc.crpStudent.addEssay.mutationOptions());
  const updateMutation = useMutation(trpc.crpStudent.updateEssay.mutationOptions());
  const removeMutation = useMutation(trpc.crpStudent.removeEssay.mutationOptions());

  // add form
  const [target, setTarget] = useState("shared"); // "shared" | applicationId
  const [type, setType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [words, setWords] = useState("");
  const [draftLink, setDraftLink] = useState("");
  const [due, setDue] = useState("");

  const canAdd = type.trim().length > 0 && (target === "shared" || !!target);

  const submit = () => {
    if (!canAdd) return;
    addMutation.mutate(
      {
        scope: target === "shared" ? "shared" : "school",
        applicationId: target === "shared" ? null : target,
        type: type.trim(),
        prompt: prompt.trim() || null,
        words: words.trim() || null,
        draftLink: draftLink.trim() || null,
        due: due || null,
      },
      {
        onSuccess: () => {
          invalidate();
          setType("");
          setPrompt("");
          setWords("");
          setDraftLink("");
          setDue("");
          showToastSuccess({ headerText: "Essay added", paragraphText: "It's in your pipeline." });
        },
        onError: (e) =>
          showToastError({ headerText: "Couldn't add essay", paragraphText: e.message || "Try again." }),
      }
    );
  };

  const setStatus = (id: string, status: EssayStatus) =>
    updateMutation.mutate({ id, status }, { onSuccess: invalidate });

  const setLink = (id: string, link: string) =>
    updateMutation.mutate({ id, draftLink: link || null }, { onSuccess: invalidate });

  const remove = (id: string) =>
    removeMutation.mutate({ id }, { onSuccess: invalidate });

  return (
    <>
      <div className="crp-phead">
        <h1>Essays</h1>
        <div className="meta">
          <strong>{essays.length}</strong>
          {essays.length === 1 ? " tracked" : " tracked"}
        </div>
      </div>

      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Add an essay</h2>
          </div>
          <div className="crp-form">
            <div className="crp-field">
              <label>For</label>
              <select className="crp-input" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="shared">Common App / Shared</option>
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.college.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="crp-field">
              <label>Type</label>
              <input
                className="crp-input"
                list="crp-essay-types"
                placeholder="e.g. Why Yale / Major"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
              <datalist id="crp-essay-types">
                {COMMON_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="crp-field full">
              <label>Prompt</label>
              <textarea
                className="crp-textarea"
                placeholder="Paste the prompt here"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="crp-field">
              <label>Word limit</label>
              <input
                className="crp-input"
                placeholder="e.g. 650 or ~150"
                value={words}
                onChange={(e) => setWords(e.target.value)}
              />
            </div>
            <div className="crp-field">
              <label>Due</label>
              <input className="crp-input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="crp-field full">
              <label>Draft link (Google Doc)</label>
              <input
                className="crp-input"
                placeholder="https://docs.google.com/…"
                value={draftLink}
                onChange={(e) => setDraftLink(e.target.value)}
              />
            </div>
            <div className="crp-form-actions">
              <button className="crp-btn" onClick={submit} disabled={!canAdd || addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add essay"}
              </button>
            </div>
          </div>
        </section>

        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Pipeline</h2>
          </div>
          {essays.length === 0 ? (
            <div className="crp-empty">
              <p>No essays yet. Add your Common App personal statement and each school&apos;s supplements above.</p>
            </div>
          ) : (
            <div>
              {essays.map((e) => (
                <div className="crp-essay-row" key={e.id}>
                  <div className="crp-essay-main">
                    {e.college ? (
                      <CollegeLogo name={e.college.name} logoUrl={e.college.logoUrl} />
                    ) : (
                      <span className="crp-logo-fb" style={{ background: "var(--ink)" }}>
                        CA
                      </span>
                    )}
                    <div className="crp-essay-info">
                      <div className="top">
                        <span className="ty">{e.type}</span>
                        <span className="sc">{e.college ? e.college.name : "Shared"}</span>
                        {e.words && <span className="crp-words">· {e.words}</span>}
                      </div>
                      {e.prompt && <div className="pr">{e.prompt}</div>}
                    </div>
                  </div>
                  <div className="crp-essay-side">
                    <select
                      className={`crp-status s-${e.status}`}
                      value={e.status}
                      onChange={(ev) => setStatus(e.id, ev.target.value as EssayStatus)}
                    >
                      {PIPELINE.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    {e.draftLink ? (
                      <a className="crp-draft" href={e.draftLink} target="_blank" rel="noopener noreferrer">
                        Open ↗
                      </a>
                    ) : (
                      <input
                        className="crp-input"
                        style={{ width: 170, padding: "7px 10px", fontSize: 12 }}
                        placeholder="Paste draft link"
                        defaultValue=""
                        onBlur={(ev) => ev.target.value.trim() && setLink(e.id, ev.target.value.trim())}
                      />
                    )}
                    <button className="crp-remove" title="Remove essay" onClick={() => remove(e.id)}>
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
