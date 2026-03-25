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
    <main className="min-h-full pb-24 pt-12 md:pt-16">
      <PageSection>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Squat · Side view
        </p>
        <h1 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Upload your video
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          This MVP analyzes one movement from one angle. Use a clear side-view
          clip so we can score depth, trunk position, and alignment fairly.
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <FilmingGuidelines />
          <div>
            <h2 className="font-sans text-lg font-semibold text-white">
              Your clip
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Select a file to run the flow. The response is a structured demo
              for product development—swap in your model when you&apos;re
              ready.
            </p>
            {previousResult ? (
              <div className="mt-6 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-4 py-3 text-sm text-zinc-200">
                <span className="font-medium text-white">
                  Previous score: {previousResult.overallScore}/100
                </span>
                <span className="text-zinc-400"> — can you beat it?</span>
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
