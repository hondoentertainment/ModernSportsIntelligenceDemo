/**
 * Prints sizes of dist/assets/*.js after vite build (cross-platform).
 *
 * Use:
 *   npm run build:size            # report-only (raw sizes, original format)
 *   npm run size:check            # enforce gzipped budget (exits 1 on over-budget)
 *   node scripts/bundle-size.cjs --max=460800   # ad-hoc budget check
 *
 * Flags:
 *   --max=<bytes>   When set, sums gzipped JS payload and exits non-zero
 *                   if it exceeds <bytes>. Existing report output is preserved.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const distAssets = path.join(process.cwd(), 'dist', 'assets');
if (!fs.existsSync(distAssets)) {
  console.error('dist/assets not found. Run "vite build" first.');
  process.exit(1);
}

const files = fs.readdirSync(distAssets).filter((f) => f.endsWith('.js'));
const withSizes = files.map((f) => ({
  name: f,
  size: fs.statSync(path.join(distAssets, f)).size,
}));
withSizes.sort((a, b) => b.size - a.size);

const top = withSizes.slice(0, 5);
const total = withSizes.reduce((sum, x) => sum + x.size, 0);

console.log('Bundle size (dist/assets/*.js):');
console.log('Top 5 chunks:');
top.forEach(({ name, size }) => console.log(`  ${(size / 1024).toFixed(1)} KB  ${name}`));
console.log(`Total: ${(total / 1024).toFixed(1)} KB (${(total / 1024 / 1024).toFixed(2)} MB)`);

// ---- Budget check (only runs when --max=<bytes> is provided) ----
const maxArg = process.argv.find((a) => a.startsWith('--max='));
if (maxArg) {
  const maxBytes = Number(maxArg.split('=')[1]);
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) {
    console.error(`Invalid --max value: ${maxArg}`);
    process.exit(2);
  }

  const withGzip = files
    .map((f) => {
      const buf = fs.readFileSync(path.join(distAssets, f));
      return { name: f, gzip: zlib.gzipSync(buf).length };
    })
    .sort((a, b) => b.gzip - a.gzip);

  const gzipTotal = withGzip.reduce((sum, x) => sum + x.gzip, 0);
  const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;

  console.log('');
  console.log('Budget check (gzipped):');
  console.log(`  Budget: ${fmt(maxBytes)} (${maxBytes} bytes)`);
  console.log(`  Actual: ${fmt(gzipTotal)} (${gzipTotal} bytes)`);
  console.log(`  Headroom: ${fmt(maxBytes - gzipTotal)}`);

  if (gzipTotal > maxBytes) {
    console.log('');
    console.log('OVER BUDGET. Top 10 chunks by gzipped size:');
    withGzip.slice(0, 10).forEach(({ name, gzip }) => {
      console.log(`  ${fmt(gzip)}  ${name}`);
    });
    console.error(
      `\nbundle-size: total gzipped JS ${gzipTotal} bytes exceeds budget ${maxBytes} bytes ` +
        `(over by ${gzipTotal - maxBytes} bytes).`,
    );
    process.exit(1);
  }

  console.log('  Status: PASS');
}
