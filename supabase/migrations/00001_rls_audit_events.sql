-- Migration: RLS for audit_events (if table exists without RLS)
-- Run via: supabase db push (or manually in SQL Editor)
-- See PRODUCTION_READINESS.md §3.3

-- Ensure audit_events exists and has RLS
ALTER TABLE IF EXISTS audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own audit events" ON audit_events;
CREATE POLICY "Users can CRUD own audit events" ON audit_events
  FOR ALL USING (auth.uid() = user_id);

-- Note: Server-side audit inserts (user_id null) require service_role key; RLS permits only own rows.
