/**
 * Stripe webhook deduplication via Supabase (service role).
 * Insert-first claim on `stripe_processed_events` (PK on stripe_event_id) closes TOCTOU:
 * only one concurrent handler can insert; others get 409 and skip processing.
 *
 * On handler failure after claim, release the row so Stripe retries can re-process.
 *
 * @see docs/PAYMENT_SECURITY.md §(b)
 */

import { apiLogger } from './logger.js';

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
});

function supabaseRestBase(): string | null {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return url;
}

function serviceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

export function isStripeIdempotencyConfigured(): boolean {
  return !!(supabaseRestBase() && serviceRoleKey());
}

function failClosedProd(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.STRIPE_WEBHOOK_FAIL_CLOSED === '1'
  );
}

export type StripeEventClaimResult = 'claimed' | 'duplicate' | 'misconfigured' | 'error';

/**
 * Try to insert the event id first. Claimed = we own processing; duplicate = another worker or prior delivery.
 */
export async function claimStripeWebhookEvent(eventId: string): Promise<StripeEventClaimResult> {
  const url = supabaseRestBase();
  const key = serviceRoleKey();
  if (!url || !key) {
    if (failClosedProd()) {
      apiLogger.error('Stripe idempotency: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required in production');
      return 'misconfigured';
    }
    return 'claimed';
  }

  const res = await fetch(`${url}/rest/v1/stripe_processed_events`, {
    method: 'POST',
    headers: {
      ...headers(key),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ stripe_event_id: eventId }),
  });

  if (res.ok) return 'claimed';
  if (res.status === 409) return 'duplicate';

  const text = await res.text().catch(() => '');
  apiLogger.error('claimStripeWebhookEvent failed', { status: res.status, text });
  return failClosedProd() ? 'error' : 'claimed';
}

/** Remove claim so a failed handler can be retried by Stripe. */
export async function releaseStripeWebhookEventClaim(eventId: string): Promise<void> {
  const url = supabaseRestBase();
  const key = serviceRoleKey();
  if (!url || !key) return;

  const res = await fetch(
    `${url}/rest/v1/stripe_processed_events?stripe_event_id=eq.${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: headers(key),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    apiLogger.warn('releaseStripeWebhookEventClaim failed', { status: res.status, text });
  }
}

/** @deprecated Use claimStripeWebhookEvent; kept for tests / callers still on check-then-mark. */
export async function wasStripeEventProcessed(eventId: string): Promise<boolean> {
  const url = supabaseRestBase();
  const key = serviceRoleKey();
  if (!url || !key) return false;

  const qs = `stripe_event_id=eq.${encodeURIComponent(eventId)}&select=stripe_event_id`;
  const res = await fetch(`${url}/rest/v1/stripe_processed_events?${qs}`, {
    headers: headers(key),
  });
  if (!res.ok) return false;
  const rows: unknown = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

/** @deprecated Prefer claimStripeWebhookEvent at handler start. Kept for legacy callers / tests. */
export async function markStripeEventProcessed(eventId: string): Promise<void> {
  const r = await claimStripeWebhookEvent(eventId);
  if (r === 'claimed' || r === 'duplicate') return;
  throw new Error(`markStripeEventProcessed failed: ${r}`);
}
