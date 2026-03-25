import Link from "next/link";
import { PageSection } from "@/components/layout/PageSection";

export default function ProcessingNotFound() {
  return (
    <main className="min-h-full pb-24 pt-20 md:pt-28">
      <PageSection className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">
          Invalid session
        </p>
        <h1 className="mt-4 font-sans text-2xl font-semibold text-white">
          This processing link isn&apos;t valid
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          Start a new upload to run an analysis.
        </p>
        <Link
          href="/analyze/squat"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
        >
          Upload video
        </Link>
      </PageSection>
    </main>
  );
}
