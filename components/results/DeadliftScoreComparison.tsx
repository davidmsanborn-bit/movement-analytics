import { compareDeadliftAnalysis } from "@/lib/analysis/compareDeadlift";
import type { DeadliftAnalysisResult } from "@/lib/analysis/deadliftTypes";

type Props = {
  previous: DeadliftAnalysisResult;
  current: DeadliftAnalysisResult;
};

export function DeadliftScoreComparison({ previous, current }: Props) {
  const cmp = compareDeadliftAnalysis(previous, current);
  const overallRounded = Math.round(cmp.overallDelta);
  const overallColor =
    overallRounded > 0
      ? "var(--score-high)"
      : overallRounded < 0
        ? "var(--score-low)"
        : "var(--text-secondary)";

  const order = new Map(
    current.subScores.map((s, i) => [s.dimension, i] as const),
  );
  const rows = [...cmp.subScoreDeltas].sort(
    (a, b) => (order.get(a.dimension) ?? 99) - (order.get(b.dimension) ?? 99),
  );

  return (
    <section className="space-y-6">
      <div
        className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 text-center text-sm font-semibold tracking-tight shadow-[var(--shadow-card)]"
        style={{ color: overallColor }}
      >
        {overallRounded > 0 && <>↑ +{overallRounded} points</>}
        {overallRounded < 0 && <>↓ {Math.abs(overallRounded)} points</>}
        {overallRounded === 0 && <>→ No change</>}
      </div>

      <div>
        <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
          Compared to your last assessment
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Before / after by dimension. Deltas are current minus previous.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const isMostImproved = cmp.mostImproved === row.dimension;
            const isStillNeeds = cmp.stillNeeds === row.dimension;
            const deltaRounded = Math.round(row.delta);
            return (
              <li
                key={row.dimension}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex flex-wrap items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm font-medium text-[var(--text-primary)]">
                    {row.label}
                  </p>
                  {isMostImproved ? (
                    <span className="shrink-0 rounded-md border border-[var(--score-high)]/35 bg-[var(--score-high)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--score-high)]">
                      Most improved
                    </span>
                  ) : null}
                  {isStillNeeds ? (
                    <span className="shrink-0 rounded-md border border-[var(--score-mid)]/35 bg-[var(--score-mid)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--score-mid)]">
                      Focus here next
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                      Before
                    </p>
                    <p className="mt-1 font-mono tabular-nums text-[var(--text-secondary)]">
                      {row.previousScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                      After
                    </p>
                    <p className="mt-1 font-mono tabular-nums text-[var(--accent)]">
                      {row.currentScore}
                    </p>
                  </div>
                </div>
                <p
                  className="mt-3 font-mono text-xs tabular-nums"
                  style={{
                    color:
                      deltaRounded > 0
                        ? "var(--score-high)"
                        : deltaRounded < 0
                          ? "var(--score-low)"
                          : "var(--text-tertiary)",
                  }}
                >
                  {deltaRounded > 0 ? "+" : ""}
                  {deltaRounded} vs last time
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
