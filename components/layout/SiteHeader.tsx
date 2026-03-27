"use client";

import { signOut } from "@/app/actions/auth";
import Link from "next/link";

type HeaderUser = {
  id: string;
  email: string | null;
  fullName?: string | null;
  metadataName?: string | null;
};

function toTitleCase(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function getFirstName(user: HeaderUser): string {
  const full = typeof user.fullName === "string" ? user.fullName.trim() : "";
  const meta =
    typeof user.metadataName === "string" ? user.metadataName.trim() : "";

  const nameSource = full || meta;
  if (nameSource) {
    const firstWord = nameSource.split(/\s+/)[0] ?? "";
    if (firstWord) return toTitleCase(firstWord);
  }

  const email = user.email ?? "";
  const local = email.includes("@") ? email.split("@")[0] ?? "" : "";
  if (!local) return "Athlete";

  // Prefer the segment before the first dot: david.sanborn@example.com -> david
  const beforeDot = local.split(".")[0] ?? "";
  const cleaned = beforeDot.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "Athlete";

  // If there is no dot, fall back to the first 5 chars (so davidmsanborn -> David).
  const segmentSource = local.includes(".") ? cleaned : cleaned.slice(0, 5);
  const segment = segmentSource.slice(0, 12);
  return toTitleCase(segment);
}

type Props = {
  user: HeaderUser | null;
};

export function SiteHeader({ user }: Props) {
  return (
    <header className="border-b border-[var(--border)] bg-[#ffffff]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-sans text-sm font-semibold tracking-tight text-[var(--text-primary)]"
        >
          Movement Analytics
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          {/* Desktop/tablet: show dashboard + sign-in/out + user name.
              Mobile: keep it minimal (logo + Get Started only). */}
          <div className="hidden items-center gap-4 sm:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="transition hover:text-black">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--accent-foreground)]"
                    aria-hidden
                  >
                    {getFirstName(user).charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[180px] truncate text-xs text-[var(--text-tertiary)]">
                    {getFirstName(user)}
                  </span>
                </div>
                <form action={signOut} className="inline">
                  <button
                    type="submit"
                    className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="transition hover:text-black">
                Sign in
              </Link>
            )}
          </div>

          <Link
            href="/analyze"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] sm:h-9 sm:px-5"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
