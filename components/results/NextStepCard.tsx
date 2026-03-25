type Props = {
  nextStep: string;
};

export function NextStepCard({ nextStep }: Props) {
  return (
    <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        Recommended next step
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-200">{nextStep}</p>
    </div>
  );
}
