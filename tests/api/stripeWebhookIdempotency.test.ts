import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  wasStripeEventProcessed,
  markStripeEventProcessed,
  claimStripeWebhookEvent,
  releaseStripeWebhookEventClaim,
} from '../../api/lib/stripeWebhookIdempotency';

describe('stripeWebhookIdempotency', () => {
  const originalUrl = process.env.SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    process.env.SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  });

  it('wasStripeEventProcessed returns false when env is unset', async () => {
    expect(await wasStripeEventProcessed('evt_1')).toBe(false);
  });

  it('markStripeEventProcessed no-ops when env is unset', async () => {
    await expect(markStripeEventProcessed('evt_1')).resolves.toBeUndefined();
  });

  it('wasStripeEventProcessed returns true when SELECT returns rows', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ stripe_event_id: 'evt_x' }],
      })
    );
    expect(await wasStripeEventProcessed('evt_x')).toBe(true);
  });

  it('markStripeEventProcessed treats 409 as success', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: async () => '',
      })
    );
    await expect(markStripeEventProcessed('evt_dup')).resolves.toBeUndefined();
  });

  it('claimStripeWebhookEvent returns claimed on insert success', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    delete process.env.VERCEL_ENV;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => '',
      }),
    );
    expect(await claimStripeWebhookEvent('evt_claim_1')).toBe('claimed');
  });

  it('claimStripeWebhookEvent returns duplicate on 409', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: async () => '',
      }),
    );
    expect(await claimStripeWebhookEvent('evt_dup_claim')).toBe('duplicate');
  });

  it('releaseStripeWebhookEventClaim calls DELETE when configured', async () => {
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => '' });
    vi.stubGlobal('fetch', fetchMock);
    await releaseStripeWebhookEventClaim('evt_rel');
    expect(fetchMock).toHaveBeenCalled();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('stripe_processed_events');
    expect(url).toContain('evt_rel');
    expect(init?.method).toBe('DELETE');
  });
});
