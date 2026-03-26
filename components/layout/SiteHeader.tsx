import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

function userInitial(user: User): string {
  const email = user.email;
  if (email && email.length > 0) {
    return email[0]!.toUpperCase();
  }
  const name = user.user_metadata?.full_name;
  if (typeof name === "string" && name.trim().length > 0) {
    return name.trim()[0]!.toUpperCase();
  }
  return "?";
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-white/10 bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-white"
        >
          Movement Analytics
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 text-sm text-zinc-400 sm:gap-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="transition hover:text-white"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white"
                  aria-hidden
                >
                  {userInitial(user)}
                </span>
                <span className="hidden max-w-[160px] truncate text-xs text-zinc-500 sm:inline">
                  {user.email ?? user.id}
                </span>
              </div>
              <form action={signOut} className="inline">
                <button
                  type="submit"
                  className="text-zinc-400 transition hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="transition hover:text-white">
              Sign in
            </Link>
          )}
          <Link
            href="/analyze/squat"
            className="text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
          >
            Analyze squat
          </Link>
        </nav>
      </div>
    </header>
  );
}
