/**
 * API Resilience — Retry, Timeout, and Circuit Breaker
 *
 * Provides fault-tolerant API calls with:
 * - Exponential backoff retry (configurable attempts)
 * - Request timeout
 * - Circuit breaker pattern to avoid hammering failed services
 */

import { logger } from './logger';

// ─── Retry with Exponential Backoff ──────────────────────────────────

export interface RetryOptions {
  /** Maximum number of attempts (including the initial call) */
  maxAttempts?: number;
  /** Base delay in ms (doubles each retry) */
  baseDelayMs?: number;
  /** Maximum delay cap in ms */
  maxDelayMs?: number;
  /** Timeout per individual attempt in ms */
  timeoutMs?: number;
  /** Optional predicate — return false to stop retrying on certain errors */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

const DEFAULT_RETRY: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  timeoutMs: 15000,
  shouldRetry: () => true,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry and exponential backoff.
 *
 * @example
 *   const data = await withRetry(() => fetch('/api/data').then(r => r.json()));
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const opts = { ...DEFAULT_RETRY, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      const result = await withTimeout(fn(), opts.timeoutMs);
      return result;
    } catch (err) {
      lastError = err;

      if (attempt >= opts.maxAttempts) break;
      if (!opts.shouldRetry(err, attempt)) break;

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1),
        opts.maxDelayMs
      );
      const jitter = delay * (0.5 + Math.random() * 0.5);

      logger.warn(
        `[Retry] Attempt ${attempt}/${opts.maxAttempts} failed, retrying in ${Math.round(jitter)}ms`,
        err instanceof Error ? err.message : err
      );

      await sleep(jitter);
    }
  }

  throw lastError;
}

// ─── Timeout ─────────────────────────────────────────────────────────

/**
 * Wrap a promise with a timeout.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Request timed out after ${ms}ms`)),
      ms
    );

    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ─── Circuit Breaker ─────────────────────────────────────────────────

export interface CircuitBreakerOptions {
  /** Number of failures before opening the circuit */
  failureThreshold?: number;
  /** Time in ms to wait before allowing a probe request */
  resetTimeoutMs?: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly name: string;

  constructor(name: string, options?: CircuitBreakerOptions) {
    this.name = name;
    this.failureThreshold = options?.failureThreshold ?? 5;
    this.resetTimeoutMs = options?.resetTimeoutMs ?? 30000;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = 'half-open';
        logger.info(`[CircuitBreaker:${this.name}] Half-open — allowing probe request`);
      } else {
        throw new Error(
          `[CircuitBreaker:${this.name}] Circuit is open — request blocked`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
      logger.info(`[CircuitBreaker:${this.name}] Circuit closed — service recovered`);
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      logger.warn(
        `[CircuitBreaker:${this.name}] Circuit opened after ${this.failureCount} failures`
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
  }
}

// ─── Pre-built circuit breakers for key services ─────────────────────

export const geminiCircuit = new CircuitBreaker('gemini', {
  failureThreshold: 3,
  resetTimeoutMs: 60000,
});

export const ebayCircuit = new CircuitBreaker('ebay', {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
});

export const supabaseCircuit = new CircuitBreaker('supabase', {
  failureThreshold: 5,
  resetTimeoutMs: 15000,
});

// ─── Resilient Fetch ─────────────────────────────────────────────────

/**
 * A fetch wrapper with retry, timeout, and optional circuit breaker.
 */
export async function resilientFetch(
  url: string,
  init?: RequestInit & { retry?: RetryOptions; circuit?: CircuitBreaker }
): Promise<Response> {
  const { retry, circuit, ...fetchInit } = init ?? {};

  const doFetch = () => fetch(url, fetchInit);

  if (circuit) {
    return withRetry(() => circuit.execute(doFetch), retry);
  }

  return withRetry(doFetch, retry);
}
