import { CoachingCueCard } from "./CoachingCueCard";

type Props = {
  cues: [string, string, string];
  sport: "squat" | "shooting" | "deadlift" | "bench";
  mode?: "compact" | "full";
};

export function CoachingCues({ cues, sport, mode = "full" }: Props) {
  return (
    <div>
      {mode === "full" ? (
        <>
          <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
            Coach says
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Top three coaching cues for your next session.
          </p>
        </>
      ) : (
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          Coach says
        </p>
      )}
      <ol className={`${mode === "compact" ? "mt-3 space-y-3" : "mt-6 space-y-4"}`}>
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
