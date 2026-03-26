import type { SubScore } from "@/lib/analysis/types";

type Props = {
  subScores: SubScore[];
};

export function SubScoreGrid({ subScores }: Props) {
  const scoreColor = (score: number) =>
    score >= 75
      ? "var(--score-high)"
      : score >= 60
        ? "var(--score-mid)"
        : "var(--score-low)";

  return (
    <div>
      <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
        Sub-scores
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Five dimensions from your side-view clip. Scores describe quality
        ranges, not a single “perfect” squat.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subScores.map((s) => (
          <li
            key={s.dimension}
            className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">{s.label}</p>
              <span
                className="font-mono text-lg tabular-nums"
                style={{ color: scoreColor(s.score) }}
              >
                {s.score}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
              {s.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
