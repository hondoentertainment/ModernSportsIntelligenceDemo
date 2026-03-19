/**
 * localStorage-backed StorageAdapter
 *
 * Preserves existing behaviour — reads/writes JSON from localStorage.
 * Handles quota errors with graceful degradation.
 */

import { logger } from '../logger';
import type { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'msi_') {
    this.prefix = prefix;
  }

  private prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.prefixedKey(key));
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.warn(`[DAL:local] Failed to read key "${key}"`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      localStorage.setItem(this.prefixedKey(key), serialized);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        logger.warn(`[DAL:local] Quota exceeded writing key "${key}", attempting cleanup`);
        this.pruneOldEntries();
        try {
          localStorage.setItem(this.prefixedKey(key), serialized);
        } catch {
          logger.error(`[DAL:local] Failed to write key "${key}" after cleanup`);
        }
      } else {
        logger.error(`[DAL:local] Failed to write key "${key}"`, err);
      }
    }
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefixedKey(key));
  }

  async keys(): Promise<string[]> {
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(this.prefix)) {
        result.push(k.slice(this.prefix.length));
      }
    }
    return result;
  }

  /** Remove stale/old entries to free quota */
  private pruneOldEntries(): void {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(this.prefix) && k.includes('_cache_')) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    logger.info(`[DAL:local] Pruned ${toRemove.length} cache entries`);
  }
}
