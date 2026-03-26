"use client";

import type { SquatAnalysisResult } from "@/lib/analysis/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  firstName: string;
  analyses: SquatAnalysisResult[];
};

const FILTERS = ["All", "Squat", "Jump", "Sprint"] as const;

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

function formatShortDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      month: "numeric",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return "--/--";
  }
}

function scoreColor(score: number) {
  return score >= 75
    ? "var(--score-high)"
    : score >= 60
      ? "var(--score-mid)"
      : "var(--score-low)";
}

function ScoreRing({ score }: { score: number }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
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
        stroke={scoreColor(score)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="var(--text-primary)"
      >
        {score}
      </text>
    </svg>
  );
}

export function DashboardClient({ firstName, analyses }: Props) {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");

  const filteredAnalyses = useMemo(() => {
    if (activeFilter === "All") return analyses;
    const q = activeFilter.toLowerCase();
    return analyses.filter((a) => a.movementLabel.toLowerCase().includes(q));
  }, [analyses, activeFilter]);

  const totalSessions = analyses.length;
  const latest = analyses[0] ?? null;
  const bestScore = totalSessions ? Math.max(...analyses.map((a) => a.overallScore)) : 0;

  const chartSeries = analyses.slice(0, 10).reverse();
  const chartW = 620;
  const chartH = 220;
  const m = { top: 18, right: 16, bottom: 34, left: 42 };
  const innerW = chartW - m.left - m.right;
  const innerH = chartH - m.top - m.bottom;
  const y = (score: number) => m.top + ((100 - score) / 100) * innerH;
  const x = (idx: number) =>
    chartSeries.length <= 1
      ? m.left + innerW / 2
      : m.left + (idx / (chartSeries.length - 1)) * innerW;
  const points = chartSeries.map((a, idx) => ({ x: x(idx), y: y(a.overallScore), a }));
  const linePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPoints =
    points.length > 0
      ? `${m.left},${y(0)} ${linePoints} ${m.left + innerW},${y(0)}`
      : "";

  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Welcome back, {firstName}
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
                    className="h-56 w-full"
                    role="img"
                    aria-label="Score history chart"
                  >
                    <defs>
                      <linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="var(--score-high)" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    {[0, 25, 50, 75, 100].map((tick) => (
                      <g key={tick}>
                        <line
                          x1={m.left}
                          x2={m.left + innerW}
                          y1={y(tick)}
                          y2={y(tick)}
                          stroke="var(--border)"
                          strokeWidth="1"
                        />
                        <text
                          x={m.left - 8}
                          y={y(tick) + 4}
                          textAnchor="end"
                          fontSize="10"
                          fill="var(--text-tertiary)"
                        >
                          {tick}
                        </text>
                      </g>
                    ))}

                    {points.length > 1 ? (
                      <>
                        <polygon points={areaPoints} fill="url(#scoreArea)" />
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="url(#scoreLine)"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </>
                    ) : null}

                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" />
                        <text
                          x={p.x}
                          y={chartH - 8}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--text-tertiary)"
                        >
                          {formatShortDate(p.a.analyzedAt)}
                        </text>
                      </g>
                    ))}
                  </svg>
                  {points.length === 1 ? (
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      Add another session to see your progress.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                New analysis
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

        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  activeFilter === f
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredAnalyses.length > 0 ? (
          <div className="mt-4">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAnalyses.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/results/${a.id}`}
                    className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--accent-hover)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {a.movementLabel}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {formatAnalyzedAt(a.analyzedAt)}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                          {a.weight ? `Weight: ${a.weight}` : "Weight: —"}
                        </p>
                      </div>
                      <ScoreRing score={a.overallScore} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            No sessions match this movement filter.
          </p>
        )}
      </div>
    </main>
  );
}
