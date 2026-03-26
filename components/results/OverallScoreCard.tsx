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
  const scoreColor =
    overallScore >= 75
      ? "var(--score-high)"
      : overallScore >= 60
        ? "var(--score-mid)"
        : "var(--score-low)";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)] md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Movement quality
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="font-sans text-7xl font-semibold tabular-nums tracking-tight md:text-8xl"
              style={{ color: scoreColor }}
            >
              {overallScore}
            </span>
            <span className="text-lg text-[var(--text-secondary)]">/ 100</span>
          </div>
        </div>
        <div className="max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-card-secondary)] px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
            Confidence · {confidenceCopy[confidence]}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            {confidenceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
