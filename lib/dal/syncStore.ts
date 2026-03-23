/**
 * SyncedStore — Synchronous Read/Write Cache backed by the DAL
 *
 * All 150+ service files use synchronous load/save patterns. This store
 * provides the same synchronous API while persisting through the async DAL
 * in the background.
 *
 * Architecture:
 * ┌─────────────┐    sync     ┌───────────┐     async     ┌──────────┐
 * │  Service     │──────────►│ SyncedStore│───────────────►│   DAL    │
 * │  (load/save) │◄──────────│  (memory)  │◄───────────────│(LS/Supa) │
 * └─────────────┘            └───────────┘                └──────────┘
 *
 * Usage (drop-in replacement for localStorage.getItem/setItem):
 *
 *   import { store } from '../dal/syncStore';
 *
 *   // Before:
 *   // const raw = localStorage.getItem('msi_goals');
 *   // localStorage.setItem('msi_goals', JSON.stringify(goals));
 *
 *   // After:
 *   const goals = store.get<Goal[]>('msi_goals', []);
 *   store.set('msi_goals', goals);
 */

import { logger } from '../logger';
import type { StorageAdapter } from './StorageAdapter';

class SyncedStore {
  /** In-memory cache — source of truth for synchronous reads */
  private cache: Map<string, unknown> = new Map();

  /** Keys that are dirty and need DAL write-back */
  private dirty: Set<string> = new Set();

  /** Timer for batched DAL writes */
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /** The async DAL adapter (set after app initialization) */
  private adapter: StorageAdapter | null = null;

  /** Flush interval in ms */
  private flushIntervalMs = 500;

  /** Whether initial hydration from DAL is complete */
  private hydrated = false;

  // ─── Public API (Synchronous) ──────────────────────────────────────

  /**
   * Synchronous read. Returns cached value or fallback.
   * Falls back to localStorage if cache miss and not yet hydrated.
   */
  get<T>(key: string, fallback: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    // Cache miss: try reading from localStorage directly (sync)
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        this.cache.set(key, parsed);
        return parsed;
      }
    } catch {
      // ignore parse errors
    }

    return fallback;
  }

  /**
   * Synchronous write. Updates cache immediately, DAL write is batched.
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, value);

    // Also write to localStorage synchronously (fast path)
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded — DAL will handle persistence
    }

    // Mark for async DAL write-back
    this.dirty.add(key);
    this.scheduleFlush();
  }

  /**
   * Synchronous remove.
   */
  remove(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }

    if (this.adapter) {
      this.adapter.remove(key).catch((err) => {
        logger.warn(`[SyncedStore] Failed to remove "${key}" from DAL`, err);
      });
    }
  }

  /**
   * Check if a key exists in cache or localStorage.
   */
  has(key: string): boolean {
    if (this.cache.has(key)) return true;
    return localStorage.getItem(key) !== null;
  }

  // ─── DAL Integration ──────────────────────────────────────────────

  /**
   * Set the DAL adapter. Called once during app initialization.
   */
  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Hydrate cache from DAL (called once after adapter is set).
   * Reads all keys from the DAL and populates the cache.
   * Existing cache values (from localStorage) take precedence during migration.
   */
  async hydrate(): Promise<void> {
    if (!this.adapter || this.hydrated) return;

    try {
      const keys = await this.adapter.keys();
      for (const key of keys) {
        // Only fill gaps — don't overwrite localStorage data
        if (!this.cache.has(key)) {
          const value = await this.adapter.get(key);
          if (value !== null) {
            this.cache.set(key, value);
          }
        }
      }
      this.hydrated = true;
      logger.info(`[SyncedStore] Hydrated ${keys.length} keys from DAL`);
    } catch (err) {
      logger.warn('[SyncedStore] Hydration failed, using localStorage cache', err);
    }
  }

  // ─── Internal ─────────────────────────────────────────────────────

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => this.flush(), this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    this.flushTimer = null;
    if (!this.adapter || this.dirty.size === 0) return;

    const keys = Array.from(this.dirty);
    this.dirty.clear();

    for (const key of keys) {
      const value = this.cache.get(key);
      if (value !== undefined) {
        try {
          await this.adapter.set(key, value);
        } catch (err) {
          logger.warn(`[SyncedStore] DAL write failed for "${key}"`, err);
          // Re-mark as dirty for next flush
          this.dirty.add(key);
        }
      }
    }

    // If there are still dirty keys, schedule another flush
    if (this.dirty.size > 0) {
      this.scheduleFlush();
    }
  }

  /**
   * Force an immediate flush of all dirty keys to the DAL.
   * Useful before page unload or when switching users.
   */
  async forceFlush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  /**
   * Clear the entire cache. Used when switching users.
   */
  clear(): void {
    this.cache.clear();
    this.dirty.clear();
    this.hydrated = false;
  }
}

/** Singleton store instance */
export const store = new SyncedStore();

/**
 * List localStorage key names, optionally filtered by prefix (empty string = all keys).
 * For prune/clear/diagnostics; not a substitute for async DAL `keys()`.
 */
export function listLocalStorageKeysWithPrefix(prefix: string): string[] {
  if (typeof localStorage === 'undefined') return [];
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (prefix === '' || k.startsWith(prefix)) out.push(k);
  }
  return out;
}

/**
 * One-time JSON key migration: copy legacyKey → canonicalKey in localStorage, remove legacy.
 * Sets doneFlagKey to "1" so migration runs once per browser profile.
 */
export function migrateLocalStorageJsonKeyOnce(
  legacyKey: string,
  canonicalKey: string,
  doneFlagKey: string,
): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(doneFlagKey) === '1') return;
  try {
    if (localStorage.getItem(canonicalKey) === null) {
      const raw = localStorage.getItem(legacyKey);
      if (raw !== null) {
        localStorage.setItem(canonicalKey, raw);
        localStorage.removeItem(legacyKey);
      }
    }
  } finally {
    localStorage.setItem(doneFlagKey, '1');
  }
}
