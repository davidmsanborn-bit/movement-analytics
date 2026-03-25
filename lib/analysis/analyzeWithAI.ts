import Anthropic from "@anthropic-ai/sdk";
import type {
  ConfidenceLevel,
  SquatAnalysisResult,
  SubScore,
  SubScoreDimension,
} from "./types";
import { getFfmpeg } from "./ffmpegWasm";

const client = new Anthropic();
const ANALYSIS_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are an expert movement coach and biomechanics analyst specializing in squat assessment.

Analyze the three side-view images from the squat video (captured at about 1s, 2s, and 3s) and return a JSON object with this exact shape:
{
  "overallScore": <number 0-100>,
  "confidence": <"high" | "medium" | "low">,
  "confidenceNote": <string — one sentence about video quality and what you could/couldn't see>,
  "subScores": [
    { "dimension": "depth", "label": "Depth", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "trunkControl", "label": "Trunk control", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "lowerBodyAlignment", "label": "Lower-body alignment", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "balanceStability", "label": "Balance / stability", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "controlTempo", "label": "Control / tempo", "score": <0-100>, "summary": <short phrase> }
  ],
  "observations": [<4 strings — each describing something SPECIFIC you actually observed in this exact video — joint angles, body position, movement patterns. Never use generic placeholder text.>],
  "coachingCues": [<exactly 3 strings — each a specific actionable correction directly tied to a fault you observed in THIS video. Be precise about what body part and what correction.>],
  "nextStep": <one specific string identifying the single most important thing to fix first based on what you saw, with a concrete drill or cue to address it>
}

Every piece of text you return must be specific to this exact video. If you cannot see something clearly, say so specifically (e.g. "knee alignment unclear due to camera angle") rather than giving generic feedback.

Scoring guide:
- 90-100: Excellent form, competition ready
- 75-89: Good form, minor improvements available  
- 60-74: Functional but clear faults to address
- 45-59: Several issues limiting safety or performance
- Below 45: Significant intervention needed

Return ONLY the JSON object. No markdown, no explanation, no backticks.`;

/** Seconds into the clip for each extracted frame (fast input seek: `-ss` before `-i`). */
const FRAME_TIMESTAMPS_SEC = [1, 2, 3] as const;

const FFMPEG_VF = "scale=800:-1";

async function extractFrames(
  videoBuffer: Buffer,
  analysisId: string,
): Promise<{ base64: string; mediaType: "image/jpeg" }[]> {
  const ffmpeg = await getFfmpeg();
  const inputName = `mv-input-${analysisId}.mp4`;
  const results: { base64: string; mediaType: "image/jpeg" }[] = [];

  try {
    await ffmpeg.writeFile(inputName, new Uint8Array(videoBuffer));
    for (let i = 0; i < FRAME_TIMESTAMPS_SEC.length; i++) {
      const sec = FRAME_TIMESTAMPS_SEC[i];
      const frameName = `mv-frame-${analysisId}-${i}.jpg`;
      const ss = `00:00:${String(sec).padStart(2, "0")}`;
      const code = await ffmpeg.exec([
        "-ss",
        ss,
        "-i",
        inputName,
        "-vframes",
        "1",
        "-vf",
        FFMPEG_VF,
        "-pix_fmt",
        "yuvj420p",
        "-q:v",
        "2",
        frameName,
      ]);
      if (code !== 0) {
        throw new Error(`ffmpeg extract failed at ${sec}s (exit ${code})`);
      }
      const raw = await ffmpeg.readFile(frameName, "binary");
      const jpegBuf = Buffer.from(raw as Uint8Array);
      results.push({
        base64: jpegBuf.toString("base64"),
        mediaType: "image/jpeg",
      });
      await ffmpeg.deleteFile(frameName);
    }
  } finally {
    try {
      await ffmpeg.deleteFile(inputName);
    } catch {
      /* ignore cleanup errors */
    }
  }

  return results;
}

const DIMENSIONS: SubScoreDimension[] = [
  "depth",
  "trunkControl",
  "lowerBodyAlignment",
  "balanceStability",
  "controlTempo",
];

function isSubScoreDimension(d: string): d is SubScoreDimension {
  return (DIMENSIONS as readonly string[]).includes(d);
}

function parseAIResponse(raw: string): Omit<
  SquatAnalysisResult,
  "id" | "movementLabel" | "cameraAngle" | "analyzedAt"
> {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  // Validate shape
  if (
    typeof parsed.overallScore !== "number" ||
    !Array.isArray(parsed.subScores) ||
    parsed.subScores.length !== 5 ||
    !Array.isArray(parsed.observations) ||
    !Array.isArray(parsed.coachingCues) ||
    parsed.coachingCues.length !== 3
  ) {
    throw new Error("AI response missing required fields");
  }

  const subScores: SubScore[] = (parsed.subScores as unknown[]).map(
    (row) => {
      const s = row as {
        dimension?: string;
        label?: string;
        score?: number;
        summary?: string;
      };
      const dimension = s.dimension ?? "";
      if (!isSubScoreDimension(dimension)) {
        throw new Error(`Invalid sub-score dimension: ${dimension}`);
      }
      return {
        dimension,
        label: String(s.label ?? ""),
        score: Math.min(100, Math.max(0, Math.round(Number(s.score)))),
        summary: String(s.summary ?? ""),
      };
    },
  );

  return {
    overallScore: Math.min(
      100,
      Math.max(0, Math.round(parsed.overallScore as number)),
    ),
    confidence: (["high", "medium", "low"].includes(
      parsed.confidence as string,
    )
      ? parsed.confidence
      : "medium") as ConfidenceLevel,
    confidenceNote: String(parsed.confidenceNote ?? ""),
    subScores,
    observations: (parsed.observations as unknown[])
      .slice(0, 6)
      .map(String),
    coachingCues: (parsed.coachingCues as unknown[]).slice(0, 3).map(
      String,
    ) as [string, string, string],
    nextStep: String(parsed.nextStep ?? ""),
  };
}

export async function analyzeSquatVideo(
  videoBuffer: Buffer,
  analysisId: string,
): Promise<SquatAnalysisResult> {
  const frames = await extractFrames(videoBuffer, analysisId);

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const messagePromise = client.messages.create(
      {
        model: "claude-opus-4-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              ...frames.map((f) => ({
                type: "image" as const,
                source: {
                  type: "base64" as const,
                  media_type: f.mediaType,
                  data: f.base64,
                },
              })),
              {
                type: "text",
                text: "These images are side-view snapshots at roughly 1s, 2s, and 3s into the clip. Analyze the squat using all three. Return only the JSON assessment.",
              },
            ],
          },
        ],
      },
      { signal: controller.signal },
    );

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error("Analysis timed out"));
      }, ANALYSIS_TIMEOUT_MS);
    });

    const message = await Promise.race([messagePromise, timeoutPromise]);

    const rawText = message.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const parsed = parseAIResponse(rawText);

    return {
      ...parsed,
      id: analysisId,
      movementLabel: "Bodyweight squat",
      cameraAngle: "Side view",
      analyzedAt: new Date().toISOString(),
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
