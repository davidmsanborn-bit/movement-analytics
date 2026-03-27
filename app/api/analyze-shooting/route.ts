import { createClient } from "@supabase/supabase-js";
import { analyzeShootingVideo } from "@/lib/analysis/analyzeShootingWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import {
  fetchShootingAnalysis,
  saveShootingAnalysis,
} from "@/lib/analysis/shootingAnalysisStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ShootingAnalysisResult } from "@/lib/analysis/shootingTypes";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function mergeShootingByAveraging(
  previous: ShootingAnalysisResult,
  current: ShootingAnalysisResult,
): ShootingAnalysisResult {
  const avg = (a: number, b: number) => Math.round((a + b) / 2);
  const prevMap = new Map(
    previous.subScores.map((s) => [s.dimension, s.score] as const),
  );
  return {
    ...current,
    overallScore: avg(previous.overallScore, current.overallScore),
    subScores: current.subScores.map((s) => {
      const prevScore = prevMap.get(s.dimension);
      if (prevScore == null) return s;
      return { ...s, score: avg(prevScore, s.score) };
    }),
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = body as {
    analysisId?: unknown;
    weight?: unknown;
    previousId?: unknown;
    addAngle?: unknown;
  };
  const analysisId =
    typeof parsed.analysisId === "string" ? parsed.analysisId : "";

  if (!isValidAnalysisId(analysisId)) {
    return NextResponse.json({ error: "Invalid analysisId" }, { status: 400 });
  }

  const weightRaw = parsed.weight;
  const weight =
    weightRaw === null || weightRaw === undefined
      ? null
      : typeof weightRaw === "string" && weightRaw.trim()
        ? weightRaw.trim()
        : null;

  const previousIdRaw = parsed.previousId;
  const previousId =
    typeof previousIdRaw === "string" && isValidAnalysisId(previousIdRaw)
      ? previousIdRaw
      : null;

  const addAngleRaw = parsed.addAngle;
  const addAngle =
    addAngleRaw === true ||
    addAngleRaw === "true" ||
    addAngleRaw === 1 ||
    addAngleRaw === "1";

  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();
  const userId = user?.id ?? null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server misconfiguration (missing Supabase env vars)" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const storagePath = `${analysisId}/input.mov`;

  setProgress(analysisId, "Extracting frames from your video...");

  try {
    setProgress(analysisId, "Sending to AI for analysis...");

    const result = await analyzeShootingVideo(
      storagePath,
      analysisId,
      weight,
    );
    let finalResult: ShootingAnalysisResult = result;

    const shouldMerge = addAngle && previousId && previousId !== analysisId;
    if (shouldMerge) {
      const previous = await fetchShootingAnalysis(previousId);
      if (previous) {
        finalResult = mergeShootingByAveraging(previous, result);
      }
    }

    setProgress(analysisId, "Scoring your movement...");
    setProgress(analysisId, "Saving your results...");
    await saveShootingAnalysis(finalResult, userId);

    const { error: deleteError } = await supabase.storage
      .from("videos")
      .remove([storagePath]);
    if (deleteError) {
      console.error("[analyze-shooting] cleanup remove failed", {
        analysisId,
        storagePath,
        message: deleteError.message,
      });
    }

    setProgress(analysisId, "complete");

    return NextResponse.json({ analysisId });
  } catch (err) {
    console.error("[analyze-shooting] error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
