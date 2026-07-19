#!/usr/bin/env node
/**
 * Reports whether eBay/PSA (and related) real-data flags can be flipped.
 * Does not print secret values.
 *
 * Usage: node scripts/check-real-data-ready.mjs
 *        node scripts/check-real-data-ready.mjs --from-env-file .env.supabase.local
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fileFlag = args.indexOf('--from-env-file');
if (fileFlag >= 0 && args[fileFlag + 1]) {
  const path = resolve(ROOT, args[fileFlag + 1]);
  if (existsSync(path)) {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq <= 0) continue;
      const key = t.slice(0, eq).trim();
      let value = t.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function set(name) {
  return Boolean(process.env[name]?.trim());
}

const checks = [
  {
    name: 'eBay comps',
    server: ['EBAY_CLIENT_ID', 'EBAY_CLIENT_SECRET'],
    flag: 'VITE_FF_REAL_EBAY',
    order: 1,
  },
  {
    name: 'PSA cert',
    server: ['PSA_API_KEY'],
    flag: 'VITE_FF_REAL_PSA',
    order: 2,
  },
  {
    name: 'BGS (optional after PSA)',
    server: [],
    flag: 'VITE_FF_REAL_BGS',
    order: 3,
    note: 'Uses adapter flag only; set after PSA is stable',
  },
  {
    name: 'Sports/catalyst feeds',
    server: [],
    flag: 'VITE_FF_REAL_SPORTS',
    order: 4,
  },
];

console.log('Real-data readiness (Bloomberg tape)\n');
let readyCount = 0;
for (const c of checks.sort((a, b) => a.order - b.order)) {
  const serverOk = c.server.every((k) => set(k));
  const flagOn = set(c.flag);
  const ready = c.server.length === 0 ? flagOn : serverOk;
  if (ready) readyCount += 1;
  const status = serverOk && flagOn ? 'LIVE' : serverOk ? 'KEYS_OK_FLAG_OFF' : 'NEED_KEYS';
  console.log(`[${status}] ${c.name}`);
  if (c.server.length) {
    for (const k of c.server) {
      console.log(`         ${k}: ${set(k) ? 'set' : 'missing'}`);
    }
  }
  console.log(`         ${c.flag}: ${flagOn ? 'true' : 'false'}`);
  if (c.note) console.log(`         note: ${c.note}`);
  if (serverOk && !flagOn) {
    console.log(`         next: vercel env add ${c.flag} production   # value: true`);
  }
  console.log('');
}

console.log(
  readyCount === 0
    ? 'No live adapters yet. Flip eBay first (NEXT_STEPS Priority 2), observe Deployed E2E, then PSA.'
    : `${readyCount} check(s) partially/fully ready.`,
);
process.exit(0);
