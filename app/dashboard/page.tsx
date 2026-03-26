import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? user.id;

  return (
    <main className="min-h-full bg-[var(--background)] pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Dashboard
        </p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Welcome back, {email}
        </h1>
        <p className="mt-4 text-sm text-zinc-400">
          Your analyses will appear here.
        </p>
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
