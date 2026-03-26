-- Run in Supabase SQL editor (or Supabase CLI migrate).

ALTER TABLE analyses ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses(user_id);

-- Needed for dashboard list ordering (safe if already present).
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now());
