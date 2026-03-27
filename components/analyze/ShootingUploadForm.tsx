"use client";

import { setPendingUpload } from "@/lib/analysis/pendingUpload";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";

type Props = {
  previousId?: string;
  addAngle?: boolean;
};

const MAX_FILE_BYTES = 500 * 1024 * 1024;

export function ShootingUploadForm({ previousId, addAngle }: Props) {
  const router = useRouter();
  const inputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((f: File | undefined) => {
    if (f && f.size > MAX_FILE_BYTES) {
      setFile(null);
      setFileName(null);
      setError("File exceeds 500MB technical limit.");
      return;
    }
    setFile(f ?? null);
    setFileName(f?.name ?? null);
    setError(null);
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) return;
      setBusy(true);
      setError(null);
      const analysisId = crypto.randomUUID();
      setPendingUpload(analysisId, file);
      const qs = new URLSearchParams();
      if (previousId) qs.set("previousId", previousId);
      if (addAngle) qs.set("addAngle", "true");
      const qsStr = qs.toString();
      router.push(
        `/analyze/shooting/processing/${analysisId}${qsStr ? `?${qsStr}` : ""}`,
      );
    },
    [file, previousId, addAngle, router],
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Video file
        </label>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Any length · Auto-compressed before upload
        </p>
        <div className="mt-3">
          <label
            htmlFor={inputId}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card-secondary)] px-6 py-10 transition hover:border-[var(--accent-hover)]/70 hover:bg-[rgba(10,132,255,0.06)]"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] transition group-hover:text-[var(--text-primary)]">
              Drop a file or browse
            </span>
            <span className="mt-2 text-sm text-[var(--text-primary)]">
              {fileName ?? "No file selected"}
            </span>
            <input
              id={inputId}
              name="video"
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>
      {error ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !fileName}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#0A84FF] text-sm font-semibold text-white transition hover:bg-[#0066CC] disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
      >
        {busy ? "Uploading…" : "Run analysis"}
      </button>
    </form>
  );
}
