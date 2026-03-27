import Anthropic from "@anthropic-ai/sdk";
import type { ConfidenceLevel } from "./types";
import type {
  ShootingAnalysisResult,
  ShootingSubScore,
  ShootingSubScoreDimension,
} from "./shootingTypes";

const client = new Anthropic();
const ANALYSIS_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are an elite NBA player development coach analyzing BASKETBALL SHOOTING FORM from video frames.

You are receiving 8 frames sampled evenly across the full video duration (not fixed timestamps). Infer shot context from what is visible, then assess shooting mechanics and movement quality.

Identify which frames show the actual shot: ball leaving the hand, release point, and follow-through. Focus your analysis on the frames that show the shooting motion; ignore frames where the player is standing still, walking, or not performing a shot. If no frame clearly shows an actual shot release, say so explicitly in confidenceNote and score accordingly (lower confidence, conservative scores).

IMPORTANT: Never reference 'frames', 'frame 4', 'frame 5', or any frame numbers in your response text. The user sees this as a video analysis, not individual frames. Instead say things like 'during the release', 'at the top of your jump', 'on the way up', 'at follow-through', 'mid-shot' etc. Describe WHEN in the movement something happens, not which frame showed it.

## Detection (from the frames only)
- **shotType**: One of: "jumpshot" | "catch-and-shoot" | "off-dribble" | "layup" | "finger-roll" | "floater" | "dunk" | "free-throw" | "three-pointer" | "mid-range" | "unknown"
- **hand**: "right" | "left" | "unknown" — which hand appears to release / guide the shot
- **camera angle**: One of: "side view" | "front view" | "rear view" | "diagonal" | "unknown"
- **loadType**: Always return exactly "bodyweight" (no external barbell-style load in this feature)
- **confidence** ("high" | "medium" | "low"): Based on resolution, lighting, occlusion, and whether the ball, hands, elbow, and lower body are visible enough to judge fairly

## Shot-type specific checks (when identifiable)
- **Jumpshot**: jump–release timing, arc, follow-through hold
- **Layup**: attack angle, hand selection, backboard use
- **Catch-and-shoot**: footwork into catch, set point speed
- **Off-dribble**: gather step, momentum control, balance on release
- **Free throw**: routine consistency, alignment, arc

## Angle recommendations (shooting)
- **Side view** is the gold standard for shooting (arc, elbow path, follow-through).
- **Front view** → recommend **side view** (never suggest the same angle already filmed).
- **Rear view** → recommend **side view**.
- **Side view + high confidence** → "angleRecommendation" may be null.
- **Side view + medium or low confidence** → use this exact sentence for angleRecommendation:
  "A slightly-behind diagonal view would reveal ball grip, off-hand position, and whether your elbow is truly aligned with the basket"
- Never repeat the same camera angle the user already filmed from in angleRecommendation.

## Output
Return a single JSON object with this exact shape (no extra keys):
{
  "overallScore": <number 0-100>,
  "confidence": <"high" | "medium" | "low">,
  "confidenceNote": <string about video quality and visibility>,
  "shotType": <"jumpshot" | "catch-and-shoot" | "off-dribble" | "layup" | "finger-roll" | "floater" | "dunk" | "free-throw" | "three-pointer" | "mid-range" | "unknown">,
  "hand": <"right" | "left" | "unknown">,
  "cameraAngle": <"side view" | "front view" | "rear view" | "diagonal" | "unknown">,
  "loadType": "bodyweight",
  "subScores": [
    { "dimension": "stance", "label": "Stance & base", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "kineticChain", "label": "Kinetic chain", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "ballHandling", "label": "Ball control & grip", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "elbowRelease", "label": "Elbow & release", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "followThrough", "label": "Follow-through", "score": <0-100>, "summary": <short phrase> }
  ],
  "observations": [<4 specific strings about what you actually saw in THIS video>],
  "coachingCues": [<exactly 3 actionable corrections specific to THIS shot>],
  "nextStep": <one specific drill or focus for next practice>,
  "angleRecommendation": <string or null — never suggest the same angle already filmed>,
  "additionalAngleBenefit": <string or null>
}

Frame your feedback as movement quality assessment for basketball skill development, not medical diagnosis.

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
  options?: { movementType?: string },
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
        movementType: options?.movementType ?? "shooting",
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

const SHOOTING_DIMENSIONS: ShootingSubScoreDimension[] = [
  "stance",
  "kineticChain",
  "ballHandling",
  "elbowRelease",
  "followThrough",
];

function isShootingSubScoreDimension(d: string): d is ShootingSubScoreDimension {
  return (SHOOTING_DIMENSIONS as readonly string[]).includes(d);
}

const SHOT_TYPES = new Set([
  "jumpshot",
  "catch-and-shoot",
  "off-dribble",
  "layup",
  "finger-roll",
  "floater",
  "dunk",
  "free-throw",
  "three-pointer",
  "mid-range",
  "unknown",
]);

const HAND_TYPES = new Set(["right", "left", "unknown"]);

function normalizeShotType(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const s = raw.trim().toLowerCase().replace(/\s+/g, "-");
  if (SHOT_TYPES.has(s)) return s;
  return "unknown";
}

function normalizeHand(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const s = raw.trim().toLowerCase();
  if (HAND_TYPES.has(s)) return s;
  return "unknown";
}

function normalizeCameraAngle(raw: unknown): string {
  if (typeof raw !== "string") return "Unknown angle";
  const t = raw.trim();
  return t.length ? t : "Unknown angle";
}

function nullableString(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length ? t : null;
}

function parseAIResponse(raw: string): Omit<
  ShootingAnalysisResult,
  "id" | "analyzedAt"
> {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;

  if (
    typeof parsed.overallScore !== "number" ||
    !Array.isArray(parsed.subScores) ||
    parsed.subScores.length !== 5 ||
    !Array.isArray(parsed.observations) ||
    parsed.observations.length < 4 ||
    !Array.isArray(parsed.coachingCues) ||
    parsed.coachingCues.length !== 3
  ) {
    throw new Error("AI response missing required fields");
  }

  const shotType = normalizeShotType(parsed.shotType);
  const hand = normalizeHand(parsed.hand);
  const cameraAngle = normalizeCameraAngle(parsed.cameraAngle);
  const loadType =
    typeof parsed.loadType === "string" && parsed.loadType.trim() === "bodyweight"
      ? "bodyweight"
      : "bodyweight";

  const subScores: ShootingSubScore[] = (parsed.subScores as unknown[]).map(
    (row) => {
      const s = row as {
        dimension?: string;
        label?: string;
        score?: number;
        summary?: string;
      };
      const dimension = s.dimension ?? "";
      if (!isShootingSubScoreDimension(dimension)) {
        throw new Error(`Invalid shooting sub-score dimension: ${dimension}`);
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
    shotType,
    hand,
    cameraAngle,
    loadType,
    angleRecommendation: nullableString(parsed.angleRecommendation),
    additionalAngleBenefit: nullableString(parsed.additionalAngleBenefit),
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
    observations: (parsed.observations as unknown[]).slice(0, 4).map(String),
    coachingCues: (parsed.coachingCues as unknown[]).slice(0, 3).map(
      String,
    ) as [string, string, string],
    nextStep: String(parsed.nextStep ?? ""),
  };
}

export async function analyzeShootingVideo(
  storagePath: string,
  analysisId: string,
  weight: string | null,
  options?: { movementType?: string },
): Promise<ShootingAnalysisResult> {
  void weight;
  const frames = await extractFrames(storagePath, analysisId, {
    movementType: options?.movementType ?? "shooting",
  });

  const userText =
    "These 8 frames are sampled evenly across the clip. Identify the frames showing the actual shot and focus your analysis on those. Infer shot type, release hand, and camera angle from the pixels, then complete the full JSON assessment. Return only the JSON object.";

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
              { type: "text", text: userText },
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
