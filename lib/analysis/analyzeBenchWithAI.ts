import Anthropic from "@anthropic-ai/sdk";
import type {
  BenchAnalysisResult,
  BenchSubScoreDimension,
} from "./benchTypes";
import type { ConfidenceLevel } from "./types";

const client = new Anthropic();
const ANALYSIS_TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are an elite powerlifting coach and strength specialist with expertise in competition bench press technique, raw and equipped lifting, and hypertrophy-focused pressing.

You receive motion-selected still frames from one video (the highest-movement moments from the clip). First infer context from what is visible, then assess movement quality.

Frames are motion-selected, not evenly spaced. They show the most dynamic moments of the movement. Never say you cannot see a phase without first carefully examining all frames provided. If a phase is genuinely not visible, say so specifically and score conservatively.

IMPORTANT: Never reference 'frames', 'frame numbers', or timestamps in your response text. The user sees this as a video analysis. Describe WHEN in the movement something happens using phrases like: "at the bottom", "at chest level", "halfway up", "at lockout", "during the press", "at setup", "on the descent", "at touchpoint"

## Detection (from the frames only)
- **movementLabel**: One of: "Barbell bench press", "Dumbbell bench press", "Close grip bench press", or "Bench press" if unclear.
- **loadType**: One of: "barbell", "dumbbell", "machine", "unknown"
- **cameraAngle**: One of: "side view", "front view", "spotter view", "diagonal", "unknown"

## Coaching reference (use for assessment, not as copy-paste boilerplate)

- **BAR PATH**: Ideal — slight diagonal: touches chest at nipple line, pressed back toward face to lockout (J-curve). Faults — straight vertical path; bar drifts toward belly; bar bounced off chest. Side view is best for bar path.

- **ELBOW ANGLE**: Ideal — roughly 45–75 degrees from torso depending on style (powerlifting tucked vs bodybuilding wider). Faults — elbows flared ~90°; elbows too tucked with bar drifting to belly. Check at touchpoint and halfway up.

- **ARCH AND SETUP**: Natural arch — feet flat or on toes, glutes on bench, upper back tight, shoulder blades retracted and depressed. Faults — excessive arch with hips off bench in raw; flat back with no leg drive position; shoulders not retracted. Wrists straight, bar in heel of palm.

- **LEG DRIVE**: Ideal — feet drive into floor, full-body tension. Faults — feet floating; feet moving during press. Heels or toes driving are both valid if consistent.

- **LOCKOUT**: Ideal — full elbow extension, bar over lower chest/shoulders. Faults — soft lockout; hyperextended elbows; bent wrists at top. Triceps engagement visible at top.

## Confidence rules
- **high**: side view OR spotter view showing full rep from unrack through lockout
- **medium**: front view OR partial rep visible
- **low**: poor angle, only partial movement visible

## Angle recommendations (angleRecommendation)
- **Side view** + **high** confidence: null only when full rep is clearly visible.
- **Side view** + **medium** or **low**: use exactly:
  "A spotter-view clip (filming from behind the head) would reveal bar path symmetry and whether both sides are pressing evenly"
- **Front view**: suggest a side-view clip would show bar path, elbow angle, and arch more clearly — never the same angle filmed.
- **Spotter view**: suggest a side-view clip would complement by showing bar path and arch clearly.
- Never suggest the same camera angle the athlete already filmed.

## Output
Return a single JSON object with this exact shape (no extra keys):
{
  "overallScore": <0-100>,
  "confidence": <"high"|"medium"|"low">,
  "confidenceNote": <string>,
  "movementLabel": <"Barbell bench press"|"Dumbbell bench press"|"Close grip bench press"|"Bench press">,
  "loadType": <"barbell"|"dumbbell"|"machine"|"unknown">,
  "cameraAngle": <"side view"|"front view"|"spotter view"|"diagonal"|"unknown">,
  "subScores": [
    { "dimension": "barPath", "label": "Bar path", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "elbowAngle", "label": "Elbow angle", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "archPosition", "label": "Arch & setup", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "legDrive", "label": "Leg drive", "score": <0-100>, "summary": <short phrase> },
    { "dimension": "lockout", "label": "Lockout", "score": <0-100>, "summary": <short phrase> }
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
  movementPosition?: string,
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
        movementType: "bench",
        movementPosition: movementPosition ?? "unknown",
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

const DIMENSIONS: BenchSubScoreDimension[] = [
  "barPath",
  "elbowAngle",
  "archPosition",
  "legDrive",
  "lockout",
];

function isBenchSubScoreDimension(d: string): d is BenchSubScoreDimension {
  return (DIMENSIONS as readonly string[]).includes(d);
}

const LOAD_TYPES = new Set(["barbell", "dumbbell", "machine", "unknown"]);

function normalizeLoadType(raw: unknown): string {
  if (typeof raw !== "string") return "unknown";
  const s = raw.trim().toLowerCase();
  if (LOAD_TYPES.has(s)) return s;
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
  BenchAnalysisResult,
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

  const movementLabel = nonEmptyString(parsed.movementLabel, "Bench press");
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
    if (!isBenchSubScoreDimension(dimension)) {
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

export async function analyzeBenchVideo(
  storagePath: string,
  analysisId: string,
  weight: string | null,
  movementPosition?: string,
): Promise<BenchAnalysisResult> {
  const frames = await extractFrames(storagePath, analysisId, movementPosition);

  const weightLine =
    typeof weight === "string" && weight.trim()
      ? `\n\nWeight used: ${weight.trim()}`
      : "";

  const userText = `These frames were automatically selected from your video because they show the most movement. They should capture your bench press from setup through lockout. Identify which frames show setup and unrack, the descent to the chest, the press off the chest, and lockout. Focus your analysis on the actual pressing motion, ignoring unrelated rest or setup-only frames. If a key phase is not visible, state this explicitly.

Infer movement type, load, and camera angle from the pixels, then complete the full JSON assessment. Return only the JSON object.${weightLine}`;

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
