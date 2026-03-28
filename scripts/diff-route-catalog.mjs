import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const cat = fs.readFileSync(path.join(root, 'lib/utils/featureCatalog.ts'), 'utf8');
const sup = fs.readFileSync(path.join(root, 'lib/utils/featureCatalogRouteSupplement.ts'), 'utf8');

const routes = [...new Set([...app.matchAll(/path="(\/[^"]+)"/g)].map((m) => m[1]))].filter(
  (p) => p !== '*' && p !== '/*',
);

const catPaths = new Set([
  ...[...cat.matchAll(/path: '(\/[^']+)'/g)].map((m) => m[1]),
  ...[...sup.matchAll(/"path":"(\/[^"]+)"/g)].map((m) => m[1]),
]);

/** Dynamic public portfolio — covered by public-portfolio catalog + supplement entry if any */
const missing = routes.filter((p) => !catPaths.has(p) && !p.startsWith('/p/'));

console.log(JSON.stringify({ routeCount: routes.length, catalogPathCount: catPaths.size, missing }, null, 2));
