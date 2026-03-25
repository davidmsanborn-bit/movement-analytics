const MAX_AGE_MS = 10 * 60 * 1000;

const store = new Map<string, { stage: string; updatedAt: number }>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [id, entry] of store.entries()) {
    if (now - entry.updatedAt > MAX_AGE_MS) {
      store.delete(id);
    }
  }
}

export function setProgress(analysisId: string, stage: string): void {
  pruneExpired();
  store.set(analysisId, { stage, updatedAt: Date.now() });
}

export function getProgress(analysisId: string): string | null {
  pruneExpired();
  const entry = store.get(analysisId);
  return entry?.stage ?? null;
}

export function deleteProgress(analysisId: string): void {
  pruneExpired();
  store.delete(analysisId);
}
