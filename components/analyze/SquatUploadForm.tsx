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
          className="block text-sm font-medium text-zinc-300"
        >
          Video file
        </label>
        <p className="mt-1 text-xs text-zinc-500">
          MP4 or MOV, up to 100 MB. Upload is encrypted in transit; analysis
          runs on our side after you submit.
        </p>
        <div className="mt-3">
          <label
            htmlFor={inputId}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/40 px-6 py-12 transition hover:border-[var(--accent)]/45 hover:bg-white/[0.02]"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 transition group-hover:text-zinc-400">
              Drop a file or browse
            </span>
            <span className="mt-2 text-sm text-zinc-300">
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
          className="block text-sm font-medium text-zinc-300"
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
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-[var(--accent)]/40 focus:ring-1 focus:ring-[var(--accent)]/30"
        />
      </div>
      {error ? (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200/90"
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
