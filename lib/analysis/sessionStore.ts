import { createClient } from "@supabase/supabase-js";

export type Session = {
  id: string;
  movement_type: "squat" | "shooting";
  name: string | null;
  started_at: string;
  clip_count: number;
  avg_score: number | null;
  best_score: number | null;
};

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

export async function findOrCreateSession(
  userId: string,
  movementType: "squat" | "shooting",
): Promise<string> {
  const supabase = getServiceClient();
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: existing, error: existingError } = await supabase
    .from("sessions")
    .select("id, started_at")
    .eq("user_id", userId)
    .eq("movement_type", movementType)
    .gt("started_at", cutoff)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to find session: ${existingError.message}`);
  }
  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("sessions")
    .insert({
      user_id: userId,
      movement_type: movementType,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(`Failed to create session: ${createError.message}`);
  }

  return created.id as string;
}

export async function updateSessionStats(sessionId: string): Promise<void> {
  const supabase = getServiceClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from("sessions")
    .select("id, movement_type")
    .eq("id", sessionId)
    .single();

  if (sessionError) {
    throw new Error(`Failed to fetch session: ${sessionError.message}`);
  }

  const movementType = sessionRow.movement_type as "squat" | "shooting";

  const table = movementType === "shooting" ? "shooting_analyses" : "analyses";
  const { data: clips, error: clipsError } = await supabase
    .from(table)
    .select("result")
    .eq("session_id", sessionId)
    .limit(200);

  if (clipsError) {
    throw new Error(`Failed to list session clips: ${clipsError.message}`);
  }

  const scores: number[] = [];
  for (const row of clips ?? []) {
    const r = (row as { result?: unknown }).result as { overallScore?: unknown } | undefined;
    const n = typeof r?.overallScore === "number" ? r.overallScore : Number(r?.overallScore);
    if (Number.isFinite(n)) scores.push(Math.max(0, Math.min(100, Math.round(n))));
  }

  const clip_count = scores.length;
  const best_score = clip_count ? Math.max(...scores) : null;
  const avg_score = clip_count
    ? Number((scores.reduce((a, b) => a + b, 0) / clip_count).toFixed(2))
    : null;

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      clip_count,
      avg_score,
      best_score,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (updateError) {
    throw new Error(`Failed to update session stats: ${updateError.message}`);
  }
}

export async function getUserSessions(
  userId: string,
  movementType?: "squat" | "shooting",
): Promise<Session[]> {
  const supabase = getServiceClient();

  let q = supabase
    .from("sessions")
    .select("id, movement_type, name, started_at, clip_count, avg_score, best_score")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(20);

  if (movementType) {
    q = q.eq("movement_type", movementType);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Failed to list sessions: ${error.message}`);
  }

  const rows = (data ?? []) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: String(r.id),
    movement_type: (r.movement_type === "shooting" ? "shooting" : "squat") as
      | "squat"
      | "shooting",
    name: typeof r.name === "string" && r.name.trim() ? r.name.trim() : null,
    started_at: String(r.started_at),
    clip_count: Number(r.clip_count ?? 0) || 0,
    avg_score:
      r.avg_score === null || r.avg_score === undefined
        ? null
        : Number.isFinite(Number(r.avg_score))
          ? Number(r.avg_score)
          : null,
    best_score:
      r.best_score === null || r.best_score === undefined
        ? null
        : Number.isFinite(Number(r.best_score))
          ? Number(r.best_score)
          : null,
  }));
}

