import type {
  DeadliftAnalysisResult,
  DeadliftSubScoreDimension,
} from "./deadliftTypes";

export type DeadliftSubScoreDelta = {
  dimension: DeadliftSubScoreDimension;
  label: string;
  previousScore: number;
  currentScore: number;
  delta: number;
};

export type DeadliftComparisonResult = {
  overallDelta: number;
  improved: boolean;
  subScoreDeltas: DeadliftSubScoreDelta[];
  mostImproved: DeadliftSubScoreDimension | null;
  stillNeeds: DeadliftSubScoreDimension | null;
};

export function compareDeadliftAnalysis(
  previous: DeadliftAnalysisResult,
  current: DeadliftAnalysisResult,
): DeadliftComparisonResult {
  const overallDelta = current.overallScore - previous.overallScore;
  const improved = overallDelta > 0;

  const prevMap = new Map(
    previous.subScores.map((s) => [s.dimension, s] as const),
  );
  const curMap = new Map(
    current.subScores.map((s) => [s.dimension, s] as const),
  );
  const dimensions = [
    ...new Set<DeadliftSubScoreDimension>([
      ...prevMap.keys(),
      ...curMap.keys(),
    ]),
  ];

  const subScoreDeltas: DeadliftSubScoreDelta[] = dimensions.map((dimension) => {
    const p = prevMap.get(dimension);
    const c = curMap.get(dimension);
    const previousScore = p?.score ?? 0;
    const currentScore = c?.score ?? 0;
    const label = c?.label ?? p?.label ?? dimension;
    return {
      dimension,
      label,
      previousScore,
      currentScore,
      delta: currentScore - previousScore,
    };
  });

  let mostImproved: DeadliftSubScoreDimension | null = null;
  let bestPositiveDelta = 0;
  for (const row of subScoreDeltas) {
    if (row.delta > bestPositiveDelta) {
      bestPositiveDelta = row.delta;
      mostImproved = row.dimension;
    }
  }
  if (bestPositiveDelta <= 0) {
    mostImproved = null;
  }

  let stillNeeds: DeadliftSubScoreDimension | null = null;
  let lowestCurrent = Infinity;
  for (const row of subScoreDeltas) {
    if (row.currentScore < lowestCurrent) {
      lowestCurrent = row.currentScore;
      stillNeeds = row.dimension;
    }
  }
  if (subScoreDeltas.length === 0) {
    stillNeeds = null;
  }

  return {
    overallDelta,
    improved,
    subScoreDeltas,
    mostImproved,
    stillNeeds,
  };
}
