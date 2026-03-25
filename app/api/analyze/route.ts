import { createClient } from "@supabase/supabase-js";
import { analyzeSquatVideo } from "@/lib/analysis/analyzeWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { saveAnalysis } from "@/lib/analysis/analysisStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = body as { analysisId?: unknown };
  const analysisId =
    typeof parsed.analysisId === "string" ? parsed.analysisId : "";

  if (!isValidAnalysisId(analysisId)) {
    return NextResponse.json({ error: "Invalid analysisId" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server misconfiguration (missing Supabase env vars)" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  /** Object key inside the `videos` bucket (not `videos/...` prefix). */
  const storagePath = `${analysisId}/input.mov`;

  setProgress(analysisId, "Extracting frames from your video...");

  try {
    console.log("[analyze] starting analyzeSquatVideo", {
      analysisId,
      storagePath,
    });

    setProgress(analysisId, "Sending to AI for analysis...");

    const result = await analyzeSquatVideo(storagePath, analysisId);

    console.log("[analyze] analyzeSquatVideo done", {
      analysisId,
      overallScore: result.overallScore,
      confidence: result.confidence,
    });

    setProgress(analysisId, "Scoring your movement...");
    setProgress(analysisId, "Saving your results...");
    await saveAnalysis(result);

    console.log("[analyze] saveAnalysis done", { analysisId });

    const { error: deleteError } = await supabase.storage
      .from("videos")
      .remove([storagePath]);
    if (deleteError) {
      console.error("[analyze] cleanup remove failed", {
        analysisId,
        storagePath,
        message: deleteError.message,
      });
    }

    setProgress(analysisId, "complete");

    return NextResponse.json({ analysisId });
  } catch (err) {
    console.error("[analyze] error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
