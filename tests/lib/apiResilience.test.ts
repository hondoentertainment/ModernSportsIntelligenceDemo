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
});
