#!/usr/bin/env node
/**
 * Audit `localStorage` / `sessionStorage` references under lib/, pages/, components/, hooks/.
 *
 * Strips line/block comments and string literals before counting so docs and
 * JSDoc don't inflate the migration backlog. Splits results into:
 *   - infra:   files that legitimately implement persistence (DAL adapters,
 *              sync stores, offline quota probes). Expected to call browser
 *              storage directly.
 *   - service: everything else — these are the real DAL migration targets.
 *
 * Exits 1 when any non-infra file has active calls, so CI can gate against
 * regressions (see docs/DAL_MIGRATION.md).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, sep } from 'node:path';

const ROOT = process.cwd();
const DIRS = ['lib', 'pages', 'components', 'hooks'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Files allowed to call browser storage directly. Keep this list tight.
const INFRA_FILES = new Set(
  [
    'lib/dal.ts',
    'lib/dal/index.ts',
    'lib/dal/syncStore.ts',
    'lib/dal/StorageAdapter.ts',
    'lib/dal/LocalStorageAdapter.ts',
    'lib/dal/SupabaseStorageAdapter.ts',
    'lib/utils/userStatePersistence.ts',
    'lib/utils/offlineService.ts',
    'lib/utils/migration.ts',
    'lib/utils/syncScheduler.ts',
    'lib/utils/useSupabaseInventory.ts',
    'hooks/usePersistedState.ts',
  ].map((p) => p.split('/').join(sep)),
);

const FAIL_ON_REGRESSION = process.argv.includes('--strict');

/** Strip line comments, block comments, and string literals. */
function stripCommentsAndStrings(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const n1 = src[i + 1];
    if (c === '/' && n1 === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && n1 === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      out += ' ';
      i++;
      while (i < n) {
        if (src[i] === '\\') {
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          i++;
          break;
        }
        // Template literal `${...}` may contain real code — keep it.
        if (quote === '`' && src[i] === '$' && src[i + 1] === '{') {
          out += '${';
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') depth--;
            if (depth > 0) {
              out += src[i];
              i++;
            }
          }
          out += '}';
          if (i < n) i++;
          continue;
        }
        i++;
      }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

const re = /\b(localStorage|sessionStorage)\b/g;

function walk(dir, acc) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === 'node_modules' || name === 'dist' || name === 'coverage') continue;
    const p = join(dir, name);
    const st = statSync(p, { throwIfNoEntry: false });
    if (!st) continue;
    if (st.isDirectory()) walk(p, acc);
    else if (EXT.has(extname(name))) {
      const raw = readFileSync(p, 'utf8');
      const src = stripCommentsAndStrings(raw);
      let m;
      re.lastIndex = 0;
      const counts = { localStorage: 0, sessionStorage: 0 };
      while ((m = re.exec(src))) {
        if (m[1] === 'localStorage') counts.localStorage++;
        else counts.sessionStorage++;
      }
      const total = counts.localStorage + counts.sessionStorage;
      if (total > 0) {
        const rel = p.slice(ROOT.length + 1);
        acc.push({
          file: rel,
          infra: INFRA_FILES.has(rel),
          ...counts,
          total,
        });
      }
    }
  }
}

const acc = [];
for (const d of DIRS) walk(join(ROOT, d), acc);
acc.sort((a, b) => b.total - a.total);

const service = acc.filter((r) => !r.infra);
const infra = acc.filter((r) => r.infra);

const print = (rows) => {
  for (const r of rows) {
    console.log(`${String(r.total).padStart(3)}  ${String(r.localStorage).padStart(3)} ls  ${String(r.sessionStorage).padStart(3)} ss  ${r.file}`);
  }
};

console.log('Service files still calling browser storage (DAL migration targets):\n');
if (service.length === 0) {
  console.log('  (none — clean)\n');
} else {
  print(service);
}

console.log('\nInfra / persistence-layer files (expected — see INFRA_FILES allowlist):\n');
print(infra);

const serviceTotal = service.reduce((s, r) => s + r.total, 0);
const infraTotal = infra.reduce((s, r) => s + r.total, 0);
console.log(`\nService refs: ${serviceTotal} (${service.length} files)`);
console.log(`Infra   refs: ${infraTotal} (${infra.length} files)`);

if (FAIL_ON_REGRESSION && service.length > 0) {
  console.error(`\n[audit-localstorage] FAIL: ${service.length} service file(s) still call browser storage directly. Migrate them to lib/dal/syncStore.ts (see docs/DAL_MIGRATION.md), or add the file to INFRA_FILES if it is genuinely infrastructure.`);
  process.exit(1);
}
