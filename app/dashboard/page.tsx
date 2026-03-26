import { getUserAnalyses } from "@/lib/analysis/analysisStore";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function formatAnalyzedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? user.id;
  const analyses = await getUserAnalyses(user.id);

  return (
    <main className="min-h-full bg-[var(--background)] pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Welcome back, {email}
        </h1>

        <div className="mt-10">
          <h2 className="font-sans text-sm font-semibold text-zinc-300">
            Recent analyses
          </h2>
          {analyses.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No analyses yet. Run your first assessment below.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {analyses.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/results/${a.id}`}
                    className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.05] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {a.movementLabel}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatAnalyzedAt(a.analyzedAt)}
                      </p>
                    </div>
                    <p className="font-mono text-lg tabular-nums text-[var(--accent)] sm:text-right">
                      {a.overallScore}
                      <span className="text-sm font-sans text-zinc-500">
                        /100
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/analyze/squat"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)]"
          >
            Start a new analysis
          </Link>
        </div>
      </div>
    </main>
  );
}
