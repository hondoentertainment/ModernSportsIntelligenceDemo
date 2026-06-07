const fs = require('fs');
const path = require('path');

const c = fs.readFileSync('constants.tsx', 'utf8');
const app = fs.readFileSync('App.tsx', 'utf8');

// Extract NAV_ITEMS paths
const navPaths = new Set();
const navRx = /path:\s*'([^']+)'/g;
let m;
while ((m = navRx.exec(c))) navPaths.add(m[1]);

// Extract routes
const routes = new Set();
const routeRx = /<Route\s+path="([^"]+)"/g;
while ((m = routeRx.exec(app))) routes.add(m[1]);

const missing = [...navPaths].filter(p => !routes.has(p) && p.startsWith('/'));
console.log('Nav paths:', navPaths.size);
console.log('App routes:', routes.size);
console.log('Nav paths NOT in App.tsx routes:', missing.length);
console.log(missing.join('\n'));

// Now find page files not imported
const allPages = fs.readdirSync('pages').filter(f => f.endsWith('.tsx')).map(f => f.replace('.tsx', ''));
const importedPages = new Set();
const importRx = /import\('\.\/pages\/(\w+)\.tsx'\)/g;
while ((m = importRx.exec(app))) importedPages.add(m[1]);

const unrouted = allPages.filter(p => !importedPages.has(p));
console.log('\n--- Unimported pages ---');
console.log('count:', unrouted.length);
unrouted.forEach(p => console.log(p));
