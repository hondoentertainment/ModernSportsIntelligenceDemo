/**
 * Data Access Layer — Public API
 *
 * Usage:
 *   import { initDAL, dal } from './lib/dal';
 *
 *   // At app startup:
 *   initDAL(userId);
 *
 *   // In any service:
 *   const cards = await dal().get<CardInventory[]>('inventory');
 *   await dal().set('inventory', cards);
 */

export { getAdapter as dal, getAdapterType, setAdapter } from './StorageAdapter';
export type { StorageAdapter, AdapterType } from './StorageAdapter';
export { LocalStorageAdapter } from './LocalStorageAdapter';
export { SupabaseStorageAdapter } from './SupabaseStorageAdapter';

import { setAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SupabaseStorageAdapter } from './SupabaseStorageAdapter';
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
    logger.info('[DAL] Initialized with Supabase adapter for user', userId);
  } else {
    const adapter = new LocalStorageAdapter('msi_');
    setAdapter(adapter, 'local');
    logger.info('[DAL] Initialized with localStorage adapter (demo mode)');
  }
}
