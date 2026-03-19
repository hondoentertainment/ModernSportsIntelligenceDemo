import { describe, it, expect, vi } from 'vitest';
import { withRetry, withTimeout, TimeoutError } from '../../lib/retry';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue(42);
    const result = await withRetry(fn, { maxAttempts: 3 });
    expect(result).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and resolves when later attempt succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(10);
    const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 50 });
    expect(result).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after maxAttempts exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    await expect(withRetry(fn, { maxAttempts: 2, initialDelayMs: 20 })).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('withTimeout', () => {
  it('resolves when promise resolves before timeout', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 5000);
    expect(result).toBe('ok');
  });

  it('rejects with TimeoutError when promise exceeds timeout', async () => {
    const neverResolves = new Promise<string>(() => {});
    const p = withTimeout(neverResolves, 50);
    await expect(p).rejects.toThrow(TimeoutError);
    await expect(p).rejects.toThrow(/timed out/);
  });

  it('rejects with original error when promise rejects before timeout', async () => {
    const rejects = Promise.reject(new Error('inner fail'));
    await expect(withTimeout(rejects, 5000)).rejects.toThrow('inner fail');
  });

  it('TimeoutError has name TimeoutError', async () => {
    const neverResolves = new Promise<string>(() => {});
    try {
      await withTimeout(neverResolves, 10);
    } catch (e) {
      expect(e).toBeInstanceOf(TimeoutError);
      expect((e as TimeoutError).name).toBe('TimeoutError');
    }
  });
});

describe('withRetry with timeout', () => {
  it('retries when attempt times out, then succeeds', async () => {
    const slowThenFast = vi.fn()
      .mockImplementationOnce(() => new Promise((_) => {})) // never resolves
      .mockResolvedValueOnce(99);
    const result = await withRetry(slowThenFast, { maxAttempts: 3, initialDelayMs: 20, timeoutMs: 30 });
    expect(result).toBe(99);
    expect(slowThenFast).toHaveBeenCalledTimes(2);
  });

  it('throws TimeoutError when all attempts time out', async () => {
    const slowFn = vi.fn().mockImplementation(() => new Promise((_) => {}));
    await expect(withRetry(slowFn, { maxAttempts: 2, initialDelayMs: 10, timeoutMs: 20 }))
      .rejects.toThrow(TimeoutError);
    expect(slowFn).toHaveBeenCalledTimes(2);
  });
});

describe('withRetry shouldRetry', () => {
  it('does not retry when shouldRetry returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('no retry'));
    const shouldRetry = vi.fn().mockReturnValue(false);
    await expect(withRetry(fn, { maxAttempts: 3, shouldRetry, initialDelayMs: 10 }))
      .rejects.toThrow('no retry');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error));
  });

  it('retries when shouldRetry returns true', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('retry'))
      .mockResolvedValueOnce(7);
    const shouldRetry = vi.fn().mockReturnValue(true);
    const result = await withRetry(fn, { maxAttempts: 3, shouldRetry, initialDelayMs: 20 });
    expect(result).toBe(7);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
