import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";

export default function ResultsNotFound() {
  return (
    <main className="min-h-full pb-24 pt-20 md:pt-28">
      <PageSection className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">
          Assessment unavailable
        </p>
        <h1 className="mt-4 font-sans text-2xl font-semibold tracking-tight text-white md:text-3xl">
          We couldn&apos;t open this result
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
          Links are tied to a valid analysis session. Start a new upload from
          the squat flow to generate a fresh assessment.
        </p>
        <Link
          href="/analyze/squat"
          className="mt-10 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
        >
          Upload side-view video
        </Link>
        <p className="mt-8 text-xs text-zinc-600">
          <Link href="/" className="text-zinc-500 hover:text-zinc-400">
            Back to home
          </Link>
        </p>
      </PageSection>
    </main>
  );
}
