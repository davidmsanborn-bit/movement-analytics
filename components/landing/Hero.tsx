"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Hero() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const target = 84;
    const timer = setInterval(() => {
      setScore((prev) => {
        if (prev >= target) {
          clearInterval(timer);
          return target;
        }
        return prev + 3;
      });
    }, 35);

    return () => clearInterval(timer);
  }, []);

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
            className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(10,132,255,0.22) 0%, rgba(10,132,255,0.06) 45%, transparent 70%)",
            }}
          />

          <svg
            viewBox="0 0 400 500"
            className="hero-figure relative z-10 h-auto w-full"
            role="img"
            aria-label="Motion capture heat map squat visualization"
          >
            <defs>
              <linearGradient id="scanBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A84FF" stopOpacity="0" />
                <stop offset="50%" stopColor="#0A84FF" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g className="hero-breath">
              <circle cx="200" cy="78" r="26" fill="rgba(10,132,255,0.18)" stroke="#0A84FF" strokeWidth="2" />
              <rect x="152" y="108" rx="34" ry="34" width="96" height="136" fill="rgba(255,149,0,0.2)" stroke="#FF9500" strokeWidth="2.5" />
              <rect x="92" y="148" rx="14" ry="14" width="78" height="24" transform="rotate(-16 92 148)" fill="rgba(10,132,255,0.16)" stroke="#0A84FF" strokeWidth="2" />
              <rect x="228" y="132" rx="14" ry="14" width="78" height="24" transform="rotate(16 228 132)" fill="rgba(10,132,255,0.16)" stroke="#0A84FF" strokeWidth="2" />

              <rect x="134" y="236" rx="30" ry="30" width="72" height="136" transform="rotate(18 134 236)" fill="rgba(52,199,89,0.2)" stroke="#34C759" strokeWidth="2.5" />
              <rect x="194" y="240" rx="30" ry="30" width="72" height="136" transform="rotate(-18 194 240)" fill="rgba(255,149,0,0.2)" stroke="#FF9500" strokeWidth="2.5" />

              <rect x="154" y="356" rx="20" ry="20" width="44" height="96" transform="rotate(10 154 356)" fill="rgba(52,199,89,0.2)" stroke="#34C759" strokeWidth="2" />
              <rect x="202" y="356" rx="20" ry="20" width="44" height="96" transform="rotate(-10 202 356)" fill="rgba(255,149,0,0.2)" stroke="#FF9500" strokeWidth="2" />

              <ellipse cx="200" cy="250" rx="36" ry="22" fill="rgba(52,199,89,0.2)" stroke="#34C759" strokeWidth="2.5" />
              <circle cx="257" cy="300" r="15" fill="rgba(255,59,48,0.2)" stroke="#FF3B30" strokeWidth="2.5" />
            </g>

            <rect x="112" y="0" width="176" height="58" fill="url(#scanBand)" className="hero-scan" />

            <g className="hero-tag hero-tag-1">
              <line x1="106" y1="300" x2="165" y2="258" stroke="#34C759" strokeWidth="1.5" />
              <rect x="18" y="278" width="92" height="34" rx="17" fill="#fff" />
              <text x="33" y="300" className="fill-[#1d1d1f] text-[12px] font-medium">Depth</text>
              <text x="82" y="300" className="fill-[#34C759] text-[12px] font-bold">85</text>
            </g>
            <g className="hero-tag hero-tag-2">
              <line x1="326" y1="182" x2="244" y2="168" stroke="#FF9500" strokeWidth="1.5" />
              <rect x="328" y="164" width="86" height="34" rx="17" fill="#fff" />
              <text x="342" y="186" className="fill-[#1d1d1f] text-[12px] font-medium">Trunk</text>
              <text x="386" y="186" className="fill-[#FF9500] text-[12px] font-bold">74</text>
            </g>
            <g className="hero-tag hero-tag-3">
              <line x1="330" y1="314" x2="271" y2="298" stroke="#34C759" strokeWidth="1.5" />
              <rect x="328" y="298" width="86" height="34" rx="17" fill="#fff" />
              <text x="343" y="320" className="fill-[#1d1d1f] text-[12px] font-medium">Knees</text>
              <text x="388" y="320" className="fill-[#34C759] text-[12px] font-bold">88</text>
            </g>

            <g className="hero-score-card">
              <rect x="300" y="24" width="84" height="78" rx="16" fill="#fff" />
              <text x="342" y="66" textAnchor="middle" className="fill-[#0A84FF] text-[36px] font-bold">
                {score}
              </text>
              <text x="342" y="86" textAnchor="middle" className="fill-[#86868b] text-[12px] font-medium">
                /100
              </text>
            </g>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .hero-figure .hero-breath {
          transform-origin: 200px 250px;
          animation: breathe 3s ease-in-out infinite;
        }
        .hero-figure .hero-tag {
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12));
          opacity: 0;
          animation: tagIn 600ms ease forwards;
        }
        .hero-figure .hero-tag-1 {
          animation-delay: 180ms;
        }
        .hero-figure .hero-tag-2 {
          animation-delay: 380ms;
        }
        .hero-figure .hero-tag-3 {
          animation-delay: 580ms;
        }
        .hero-figure .hero-score-card {
          filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.12));
        }
        .hero-figure .hero-scan {
          animation: scanDown 4s linear infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            transform: scale(0.98);
          }
          50% {
            transform: scale(1);
          }
        }
        @keyframes tagIn {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scanDown {
          0% {
            transform: translateY(-60px);
          }
          100% {
            transform: translateY(500px);
          }
        }
      `}</style>
    </section>
  );
}
