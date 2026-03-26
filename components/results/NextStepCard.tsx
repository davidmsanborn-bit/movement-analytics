type Props = {
  nextStep: string;
};

export function NextStepCard({ nextStep }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
      <h2 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
        Recommended next step
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
        {nextStep}
      </p>
    </div>
  );
}
