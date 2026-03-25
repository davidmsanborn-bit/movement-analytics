import type { SquatAnalysisResult, SubScoreDimension } from "./types";

export type SubScoreDelta = {
  dimension: SubScoreDimension;
  label: string;
  previousScore: number;
  currentScore: number;
  delta: number;
};

export type ComparisonResult = {
  overallDelta: number;
  improved: boolean;
  subScoreDeltas: SubScoreDelta[];
  mostImproved: SubScoreDimension | null;
  stillNeeds: SubScoreDimension | null;
};

export function compareAnalysis(
  previous: SquatAnalysisResult,
  current: SquatAnalysisResult,
): ComparisonResult {
  const overallDelta = current.overallScore - previous.overallScore;
  const improved = overallDelta > 0;

  const prevMap = new Map(
    previous.subScores.map((s) => [s.dimension, s] as const),
  );
  const curMap = new Map(
    current.subScores.map((s) => [s.dimension, s] as const),
  );
  const dimensions = [
    ...new Set<SubScoreDimension>([
      ...prevMap.keys(),
      ...curMap.keys(),
    ]),
  ];

  const subScoreDeltas: SubScoreDelta[] = dimensions.map((dimension) => {
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

  let mostImproved: SubScoreDimension | null = null;
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

  let stillNeeds: SubScoreDimension | null = null;
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
