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
  const normalized = Math.max(0, Math.min(100, overallScore));
  const size = 220;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalized / 100) * circumference;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)] md:p-10">
      <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Movement quality
          </p>
          <div className="mt-5">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label={`Overall score ${overallScore} out of 100`}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="var(--border)"
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={scoreColor}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${circumference - progress}`}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--text-primary)] font-sans text-[56px] font-semibold tracking-tight"
              >
                {overallScore}
              </text>
              <text
                x="50%"
                y="61%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--text-secondary)] font-mono text-[14px]"
              >
                / 100
              </text>
            </svg>
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
