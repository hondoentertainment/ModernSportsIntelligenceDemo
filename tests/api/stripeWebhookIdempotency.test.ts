import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  wasStripeEventProcessed,
  markStripeEventProcessed,
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
});
