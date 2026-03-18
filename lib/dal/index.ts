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
import { logger } from '../logger';

/**
 * Initialize the DAL with the appropriate adapter.
 * Call once at app startup (e.g. in App.tsx or AuthContext).
 */
export function initDAL(userId: string | null): void {
  if (userId && !isDemoMode) {
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
    logger.info('[DAL] Initialized with localStorage adapter (demo mode)');
  }
}
