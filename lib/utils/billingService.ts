// Billing service for handling Stripe subscriptions
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from '../logger';
import { supabase } from '../supabase';

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      logger.warn('Stripe publishable key not configured');
      return null;
    }
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};

// Subscription tiers and pricing
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['Track up to 50 cards', '10 AI valuations per month', 'Basic portfolio analytics', 'Public portfolio sharing'],
    limits: {
      cards: 50,
      aiValuations: 10,
    },
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 990, // $9.90/month in cents
    features: ['Track up to 200 cards', '100 AI valuations per month', 'Advanced portfolio analytics', 'Real-time price alerts'],
    limits: {
      cards: 200,
      aiValuations: 100,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2900, // $29/month in cents
    features: ['Unlimited cards', 'Unlimited AI valuations', 'Tax export tools', 'Population report data', 'Priority support'],
    limits: {
      cards: -1, // unlimited
      aiValuations: -1, // unlimited
    },
  },
  alpha: {
    id: 'alpha',
    name: 'Alpha',
    price: 9900, // $99/month in cents
    features: ['Everything in Pro', 'API access', 'Early feature access', 'Custom reports', 'Marketplace fee discounts', 'White-label sharing'],
    limits: {
      cards: -1, // unlimited
      aiValuations: -1, // unlimited
    },
  },
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Stripe price IDs (these would come from your Stripe dashboard)
const STRIPE_PRICE_IDS = {
  basic: import.meta.env.VITE_STRIPE_BASIC_PRICE_ID,
  pro: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
  alpha: import.meta.env.VITE_STRIPE_ALPHA_PRICE_ID,
};

// Get user subscription status
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, ai_valuations_used, card_tracking_limit, billing_cycle_start')
    .eq('id', userId)
    .single();

  if (error) {
    logger.error('Error fetching user subscription:', error);
    return null;
  }

  return data;
}

// Check if user has access to a feature
export function hasFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  
  switch (feature) {
    case 'unlimited_cards':
      return tierConfig.limits.cards === -1;
    case 'unlimited_ai_valuations':
      return tierConfig.limits.aiValuations === -1;
    case 'tax_export':
      return ['pro', 'alpha'].includes(tier);
    case 'population_reports':
      return ['pro', 'alpha'].includes(tier);
    case 'api_access':
      return tier === 'alpha';
    case 'marketplace_fee_discount':
      return tier === 'alpha';
    default:
      return false;
  }
}

// Check usage limits
export function checkUsageLimit(tier: SubscriptionTier, type: 'cards' | 'aiValuations', current: number): boolean {
  const limit = SUBSCRIPTION_TIERS[tier].limits[type];
  
  if (limit === -1) return true; // unlimited
  return current < limit;
}

/**
 * Generate a stable idempotency key for checkout (backend should forward as Stripe Idempotency-Key).
 * Uses a 1-minute bucket so retries within the same minute are deduplicated.
 */
function idempotencyKeyForCheckout(userId: string, tier: SubscriptionTier): string {
  const bucket = Math.floor(Date.now() / 60_000);
  return `checkout-${userId}-${tier}-${bucket}`;
}

// Create Stripe checkout session
export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
  successUrl?: string,
  cancelUrl?: string,
  idempotencyKey?: string
) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const priceId = STRIPE_PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Price ID not configured for tier: ${tier}`);
  }

  const key = idempotencyKey ?? idempotencyKeyForCheckout(userId, tier);
  // Create checkout session via Supabase Edge Function or your backend.
  // Backend must send key to Stripe as Idempotency-Key header (see docs/PAYMENT_SECURITY.md).
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      userId,
      priceId,
      successUrl: successUrl || `${window.location.href.split('#')[0]}#/billing?success=true`,
      cancelUrl: cancelUrl || `${window.location.href.split('#')[0]}#/billing?canceled=true`,
      idempotencyKey: key,
    },
  });

  if (error) {
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }

  return data.sessionId;
}

// Redirect to Stripe checkout
export async function redirectToCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const { error } = await (stripe as any).redirectToCheckout({ sessionId });
  if (error) {
    throw new Error(`Failed to redirect to checkout: ${error.message}`);
  }
}

/**
 * Idempotency key for portal session (optional; backend may use for logging/dedup).
 */
function idempotencyKeyForPortal(userId: string): string {
  const bucket = Math.floor(Date.now() / 60_000);
  return `portal-${userId}-${bucket}`;
}

// Create billing portal session
export async function createBillingPortalSession(userId: string, returnUrl?: string, idempotencyKey?: string) {
  const key = idempotencyKey ?? idempotencyKeyForPortal(userId);
  const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
    body: {
      userId,
      returnUrl: returnUrl || `${window.location.href.split('#')[0]}#/billing`,
      idempotencyKey: key,
    },
  });

  if (error) {
    throw new Error(`Failed to create billing portal session: ${error.message}`);
  }

  return data.url;
}

// Update user subscription in database
export async function updateUserSubscription(
  userId: string, 
  subscriptionData: {
    subscription_tier: SubscriptionTier;
    subscription_status: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    trial_end_date?: string;
  }
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...subscriptionData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  return data;
}

// Reset monthly usage counters
export async function resetMonthlyUsage(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ai_valuations_used: 0,
      billing_cycle_start: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reset usage: ${error.message}`);
  }

  return data;
}

// Increment usage counters
export async function incrementUsage(userId: string, type: 'ai_valuations') {
  const { data, error } = await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_usage_type: type,
  });

  if (error) {
    throw new Error(`Failed to increment usage: ${error.message}`);
  }

  return data;
}

// Get subscription pricing for display
export function getSubscriptionPricing() {
  return Object.entries(SUBSCRIPTION_TIERS).map(([key, config]) => ({
    id: key,
    name: config.name,
    price: config.price / 100, // Convert cents to dollars
    features: config.features,
    isFree: config.price === 0,
  }));
}