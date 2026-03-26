import { FilmingGuidelines } from "@/components/analyze/FilmingGuidelines";
import { SquatUploadForm } from "@/components/analyze/SquatUploadForm";
import { PageSection } from "@/components/layout/PageSection";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { fetchAnalysis } from "@/lib/analysis/analysisStore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze squat — Movement Analytics",
  description:
    "Upload side-view bodyweight squat video for movement quality assessment.",
};

type PageProps = {
  searchParams: Promise<{ previousId?: string | string[] }>;
};

export default async function AnalyzeSquatPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = sp.previousId;
  const previousIdParam =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw[0]
        : undefined;

  const validPreviousId =
    previousIdParam && isValidAnalysisId(previousIdParam)
      ? previousIdParam
      : undefined;

  const previousResult = validPreviousId
    ? await fetchAnalysis(validPreviousId)
    : null;

  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-12 md:pt-16">
      <PageSection>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Squat · Side view
        </p>
        <h1 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          Upload your video
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          Bodyweight squat, side view only. A clear clip lets us assess depth,
          trunk control, and lower-body alignment the same way every time.
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <FilmingGuidelines />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              Your clip
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Upload your clip. You&apos;ll get scores, observations, and
              coaching cues built from what we can see in your video—not generic
              filler.
            </p>
            {previousResult ? (
              <div className="mt-6 rounded-xl border border-[var(--accent)]/25 bg-[var(--bg-card-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  Previous score: {previousResult.overallScore}/100
                </span>
                <span className="text-[var(--text-secondary)]"> — can you beat it?</span>
              </div>
            ) : null}
            <div className="mt-6">
              <SquatUploadForm previousId={validPreviousId} />
            </div>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
