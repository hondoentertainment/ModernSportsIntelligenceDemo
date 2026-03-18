/**
 * API Response Cache — In-memory LRU with TTL.
 *
 * Caches API responses to reduce external calls and improve latency.
 * Entries expire after their TTL and are evicted LRU when capacity is reached.
 */

import { logger } from './logger';

interface CacheEntry<T = unknown> {
  value: T;
  storedAt: number;
  expiresAt: number;
  key: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

export interface ApiCacheOptions {
  /** Maximum number of entries. Default: 500 */
  maxEntries?: number;
  /** Default TTL in ms. Default: 5 minutes */
  defaultTtlMs?: number;
}

/** Recommended TTLs by data type */
export const CACHE_TTL = {
  /** Real-time pricing: 2 minutes */
  PRICE_REALTIME: 2 * 60 * 1000,
  /** Market search results: 5 minutes */
  MARKET_SEARCH: 5 * 60 * 1000,
  /** Player profiles: 1 hour */
  PLAYER_PROFILE: 60 * 60 * 1000,
  /** Population reports: 6 hours */
  POP_REPORT: 6 * 60 * 60 * 1000,
  /** Cert verification: 24 hours */
  CERT_VERIFICATION: 24 * 60 * 60 * 1000,
  /** Static reference data: 7 days */
  REFERENCE_DATA: 7 * 24 * 60 * 60 * 1000,
} as const;

export class ApiCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(options?: ApiCacheOptions) {
    this.maxEntries = options?.maxEntries ?? 500;
    this.defaultTtlMs = options?.defaultTtlMs ?? 5 * 60 * 1000;
  }

  /** Get a cached value. Returns undefined if missing or expired. */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Move to end (most recently used) - Map insertion order
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value as T;
  }

  /** Store a value with optional TTL override. */
  set<T>(key: string, value: T, ttlMs?: number): void {
    // Evict if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      // Delete oldest (first in Map iteration order)
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }

    const now = Date.now();
    const ttl = ttlMs ?? this.defaultTtlMs;

    this.cache.set(key, {
      value,
      storedAt: now,
      expiresAt: now + ttl,
      key,
    });
  }

  /** Check if a key exists and is not expired. */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /** Delete a specific key. */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Clear all entries and reset stats. */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cached value or fetch it. Prevents duplicate in-flight requests
   * for the same key (request coalescing).
   */
  private inflight = new Map<string, Promise<unknown>>();

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>, ttlMs?: number): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    // Coalesce duplicate in-flight requests
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher()
      .then((value) => {
        this.set(key, value, ttlMs);
        this.inflight.delete(key);
        return value;
      })
      .catch((err) => {
        this.inflight.delete(key);
        throw err;
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /** Get cache performance stats. */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      maxSize: this.maxEntries,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }

  /** Purge all expired entries. Call periodically to free memory. */
  purgeExpired(): number {
    const now = Date.now();
    let purged = 0;
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        purged++;
      }
    }
    if (purged > 0) {
      logger.info(`[ApiCache] Purged ${purged} expired entries`);
    }
    return purged;
  }
}

/** Shared singleton cache instance for all API adapters */
export const apiCache = new ApiCache({ maxEntries: 1000, defaultTtlMs: 5 * 60 * 1000 });
