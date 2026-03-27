import type { SquatAnalysisResult } from "@/lib/analysis/types";
import Link from "next/link";

type Props = Pick<
  SquatAnalysisResult,
  | "movementLabel"
  | "cameraAngle"
  | "loadType"
  | "weight"
  | "angleRecommendation"
  | "additionalAngleBenefit"
  | "analyzedAt"
  | "id"
> & {
  /** Override "Add another angle" destination (default: squat flow). */
  addAngleHref?: string;
};

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatLoadLabel(loadType: string): string {
  if (!loadType.trim()) return "Unknown load";
  return loadType
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function ResultsHeader({
  movementLabel,
  cameraAngle,
  loadType,
  weight,
  angleRecommendation,
  additionalAngleBenefit,
  analyzedAt,
  id,
  addAngleHref: addAngleHrefProp,
}: Props) {
  const addAngleHref =
    addAngleHrefProp ??
    `/analyze/squat?previousId=${encodeURIComponent(id)}&addAngle=true`;

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Assessment
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {movementLabel}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {cameraAngle} · {formatLoadLabel(loadType)}
          {weight?.trim() ? ` · Weight: ${weight.trim()}` : ""} ·{" "}
          {formatTime(analyzedAt)}
        </p>
        {angleRecommendation ? (
          <div className="mt-4 max-w-xl rounded-2xl border border-[var(--accent)]/30 bg-[rgba(10,132,255,0.06)] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(10,132,255,0.12)] text-[var(--accent)]">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {angleRecommendation}
                </p>
                <Link
                  href={addAngleHref}
                  className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                >
                  Add another angle →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
        {additionalAngleBenefit ? (
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--text-tertiary)]">
            {additionalAngleBenefit}
          </p>
        ) : null}
      </div>
      <p className="font-mono text-xs text-[var(--text-tertiary)]">
        ID · {id.slice(0, 8)}…
      </p>
    </div>
  );
}
