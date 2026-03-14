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
  purchase_price NUMERIC,
  purchase_date DATE,
  current_value NUMERIC,
  last_valuation_date TIMESTAMP WITH TIME ZONE,
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
