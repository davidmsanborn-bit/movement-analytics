"use client";

import { createClient } from "@supabase/supabase-js";
import { consumePendingUpload } from "@/lib/analysis/pendingUpload";
import { isValidAnalysisId } from "@/lib/analysis/analysisId";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 2500;
/** Wall-clock cap for status polling (independent of upload duration). */
const MAX_STATUS_POLL_MS = 60_000;

type Props = {
  id: string;
  /** Prior analysis id for comparison on the results page (from query string). */
  previousId?: string;
};

export function ProcessingPageClient({ id, previousId }: Props) {
  const router = useRouter();
  const [progressStage, setProgressStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pollInFlight = useRef(false);
  const uploadStarted = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/progress/${id}`);
    eventSourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as { stage?: string };
        if (typeof parsed.stage === "string") {
          setProgressStage(parsed.stage);
        }
      } catch {
        /* ignore malformed SSE payloads */
      }
    };
    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [id]);

  useEffect(() => {
    let stopped = false;
    let pollIntervalId: number | undefined;
    const pollStartedAtMs = Date.now();

    console.log("[processing] mount", { analysisId: id });

    const closeEventSource = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

    const clearPollInterval = () => {
      if (pollIntervalId !== undefined) {
        window.clearInterval(pollIntervalId);
        pollIntervalId = undefined;
      }
    };

    const startUpload = async () => {
      if (uploadStarted.current) return;
      uploadStarted.current = true;
      console.log("[processing] startUpload begin", { analysisId: id });

      const file = consumePendingUpload(id);
      console.log("[processing] consumePendingUpload result", {
        analysisId: id,
        found: Boolean(file),
        fileName: file?.name ?? null,
        fileSize: file?.size ?? null,
      });
      if (!file) {
        console.log("[processing] pending upload missing", {
          analysisId: id,
          reason:
            "Likely page reload/new tab/navigation timing caused in-memory pending file to be lost.",
        });
        clearPollInterval();
        closeEventSource();
        setError("No pending upload found for this analysis session.");
        return;
      }

      try {
        setProgressStage("Uploading video...");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY).");
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const storagePath = `${id}/input.mov`;
        const { error: uploadError } = await supabase.storage
          .from("videos")
          .upload(storagePath, file);

        if (uploadError) {
          throw uploadError;
        }

        console.log("[processing] POST /api/analyze start", {
          analysisId: id,
          fileName: file.name,
          fileSize: file.size,
        });
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId: id }),
        });
        const data = (await res.json()) as { analysisId?: string; error?: string };
        console.log("[processing] POST /api/analyze response", {
          analysisId: id,
          status: res.status,
          ok: res.ok,
          responseAnalysisId: data.analysisId ?? null,
          error: data.error ?? null,
        });
        if (!res.ok) {
          clearPollInterval();
          closeEventSource();
          setError(data.error ?? "Upload failed. Please try again.");
          return;
        }
        if (data.analysisId !== id) {
          console.log("[processing] analysisId mismatch", {
            expectedAnalysisId: id,
            responseAnalysisId: data.analysisId ?? null,
          });
          clearPollInterval();
          closeEventSource();
          setError("Server returned an unexpected analysis session.");
          return;
        }
        console.log("[processing] upload accepted", { analysisId: id });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Please try again.";

        console.log("[processing] POST /api/analyze network failure", {
          analysisId: id,
        });
        clearPollInterval();
        closeEventSource();
        setError(message);
      }
    };

    const runStatusPoll = async () => {
      if (stopped) return;
      if (pollInFlight.current) return;

      if (Date.now() - pollStartedAtMs > MAX_STATUS_POLL_MS) {
        clearPollInterval();
        closeEventSource();
        setError("Analysis is taking longer than expected. Please try again.");
        return;
      }

      pollInFlight.current = true;
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = (await res.json()) as { status?: string; error?: string };

        if (res.status === 400) {
          clearPollInterval();
          closeEventSource();
          setError("Invalid analysis session.");
          return;
        }

        if (res.status === 500) {
          clearPollInterval();
          closeEventSource();
          setError(data.error ?? "Lookup failed. Please try again.");
          return;
        }

        if (res.status === 200 && data.status === "ready") {
          clearPollInterval();
          closeEventSource();
          const resultsQs =
            previousId && isValidAnalysisId(previousId)
              ? `?previousId=${encodeURIComponent(previousId)}`
              : "";
          router.push(`/results/${id}${resultsQs}`);
          return;
        }

        if (res.status === 202 && data.status === "processing") {
          // keep polling
        } else if (!res.ok) {
          clearPollInterval();
          closeEventSource();
          setError(data.error ?? "Analysis failed. Please try again.");
          return;
        }
      } catch {
        clearPollInterval();
        closeEventSource();
        setError("Network error. Check your connection.");
        return;
      } finally {
        pollInFlight.current = false;
      }
    };

    pollIntervalId = window.setInterval(() => {
      void runStatusPoll();
    }, POLL_INTERVAL_MS);

    void runStatusPoll();
    void startUpload();

    return () => {
      stopped = true;
      clearPollInterval();
    };
  }, [id, previousId, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-6">
          <p className="text-sm text-red-400">{error}</p>
          <a
            href="/analyze/squat"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 px-6 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            ← Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center text-center">
      <div className="max-w-md space-y-10">
        <div className="flex justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/5"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="251"
                strokeDashoffset="60"
                strokeLinecap="round"
                className="animate-spin text-[var(--accent)]"
                style={{ animationDuration: "1.8s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                AI
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-lg font-semibold tracking-tight text-white transition-all duration-500">
            {progressStage.trim() ? progressStage : "Preparing…"}
          </p>
          <p className="text-sm text-zinc-500">
            We’ll open your results as soon as they’re ready.
          </p>
        </div>
      </div>
    </div>
  );
}
