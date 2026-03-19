/**
 * Data Access Layer (DAL) abstraction for production-grade data persistence.
 *
 * Services should use the DAL instead of direct localStorage. When userId is present
 * and Supabase is configured, data is persisted to Supabase. Otherwise, localStorage
 * is used as a fallback (demo/guest mode).
 *
 * Migration guide:
 * - Replace localStorage.getItem(KEY) with dal.getJson<T>(KEY) or use entity methods.
 * - Replace localStorage.setItem(KEY, val) with dal.setJson(KEY, val) or use entity methods.
 * - For cards/targets: use getCards(), setCards(), getTargets(), setTargets() which
 *   delegate to supabaseData when userId present.
 *
 * @see PRODUCTION_READINESS.md Phase 1.1
 */

import { CardInventory, TargetWatchlist } from '../types';
import { isDemoMode } from './supabase';
import * as supabaseData from './supabaseData';
import { logger } from './logger';

export const DAL_KEYS = {
  INVENTORY: 'cardx_inventory',
  TARGETS: 'cardx_targets',
  SYNC_META: 'cardx_sync_meta',
} as const;

export interface SyncMeta {
  lastSyncTime: string | null;
  totalValue: number;
  assetCount: number;
}

/**
 * Unified data access layer interface. All data reads/writes go through this.
 */
export interface IDataAccessLayer {
  getCards(): Promise<CardInventory[]>;
  setCards(cards: CardInventory[]): Promise<void>;
  getTargets(): Promise<TargetWatchlist[]>;
  setTargets(targets: TargetWatchlist[]): Promise<void>;
  getJson<T>(key: string): Promise<T | null>;
  setJson(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    logger.warn(`[DAL] Failed to parse ${key}`, e);
    return null;
  }
}

function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.warn(`[DAL] Failed to write ${key}`, e);
  }
}

function removeLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    logger.warn(`[DAL] Failed to remove ${key}`, e);
  }
}

/**
 * LocalStorage-backed DAL for demo/guest mode.
 */
class LocalStorageDAL implements IDataAccessLayer {
  async getCards(): Promise<CardInventory[]> {
    const raw = readLocal<CardInventory[]>(DAL_KEYS.INVENTORY);
    return Array.isArray(raw) ? raw : [];
  }

  async setCards(cards: CardInventory[]): Promise<void> {
    writeLocal(DAL_KEYS.INVENTORY, cards);
  }

  async getTargets(): Promise<TargetWatchlist[]> {
    const raw = readLocal<TargetWatchlist[]>(DAL_KEYS.TARGETS);
    return Array.isArray(raw) ? raw : [];
  }

  async setTargets(targets: TargetWatchlist[]): Promise<void> {
    writeLocal(DAL_KEYS.TARGETS, targets);
  }

  async getJson<T>(key: string): Promise<T | null> {
    return readLocal<T>(key);
  }

  async setJson(key: string, value: unknown): Promise<void> {
    writeLocal(key, value);
  }

  async remove(key: string): Promise<void> {
    removeLocal(key);
  }
}

/**
 * Supabase-backed DAL for authenticated users. Falls back to localStorage for
 * keys that don't have a Supabase table (e.g. dashboard layout, prefs).
 */
class SupabaseDAL implements IDataAccessLayer {
  constructor(private readonly userId: string) {}

  async getCards(): Promise<CardInventory[]> {
    if (isDemoMode) return this.fallbackCards();
    const cards = await supabaseData.fetchCards(this.userId);
    return cards;
  }

  private async fallbackCards(): Promise<CardInventory[]> {
    const raw = readLocal<CardInventory[]>(DAL_KEYS.INVENTORY);
    return Array.isArray(raw) ? raw : [];
  }

  async setCards(cards: CardInventory[]): Promise<void> {
    writeLocal(DAL_KEYS.INVENTORY, cards);
    if (!isDemoMode) {
      const ok = await supabaseData.bulkUpsertCards(cards, this.userId);
      if (!ok) logger.warn('[DAL] Supabase bulk upsert failed; local cache remains');
    }
  }

  async getTargets(): Promise<TargetWatchlist[]> {
    if (isDemoMode) return this.fallbackTargets();
    return supabaseData.fetchTargets(this.userId);
  }

  private async fallbackTargets(): Promise<TargetWatchlist[]> {
    const raw = readLocal<TargetWatchlist[]>(DAL_KEYS.TARGETS);
    return Array.isArray(raw) ? raw : [];
  }

  async setTargets(targets: TargetWatchlist[]): Promise<void> {
    writeLocal(DAL_KEYS.TARGETS, targets);
    if (!isDemoMode) {
      const ok = await supabaseData.bulkUpsertTargets(targets, this.userId);
      if (!ok) logger.warn('[DAL] Supabase targets upsert failed; local cache remains');
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    return readLocal<T>(key);
  }

  async setJson(key: string, value: unknown): Promise<void> {
    writeLocal(key, value);
  }

  async remove(key: string): Promise<void> {
    removeLocal(key);
  }
}

/**
 * Create a data access layer for the given user.
 * When userId is present and Supabase is configured, returns Supabase-backed DAL.
 * Otherwise returns localStorage-backed DAL.
 */
export function createDataAccessLayer(userId: string | null): IDataAccessLayer {
  if (userId && !isDemoMode) {
    return new SupabaseDAL(userId);
  }
  return new LocalStorageDAL();
}
