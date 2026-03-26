"use client";

import { setPendingUpload, setPendingWeight } from "@/lib/analysis/pendingUpload";
import { useRouter } from "next/navigation";
import { useCallback, useId, useState } from "react";

type SquatUploadFormProps = {
  previousId?: string;
};

export function SquatUploadForm({ previousId }: SquatUploadFormProps) {
  const router = useRouter();
  const inputId = useId();
  const weightInputId = useId();
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((f: File | undefined) => {
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
      const weightTrimmed = weight.trim();
      setPendingWeight(analysisId, weightTrimmed ? weightTrimmed : null);
      const qs = previousId
        ? `?previousId=${encodeURIComponent(previousId)}`
        : "";
      router.push(`/analyze/squat/processing/${analysisId}${qs}`);
    },
    [file, weight, previousId, router],
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
          MP4 or MOV, up to 100 MB. Upload is encrypted in transit; analysis
          runs on our side after you submit.
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
      <div>
        <label
          htmlFor={weightInputId}
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Weight (optional)
        </label>
        <input
          id={weightInputId}
          name="weight"
          type="text"
          autoComplete="off"
          placeholder="e.g. Bodyweight, 135 lbs, 60 kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--accent)]/60 focus:ring-1 focus:ring-[var(--accent)]/20"
        />
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
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
      >
        {busy ? "Uploading…" : "Run analysis"}
      </button>
    </form>
  );
}
