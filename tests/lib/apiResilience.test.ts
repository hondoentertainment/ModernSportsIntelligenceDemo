import { describe, it, expect, vi } from 'vitest';
import { withRetry, withTimeout, CircuitBreaker } from '../../lib/apiResilience';

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, timeoutMs: 5000 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValue('recovered');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, timeoutMs: 5000 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(
      withRetry(fn, { maxAttempts: 2, baseDelayMs: 10, timeoutMs: 5000 })
    ).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should respect shouldRetry predicate', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('client error'));
    await expect(
      withRetry(fn, {
        maxAttempts: 5,
        baseDelayMs: 10,
        timeoutMs: 5000,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('client error');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('logs non-Error rejection between retries', async () => {
    const warnSpy = vi.spyOn((await import('../../lib/logger')).logger, 'warn').mockImplementation(() => {});
    const fn = vi.fn().mockRejectedValueOnce('string-fail').mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 5, timeoutMs: 5000 });
    expect(result).toBe('ok');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('withTimeout', () => {
  it('should resolve if under timeout', async () => {
    const result = await withTimeout(Promise.resolve('fast'), 1000);
    expect(result).toBe('fast');
  });

  it('should reject if over timeout', async () => {
    const slow = new Promise((resolve) => setTimeout(() => resolve('late'), 500));
    await expect(withTimeout(slow, 10)).rejects.toThrow('timed out');
  });
});

describe('CircuitBreaker', () => {
  it('should allow requests when closed', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 2, resetTimeoutMs: 100 });
    const result = await cb.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(cb.getState()).toBe('closed');
  });

  it('should open after threshold failures', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 2, resetTimeoutMs: 100 });
    const fail = () => cb.execute(() => Promise.reject(new Error('fail')));

    await expect(fail()).rejects.toThrow();
    await expect(fail()).rejects.toThrow();

    expect(cb.getState()).toBe('open');
    await expect(fail()).rejects.toThrow('Circuit is open');
  });

  it('should transition to half-open after reset timeout', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, resetTimeoutMs: 50 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(cb.getState()).toBe('open');

    // Wait for reset timeout
    await new Promise((r) => setTimeout(r, 60));

    const result = await cb.execute(() => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
    expect(cb.getState()).toBe('closed');
  });

  it('should reset manually', () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1 });
    cb.reset();
    expect(cb.getState()).toBe('closed');
  });

  it('should handle half-open state correctly', async () => {
    const cb = new CircuitBreaker('test', { failureThreshold: 1, resetTimeoutMs: 50 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow();
    expect(cb.getState()).toBe('open');

    await new Promise((r) => setTimeout(r, 60));
    // Should be half-open now
    const result = await cb.execute(() => Promise.resolve('ok'));
    expect(result).toBe('ok');
    expect(cb.getState()).toBe('closed');
  });

  it('should use default options when not provided', () => {
    const cb = new CircuitBreaker('test');
    expect(cb.getState()).toBe('closed');
  });
});

describe('resilientFetch', () => {
  it('should fetch with retry', async () => {
    global.fetch = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: 'test' }) } as Response);

    const { resilientFetch } = await import('../../lib/apiResilience');
    const response = await resilientFetch('/test', {
      retry: { maxAttempts: 2, baseDelayMs: 10 },
    });
    expect(response.ok).toBe(true);
  });

  it('should use circuit breaker when provided', async () => {
    const { resilientFetch, CircuitBreaker } = await import('../../lib/apiResilience');
    const circuit = new CircuitBreaker('test', { failureThreshold: 5 });
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);

    await resilientFetch('/test', { circuit });
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should call fetch with only url when init is omitted', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    const { resilientFetch } = await import('../../lib/apiResilience');
    await resilientFetch('https://example.com/api');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {});
  });
});
