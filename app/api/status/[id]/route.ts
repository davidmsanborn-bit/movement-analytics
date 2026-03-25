console.log(
  "ENV CHECK",
  process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20),
  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10),
);

import { fetchAnalysis } from "@/lib/analysis/analysisStore";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Route handlers are async server code — unwrap `params` with `await`, not React `use()`.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/route#dynamic-routes
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidAnalysisId(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const result = await fetchAnalysis(id);

    if (!result) {
      // Still processing — tell the client to keep polling
      return NextResponse.json({ status: "processing" }, { status: 202 });
    }

    return NextResponse.json({ status: "ready" }, { status: 200 });
  } catch (err) {
    console.error("[api/status]", id, err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
