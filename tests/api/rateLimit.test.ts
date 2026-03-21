import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  checkRateLimit,
  clientKeyFromRequest,
  envRateLimitMax,
  rateLimitDisabled,
} from '../../api/lib/rateLimit';

describe('rateLimit', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('clientKeyFromRequest prefers x-forwarded-for first hop', () => {
    expect(
      clientKeyFromRequest({
        headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
      })
    ).toBe('203.0.113.1');
  });

  it('clientKeyFromRequest falls back to socket', () => {
    expect(
      clientKeyFromRequest({
        headers: {},
        socket: { remoteAddress: '::1' },
      })
    ).toBe('::1');
  });

  it('checkRateLimit allows under max', () => {
    const key = `under-${Math.random()}`;
    expect(checkRateLimit(key, 3, 10_000)).toEqual({ limited: false });
    expect(checkRateLimit(key, 3, 10_000)).toEqual({ limited: false });
    expect(checkRateLimit(key, 3, 10_000)).toEqual({ limited: false });
  });

  it('checkRateLimit blocks at max', () => {
    const key = `k-${Math.random()}`;
    expect(checkRateLimit(key, 2, 60_000).limited).toBe(false);
    expect(checkRateLimit(key, 2, 60_000).limited).toBe(false);
    const r = checkRateLimit(key, 2, 60_000);
    expect(r.limited).toBe(true);
    if (r.limited) {
      expect(r.retryAfterSec).toBeGreaterThanOrEqual(1);
    }
  });

  it('checkRateLimit no-op when max <= 0', () => {
    expect(checkRateLimit('kz', 0, 1000)).toEqual({ limited: false });
  });

  it('envRateLimitMax reads env', () => {
    vi.stubEnv('TEST_RL', '12');
    expect(envRateLimitMax('TEST_RL', 99)).toBe(12);
  });

  it('rateLimitDisabled respects env', () => {
    vi.stubEnv('RATE_LIMIT_DISABLED', '1');
    expect(rateLimitDisabled()).toBe(true);
  });
});
