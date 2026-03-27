import { CoachingCueCard } from "./CoachingCueCard";

type Props = {
  cues: [string, string, string];
  sport: "squat" | "shooting";
  mode?: "compact" | "full";
};

export function CoachingCues({ cues, sport, mode = "full" }: Props) {
  return (
    <div>
      {mode === "full" ? (
        <>
          <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
            Fix these first
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Top three coaching cues for your next session.
          </p>
        </>
      ) : null}
      <ol className={`${mode === "compact" ? "space-y-3" : "mt-6 space-y-4"}`}>
        {cues.map((cue, i) => (
          <CoachingCueCard
            key={i}
            cue={cue}
            index={i + 1}
            sport={sport}
            compact={mode === "compact"}
          />
        ))}
      </ol>
    </div>
  );
}
