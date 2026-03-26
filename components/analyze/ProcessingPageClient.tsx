"use client";

import { createClient } from "@supabase/supabase-js";
import {
  consumePendingUpload,
  consumePendingWeight,
} from "@/lib/analysis/pendingUpload";
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
  /** When true, merge scores by averaging with the previous analysis. */
  addAngle?: boolean;
};

export function ProcessingPageClient({ id, previousId, addAngle }: Props) {
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
      const weight = consumePendingWeight(id);
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
          credentials: "include",
          body: JSON.stringify({
            analysisId: id,
            weight: weight ?? null,
            previousId:
              addAngle && previousId && isValidAnalysisId(previousId)
                ? previousId
                : null,
            addAngle: addAngle ? true : false,
          }),
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
  }, [id, previousId, addAngle, router]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-[var(--bg-page)] text-center">
        <div className="max-w-md space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)]">
          <p className="text-sm text-[var(--score-low)]">{error}</p>
          <a
            href="/analyze/squat"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] px-6 text-sm text-[var(--text-primary)] transition hover:border-[var(--accent-hover)]"
          >
            ← Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center bg-[var(--bg-page)] text-center">
      <div className="max-w-md space-y-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-10 shadow-[var(--shadow-card)]">
        <div className="flex justify-center">
          <div className="relative h-32 w-32">
            <svg className="h-32 w-32" viewBox="0 0 128 128">
              {/* Outer ring - slow rotate */}
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.5"
                strokeOpacity="0.2"
              />
              {/* Outer arc - fast spin */}
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="40 325"
                strokeLinecap="round"
                style={{
                  transformOrigin: "64px 64px",
                  animation: "spin 1.2s linear infinite",
                }}
              />
              {/* Middle ring */}
              <circle
                cx="64"
                cy="64"
                r="44"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.5"
                strokeOpacity="0.15"
              />
              {/* Middle arc - reverse spin */}
              <circle
                cx="64"
                cy="64"
                r="44"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="25 252"
                strokeLinecap="round"
                style={{
                  transformOrigin: "64px 64px",
                  animation: "spin 2s linear infinite reverse",
                }}
              />
              {/* Inner ring */}
              <circle
                cx="64"
                cy="64"
                r="30"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.5"
                strokeOpacity="0.1"
              />
              {/* Corner tick marks */}
              <line
                x1="64"
                y1="6"
                x2="64"
                y2="14"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <line
                x1="122"
                y1="64"
                x2="114"
                y2="64"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <line
                x1="64"
                y1="122"
                x2="64"
                y2="114"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              <line
                x1="6"
                y1="64"
                x2="14"
                y2="64"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.6"
              />
              {/* Center crosshair */}
              <line
                x1="64"
                y1="54"
                x2="64"
                y2="74"
                stroke="var(--accent)"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
              <line
                x1="54"
                y1="64"
                x2="74"
                y2="64"
                stroke="var(--accent)"
                strokeWidth="0.5"
                strokeOpacity="0.4"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[4px] text-[var(--accent)]">
                AI
              </span>
              <div
                className="flex items-center justify-center gap-1.5"
                aria-hidden
              >
                <span className="processing-hud-dot" />
                <span className="processing-hud-dot" />
                <span className="processing-hud-dot" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-lg font-semibold tracking-tight text-[var(--text-primary)] transition-all duration-500">
            {progressStage.trim() ? progressStage : "Preparing…"}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            We’ll open your results as soon as they’re ready.
          </p>
        </div>
      </div>
    </div>
  );
}
