/**
 * Squat analysis shapes stored in DB. Keep names stable when changing the AI contract.
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
  /** Model-inferred movement name for display, e.g. "Barbell back squat" */
  movementLabel: string;
  /** Model-inferred camera relationship to the athlete */
  cameraAngle: string;
  /** Model-inferred external load category */
  loadType: string;
  /** Null when side / current angle is enough; otherwise a concrete capture suggestion */
  angleRecommendation: string | null;
  /** Brief note on what another angle would clarify (depth, knees, hips, etc.) */
  additionalAngleBenefit: string | null;
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
