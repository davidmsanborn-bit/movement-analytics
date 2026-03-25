import Anthropic from "@anthropic-ai/sdk";
import type {
  ConfidenceLevel,
  SquatAnalysisResult,
  SubScore,
  SubScoreDimension,
} from "./types";

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

type FrameImage = { base64: string; mediaType: "image/jpeg" };

async function extractFrames(
  videoStoragePath: string,
  analysisId: string,
): Promise<FrameImage[]> {
  const baseUrl = process.env.FRAMES_SERVICE_URL?.replace(/\/+$/, "");
  const secret = process.env.FRAMES_SERVICE_SECRET;

  if (!baseUrl || !secret) {
    throw new Error(
      "Frame extraction is not configured (missing FRAMES_SERVICE_URL or FRAMES_SERVICE_SECRET).",
    );
  }

  const url = `${baseUrl}/extract-frames`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analysisId,
        storagePath: videoStoragePath,
      }),
    });
  } catch {
    throw new Error(
      "Frame extraction service is unavailable (network error). Check FRAMES_SERVICE_URL and that the service is running.",
    );
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(
      `Frame extraction service returned an invalid response (HTTP ${res.status}).`,
    );
  }

  if (!res.ok) {
    const errMsg =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : `HTTP ${res.status}`;
    throw new Error(
      `Frame extraction failed (${errMsg}). The frame service may be down or misconfigured.`,
    );
  }

  const parsed = body as { frames?: unknown };
  if (!Array.isArray(parsed.frames) || parsed.frames.length === 0) {
    throw new Error("Frame extraction returned no frames.");
  }

  const frames: FrameImage[] = [];
  for (const item of parsed.frames) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as { base64?: unknown }).base64 !== "string" ||
      typeof (item as { mediaType?: unknown }).mediaType !== "string"
    ) {
      throw new Error("Frame extraction returned an invalid frame shape.");
    }
    const mediaType = (item as { mediaType: string }).mediaType;
    if (mediaType !== "image/jpeg") {
      throw new Error(`Unexpected frame media type: ${mediaType}`);
    }
    frames.push({
      base64: (item as { base64: string }).base64,
      mediaType: "image/jpeg",
    });
  }

  return frames;
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
  storagePath: string,
  analysisId: string,
): Promise<SquatAnalysisResult> {
  const frames = await extractFrames(storagePath, analysisId);

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
