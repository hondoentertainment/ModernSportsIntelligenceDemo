-- Append-only audit history for the signed-in user.
-- Replaces the FOR ALL policy from 00001 so a subject cannot UPDATE or DELETE
-- their own audit_events rows. service_role still bypasses RLS for server inserts.
-- Apply with the other migrations after env sync. Do not run from an app request.

ALTER TABLE IF EXISTS audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own audit events" ON audit_events;
DROP POLICY IF EXISTS "Users can insert own audit events" ON audit_events;
DROP POLICY IF EXISTS "Users can select own audit events" ON audit_events;

CREATE POLICY "Users can insert own audit events"
  ON audit_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own audit events"
  ON audit_events
  FOR SELECT
  USING (auth.uid() = user_id);
