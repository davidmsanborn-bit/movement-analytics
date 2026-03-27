import Anthropic from "@anthropic-ai/sdk";
import type {
  DeadliftAnalysisResult,
  DeadliftSubScoreDimension,
} from "./deadliftTypes";
import type { ConfidenceLevel } from "./types";

const client = new Anthropic();
const ANALYSIS_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are an elite powerlifting and strength coach with expertise in conventional, sumo, and Romanian deadlift assessment.

You receive three still frames from one video (captured at about 1s, 2s, and 3s). First infer context from what is visible, then assess movement quality.

IMPORTANT: Never reference 'frames', 'frame numbers', or timestamps in your response text. The user sees this as a video analysis. Describe WHEN in the movement something happens using phrases like: "at setup", "off the floor", "past the knees", "at lockout", "during the pull", "at the top"

## Detection (from the frames only)
- **movementLabel**: One of: "Conventional deadlift", "Sumo deadlift", "Romanian deadlift", "Trap bar deadlift", or "Deadlift" if unclear.
- **loadType**: One of: "barbell", "dumbbell", "kettlebell", "trap bar", "bodyweight", "unknown"
- **cameraAngle**: One of: "side view", "front view", "rear view", "diagonal", "unknown"
- **weight**: Infer from context; the user may also supply weight in the message — you may still echo load type in loadType.

## Coaching reference (use for assessment, not as copy-paste boilerplate)

- **HIP HINGE**: Ideal — hips push back to initiate, chest stays up. Faults — squatting the deadlift (hips drop too low, bar drifts forward); hips too high at setup (straight leg pull). Romanian — hips push back with minimal knee bend.

- **BAR PATH**: Ideal — bar stays in contact with or within about an inch of the legs for the whole lift. Faults — bar drifts forward away from the body on the way up; bar swings around the knees instead of over them. Side view is best for assessing this.

- **BACK POSITION**: Ideal — neutral spine throughout. Faults — lumbar rounding; thoracic rounding; hyperextension at lockout. Brace cue: "big breath, 360 degrees of pressure"

- **LOCKOUT**: Ideal — full hip extension, glutes squeezed, standing tall. Faults — hyperextending lower back at top; not achieving full lockout; soft knees at lockout.

- **SHIN ANGLE (setup)**: Conventional — shins roughly vertical, bar 1–2 inches from shins. Sumo — wider stance, shins more vertical. Faults — shins too far forward (bar too far from body); shins too vertical with hips too high (poor setup).

## Confidence rules
- **high**: Side view showing full lift from setup to lockout
- **medium**: front/rear view OR partial lift visible
- **low**: only partial movement or poor lighting

## Angle recommendations (angleRecommendation)
- If **side view** AND confidence is **high**: set angleRecommendation to **null** only when you also have high confidence the full lift is visible.
- If **side view** AND confidence is **medium** or **low**: use exactly this sentence:
  "A rear view would reveal any lateral bar drift and whether your hips are rising symmetrically"
- If **front view** or **rear view** or **diagonal**: recommend a **side view** with a specific short sentence — never recommend the same angle the athlete already filmed.
- Never suggest filming the same camera angle again.

## Output
Return a single JSON object with this exact shape (no extra keys):
{
  "overallScore": <0-100>,
  "confidence": <"high"|"medium"|"low">,
  "confidenceNote": <string>,
  "movementLabel": <"Conventional deadlift"|"Sumo deadlift"|"Romanian deadlift"|"Trap bar deadlift"|"Deadlift">,
  "loadType": <"barbell"|"dumbbell"|"kettlebell"|"trap bar"|"bodyweight"|"unknown">,
  "cameraAngle": <"side view"|"front view"|"rear view"|"diagonal"|"unknown">,
  "subScores": [
    { "dimension": "hipHinge", "label": "Hip hinge", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "barPath", "label": "Bar path", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "backPosition", "label": "Back position", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "lockout", "label": "Lockout", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "shinAngle", "label": "Shin angle", "score": <0-100>, "summary": <short phrase> }
  ],
  "observations": [<4 specific strings>],
  "coachingCues": [<exactly 3 actionable strings>],
  "nextStep": <string>,
  "angleRecommendation": <string or null>,
  "additionalAngleBenefit": <string or null>
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

const DIMENSIONS: DeadliftSubScoreDimension[] = [
  "hipHinge",
  "barPath",
  "backPosition",
  "lockout",
  "shinAngle",
];

function isDeadliftSubScoreDimension(d: string): d is DeadliftSubScoreDimension {
  return (DIMENSIONS as readonly string[]).includes(d);
}

const LOAD_TYPES = new Set([
  "barbell",
  "dumbbell",
  "kettlebell",
  "trap bar",
  "bodyweight",
  "unknown",
]);

function normalizeLoadType(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const s = raw.trim().toLowerCase();
  if (LOAD_TYPES.has(s)) return s;
  if (s === "trap_bar" || s === "trap-bar") return "trap bar";
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
  DeadliftAnalysisResult,
  "id" | "analyzedAt" | "weight"
> {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

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

  const movementLabel = nonEmptyString(parsed.movementLabel, "Deadlift");
  const cameraAngle = nonEmptyString(parsed.cameraAngle, "Unknown angle");
  const loadType = normalizeLoadType(parsed.loadType);
  const angleRecommendation = nullableRecommendation(parsed.angleRecommendation);
  const additionalAngleBenefit = nullableRecommendation(
    parsed.additionalAngleBenefit,
  );

  const subScores = (parsed.subScores as unknown[]).map((row) => {
    const s = row as {
      dimension?: string;
      label?: string;
      score?: number;
      summary?: string;
    };
    const dimension = s.dimension ?? "";
    if (!isDeadliftSubScoreDimension(dimension)) {
      throw new Error(`Invalid sub-score dimension: ${dimension}`);
    }
    return {
      dimension,
      label: String(s.label ?? ""),
      score: Math.min(100, Math.max(0, Math.round(Number(s.score)))),
      summary: String(s.summary ?? ""),
    };
  });

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

export async function analyzeDeadliftVideo(
  storagePath: string,
  analysisId: string,
  weight: string | null,
): Promise<DeadliftAnalysisResult> {
  const frames = await extractFrames(storagePath, analysisId);

  const weightLine =
    typeof weight === "string" && weight.trim()
      ? `\n\nWeight used: ${weight.trim()}`
      : "";

  const userText = `These images are frames from the same clip at roughly 1s, 2s, and 3s. Infer movement type, external load, and camera angle from the pixels, then complete the full JSON assessment. Return only the JSON object.${weightLine}`;

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
                text: userText,
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
    const weightStored =
      typeof weight === "string" && weight.trim() ? weight.trim() : null;

    return {
      ...parsed,
      id: analysisId,
      analyzedAt: new Date().toISOString(),
      weight: weightStored,
    };
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
