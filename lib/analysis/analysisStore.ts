import { createClient } from "@supabase/supabase-js";
import type { SquatAnalysisResult } from "./types";

function normalizeStoredAnalysis(raw: unknown): SquatAnalysisResult {
  const r = raw as Partial<SquatAnalysisResult> & {
    id?: string;
    movementLabel?: unknown;
    cameraAngle?: unknown;
  };
  const angleRec = r.angleRecommendation;
  const angleBenefit = r.additionalAngleBenefit;

  return {
    ...(r as SquatAnalysisResult),
    movementLabel:
      typeof r.movementLabel === "string" && r.movementLabel.trim()
        ? r.movementLabel.trim()
        : "Squat",
    cameraAngle:
      typeof r.cameraAngle === "string" && r.cameraAngle.trim()
        ? r.cameraAngle.trim()
        : "Unknown angle",
    loadType:
      typeof r.loadType === "string" && r.loadType.trim()
        ? r.loadType.trim()
        : "unknown",
    angleRecommendation:
      angleRec == null
        ? null
        : typeof angleRec === "string" && angleRec.trim()
          ? angleRec.trim()
          : null,
    additionalAngleBenefit:
      angleBenefit == null
        ? null
        : typeof angleBenefit === "string" && angleBenefit.trim()
          ? angleBenefit.trim()
          : null,
  };
}

/** Safe preview for logs — never log full secrets. */
function maskUrl(url: string | undefined): string {
  if (!url) return "(not set)";
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host.length <= 12) return `${u.protocol}//${host}`;
    return `${u.protocol}//${host.slice(0, 4)}…${host.slice(-10)}`;
  } catch {
    return url.length <= 12 ? "(invalid URL)" : `${url.slice(0, 6)}…${url.slice(-4)}`;
  }
}

function maskKey(key: string | undefined): string {
  if (!key) return "(not set)";
  if (key.length <= 10) return `(set, length ${key.length})`;
  return `${key.slice(0, 6)}…${key.slice(-4)} (length ${key.length})`;
}

let supabaseEnvLogged = false;

function logSupabaseEnvOnce(): void {
  if (supabaseEnvLogged) return;
  supabaseEnvLogged = true;
  if (typeof window !== "undefined") return;

  console.log(
    "[analysisStore] NEXT_PUBLIC_SUPABASE_URL:",
    maskUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  );
  console.log(
    "[analysisStore] SUPABASE_SERVICE_ROLE_KEY:",
    maskKey(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

// Server-only: first import of this module (e.g. first API route that touches Supabase)
logSupabaseEnvOnce();

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

export async function saveAnalysis(result: SquatAnalysisResult): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from("analyses")
    .insert({ id: result.id, result });

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}

export async function fetchAnalysis(
  id: string,
): Promise<SquatAnalysisResult | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("result")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // row not found
    throw new Error(`Failed to fetch analysis: ${error.message}`);
  }

  return normalizeStoredAnalysis(data.result);
}
