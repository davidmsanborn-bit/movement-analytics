"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-[#f5f5f7] pb-20 pt-20 md:pb-24 md:pt-24">
      <div className="mx-auto grid min-h-[600px] max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#0A84FF]">
            MOVEMENT ANALYTICS
          </p>
          <h1 className="mt-5 font-sans text-[42px] font-extrabold leading-[1.05] tracking-[-2px] text-[#1d1d1f] md:text-[56px]">
            Your coach is in your camera.
          </h1>
          <p className="mt-5 text-lg font-normal text-[#86868b]">
            Film it. Score it. Fix it.
          </p>
          <p className="mt-7 max-w-md text-base leading-relaxed text-[rgba(0,0,0,0.5)]">
            Upload a short side-view squat clip and get movement quality feedback
            with a clear score, targeted observations, and coaching cues you can
            apply in your next session.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/analyze/squat"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#0A84FF] px-8 text-sm font-semibold text-white transition hover:bg-[#0066CC]"
            >
              Analyze my squat -&gt;
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[#e5e5ea] px-8 text-sm font-semibold text-[#1d1d1f] transition hover:bg-white"
            >
              How it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.2em] text-[#aeaeb2]">
            <span>AI-POWERED</span>
            <span>UNDER 15 SEC</span>
            <span>ANY MOVEMENT</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[500px] rounded-3xl border border-[#e5e5ea] bg-[#f5f5f7] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
          <div
            className="pointer-events-none absolute inset-6 rounded-2xl opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(29,29,31,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(29,29,31,0.9) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(10,132,255,0.18) 0%, rgba(174,198,255,0.12) 45%, transparent 72%)",
            }}
          />

          <div className="relative z-10 flex min-h-[620px] items-center justify-center py-2">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#1d1d1f] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
              <span className="mr-1.5 inline-block text-[#0A84FF]">◷</span>
              Results in ~15 seconds
            </div>

            <div className="rounded-[44px] bg-[#1d1d1f] p-2.5 shadow-[0_14px_28px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <div className="relative h-[590px] w-[286px] overflow-hidden rounded-[36px] bg-white">
                <div className="absolute left-1/2 top-2 h-6 w-28 -translate-x-1/2 rounded-full bg-[#0e0e10]" />
                <div className="px-5 pb-8 pt-10">
                  <div className="mb-5 flex items-center justify-between text-[10px] text-[#86868b]">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86868b]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86868b]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86868b]" />
                    </div>
                    <span>9:41</span>
                  </div>

                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#0A84FF]">
                    Assessment
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#1d1d1f]">
                    Bodyweight squat
                  </h3>
                  <p className="mt-1 text-sm text-[#86868b]">
                    Side view · Bodyweight
                  </p>

                  <div className="mt-5 flex items-end justify-between">
                    <div className="flex items-end gap-2">
                      <span className="text-6xl font-bold leading-none text-[#0A84FF]">
                        82
                      </span>
                      <span className="pb-1 text-base text-[#aeaeb2]">/100</span>
                    </div>
                    <span className="rounded-full bg-[rgba(52,199,89,0.16)] px-3 py-1 text-xs font-semibold text-[#34C759]">
                      HIGH
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { label: "Depth", score: 85, color: "#34C759" },
                      { label: "Trunk control", score: 74, color: "#FF9500" },
                      { label: "Alignment", score: 88, color: "#34C759" },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="text-[#1d1d1f]">{row.label}</span>
                          <span className="font-medium" style={{ color: row.color }}>
                            {row.score}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#f2f2f7]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.score}%`, backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-[#e5e5ea] bg-[#fafafa] p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86868b]">
                      Coaching cue
                    </p>
                    <p className="mt-1 text-sm text-[#1d1d1f]">
                      Drive knees out over pinky toes...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
