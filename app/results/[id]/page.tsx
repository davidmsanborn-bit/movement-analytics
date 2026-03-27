import { CoachingCues } from "@/components/results/CoachingCues";
import { DisclaimerStrip } from "@/components/results/DisclaimerStrip";
import { NextStepCard } from "@/components/results/NextStepCard";
import { ObservationsList } from "@/components/results/ObservationsList";
import { OverallScoreCard } from "@/components/results/OverallScoreCard";
import { ResultsHeader } from "@/components/results/ResultsHeader";
import { ScoreComparison } from "@/components/results/ScoreComparison";
import { SubScoreGrid } from "@/components/results/SubScoreGrid";
import { PageSection } from "@/components/layout/PageSection";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { fetchAnalysis } from "@/lib/analysis/analysisStore";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SquatAnalysisResult } from "@/lib/analysis/types";
import { ShareResultsButton } from "@/components/results/ShareResultsButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previousId?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isValidAnalysisId(id)) {
    return { title: "Assessment not found — Movement Analytics" };
  }
  return {
    title: `Squat assessment — ${id.slice(0, 8)}…`,
    description: "Squat movement quality assessment from your uploaded video.",
  };
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { id } = await params;
  if (!isValidAnalysisId(id)) {
    notFound();
  }

  const result = await fetchAnalysis(id);

  if (!result) {
    notFound();
  }

  const sp = await searchParams;
  const previousIdRaw = sp.previousId;
  const previousIdParam =
    typeof previousIdRaw === "string"
      ? previousIdRaw
      : Array.isArray(previousIdRaw)
        ? previousIdRaw[0]
        : undefined;

  let previousAnalysis: SquatAnalysisResult | null = null;
  if (
    previousIdParam &&
    isValidAnalysisId(previousIdParam) &&
    previousIdParam !== id
  ) {
    previousAnalysis = await fetchAnalysis(previousIdParam);
  }

  return (
    <main className="min-h-full pb-24 pt-12 md:pt-16">
      <PageSection className="space-y-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/analyze/squat?previousId=${encodeURIComponent(result.id)}`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] sm:flex-none sm:px-6"
          >
            Beat your score →
          </Link>
          <div className="sm:ml-auto">
            <ShareResultsButton />
          </div>
        </div>
        {previousAnalysis ? (
          <ScoreComparison previous={previousAnalysis} current={result} />
        ) : null}
        <ResultsHeader
          movementLabel={result.movementLabel}
          cameraAngle={result.cameraAngle}
          loadType={result.loadType}
          weight={result.weight}
          angleRecommendation={result.angleRecommendation}
          additionalAngleBenefit={result.additionalAngleBenefit}
          analyzedAt={result.analyzedAt}
          id={result.id}
        />
        <OverallScoreCard
          overallScore={result.overallScore}
          confidence={result.confidence}
          confidenceNote={result.confidenceNote}
        />
        <SubScoreGrid subScores={result.subScores} />
        <ObservationsList observations={result.observations} />
        <CoachingCues cues={result.coachingCues} />
        <NextStepCard nextStep={result.nextStep} />
        <DisclaimerStrip />
        <Link
          href="/analyze/squat?sessionContinue=true"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--accent)] bg-transparent px-5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/5"
        >
          🎥 Film next set →
        </Link>
      </PageSection>
    </main>
  );
}
