-- Phase 32: Pricing truth layer provenance persistence
-- Stores valuation source + timestamp + optional sales comps payload
-- for both cards and watchlist targets.

ALTER TABLE cards
  ADD COLUMN IF NOT EXISTS valuation_source TEXT,
  ADD COLUMN IF NOT EXISTS valuation_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sales_data JSONB DEFAULT '[]'::jsonb;

ALTER TABLE targets
  ADD COLUMN IF NOT EXISTS valuation_source TEXT,
  ADD COLUMN IF NOT EXISTS valuation_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS sales_data JSONB DEFAULT '[]'::jsonb;

-- Backfill existing rows so source-priority logic is deterministic.
UPDATE cards
SET
  valuation_source = COALESCE(
    valuation_source,
    CASE
      WHEN valuation_confidence IS NOT NULL OR pricing_rationale IS NOT NULL THEN 'gemini'
      ELSE 'fallback'
    END
  ),
  valuation_timestamp = COALESCE(valuation_timestamp, last_valuation_date, updated_at, created_at, NOW())
WHERE valuation_source IS NULL OR valuation_timestamp IS NULL;

UPDATE targets
SET
  valuation_source = COALESCE(
    valuation_source,
    CASE
      WHEN current_market_price IS NOT NULL OR pricing_rationale IS NOT NULL THEN 'gemini'
      ELSE 'fallback'
    END
  ),
  valuation_timestamp = COALESCE(valuation_timestamp, updated_at, created_at, NOW())
WHERE valuation_source IS NULL OR valuation_timestamp IS NULL;

CREATE INDEX IF NOT EXISTS cards_user_valuation_timestamp_idx
  ON cards(user_id, valuation_timestamp DESC);

CREATE INDEX IF NOT EXISTS targets_user_valuation_timestamp_idx
  ON targets(user_id, valuation_timestamp DESC);
