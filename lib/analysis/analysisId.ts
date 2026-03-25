/**
 * Analysis ids are UUID v4 strings issued by POST /api/analyze.
 * Same id always maps to the same deterministic mock assessment.
 */
const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidAnalysisId(id: string): boolean {
  return UUID_V4.test(id.trim());
}
