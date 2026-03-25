import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-white"
        >
          Movement Analytics
        </Link>
        <nav className="flex items-center gap-8 text-sm text-zinc-400">
          <Link
            href="/analyze/squat"
            className="text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
          >
            Analyze squat
          </Link>
        </nav>
      </div>
    </header>
  );
}
