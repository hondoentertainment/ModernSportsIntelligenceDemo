import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type Stripe from 'stripe';
import { syncProfileFromCheckoutSession } from '../../api/lib/stripeProfileSync';

describe('Stripe checkout → profile tier sync', () => {
  const env = { ...process.env };
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue({ ok: true, text: async () => '' });
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro_test';
    delete process.env.VERCEL_ENV;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it('PATCHes profiles with pro tier after checkout.session.completed', async () => {
    const stripe = {
      subscriptions: {
        retrieve: vi.fn().mockResolvedValue({
          id: 'sub_123',
          status: 'active',
          start_date: 1_700_000_000,
          ended_at: null,
          trial_end: null,
          items: { data: [{ price: { id: 'price_pro_test' } }] },
          metadata: { supabase_user_id: 'user-abc' },
          customer: 'cus_123',
        }),
      },
    } as unknown as Stripe;

    const session = {
      mode: 'subscription',
      subscription: 'sub_123',
      client_reference_id: 'user-abc',
      customer: 'cus_123',
      metadata: { supabase_user_id: 'user-abc' },
    } as Stripe.Checkout.Session;

    await syncProfileFromCheckoutSession(stripe, session);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/rest/v1/profiles?id=eq.user-abc');
    const body = JSON.parse(String(init.body));
    expect(body.subscription_tier).toBe('pro');
    expect(body.subscription_status).toBe('active');
    expect(body.stripe_subscription_id).toBe('sub_123');
  });
});
