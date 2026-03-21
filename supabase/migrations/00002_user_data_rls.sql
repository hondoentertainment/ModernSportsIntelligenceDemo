-- DAL key-value table + RLS (SupabaseStorageAdapter → public.user_data)
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS

CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID REFERENCES auth.users NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own data" ON user_data;
CREATE POLICY "Users can read their own data"
  ON user_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own data" ON user_data;
CREATE POLICY "Users can insert their own data"
  ON user_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own data" ON user_data;
CREATE POLICY "Users can update their own data"
  ON user_data FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own data" ON user_data;
CREATE POLICY "Users can delete their own data"
  ON user_data FOR DELETE USING (auth.uid() = user_id);
