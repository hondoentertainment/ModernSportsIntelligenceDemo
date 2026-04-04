/**
 * Stripe webhook deduplication via Supabase (service role).
 * Check-before / mark-after successful handling so retries re-run if processing failed.
 *
 * @see docs/PAYMENT_SECURITY.md §(b)
 */

const headers = (key: string) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
});

export async function wasStripeEventProcessed(eventId: string): Promise<boolean> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;

  const qs = `stripe_event_id=eq.${encodeURIComponent(eventId)}&select=stripe_event_id`;
  const res = await fetch(`${url}/rest/v1/stripe_processed_events?${qs}`, {
    headers: headers(key),
  });
  if (!res.ok) return false;
  const rows: unknown = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

export async function markStripeEventProcessed(eventId: string): Promise<void> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  const res = await fetch(`${url}/rest/v1/stripe_processed_events`, {
    method: 'POST',
    headers: {
      ...headers(key),
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ stripe_event_id: eventId }),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => '');
    throw new Error(`markStripeEventProcessed failed: ${res.status} ${text}`);
  }
}
