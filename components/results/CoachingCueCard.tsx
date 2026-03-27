"use client";

import {
  getCueIllustration,
} from "@/lib/coachingCueIllustrations";

type Props = {
  cue: string;
  index: number;
  sport: "squat" | "shooting" | "deadlift";
  compact?: boolean;
};

const ZONE_THEME: Record<
  string,
  { tint: string; border: string; emoji: string; label: string }
> = {
  trunk: { tint: "rgba(10,132,255,0.08)", border: "#0A84FF", emoji: "🏋️", label: "TRUNK" },
  knees: { tint: "rgba(245,158,11,0.08)", border: "#F59E0B", emoji: "🦵", label: "KNEES" },
  feet: { tint: "rgba(52,199,89,0.08)", border: "#34C759", emoji: "👟", label: "FEET" },
  hips: { tint: "rgba(147,51,234,0.08)", border: "#9333EA", emoji: "⚡", label: "HIPS" },
  elbow: { tint: "rgba(239,68,68,0.08)", border: "#EF4444", emoji: "💪", label: "ELBOW" },
  release: { tint: "rgba(10,132,255,0.08)", border: "#0A84FF", emoji: "🎯", label: "RELEASE" },
  balance: { tint: "rgba(52,199,89,0.08)", border: "#34C759", emoji: "⚖️", label: "BALANCE" },
  arms: { tint: "rgba(245,158,11,0.08)", border: "#F59E0B", emoji: "💪", label: "ARMS" },
  general: { tint: "rgba(107,114,128,0.10)", border: "#6B7280", emoji: "🎯", label: "FORM" },
};

export function CoachingCueCard({ cue, index, sport, compact = false }: Props) {
  const illustration = getCueIllustration(cue, sport);
  const zoneKey = illustration?.bodyZone ?? "general";
  const zone = ZONE_THEME[zoneKey] ?? ZONE_THEME.general;
  const emoji = illustration?.emoji ?? zone.emoji;

  return (
    <li
      className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] ${
        compact ? "p-3" : "p-5"
      }`}
      style={{ borderLeft: `3px solid ${zone.border}` }}
    >
      <div
        className={`flex gap-3 ${
          compact ? "items-start" : "flex-col md:flex-row md:items-stretch"
        }`}
      >
        <div className={compact ? "shrink-0" : "md:w-20"}>
          <div
            className={`flex items-center justify-center rounded-xl text-center ${
              compact ? "h-14 w-14" : "h-full min-h-[120px] w-full px-2 py-3"
            }`}
            style={{ backgroundColor: zone.tint }}
          >
            <span className={compact ? "text-[2.5rem] leading-none" : "text-5xl leading-none"}>{emoji}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-mono font-semibold text-[var(--accent-foreground)] ${
                compact ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm"
              }`}
            >
              {index}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {illustration ? (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center rounded-full bg-red-500/12 font-semibold text-red-600 ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
                      {illustration.faultLabel}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">→</span>
                    <span className={`inline-flex items-center rounded-full bg-green-500/12 font-semibold text-green-700 ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
                      {illustration.fixLabel}
                    </span>
                  </div>
                  <div className={`${compact ? "" : "my-1"} h-px w-full bg-[var(--border)]`} />
                </>
              ) : null}
              <p
                className={`text-[var(--text-primary)] ${
                  compact
                    ? "text-sm font-medium leading-relaxed"
                    : "overflow-hidden text-base font-semibold leading-relaxed [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                }`}
              >
                {cue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

