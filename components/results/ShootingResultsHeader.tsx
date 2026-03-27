import type { ShootingAnalysisResult } from "@/lib/analysis/shootingTypes";
import Link from "next/link";

type Props = Pick<
  ShootingAnalysisResult,
  | "shotType"
  | "hand"
  | "cameraAngle"
  | "angleRecommendation"
  | "additionalAngleBenefit"
  | "analyzedAt"
  | "id"
>;

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function titleCaseWords(s: string) {
  return s
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatShotType(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s || s === "unknown") return "Shot";
  const map: Record<string, string> = {
    jumpshot: "Jumpshot",
    "catch-and-shoot": "Catch-and-shoot",
    "off-dribble": "Off-the-dribble",
    layup: "Layup",
    "finger-roll": "Finger roll",
    floater: "Floater",
    dunk: "Dunk",
    "free-throw": "Free throw",
    "three-pointer": "Three-pointer",
    "mid-range": "Mid-range",
  };
  return map[s] ?? titleCaseWords(s.replace(/-/g, " "));
}

function formatHand(h: string): string {
  const x = h.trim().toLowerCase();
  if (x === "right") return "Right hand";
  if (x === "left") return "Left hand";
  return "Hand unknown";
}

function formatCamera(a: string): string {
  const t = a.trim();
  if (!t) return "Unknown angle";
  return titleCaseWords(t);
}

export function ShootingResultsHeader({
  shotType,
  hand,
  cameraAngle,
  angleRecommendation,
  additionalAngleBenefit,
  analyzedAt,
  id,
}: Props) {
  const addAngleHref = `/analyze/shooting?previousId=${encodeURIComponent(
    id,
  )}&addAngle=true`;

  const title = formatShotType(shotType);
  const subtitle = `${formatHand(hand)} · ${formatCamera(cameraAngle)}`;

  return (
    <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Assessment
        </p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {subtitle} · {formatTime(analyzedAt)}
        </p>
        {angleRecommendation ? (
          <div className="mt-4 max-w-xl rounded-2xl border border-[var(--accent)]/30 bg-[rgba(10,132,255,0.06)] p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(10,132,255,0.12)] text-[var(--accent)]">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  {angleRecommendation}
                </p>
                <Link
                  href={addAngleHref}
                  className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
                >
                  Add another angle →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
        {additionalAngleBenefit ? (
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--text-tertiary)]">
            {additionalAngleBenefit}
          </p>
        ) : null}
      </div>
      <p className="font-mono text-xs text-[var(--text-tertiary)]">
        ID · {id.slice(0, 8)}…
      </p>
    </div>
  );
}
