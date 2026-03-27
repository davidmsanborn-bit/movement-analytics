/**
 * Basketball shooting analysis — stored in `shooting_analyses`.
 * Same conceptual shape as squat results, with shot context fields.
 */
import type { ConfidenceLevel } from "./types";

export type ShootingSubScoreDimension =
  | "stance"
  | "kineticChain"
  | "ballHandling"
  | "elbowRelease"
  | "followThrough";

export interface ShootingSubScore {
  dimension: ShootingSubScoreDimension;
  label: string;
  score: number;
  summary: string;
}

export interface ShootingAnalysisResult {
  id: string;
  shotType: string;
  hand: string;
  cameraAngle: string;
  /** Model output; always "bodyweight" for this feature */
  loadType: string;
  angleRecommendation: string | null;
  additionalAngleBenefit: string | null;
  overallScore: number;
  confidence: ConfidenceLevel;
  confidenceNote: string;
  subScores: ShootingSubScore[];
  observations: string[];
  coachingCues: [string, string, string];
  nextStep: string;
  analyzedAt: string;
}
