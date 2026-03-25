import type { SubScore } from "@/lib/analysis/types";

type Props = {
  subScores: SubScore[];
};

export function SubScoreGrid({ subScores }: Props) {
  return (
    <div>
      <h2 className="font-sans text-lg font-semibold text-white">
        Sub-scores
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Five dimensions from your side-view clip. Scores describe quality
        ranges, not a single “perfect” squat.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subScores.map((s) => (
          <li
            key={s.dimension}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-zinc-200">{s.label}</p>
              <span className="font-mono text-lg tabular-nums text-[var(--accent)]">
                {s.score}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              {s.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
