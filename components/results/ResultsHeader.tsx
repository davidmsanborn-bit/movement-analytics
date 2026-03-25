import type { SquatAnalysisResult } from "@/lib/analysis/types";

type Props = Pick<
  SquatAnalysisResult,
  | "movementLabel"
  | "cameraAngle"
  | "loadType"
  | "angleRecommendation"
  | "additionalAngleBenefit"
  | "analyzedAt"
  | "id"
>;

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
  angleRecommendation,
  additionalAngleBenefit,
  analyzedAt,
  id,
}: Props) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Assessment
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {movementLabel}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {cameraAngle} · {formatLoadLabel(loadType)} · {formatTime(analyzedAt)}
        </p>
        {angleRecommendation ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-amber-200/90">
            {angleRecommendation}
          </p>
        ) : null}
        {additionalAngleBenefit ? (
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-500">
            {additionalAngleBenefit}
          </p>
        ) : null}
      </div>
      <p className="font-mono text-xs text-zinc-600">
        ID · {id.slice(0, 8)}…
      </p>
    </div>
  );
}
