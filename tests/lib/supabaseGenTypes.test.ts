import { describe, it, expect } from 'vitest';
import type { Database, Tables } from '../../types/supabase.gen';

describe('supabase.gen types', () => {
  it('defines core production tables', () => {
    type Profile = Tables<'profiles'>;
    type UserData = Tables<'user_data'>;
    const _profile: Profile = {
      id: 'uuid',
      username: null,
      display_name: null,
      bio: null,
      avatar_url: null,
      is_public: null,
      alpha_score: null,
      total_portfolio_value: null,
      total_roi: null,
      tier: null,
      estimated_tax_rate: null,
      is_tax_resident: null,
      created_at: null,
      subscription_tier: 'free',
      subscription_status: 'active',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_start_date: null,
      subscription_end_date: null,
      trial_end_date: null,
      ai_valuation_limit: null,
      card_tracking_limit: null,
      ai_valuations_used: null,
      billing_cycle_start: null,
      updated_at: null,
    };
    const _data: UserData = {
      user_id: 'uuid',
      key: 'msi_test',
      value: {},
      updated_at: null,
    };
    expect(_profile.subscription_tier).toBe('free');
    expect(_data.key).toBe('msi_test');
  });

  it('Database public schema is structurally valid', () => {
    const tables: (keyof Database['public']['Tables'])[] = [
      'profiles',
      'user_data',
      'cards',
      'targets',
      'price_history',
      'market_events',
      'stripe_processed_events',
      'audit_events',
    ];
    expect(tables).toHaveLength(8);
  });
});
