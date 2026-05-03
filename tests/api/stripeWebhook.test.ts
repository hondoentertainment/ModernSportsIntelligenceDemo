import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const constructEvent = vi.fn();
const claim = vi.fn();
const release = vi.fn();
const syncCheckout = vi.fn();
const syncSubscription = vi.fn();
const syncSubscriptionDeleted = vi.fn();
const syncInvoice = vi.fn();

vi.mock('stripe', () => {
  class StripeMock {
    webhooks = { constructEvent };
    constructor(_key: string, _opts: unknown) {}
  }
  return { default: StripeMock };
});

vi.mock('../../api/lib/stripeWebhookIdempotency', () => ({
  claimStripeWebhookEvent: claim,
  releaseStripeWebhookEventClaim: release,
}));

vi.mock('../../api/lib/stripeProfileSync', () => ({
  syncProfileFromCheckoutSession: syncCheckout,
  syncProfileFromSubscription: syncSubscription,
  syncProfileOnSubscriptionDeleted: syncSubscriptionDeleted,
  syncProfileFromInvoice: syncInvoice,
}));

vi.mock('../../api/lib/logger', () => ({
  apiLogger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const env = { ...process.env };

function makeRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request('https://example.com/api/stripe-webhook', {
    method: 'POST',
    body,
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
  process.env = { ...env };
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.STRIPE_SECRET_KEY = 'sk_test_xxx';
  delete process.env.VERCEL_ENV;
  delete process.env.NODE_ENV;
});

afterEach(() => {
  process.env = { ...env };
});

async function loadHandler() {
  // Re-import after env is set so module-level reads see fresh values.
  const mod = await import('../../api/stripe-webhook');
  return mod.POST;
}

describe('stripe-webhook POST handler', () => {
  it('returns 500 when STRIPE_WEBHOOK_SECRET is unset', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}'));
    expect(res.status).toBe(500);
  });

  it('returns 400 when Stripe-Signature header is missing', async () => {
    const POST = await loadHandler();
    const res = await POST(makeRequest('{"id":"evt_1"}'));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/signature/i);
  });

  it('returns 400 when body is empty', async () => {
    const POST = await loadHandler();
    const res = await POST(makeRequest('', { 'stripe-signature': 't=1,v1=abc' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when signature verification throws', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });
    const POST = await loadHandler();
    const res = await POST(makeRequest('{"id":"evt_x"}', { 'stripe-signature': 't=1,v1=bad' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/signatures/i);
  });

  it('returns duplicate=true when idempotency claim is duplicate', async () => {
    constructEvent.mockReturnValue({ id: 'evt_dup', type: 'checkout.session.completed', data: { object: {} } });
    claim.mockResolvedValue('duplicate');
    const POST = await loadHandler();
    const res = await POST(makeRequest('{"id":"evt_dup"}', { 'stripe-signature': 't=1,v1=ok' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ received: true, duplicate: true });
    expect(syncCheckout).not.toHaveBeenCalled();
  });

  it('returns 503 when idempotency store is misconfigured', async () => {
    constructEvent.mockReturnValue({ id: 'evt_m', type: 'checkout.session.completed', data: { object: {} } });
    claim.mockResolvedValue('misconfigured');
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 't=1,v1=ok' }));
    expect(res.status).toBe(503);
  });

  it('dispatches checkout.session.completed and returns received', async () => {
    const session = { id: 'cs_1' };
    constructEvent.mockReturnValue({ id: 'evt_ok', type: 'checkout.session.completed', data: { object: session } });
    claim.mockResolvedValue('claimed');
    syncCheckout.mockResolvedValue(undefined);
    const POST = await loadHandler();
    const res = await POST(makeRequest('{"x":1}', { 'stripe-signature': 't=1,v1=ok' }));
    expect(res.status).toBe(200);
    expect(syncCheckout).toHaveBeenCalledWith(expect.anything(), session);
    expect(release).not.toHaveBeenCalled();
    const json = await res.json();
    expect(json).toEqual({ received: true });
  });

  it('dispatches customer.subscription.updated', async () => {
    const sub = { id: 'sub_1' };
    constructEvent.mockReturnValue({ id: 'evt_su', type: 'customer.subscription.updated', data: { object: sub } });
    claim.mockResolvedValue('claimed');
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(syncSubscription).toHaveBeenCalledWith(sub);
  });

  it('dispatches customer.subscription.deleted', async () => {
    const sub = { id: 'sub_d' };
    constructEvent.mockReturnValue({ id: 'evt_sd', type: 'customer.subscription.deleted', data: { object: sub } });
    claim.mockResolvedValue('claimed');
    const POST = await loadHandler();
    await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(syncSubscriptionDeleted).toHaveBeenCalledWith(sub);
  });

  it('dispatches invoice.payment_succeeded and invoice.payment_failed', async () => {
    const inv = { id: 'in_1' };
    constructEvent.mockReturnValue({ id: 'evt_ips', type: 'invoice.payment_succeeded', data: { object: inv } });
    claim.mockResolvedValue('claimed');
    const POST = await loadHandler();
    await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(syncInvoice).toHaveBeenCalledTimes(1);

    constructEvent.mockReturnValue({ id: 'evt_ipf', type: 'invoice.payment_failed', data: { object: inv } });
    await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(syncInvoice).toHaveBeenCalledTimes(2);
  });

  it('releases the claim when sync handler throws and returns 500', async () => {
    constructEvent.mockReturnValue({ id: 'evt_err', type: 'checkout.session.completed', data: { object: { id: 'cs' } } });
    claim.mockResolvedValue('claimed');
    syncCheckout.mockRejectedValue(new Error('boom'));
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(500);
    expect(release).toHaveBeenCalledWith('evt_err');
    const json = await res.json();
    expect(json.error).toBe('sync_failed');
  });

  it('releases the claim and returns received for unhandled event types', async () => {
    constructEvent.mockReturnValue({ id: 'evt_unk', type: 'customer.created', data: { object: {} } });
    claim.mockResolvedValue('claimed');
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(200);
    expect(release).toHaveBeenCalledWith('evt_unk');
    expect(syncCheckout).not.toHaveBeenCalled();
  });

  it('returns 503 when STRIPE_SECRET_KEY is missing in production', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.VERCEL_ENV = 'production';
    const POST = await loadHandler();
    const res = await POST(makeRequest('{}', { 'stripe-signature': 'sig' }));
    expect(res.status).toBe(503);
  });
});
