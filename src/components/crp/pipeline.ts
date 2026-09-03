export type EssayStatus =
  | "not_started"
  | "drafting"
  | "revising"
  | "reviewer_sent"
  | "final"
  | "submitted";

export const PIPELINE: { value: EssayStatus; label: string; weight: number; color: string }[] = [
  { value: "not_started", label: "Not started", weight: 0, color: "var(--st-none)" },
  { value: "drafting", label: "Drafting", weight: 0.25, color: "var(--st-draft)" },
  { value: "revising", label: "Revising", weight: 0.5, color: "var(--st-rev)" },
  { value: "reviewer_sent", label: "Reviewer sent", weight: 0.7, color: "var(--st-sent)" },
  { value: "final", label: "Final", weight: 0.9, color: "var(--st-final)" },
  { value: "submitted", label: "Submitted", weight: 1, color: "var(--st-done)" },
];

export const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  PIPELINE.map((p) => [p.value, p.label])
);

// Tailwind chip classes (for the admin shell, which doesn't use crp.css).
export const STATUS_CHIP: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  drafting: "bg-orange-100 text-orange-700",
  revising: "bg-orange-200 text-orange-800",
  reviewer_sent: "bg-gray-900 text-white",
  final: "bg-lime-100 text-lime-800",
  submitted: "bg-emerald-100 text-emerald-700",
};
export const STATUS_WEIGHT: Record<string, number> = Object.fromEntries(
  PIPELINE.map((p) => [p.value, p.weight])
);

export function weightedCompletion(statuses: string[]): number {
  if (statuses.length === 0) return 0;
  const sum = statuses.reduce((acc, s) => acc + (STATUS_WEIGHT[s] ?? 0), 0);
  return Math.round((sum / statuses.length) * 100);
}
