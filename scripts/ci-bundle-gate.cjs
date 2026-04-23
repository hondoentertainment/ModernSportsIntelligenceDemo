/**
 * CI bundle size gate — checks dist/assets against size budgets.
 * Run after `vite build`; exits 1 if any chunk exceeds its budget.
 *
 * Budgets (raw, uncompressed):
 *   index chunk  : 4 MB
 *   any other JS : 1.5 MB
 *   total JS     : 12 MB
 */
'use strict';

const fs = require('fs');
const path = require('path');

const INDEX_BUDGET_BYTES  = 4 * 1024 * 1024;   // 4 MB
const CHUNK_BUDGET_BYTES  = 1.5 * 1024 * 1024; // 1.5 MB
const TOTAL_BUDGET_BYTES  = 12 * 1024 * 1024;  // 12 MB

const distAssets = path.join(process.cwd(), 'dist', 'assets');

if (!fs.existsSync(distAssets)) {
  console.error('❌  dist/assets not found — run `npm run build` first.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(distAssets)
  .filter(f => f.endsWith('.js'))
  .map(f => ({ name: f, size: fs.statSync(path.join(distAssets, f)).size }))
  .sort((a, b) => b.size - a.size);

if (jsFiles.length === 0) {
  console.error('❌  No JS files found in dist/assets.');
  process.exit(1);
}

const totalBytes = jsFiles.reduce((s, f) => s + f.size, 0);
let exceeded = false;

const kb = (b) => (b / 1024).toFixed(1);
const mb = (b) => (b / 1024 / 1024).toFixed(2);

console.log('\nBundle Size Gate');
console.log('='.repeat(72));
console.log(`${'File'.padEnd(48)} ${'Size'.padStart(9)} ${'Budget'.padStart(9)} Status`);
console.log(`${'-'.repeat(48)} ${'-'.repeat(9)} ${'-'.repeat(9)} ------`);

for (const { name, size } of jsFiles) {
  const isIndex = /^index[.-]/.test(name);
  const budget  = isIndex ? INDEX_BUDGET_BYTES : CHUNK_BUDGET_BYTES;
  const ok      = size <= budget;
  if (!ok) exceeded = true;
  const label   = ok ? 'OK' : 'OVER BUDGET ⚠️';
  console.log(`${name.slice(0, 48).padEnd(48)} ${(kb(size) + ' KB').padStart(9)} ${(kb(budget) + ' KB').padStart(9)} ${label}`);
}

console.log('='.repeat(72));
const totalOk = totalBytes <= TOTAL_BUDGET_BYTES;
if (!totalOk) exceeded = true;
console.log(`Total: ${mb(totalBytes)} MB  (budget: ${mb(TOTAL_BUDGET_BYTES)} MB)  ${totalOk ? '✅' : '❌ OVER BUDGET'}`);
console.log();

if (exceeded) {
  console.error('❌  Bundle budget exceeded. Check chunks above and apply code splitting or tree-shaking.');
  process.exit(1);
}

console.log('✅  All bundle budgets met.');
