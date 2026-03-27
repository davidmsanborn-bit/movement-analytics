import { createClient } from "@supabase/supabase-js";
import type { ShootingAnalysisResult } from "./shootingTypes";

function normalizeStoredShooting(raw: unknown): ShootingAnalysisResult {
  const r = raw as Partial<ShootingAnalysisResult>;
  return {
    ...(r as ShootingAnalysisResult),
    shotType:
      typeof r.shotType === "string" && r.shotType.trim()
        ? r.shotType.trim()
        : "unknown",
    hand:
      typeof r.hand === "string" && r.hand.trim() ? r.hand.trim() : "unknown",
    cameraAngle:
      typeof r.cameraAngle === "string" && r.cameraAngle.trim()
        ? r.cameraAngle.trim()
        : "Unknown angle",
    loadType:
      typeof r.loadType === "string" && r.loadType.trim()
        ? r.loadType.trim()
        : "bodyweight",
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

export async function saveShootingAnalysis(
  result: ShootingAnalysisResult,
  userId?: string | null,
): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("shooting_analyses").insert({
    id: result.id,
    result,
    user_id: userId ?? null,
  });
  if (error) {
    throw new Error(`Failed to save shooting analysis: ${error.message}`);
  }
}

export async function fetchShootingAnalysis(
  id: string,
): Promise<ShootingAnalysisResult | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("shooting_analyses")
    .select("result")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch shooting analysis: ${error.message}`);
  }

  return normalizeStoredShooting(data.result);
}
