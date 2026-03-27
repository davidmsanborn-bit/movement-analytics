"use client";

import type { UserSquatAnalysisListItem } from "@/lib/analysis/analysisStore";
import type { UserShootingAnalysisListItem } from "@/lib/analysis/shootingAnalysisStore";
import type { Session } from "@/lib/analysis/sessionStore";
import Link from "next/link";
import { useMemo, useState } from "react";

type TabId = "overview" | "training" | "sports";

type Props = {
  firstName: string;
  squatAnalyses: UserSquatAnalysisListItem[];
  shootingAnalyses: UserShootingAnalysisListItem[];
  squatSessions: Session[];
  shootingSessions: Session[];
};

const FILTERS = ["All", "Squat", "Jump", "Sprint"] as const;

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "training", label: "Training" },
  { id: "sports", label: "Sports" },
];

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

/** Squat / general dashboard cards — unchanged thresholds */
function scoreColorSquat(score: number) {
  return score >= 75
    ? "var(--score-high)"
    : score >= 60
      ? "var(--score-mid)"
      : "var(--score-low)";
}

/** Shooting cards — green 80+, amber 60–79, red below 60 */
function scoreColorShooting(score: number) {
  return score >= 80
    ? "var(--score-high)"
    : score >= 60
      ? "var(--score-mid)"
      : "var(--score-low)";
}

type RingVariant = "squat" | "shooting";

function ScoreRing({ score, variant }: { score: number; variant: RingVariant }) {
  const colorFn = variant === "shooting" ? scoreColorShooting : scoreColorSquat;
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
        stroke={colorFn(score)}
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

type ChartPoint = { analyzedAt: string; overallScore: number };

function formatSessionDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function trendDelta(first: number | null, last: number | null) {
  if (first == null || last == null) return { dir: "flat" as const, delta: 0 };
  const d = Math.round(last - first);
  if (d >= 2) return { dir: "up" as const, delta: d };
  if (d <= -2) return { dir: "down" as const, delta: d };
  return { dir: "flat" as const, delta: d };
}

function ScoreHistoryChart({
  series,
  emptyHint,
}: {
  series: ChartPoint[];
  emptyHint: string;
}) {
  const chartSeries = series.slice(0, 10).reverse();
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

  if (chartSeries.length === 0) {
    return <p className="mt-6 text-sm text-[var(--text-secondary)]">{emptyHint}</p>;
  }

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="h-56 w-full"
        role="img"
        aria-label="Score history chart"
      >
        <defs>
          <linearGradient id="scoreLineDash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--score-high)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="scoreAreaDash" x1="0" y1="0" x2="0" y2="1">
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
            <polygon points={areaPoints} fill="url(#scoreAreaDash)" />
            <polyline
              points={linePoints}
              fill="none"
              stroke="url(#scoreLineDash)"
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
  );
}

export function DashboardClient({
  firstName,
  squatAnalyses,
  shootingAnalyses,
  squatSessions,
  shootingSessions,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("All");
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [expandedOverviewSessions, setExpandedOverviewSessions] = useState<Set<string>>(
    () => new Set(),
  );

  const totalSessions = squatAnalyses.length + shootingAnalyses.length;
  const bestSquatScore =
    squatAnalyses.length > 0
      ? Math.max(...squatAnalyses.map((a) => a.overallScore))
      : null;
  const bestShootingScore =
    shootingAnalyses.length > 0
      ? Math.max(...shootingAnalyses.map((a) => a.overallScore))
      : null;

  const squatChartSeries: ChartPoint[] = squatAnalyses.map((a) => ({
    analyzedAt: a.analyzedAt,
    overallScore: a.overallScore,
  }));

  const shootingChartSeries: ChartPoint[] = shootingAnalyses.map((s) => ({
    analyzedAt: s.analyzedAt,
    overallScore: s.overallScore,
  }));

  const sessionsOverview = useMemo(() => {
    const rows = [
      ...squatSessions.map((s) => ({ kind: "squat" as const, s })),
      ...shootingSessions.map((s) => ({ kind: "shooting" as const, s })),
    ];
    rows.sort(
      (a, b) =>
        new Date(b.s.started_at).getTime() - new Date(a.s.started_at).getTime(),
    );
    return rows.slice(0, 5);
  }, [squatSessions, shootingSessions]);

  const squatClipsBySession = useMemo(() => {
    const map = new Map<string, UserSquatAnalysisListItem[]>();
    for (const a of squatAnalyses) {
      if (!a.session_id) continue;
      const arr = map.get(a.session_id) ?? [];
      arr.push(a);
      map.set(a.session_id, arr);
    }
    for (const [, arr] of map) {
      arr.sort((x, y) => new Date(x.analyzedAt).getTime() - new Date(y.analyzedAt).getTime());
    }
    return map;
  }, [squatAnalyses]);

  const shootingClipsBySession = useMemo(() => {
    const map = new Map<string, UserShootingAnalysisListItem[]>();
    for (const a of shootingAnalyses) {
      if (!a.session_id) continue;
      const arr = map.get(a.session_id) ?? [];
      arr.push(a);
      map.set(a.session_id, arr);
    }
    for (const [, arr] of map) {
      arr.sort((x, y) => new Date(x.analyzedAt).getTime() - new Date(y.analyzedAt).getTime());
    }
    return map;
  }, [shootingAnalyses]);

  function toggleSession(id: string) {
    setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleOverviewSession(id: string) {
    setExpandedOverviewSessions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Welcome back, {firstName}
        </h1>

        <div className="mt-8 border-b border-[var(--border)]">
          <nav className="flex gap-8" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`relative pb-3 text-sm transition ${
                  activeTab === t.id
                    ? "font-bold text-[var(--accent)]"
                    : "font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t.label}
                {activeTab === t.id ? (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--accent)]"
                    aria-hidden
                  />
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  Total sessions
                </p>
                <p className="mt-3 text-4xl font-semibold tabular-nums text-[var(--text-primary)]">
                  {totalSessions}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Squat + shooting combined.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  Best squat score
                </p>
                <p
                  className="mt-3 text-4xl font-semibold tabular-nums"
                  style={{
                    color:
                      bestSquatScore != null ? scoreColorSquat(bestSquatScore) : "var(--text-primary)",
                  }}
                >
                  {bestSquatScore != null ? bestSquatScore : "—"}
                  {bestSquatScore != null ? (
                    <span className="ml-2 text-base font-medium text-[var(--text-secondary)]">/100</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Training analyses.</p>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
                  Best shooting score
                </p>
                <p
                  className="mt-3 text-4xl font-semibold tabular-nums"
                  style={{
                    color:
                      bestShootingScore != null
                        ? scoreColorShooting(bestShootingScore)
                        : "var(--text-primary)",
                  }}
                >
                  {bestShootingScore != null ? bestShootingScore : "—"}
                  {bestShootingScore != null ? (
                    <span className="ml-2 text-base font-medium text-[var(--text-secondary)]">/100</span>
                  ) : null}
                </p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Sports analyses.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
              <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                Recent sessions
              </h2>
              {sessionsOverview.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--text-secondary)]">
                  No sessions yet. Start from the Training or Sports tab.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-[var(--border)]">
                  {sessionsOverview.map(({ kind, s }) => {
                    const expanded = expandedOverviewSessions.has(s.id);
                    const clips =
                      kind === "squat"
                        ? (squatClipsBySession.get(s.id) ?? [])
                        : (shootingClipsBySession.get(s.id) ?? []);
                    return (
                    <li
                      key={`${kind}-${s.id}`}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <button
                        type="button"
                        onClick={() => toggleOverviewSession(s.id)}
                        className="group flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left transition hover:bg-[#f5f5f7] dark:hover:bg-white/5"
                        style={{ cursor: "pointer" }}
                        aria-expanded={expanded}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={`mt-0.5 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold ${
                              kind === "squat"
                                ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                                : "bg-[var(--score-high)]/12 text-[var(--score-high)]"
                            }`}
                          >
                            {kind === "squat" ? "Squat" : "Shooting"}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--text-primary)]">
                              {s.name ??
                                (kind === "squat" ? "Squat session" : "Shooting session")}
                              <span className="ml-2 text-xs font-medium text-[var(--text-tertiary)]">
                                {formatSessionDate(s.started_at)}
                              </span>
                            </p>
                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                              {s.clip_count} sets · Avg{" "}
                              {s.avg_score != null ? Math.round(s.avg_score) : "—"} · Best{" "}
                              {s.best_score != null ? Math.round(s.best_score) : "—"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 font-mono text-xs text-[var(--text-tertiary)] transition-transform duration-200 ${
                            expanded ? "rotate-90" : ""
                          }`}
                          aria-hidden
                        >
                          {expanded ? "▼" : "▶"}
                        </span>
                      </button>

                      <div
                        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                          expanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="mt-3">
                          {clips.length === 0 ? (
                            <p className="px-3 text-sm text-[var(--text-secondary)]">
                              No sets linked to this session yet.
                            </p>
                          ) : (
                            <ul className="grid gap-3 px-3 sm:grid-cols-2 lg:grid-cols-3">
                              {clips.map((a) => (
                                <li key={a.id}>
                                  <Link
                                    href={
                                      kind === "squat"
                                        ? `/results/${a.id}`
                                        : `/results/shooting/${a.id}`
                                    }
                                    className="block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--accent-hover)]"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                          {kind === "squat"
                                            ? (a as UserSquatAnalysisListItem).movementLabel
                                            : (a as UserShootingAnalysisListItem).shotType.replace(
                                                /-/g,
                                                " ",
                                              )}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                          {formatAnalyzedAt(a.analyzedAt)}
                                        </p>
                                        {kind === "squat" ? (
                                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                                            {(a as UserSquatAnalysisListItem).weight
                                              ? `Weight: ${(a as UserSquatAnalysisListItem).weight}`
                                              : "Weight: —"}
                                          </p>
                                        ) : null}
                                      </div>
                                      <ScoreRing
                                        score={a.overallScore}
                                        variant={kind === "squat" ? "squat" : "shooting"}
                                      />
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        ) : null}

        {activeTab === "training" ? (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                      Score history
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Last {Math.min(10, squatAnalyses.length)} sessions
                    </p>
                  </div>
                  <ScoreHistoryChart
                    series={squatChartSeries}
                    emptyHint="Run your first squat analysis to see your trend."
                  />
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
                      Start a squat analysis
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

            {squatSessions.length === 0 ? (
              <p className="mt-6 text-sm text-[var(--text-secondary)]">
                No squat sessions yet.{" "}
                <Link href="/analyze/squat" className="font-medium text-[var(--accent)] hover:underline">
                  Upload your first clip
                </Link>
                .
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {squatSessions.map((s) => {
                  const clips = squatClipsBySession.get(s.id) ?? [];
                  const first = clips[0]?.overallScore ?? null;
                  const last = clips.length ? clips[clips.length - 1]?.overallScore ?? null : null;
                  const tr = trendDelta(first, last);
                  const expanded = !!expandedSessions[s.id];
                  const summary = `${s.clip_count} sets · Avg ${s.avg_score != null ? Math.round(s.avg_score) : "—"} · Best ${s.best_score != null ? Math.round(s.best_score) : "—"}`;
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSession(s.id)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {s.name ?? "Squat session"}{" "}
                            <span className="ml-2 text-xs font-medium text-[var(--text-tertiary)]">
                              {formatSessionDate(s.started_at)}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {summary}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                            Trend:{" "}
                            {tr.dir === "up"
                              ? `↑ +${tr.delta}`
                              : tr.dir === "down"
                                ? `↓ ${tr.delta}`
                                : "→"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[var(--accent)]">
                          {expanded ? "Hide sets" : "View sets"}
                        </span>
                      </button>

                      {expanded ? (
                        <div className="mt-4">
                          {clips.length === 0 ? (
                            <p className="text-sm text-[var(--text-secondary)]">
                              No clips linked to this session yet.
                            </p>
                          ) : (
                            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {clips.map((a) => (
                                <li key={a.id}>
                                  <Link
                                    href={`/results/${a.id}`}
                                    className="block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--accent-hover)]"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                          {a.movementLabel}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                          {formatAnalyzedAt(a.analyzedAt)}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                                          {a.weight ? `Weight: ${a.weight}` : "Weight: —"}
                                        </p>
                                      </div>
                                      <ScoreRing score={a.overallScore} variant="squat" />
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        {activeTab === "sports" ? (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                      Shooting score history
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Last {Math.min(10, shootingAnalyses.length)} sessions
                    </p>
                  </div>
                  <ScoreHistoryChart
                    series={shootingChartSeries}
                    emptyHint="Run your first shooting analysis to see your trend."
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
                  <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
                    New analysis
                  </h2>
                  <div className="mt-3">
                    <Link
                      href="/analyze/shooting"
                      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                    >
                      Start a shooting analysis
                    </Link>
                  </div>
                  <p className="mt-3 text-sm text-[var(--text-secondary)]">
                    Side-view basketball clip for form feedback.
                  </p>
                </div>
              </div>
            </div>

            {shootingSessions.length === 0 ? (
              <p className="mt-8 text-sm text-[var(--text-secondary)]">
                No shooting sessions yet.{" "}
                <Link href="/analyze/shooting" className="font-medium text-[var(--accent)] hover:underline">
                  Upload your first clip
                </Link>
                .
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {shootingSessions.map((s) => {
                  const clips = shootingClipsBySession.get(s.id) ?? [];
                  const first = clips[0]?.overallScore ?? null;
                  const last = clips.length ? clips[clips.length - 1]?.overallScore ?? null : null;
                  const tr = trendDelta(first, last);
                  const expanded = !!expandedSessions[s.id];
                  const summary = `${s.clip_count} sets · Avg ${s.avg_score != null ? Math.round(s.avg_score) : "—"} · Best ${s.best_score != null ? Math.round(s.best_score) : "—"}`;
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSession(s.id)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {s.name ?? "Shooting session"}{" "}
                            <span className="ml-2 text-xs font-medium text-[var(--text-tertiary)]">
                              {formatSessionDate(s.started_at)}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-secondary)]">
                            {summary}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                            Trend:{" "}
                            {tr.dir === "up"
                              ? `↑ +${tr.delta}`
                              : tr.dir === "down"
                                ? `↓ ${tr.delta}`
                                : "→"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[var(--accent)]">
                          {expanded ? "Hide sets" : "View sets"}
                        </span>
                      </button>

                      {expanded ? (
                        <div className="mt-4">
                          {clips.length === 0 ? (
                            <p className="text-sm text-[var(--text-secondary)]">
                              No clips linked to this session yet.
                            </p>
                          ) : (
                            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {clips.map((a) => (
                                <li key={a.id}>
                                  <Link
                                    href={`/results/shooting/${a.id}`}
                                    className="block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition hover:border-[var(--accent-hover)]"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="text-sm font-medium capitalize text-[var(--text-primary)]">
                                          {a.shotType.replace(/-/g, " ")}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                                          {a.movementLabel}
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                                          {formatAnalyzedAt(a.analyzedAt)}
                                        </p>
                                      </div>
                                      <ScoreRing score={a.overallScore} variant="shooting" />
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}
