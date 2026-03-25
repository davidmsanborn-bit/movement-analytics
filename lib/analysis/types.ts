/**
 * Squat MVP analysis shapes. Keep names stable when wiring real pipeline + DB.
 */
export type ConfidenceLevel = "high" | "medium" | "low";

export type SubScoreDimension =
  | "depth"
  | "trunkControl"
  | "lowerBodyAlignment"
  | "balanceStability"
  | "controlTempo";

export interface SubScore {
  dimension: SubScoreDimension;
  label: string;
  score: number;
  /** Short status for the card — avoid fake precision */
  summary: string;
}

export interface SquatAnalysisResult {
  id: string;
  movementLabel: "Bodyweight squat";
  cameraAngle: "Side view";
  overallScore: number;
  confidence: ConfidenceLevel;
  confidenceNote: string;
  subScores: SubScore[];
  observations: string[];
  coachingCues: [string, string, string];
  nextStep: string;
  analyzedAt: string;
}

/** Response from POST /api/analyze */
export type AnalyzePostResponse = { analysisId: string };

/** Error body from POST /api/analyze */
export type AnalyzePostError = { error: string };
