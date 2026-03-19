/**
 * Production-grade retry with exponential backoff and optional timeout.
 * Use for Supabase, fetch, or any Promise-based data load.
 */

import { logger } from './logger';

/**
 * Options for retry behavior.
 * @property maxAttempts - Max attempts (including first). Default 3.
 * @property initialDelayMs - Initial delay in ms. Default 300.
 * @property maxDelayMs - Max delay cap. Default 5000.
 * @property timeoutMs - Timeout per attempt in ms. No timeout if not set.
 * @property shouldRetry - Return true to retry (e.g. on 5xx). Default: retry on any throw.
 */
export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultShouldRetry = (): boolean => true;

/**
 * Runs an async function with retries and optional per-attempt timeout (exponential backoff).
 * On failure, waits initialDelayMs * 2^(attempt-1) up to maxDelayMs before retrying.
 * If timeoutMs is set, each attempt is wrapped with withTimeout.
 *
 * @param fn - Async function to execute (no arguments). Called once per attempt.
 * @param options - Retry options. Omitted fields use defaults (maxAttempts: 3, initialDelayMs: 300, maxDelayMs: 5000).
 * @returns Promise resolving to the result of fn, or rejects with the last error after all attempts fail.
 * @throws Re-throws the error if shouldRetry returns false or maxAttempts exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 300,
    maxDelayMs = 5000,
    timeoutMs,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const promise = fn();
      const result = timeoutMs
        ? await withTimeout(promise, timeoutMs)
        : await promise;
      return result;
    } catch (e) {
      lastError = e;
      if (attempt === maxAttempts || !shouldRetry(e)) {
        throw e;
      }
      const delay = Math.min(
        initialDelayMs * Math.pow(2, attempt - 1),
        maxDelayMs
      );
      if (import.meta.env?.DEV) {
        logger.warn(`[retry] Attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`, e);
      }
      await sleep(delay);
    }
  }
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Races a promise against a timeout. Resolves with the promise value if it completes first;
 * otherwise rejects with TimeoutError after ms milliseconds.
 *
 * @param promise - Promise to race against the timeout.
 * @param ms - Timeout in milliseconds. Must be positive.
 * @returns Promise resolving to the same type T as the input promise, or rejects with TimeoutError.
 * @throws TimeoutError when the operation exceeds ms milliseconds.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${ms}ms`));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(t);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}
