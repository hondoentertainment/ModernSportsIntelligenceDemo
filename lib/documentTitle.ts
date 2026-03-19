import { NAV_ITEMS } from '../constants.tsx';
import { FEATURE_CATALOG } from './featureCatalog';

const BASE = 'MSI | Modern Sports Intelligence';

const AUTH_ROUTES: Record<string, string> = {
  '/login': 'Sign in',
  '/signup': 'Create account',
  '/forgot-password': 'Reset password',
  '/reset-password': 'Set new password',
};

/**
 * IA subagent: wayfinding via browser tab / screen reader context.
 */
export function pageTitleForPath(pathname: string): string {
  const norm = pathname.replace(/\/$/, '') || '/';
  const auth = AUTH_ROUTES[norm];
  if (auth) return `${auth} — ${BASE}`;
  if (norm.startsWith('/p/')) return `Public portfolio — ${BASE}`;
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
  const nav = sorted.find(
    n => norm === n.path || (n.path !== '/' && norm.startsWith(`${n.path}/`))
  );
  if (nav) return `${nav.label} — ${BASE}`;
  const feat = FEATURE_CATALOG.find(f => f.path === norm);
  if (feat) return `${feat.name} — ${BASE}`;
  const seg = norm.split('/').filter(Boolean).pop();
  if (!seg) return BASE;
  const human = seg
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${human} — ${BASE}`;
}
