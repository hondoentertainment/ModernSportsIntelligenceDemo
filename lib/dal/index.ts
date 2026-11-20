/**
 * Data Access Layer — Public API
 *
 * Usage:
 *   import { store } from './lib/dal';
 *
 *   // Synchronous read/write (drop-in for localStorage):
 *   const goals = store.get<Goal[]>('msi_goals', []);
 *   store.set('msi_goals', goals);
 *
 *   // For async DAL operations:
 *   import { dal } from './lib/dal';
 *   const cards = await dal().get<CardInventory[]>('inventory');
 */

export { getAdapter as dal, getAdapterType, setAdapter } from './StorageAdapter';
export type { StorageAdapter, AdapterType } from './StorageAdapter';
export { LocalStorageAdapter } from './LocalStorageAdapter';
export { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
export { store } from './syncStore';

import { setAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
import { store } from './syncStore';
import { isDemoMode } from '../supabase';
import { DEMO_USER_ID, isActiveDemoSession } from '../demoSession';
import { logger } from '../logger';

/** Dedupe `initDAL` across React re-renders; includes demo flag so tests can switch modes. */
let lastDalInitKey = '';

/** Test-only: clear dedupe state between Vitest cases. */
export function resetDalInitKeyForTests(): void {
  lastDalInitKey = '';
}

/**
 * Initialize the DAL with the appropriate adapter.
 * Call once at app startup (e.g. in App.tsx or AuthContext).
 */
export function initDAL(userId: string | null): void {
  const remote = Boolean(userId) && userId !== DEMO_USER_ID && !isDemoMode && !isActiveDemoSession();
  const key = `${userId ?? ''}|${remote ? 'live' : 'demo'}`;
  if (key === lastDalInitKey) {
    return;
  }
  lastDalInitKey = key;

  store.clear();

  if (remote && userId) {
    const adapter = new SupabaseStorageAdapter(userId);
    setAdapter(adapter, 'supabase');
    store.setAdapter(adapter);
    store.hydrate().catch((err) => {
      logger.warn('[DAL] Hydration failed', err);
    });
    logger.info('[DAL] Initialized with Supabase adapter for user', userId);
  } else {
    const adapter = new LocalStorageAdapter('');
    setAdapter(adapter, 'local');
    store.setAdapter(adapter);
    store.markLocalHydrationComplete();
    logger.info('[DAL] Initialized with localStorage adapter (demo mode)');
  }
}
