/**
 * Prints sizes of dist/assets/*.js after vite build (cross-platform).
 * Use: npm run build:size
 */
const fs = require('fs');
const path = require('path');

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
