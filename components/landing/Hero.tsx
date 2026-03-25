import Link from "next/link";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-[#050508] pb-20 pt-20 md:pb-28 md:pt-28">
      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-2 lg:items-center lg:gap-10">
        {/* Left column */}
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#00ff88]">
            ◆ MOVEMENT ANALYTICS ◆
          </p>
          <h1 className="mt-5 font-sans text-[40px] font-extrabold leading-[1.05] tracking-[-2px] text-white md:text-[56px]">
            Your coach is in your camera.
          </h1>
          <p className="mt-6 flex flex-wrap items-center gap-1 font-mono text-sm font-medium uppercase tracking-[0.2em] text-[rgba(0,255,136,0.5)]">
            <span>FILM IT. SCORE IT. FIX IT.</span>
            <span
              className="hero-cursor-blink ml-0.5 inline-block h-[1.1em] w-0.5 bg-[#00ff88]"
              aria-hidden
            />
          </p>
          <p className="mt-8 max-w-md text-base leading-relaxed text-[rgba(255,255,255,0.4)]">
            Upload a short side-view bodyweight squat video and get a movement
            quality assessment with scores, key observations, and three coaching
            cues—grounded in what we can see from phone video, not generic
            advice.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/analyze/squat"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#00ff88] px-8 text-xs font-extrabold uppercase tracking-wider text-[#050508] transition hover:brightness-110"
            >
              Analyze my squat
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[rgba(0,255,136,0.2)] px-8 text-xs font-extrabold uppercase tracking-wider text-white transition hover:border-[rgba(0,255,136,0.45)]"
            >
              How it works
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[10px] font-medium uppercase tracking-[0.25em] text-[rgba(0,255,136,0.55)]">
            <span>◆ AI-POWERED</span>
            <span>◆ UNDER 15 SEC</span>
            <span>◆ ANY MOVEMENT</span>
          </div>
        </div>

        {/* Right column — HUD wireframe */}
        <div className="relative mx-auto w-full max-w-[360px] lg:mx-0 lg:max-w-none">
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,255,136,0.9) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,255,136,0.9) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, rgba(0,255,136,0.35) 0%, transparent 65%)",
            }}
            aria-hidden
          />
          <svg
            viewBox="0 0 320 520"
            className="relative z-[1] h-auto w-full max-w-[320px] drop-shadow-[0_0_28px_rgba(0,255,136,0.12)] lg:max-w-none"
            role="img"
            aria-label="Wireframe athlete in squat with live scan overlay"
          >
            <defs>
              <filter id="heroJointGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="heroScanFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0" />
                <stop offset="50%" stopColor="#00ff88" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
              </linearGradient>
            </defs>

            <g className="hero-squat-figure">
              {/* Ground */}
              <line
                x1="40"
                y1="498"
                x2="280"
                y2="498"
                stroke="rgba(0,255,136,0.25)"
                strokeWidth="1"
              />

              {/* Wireframe body — angular head */}
              <polygon
                points="160,38 178,52 182,78 160,88 138,78 142,52"
                fill="none"
                stroke="#00ff88"
                strokeWidth="1.5"
                strokeLinejoin="miter"
              />

              {/* Torso / chest muscle hints */}
              <path
                d="M 160 88 L 160 125 M 135 118 L 185 118 M 142 108 L 178 108 M 150 132 L 170 132"
                fill="none"
                stroke="rgba(0,255,136,0.85)"
                strokeWidth="1.25"
              />
              <path
                d="M 160 125 L 160 255 M 125 140 L 195 140 M 132 175 L 188 175 M 128 210 L 192 210"
                fill="none"
                stroke="#00ff88"
                strokeWidth="1.5"
              />

              {/* Arms — counterbalance forward */}
              <path
                d="M 125 140 L 108 198 L 92 248 M 195 140 L 212 198 L 228 248"
                fill="none"
                stroke="#00ff88"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 118 165 L 100 215 M 202 165 L 220 215"
                fill="none"
                stroke="rgba(0,255,136,0.45)"
                strokeWidth="1"
              />

              {/* Pelvis */}
              <path
                d="M 128 255 L 160 268 L 192 255"
                fill="none"
                stroke="rgba(0,255,136,0.7)"
                strokeWidth="1.25"
              />

              {/* Legs — 90° squat */}
              <path
                d="M 128 255 L 118 360 L 132 455 L 145 498 M 192 255 L 202 360 L 188 455 L 175 498"
                fill="none"
                stroke="#00ff88"
                strokeWidth="1.5"
                strokeLinejoin="miter"
              />
              <path
                d="M 118 360 L 202 360"
                fill="none"
                stroke="rgba(0,255,136,0.35)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Joint markers */}
              {[
                { cx: 125, cy: 140, r: 4 },
                { cx: 195, cy: 140, r: 4 },
                { cx: 128, cy: 255, r: 4.5 },
                { cx: 192, cy: 255, r: 4.5 },
                { cx: 118, cy: 360, r: 4 },
                { cx: 202, cy: 360, r: 4 },
                { cx: 132, cy: 455, r: 3.5 },
                { cx: 188, cy: 455, r: 3.5 },
              ].map((j, i) => (
                <circle
                  key={i}
                  cx={j.cx}
                  cy={j.cy}
                  r={j.r}
                  fill="#00ff88"
                  filter="url(#heroJointGlow)"
                />
              ))}

              {/* Angle readouts */}
              <path
                d="M 55 200 L 95 168"
                fill="none"
                stroke="rgba(0,255,136,0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="12"
                y="198"
                className="fill-[rgba(0,255,136,0.75)] font-mono text-[9px] font-bold"
                style={{ fontFamily: "var(--font-geist-mono), ui-monospace" }}
              >
                HIP 91°
              </text>
              <path
                d="M 255 395 L 220 368"
                fill="none"
                stroke="rgba(0,255,136,0.4)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="248"
                y="412"
                className="fill-[rgba(0,255,136,0.75)] font-mono text-[9px] font-bold"
                style={{ fontFamily: "var(--font-geist-mono), ui-monospace" }}
              >
                KNEE 88°
              </text>
            </g>

            {/* Scan line — over figure */}
            <rect
              x="0"
              y="0"
              width="320"
              height="40"
              fill="url(#heroScanFade)"
              className="hero-scan-line pointer-events-none"
              style={{ mixBlendMode: "screen" }}
            />

            {/* HUD badges — on top */}
            <rect
              x="8"
              y="10"
              width="78"
              height="22"
              rx="3"
              fill="rgba(5,5,8,0.65)"
              stroke="rgba(0,255,136,0.45)"
              strokeWidth="1"
            />
            <text
              x="47"
              y="25"
              textAnchor="middle"
              className="fill-[#00ff88] font-mono text-[9px] font-bold uppercase"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace" }}
            >
              LIVE SCAN
            </text>
            <rect
              x="214"
              y="10"
              width="98"
              height="22"
              rx="3"
              fill="rgba(5,5,8,0.65)"
              stroke="rgba(0,255,136,0.45)"
              strokeWidth="1"
            />
            <text
              x="263"
              y="25"
              textAnchor="middle"
              className="fill-[#00ff88] font-mono text-[9px] font-bold uppercase"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace" }}
            >
              SCORE: 84
            </text>

            {/* Sin waves — bottom */}
            <path
              d="M 20 472 Q 60 452 100 472 T 180 472 T 260 472 T 300 472"
              fill="none"
              stroke="rgba(0,255,136,0.45)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeDasharray="14 10"
              strokeDashoffset={0}
              className="hero-wave-path"
            />
            <path
              d="M 20 488 Q 70 508 120 488 T 220 488 T 300 488"
              fill="none"
              stroke="rgba(0,255,136,0.28)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeDasharray="10 12"
              strokeDashoffset={0}
              className="hero-wave-path-alt"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
