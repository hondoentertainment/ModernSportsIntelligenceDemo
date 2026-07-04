-- Modern Sports Intelligence: Supabase Schema
-- Run this in the Supabase SQL Editor to create/update the required tables

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  alpha_score INTEGER DEFAULT 0,
  total_portfolio_value NUMERIC DEFAULT 0,
  total_roi NUMERIC DEFAULT 0,
  tier TEXT DEFAULT 'Collector',
  estimated_tax_rate NUMERIC,
  is_tax_resident BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Subscription fields for Stripe billing
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'alpha')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  ai_valuation_limit INTEGER DEFAULT 10, -- Monthly limit for free tier
  card_tracking_limit INTEGER DEFAULT 50, -- Card limit for free tier

  -- Usage tracking
  ai_valuations_used INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory/Cards table
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  player TEXT NOT NULL,
  year INT,
  manufacturer TEXT,
  card_number TEXT,
  set_name TEXT,
  sport TEXT,
  league TEXT,
  is_autographed BOOLEAN DEFAULT FALSE,
  condition TEXT,
  is_graded BOOLEAN DEFAULT FALSE,
  grading_company TEXT,
  grade TEXT,
  cert_number TEXT,
  purchase_price NUMERIC,
  purchase_date DATE,
  current_value NUMERIC,
  last_valuation_date TIMESTAMP WITH TIME ZONE,
  valuation_source TEXT CHECK (valuation_source IN ('ebay-api', 'historical-comps', 'gemini', 'fallback')),
  valuation_timestamp TIMESTAMP WITH TIME ZONE,
  sales_data JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  notes TEXT,
  search_url TEXT,
  tax_basis NUMERIC,
  grading_fees NUMERIC,
  shipping_fees NUMERIC,
  card_group TEXT,
  group_order INT DEFAULT 0,
  pricing_rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist targets
CREATE TABLE IF NOT EXISTS targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  player TEXT NOT NULL,
  card_description TEXT,
  priority TEXT,
  target_price NUMERIC,
  current_market_price NUMERIC,
  valuation_source TEXT CHECK (valuation_source IN ('ebay-api', 'historical-comps', 'gemini', 'fallback')),
  valuation_timestamp TIMESTAMP WITH TIME ZONE,
  sales_data JSONB DEFAULT '[]'::jsonb,
  sport TEXT,
  league TEXT,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  search_url TEXT,
  notes TEXT,
  pricing_rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history snapshots (per-card valuation over time)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  card_id TEXT NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backward-compatible profile column additions for existing databases
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alpha_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_portfolio_value NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_roi NUMERIC DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Collector';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estimated_tax_rate NUMERIC;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_tax_resident BOOLEAN DEFAULT TRUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
CREATE INDEX IF NOT EXISTS targets_user_id_idx ON targets(user_id);
CREATE INDEX IF NOT EXISTS price_history_user_card_idx ON price_history(user_id, card_id);
CREATE INDEX IF NOT EXISTS price_history_recorded_at_idx ON price_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
CREATE INDEX IF NOT EXISTS profiles_is_public_idx ON profiles(is_public);
CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS profiles_billing_cycle_idx ON profiles(billing_cycle_start);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for cards
DROP POLICY IF EXISTS "Users can CRUD their own cards" ON cards;
CREATE POLICY "Users can CRUD their own cards" ON cards
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public cards are viewable for public profiles" ON cards;
CREATE POLICY "Public cards are viewable for public profiles" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = cards.user_id
        AND p.is_public = true
    )
  );

-- RLS Policies for targets
DROP POLICY IF EXISTS "Users can CRUD their own targets" ON targets;
CREATE POLICY "Users can CRUD their own targets" ON targets
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for price_history
DROP POLICY IF EXISTS "Users can CRUD their own price_history" ON price_history;
CREATE POLICY "Users can CRUD their own price_history" ON price_history
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  derived_username TEXT;
BEGIN
  derived_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (new.id, derived_username, COALESCE(new.raw_user_meta_data->>'username', derived_username));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Phase 31: Audit trail table
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_events_user_id_idx ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events(created_at DESC);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own audit events" ON audit_events;
CREATE POLICY "Users can view their own audit events" ON audit_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own audit events" ON audit_events;
CREATE POLICY "Users can insert their own audit events" ON audit_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Phase 43-47: Differentiator foundation

-- Backwards-compatible card and target enrichments
ALTER TABLE cards ADD COLUMN IF NOT EXISTS valuation_confidence NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS valuation_source TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS valuation_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sales_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS insurance_fees NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sale_price NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS sale_date DATE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold'));
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pop_count INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pop_higher INTEGER;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS scarcity_index NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS pop_report JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS grading_roi NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS liquidity_score NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS exit_plan JSONB DEFAULT '{}'::jsonb;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS exit_plan_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS opportunity_score NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS arbitrage_delta NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_vaulted BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS vault_provider TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS vault_asset_id TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS vault_instant_liquidity_price NUMERIC;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE targets ADD COLUMN IF NOT EXISTS opportunity_score NUMERIC;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS arbitrage_delta NUMERIC;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS valuation_source TEXT;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS valuation_timestamp TIMESTAMP WITH TIME ZONE;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS sales_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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

CREATE UNIQUE INDEX IF NOT EXISTS cards_user_identity_idx
  ON cards(user_id, player, year, manufacturer, card_number, set_name);
CREATE UNIQUE INDEX IF NOT EXISTS targets_user_identity_idx
  ON targets(user_id, player, card_description);

ALTER TABLE price_history ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'card';
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS valuation_method TEXT;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS confidence NUMERIC;
ALTER TABLE price_history ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
UPDATE price_history SET entity_id = card_id WHERE entity_id IS NULL;
CREATE INDEX IF NOT EXISTS price_history_entity_idx ON price_history(user_id, entity_type, entity_id, recorded_at DESC);

-- Public-safe views for shared portfolio surfaces
CREATE OR REPLACE VIEW public_profiles_public AS
SELECT
  id,
  username,
  display_name,
  bio,
  avatar_url,
  is_public,
  alpha_score,
  total_portfolio_value,
  total_roi,
  tier,
  created_at
FROM profiles
WHERE is_public = true;

CREATE OR REPLACE VIEW public_cards_public AS
SELECT
  c.id,
  c.user_id,
  c.player,
  c.year,
  c.manufacturer,
  c.card_number,
  c.set_name,
  c.sport,
  c.league,
  c.is_autographed,
  c.condition,
  c.is_graded,
  c.grading_company,
  c.grade,
  c.current_value,
  c.last_valuation_date,
  c.valuation_source,
  c.valuation_timestamp,
  c.sales_data,
  c.image_url,
  c.search_url,
  c.pricing_rationale,
  c.status,
  c.pop_count,
  c.pop_higher,
  c.scarcity_index,
  c.liquidity_score,
  c.opportunity_score,
  c.arbitrage_delta,
  c.created_at
FROM cards c
WHERE EXISTS (
  SELECT 1
  FROM profiles p
  WHERE p.id = c.user_id
    AND p.is_public = true
);

-- Counterparty trust graph
CREATE TABLE IF NOT EXISTS counterparties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  display_name TEXT NOT NULL,
  handle TEXT,
  marketplace_venue TEXT NOT NULL,
  external_reference TEXT,
  verification_tier TEXT DEFAULT 'unverified' CHECK (verification_tier IN ('unverified', 'verified', 'institutional')),
  trust_score NUMERIC DEFAULT 50,
  reputation_score NUMERIC DEFAULT 50,
  successful_deals INTEGER DEFAULT 0,
  disputed_deals INTEGER DEFAULT 0,
  avg_response_hours NUMERIC,
  avg_close_days NUMERIC,
  total_volume_usd NUMERIC DEFAULT 0,
  fraud_flags INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  notes TEXT,
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counterparty_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  source_counterparty_id UUID REFERENCES counterparties(id) ON DELETE CASCADE,
  target_counterparty_id UUID REFERENCES counterparties(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 1,
  trust_delta NUMERIC DEFAULT 0,
  evidence_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  counterparty_id UUID REFERENCES counterparties(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  impact_score NUMERIC NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace + private deal room
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL,
  source_venue TEXT NOT NULL,
  external_listing_id TEXT,
  title TEXT NOT NULL,
  player TEXT NOT NULL,
  card_description TEXT NOT NULL,
  sport TEXT,
  year INT,
  set_name TEXT,
  grade TEXT,
  condition TEXT,
  asking_price NUMERIC NOT NULL,
  estimated_market_value NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'archived')),
  listing_url TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  buyer_counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL,
  seller_counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'expired')),
  message TEXT,
  source_venue TEXT DEFAULT 'private',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('buy', 'sell', 'swap', 'auction')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'negotiating', 'pending_close', 'closed', 'expired')),
  card_player TEXT NOT NULL,
  card_description TEXT NOT NULL,
  card_grade TEXT,
  estimated_value NUMERIC,
  asking_price NUMERIC,
  current_bid NUMERIC DEFAULT 0,
  is_encrypted BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS deal_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('seller', 'buyer', 'broker', 'observer')),
  is_verified BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_room_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
  sender_participant_id UUID REFERENCES deal_room_participants(id) ON DELETE SET NULL,
  sender_display_name TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('message', 'offer', 'counter', 'accept', 'reject', 'system')),
  content TEXT NOT NULL,
  offer_amount NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_room_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES deal_rooms(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalyst market + scenario theater
CREATE TABLE IF NOT EXISTS catalyst_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  asset_id TEXT,
  asset_name TEXT NOT NULL,
  catalyst_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  narrative TEXT,
  confidence NUMERIC NOT NULL,
  expected_move_pct NUMERIC NOT NULL,
  downside_pct NUMERIC DEFAULT 0,
  severity TEXT DEFAULT 'watch' CHECK (severity IN ('watch', 'actionable', 'urgent')),
  trigger_window TEXT,
  source TEXT DEFAULT 'engine',
  linked_listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  linked_deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalyst_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  catalyst_event_id UUID REFERENCES catalyst_events(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  stance TEXT NOT NULL CHECK (stance IN ('bullish', 'neutral', 'defensive')),
  confidence NUMERIC NOT NULL,
  price_target NUMERIC,
  execution_hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenario_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  template_kind TEXT NOT NULL,
  description TEXT,
  inputs JSONB DEFAULT '{}'::jsonb,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenario_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  snapshot_id UUID REFERENCES scenario_snapshots(id) ON DELETE SET NULL,
  scenario_name TEXT NOT NULL,
  scenario_kind TEXT NOT NULL,
  portfolio_value NUMERIC NOT NULL,
  projected_value NUMERIC NOT NULL,
  nav_delta NUMERIC NOT NULL,
  risk_score NUMERIC,
  summary TEXT,
  inputs JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Execution + approvals
CREATE TABLE IF NOT EXISTS execution_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  action_type TEXT NOT NULL CHECK (action_type IN ('buy', 'list', 'cancel', 'counter')),
  venue TEXT NOT NULL,
  asset_id TEXT,
  asset_name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  limit_price NUMERIC NOT NULL,
  max_slippage_pct NUMERIC,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'submitted', 'filled', 'failed', 'cancelled')),
  rationale TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE execution_intents ADD COLUMN IF NOT EXISTS recommendation_id UUID;
ALTER TABLE execution_intents ADD COLUMN IF NOT EXISTS counterparty_id UUID REFERENCES counterparties(id) ON DELETE SET NULL;
ALTER TABLE execution_intents ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL;
ALTER TABLE execution_intents ADD COLUMN IF NOT EXISTS deal_room_id UUID REFERENCES deal_rooms(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS execution_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID REFERENCES execution_intents(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users,
  actor_label TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approve', 'reject')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_fills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID REFERENCES execution_intents(id) ON DELETE CASCADE,
  venue TEXT NOT NULL,
  fill_quantity NUMERIC NOT NULL,
  fill_price NUMERIC NOT NULL,
  fees NUMERIC,
  state TEXT NOT NULL CHECK (state IN ('submitted', 'filled', 'partial', 'failed', 'cancelled')),
  external_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  source TEXT NOT NULL,
  cycle_id TEXT,
  thesis_id TEXT,
  summary TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  risk_assessment TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('draft', 'queued', 'pending_approval', 'approved', 'rejected', 'submitted', 'filled', 'failed', 'cancelled')),
  key_takeaways JSONB DEFAULT '[]'::jsonb,
  agents JSONB DEFAULT '[]'::jsonb,
  execution_plan JSONB DEFAULT '[]'::jsonb,
  linked_intent_id UUID REFERENCES execution_intents(id) ON DELETE SET NULL,
  linked_outcome_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users,
  recommendation_id UUID REFERENCES agent_recommendations(id) ON DELETE CASCADE,
  intent_id UUID REFERENCES execution_intents(id) ON DELETE SET NULL,
  fill_id UUID REFERENCES execution_fills(id) ON DELETE SET NULL,
  outcome_type TEXT NOT NULL CHECK (outcome_type IN ('approved', 'rejected', 'submitted', 'filled', 'partial', 'failed', 'cancelled')),
  amount NUMERIC,
  quantity NUMERIC,
  price NUMERIC,
  venue TEXT,
  rationale TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'agent_recommendations_linked_outcome_fk'
  ) THEN
    ALTER TABLE agent_recommendations
      ADD CONSTRAINT agent_recommendations_linked_outcome_fk
      FOREIGN KEY (linked_outcome_id) REFERENCES agent_outcomes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS counterparties_owner_idx ON counterparties(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS counterparty_edges_owner_idx ON counterparty_edges(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS trust_events_counterparty_idx ON trust_events(counterparty_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_listings_owner_idx ON marketplace_listings(owner_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS listing_offers_listing_idx ON listing_offers(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS deal_rooms_owner_idx ON deal_rooms(owner_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS deal_room_messages_room_idx ON deal_room_messages(room_id, created_at ASC);
CREATE INDEX IF NOT EXISTS catalyst_events_owner_idx ON catalyst_events(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS catalyst_markets_event_idx ON catalyst_markets(catalyst_event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scenario_runs_owner_idx ON scenario_runs(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS execution_intents_owner_idx ON execution_intents(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS execution_fills_intent_idx ON execution_fills(intent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS execution_intents_recommendation_idx ON execution_intents(recommendation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_recommendations_owner_idx ON agent_recommendations(owner_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_recommendations_cycle_idx ON agent_recommendations(cycle_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_outcomes_recommendation_idx ON agent_outcomes(recommendation_id, recorded_at DESC);

ALTER TABLE counterparties ENABLE ROW LEVEL SECURITY;
ALTER TABLE counterparty_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_room_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalyst_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalyst_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_fills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their counterparties" ON counterparties;
CREATE POLICY "Users can manage their counterparties" ON counterparties
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their counterparty edges" ON counterparty_edges;
CREATE POLICY "Users can manage their counterparty edges" ON counterparty_edges
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their trust events" ON trust_events;
CREATE POLICY "Users can manage their trust events" ON trust_events
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their marketplace listings" ON marketplace_listings;
CREATE POLICY "Users can manage their marketplace listings" ON marketplace_listings
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their listing offers" ON listing_offers;
CREATE POLICY "Users can manage their listing offers" ON listing_offers
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their deal rooms" ON deal_rooms;
CREATE POLICY "Users can manage their deal rooms" ON deal_rooms
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Deal room members can view participants" ON deal_room_participants;
CREATE POLICY "Deal room members can view participants" ON deal_room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM deal_room_participants self
      WHERE self.room_id = deal_room_participants.room_id
        AND self.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert room participants they own" ON deal_room_participants;
CREATE POLICY "Users can insert room participants they own" ON deal_room_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM deal_rooms dr
      WHERE dr.id = deal_room_participants.room_id
        AND dr.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deal room members can view messages" ON deal_room_messages;
CREATE POLICY "Deal room members can view messages" ON deal_room_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM deal_room_participants p
      WHERE p.room_id = deal_room_messages.room_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deal room members can insert messages" ON deal_room_messages;
CREATE POLICY "Deal room members can insert messages" ON deal_room_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM deal_room_participants p
      WHERE p.id = deal_room_messages.sender_participant_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Deal room members can view attachments" ON deal_room_attachments;
CREATE POLICY "Deal room members can view attachments" ON deal_room_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM deal_room_participants p
      WHERE p.room_id = deal_room_attachments.room_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their deal room attachments" ON deal_room_attachments;
CREATE POLICY "Users can insert their deal room attachments" ON deal_room_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1
      FROM deal_room_participants p
      WHERE p.room_id = deal_room_attachments.room_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their catalyst events" ON catalyst_events;
CREATE POLICY "Users can manage their catalyst events" ON catalyst_events
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their catalyst markets" ON catalyst_markets;
CREATE POLICY "Users can manage their catalyst markets" ON catalyst_markets
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their scenario snapshots" ON scenario_snapshots;
CREATE POLICY "Users can manage their scenario snapshots" ON scenario_snapshots
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their scenario runs" ON scenario_runs;
CREATE POLICY "Users can manage their scenario runs" ON scenario_runs
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can manage their execution intents" ON execution_intents;
CREATE POLICY "Users can manage their execution intents" ON execution_intents
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can view approvals for their intents" ON execution_approvals;
CREATE POLICY "Users can view approvals for their intents" ON execution_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM execution_intents ei
      WHERE ei.id = execution_approvals.intent_id
        AND ei.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create approvals for their intents" ON execution_approvals;
CREATE POLICY "Users can create approvals for their intents" ON execution_approvals
  FOR INSERT WITH CHECK (
    auth.uid() = actor_user_id
    AND EXISTS (
      SELECT 1
      FROM execution_intents ei
      WHERE ei.id = execution_approvals.intent_id
        AND ei.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view fills for their intents" ON execution_fills;
CREATE POLICY "Users can view fills for their intents" ON execution_fills
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM execution_intents ei
      WHERE ei.id = execution_fills.intent_id
        AND ei.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert fills for their intents" ON execution_fills;
CREATE POLICY "Users can insert fills for their intents" ON execution_fills
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM execution_intents ei
      WHERE ei.id = execution_fills.intent_id
        AND ei.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their agent recommendations" ON agent_recommendations;
CREATE POLICY "Users can manage their agent recommendations" ON agent_recommendations
  FOR ALL USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can view outcomes for their recommendations" ON agent_outcomes;
CREATE POLICY "Users can view outcomes for their recommendations" ON agent_outcomes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM agent_recommendations ar
      WHERE ar.id = agent_outcomes.recommendation_id
        AND ar.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert outcomes for their recommendations" ON agent_outcomes;
CREATE POLICY "Users can insert outcomes for their recommendations" ON agent_outcomes
  FOR INSERT WITH CHECK (
    auth.uid() = owner_user_id
    AND EXISTS (
      SELECT 1
      FROM agent_recommendations ar
      WHERE ar.id = agent_outcomes.recommendation_id
        AND ar.owner_user_id = auth.uid()
    )
  );

-- =============================================================================
-- Generic key-value store for the Data Access Layer (DAL)
-- Used by SupabaseStorageAdapter to persist user data cloud-side.
-- =============================================================================
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
