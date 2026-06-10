#!/usr/bin/env node
/**
 * Production infrastructure orchestrator.
 * Applies Supabase migrations, deploys Edge Functions, and prints env checklist.
 *
 * Usage:
 *   node scripts/deploy-production.mjs              # full run (requires linked Supabase)
 *   node scripts/deploy-production.mjs --dry-run    # checklist only
 *   node scripts/deploy-production.mjs --migrations-only
 *   node scripts/deploy-production.mjs --functions-only
 *
 * @see docs/DEPLOY_ENV_CHECKLIST.md
 * @see docs/PRODUCTION_ROLLOUT_PHASES.md
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const migrationsOnly = args.has('--migrations-only');
const functionsOnly = args.has('--functions-only');

const EDGE_FUNCTIONS = [
  'create-checkout-session',
  'create-billing-portal-session',
  'verify-psa-cert',
];

const REQUIRED_VERCEL_ENV = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ALLOWED_ORIGIN',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
];

function run(cmd, cmdArgs, { optional = false } = {}) {
  const label = `${cmd} ${cmdArgs.join(' ')}`;
  if (dryRun) {
    console.log(`[dry-run] ${label}`);
    return { ok: true };
  }
  console.log(`\n→ ${label}`);
  const result = spawnSync(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0 && !optional) {
    console.error(`\n✗ Failed: ${label}`);
    process.exit(result.status ?? 1);
  }
  return { ok: result.status === 0 };
}

function hasSupabaseCli() {
  const probe = spawnSync('supabase', ['--version'], { stdio: 'pipe', shell: process.platform === 'win32' });
  return probe.status === 0;
}

function printChecklist() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Production deploy checklist');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('1. Vercel: connect repo, set Production + Preview env vars:');
  for (const key of REQUIRED_VERCEL_ENV) {
    console.log(`   • ${key}`);
  }
  console.log('\n2. Supabase: apply migrations 00001–00007 in supabase/migrations/');
  console.log('3. Supabase Auth: add production + preview redirect URLs');
  console.log('4. Stripe webhook: https://<domain>/api/stripe-webhook');
  console.log('5. Post-deploy: GET /api/health → 200');
  console.log('6. Post-deploy: PLAYWRIGHT_BASE_URL=<url> npm run test:e2e:deployed');
  console.log('\nDocs: docs/DEPLOY_ENV_CHECKLIST.md\n');
}

function verifyRepoArtifacts() {
  const required = [
    'vercel.json',
    'supabase/migrations/00001_rls_audit_events.sql',
    'supabase/migrations/00007_user_data_updated_at_trigger.sql',
    'api/stripe-webhook.ts',
    'api/health.ts',
  ];
  let ok = true;
  for (const rel of required) {
    const path = resolve(ROOT, rel);
    if (!existsSync(path)) {
      console.error(`✗ Missing required file: ${rel}`);
      ok = false;
    }
  }
  if (ok) {
    console.log('✓ Repo production artifacts present');
  }
  return ok;
}

console.log('Modern Sports Intelligence — production deploy\n');

if (!verifyRepoArtifacts()) {
  process.exit(1);
}

printChecklist();

if (dryRun) {
  console.log('[dry-run] Skipping Supabase CLI commands.');
  process.exit(0);
}

if (!hasSupabaseCli()) {
  console.warn('\n⚠ Supabase CLI not found. Install: https://supabase.com/docs/guides/cli');
  console.warn('  Skipping db push and function deploy. Run manually after `supabase link`.');
  process.exit(0);
}

if (!functionsOnly) {
  console.log('\n── Supabase migrations ──');
  run('supabase', ['db', 'push']);
}

if (!migrationsOnly) {
  console.log('\n── Supabase Edge Functions ──');
  for (const fn of EDGE_FUNCTIONS) {
    run('supabase', ['functions', 'deploy', fn]);
  }

  console.log('\n── Stripe webhook reminder ──');
  console.log('Configure in Stripe Dashboard → Webhooks:');
  console.log('  URL: https://<your-vercel-domain>/api/stripe-webhook');
  console.log('  Events: checkout.session.completed, customer.subscription.*, invoice.*');
}

console.log('\n✓ deploy-production complete. Set Vercel env vars and run post-deploy smoke tests.\n');
