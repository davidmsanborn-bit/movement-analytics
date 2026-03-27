import { createClient } from "@supabase/supabase-js";
import type { DeadliftAnalysisResult } from "./deadliftTypes";

function normalizeStoredDeadlift(raw: unknown): DeadliftAnalysisResult {
  const r = raw as Partial<DeadliftAnalysisResult>;
  return {
    ...(r as DeadliftAnalysisResult),
    movementLabel:
      typeof r.movementLabel === "string" && r.movementLabel.trim()
        ? r.movementLabel.trim()
        : "Deadlift",
    cameraAngle:
      typeof r.cameraAngle === "string" && r.cameraAngle.trim()
        ? r.cameraAngle.trim()
        : "Unknown angle",
    loadType:
      typeof r.loadType === "string" && r.loadType.trim()
        ? r.loadType.trim()
        : "unknown",
    angleRecommendation:
      r.angleRecommendation == null
        ? null
        : typeof r.angleRecommendation === "string" &&
            r.angleRecommendation.trim()
          ? r.angleRecommendation.trim()
          : null,
    additionalAngleBenefit:
      r.additionalAngleBenefit == null
        ? null
        : typeof r.additionalAngleBenefit === "string" &&
            r.additionalAngleBenefit.trim()
          ? r.additionalAngleBenefit.trim()
          : null,
  };
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, key);
}

export async function saveDeadliftAnalysis(
  result: DeadliftAnalysisResult,
  userId?: string | null,
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("deadlift_analyses").insert({
    id: result.id,
    result,
    user_id: userId ?? null,
  });
  if (error) {
    throw new Error(`Failed to save deadlift analysis: ${error.message}`);
  }
}

const MAX_USER_DEADLIFT_ANALYSES = 50;

export type UserDeadliftAnalysisListItem = {
  id: string;
  session_id: string | null;
  overallScore: number;
  movementLabel: string;
  analyzedAt: string;
  created_at: string;
  weight: string | null;
};

export async function getUserDeadliftAnalyses(
  userId: string,
): Promise<UserDeadliftAnalysisListItem[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("deadlift_analyses")
    .select("id, result, created_at, session_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_USER_DEADLIFT_ANALYSES);

  if (error) {
    throw new Error(`Failed to list deadlift analyses: ${error.message}`);
  }

  const rows = data ?? [];
  return rows.map((row) => {
    const r = normalizeStoredDeadlift(row.result);
    const created_at =
      row.created_at != null
        ? typeof row.created_at === "string"
          ? row.created_at
          : new Date(row.created_at as string | number | Date).toISOString()
        : r.analyzedAt;
    return {
      id: row.id,
      session_id: row.session_id == null ? null : String(row.session_id),
      overallScore: r.overallScore,
      movementLabel: r.movementLabel,
      analyzedAt: r.analyzedAt,
      created_at,
      weight: r.weight,
    };
  });
}

export async function fetchDeadliftAnalysis(
  id: string,
): Promise<DeadliftAnalysisResult | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("deadlift_analyses")
    .select("result")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch deadlift analysis: ${error.message}`);
  }

  return normalizeStoredDeadlift(data.result);
}
