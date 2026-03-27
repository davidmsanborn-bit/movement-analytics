import Link from "next/link";

function SquatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7v4m0 0l4 3m-4-3l-4 3m-1 5l3-5m9 5l-3-5M8 19h8" />
    </svg>
  );
}

function DeadliftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 7l-2 4m2-4l2 4m-2 0v4m-6 2h12M3 17h3m15 0h-3" />
    </svg>
  );
}

function BasketballIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export default function AnalyzeHubPage() {
  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-10 md:pt-14">
      <section className="mx-auto max-w-6xl px-6">
        <Link href="/" className="inline-flex text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]">
          ← Back to home
        </Link>
        <h1 className="mt-4 font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          What do you want to analyze?
        </h1>
        <p className="mt-3 max-w-3xl text-[var(--text-secondary)]">
          Choose a movement to get started. Upload a short clip and get AI coaching feedback in under 15 seconds.
        </p>

        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Training</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/analyze/squat" className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/50">
              <div className="text-[var(--accent)]"><SquatIcon /></div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-[var(--text-primary)]">Squat</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Bodyweight, barbell, goblet — any squat variation</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[rgba(10,132,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">5 sub-scores</span>
                <span className="text-sm font-semibold text-[var(--accent)]">Start →</span>
              </div>
            </Link>

            <Link href="/analyze/deadlift" className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/50">
              <div className="text-[var(--accent)]"><DeadliftIcon /></div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-[var(--text-primary)]">Deadlift</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Conventional, sumo, or Romanian — any deadlift variation</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[rgba(10,132,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">5 sub-scores</span>
                <span className="text-sm font-semibold text-[var(--accent)]">Start →</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Sports</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/analyze/shooting" className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/50">
              <div className="text-[var(--accent)]"><BasketballIcon /></div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-[var(--text-primary)]">Shooting form</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Jumpshot, layup, free throw — any shot type</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-[rgba(10,132,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">5 sub-scores</span>
                <span className="text-sm font-semibold text-[var(--accent)]">Start →</span>
              </div>
            </Link>

            <div className="cursor-not-allowed rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 opacity-50">
              <div className="text-2xl">⚾</div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-[var(--text-primary)]">Pitching</h2>
              <div className="mt-4">
                <span className="rounded-full bg-[var(--bg-card-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Coming soon</span>
              </div>
            </div>

            <div className="cursor-not-allowed rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 opacity-50">
              <div className="text-2xl">⛳</div>
              <h2 className="mt-4 font-sans text-xl font-semibold text-[var(--text-primary)]">Golf swing</h2>
              <div className="mt-4">
                <span className="rounded-full bg-[var(--bg-card-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Coming soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Game Film</p>
          <div className="mt-4 rounded-3xl bg-[#1d1d1f] p-7 text-white shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-sans text-2xl font-semibold tracking-tight">Full game analysis</h2>
              <span className="rounded-full bg-[rgba(255,149,0,0.18)] px-3 py-1 text-xs font-semibold text-[#FF9500]">Coming soon</span>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-relaxed text-white/80">
              Upload full game footage. Get individual player breakdowns, team performance metrics, and development insights. Identify players by jersey number.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">Individual tracking</span>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">Team insights</span>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">Jersey detection</span>
            </div>
            <div className="mt-6">
              <a href="mailto:david@movementanalytics.com" className="inline-flex h-10 items-center justify-center rounded-lg border border-white/35 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
                Join the waitlist
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

