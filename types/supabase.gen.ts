/**
 * Generated from supabase/migrations + supabase-schema.sql.
 * Regenerate with `npm run types:supabase` when the Supabase CLI is linked.
 *
 * @see docs/SUPABASE_TYPES.md
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'alpha';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
export type ValuationSource = 'ebay-api' | 'historical-comps' | 'gemini' | 'fallback';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          is_public: boolean | null;
          alpha_score: number | null;
          total_portfolio_value: number | null;
          total_roi: number | null;
          tier: string | null;
          estimated_tax_rate: number | null;
          is_tax_resident: boolean | null;
          created_at: string | null;
          subscription_tier: SubscriptionTier | null;
          subscription_status: SubscriptionStatus | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          trial_end_date: string | null;
          ai_valuation_limit: number | null;
          card_tracking_limit: number | null;
          ai_valuations_used: number | null;
          billing_cycle_start: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      user_data: {
        Row: {
          user_id: string;
          key: string;
          value: Json;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          key: string;
          value?: Json;
          updated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['user_data']['Insert']>;
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          user_id: string;
          player: string;
          year: number | null;
          manufacturer: string | null;
          card_number: string | null;
          set_name: string | null;
          sport: string | null;
          league: string | null;
          is_autographed: boolean | null;
          condition: string | null;
          is_graded: boolean | null;
          grading_company: string | null;
          grade: string | null;
          purchase_price: number | null;
          purchase_date: string | null;
          current_value: number | null;
          last_valuation_date: string | null;
          valuation_source: ValuationSource | null;
          valuation_timestamp: string | null;
          sales_data: Json | null;
          image_url: string | null;
          notes: string | null;
          search_url: string | null;
          tax_basis: number | null;
          grading_fees: number | null;
          shipping_fees: number | null;
          card_group: string | null;
          group_order: number | null;
          pricing_rationale: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['cards']['Row']> & {
          user_id: string;
          player: string;
        };
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
        Relationships: [];
      };
      targets: {
        Row: {
          id: string;
          user_id: string;
          player: string;
          card_description: string | null;
          priority: string | null;
          target_price: number | null;
          current_market_price: number | null;
          valuation_source: ValuationSource | null;
          valuation_timestamp: string | null;
          sales_data: Json | null;
          sport: string | null;
          league: string | null;
          status: string | null;
          image_url: string | null;
          search_url: string | null;
          notes: string | null;
          pricing_rationale: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['targets']['Row']> & {
          user_id: string;
          player: string;
        };
        Update: Partial<Database['public']['Tables']['targets']['Insert']>;
        Relationships: [];
      };
      price_history: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          value: number;
          recorded_at: string;
          entity_id: string | null;
          entity_type: string | null;
          source: string | null;
          valuation_method: string | null;
          confidence: number | null;
          metadata: Json;
        };
        Insert: Partial<Database['public']['Tables']['price_history']['Row']> & {
          user_id: string;
          card_id: string;
          value: number;
        };
        Update: Partial<Database['public']['Tables']['price_history']['Insert']>;
        Relationships: [];
      };
      market_events: {
        Row: {
          id: string;
          user_id: string;
          kind: string;
          title: string;
          body: string | null;
          payload: Json;
          occurred_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['market_events']['Row']> & {
          user_id: string;
          kind: string;
          title: string;
          occurred_at: string;
        };
        Update: Partial<Database['public']['Tables']['market_events']['Insert']>;
        Relationships: [];
      };
      stripe_processed_events: {
        Row: {
          stripe_event_id: string;
          received_at: string;
        };
        Insert: {
          stripe_event_id: string;
          received_at?: string;
        };
        Update: Partial<Database['public']['Tables']['stripe_processed_events']['Insert']>;
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          user_id: string | null;
          category: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: {
          user_id?: string | null;
          category: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['audit_events']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
