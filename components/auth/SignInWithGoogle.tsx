"use client";

import { createClient } from "@/lib/supabase/client";

export function SignInWithGoogle() {
  async function signIn() {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
    >
      Continue with Google
    </button>
  );
}
