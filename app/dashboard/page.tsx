import { getUserAnalyses } from "@/lib/analysis/analysisStore";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatAnalyzedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function scoreColor(score: number) {
  return score >= 75
    ? "var(--score-high)"
    : score >= 60
      ? "var(--score-mid)"
      : "var(--score-low)";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? user.id;
  const analyses = await getUserAnalyses(user.id);
  const totalSessions = analyses.length;
  const latest = analyses[0] ?? null;
  const bestScore = totalSessions ? Math.max(...analyses.map((a) => a.overallScore)) : 0;

  // Chart points: last up to 10 analyses (descending order -> reverse to draw left-to-right)
  const chartSeries = analyses.slice(0, 10).reverse();
  const chartW = 560;
  const chartH = 180;
  const padding = 18;
  const xStep =
    chartSeries.length > 1
      ? (chartW - padding * 2) / (chartSeries.length - 1)
      : 0;
  const points = chartSeries
    .map((a, idx) => {
      const x = padding + idx * xStep;
      const y = padding + ((100 - a.overallScore) / 100) * (chartH - padding * 2);
      return [x, y] as const;
    })
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Welcome back, {email}
        </h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
              Latest score
            </p>
            <p className="mt-3 text-4xl font-semibold tabular-nums" style={{ color: scoreColor(latest?.overallScore ?? 0) }}>
              {latest ? `${latest.overallScore}` : "—"}
              <span className="ml-2 text-base font-medium text-[var(--text-secondary)]">/100</span>
            </p>
            {latest ? (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {formatAnalyzedAt(latest.analyzedAt)}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
              Total sessions
            </p>
            <p className="mt-3 text-4xl font-semibold tabular-nums text-[var(--text-primary)]">
              {totalSessions}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Keep improving with every clip.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
              Best score
            </p>
            <p className="mt-3 text-4xl font-semibold tabular-nums" style={{ color: scoreColor(bestScore) }}>
              {totalSessions ? bestScore : "—"}
              {totalSessions ? <span className="ml-2 text-base font-medium text-[var(--text-secondary)]">/100</span> : null}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Your current peak performance.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                  Score history
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Last {Math.min(10, totalSessions)} sessions
                </p>
              </div>

              {chartSeries.length === 0 ? (
                <p className="mt-6 text-sm text-[var(--text-secondary)]">
                  Run your first analysis to see your trend.
                </p>
              ) : (
                <div className="mt-4">
                  <svg
                    viewBox={`0 0 ${chartW} ${chartH}`}
                    className="h-44 w-full"
                    role="img"
                    aria-label="Score history chart"
                  >
                    <defs>
                      <linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--score-high)" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="0"
                      y="0"
                      width={chartW}
                      height={chartH}
                      fill="transparent"
                      rx="16"
                    />
                    <polyline
                      points={points}
                      fill="none"
                      stroke="url(#scoreLine)"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                Recent sessions
              </h2>
              <div className="mt-3">
                <Link
                  href="/analyze/squat"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                >
                  Start a new analysis
                </Link>
              </div>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Upload a clip to update your form score.
              </p>
            </div>
          </div>
        </div>

        {analyses.length > 0 ? (
          <div className="mt-8">
            <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              Recent sessions
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analyses.map((a) => {
                const c = scoreColor(a.overallScore);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/results/${a.id}`}
                      className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent-hover)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 flex-1 text-sm font-medium text-[var(--text-primary)]">
                          {a.movementLabel}
                        </p>
                        <div className="text-right">
                          <p className="font-mono text-2xl font-semibold tabular-nums" style={{ color: c }}>
                            {a.overallScore}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">/100</p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {formatAnalyzedAt(a.analyzedAt)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
