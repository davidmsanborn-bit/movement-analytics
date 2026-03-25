import type { SquatAnalysisResult } from "@/lib/analysis/types";

type Props = Pick<
  SquatAnalysisResult,
  "overallScore" | "confidence" | "confidenceNote"
>;

const confidenceCopy: Record<
  SquatAnalysisResult["confidence"],
  string
> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function OverallScoreCard({
  overallScore,
  confidence,
  confidenceNote,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Movement quality
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-sans text-7xl font-semibold tabular-nums tracking-tight text-[var(--accent)] md:text-8xl">
              {overallScore}
            </span>
            <span className="text-lg text-zinc-500">/ 100</span>
          </div>
        </div>
        <div className="max-w-md rounded-lg border border-white/10 bg-black/30 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
            Confidence · {confidenceCopy[confidence]}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {confidenceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
