import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-full">
      <Hero />
      <section className="border-t border-[var(--border)] bg-[var(--bg-page)] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-sans text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Choose your movement
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--text-secondary)]">
            Start with the lift or shot you want feedback on. Same fast pipeline:
            upload, analyze, improve.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link
              href="/analyze/squat"
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40"
            >
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                Strength
              </p>
              <h3 className="mt-3 font-sans text-xl font-semibold text-[var(--text-primary)]">
                Squat form
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Side-view squat assessment with scores and coaching cues.
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
                Analyze squat →
              </span>
            </Link>
            <Link
              href="/analyze/shooting"
              className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)] transition hover:border-[var(--accent)]/40"
            >
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
                Basketball
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-2xl" aria-hidden>
                  🏀
                </span>
                <h3 className="font-sans text-xl font-semibold text-[var(--text-primary)]">
                  Basketball shooting form
                </h3>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Jumpshot, layup, free throw — mechanics and release feedback.
              </p>
              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)]">
                Analyze shooting →
              </span>
            </Link>
          </div>
        </div>
      </section>
      <ValueProps />
    </main>
  );
}
