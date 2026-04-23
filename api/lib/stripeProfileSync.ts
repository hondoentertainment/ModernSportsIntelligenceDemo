// @ts-nocheck
/**
 * Sync Stripe subscription state into Supabase `profiles` via REST + service role.
 * Requires checkout/session metadata or profile rows keyed by `stripe_customer_id`.
 *
 * In production, missing Supabase env, failed PATCH, or unmapped price IDs throw so the
 * webhook can release the idempotency claim and Stripe will retry.
 *
 * @see docs/PAYMENT_SECURITY.md
 */

import type Stripe from 'stripe';

function isStripeProfileSyncProduction(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

type SubscriptionTier = 'free' | 'basic' | 'pro' | 'alpha';
type SubscriptionStatusDb = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';

function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL?.replace(/\/$/, '');
}

function serviceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function priceIdEnv(): { basic?: string; pro?: string; alpha?: string } {
  return {
    basic: process.env.STRIPE_BASIC_PRICE_ID || process.env.VITE_STRIPE_BASIC_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID || process.env.VITE_STRIPE_PRO_PRICE_ID,
    alpha: process.env.STRIPE_ALPHA_PRICE_ID || process.env.VITE_STRIPE_ALPHA_PRICE_ID,
  };
}

export function tierFromStripePriceId(priceId: string | undefined): SubscriptionTier | null {
  if (!priceId) return null;
  const { basic, pro, alpha } = priceIdEnv();
  if (basic && priceId === basic) return 'basic';
  if (pro && priceId === pro) return 'pro';
  if (alpha && priceId === alpha) return 'alpha';
  return null;
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatusDb {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'unpaid':
      return 'past_due';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    case 'canceled':
    case 'paused':
    default:
      return 'canceled';
  }
}

async function patchProfiles(filter: string, body: Record<string, unknown>): Promise<void> {
  const url = supabaseUrl();
  const key = serviceKey();
  if (!url || !key) {
    if (isStripeProfileSyncProduction()) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Stripe profile sync');
    }
    return;
  }

  const res = await fetch(`${url}/rest/v1/profiles?${filter}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      ...body,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`profiles PATCH failed (${res.status}): ${detail.slice(0, 300)}`);
  }
}

function userIdFromSession(session: Stripe.Checkout.Session): string | undefined {
  const ref = session.client_reference_id;
  if (ref && ref.length > 0) return ref;
  const m = session.metadata || {};
  const uid = m.user_id || m.supabase_user_id || m.userId;
  return typeof uid === 'string' && uid.length > 0 ? uid : undefined;
}

function userIdFromSubscription(sub: Stripe.Subscription): string | undefined {
  const m = sub.metadata || {};
  const uid = m.user_id || m.supabase_user_id || m.userId;
  return typeof uid === 'string' && uid.length > 0 ? uid : undefined;
}

function customerId(obj: Stripe.Checkout.Session | Stripe.Subscription): string | undefined {
  const c = obj.customer;
  if (typeof c === 'string') return c;
  if (c && typeof c === 'object' && 'id' in c) return (c as { id: string }).id;
  return undefined;
}

export async function syncProfileFromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<void> {
  const mode = session.mode;
  if (mode !== 'subscription') return;

  const subscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription && typeof session.subscription === 'object'
        ? (session.subscription as { id: string }).id
        : undefined;
  if (!subscriptionId) {
    if (isStripeProfileSyncProduction()) {
      throw new Error('checkout.session.completed missing subscription id for mode=subscription');
    }
    return;
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = sub.items.data[0]?.price?.id;
  const tier = tierFromStripePriceId(priceId);
  if (!tier) {
    if (isStripeProfileSyncProduction() && priceId) {
      throw new Error(
        `Stripe price ${priceId} is not mapped; set STRIPE_BASIC_PRICE_ID / STRIPE_PRO_PRICE_ID / STRIPE_ALPHA_PRICE_ID`,
      );
    }
    return;
  }

  const userId = userIdFromSession(session) ?? userIdFromSubscription(sub);
  const cus = customerId(session);

  const patch = {
    subscription_tier: tier,
    subscription_status: mapStripeStatus(sub.status),
    stripe_customer_id: cus ?? customerId(sub),
    stripe_subscription_id: sub.id,
    subscription_start_date: new Date(sub.start_date * 1000).toISOString(),
    subscription_end_date: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : null,
    trial_end_date: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  };

  if (userId) {
    await patchProfiles(`id=eq.${encodeURIComponent(userId)}`, patch);
    return;
  }

  if (cus) {
    await patchProfiles(`stripe_customer_id=eq.${encodeURIComponent(cus)}`, patch);
    return;
  }

  if (isStripeProfileSyncProduction()) {
    throw new Error('checkout.session missing user id and customer id in metadata — cannot update profile');
  }
}

export async function syncProfileFromSubscription(sub: Stripe.Subscription): Promise<void> {
  const userId = userIdFromSubscription(sub);
  const cus = customerId(sub);
  const priceId = sub.items.data[0]?.price?.id;
  const tier = tierFromStripePriceId(priceId);

  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') {
    const freePatch = {
      subscription_tier: 'free' as const,
      subscription_status: 'canceled' as const,
      stripe_subscription_id: null as string | null,
      subscription_end_date: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : new Date().toISOString(),
    };
    if (userId) await patchProfiles(`id=eq.${encodeURIComponent(userId)}`, freePatch);
    else if (cus) await patchProfiles(`stripe_customer_id=eq.${encodeURIComponent(cus)}`, freePatch);
    else if (isStripeProfileSyncProduction()) {
      throw new Error('subscription canceled event missing user id and customer id');
    }
    return;
  }

  if (!tier) {
    if (isStripeProfileSyncProduction() && priceId) {
      throw new Error(
        `Stripe price ${priceId} is not mapped; set STRIPE_BASIC_PRICE_ID / STRIPE_PRO_PRICE_ID / STRIPE_ALPHA_PRICE_ID`,
      );
    }
    return;
  }

  const patch = {
    subscription_tier: tier,
    subscription_status: mapStripeStatus(sub.status),
    stripe_customer_id: cus,
    stripe_subscription_id: sub.id,
    subscription_start_date: new Date(sub.start_date * 1000).toISOString(),
    subscription_end_date: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : null,
    trial_end_date: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  };

  if (userId) {
    await patchProfiles(`id=eq.${encodeURIComponent(userId)}`, patch);
    return;
  }
  if (cus) {
    await patchProfiles(`stripe_customer_id=eq.${encodeURIComponent(cus)}`, patch);
    return;
  }
  if (isStripeProfileSyncProduction()) {
    throw new Error('subscription update missing user id and customer id');
  }
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | undefined {
  const parent = invoice.parent;
  if (parent?.type === 'subscription_details' && parent.subscription_details?.subscription) {
    const s = parent.subscription_details.subscription;
    if (typeof s === 'string') return s;
    if (s && typeof s === 'object' && 'id' in s) return (s as Stripe.Subscription).id;
  }
  const lines = invoice.lines?.data;
  if (lines) {
    for (const line of lines) {
      if (!line.subscription) continue;
      const s = line.subscription;
      if (typeof s === 'string') return s;
      if (s && typeof s === 'object' && 'id' in s) return (s as Stripe.Subscription).id;
    }
  }
  return undefined;
}

/** Refresh `profiles` from the invoice’s subscription (payment succeeded or failed). */
export async function syncProfileFromInvoice(stripe: Stripe, invoice: Stripe.Invoice): Promise<void> {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return;

  const sub = await stripe.subscriptions.retrieve(subId);
  await syncProfileFromSubscription(sub);
}

/** `customer.subscription.deleted` — always downgrade to free (items may be missing on payload). */
export async function syncProfileOnSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const userId = userIdFromSubscription(sub);
  const cus = customerId(sub);
  const freePatch = {
    subscription_tier: 'free' as const,
    subscription_status: 'canceled' as const,
    stripe_subscription_id: null as string | null,
    subscription_end_date: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : new Date().toISOString(),
  };

  if (userId) {
    await patchProfiles(`id=eq.${encodeURIComponent(userId)}`, freePatch);
    return;
  }
  if (cus) {
    await patchProfiles(`stripe_customer_id=eq.${encodeURIComponent(cus)}`, freePatch);
    return;
  }
  if (isStripeProfileSyncProduction()) {
    throw new Error('subscription.deleted missing user id and customer id');
  }
}
