import { fetchDeadliftAnalysis } from "@/lib/analysis/deadliftAnalysisStore";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidAnalysisId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const result = await fetchDeadliftAnalysis(id);

    if (!result) {
      return NextResponse.json({ status: "processing" }, { status: 202 });
    }

    return NextResponse.json({ status: "ready" }, { status: 200 });
  } catch (err) {
    console.error("[api/status-deadlift]", id, err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
