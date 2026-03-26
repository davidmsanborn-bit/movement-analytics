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
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#050508] px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-xl shadow-black/40">
        <p className="text-center font-sans text-lg font-semibold tracking-tight text-white">
          Movement Analytics
        </p>
        <p className="mt-3 text-center text-sm leading-relaxed text-zinc-500">
          Track your progress. Fix your form.
        </p>
        <div className="mt-8 flex justify-center">
          <SignInWithGoogle />
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
