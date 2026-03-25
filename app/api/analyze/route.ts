import { analyzeSquatVideo } from "@/lib/analysis/analyzeWithAI";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { saveAnalysis } from "@/lib/analysis/analysisStore";
import { setProgress } from "@/lib/analysis/progressStore";
import { NextResponse } from "next/server";

const MAX_BYTES = 100 * 1024 * 1024;

export async function POST(request: Request) {
  // Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // Validate file
  const file = formData.get("video");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Add a video file to continue." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { error: "That file looks empty. Try another clip." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Use a clip under 100 MB." },
      { status: 413 },
    );
  }

  // Use client-provided ID when present, otherwise generate one.
  const incomingAnalysisId = formData.get("analysisId");
  let analysisId = crypto.randomUUID();
  if (typeof incomingAnalysisId === "string" && incomingAnalysisId.trim()) {
    if (!isValidAnalysisId(incomingAnalysisId)) {
      return NextResponse.json(
        { error: "Invalid analysisId." },
        { status: 400 },
      );
    }
    analysisId = incomingAnalysisId;
  }

  console.log("[analyze] received file", {
    analysisId,
    name: file.name,
    type: file.type,
    sizeBytes: file.size,
  });

  setProgress(analysisId, "Extracting frame from your video...");

  try {
    // Convert file to buffer for AI analysis
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[analyze] starting analyzeSquatVideo", { analysisId, bufferBytes: buffer.length });

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
