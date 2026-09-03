"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { showToastError } from "@/components/toasts/ToastError";

const TASKS_KEY = [["crpStudent", "listTasks"]];
type Priority = "high" | "medium" | "low";

function fmtDue(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CrpTodoContent() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery(trpc.crpStudent.listTasks.queryOptions());
  const invalidate = () => queryClient.invalidateQueries({ queryKey: TASKS_KEY });

  const addMutation = useMutation(trpc.crpStudent.addTask.mutationOptions());
  const updateMutation = useMutation(trpc.crpStudent.updateTask.mutationOptions());
  const removeMutation = useMutation(trpc.crpStudent.removeTask.mutationOptions());

  const [task, setTask] = useState("");
  const [area, setArea] = useState("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [due, setDue] = useState("");

  const submit = () => {
    if (!task.trim()) return;
    addMutation.mutate(
      {
        task: task.trim(),
        area: area.trim() || null,
        priority: priority || null,
        due: due || null,
      },
      {
        onSuccess: () => {
          invalidate();
          setTask("");
          setArea("");
          setPriority("");
          setDue("");
        },
        onError: (e) =>
          showToastError({ headerText: "Couldn't add task", paragraphText: e.message || "Try again." }),
      }
    );
  };

  const toggleDone = (id: string, done: boolean) =>
    updateMutation.mutate({ id, done }, { onSuccess: invalidate });

  const remove = (id: string) => removeMutation.mutate({ id }, { onSuccess: invalidate });

  const openCount = tasks.filter((t) => !t.done).length;

  return (
    <>
      <div className="crp-phead">
        <h1>To-Do</h1>
        <div className="meta">
          <strong>{openCount}</strong> open
        </div>
      </div>

      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Add a task</h2>
          </div>
          <div className="crp-form">
            <div className="crp-field full">
              <label>Task</label>
              <input
                className="crp-input"
                placeholder="e.g. Draft the Common App personal essay"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <div className="crp-field">
              <label>Area</label>
              <input
                className="crp-input"
                placeholder="e.g. Common App"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <div className="crp-field">
              <label>Priority</label>
              <select className="crp-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority | "")}>
                <option value="">None</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="crp-field">
              <label>Due</label>
              <input className="crp-input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="crp-form-actions">
              <button className="crp-btn" onClick={submit} disabled={!task.trim() || addMutation.isPending}>
                {addMutation.isPending ? "Adding…" : "Add task"}
              </button>
            </div>
          </div>
        </section>

        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Tasks</h2>
          </div>
          {tasks.length === 0 ? (
            <div className="crp-empty">
              <p>Nothing here yet. Add what you need to get done across all your schools.</p>
            </div>
          ) : (
            <div>
              {tasks.map((t) => (
                <div className={`crp-task-row ${t.done ? "done" : ""}`} key={t.id}>
                  <button
                    className={`crp-cbx ${t.done ? "on" : ""}`}
                    onClick={() => toggleDone(t.id, !t.done)}
                    aria-label={t.done ? "Mark as not done" : "Mark as done"}
                  >
                    ✓
                  </button>
                  <div className="crp-task-body">
                    <div className="crp-task-txt">{t.task}</div>
                    <div className="crp-task-meta">
                      {t.area && <span className="crp-area">{t.area}</span>}
                      {t.priority && <span className={`crp-pri ${t.priority}`}>{t.priority}</span>}
                      {t.due && <span className="crp-due">{fmtDue(t.due)}</span>}
                    </div>
                  </div>
                  <button className="crp-remove" title="Remove task" onClick={() => remove(t.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
