"use client";

import { signOut } from "@/app/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderUser = {
  id: string;
  email: string | null;
};

function userInitial(user: HeaderUser): string {
  const email = user.email;
  if (email && email.length > 0) {
    return email[0]!.toUpperCase();
  }
  return "?";
}

type Props = {
  user: HeaderUser | null;
};

export function SiteHeader({ user }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const headerClass = isHome
    ? "border-b border-transparent bg-transparent"
    : "border-b border-[var(--border)] bg-[#ffffff]";

  const titleClass = isHome
    ? "font-sans text-sm font-semibold tracking-tight text-white"
    : "font-sans text-sm font-semibold tracking-tight text-[var(--text-primary)]";

  const navClass = isHome
    ? "flex flex-wrap items-center justify-end gap-4 text-sm text-white sm:gap-6"
    : "flex flex-wrap items-center justify-end gap-4 text-sm text-[var(--text-secondary)] sm:gap-6";

  return (
    <header className={headerClass} style={isHome ? { background: "transparent" } : undefined}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className={titleClass}>
          Movement Analytics
        </Link>
        <nav className={navClass}>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={isHome ? "!text-white transition hover:!text-white/80" : "transition hover:text-black"}
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--accent-foreground)]"
                  aria-hidden
                >
                  {userInitial(user)}
                </span>
                <span
                  className={
                    isHome
                      ? "hidden max-w-[160px] truncate text-xs !text-white sm:inline"
                      : "hidden max-w-[160px] truncate text-xs text-[var(--text-tertiary)] sm:inline"
                  }
                >
                  {user.email ?? user.id}
                </span>
              </div>
              <form action={signOut} className="inline">
                <button
                  type="submit"
                  className={
                    isHome
                      ? "!text-white transition hover:!text-white/80"
                      : "text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  }
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={isHome ? "!text-white transition hover:!text-white/80" : "transition hover:text-black"}
            >
              Sign in
            </Link>
          )}
          <Link
            href="/analyze/squat"
            className={isHome ? "!text-[#00ff88] transition hover:brightness-110" : "text-[var(--accent)] transition hover:text-[var(--accent-hover)]"}
          >
            Analyze squat
          </Link>
        </nav>
      </div>
    </header>
  );
}
