-- Phase 1 platform spine: durable price_history for migration-only deploys,
-- user-scoped market_events (catalyst / import / manual log), and Stripe webhook idempotency.
-- Safe to re-run: IF NOT EXISTS + DROP POLICY IF EXISTS

-- ─── price_history (aligns with lib/supabaseData.ts inserts) ───────────────
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE price_history ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'card';
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS valuation_method TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS confidence NUMERIC;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE price_history SET entity_id = card_id WHERE entity_id IS NULL;

CREATE INDEX IF NOT EXISTS price_history_user_card_idx ON price_history(user_id, card_id);
CREATE INDEX IF NOT EXISTS price_history_recorded_at_idx ON price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS price_history_entity_idx ON price_history(user_id, entity_type, entity_id, recorded_at DESC);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own price_history" ON price_history;
CREATE POLICY "Users can CRUD their own price_history"
  ON price_history FOR ALL USING (auth.uid() = user_id);

-- ─── market_events (user catalyst feed; CSV/import/catalyst UI) ───────────
CREATE TABLE IF NOT EXISTS market_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  body TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS market_events_user_occurred_idx ON market_events(user_id, occurred_at DESC);

ALTER TABLE market_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD their own market_events" ON market_events;
CREATE POLICY "Users can CRUD their own market_events"
  ON market_events FOR ALL USING (auth.uid() = user_id);

-- ─── Stripe webhook deduplication (service_role only in practice) ─────────
CREATE TABLE IF NOT EXISTS stripe_processed_events (
  stripe_event_id TEXT PRIMARY KEY,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE stripe_processed_events ENABLE ROW LEVEL SECURITY;
-- RLS on with no anon/authenticated policies: clients cannot access; service_role bypasses.
