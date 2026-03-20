/**
 * Barrel for portfolio hooks: implementation lives in utils (DAL-backed syncStore).
 * Prefer importing from `lib/utils/useInventory` or `features/portfolio`.
 */
export { useInventory, calculateStats } from './utils/useInventory';
export { useSupabaseInventory } from './useSupabaseInventory';
