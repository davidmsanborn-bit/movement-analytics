"use client";

import { ProcessingBenchPageClient } from "@/components/analyze/ProcessingBenchPageClient";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense, use } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

function ProcessingWithQuery({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const raw = searchParams.get("previousId");
  const previousId =
    raw && isValidAnalysisId(raw) ? raw : undefined;

  const addAngleRaw = searchParams.get("addAngle");
  const addAngle =
    addAngleRaw === "true" || addAngleRaw === "1" ? true : false;

  return (
    <ProcessingBenchPageClient
      id={id}
      previousId={previousId}
      addAngle={addAngle}
    />
  );
}

export default function BenchProcessingPage({ params }: Props) {
  const { id } = use(params);
  if (!isValidAnalysisId(id)) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-col px-6">
      <div className="mx-auto w-full max-w-6xl pt-8 pb-4">
        <Link
          href="/analyze/bench"
          className="inline-flex text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
        >
          ← Back to upload
        </Link>
      </div>
      <div className="flex flex-1 flex-col items-center pb-24">
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-[var(--text-secondary)]">
              Loading…
            </div>
          }
        >
          <ProcessingWithQuery id={id} />
        </Suspense>
      </div>
    </main>
  );
}
