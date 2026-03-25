type Props = {
  cues: [string, string, string];
};

export function CoachingCues({ cues }: Props) {
  return (
    <div>
      <h2 className="font-sans text-lg font-semibold text-white">
        Fix these first
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Top three coaching cues for your next session.
      </p>
      <ol className="mt-6 space-y-4">
        {cues.map((cue, i) => (
          <li
            key={i}
            className="flex gap-4 rounded-xl border border-white/10 bg-black/40 p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/15 font-mono text-sm font-semibold text-[var(--accent)]">
              {i + 1}
            </span>
            <p className="pt-0.5 text-sm leading-relaxed text-zinc-200">
              {cue}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
