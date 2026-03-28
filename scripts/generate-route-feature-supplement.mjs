/**
 * Generates lib/utils/featureCatalogRouteSupplement.ts from App.tsx routes
 * not already covered by any path: '...' in featureCatalog.ts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const cat = fs.readFileSync(path.join(root, 'lib/utils/featureCatalog.ts'), 'utf8');

const routes = [...new Set([...app.matchAll(/path="(\/[^"]+)"/g)].map((m) => m[1]))].filter(
  (p) => p !== '*' && p !== '/*',
);

const catPaths = new Set([...cat.matchAll(/path: '(\/[^']+)'/g)].map((m) => m[1]));

/** /login is covered by auth-system in core catalog */
const skipRoutes = new Set(['/login']);

function pathToId(routePath) {
  if (routePath.startsWith('/p/')) return 'public-portfolio-dynamic';
  if (routePath === '/players/:id') return 'player-detail';
  const core = routePath.replace(/^\//, '').replace(/:[^/]+/g, 'param');
  return core.replace(/\//g, '-').replace(/-+/g, '-') || 'root';
}

function humanName(routePath) {
  if (routePath === '/settings') return 'Settings & Profile';
  if (routePath === '/players/:id') return 'Player Detail';
  if (routePath.startsWith('/p/')) return 'Public Portfolio (dynamic)';
  const parts = routePath.split('/').filter(Boolean);
  return parts
    .map((p) =>
      p
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
    )
    .join(' — ');
}

const missing = routes.filter(
  (p) => !catPaths.has(p) && !p.startsWith('/p/') && !skipRoutes.has(p),
);

const usedIds = new Set([...cat.matchAll(/id: '([^']+)'/g)].map((m) => m[1]));

let phase = 400;
const lines = missing.map((p) => {
  let id = pathToId(p);
  if (usedIds.has(id)) {
    id = `${id}-route`;
  }
  while (usedIds.has(id)) {
    id = `${id}-x`;
  }
  usedIds.add(id);
  const name = humanName(p);
  const desc = `Routed workspace: ${name}. Demo-grade surface; see tier for production expectations.`;
  phase += 1;
  const status = /oracle|autonomous|quant|phantom|ai-|ar-vault|memetic|forgery|counterfactual|biometric/i.test(
    p,
  )
    ? 'beta'
    : 'live';
  const row = {
    id,
    name,
    description: desc,
    tier: 'Industry-First',
    category: 'Tools',
    status,
    path: p,
    icon: 'Sparkles',
    phase,
    keywords: ['route', pathToId(p)],
  };
  return `  ${JSON.stringify(row)},`;
});

const out = `/**
 * Auto-aligned with App.tsx routes — every entry has explicit \`id\` and \`status\`.
 * Regenerate: \`node scripts/generate-route-feature-supplement.mjs\`
 * Do not edit by hand except to adjust status/tier after product review.
 */
import type { Feature } from './featureTypes';

export const FEATURE_CATALOG_ROUTE_SUPPLEMENT: Feature[] = [
${lines.join('\n')}
];
`;

fs.writeFileSync(path.join(root, 'lib/utils/featureCatalogRouteSupplement.ts'), out);
console.log('Wrote', missing.length, 'supplement features');
