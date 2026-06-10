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

  /** Keys written programmatically since the last hydration (protect in-flight writes). */
  private writtenSinceHydration: Set<string> = new Set();

  /** Timer for batched DAL writes */
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  /** The async DAL adapter (set after app initialization) */
  private adapter: StorageAdapter | null = null;

  /** Flush interval in ms */
  private flushIntervalMs = 500;

  /** Whether initial hydration from DAL is complete */
  private hydrated = false;

  /** Count of keys currently pending a Supabase write */
  private pendingWrites = 0;

  /** Most recent DAL write error (null = no error since last success) */
  private lastSyncError: string | null = null;

  /** Listeners subscribed to sync-status changes */
  private statusListeners: Set<() => void> = new Set();

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
   *
   * Security boundary: this is a **generic** key-value sink — callers are
   * responsible for redacting secrets at the source before storing. Today:
   * - API platform keys (`apiPlatformService.createAPIKey`) are masked via
   *   `maskKey()` before persist; the raw 36-char key is returned to the
   *   caller once and never stored.
   * - PSA `certNumber` and `lookupPsaCert()` results are public lookup IDs
   *   (printed on the slab, listed in eBay), not credentials.
   *
   * Do **not** store auth tokens, Stripe customer IDs, raw API keys, or
   * unmasked PII through this method.
   */
  set<T>(key: string, value: T): void {
    this.writtenSinceHydration.add(key);
    this.cache.set(key, value);

    // Also write to localStorage synchronously (fast path)
    try {
      // CodeQL flags this sink for `js/clear-text-storage-of-sensitive-information`
      // because its heuristic tags any `cert*` or `*apiKey*` field as sensitive.
      // Per the contract documented above, every value reaching this sink is
      // either non-sensitive (public PSA cert IDs, masked API keys) or
      // user-owned demo data. Audited in scripts/audit-localstorage.mjs.
      // lgtm[js/clear-text-storage-of-sensitive-information]
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

  // ─── Sync Status ──────────────────────────────────────────────────

  /** Returns a snapshot of the current sync state. */
  getSyncStatus(): { syncing: boolean; hydrated: boolean; lastError: string | null } {
    return {
      syncing: this.pendingWrites > 0,
      hydrated: this.hydrated,
      lastError: this.lastSyncError,
    };
  }

  /**
   * Subscribe to sync-status changes. Returns an unsubscribe function.
   * Fires whenever syncing, hydrated, or lastError changes.
   */
  onStatusChange(listener: () => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private notifyStatusListeners(): void {
    for (const fn of this.statusListeners) fn();
  }

  // ─── DAL Integration ──────────────────────────────────────────────

  /**
   * Set the DAL adapter. Called once during app initialization.
   */
  setAdapter(adapter: StorageAdapter): void {
    this.adapter = adapter;
  }

  /**
   * Hydrate cache from the DAL (called once after adapter is set).
   *
   * The remote adapter (Supabase) is the canonical source of truth for
   * authenticated users — its values overwrite any stale local data, except
   * for keys that were explicitly written since this hydration started (those
   * in-flight writes are already queued for a remote flush and must not be
   * clobbered by older remote data).
   */
  async hydrate(): Promise<void> {
    if (!this.adapter || this.hydrated) return;

    try {
      const keys = await this.adapter.keys();

      // Parallel reads for speed — Supabase can handle fan-out for N ≤ 200 keys
      await Promise.all(
        keys.map(async (key) => {
          // Skip keys the user wrote after we started hydrating — their pending
          // flush already has the authoritative value.
          if (this.writtenSinceHydration.has(key)) return;

          const value = await this.adapter!.get(key);
          if (value !== null) {
            this.cache.set(key, value);
            // Mirror back to localStorage so subsequent cold loads are instant
            try {
              localStorage.setItem(key, JSON.stringify(value));
            } catch {
              // Quota exceeded — non-fatal; Supabase remains the source of truth
            }
          }
        }),
      );

      this.hydrated = true;
      this.writtenSinceHydration.clear();
      this.notifyStatusListeners();
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

    this.pendingWrites += keys.length;
    this.notifyStatusListeners();

    let errorEncountered = false;
    for (const key of keys) {
      const value = this.cache.get(key);
      if (value !== undefined) {
        try {
          await this.adapter.set(key, value);
          this.lastSyncError = null;
        } catch (err) {
          errorEncountered = true;
          const msg = err instanceof Error ? err.message : String(err);
          this.lastSyncError = msg;
          logger.warn(`[SyncedStore] DAL write failed for "${key}"`, err);
          // Re-mark as dirty for next flush
          this.dirty.add(key);
        } finally {
          this.pendingWrites = Math.max(0, this.pendingWrites - 1);
        }
      } else {
        this.pendingWrites = Math.max(0, this.pendingWrites - 1);
      }
    }

    this.notifyStatusListeners();

    // If there are still dirty keys, schedule another flush
    if (this.dirty.size > 0 && !errorEncountered) {
      this.scheduleFlush();
    } else if (errorEncountered) {
      // Back off before retrying failed keys
      setTimeout(() => this.scheduleFlush(), 5000);
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
    this.writtenSinceHydration.clear();
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
