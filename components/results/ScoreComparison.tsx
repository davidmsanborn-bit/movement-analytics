import { compareAnalysis } from "@/lib/analysis/compareAnalysis";
import type { SquatAnalysisResult } from "@/lib/analysis/types";

type Props = {
  previous: SquatAnalysisResult;
  current: SquatAnalysisResult;
};

export function ScoreComparison({ previous, current }: Props) {
  const cmp = compareAnalysis(previous, current);
  const overallRounded = Math.round(cmp.overallDelta);

  const order = new Map(
    current.subScores.map((s, i) => [s.dimension, i] as const),
  );
  const rows = [...cmp.subScoreDeltas].sort(
    (a, b) => (order.get(a.dimension) ?? 99) - (order.get(b.dimension) ?? 99),
  );

  return (
    <section className="space-y-6">
      <div
        className={`rounded-xl border px-5 py-4 text-center text-sm font-semibold tracking-tight ${
          overallRounded > 0
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : overallRounded < 0
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-white/10 bg-white/[0.04] text-zinc-300"
        }`}
      >
        {overallRounded > 0 && <>↑ +{overallRounded} points</>}
        {overallRounded < 0 && <>↓ {Math.abs(overallRounded)} points</>}
        {overallRounded === 0 && <>→ No change</>}
      </div>

      <div>
        <h2 className="font-sans text-lg font-semibold text-white">
          Compared to your last assessment
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
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
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm font-medium text-zinc-200">
                    {row.label}
                  </p>
                  {isMostImproved ? (
                    <span className="shrink-0 rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                      Most improved
                    </span>
                  ) : null}
                  {isStillNeeds ? (
                    <span className="shrink-0 rounded-md border border-sky-500/35 bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
                      Focus here next
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Before
                    </p>
                    <p className="mt-1 font-mono tabular-nums text-zinc-400">
                      {row.previousScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      After
                    </p>
                    <p className="mt-1 font-mono tabular-nums text-[var(--accent)]">
                      {row.currentScore}
                    </p>
                  </div>
                </div>
                <p
                  className={`mt-3 font-mono text-xs tabular-nums ${
                    deltaRounded > 0
                      ? "text-emerald-400"
                      : deltaRounded < 0
                        ? "text-red-400"
                        : "text-zinc-500"
                  }`}
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
