import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getUserAnalyses } from "@/lib/analysis/analysisStore";
import { getUserDeadliftAnalyses } from "@/lib/analysis/deadliftAnalysisStore";
import { getUserShootingAnalyses } from "@/lib/analysis/shootingAnalysisStore";
import { getUserSessions } from "@/lib/analysis/sessionStore";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

function toNameCase(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function deriveFirstName(user: User) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name.trim()
        : "";

  if (fullName.length > 0) {
    const first = fullName.split(/\s+/)[0] ?? "";
    if (first) return toNameCase(first);
  }

  const email = user.email ?? "";
  const local = email.includes("@") ? (email.split("@")[0] ?? "") : "";
  if (!local) return "Athlete";

  const firstPart = local.split(/[._-]/)[0] ?? "";
  if (firstPart.length > 0) {
    if (firstPart.length > 10 && !/[._-]/.test(local)) {
      return "Athlete";
    }
    return toNameCase(firstPart.slice(0, 10));
  }

  return "Athlete";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = deriveFirstName(user);
  const [
    squatAnalyses,
    shootingAnalyses,
    deadliftAnalyses,
    squatSessions,
    shootingSessions,
    deadliftSessions,
  ] = await Promise.all([
    getUserAnalyses(user.id),
    getUserShootingAnalyses(user.id),
    getUserDeadliftAnalyses(user.id),
    getUserSessions(user.id, "squat"),
    getUserSessions(user.id, "shooting"),
    getUserSessions(user.id, "deadlift"),
  ]);

  return (
    <DashboardClient
      firstName={firstName}
      squatAnalyses={squatAnalyses}
      shootingAnalyses={shootingAnalyses}
      deadliftAnalyses={deadliftAnalyses}
      squatSessions={squatSessions}
      shootingSessions={shootingSessions}
      deadliftSessions={deadliftSessions}
    />
  );
}
