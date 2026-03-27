"use client";

import {
  getCueIllustration,
} from "@/lib/coachingCueIllustrations";

type Props = {
  cue: string;
  index: number;
  sport: "squat" | "shooting";
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

export function CoachingCueCard({ cue, index, sport }: Props) {
  const illustration = getCueIllustration(cue, sport);
  const zoneKey = illustration?.bodyZone ?? "general";
  const zone = ZONE_THEME[zoneKey] ?? ZONE_THEME.general;
  const emoji = illustration?.emoji ?? zone.emoji;

  return (
    <li
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
      style={{ borderLeft: `3px solid ${zone.border}` }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <div className="md:w-[35%]">
          <div
            className="flex h-full min-h-[138px] flex-col items-center justify-center rounded-xl px-3 py-4 text-center"
            style={{ backgroundColor: zone.tint }}
          >
            <span className="text-4xl leading-none">{emoji}</span>
            <span className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]">
              {illustration ? zone.label : "FORM"}
            </span>
          </div>
        </div>
        <div className="md:w-[65%]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-mono text-sm font-semibold text-[var(--accent-foreground)]">
              {index}
            </span>
            <div className="min-w-0 flex-1">
              {illustration ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-semibold text-red-600">
                      {illustration.faultLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-500/12 px-2.5 py-1 text-xs font-semibold text-green-700">
                      {illustration.fixLabel}
                    </span>
                  </div>
                  <div className="my-3 h-px w-full bg-[var(--border)]" />
                </>
              ) : null}
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {cue}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

