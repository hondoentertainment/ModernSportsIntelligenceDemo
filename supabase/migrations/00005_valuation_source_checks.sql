-- Phase 32 hardening: restrict valuation_source to known values.
-- Keep nullable for backward compatibility; null is handled as fallback in app logic.

ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_valuation_source_check;
ALTER TABLE cards
  ADD CONSTRAINT cards_valuation_source_check
  CHECK (
    valuation_source IS NULL
    OR valuation_source IN ('ebay-api', 'historical-comps', 'gemini', 'fallback')
  );

ALTER TABLE targets DROP CONSTRAINT IF EXISTS targets_valuation_source_check;
ALTER TABLE targets
  ADD CONSTRAINT targets_valuation_source_check
  CHECK (
    valuation_source IS NULL
    OR valuation_source IN ('ebay-api', 'historical-comps', 'gemini', 'fallback')
  );
