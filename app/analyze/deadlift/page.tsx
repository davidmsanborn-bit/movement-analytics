import { DeadliftUploadForm } from "@/components/analyze/DeadliftUploadForm";
import { FilmingGuidelines } from "@/components/analyze/FilmingGuidelines";
import { PageSection } from "@/components/layout/PageSection";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { fetchDeadliftAnalysis } from "@/lib/analysis/deadliftAnalysisStore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze deadlift — Movement Analytics",
  description:
    "Upload a side-view deadlift clip for movement quality assessment.",
};

type PageProps = {
  searchParams: Promise<{
    previousId?: string | string[];
    addAngle?: string | string[];
    sessionContinue?: string | string[];
  }>;
};

export default async function AnalyzeDeadliftPage({ searchParams }: PageProps) {
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
    ? await fetchDeadliftAnalysis(validPreviousId)
    : null;

  const addAngleRaw = sp.addAngle;
  const addAngleParam =
    typeof addAngleRaw === "string"
      ? addAngleRaw
      : Array.isArray(addAngleRaw)
        ? addAngleRaw[0]
        : undefined;
  const addAngle = addAngleParam === "true" || addAngleParam === "1";

  const sessionContinueRaw = sp.sessionContinue;
  const sessionContinueParam =
    typeof sessionContinueRaw === "string"
      ? sessionContinueRaw
      : Array.isArray(sessionContinueRaw)
        ? sessionContinueRaw[0]
        : undefined;
  const sessionContinue =
    sessionContinueParam === "true" || sessionContinueParam === "1";

  return (
    <main className="min-h-full bg-[var(--bg-page)] pb-24 pt-12 md:pt-16">
      <PageSection>
        {sessionContinue ? (
          <div className="mb-6 rounded-xl border border-emerald-600/25 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
            <span className="font-semibold">Session in progress</span>
            <span className="text-emerald-900/80 dark:text-emerald-200/80">
              {" "}
              — your previous results are saved
            </span>
          </div>
        ) : null}
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Deadlift · Side view
        </p>
        <h1 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {addAngle
            ? "Add another angle"
            : sessionContinue
              ? "Film your next set"
              : "Deadlift"}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          {addAngle
            ? "Upload a clip from a different angle to improve your assessment accuracy"
            : "Upload a side-view clip of your deadlift — conventional, sumo, or Romanian"}
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <FilmingGuidelines
            angleTip="Side view works best — shows bar path, hip hinge, and back position clearly"
          />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              Your clip
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Upload your clip. You&apos;ll get scores, observations, and coaching
              cues built from what we can see in your video—not generic filler.
            </p>
            {previousResult ? (
              <div className="mt-6 rounded-xl border border-[var(--accent)]/25 bg-[var(--bg-card-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  Previous score: {previousResult.overallScore}/100
                </span>
                <span className="text-[var(--text-secondary)]">
                  {" "}
                  {addAngle ? " — tighten your accuracy?" : " — can you beat it?"}
                </span>
              </div>
            ) : null}
            <div className="mt-6">
              <DeadliftUploadForm
                previousId={validPreviousId}
                addAngle={addAngle}
              />
            </div>
          </div>
        </div>
      </PageSection>
    </main>
  );
}
