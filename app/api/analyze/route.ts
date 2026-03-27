import { createClient } from "@supabase/supabase-js";
import { analyzeSquatVideo } from "@/lib/analysis/analyzeWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { fetchAnalysis, saveAnalysis } from "@/lib/analysis/analysisStore";
import {
  findOrCreateSession,
  updateSessionStats,
} from "@/lib/analysis/sessionStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SquatAnalysisResult } from "@/lib/analysis/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function mergeByAveraging(previous: SquatAnalysisResult, current: SquatAnalysisResult) {
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

  console.log(
    "[analyze] userId:",
    user?.id ?? "not logged in",
  );

  const cookieHeader = request.headers.get("cookie") ?? "";
  console.log("[analyze] has sb-access-token cookie:", cookieHeader.includes("sb-access-token"));

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

    const result = await analyzeSquatVideo(
      storagePath,
      analysisId,
      weight,
      userId,
    );
    let finalResult: SquatAnalysisResult = result;

    const shouldMerge = addAngle && previousId && previousId !== analysisId;
    if (shouldMerge) {
      const previous = await fetchAnalysis(previousId);
      if (previous) {
        finalResult = mergeByAveraging(previous, result);
      }
    }

    console.log("[analyze] analyzeSquatVideo done", {
      analysisId,
      overallScore: finalResult.overallScore,
      confidence: finalResult.confidence,
    });

    setProgress(analysisId, "Scoring your movement...");
    setProgress(analysisId, "Saving your results...");
    await saveAnalysis(finalResult, userId);

    console.log("[analyze] saveAnalysis done", { analysisId });

    if (userId) {
      const sessionId = await findOrCreateSession(userId, "squat");
      const { error: sessionLinkError } = await supabase
        .from("analyses")
        .update({ session_id: sessionId })
        .eq("id", analysisId);
      if (sessionLinkError) {
        console.error("[analyze] failed to link analysis to session", {
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
