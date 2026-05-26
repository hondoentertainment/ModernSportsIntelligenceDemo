/**
 * MVP production launch boundary — routes and features shipped for subscriber beta.
 * Beta catalog entries stay hidden from discovery unless VITE_FF_ENABLE_BETA_SURFACES=1.
 *
 * @see docs/PRODUCTION_ROLLOUT_PHASES.md Phase 1.5
 */

/** HashRouter paths (without # prefix) that are production-grade for first launch. */
export const MVP_LAUNCH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/',
  '/collection',
  '/favorites',
  '/billing',
  '/settings',
  '/features',
  '/p/:username',
] as const;

export type MvpLaunchRoute = (typeof MVP_LAUNCH_ROUTES)[number];

/** Public routes that do not require authentication. */
export const PUBLIC_LAUNCH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/p/:username',
] as const;

export function isBetaSurfacesEnabled(): boolean {
  if (typeof import.meta === 'undefined') return false;
  const v = import.meta.env.VITE_FF_ENABLE_BETA_SURFACES;
  return v === 'true' || v === '1';
}

/** Normalize path for comparison (strip trailing slash, ignore hash). */
export function normalizeRoutePath(path: string): string {
  const base = path.split('?')[0].replace(/\/+$/, '') || '/';
  return base;
}

export function isMvpLaunchRoute(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  if (PUBLIC_LAUNCH_ROUTES.some((r) => r === normalized)) return true;
  if (normalized.startsWith('/p/')) return true;
  return MVP_LAUNCH_ROUTES.some((r) => r !== '/p/:username' && r === normalized);
}

export function isPublicLaunchRoute(path: string): boolean {
  const normalized = normalizeRoutePath(path);
  if (normalized.startsWith('/p/')) return true;
  return (PUBLIC_LAUNCH_ROUTES as readonly string[]).includes(normalized);
}
