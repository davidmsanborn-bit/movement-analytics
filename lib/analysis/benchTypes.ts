export type BenchSubScoreDimension =
  | "barPath"
  | "elbowAngle"
  | "archPosition"
  | "legDrive"
  | "lockout";

export type BenchAnalysisResult = {
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
    dimension: BenchSubScoreDimension;
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
