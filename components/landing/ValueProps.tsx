import { PageSection } from "@/components/layout/PageSection";

const items = [
  {
    title: "Credible scoring",
    body: "Overall and sub-scores across depth, trunk, alignment, balance, and tempo—framed with confidence, not fake precision.",
  },
  {
    title: "Actionable cues",
    body: "Three prioritized coaching cues you can use in your next set, plus a concrete next step.",
  },
  {
    title: "Video-first",
    body: "Built for intentional phone footage. Side view keeps the signal clearer while we prove the loop: upload, analyze, improve.",
  },
] as const;

export function ValueProps() {
  return (
    <PageSection
      id="how-it-works"
      className="border-t border-white/10 bg-[#0a0a0f] py-20"
    >
      <h2 className="font-sans text-2xl font-semibold tracking-tight text-white md:text-3xl">
        Built for lifters who care about form
      </h2>
      <p className="mt-4 max-w-2xl text-zinc-400">
        We start narrow on purpose: one movement, one camera angle, and feedback
        you can actually use.
      </p>
      <ul className="mt-12 grid gap-8 md:grid-cols-3">
        {items.map((item) => (
          <li
            key={item.title}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
          >
            <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-[#00ff88]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
