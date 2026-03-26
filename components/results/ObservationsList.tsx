type Props = {
  observations: string[];
};

export function ObservationsList({ observations }: Props) {
  return (
    <div>
      <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
        What we noticed
      </h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Observed mechanics from this recording—worded for coaching, not
        diagnosis.
      </p>
      <ul className="mt-5 space-y-3">
        {observations.map((line, i) => (
          <li
            key={i}
            className="flex gap-3 border-l-2 border-[var(--accent)]/40 pl-4 text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
