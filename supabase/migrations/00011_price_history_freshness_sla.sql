-- Phase B freshness-SLA columns on price_history.
-- FILE ONLY in this engineering PR — do not apply from the agent.
-- Owner: apply after #77 Vercel/GitHub env sync on project vhbsokjqchaafluimgjh
-- (restore is already complete). Safe to re-run: IF NOT EXISTS.
--
-- Base table landed in 00006_price_history_market_events_stripe.sql.
-- These columns record SLA metadata next to each snapshot so live-tape
-- freshness can be queried once eBay keys are on. No live flags flipped here.

ALTER TABLE price_history ADD COLUMN IF NOT EXISTS freshness_hours NUMERIC;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS sla_band TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS tape_window_days INTEGER;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS comps_count INTEGER;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS source_tier TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'price_history_sla_band_check'
  ) THEN
    ALTER TABLE price_history
      ADD CONSTRAINT price_history_sla_band_check
      CHECK (sla_band IS NULL OR sla_band IN ('fresh', 'aging', 'stale', 'unknown'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS price_history_sla_band_idx
  ON price_history(user_id, sla_band, recorded_at DESC);

COMMENT ON COLUMN price_history.sla_band IS
  'Freshness SLA band (fresh/aging/stale/unknown). Policy in lib/pricing/freshnessSla.ts.';
COMMENT ON COLUMN price_history.source_tier IS
  'Pricing-truth source tier: ebay-sold-comps | portfolio-historical-comps | ai-estimate-fallback.';
