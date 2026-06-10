#!/usr/bin/env node
/**
 * Validates required Vercel production environment variables.
 *
 * Reads process.env — pull from Vercel first when checking a linked project:
 *   vercel env pull .env.production.local --environment=production
 *   node --env-file=.env.production.local scripts/check-production-env.mjs
 *
 * Or: npm run check:prod-env
 *
 * @see docs/DEPLOY_ENV_CHECKLIST.md
 * @see .env.example
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
  console.log(`Usage: node scripts/check-production-env.mjs [options]

Options:
  --from-vercel   Run \`vercel env pull\` to .env.production.local first (requires Vercel CLI + linked project)
  --strict        Treat warnings as errors (exit 1)
  -h, --help      Show this help

Required (production API auth + client):
  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
  SUPABASE_URL, SUPABASE_ANON_KEY

Recommended:
  ALLOWED_ORIGIN (canonical production URL for CORS)

Billing (when VITE_STRIPE_PUBLISHABLE_KEY is set):
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
  STRIPE_BASIC_PRICE_ID, STRIPE_PRO_PRICE_ID, STRIPE_ALPHA_PRICE_ID

Docs: docs/DEPLOY_ENV_CHECKLIST.md
`);
  process.exit(0);
}

function loadEnvFile(relPath) {
  const path = resolve(ROOT, relPath);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function hasVercelCli() {
  const probe = spawnSync('vercel', ['--version'], { stdio: 'pipe', shell: process.platform === 'win32' });
  return probe.status === 0;
}

function pullVercelProductionEnv() {
  if (!hasVercelCli()) {
    console.warn('⚠ Vercel CLI not found — skipping env pull. Install: npm i -g vercel');
    return false;
  }
  const out = '.env.production.local';
  console.log(`→ vercel env pull ${out} --environment=production`);
  const result = spawnSync(
    'vercel',
    ['env', 'pull', out, '--environment=production', '--yes'],
    { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' },
  );
  if (result.status !== 0) {
    console.warn('⚠ vercel env pull failed — continuing with current process.env');
    return false;
  }
  loadEnvFile(out);
  return true;
}

function isSet(key) {
  return Boolean(process.env[key]?.trim());
}

function isTruthyFlag(key) {
  const v = process.env[key]?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function isBillingEnabled() {
  return isSet('VITE_STRIPE_PUBLISHABLE_KEY');
}

if (args.has('--from-vercel')) {
  pullVercelProductionEnv();
} else {
  loadEnvFile('.env.production.local');
  loadEnvFile('.env.local');
}

const errors = [];
const warnings = [];

const requiredAlways = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

for (const key of requiredAlways) {
  if (!isSet(key)) {
    errors.push(`Missing required: ${key}`);
  }
}

if (isSet('VITE_SUPABASE_URL') && isSet('SUPABASE_URL')) {
  if (process.env.VITE_SUPABASE_URL.trim() !== process.env.SUPABASE_URL.trim()) {
    warnings.push('VITE_SUPABASE_URL and SUPABASE_URL differ — they should match for JWT validation.');
  }
}

if (isSet('VITE_SUPABASE_ANON_KEY') && isSet('SUPABASE_ANON_KEY')) {
  if (process.env.VITE_SUPABASE_ANON_KEY.trim() !== process.env.SUPABASE_ANON_KEY.trim()) {
    warnings.push('VITE_SUPABASE_ANON_KEY and SUPABASE_ANON_KEY differ — they should match.');
  }
}

if (!isSet('ALLOWED_ORIGIN')) {
  warnings.push(
    'ALLOWED_ORIGIN is not set — production CORS falls back to https://$VERCEL_URL. Set your canonical domain for custom domains.',
  );
}

if (isTruthyFlag('MSI_API_AUTH_DISABLED')) {
  warnings.push(
    'MSI_API_AUTH_DISABLED is set — must NEVER be enabled on Vercel production. Protected API routes return 503 until removed (vercel env rm MSI_API_AUTH_DISABLED production).',
  );
}

if (!isSet('VITE_SENTRY_DSN') && !isSet('VITE_ERROR_REPORTING_URL')) {
  warnings.push(
    'No client error telemetry (VITE_SENTRY_DSN or VITE_ERROR_REPORTING_URL) — production errors may be invisible. See docs/MONITORING.md.',
  );
}

if (isBillingEnabled()) {
  const billingRequired = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_BASIC_PRICE_ID',
    'STRIPE_PRO_PRICE_ID',
    'STRIPE_ALPHA_PRICE_ID',
  ];
  for (const key of billingRequired) {
    if (!isSet(key)) {
      errors.push(`Billing enabled (VITE_STRIPE_PUBLISHABLE_KEY set) but missing: ${key}`);
    }
  }
  const clientPrices = [
    'VITE_STRIPE_BASIC_PRICE_ID',
    'VITE_STRIPE_PRO_PRICE_ID',
    'VITE_STRIPE_ALPHA_PRICE_ID',
  ];
  for (const key of clientPrices) {
    if (!isSet(key)) {
      warnings.push(`Billing enabled but client price id missing: ${key}`);
    }
  }
} else {
  console.log('ℹ Billing not enabled (VITE_STRIPE_PUBLISHABLE_KEY unset) — skipping Stripe server checks.');
}

if (!isSet('MSI_SERVER_API_SECRET') && !isSet('SUPABASE_URL')) {
  // covered by requiredAlways
} else if (!isSet('MSI_SERVER_API_SECRET') && isSet('SUPABASE_URL') && isSet('SUPABASE_ANON_KEY')) {
  console.log('✓ Server API auth via Supabase JWT (SUPABASE_URL + SUPABASE_ANON_KEY).');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  Production environment check');
console.log('═══════════════════════════════════════════════════════════\n');

if (warnings.length > 0) {
  console.log('Warnings:');
  for (const w of warnings) console.log(`  ⚠ ${w}`);
  console.log('');
}

if (errors.length > 0) {
  console.log('Errors:');
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log('\nFix in Vercel Dashboard → Project → Settings → Environment Variables (Production).');
  console.log('Or: vercel env add <NAME> production');
  console.log('Docs: docs/DEPLOY_ENV_CHECKLIST.md\n');
  process.exit(1);
}

if (args.has('--strict') && warnings.length > 0) {
  console.log('✗ Strict mode: warnings treated as errors.\n');
  process.exit(1);
}

console.log('✓ Production environment variables look complete.\n');
if (!args.has('--from-vercel') && !existsSync(resolve(ROOT, '.env.production.local'))) {
  console.log('Tip: vercel env pull .env.production.local --environment=production');
  console.log('     npm run check:prod-env -- --from-vercel\n');
}

process.exit(0);
