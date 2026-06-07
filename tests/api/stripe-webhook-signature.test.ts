import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'node:crypto';

/**
 * Regression tests for Stripe webhook signature verification.
 *
 * The whole point of this file is to exercise the REAL
 * `stripe.webhooks.constructEvent` path inside `api/stripe-webhook.ts`. We
 * therefore deliberately do NOT mock the `stripe` package — we sign payloads
 * with the same HMAC-SHA256 algorithm Stripe's SDK uses on the verification
 * side and hand them to the handler over a `Request`.
 *
 * Mocked seams (kept tight so we don't accidentally bypass the signature
 * check):
 *
 * - `api/lib/logger`: silenced so failed-signature warnings don't pollute the
 *   test output.
 * - `globalThis.fetch`: only stubbed in the idempotency test, where we need
 *   to simulate `claimStripeWebhookEvent` returning `claimed` then
 *   `duplicate` from Supabase REST. The signature-only tests rely on the
 *   handler's non-prod fallback (`'claimed'` when Supabase env is unset).
 *
 * @see api/stripe-webhook.ts
 * @see docs/PAYMENT_SECURITY.md
 */

const WEBHOOK_SECRET = 'whsec_test_signature_secret_for_unit_test_only';

// Module-level reads inside `api/stripe-webhook.ts` (e.g. `const webhookSecret
// = process.env.STRIPE_WEBHOOK_SECRET`) capture these at first import, so they
// must be set before the dynamic `import(...)` below — and reset before every
// `vi.resetModules()` + reimport cycle.
process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? 'sk_test_dummy_for_unit_test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-test-key';

vi.mock('../../api/lib/logger', () => ({
  apiLogger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

/**
 * Build a `stripe-signature` header value identical to what Stripe sends:
 *   `t=<unix-seconds>,v1=<hex HMAC-SHA256 of "<t>.<rawBody>" using secret>`
 *
 * Stripe's `webhooks.constructEvent` accepts exactly this format.
 */
function signStripePayload(
  payload: string,
  secret: string,
  ts = Math.floor(Date.now() / 1000),
): string {
  const signedPayload = `${ts}.${payload}`;
  const signature = createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${ts},v1=${signature}`;
}

/**
 * Build a minimal `checkout.session.completed` event. We deliberately set
 * `mode: 'payment'` (not `'subscription'`) so that
 * `syncProfileFromCheckoutSession` early-returns at its `mode !== 'subscription'`
 * guard — no Stripe API call, no Supabase PATCH, no extra mocks required.
 */
function checkoutSessionCompletedEvent(
  eventId = 'evt_test_signature_1',
  sessionId = 'cs_test_signature_1',
): Record<string, unknown> {
  return {
    id: eventId,
    object: 'event',
    api_version: '2020-08-27',
    created: Math.floor(Date.now() / 1000),
    type: 'checkout.session.completed',
    livemode: false,
    pending_webhooks: 0,
    request: { id: null, idempotency_key: null },
    data: {
      object: {
        id: sessionId,
        object: 'checkout.session',
        mode: 'payment',
        client_reference_id: null,
        customer: null,
        metadata: {},
        subscription: null,
      },
    },
  };
}

async function loadHandler(): Promise<(req: Request) => Promise<Response>> {
  vi.resetModules();
  // Re-apply after resetModules in case a prior test stomped on these.
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_unit_test';
  const mod = (await import('../../api/stripe-webhook')) as {
    POST: (req: Request) => Promise<Response>;
  };
  return mod.POST;
}

function buildWebhookRequest(rawBody: string, headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/stripe-webhook', {
    method: 'POST',
    body: rawBody,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

const ORIGINAL_ENV = { ...process.env };

describe('Stripe webhook signature verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
    // Signature-only tests (1–4) intentionally leave Supabase unset so
    // `claimStripeWebhookEvent` takes its non-prod fallback path and returns
    // `'claimed'` without touching `fetch`. Test 5 sets these explicitly.
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.VERCEL_ENV;
    delete process.env.STRIPE_WEBHOOK_FAIL_CLOSED;
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy_for_unit_test';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...ORIGINAL_ENV };
  });

  it('rejects requests with no stripe-signature header with 400', async () => {
    const POST = await loadHandler();
    const event = checkoutSessionCompletedEvent('evt_no_sig');
    const req = buildWebhookRequest(JSON.stringify(event));

    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(typeof body.error).toBe('string');
    expect(body.error).toMatch(/missing.*signature/i);
  });

  it('rejects requests where the signature does not match the body with 400', async () => {
    const POST = await loadHandler();
    const event = checkoutSessionCompletedEvent('evt_bad_sig');
    const rawBody = JSON.stringify(event);
    // Signed with the WRONG secret — `constructEvent` must reject this.
    const badSig = signStripePayload(rawBody, 'whsec_a_completely_different_secret');
    const req = buildWebhookRequest(rawBody, { 'stripe-signature': badSig });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(typeof body.error).toBe('string');
    // Stripe's SDK message contains "signature" on a mismatch; we don't assert
    // an exact string because the wording is owned by the SDK, not us.
    expect(body.error.toLowerCase()).toContain('signature');
  });

  it('accepts a request with a real Stripe signature and routes to the event handler', async () => {
    const POST = await loadHandler();
    const event = checkoutSessionCompletedEvent('evt_signed_ok');
    const rawBody = JSON.stringify(event);
    const sig = signStripePayload(rawBody, WEBHOOK_SECRET);
    const req = buildWebhookRequest(rawBody, { 'stripe-signature': sig });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: boolean; duplicate?: boolean };
    expect(body.received).toBe(true);
    expect(body.duplicate).toBeUndefined();
  });

  it('computes the signature against the raw body, not the parsed JSON', async () => {
    const POST = await loadHandler();
    // Whitespace-laden raw body. The bytes the client sent — including the
    // extra spaces — are what Stripe's `constructEvent` hashes. If the
    // handler ever re-stringified the parsed body it would change the bytes
    // and verification would fail.
    const rawBody =
      '{ "id": "evt_raw_body_1",\n  "object": "event",\n  "type": "checkout.session.completed",\n  "data": { "object": { "id": "cs_raw_body_1", "object": "checkout.session", "mode": "payment" } } }';

    // Sanity-check the premise of this test: re-stringifying the parsed body
    // produces different bytes (and therefore a different signature) than the
    // original raw body. Without that, this test wouldn't be proving anything.
    const reStringified = JSON.stringify(JSON.parse(rawBody));
    expect(reStringified).not.toBe(rawBody);
    const sigOverRawBody = signStripePayload(rawBody, WEBHOOK_SECRET);
    const sigOverReStringified = signStripePayload(reStringified, WEBHOOK_SECRET);
    expect(sigOverReStringified).not.toBe(sigOverRawBody);

    const req = buildWebhookRequest(rawBody, { 'stripe-signature': sigOverRawBody });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: boolean };
    expect(body.received).toBe(true);
  });

  it('idempotency: the same event id processed twice is not double-counted', async () => {
    // For this test we need `claimStripeWebhookEvent` to actually hit fetch.
    // First call → 201 (claimed); second call → 409 (duplicate). The handler
    // must short-circuit the duplicate to `{ received: true, duplicate: true }`
    // without running any event-type sync work.
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';

    let claimCalls = 0;
    const fetchMock = vi.fn(async (input: unknown, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as { url?: string })?.url ?? '';
      if (url.includes('stripe_processed_events') && init?.method === 'POST') {
        claimCalls += 1;
        // First claim succeeds (Supabase REST 201 Created); second hits the
        // primary-key conflict and returns 409 Conflict.
        return new Response('', { status: claimCalls === 1 ? 201 : 409 });
      }
      // Anything else (we don't expect anything else in this flow) → 200.
      return new Response('{}', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const POST = await loadHandler();

    const event = checkoutSessionCompletedEvent('evt_dedupe_1', 'cs_dedupe_1');
    const rawBody = JSON.stringify(event);

    // Sign the same payload twice with the same timestamp so both deliveries
    // are byte-identical retries of one Stripe event.
    const ts = Math.floor(Date.now() / 1000);
    const sig = signStripePayload(rawBody, WEBHOOK_SECRET, ts);

    const res1 = await POST(buildWebhookRequest(rawBody, { 'stripe-signature': sig }));
    expect(res1.status).toBe(200);
    const body1 = (await res1.json()) as { received: boolean; duplicate?: boolean };
    expect(body1.received).toBe(true);
    expect(body1.duplicate).toBeUndefined();

    const res2 = await POST(buildWebhookRequest(rawBody, { 'stripe-signature': sig }));
    expect(res2.status).toBe(200);
    const body2 = (await res2.json()) as { received: boolean; duplicate?: boolean };
    expect(body2.received).toBe(true);
    expect(body2.duplicate).toBe(true);

    // We made exactly two claim attempts — the dedupe didn't silently re-run
    // event-type sync work, and we didn't leak extra Supabase calls.
    expect(claimCalls).toBe(2);
  });
});
