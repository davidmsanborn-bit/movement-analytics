const pendingUploads = new Map<string, File>();

export function setPendingUpload(analysisId: string, file: File): void {
  pendingUploads.set(analysisId, file);
}

export function consumePendingUpload(analysisId: string): File | null {
  const file = pendingUploads.get(analysisId) ?? null;
  if (file) {
    pendingUploads.delete(analysisId);
  }
  return file;
}
