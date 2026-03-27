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
    weight:
      r.weight === null || r.weight === undefined
        ? null
        : typeof r.weight === "string" && r.weight.trim()
          ? r.weight.trim()
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

export async function saveAnalysis(
  result: SquatAnalysisResult,
  userId?: string | null,
): Promise<void> {
  const supabase = getServiceClient();

  const { error } = await supabase.from("analyses").insert({
    id: result.id,
    result,
    user_id: userId ?? null,
  });

  if (error) {
    throw new Error(`Failed to save analysis: ${error.message}`);
  }
}

const MAX_USER_ANALYSES = 50;

export async function getUserAnalyses(
  userId: string,
): Promise<UserSquatAnalysisListItem[]> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("id, result, created_at, session_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(MAX_USER_ANALYSES);

  if (error) {
    throw new Error(`Failed to list analyses: ${error.message}`);
  }

  const rows = data ?? [];
  return rows.map((row) => {
    const base = normalizeStoredAnalysis(row.result);
    const created =
      row.created_at != null
        ? typeof row.created_at === "string"
          ? row.created_at
          : new Date(row.created_at as string | number | Date).toISOString()
        : base.analyzedAt;
    return {
      id: String((row as { id: unknown }).id ?? base.id),
      session_id:
        (row as { session_id?: unknown }).session_id == null
          ? null
          : String((row as { session_id: unknown }).session_id),
      created_at: created,
      analyzedAt: created,
      overallScore: base.overallScore,
      movementLabel: base.movementLabel,
      weight: base.weight,
    };
  });
}

export type UserSquatAnalysisListItem = {
  id: string;
  session_id: string | null;
  created_at: string;
  analyzedAt: string;
  overallScore: number;
  movementLabel: string;
  weight: string | null;
};

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
