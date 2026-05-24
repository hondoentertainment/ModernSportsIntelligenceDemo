/**
 * CI bundle size gate — single source of truth for chunk role detection
 * and budgets. Used by:
 *   - npm run ci:bundle              (raw budgets, Build & Test job)
 *   - performance-budget.yml workflow (gzip budgets, PR comment)
 *
 * Usage:
 *   node scripts/ci-bundle-gate.cjs [--mode raw|gzip] [--report <path>]
 *
 * Exits 1 if any chunk exceeds its budget for the chosen mode. With
 * --report, writes a markdown report regardless of exit code so a PR
 * comment can still be posted on failure.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BUDGETS = {
  raw: {
    index: 4 * 1024 * 1024,
    'lib-services': 4.25 * 1024 * 1024,
    vendor: 2 * 1024 * 1024,
    chunk: 1.5 * 1024 * 1024,
    total: 12 * 1024 * 1024,
  },
  gzip: {
    index: 200 * 1024,
    'lib-services': 1200 * 1024,
    vendor: 200 * 1024,
    chunk: 50 * 1024,
    total: 3 * 1024 * 1024,
  },
};

function getChunkRole(filename) {
  if (/^index[.-]/.test(filename)) return 'index';
  if (/^lib-services[.-]/.test(filename)) return 'lib-services';
  if (/-vendor[.-]/.test(filename)) return 'vendor';
  return 'chunk';
}

function parseArgs(argv) {
  const out = { mode: 'raw', report: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--mode') out.mode = argv[++i];
    else if (a.startsWith('--mode=')) out.mode = a.slice('--mode='.length);
    else if (a === '--report') out.report = argv[++i];
    else if (a.startsWith('--report=')) out.report = a.slice('--report='.length);
  }
  if (out.mode !== 'raw' && out.mode !== 'gzip') {
    console.error(`Invalid --mode: ${out.mode}. Use 'raw' or 'gzip'.`);
    process.exit(2);
  }
  return out;
}

function logicalChunkName(name) {
  return name.replace(/-[A-Za-z0-9_-]{8,}\.js$/, '.js');
}

const { mode, report: reportPath } = parseArgs(process.argv.slice(2));
const distAssets = path.join(process.cwd(), 'dist', 'assets');

if (!fs.existsSync(distAssets)) {
  console.error('❌  dist/assets not found — run `npm run build` first.');
  process.exit(1);
}

const allJs = fs
  .readdirSync(distAssets)
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const full = path.join(distAssets, f);
    const stat = fs.statSync(full);
    return { name: f, path: full, rawSize: stat.size, mtimeMs: stat.mtimeMs };
  });

if (allJs.length === 0) {
  console.error('❌  No JS files found in dist/assets.');
  process.exit(1);
}

const latestByLogical = new Map();
for (const file of allJs) {
  const key = logicalChunkName(file.name);
  const existing = latestByLogical.get(key);
  if (!existing || file.mtimeMs > existing.mtimeMs) {
    latestByLogical.set(key, file);
  }
}
const files = Array.from(latestByLogical.values());
const staleCount = allJs.length - files.length;

const wantsGzip = mode === 'gzip' || reportPath !== null;
if (wantsGzip) {
  for (const f of files) {
    f.gzipSize = zlib.gzipSync(fs.readFileSync(f.path), { level: 9 }).length;
  }
}

const budgets = BUDGETS[mode];
const sizeKey = mode === 'gzip' ? 'gzipSize' : 'rawSize';
files.sort((a, b) => b[sizeKey] - a[sizeKey]);

const kb = (b) => (b / 1024).toFixed(1);
const mb = (b) => (b / 1024 / 1024).toFixed(2);

let exceeded = false;
const rows = [];

console.log('\nBundle Size Gate');
console.log('='.repeat(82));
console.log(`Mode: ${mode}`);
if (staleCount > 0) {
  console.log(`Ignoring ${staleCount} stale hashed asset${staleCount === 1 ? '' : 's'} from prior builds.`);
}
console.log(`${'File'.padEnd(50)} ${'Size'.padStart(10)} ${'Budget'.padStart(10)} Status`);
console.log(`${'-'.repeat(50)} ${'-'.repeat(10)} ${'-'.repeat(10)} ------`);

for (const f of files) {
  const role = getChunkRole(f.name);
  const budget = budgets[role];
  const size = f[sizeKey];
  const ok = size <= budget;
  if (!ok) exceeded = true;
  console.log(
    `${f.name.slice(0, 50).padEnd(50)} ${(kb(size) + ' KB').padStart(10)} ${(kb(budget) + ' KB').padStart(10)} ${ok ? 'OK' : 'OVER ⚠️'}`,
  );
  rows.push({ name: f.name, role, rawSize: f.rawSize, gzipSize: f.gzipSize, budget, ok });
}

const totalRaw = files.reduce((s, f) => s + f.rawSize, 0);
const totalGzip = wantsGzip ? files.reduce((s, f) => s + f.gzipSize, 0) : 0;
const totalSize = mode === 'gzip' ? totalGzip : totalRaw;
const totalBudget = budgets.total;
const totalOk = totalSize <= totalBudget;
if (!totalOk) exceeded = true;

console.log('='.repeat(82));
console.log(`Total: ${mb(totalSize)} MB  (budget: ${mb(totalBudget)} MB)  ${totalOk ? '✅' : '❌ OVER'}`);

if (reportPath) {
  const lines = [];
  lines.push('## Bundle Size Analysis');
  lines.push('');
  lines.push(`**Mode:** ${mode}`);
  lines.push('');
  lines.push('### Chunk Breakdown');
  lines.push('');
  lines.push(`| Chunk | Role | Raw | Gzip | Budget (${mode}) | Status |`);
  lines.push('|-------|------|-----|------|--------|--------|');
  for (const r of rows) {
    const status = r.ok ? 'OK' : 'OVER BUDGET';
    lines.push(
      `| \`${r.name}\` | ${r.role} | ${kb(r.rawSize)} KB | ${kb(r.gzipSize)} KB | ${kb(r.budget)} KB | ${status} |`,
    );
  }
  lines.push('');
  lines.push('### Totals');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total raw | ${kb(totalRaw)} KB (${mb(totalRaw)} MB) |`);
  lines.push(`| Total gzip | ${kb(totalGzip)} KB (${mb(totalGzip)} MB) |`);
  lines.push(`| JS chunks | ${rows.length} |`);
  lines.push(`| Budget (total ${mode}) | ${mb(totalBudget)} MB |`);
  lines.push('');
  lines.push(`### Budgets (${mode})`);
  lines.push('');
  lines.push('| Role | Budget |');
  lines.push('|------|--------|');
  for (const [role, b] of Object.entries(budgets)) {
    if (role === 'total') continue;
    lines.push(`| \`${role}\` | ${kb(b)} KB |`);
  }
  lines.push('');
  lines.push(exceeded ? '### Result: BUDGET EXCEEDED' : '### Result: ALL BUDGETS MET');
  lines.push('');
  fs.writeFileSync(reportPath, lines.join('\n') + '\n');
}

if (exceeded) {
  console.error('\n❌  Bundle budget exceeded.');
  process.exit(1);
}
console.log('\n✅  All bundle budgets met.');
