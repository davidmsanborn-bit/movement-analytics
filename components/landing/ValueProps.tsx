import { PageSection } from "@/components/layout/PageSection";

export function ValueProps() {
  return (
    <PageSection
      id="how-it-works"
      className="border-t border-black/5 bg-[#f5f5f7] py-20"
    >
      <h2 className="font-sans text-2xl font-semibold tracking-tight text-[#1d1d1f] md:text-3xl">
        Built for athletes who want real feedback
      </h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#86868b]">
        Precise scoring, coaching cues grounded in your video, and progress you can
        actually track.
      </p>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        <li className="rounded-2xl border border-[#e5e5ea] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(10,132,255,0.10)] text-[#0A84FF]">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 19h16" />
                <path d="M7 15l3-3 3 2 4-6" />
                <path d="M7 15V9" />
                <path d="M10 12v3" />
                <path d="M13 14v1" />
              </svg>
            </span>
            <h3 className="font-sans text-lg font-semibold text-[#1d1d1f]">
              Instant scoring
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b]">
            Get a movement quality score with specific sub-scores across depth,
            alignment, trunk control and more.
          </p>
        </li>

        <li className="rounded-2xl border border-[#e5e5ea] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(52,199,89,0.12)] text-[#34C759]">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <h3 className="font-sans text-lg font-semibold text-[#1d1d1f]">
              Actionable coaching
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b]">
            Three targeted coaching cues based on what we actually see in your video.
            No generic advice.
          </p>
        </li>

        <li className="rounded-2xl border border-[#e5e5ea] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(10,132,255,0.10)] text-[#0A84FF]">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </span>
            <h3 className="font-sans text-lg font-semibold text-[#1d1d1f]">
              Track your progress
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#86868b]">
            Every session is logged. Watch your scores improve over time and see
            exactly what changed.
          </p>
        </li>
      </ul>
    </PageSection>
  );
}
