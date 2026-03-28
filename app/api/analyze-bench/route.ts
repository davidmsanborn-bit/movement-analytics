import { createClient } from "@supabase/supabase-js";
import { analyzeBenchVideo } from "@/lib/analysis/analyzeBenchWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import {
  fetchBenchAnalysis,
  saveBenchAnalysis,
} from "@/lib/analysis/benchAnalysisStore";
import {
  findOrCreateSession,
  updateSessionStats,
} from "@/lib/analysis/sessionStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { BenchAnalysisResult } from "@/lib/analysis/benchTypes";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function mergeBenchByAveraging(
  previous: BenchAnalysisResult,
  current: BenchAnalysisResult,
): BenchAnalysisResult {
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

    const result = await analyzeBenchVideo(storagePath, analysisId, weight);
    let finalResult: BenchAnalysisResult = result;

    const shouldMerge = addAngle && previousId && previousId !== analysisId;
    if (shouldMerge) {
      const previous = await fetchBenchAnalysis(previousId);
      if (previous) {
        finalResult = mergeBenchByAveraging(previous, result);
      }
    }

    setProgress(analysisId, "Scoring your movement...");
    setProgress(analysisId, "Saving your results...");
    await saveBenchAnalysis(finalResult, userId);

    if (userId) {
      const sessionId = await findOrCreateSession(userId, "bench");
      const { error: sessionLinkError } = await supabase
        .from("bench_analyses")
        .update({ session_id: sessionId })
        .eq("id", analysisId);
      if (sessionLinkError) {
        console.error("[analyze-bench] failed to link analysis to session", {
          analysisId,
          sessionId,
          message: sessionLinkError.message,
        });
      } else {
        await updateSessionStats(sessionId);
      }
    }

    const { error: deleteError } = await supabase.storage
      .from("videos")
      .remove([storagePath]);
    if (deleteError) {
      console.error("[analyze-bench] cleanup remove failed", {
        analysisId,
        storagePath,
        message: deleteError.message,
      });
    }

    setProgress(analysisId, "complete");

    return NextResponse.json({ analysisId });
  } catch (err) {
    console.error("[analyze-bench] error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
