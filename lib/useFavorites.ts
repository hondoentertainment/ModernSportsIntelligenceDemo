/**
 * Re-export the store-backed favorites hook.
 * Use this path or `lib/utils/useFavorites` — avoid duplicating persistence logic.
 *
 * @see docs/DAL_MIGRATION.md
 */
export { useFavorites, type CardFavorite } from './utils/useFavorites';
