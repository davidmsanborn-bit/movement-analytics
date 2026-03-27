import { ShootingUploadForm } from "@/components/analyze/ShootingUploadForm";
import { PageSection } from "@/components/layout/PageSection";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { fetchShootingAnalysis } from "@/lib/analysis/shootingAnalysisStore";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basketball shooting — Movement Analytics",
  description:
    "Upload a clip of your basketball shot for form feedback and coaching cues.",
};

type PageProps = {
  searchParams: Promise<{
    previousId?: string | string[];
    addAngle?: string | string[];
    sessionContinue?: string | string[];
  }>;
};

export default async function AnalyzeShootingPage({ searchParams }: PageProps) {
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
    ? await fetchShootingAnalysis(validPreviousId)
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
            <span className="font-semibold">
              Session in progress
            </span>
            <span className="text-emerald-900/80 dark:text-emerald-200/80">
              {" "}
              — your previous results are saved
            </span>
          </div>
        ) : null}
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Basketball · Shooting form
        </p>
        <h1 className="mt-4 max-w-2xl font-sans text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {addAngle
            ? "Add another angle"
            : sessionContinue
              ? "Film your next set"
              : "Basketball shooting form"}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          {addAngle
            ? "Upload a clip from a different angle to improve your assessment accuracy"
            : "Upload a side-view clip of your shot — jumpshot, layup, free throw, or any shot type"}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-[var(--text-tertiary)]">
          Side view works best. We&apos;ll suggest additional angles after
          analysis.
        </p>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              Film tips
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Frame the shooter and ball through the release. Steady
              footage, good lighting, and a clear view of the shooting hand
              and elbow help.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">
              Your clip
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Upload your clip. You&apos;ll get scores, observations, and
              coaching cues tied to what we see in your shot.
            </p>
            {previousResult ? (
              <div className="mt-6 rounded-xl border border-[var(--accent)]/25 bg-[var(--bg-card-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]">
                <span className="font-medium text-[var(--text-primary)]">
                  Previous score: {previousResult.overallScore}/100
                </span>
                <span className="text-[var(--text-secondary)]">
                  {" "}
                  {addAngle
                    ? " — tighten your accuracy?"
                    : " — can you beat it?"}
                </span>
              </div>
            ) : null}
            <div className="mt-6">
              <ShootingUploadForm
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
