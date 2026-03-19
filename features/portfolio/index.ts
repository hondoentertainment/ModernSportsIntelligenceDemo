/**
 * Portfolio feature — barrel exports for code organization.
 * Use: import { useSupabaseInventory, createDataAccessLayer } from '../features/portfolio';
 * See PRODUCTION_READINESS.md Phase 5.1 — feature-domain organization.
 */
export { useSupabaseInventory, useInventory, calculateStats } from '../../lib/useInventory';
export { createDataAccessLayer, DAL_KEYS, type IDataAccessLayer, type SyncMeta } from '../../lib/dal';
export type { CardInventory, TargetWatchlist } from '../../types';
