import type { SquatAnalysisResult } from "@/lib/analysis/types";

type Props = Pick<
  SquatAnalysisResult,
  "movementLabel" | "cameraAngle" | "analyzedAt" | "id"
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

export function ResultsHeader({
  movementLabel,
  cameraAngle,
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
          {cameraAngle} · {formatTime(analyzedAt)}
        </p>
      </div>
      <p className="font-mono text-xs text-zinc-600">
        ID · {id.slice(0, 8)}…
      </p>
    </div>
  );
}
