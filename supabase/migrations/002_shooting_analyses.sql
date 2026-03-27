-- Run in Supabase SQL editor if not applied via CLI
CREATE TABLE IF NOT EXISTS shooting_analyses (
  id uuid PRIMARY KEY,
  result jsonb NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS shooting_analyses_user_id_idx ON shooting_analyses(user_id);
