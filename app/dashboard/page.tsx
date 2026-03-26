import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getUserAnalyses } from "@/lib/analysis/analysisStore";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function formatFirstName(emailOrId: string) {
  const base = emailOrId.includes("@")
    ? emailOrId.split("@")[0] ?? emailOrId
    : emailOrId;
  if (!base) return "Athlete";
  return base.charAt(0).toUpperCase() + base.slice(1);
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
  const firstName = formatFirstName(email);
  const analyses = await getUserAnalyses(user.id);
  return <DashboardClient firstName={firstName} analyses={analyses} />;
}
