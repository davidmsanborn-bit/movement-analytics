export type SubScoreRow = {
  dimension: string;
  label: string;
  score: number;
  summary: string;
};

type Props = {
  subScores: SubScoreRow[];
  /** Optional blurb under the section title (defaults to squat copy). */
  description?: string;
};

export function SubScoreGrid({
  subScores,
  description = 'Five dimensions from your side-view clip. Scores describe quality ranges, not a single “perfect” squat.',
}: Props) {
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
        {description}
      </p>
      <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0">
        {subScores.map((s) => (
          <li
            key={s.dimension}
            className="min-w-[240px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] md:min-w-0"
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
            <div className="mt-4 h-1.5 w-full rounded-full bg-[var(--bg-card-secondary)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, s.score))}%`,
                  background: scoreColor(s.score),
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
