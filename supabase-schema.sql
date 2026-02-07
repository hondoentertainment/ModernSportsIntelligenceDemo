-- Modern Sports Intelligence: Supabase Schema
-- Run this in the Supabase SQL Editor to create the required tables

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON cards(user_id);
CREATE INDEX IF NOT EXISTS targets_user_id_idx ON targets(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for cards
CREATE POLICY "Users can CRUD their own cards" ON cards
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for targets
CREATE POLICY "Users can CRUD their own targets" ON targets
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
