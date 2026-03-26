const pendingUploads = new Map<string, File>();
const pendingWeights = new Map<string, string | null>();

export function setPendingUpload(analysisId: string, file: File): void {
  pendingUploads.set(analysisId, file);
}

export function setPendingWeight(
  analysisId: string,
  weight: string | null,
): void {
  pendingWeights.set(analysisId, weight);
}

export function consumePendingUpload(analysisId: string): File | null {
  const file = pendingUploads.get(analysisId) ?? null;
  if (file) {
    pendingUploads.delete(analysisId);
  }
  return file;
}

export function consumePendingWeight(analysisId: string): string | null {
  if (!pendingWeights.has(analysisId)) return null;
  const w = pendingWeights.get(analysisId)!;
  pendingWeights.delete(analysisId);
  return w;
}
