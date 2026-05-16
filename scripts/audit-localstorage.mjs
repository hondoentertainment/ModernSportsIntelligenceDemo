#!/usr/bin/env node
/**
 * DAL gate: counts real localStorage / sessionStorage CALL SITES (not comments)
 * outside the DAL implementation files. Run as a CI gate to keep DAL bypass
 * count from increasing. See docs/DAL_MIGRATION.md.
 *
 * Exit codes:
 *   0  call-site count is at or below MAX_ALLOWED_CALL_SITES
 *   1  count exceeded -> ratchet failure
 *
 * Usage:
 *   node scripts/audit-localstorage.mjs           # human report + gate
 *   node scripts/audit-localstorage.mjs --report  # human report only (no exit code)
 *   node scripts/audit-localstorage.mjs --json    # machine-readable
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const DIRS = ['lib', 'pages', 'components', 'hooks', 'contexts'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

// Files that are allowed to use localStorage directly because they ARE the DAL
// or compute origin-wide stats. New files should not be added here lightly.
const ALLOWED_FILES = new Set([
  'lib/dal.ts',
  'lib/dal/syncStore.ts',
  'lib/dal/LocalStorageAdapter.ts',
  'lib/dal/index.ts',
  'lib/dal/StorageAdapter.ts',
  'lib/utils/offlineService.ts', // walks full origin to compute storage stats
]);

// Ratchet: lower this when call sites are eliminated. Never raise without review.
const MAX_ALLOWED_CALL_SITES = 0;

// Match real call sites: e.g. localStorage.getItem(, sessionStorage['x'] = ,
// localStorage.foo. Skip occurrences inside line comments and block comments.
const CALL_RE = /\b(localStorage|sessionStorage)\b\s*[.[]/g;

function stripComments(src) {
  // Remove /* ... */ blocks (multi-line) and // line comments.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

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
      const rel = p.slice(ROOT.length + 1).replaceAll('\\', '/');
      const raw = readFileSync(p, 'utf8');
      const src = stripComments(raw);
      const sites = [];
      let m;
      CALL_RE.lastIndex = 0;
      while ((m = CALL_RE.exec(src))) {
        // Approximate the line by counting newlines up to match index.
        const line = src.slice(0, m.index).split('\n').length;
        sites.push({ kind: m[1], line });
      }
      if (sites.length) acc.push({ file: rel, sites });
    }
  }
}

const args = new Set(process.argv.slice(2));
const acc = [];
for (const d of DIRS) walk(join(ROOT, d), acc);
acc.sort((a, b) => b.sites.length - a.sites.length);

const violators = acc.filter((row) => !ALLOWED_FILES.has(row.file));
const totalCallSites = violators.reduce((s, r) => s + r.sites.length, 0);

if (args.has('--json')) {
  process.stdout.write(
    JSON.stringify({ totalCallSites, threshold: MAX_ALLOWED_CALL_SITES, violators }, null, 2) + '\n'
  );
} else {
  console.log('DAL gate: real localStorage / sessionStorage call sites outside DAL\n');
  if (violators.length === 0) {
    console.log('No violators. All non-DAL code uses lib/dal/syncStore.ts (`store`) or DAL APIs.');
  } else {
    for (const row of violators) {
      console.log(`${row.sites.length}\t${row.file}`);
      for (const s of row.sites) console.log(`    ${s.file ?? ''}:${s.line} ${s.kind}`);
    }
  }
  console.log(`\nViolating call sites: ${totalCallSites} (threshold ${MAX_ALLOWED_CALL_SITES})`);
  console.log('Allowed DAL implementation files (excluded from gate):');
  for (const f of ALLOWED_FILES) console.log(`  ${f}`);
}

if (!args.has('--report') && totalCallSites > MAX_ALLOWED_CALL_SITES) {
  console.error(
    `\nFAIL: ${totalCallSites} non-DAL localStorage call sites exceed threshold ${MAX_ALLOWED_CALL_SITES}.`
  );
  console.error('Migrate to lib/dal/syncStore.ts `store` (drop-in for getItem/setItem) or DAL APIs.');
  process.exit(1);
}
