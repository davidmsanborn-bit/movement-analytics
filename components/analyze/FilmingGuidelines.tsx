export function FilmingGuidelines() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="font-sans text-lg font-semibold text-white">
        Film from the side
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        Full body in frame, hip height or slightly below, 3–5 meters back. One
        smooth rep is enough for this MVP.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-zinc-300">
        <li className="flex gap-2">
          <span className="font-mono text-[var(--accent)]">·</span>
          Stand the phone vertically or horizontally—just keep you centered.
        </li>
        <li className="flex gap-2">
          <span className="font-mono text-[var(--accent)]">·</span>
          Even lighting; avoid heavy backlight.
        </li>
        <li className="flex gap-2">
          <span className="font-mono text-[var(--accent)]">·</span>
          Wear fitted clothing so joints are easier to see.
        </li>
      </ul>
    </div>
  );
}
