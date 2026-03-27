export type DeadliftSubScoreDimension =
  | "hipHinge"
  | "barPath"
  | "backPosition"
  | "lockout"
  | "shinAngle";

export type DeadliftAnalysisResult = {
  id: string;
  analyzedAt: string;
  movementLabel: string;
  cameraAngle: string;
  loadType: string;
  weight: string | null;
  overallScore: number;
  confidence: "high" | "medium" | "low";
  confidenceNote: string;
  subScores: Array<{
    dimension: DeadliftSubScoreDimension;
    label: string;
    score: number;
    summary: string;
  }>;
  observations: string[];
  coachingCues: [string, string, string];
  nextStep: string;
  angleRecommendation: string | null;
  additionalAngleBenefit: string | null;
};
