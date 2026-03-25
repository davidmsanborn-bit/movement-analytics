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

You receive three still frames from one video (captured at about 1s, 2s, and 3s). First infer context from what is visible, then assess movement quality.

## Detection (from the frames only)
- **movement type**: Prefer one of: "barbell back squat", "front squat", "goblet squat", "bodyweight squat", "split squat", "sumo squat". If unclear, use "squat".
- **load**: One of: "barbell", "dumbbell", "kettlebell", "resistance band", "bodyweight". If unsure, use "bodyweight" when no external load is visible, otherwise use your best guess.
- **camera angle**: One of: "side view", "front view", "rear view", "diagonal" — relative to the athlete.
- **confidence** ("high" | "medium" | "low"): Based on resolution, lighting, occlusion, and whether key joints (hip, knee, ankle, spine) are visible enough to judge fairly. "low" if major blind spots.

## Output
Return a single JSON object with this exact shape (no extra keys):
{
  "movementLabel": <string — human-readable title, e.g. "Barbell back squat">,
  "cameraAngle": <string — e.g. "Side view", matching your detection>,
  "loadType": <"barbell" | "dumbbell" | "kettlebell" | "resistance band" | "bodyweight" | "unknown">,
  "angleRecommendation": <string | null> — null only if the current camera angle is sufficient for a fair squat assessment from these frames; otherwise one specific sentence on how to film next time (e.g. adding front view for knee tracking)>,
  "additionalAngleBenefit": <string — one short sentence on what a second angle (e.g. front or 45°) would clarify, even if the current angle is acceptable>,
  "overallScore": <number 0-100>,
  "confidence": <"high" | "medium" | "low">,
  "confidenceNote": <string — one sentence tying confidence to video quality and visibility>,
  "subScores": [
    { "dimension": "depth", "label": "Depth", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "trunkControl", "label": "Trunk control", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "lowerBodyAlignment", "label": "Lower-body alignment", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "balanceStability", "label": "Balance / stability", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "controlTempo", "label": "Control / tempo", "score": <0-100>, "summary": <short phrase> }
  ],
  "observations": [<4+ strings — each SPECIFIC to this video; joint angles, positions, patterns. No generic filler>],
  "coachingCues": [<exactly 3 strings — actionable, tied to faults you saw>],
  "nextStep": <one string — top priority fix with a concrete drill or cue>
}

Frame your feedback as movement quality assessment, not medical diagnosis.

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

const LOAD_TYPES = new Set([
  "barbell",
  "dumbbell",
  "kettlebell",
  "resistance band",
  "bodyweight",
  "unknown",
]);

function normalizeLoadType(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const s = raw.trim().toLowerCase();
  if (LOAD_TYPES.has(s)) return s;
  if (s === "band" || s === "resistance_band") return "resistance band";
  return "unknown";
}

function nonEmptyString(raw: unknown, fallback: string): string {
  if (typeof raw !== "string") return fallback;
  const t = raw.trim();
  return t.length ? t : fallback;
}

function nullableRecommendation(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length ? t : null;
}

function parseAIResponse(raw: string): Omit<
  SquatAnalysisResult,
  "id" | "analyzedAt"
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

  const movementLabel = nonEmptyString(parsed.movementLabel, "Squat");
  const cameraAngle = nonEmptyString(parsed.cameraAngle, "Unknown angle");
  const loadType = normalizeLoadType(parsed.loadType);
  const angleRecommendation = nullableRecommendation(parsed.angleRecommendation);
  const additionalAngleBenefit = nullableRecommendation(
    parsed.additionalAngleBenefit,
  );

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
    movementLabel,
    cameraAngle,
    loadType,
    angleRecommendation,
    additionalAngleBenefit,
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
        max_tokens: 2048,
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
                text: "These images are frames from the same clip at roughly 1s, 2s, and 3s. Infer movement type, external load, and camera angle from the pixels, then complete the full JSON assessment. Return only the JSON object.",
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
      analyzedAt: new Date().toISOString(),
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
