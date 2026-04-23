// @ts-nocheck
/**
 * serverApiRequest with real withRetry + mocked fetch (no apiResilience mock).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serverApiRequest, ServerApiError } from '../../lib/serverApi';

describe('serverApiRequest (integration)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns JSON on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 1 }),
    } as Response);
    const p = serverApiRequest<{ data: number }>('/api/x');
    const assertion = expect(p).resolves.toEqual({ data: 1 });
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('uses error payload message when present', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'invalid' }),
    } as Response);
    const p = serverApiRequest('/api/x');
    const assertion = expect(p).rejects.toMatchObject({
      message: 'invalid',
      status: 422,
    });
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('uses generic message when error JSON parse fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    } as Response);
    const p = serverApiRequest('/api/x');
    const assertion = expect(p).rejects.toSatisfy(
      (err: unknown) =>
        err instanceof ServerApiError && /Request failed with status 500/.test(err.message)
    );
    await vi.runAllTimersAsync();
    await assertion;
  });

  it('does not retry 4xx ServerApiError', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response);
    const p = serverApiRequest('/api/x');
    const assertion = expect(p).rejects.toThrow(ServerApiError);
    await vi.runAllTimersAsync();
    await assertion;
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
