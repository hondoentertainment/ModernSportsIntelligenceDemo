-- Database functions for billing and usage tracking

-- Function to increment usage counters with limits
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID, p_usage_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
  can_increment BOOLEAN := false;
BEGIN
  -- Get user profile
  SELECT subscription_tier, ai_valuations_used, ai_valuation_limit 
  INTO user_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Check if user exists
  IF user_profile IS NULL THEN
    RETURN false;
  END IF;

  -- Check usage limits based on type
  CASE p_usage_type
    WHEN 'ai_valuations' THEN
      -- Free tier: check limit, paid tiers: unlimited
      IF user_profile.subscription_tier = 'free' THEN
        can_increment := user_profile.ai_valuations_used < user_profile.ai_valuation_limit;
      ELSE
        can_increment := true; -- Paid tiers have unlimited AI valuations
      END IF;

      IF can_increment THEN
        UPDATE profiles
        SET ai_valuations_used = ai_valuations_used + 1,
            updated_at = NOW()
        WHERE id = p_user_id;
      END IF;

    WHEN 'cards' THEN
      -- For card tracking, we'll check limits at the application level
      -- since it requires counting existing cards
      can_increment := true;

    ELSE
      RAISE EXCEPTION 'Invalid usage type: %', p_usage_type;
  END CASE;

  RETURN can_increment;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can add more cards
CREATE OR REPLACE FUNCTION can_add_card(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
  card_count INTEGER;
BEGIN
  -- Get user profile
  SELECT subscription_tier, card_tracking_limit 
  INTO user_profile
  FROM profiles
  WHERE id = p_user_id;

  -- Get current card count
  SELECT COUNT(*) INTO card_count
  FROM cards
  WHERE user_id = p_user_id;

  -- Check limits
  IF user_profile.subscription_tier = 'free' THEN
    RETURN card_count < user_profile.card_tracking_limit;
  ELSE
    RETURN true; -- Paid tiers have unlimited cards
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get card count for a user
CREATE OR REPLACE FUNCTION get_user_card_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM cards WHERE user_id = p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (can be called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage_for_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET ai_valuations_used = 0,
      billing_cycle_start = NOW(),
      updated_at = NOW()
  WHERE id = p_user_id
    AND billing_cycle_start <= NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();