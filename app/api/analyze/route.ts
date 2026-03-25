import { createClient } from "@supabase/supabase-js";
import { analyzeSquatVideo } from "@/lib/analysis/analyzeWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { saveAnalysis } from "@/lib/analysis/analysisStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_BYTES = 100 * 1024 * 1024;

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
  const storagePath = `${analysisId}/input.mov`;

  setProgress(analysisId, "Downloading video from storage...");

  try {
    const { data, error: downloadError } = await supabase.storage
      .from("videos")
      .download(storagePath);

    if (downloadError) {
      const rawStatusCode = (downloadError as unknown as { statusCode?: unknown })
        .statusCode;
      const statusCode =
        typeof rawStatusCode === "number"
          ? rawStatusCode
          : typeof rawStatusCode === "string"
            ? Number(rawStatusCode)
            : null;
      if (statusCode === 404) {
        return NextResponse.json(
          { error: "Video not found. Please try uploading again." },
          { status: 404 },
        );
      }
      throw new Error(downloadError.message);
    }
    if (!data) {
      return NextResponse.json(
        { error: "Video not found. Please try uploading again." },
        { status: 404 },
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
      return NextResponse.json(
        { error: "That file looks empty. Try another clip." },
        { status: 400 },
      );
    }
    if (buffer.length > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Use a clip under 100 MB." },
        { status: 413 },
      );
    }

    console.log("[analyze] starting analyzeSquatVideo", {
      analysisId,
      bufferBytes: buffer.length,
    });

    setProgress(analysisId, "Extracting frame from your video...");
    setProgress(analysisId, "Sending to AI for analysis...");

    const result = await analyzeSquatVideo(buffer, analysisId);

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
