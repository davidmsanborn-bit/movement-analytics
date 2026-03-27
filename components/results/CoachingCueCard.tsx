"use client";

import {
  getCueIllustration,
  type CueIllustration,
} from "@/lib/coachingCueIllustrations";

type Props = {
  cue: string;
  index: number;
  sport: "squat" | "shooting";
};

function MiniFigure({
  shape,
  stroke,
  label,
}: {
  shape: string;
  stroke: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 60 80" className="h-20 w-14" aria-hidden>
        <circle
          cx="30"
          cy="10"
          r="6"
          fill="none"
          stroke={stroke}
          strokeWidth="2"
        />
        <path
          d={shape}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="text-center text-[11px] font-medium"
        style={{ color: stroke }}
      >
        {label}
      </span>
    </div>
  );
}

function IllustrationPanel({ cue }: { cue: CueIllustration }) {
  return (
    <div className="w-full rounded-xl bg-[#f5f5f7] p-3">
      <div className="flex items-center justify-center gap-2">
        <MiniFigure shape={cue.svgFault} stroke="#ef4444" label={cue.faultLabel} />
        <span className="text-lg font-semibold text-[var(--text-secondary)]">→</span>
        <MiniFigure shape={cue.svgFix} stroke="#34C759" label={cue.fixLabel} />
      </div>
      <div className="mt-2 flex justify-center">
        <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          {cue.bodyZone}
        </span>
      </div>
    </div>
  );
}

export function CoachingCueCard({ cue, index, sport }: Props) {
  const illustration = getCueIllustration(cue, sport);

  return (
    <li className="rounded-2xl border border-[var(--border)] border-l-[3px] border-l-[var(--accent)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        {illustration ? (
          <div className="md:w-2/5">
            <IllustrationPanel cue={illustration} />
          </div>
        ) : null}
        <div className={illustration ? "md:w-3/5" : "w-full"}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-mono text-sm font-semibold text-[var(--accent-foreground)]">
              {index}
            </span>
            <p className="pt-0.5 text-sm leading-relaxed text-[var(--text-primary)]">
              {cue}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

