"use client";

import { useEffect, useState } from "react";

export function ShareResultsButton() {
  const [toastState, setToastState] = useState<
    "idle" | "show" | "hiding"
  >("idle");

  useEffect(() => {
    if (toastState === "idle") return;
    const hideTimer = window.setTimeout(() => {
      setToastState("hiding");
    }, 2_000);
    return () => window.clearTimeout(hideTimer);
  }, [toastState]);

  useEffect(() => {
    if (toastState !== "hiding") return;
    const removeTimer = window.setTimeout(() => {
      setToastState("idle");
    }, 500);
    return () => window.clearTimeout(removeTimer);
  }, [toastState]);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToastState("show");
    } catch {
      // Best-effort: if clipboard fails, still show no toast.
      setToastState("idle");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => void onShare()}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]/50 hover:bg-[rgba(10,132,255,0.06)]"
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 text-[var(--accent)]"
          aria-hidden
        >
          <path d="M12 3l8 5-8 5-8-5 8-5z" />
          <path d="M20 8v8l-8 5-8-5V8" />
        </svg>
        Share results
      </button>

      {toastState !== "idle" ? (
        <div
          className={`pointer-events-none absolute -top-11 left-1/2 w-max -translate-x-1/2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white shadow-lg transition-opacity duration-500 ${
            toastState === "show" ? "opacity-100" : "opacity-0"
          }`}
          aria-live="polite"
        >
          Link copied!
        </div>
      ) : null}
    </div>
  );
}

