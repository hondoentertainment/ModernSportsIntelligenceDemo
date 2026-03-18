/**
 * @module apiAdapterLayer
 * @description Production-grade API integration adapter layer.
 *
 * Provides environment-variable-gated adapters that transparently swap
 * between mock data (sourced from the existing service layer) and live
 * API calls.  Every adapter is registered in a central registry; callers
 * retrieve adapters via `getAdapter<T>(name)` and never need to know
 * which implementation they receive.
 *
 * Architecture overview:
 * ```
 *  Caller  -->  getAdapter('marketplace')
 *                   |
 *                   +--> API key present + enabled?
 *                   |        YES --> LiveMarketplaceAdapter  (rate-limited, cached)
 *                   |        NO  --> MockMarketplaceAdapter  (delegates to service layer)
 * ```
 *
 * Key infrastructure provided by this module:
 * - Token-bucket rate limiter (per API)
 * - In-memory LRU cache with per-type TTL
 * - Priority request queue (realtime > high > normal > batch)
 * - Retry with exponential back-off and jitter
 * - AbortController / AbortSignal support on every call
 * - Structured error classification
 */

import type {
  ApiConfig,
  AdapterStatus,
  AdapterStatusMap,
  AdapterName,
  AdapterTypeMap,
  ApiAdapterError,
  ApiErrorCategory,
  RequestPriority,
  RateLimitConfig,
  CacheConfig,
  RequestOptions,
  // Marketplace
  MarketplaceAdapter,
  MarketplaceSearchParams,
  MarketplaceSearchResult,
  MarketplaceListing,
  SalesHistoryParams,
  SalesHistoryResult,
  SaleRecord,
  // Grading
  GradingAdapter,
  PopReportParams,
  PopulationReport,
  PopulationReportEntry,
  SubmissionTrackingRecord,
  GradingCompany,
  // Financial
  FinancialDataAdapter,
  FinancialAsset,
  AssetQuote,
  PriceHistoryParams,
  PriceHistoryResult,
  PriceDataPoint,
  // Sports
  SportsDataAdapter,
  SportsDataSport,
  PlayerProfile,
  PlayerStatLine,
  InjuryReport,
  GameScheduleEntry,
  // Social
  SocialDataAdapter,
  SocialSentimentParams,
  SocialSentiment,
  SocialPost,
  InfluencerActivity,
  SocialPlatform,
} from './apiAdapterTypes';

import { logger } from '../logger';

// Re-export all types so consumers can `import { ... } from './apiAdapterLayer'`
export type {
  ApiConfig,
  AdapterStatus,
  AdapterStatusMap,
  AdapterName,
  AdapterTypeMap,
  ApiAdapterError,
  ApiErrorCategory,
  RequestPriority,
  RateLimitConfig,
  CacheConfig,
  RequestOptions,
  MarketplaceAdapter,
  MarketplaceSearchParams,
  MarketplaceSearchResult,
  MarketplaceListing,
  SalesHistoryParams,
  SalesHistoryResult,
  SaleRecord,
  GradingAdapter,
  PopReportParams,
  PopulationReport,
  PopulationReportEntry,
  SubmissionTrackingRecord,
  GradingCompany,
  FinancialDataAdapter,
  FinancialAsset,
  AssetQuote,
  PriceHistoryParams,
  PriceHistoryResult,
  PriceDataPoint,
  SportsDataAdapter,
  SportsDataSport,
  PlayerProfile,
  PlayerStatLine,
  InjuryReport,
  GameScheduleEntry,
  SocialDataAdapter,
  SocialSentimentParams,
  SocialSentiment,
  SocialPost,
  InfluencerActivity,
  SocialPlatform,
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Configuration
// ════════════════════════════════════════════════════════════════════════════

/**
 * Read API configuration from Vite environment variables.
 *
 * Each key maps to a `VITE_*` env var.  When the variable is absent
 * the corresponding adapter falls back to its mock implementation.
 */
function loadConfig(): ApiConfig {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || ({} as Record<string, string | undefined>);
  return {
    ebayApiKey: env.VITE_EBAY_API_KEY as string | undefined,
    psaApiKey: env.VITE_PSA_API_KEY as string | undefined,
    yahooFinanceKey: env.VITE_YAHOO_FINANCE_KEY as string | undefined,
    sportRadarKey: env.VITE_SPORTRADAR_KEY as string | undefined,
    coingeckoKey: env.VITE_COINGECKO_KEY as string | undefined,
    twitterBearerToken: env.VITE_TWITTER_BEARER_TOKEN as string | undefined,
    redditClientCredentials: env.VITE_REDDIT_CLIENT_CREDENTIALS as string | undefined,
    enabled: env.VITE_API_ADAPTERS_ENABLED !== 'false', // enabled by default
  };
}

/** Singleton config instance, lazy-initialised. */
let _config: ApiConfig | null = null;

/** Return the current (or freshly loaded) API configuration. */
export function getApiConfig(): ApiConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Override the configuration at runtime (useful in tests).
 * Pass `null` to reset to environment-sourced config.
 */
export function setApiConfig(config: ApiConfig | null): void {
  _config = config;
  // Reset adapter cache so next getAdapter() call uses the new config.
  _adapterCache.clear();
  _adapterStatuses.clear();
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Token-bucket rate limiter
// ════════════════════════════════════════════════════════════════════════════

/**
 * A token-bucket rate limiter.
 *
 * Tokens refill at a constant rate.  `consume()` returns a promise
 * that resolves when a token is available.  The caller may pass an
 * `AbortSignal` so the wait can be cancelled.
 */
export class TokenBucketRateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private lastRefillTime: number;

  constructor(config: RateLimitConfig) {
    this.maxTokens = config.maxTokens;
    this.refillRate = config.refillRate;
    this.tokens = config.initialTokens ?? config.maxTokens;
    this.lastRefillTime = Date.now();
  }

  /** Refill tokens based on elapsed time since last refill. */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTime) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefillTime = now;
  }

  /**
   * Consume one token.  If none are available, waits until a token
   * is refilled.
   *
   * @throws {DOMException} if the signal is aborted while waiting.
   */
  async consume(signal?: AbortSignal): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }
    // Calculate wait time for 1 token to become available.
    const deficit = 1 - this.tokens;
    const waitMs = Math.ceil((deficit / this.refillRate) * 1000);
    await this.wait(waitMs, signal);
    this.refill();
    this.tokens -= 1;
  }

  /** Return the current number of available tokens (informational). */
  get available(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  private wait(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — In-memory LRU cache with TTL
// ════════════════════════════════════════════════════════════════════════════

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory LRU cache with per-entry TTL.
 *
 * Uses a `Map` whose iteration order is insertion-order (most recent
 * last).  On every `get` the entry is re-inserted to refresh its
 * position, giving LRU eviction semantics.
 */
export class TtlCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /** Get a cached value, or `undefined` if missing / expired. */
  get<T = unknown>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // Refresh LRU position.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  /** Store a value with an optional TTL override. */
  set<T = unknown>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.config.defaultTtlMs;
    // Evict oldest entries if at capacity.
    while (this.store.size >= this.config.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) {
        this.store.delete(oldest);
      } else {
        break;
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  /** Remove a specific entry. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Remove all entries. */
  clear(): void {
    this.store.clear();
  }

  /** Current number of (possibly expired) entries. */
  get size(): number {
    return this.store.size;
  }

  /** Resolve a TTL for a given data-type label. */
  ttlFor(dataType: string): number {
    return this.config.ttlOverrides?.[dataType] ?? this.config.defaultTtlMs;
  }
}

/** Shared cache instance used by all adapters. */
export const adapterCache = new TtlCache({
  defaultTtlMs: 5 * 60 * 1000, // 5 minutes
  maxEntries: 2000,
  ttlOverrides: {
    'quote': 30_000,              // 30 s — financial quotes
    'price-history': 600_000,     // 10 min
    'pop-report': 3_600_000,      // 1 h
    'listings': 120_000,          // 2 min
    'sales-history': 300_000,     // 5 min
    'player-profile': 86_400_000, // 24 h
    'injury-report': 300_000,     // 5 min
    'schedule': 600_000,          // 10 min
    'sentiment': 180_000,         // 3 min
    'influencer': 300_000,        // 5 min
    'trending': 120_000,          // 2 min
  },
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Priority request queue
// ════════════════════════════════════════════════════════════════════════════

/** Numeric priority (lower = executed sooner). */
const PRIORITY_ORDER: Record<RequestPriority, number> = {
  realtime: 0,
  high: 1,
  normal: 2,
  batch: 3,
};

interface QueuedRequest<T> {
  execute: () => Promise<T>;
  priority: RequestPriority;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

/**
 * A simple priority queue that serialises outbound requests to a
 * single API, respecting the associated rate limiter.
 */
export class PriorityRequestQueue {
  private queue: QueuedRequest<unknown>[] = [];
  private processing = false;
  private readonly rateLimiter: TokenBucketRateLimiter;

  constructor(rateLimiter: TokenBucketRateLimiter) {
    this.rateLimiter = rateLimiter;
  }

  /**
   * Enqueue a request.  Returns a promise that resolves with the
   * result once the request has been executed.
   */
  enqueue<T>(execute: () => Promise<T>, priority: RequestPriority = 'normal'): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueuedRequest<unknown> = {
        execute: execute as () => Promise<unknown>,
        priority,
        resolve: resolve as (v: unknown) => void,
        reject,
      };
      // Insert in priority order (stable within the same level).
      const idx = this.queue.findIndex(
        (q) => PRIORITY_ORDER[q.priority] > PRIORITY_ORDER[priority]
      );
      if (idx === -1) {
        this.queue.push(item);
      } else {
        this.queue.splice(idx, 0, item);
      }
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    const item = this.queue.shift()!;
    try {
      await this.rateLimiter.consume();
      const result = await item.execute();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.processing = false;
      // Kick off next item (if any) on the next microtask.
      if (this.queue.length > 0) {
        queueMicrotask(() => this.processNext());
      }
    }
  }

  /** Number of requests waiting. */
  get pending(): number {
    return this.queue.length;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Retry with exponential back-off
// ════════════════════════════════════════════════════════════════════════════

/**
 * Execute `fn` with exponential back-off + jitter on retryable failures.
 *
 * @param fn         The async function to execute.
 * @param maxRetries Maximum number of retries (default 3).
 * @param signal     Optional AbortSignal to cancel waiting.
 * @returns          The result of `fn` on success.
 * @throws           The last error after all retries are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  signal?: AbortSignal,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const adapterErr = err as Partial<ApiAdapterError>;
      // Don't retry non-retryable errors.
      if (adapterErr.retryable === false) throw err;
      // Don't retry auth errors.
      if (adapterErr.category === 'auth') throw err;
      if (attempt === maxRetries) throw err;

      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30_000);
      const jitter = Math.random() * baseDelay * 0.3;
      const delay = adapterErr.retryAfterMs ?? baseDelay + jitter;

      await new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          return;
        }
        const timer = setTimeout(resolve, delay);
        signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      });
    }
  }
  throw lastError;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Error helpers
// ════════════════════════════════════════════════════════════════════════════

/**
 * Classify an HTTP status code into an {@link ApiErrorCategory}.
 */
export function classifyHttpError(status: number): ApiErrorCategory {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate-limit';
  if (status >= 400 && status < 500) return 'data';
  if (status >= 500) return 'network';
  return 'unknown';
}

/**
 * Build a structured {@link ApiAdapterError}.
 */
export function createAdapterError(
  adapterName: string,
  message: string,
  category: ApiErrorCategory,
  opts?: { statusCode?: number; retryable?: boolean; retryAfterMs?: number; cause?: unknown },
): ApiAdapterError {
  return {
    adapterName,
    message,
    category,
    statusCode: opts?.statusCode,
    retryable: opts?.retryable ?? (category === 'network' || category === 'rate-limit' || category === 'timeout'),
    retryAfterMs: opts?.retryAfterMs,
    cause: opts?.cause,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Per-API rate limiters and queues
// ════════════════════════════════════════════════════════════════════════════

/** Default rate-limit configs per external API. */
const RATE_LIMIT_CONFIGS: Record<AdapterName, RateLimitConfig> = {
  marketplace: { maxTokens: 20, refillRate: 5 },   // eBay: ~5 req/s
  grading:     { maxTokens: 10, refillRate: 2 },    // PSA: conservative
  financial:   { maxTokens: 30, refillRate: 10 },   // Yahoo Finance
  sports:      { maxTokens: 15, refillRate: 3 },    // SportRadar
  social:      { maxTokens: 30, refillRate: 10 },   // Twitter + Reddit
};

const _rateLimiters = new Map<AdapterName, TokenBucketRateLimiter>();
const _queues = new Map<AdapterName, PriorityRequestQueue>();

/** Get (or create) the rate limiter for an adapter. */
export function getRateLimiter(name: AdapterName): TokenBucketRateLimiter {
  let limiter = _rateLimiters.get(name);
  if (!limiter) {
    limiter = new TokenBucketRateLimiter(RATE_LIMIT_CONFIGS[name]);
    _rateLimiters.set(name, limiter);
  }
  return limiter;
}

/** Get (or create) the request queue for an adapter. */
export function getRequestQueue(name: AdapterName): PriorityRequestQueue {
  let queue = _queues.get(name);
  if (!queue) {
    queue = new PriorityRequestQueue(getRateLimiter(name));
    _queues.set(name, queue);
  }
  return queue;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — Generic live-fetch helper
// ════════════════════════════════════════════════════════════════════════════

/**
 * Perform a fetch request through the rate-limited queue with
 * caching, retry, and AbortSignal support.
 *
 * This is the single chokepoint every live adapter uses.
 */
async function liveFetch<T>(
  adapterName: AdapterName,
  url: string,
  init: RequestInit,
  opts?: RequestOptions & { dataType?: string },
): Promise<T> {
  // 1. Check cache
  if (opts?.cacheKey) {
    const cached = adapterCache.get<T>(opts.cacheKey);
    if (cached !== undefined) return cached;
  }

  const queue = getRequestQueue(adapterName);
  const priority = opts?.priority ?? 'normal';

  const execute = async (): Promise<T> => {
    const controller = new AbortController();
    const externalSignal = opts?.signal;

    // Wire external signal to our controller.
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort(externalSignal.reason);
      } else {
        externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason), { once: true });
      }
    }

    // Timeout after 30 s.
    const timeoutId = setTimeout(() => controller.abort(new DOMException('Request timeout', 'TimeoutError')), 30_000);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const category = classifyHttpError(response.status);
        const retryAfter = response.headers.get('Retry-After');
        throw createAdapterError(adapterName, `HTTP ${response.status}: ${response.statusText}`, category, {
          statusCode: response.status,
          retryAfterMs: retryAfter ? parseInt(retryAfter, 10) * 1000 : undefined,
        });
      }

      const data = (await response.json()) as T;

      // 2. Populate cache
      if (opts?.cacheKey) {
        const ttl = opts.cacheTtlMs ?? adapterCache.ttlFor(opts.dataType ?? 'default');
        adapterCache.set(opts.cacheKey, data, ttl);
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err && typeof err === 'object' && 'adapterName' in err) throw err;
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw createAdapterError(adapterName, 'Request aborted', 'timeout', { retryable: false, cause: err });
      }
      throw createAdapterError(adapterName, (err as Error).message ?? 'Network error', 'network', { cause: err });
    }
  };

  return queue.enqueue(
    () => withRetry(execute, opts?.maxRetries ?? 3, opts?.signal),
    priority,
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 9 — Mock adapter implementations
// ════════════════════════════════════════════════════════════════════════════

// ── 9a. Mock Marketplace Adapter ────────────────────────────────────────────

/**
 * Mock marketplace adapter.
 *
 * Returns synthetic data consistent with the shapes produced by
 * the existing `marketplaceAggregatorService` and `ebayApi` modules.
 */
function createMockMarketplaceAdapter(): MarketplaceAdapter {
  const generateMockListings = (params: MarketplaceSearchParams): MarketplaceListing[] => {
    const count = Math.min(params.limit ?? 20, 50);
    const players = [
      params.player ?? 'Mike Trout',
      'Shohei Ohtani',
      'Juan Soto',
      'Ronald Acuna Jr.',
    ];
    return Array.from({ length: count }, (_, i): MarketplaceListing => {
      const platforms: Array<MarketplaceListing['platform']> = ['ebay', 'comc', 'myslabs', 'starstock'];
      const platform = params.platforms?.[i % (params.platforms.length || 1)] ?? platforms[i % platforms.length];
      const basePrice = 50 + Math.random() * 500;
      return {
        id: `mock-listing-${i}-${Date.now()}`,
        platform,
        title: `${params.year ?? 2023} ${params.set ?? 'Topps Chrome'} ${players[i % players.length]} #${params.cardNumber ?? (i + 1)}`,
        player: players[i % players.length],
        year: params.year ?? 2023,
        set: params.set ?? 'Topps Chrome',
        cardNumber: params.cardNumber ?? String(i + 1),
        grade: params.grade ?? (Math.random() > 0.3 ? 'PSA 10' : undefined),
        gradingCompany: params.gradingCompany ?? 'PSA',
        price: Math.round(basePrice * 100) / 100,
        currency: 'USD',
        shippingCost: platform === 'ebay' ? 4.99 : 0,
        condition: params.grade ? 'graded' : 'raw',
        sellerName: `seller_${i}`,
        sellerRating: 95 + Math.random() * 5,
        imageUrl: '',
        listingUrl: `https://${platform}.example.com/item/${i}`,
        listedDate: new Date(Date.now() - Math.random() * 7 * 86_400_000).toISOString(),
        bestOfferEnabled: Math.random() > 0.5,
        watchers: Math.floor(Math.random() * 30),
      };
    });
  };

  return {
    async searchListings(params, _opts) {
      const listings = generateMockListings(params);
      return {
        listings,
        totalResults: listings.length + Math.floor(Math.random() * 100),
        hasMore: true,
        nextOffset: (params.offset ?? 0) + listings.length,
      };
    },

    async getSalesHistory(params, _opts) {
      const count = Math.min(params.limit ?? 20, 50);
      const sales: SaleRecord[] = Array.from({ length: count }, (_, i) => {
        const price = 30 + Math.random() * 400;
        return {
          id: `mock-sale-${i}-${Date.now()}`,
          platform: (['ebay', 'comc', 'myslabs'] as const)[i % 3],
          title: `${params.year ?? 2023} ${params.set ?? 'Topps'} ${params.player} #${params.cardNumber ?? (i + 1)}`,
          player: params.player,
          year: params.year ?? 2023,
          set: params.set ?? 'Topps',
          cardNumber: params.cardNumber ?? String(i + 1),
          grade: params.grade,
          gradingCompany: params.gradingCompany,
          salePrice: Math.round(price * 100) / 100,
          currency: 'USD',
          saleDate: new Date(Date.now() - i * 86_400_000).toISOString(),
          listingType: (['auction', 'buy_it_now', 'best_offer'] as const)[i % 3],
        };
      });
      const prices = sales.map((s) => s.salePrice);
      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return {
        sales,
        averagePrice: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
        medianPrice: median,
        priceRange: { min: sorted[0], max: sorted[sorted.length - 1] },
        totalSales: count,
        trendDirection: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      };
    },

    async getActiveListings(params, _opts) {
      const searchParams: MarketplaceSearchParams = {
        query: params.player,
        player: params.player,
        year: params.year,
        set: params.set,
        cardNumber: params.cardNumber,
        grade: params.grade,
        gradingCompany: params.gradingCompany,
        limit: params.limit,
      };
      const listings = generateMockListings(searchParams);
      return {
        listings,
        totalResults: listings.length,
        hasMore: false,
        nextOffset: listings.length,
      };
    },
  };
}

// ── 9b. Mock Grading Adapter ────────────────────────────────────────────────

function createMockGradingAdapter(): GradingAdapter {
  return {
    async getPopulationReport(params, _opts) {
      const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const totalGraded = 500 + Math.floor(Math.random() * 10000);
      const entries: PopulationReportEntry[] = grades.map((grade) => {
        const pop = grade >= 9
          ? Math.floor(Math.random() * 50)
          : Math.floor(Math.random() * totalGraded * 0.15);
        return {
          grade,
          population: pop,
          populationHigher: grades.filter((g) => g > grade).reduce((sum) => sum + Math.floor(Math.random() * 50), 0),
          totalPopulation: totalGraded,
        };
      });
      return {
        cardName: params.cardName,
        year: params.year ?? '2023',
        set: params.set ?? 'Topps Chrome',
        cardNumber: params.cardNumber ?? '1',
        company: params.company ?? 'psa',
        entries,
        lastUpdated: new Date().toISOString(),
        totalGraded,
      };
    },

    async getSubmissionStatus(submissionId, company, _opts) {
      const statuses: SubmissionTrackingRecord['status'][] = [
        'preparing', 'shipped', 'received', 'grading', 'graded', 'shipped_back', 'delivered',
      ];
      return {
        submissionId,
        company,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        cardCount: 5 + Math.floor(Math.random() * 20),
        submittedDate: new Date(Date.now() - 30 * 86_400_000).toISOString(),
        estimatedReturnDate: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      };
    },

    async listSubmissions(company, _opts) {
      const companies: GradingCompany[] = company ? [company] : ['psa', 'bgs', 'sgc'];
      return companies.flatMap((co) =>
        Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, i): SubmissionTrackingRecord => ({
          submissionId: `${co.toUpperCase()}-${1000 + i}`,
          company: co,
          status: (['shipped', 'received', 'grading', 'graded'] as const)[i % 4],
          cardCount: 3 + Math.floor(Math.random() * 15),
          submittedDate: new Date(Date.now() - (i + 1) * 15 * 86_400_000).toISOString(),
          estimatedReturnDate: new Date(Date.now() + (30 - i * 5) * 86_400_000).toISOString(),
        })),
      );
    },
  };
}

// ── 9c. Mock Financial Data Adapter ─────────────────────────────────────────

function createMockFinancialAdapter(): FinancialDataAdapter {
  const ASSET_LABELS: Record<FinancialAsset, string> = {
    sp500: 'S&P 500',
    bitcoin: 'Bitcoin',
    gold: 'Gold',
    treasuries: '10Y Treasury',
    realestate: 'Real Estate Index',
    ethereum: 'Ethereum',
  };

  const BASE_PRICES: Record<FinancialAsset, number> = {
    sp500: 5200,
    bitcoin: 68000,
    gold: 2350,
    treasuries: 4.25,
    realestate: 390,
    ethereum: 3800,
  };

  return {
    async getQuotes(assets, _opts) {
      return assets.map((asset): AssetQuote => {
        const base = BASE_PRICES[asset];
        const change = (Math.random() - 0.48) * base * 0.03;
        return {
          asset,
          label: ASSET_LABELS[asset],
          price: Math.round((base + change) * 100) / 100,
          change24h: Math.round(change * 100) / 100,
          changePercent24h: Math.round((change / base) * 10000) / 100,
          timestamp: new Date().toISOString(),
        };
      });
    },

    async getPriceHistory(params, _opts) {
      const days = params.days ?? 90;
      const base = BASE_PRICES[params.asset];
      let price = base * (0.9 + Math.random() * 0.1);
      const dataPoints: PriceDataPoint[] = Array.from({ length: days }, (_, i) => {
        const drift = (Math.random() - 0.48) * base * 0.02;
        price += drift;
        const high = price * (1 + Math.random() * 0.02);
        const low = price * (1 - Math.random() * 0.02);
        return {
          date: new Date(Date.now() - (days - i) * 86_400_000).toISOString().slice(0, 10),
          open: Math.round(price * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          close: Math.round((price + drift * 0.5) * 100) / 100,
          volume: Math.floor(Math.random() * 1_000_000),
        };
      });
      const closes = dataPoints.map((d) => d.close);
      return {
        asset: params.asset,
        dataPoints,
        periodReturn: Math.round(((closes[closes.length - 1] - closes[0]) / closes[0]) * 10000) / 100,
        periodHigh: Math.max(...closes),
        periodLow: Math.min(...closes),
      };
    },

    async getCorrelationMatrix(portfolioReturns, assets, _days, _opts) {
      const result: Record<string, number> = {};
      for (const asset of assets) {
        // Synthetic correlation values typical for cards vs. traditional assets.
        const correlations: Record<FinancialAsset, number> = {
          sp500: 0.15 + Math.random() * 0.2,
          bitcoin: 0.25 + Math.random() * 0.15,
          gold: -0.05 + Math.random() * 0.15,
          treasuries: -0.1 + Math.random() * 0.1,
          realestate: 0.1 + Math.random() * 0.1,
          ethereum: 0.2 + Math.random() * 0.2,
        };
        result[asset] = Math.round(correlations[asset] * 100) / 100;
      }
      return result as Record<FinancialAsset, number>;
    },
  };
}

// ── 9d. Mock Sports Data Adapter ────────────────────────────────────────────

function createMockSportsDataAdapter(): SportsDataAdapter {
  return {
    async getPlayerProfile(playerIdOrName, sport, _opts) {
      return {
        id: `mock-${playerIdOrName.replace(/\s/g, '-').toLowerCase()}`,
        name: playerIdOrName,
        sport,
        team: sport === 'mlb' ? 'Los Angeles Angels' : sport === 'nba' ? 'Dallas Mavericks' : 'Kansas City Chiefs',
        position: sport === 'mlb' ? 'CF' : sport === 'nba' ? 'PG' : 'QB',
        age: 25 + Math.floor(Math.random() * 10),
        height: "6'2\"",
        weight: '200 lbs',
        jerseyNumber: String(1 + Math.floor(Math.random() * 99)),
        status: 'active',
      };
    },

    async getPlayerStats(playerId, sport, season, _opts) {
      const seasonLabel = season ?? '2024';
      const statsByField: Record<SportsDataSport, Record<string, number | string>> = {
        mlb: { avg: '.301', hr: 35, rbi: 95, ops: '.912', sb: 12, gamesPlayed: 140 },
        nba: { ppg: 28.5, rpg: 8.2, apg: 9.1, spg: 1.3, fg_pct: 0.485 },
        nfl: { pass_yds: 4200, pass_td: 33, int: 10, qb_rating: 98.5 },
        nhl: { goals: 42, assists: 55, points: 97, plus_minus: 22 },
        soccer: { goals: 18, assists: 12, matches: 34, minutes: 2900 },
      };
      return {
        playerId,
        season: seasonLabel,
        sport,
        gamesPlayed: 100 + Math.floor(Math.random() * 60),
        stats: statsByField[sport],
      };
    },

    async getInjuryReports(sport, team, _opts) {
      const injuryTypes = ['hamstring strain', 'knee sprain', 'concussion', 'shoulder inflammation', 'back tightness'];
      const statuses: InjuryReport['status'][] = ['out', 'doubtful', 'questionable', 'probable', 'day-to-day'];
      return Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, i): InjuryReport => ({
        playerId: `mock-player-${i}`,
        playerName: ['Mike Trout', 'Luka Doncic', 'Patrick Mahomes', 'Connor McDavid', 'Kylian Mbappe'][i % 5],
        team: team ?? 'Team ' + (i + 1),
        sport,
        injuryType: injuryTypes[i % injuryTypes.length],
        bodyPart: ['hamstring', 'knee', 'head', 'shoulder', 'back'][i % 5],
        status: statuses[i % statuses.length],
        reportDate: new Date().toISOString().slice(0, 10),
        estimatedReturnDate: new Date(Date.now() + (7 + i * 7) * 86_400_000).toISOString().slice(0, 10),
        details: `${injuryTypes[i % injuryTypes.length]} — updated ${new Date().toLocaleDateString()}`,
      }));
    },

    async getSchedule(sport, daysAhead, team, _opts) {
      const days = daysAhead ?? 14;
      return Array.from({ length: Math.min(days, 10) }, (_, i): GameScheduleEntry => ({
        id: `mock-game-${i}`,
        sport,
        homeTeam: team ?? `Home Team ${i + 1}`,
        awayTeam: `Away Team ${i + 1}`,
        scheduledDate: new Date(Date.now() + i * 86_400_000).toISOString(),
        venue: `Stadium ${i + 1}`,
        broadcastNetwork: ['ESPN', 'FOX', 'NBC', 'TNT'][i % 4],
        status: i === 0 ? 'in_progress' : 'scheduled',
      }));
    },
  };
}

// ── 9e. Mock Social Data Adapter ────────────────────────────────────────────

function createMockSocialDataAdapter(): SocialDataAdapter {
  return {
    async getSentiment(params, _opts) {
      const platforms: SocialPlatform[] = params.platforms ?? ['twitter', 'reddit', 'forums'];
      return platforms.map((platform): SocialSentiment => {
        const score = Math.round((Math.random() - 0.3) * 150);
        const clamped = Math.max(-100, Math.min(100, score));
        const level = clamped >= 60 ? 'very_positive' : clamped >= 20 ? 'positive' : clamped >= -20 ? 'neutral' : clamped >= -60 ? 'negative' : 'very_negative';
        return {
          topic: params.topic,
          platform,
          sentimentScore: clamped,
          volume: 500 + Math.floor(Math.random() * 15000),
          trendDirection: Math.random() > 0.5 ? 'rising' : Math.random() > 0.5 ? 'falling' : 'stable',
          sentimentLevel: level,
          samplePosts: Array.from({ length: 3 }, (_, j): SocialPost => ({
            id: `mock-post-${platform}-${j}`,
            platform,
            author: `user_${Math.floor(Math.random() * 10000)}`,
            authorFollowerCount: 100 + Math.floor(Math.random() * 50000),
            content: `${params.topic} is ${clamped > 0 ? 'looking great' : 'concerning'} right now. #sportscards`,
            sentiment: clamped + Math.floor(Math.random() * 20 - 10),
            engagementScore: Math.floor(Math.random() * 1000),
            timestamp: new Date(Date.now() - j * 3_600_000).toISOString(),
            url: `https://${platform}.example.com/post/${j}`,
          })),
          keywords: [params.topic, 'sportscards', 'investment', 'grading', 'PSA 10'],
          timestamp: new Date().toISOString(),
        };
      });
    },

    async getInfluencerActivity(_opts) {
      const influencers = [
        { id: 'inf-1', username: 'CardCollectorPro', platform: 'twitter' as const, followers: 125000 },
        { id: 'inf-2', username: 'SlabKing', platform: 'youtube' as const, followers: 89000 },
        { id: 'inf-3', username: 'WaxRippers', platform: 'instagram' as const, followers: 210000 },
      ];
      const actions: InfluencerActivity['action'][] = ['mentioned', 'bought', 'sold', 'graded', 'listed', 'reviewed'];
      return influencers.flatMap((inf, i) =>
        Array.from({ length: 2 }, (_, j): InfluencerActivity => ({
          influencerId: inf.id,
          username: inf.username,
          platform: inf.platform,
          followerCount: inf.followers,
          action: actions[(i + j) % actions.length],
          cardReference: ['2023 Bowman Chrome Victor Wembanyama', '2022 Topps Mike Trout PSA 10', '2024 Prizm Jaylen Brown'][
            (i + j) % 3
          ],
          timestamp: new Date(Date.now() - (i + j) * 3_600_000).toISOString(),
          estimatedMarketImpact: Math.round(Math.random() * 15 * 100) / 100,
          reachEstimate: Math.floor(inf.followers * (0.05 + Math.random() * 0.15)),
        })),
      );
    },

    async getTrendingTopics(platforms, limit, _opts) {
      const topics = [
        { topic: 'Victor Wembanyama Rookie', volume: 32000, sentiment: 78 },
        { topic: 'PSA 10 Gem Rate Drop', volume: 18500, sentiment: -35 },
        { topic: '2024 Bowman Release', volume: 25000, sentiment: 62 },
        { topic: 'Shohei Ohtani HR Record', volume: 41000, sentiment: 85 },
        { topic: 'BGS vs PSA Debate', volume: 12000, sentiment: 5 },
        { topic: 'Vintage Card Surge', volume: 9800, sentiment: 55 },
        { topic: 'Panini Losing NBA License', volume: 28000, sentiment: -20 },
      ];
      return topics.slice(0, limit ?? 10);
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 10 — Live adapter stubs
// ════════════════════════════════════════════════════════════════════════════

/**
 * Live adapters have the fetch calls fully structured but currently
 * fall back to mock data with a `logger.warn` when the API key is
 * not configured.  This allows a developer to drop in a real key and
 * immediately get live data without changing any call sites.
 */

function createLiveMarketplaceAdapter(apiKey: string): MarketplaceAdapter {
  const adapterName: AdapterName = 'marketplace';

  return {
    async searchListings(params, opts) {
      try {
        const queryParts = [params.query, params.player, params.year, params.set, params.grade].filter(Boolean);
        const q = encodeURIComponent(queryParts.join(' '));
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&limit=${params.limit ?? 20}&offset=${params.offset ?? 0}`;

        return await liveFetch<MarketplaceSearchResult>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `marketplace:search:${q}:${params.limit}:${params.offset}`,
          dataType: 'listings',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live marketplace searchListings failed, falling back to mock data.', err);
        return createMockMarketplaceAdapter().searchListings(params, opts);
      }
    },

    async getSalesHistory(params, opts) {
      try {
        const q = encodeURIComponent(`${params.player} ${params.year ?? ''} ${params.set ?? ''} ${params.grade ?? ''}`.trim());
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&filter=buyingOptions:{FIXED_PRICE|AUCTION},priceCurrency:USD,conditions:{1000|3000}&limit=${params.limit ?? 20}`;

        return await liveFetch<SalesHistoryResult>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `marketplace:sales:${q}`,
          dataType: 'sales-history',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live marketplace getSalesHistory failed, falling back to mock data.', err);
        return createMockMarketplaceAdapter().getSalesHistory(params, opts);
      }
    },

    async getActiveListings(params, opts) {
      try {
        const q = encodeURIComponent(`${params.player} ${params.year ?? ''} ${params.set ?? ''} ${params.grade ?? ''}`.trim());
        const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${q}&limit=${params.limit ?? 20}`;

        return await liveFetch<MarketplaceSearchResult>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `marketplace:active:${q}`,
          dataType: 'listings',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live marketplace getActiveListings failed, falling back to mock data.', err);
        return createMockMarketplaceAdapter().getActiveListings(params, opts);
      }
    },
  };
}

function createLiveGradingAdapter(apiKey: string): GradingAdapter {
  const adapterName: AdapterName = 'grading';

  return {
    async getPopulationReport(params, opts) {
      try {
        const q = encodeURIComponent(`${params.cardName} ${params.year ?? ''} ${params.set ?? ''}`.trim());
        const url = `https://api.psacard.com/publicapi/pop/GetPSAPopByCardName?cardName=${q}`;

        return await liveFetch<PopulationReport>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `grading:pop:${q}`,
          dataType: 'pop-report',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live grading getPopulationReport failed, falling back to mock data.', err);
        return createMockGradingAdapter().getPopulationReport(params, opts);
      }
    },

    async getSubmissionStatus(submissionId, company, opts) {
      try {
        const url = `https://api.psacard.com/publicapi/cert/GetByCertNumber/${submissionId}`;

        return await liveFetch<SubmissionTrackingRecord>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `grading:submission:${company}:${submissionId}`,
          dataType: 'pop-report',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live grading getSubmissionStatus failed, falling back to mock data.', err);
        return createMockGradingAdapter().getSubmissionStatus(submissionId, company, opts);
      }
    },

    async listSubmissions(company, opts) {
      // No public API endpoint for listing all user submissions.
      logger.warn('[apiAdapterLayer] listSubmissions has no live API endpoint; returning mock data.');
      return createMockGradingAdapter().listSubmissions(company, opts);
    },
  };
}

function createLiveFinancialAdapter(apiKey: string): FinancialDataAdapter {
  const adapterName: AdapterName = 'financial';

  const YAHOO_SYMBOLS: Record<FinancialAsset, string> = {
    sp500: '%5EGSPC',
    bitcoin: 'BTC-USD',
    gold: 'GC=F',
    treasuries: '%5ETNX',
    realestate: 'VNQ',
    ethereum: 'ETH-USD',
  };

  return {
    async getQuotes(assets, opts) {
      try {
        const symbols = assets.map((a) => YAHOO_SYMBOLS[a]).join(',');
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

        return await liveFetch<AssetQuote[]>(adapterName, url, {
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `financial:quotes:${symbols}`,
          dataType: 'quote',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live financial getQuotes failed, falling back to mock data.', err);
        return createMockFinancialAdapter().getQuotes(assets, opts);
      }
    },

    async getPriceHistory(params, opts) {
      try {
        const symbol = YAHOO_SYMBOLS[params.asset];
        const days = params.days ?? 90;
        const period1 = Math.floor((Date.now() - days * 86_400_000) / 1000);
        const period2 = Math.floor(Date.now() / 1000);
        const interval = params.interval === 'monthly' ? '1mo' : params.interval === 'weekly' ? '1wk' : '1d';
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;

        return await liveFetch<PriceHistoryResult>(adapterName, url, {
          method: 'GET',
          headers: { 'X-API-KEY': apiKey },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `financial:history:${symbol}:${days}:${interval}`,
          dataType: 'price-history',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live financial getPriceHistory failed, falling back to mock data.', err);
        return createMockFinancialAdapter().getPriceHistory(params, opts);
      }
    },

    async getCorrelationMatrix(portfolioReturns, assets, days, opts) {
      // Correlation computation is done client-side from price history.
      // Fetch price histories then compute Pearson correlation.
      try {
        const histories = await Promise.all(
          assets.map((asset) => this.getPriceHistory({ asset, days }, opts)),
        );
        const result: Record<string, number> = {};
        for (let i = 0; i < assets.length; i++) {
          const assetReturns = histories[i].dataPoints.slice(1).map((d, idx) => {
            const prev = histories[i].dataPoints[idx].close;
            return prev !== 0 ? (d.close - prev) / prev : 0;
          });
          result[assets[i]] = pearsonCorrelation(portfolioReturns.slice(0, assetReturns.length), assetReturns);
        }
        return result as Record<FinancialAsset, number>;
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live financial getCorrelationMatrix failed, falling back to mock data.', err);
        return createMockFinancialAdapter().getCorrelationMatrix(portfolioReturns, assets, days, opts);
      }
    },
  };
}

function createLiveSportsDataAdapter(apiKey: string): SportsDataAdapter {
  const adapterName: AdapterName = 'sports';

  const SPORT_BASE: Record<SportsDataSport, string> = {
    mlb: 'https://api.sportradar.com/mlb/trial/v7/en',
    nba: 'https://api.sportradar.com/nba/trial/v8/en',
    nfl: 'https://api.sportradar.com/nfl/official/trial/v7/en',
    nhl: 'https://api.sportradar.com/nhl/trial/v7/en',
    soccer: 'https://api.sportradar.com/soccer/trial/v4/en',
  };

  return {
    async getPlayerProfile(playerIdOrName, sport, opts) {
      try {
        const url = `${SPORT_BASE[sport]}/players/${encodeURIComponent(playerIdOrName)}/profile.json?api_key=${apiKey}`;

        return await liveFetch<PlayerProfile>(adapterName, url, {
          method: 'GET',
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `sports:profile:${sport}:${playerIdOrName}`,
          dataType: 'player-profile',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live sports getPlayerProfile failed, falling back to mock data.', err);
        return createMockSportsDataAdapter().getPlayerProfile(playerIdOrName, sport, opts);
      }
    },

    async getPlayerStats(playerId, sport, season, opts) {
      try {
        const s = season ?? '2024';
        const url = `${SPORT_BASE[sport]}/players/${encodeURIComponent(playerId)}/statistics.json?season=${s}&api_key=${apiKey}`;

        return await liveFetch<PlayerStatLine>(adapterName, url, {
          method: 'GET',
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `sports:stats:${sport}:${playerId}:${s}`,
          dataType: 'player-profile',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live sports getPlayerStats failed, falling back to mock data.', err);
        return createMockSportsDataAdapter().getPlayerStats(playerId, sport, season, opts);
      }
    },

    async getInjuryReports(sport, team, opts) {
      try {
        const teamParam = team ? `&team=${encodeURIComponent(team)}` : '';
        const url = `${SPORT_BASE[sport]}/injuries.json?api_key=${apiKey}${teamParam}`;

        return await liveFetch<InjuryReport[]>(adapterName, url, {
          method: 'GET',
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `sports:injuries:${sport}:${team ?? 'all'}`,
          dataType: 'injury-report',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live sports getInjuryReports failed, falling back to mock data.', err);
        return createMockSportsDataAdapter().getInjuryReports(sport, team, opts);
      }
    },

    async getSchedule(sport, daysAhead, team, opts) {
      try {
        const url = `${SPORT_BASE[sport]}/games/schedule.json?api_key=${apiKey}`;

        return await liveFetch<GameScheduleEntry[]>(adapterName, url, {
          method: 'GET',
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `sports:schedule:${sport}:${team ?? 'all'}:${daysAhead ?? 14}`,
          dataType: 'schedule',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live sports getSchedule failed, falling back to mock data.', err);
        return createMockSportsDataAdapter().getSchedule(sport, daysAhead, team, opts);
      }
    },
  };
}

function createLiveSocialDataAdapter(twitterToken?: string, _redditCreds?: string): SocialDataAdapter {
  const adapterName: AdapterName = 'social';

  return {
    async getSentiment(params, opts) {
      try {
        if (!twitterToken) throw createAdapterError(adapterName, 'No Twitter bearer token configured', 'auth', { retryable: false });

        const q = encodeURIComponent(params.topic + ' sportscards');
        const url = `https://api.twitter.com/2/tweets/search/recent?query=${q}&max_results=${params.limit ?? 10}&tweet.fields=public_metrics,created_at`;

        return await liveFetch<SocialSentiment[]>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${twitterToken}`,
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `social:sentiment:${q}`,
          dataType: 'sentiment',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live social getSentiment failed, falling back to mock data.', err);
        return createMockSocialDataAdapter().getSentiment(params, opts);
      }
    },

    async getInfluencerActivity(opts) {
      // No single API for this; would require aggregating across platforms.
      logger.warn('[apiAdapterLayer] getInfluencerActivity uses mock data (cross-platform aggregation not yet implemented).');
      return createMockSocialDataAdapter().getInfluencerActivity(opts);
    },

    async getTrendingTopics(platforms, limit, opts) {
      try {
        if (!twitterToken) throw createAdapterError(adapterName, 'No Twitter bearer token configured', 'auth', { retryable: false });

        const url = 'https://api.twitter.com/2/tweets/search/recent?query=sportscards OR sportscard&max_results=100&tweet.fields=public_metrics';

        return await liveFetch<{ topic: string; volume: number; sentiment: number }[]>(adapterName, url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${twitterToken}`,
          },
        }, {
          ...opts,
          cacheKey: opts?.cacheKey ?? `social:trending:${(platforms ?? []).join(',')}`,
          dataType: 'trending',
        });
      } catch (err) {
        logger.warn('[apiAdapterLayer] Live social getTrendingTopics failed, falling back to mock data.', err);
        return createMockSocialDataAdapter().getTrendingTopics(platforms, limit, opts);
      }
    },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 11 — Adapter registry
// ════════════════════════════════════════════════════════════════════════════

/** Cached adapter instances (cleared when config changes). */
const _adapterCache = new Map<AdapterName, unknown>();

/** Tracks the current status of each adapter. */
const _adapterStatuses = new Map<AdapterName, AdapterStatus>();

/**
 * Determine whether an adapter should run in live mode.
 *
 * An adapter is live when:
 * 1. The master `enabled` flag is `true`, AND
 * 2. The relevant API key(s) are present.
 */
function shouldUseLive(name: AdapterName, config: ApiConfig): boolean {
  if (!config.enabled) return false;
  switch (name) {
    case 'marketplace':
      return Boolean(config.ebayApiKey);
    case 'grading':
      return Boolean(config.psaApiKey);
    case 'financial':
      return Boolean(config.yahooFinanceKey || config.coingeckoKey);
    case 'sports':
      return Boolean(config.sportRadarKey);
    case 'social':
      return Boolean(config.twitterBearerToken || config.redditClientCredentials);
    default:
      return false;
  }
}

/**
 * Factory that instantiates the correct adapter (live or mock)
 * for a given name and config.
 */
function createAdapter<K extends AdapterName>(name: K, config: ApiConfig): AdapterTypeMap[K] {
  const live = shouldUseLive(name, config);

  type Creator = () => AdapterTypeMap[K];

  const creators: Record<AdapterName, { live: Creator; mock: Creator }> = {
    marketplace: {
      live: () => createLiveMarketplaceAdapter(config.ebayApiKey!) as AdapterTypeMap[K],
      mock: () => createMockMarketplaceAdapter() as AdapterTypeMap[K],
    },
    grading: {
      live: () => createLiveGradingAdapter(config.psaApiKey!) as AdapterTypeMap[K],
      mock: () => createMockGradingAdapter() as AdapterTypeMap[K],
    },
    financial: {
      live: () => createLiveFinancialAdapter(config.yahooFinanceKey ?? config.coingeckoKey ?? '') as AdapterTypeMap[K],
      mock: () => createMockFinancialAdapter() as AdapterTypeMap[K],
    },
    sports: {
      live: () => createLiveSportsDataAdapter(config.sportRadarKey!) as AdapterTypeMap[K],
      mock: () => createMockSportsDataAdapter() as AdapterTypeMap[K],
    },
    social: {
      live: () => createLiveSocialDataAdapter(config.twitterBearerToken, config.redditClientCredentials) as AdapterTypeMap[K],
      mock: () => createMockSocialDataAdapter() as AdapterTypeMap[K],
    },
  };

  try {
    const adapter = live ? creators[name].live() : creators[name].mock();
    _adapterStatuses.set(name, live ? 'live' : 'mock');
    return adapter;
  } catch (err) {
    logger.error(`[apiAdapterLayer] Failed to create ${live ? 'live' : 'mock'} adapter for '${name}':`, err);
    _adapterStatuses.set(name, 'error');
    // Always fall back to mock on error.
    return creators[name].mock();
  }
}

/**
 * Retrieve an adapter by name.
 *
 * Returns the live implementation when the corresponding API key is
 * configured and the master switch is enabled; otherwise returns the
 * mock implementation.  Adapters are cached per configuration cycle.
 *
 * @example
 * ```ts
 * const marketplace = getAdapter('marketplace');
 * const results = await marketplace.searchListings({ query: 'Trout PSA 10' });
 * ```
 */
export function getAdapter<K extends AdapterName>(name: K): AdapterTypeMap[K] {
  const cached = _adapterCache.get(name);
  if (cached) return cached as AdapterTypeMap[K];

  const config = getApiConfig();
  const adapter = createAdapter(name, config);
  _adapterCache.set(name, adapter);
  return adapter;
}

/**
 * Check whether a specific adapter is currently running in live mode.
 */
export function isLiveMode(name: AdapterName): boolean {
  // Ensure the adapter has been instantiated so the status is set.
  if (!_adapterStatuses.has(name)) {
    getAdapter(name);
  }
  return _adapterStatuses.get(name) === 'live';
}

/**
 * Return the current status of every registered adapter.
 *
 * Instantiates any adapters that haven't been created yet so the map
 * is always complete.
 */
export function getAdapterStatus(): AdapterStatusMap {
  const allNames: AdapterName[] = ['marketplace', 'grading', 'financial', 'sports', 'social'];
  for (const name of allNames) {
    if (!_adapterStatuses.has(name)) {
      getAdapter(name);
    }
  }
  return Object.fromEntries(_adapterStatuses.entries()) as AdapterStatusMap;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 12 — Utility: Pearson correlation
// ════════════════════════════════════════════════════════════════════════════

/**
 * Compute Pearson correlation coefficient between two equal-length arrays.
 *
 * @returns A value between -1 and 1, or 0 if computation is degenerate.
 */
function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n === 0) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumX2 += xs[i] * xs[i];
    sumY2 += ys[i] * ys[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 13 — Convenience exports for direct mock access (testing)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Directly create a mock adapter (bypasses the registry).
 * Useful in unit tests where you want a predictable adapter.
 */
export const mockAdapters = {
  marketplace: createMockMarketplaceAdapter,
  grading: createMockGradingAdapter,
  financial: createMockFinancialAdapter,
  sports: createMockSportsDataAdapter,
  social: createMockSocialDataAdapter,
} as const;
