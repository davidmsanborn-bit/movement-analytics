import { SignInWithGoogle } from "@/components/auth/SignInWithGoogle";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[var(--bg-page)] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-center font-sans text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Movement Analytics
        </p>
        <p className="mt-3 text-center text-sm leading-relaxed text-[var(--text-secondary)]">
          Track your progress. Fix your form.
        </p>
        <div className="mt-8 flex justify-center">
          <SignInWithGoogle />
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
