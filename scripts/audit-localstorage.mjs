#!/usr/bin/env node
/**
 * Rough count of localStorage / sessionStorage references under lib/, pages/, components/, hooks/.
 * Use for DAL migration prioritization (see docs/DAL_MIGRATION.md).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const DIRS = ['lib', 'pages', 'components', 'hooks'];
const EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);

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
      const src = readFileSync(p, 'utf8');
      let m;
      re.lastIndex = 0;
      const counts = { localStorage: 0, sessionStorage: 0 };
      while ((m = re.exec(src))) {
        if (m[1] === 'localStorage') counts.localStorage++;
        else counts.sessionStorage++;
      }
      const total = counts.localStorage + counts.sessionStorage;
      if (total > 0) acc.push({ file: p.slice(ROOT.length + 1), ...counts, total });
    }
  }
}

const acc = [];
for (const d of DIRS) walk(join(ROOT, d), acc);
acc.sort((a, b) => b.total - a.total);

console.log('localStorage / sessionStorage references (top 30 by total hits)\n');
for (const row of acc.slice(0, 30)) {
  console.log(`${row.total}\t${row.localStorage} ls\t${row.sessionStorage} ss\t${row.file}`);
}
console.log(`\nFiles with any hits: ${acc.length}`);
const sum = acc.reduce((s, r) => s + r.total, 0);
console.log(`Total references (counted lines may double-count): ${sum}`);
