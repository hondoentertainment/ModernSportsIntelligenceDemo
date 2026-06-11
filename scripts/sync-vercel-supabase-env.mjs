#!/usr/bin/env node
/**
 * Prints `vercel env add` commands for Supabase ↔ Vercel env parity.
 *
 * Requires a linked Supabase project (`supabase link`) and Supabase CLI login.
 *
 * Usage:
 *   npm run sync:vercel-env
 *   node scripts/sync-vercel-supabase-env.mjs --preview   # include preview targets
 *
 * In CI (GITHUB_ACTIONS / CI=true): secret values are never printed — only command stubs.
 * Locally (interactive TTY): prints pipe-ready commands with values.
 *
 * @see docs/DEPLOY_ENV_CHECKLIST.md
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const includePreview = args.has('--preview');

const SYNC_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ALLOWED_ORIGIN',
];

const isCi = Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
const isInteractive = !isCi && process.stdout.isTTY === true;

function hasSupabaseCli() {
  const probe = spawnSync('supabase', ['--version'], { stdio: 'pipe', shell: process.platform === 'win32' });
  return probe.status === 0;
}

function readProjectRefFromTemp() {
  const path = resolve(ROOT, 'supabase', '.temp', 'project-ref');
  if (!existsSync(path)) return null;
  const ref = readFileSync(path, 'utf8').trim();
  return ref || null;
}

function parseProjectRefFromApiUrl(apiUrl) {
  if (!apiUrl || typeof apiUrl !== 'string') return null;
  const match = apiUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function readProjectRefFromStatusJson() {
  const result = spawnSync(
    'supabase',
    ['status', '--output', 'json'],
    { cwd: ROOT, encoding: 'utf8', shell: process.platform === 'win32' },
  );
  if (result.status !== 0 || !result.stdout?.trim()) return null;
  try {
    const data = JSON.parse(result.stdout);
    return (
      data.project_ref ??
      data.PROJECT_REF ??
      data.projectRef ??
      parseProjectRefFromApiUrl(data.API_URL ?? data.api_url)
    );
  } catch {
    return null;
  }
}

function resolveProjectRef() {
  return (
    readProjectRefFromTemp() ??
    process.env.SUPABASE_PROJECT_ID?.trim() ??
    readProjectRefFromStatusJson() ??
    null
  );
}

function isPausedProjectError(text) {
  const lower = (text ?? '').toLowerCase();
  return (
    lower.includes('project is paused') ||
    lower.includes('project paused') ||
    lower.includes('inactive project') ||
    lower.includes('restore your project') ||
    lower.includes('project is inactive')
  );
}

function dashboardUrl(projectRef) {
  return `https://supabase.com/dashboard/project/${projectRef}`;
}

function fetchApiKeys(projectRef) {
  const cmdArgs = ['projects', 'api-keys', '--output', 'json'];
  if (projectRef) cmdArgs.push('--project-ref', projectRef);

  const result = spawnSync('supabase', cmdArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  const combined = `${result.stderr ?? ''}\n${result.stdout ?? ''}`;
  if (isPausedProjectError(combined)) {
    return { paused: true, keys: null, error: combined };
  }
  if (result.status !== 0) {
    return { paused: false, keys: null, error: combined.trim() || `exit ${result.status}` };
  }

  try {
    const data = JSON.parse(result.stdout);
    const keys = Array.isArray(data) ? data : (data.keys ?? []);
    return { paused: false, keys, error: null };
  } catch {
    return { paused: false, keys: null, error: 'Failed to parse supabase projects api-keys JSON' };
  }
}

function pickAnonKey(keys) {
  if (!Array.isArray(keys)) return null;
  const anon = keys.find((k) => (k.name ?? k.type ?? '').toLowerCase() === 'anon');
  return anon?.api_key ?? anon?.key ?? null;
}

function guessAllowedOrigin() {
  const fromEnv = process.env.ALLOWED_ORIGIN?.trim();
  if (fromEnv) return fromEnv;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;

  const projectJson = resolve(ROOT, '.vercel', 'project.json');
  if (existsSync(projectJson)) {
    try {
      const { name } = JSON.parse(readFileSync(projectJson, 'utf8'));
      if (name) return `https://${name}.vercel.app`;
    } catch {
      // ignore
    }
  }

  return null;
}

function printVercelEnvCommand(key, value, environment) {
  if (isInteractive && value) {
    console.log(`echo "${value.replace(/"/g, '\\"')}" | vercel env add ${key} ${environment}`);
  } else {
    console.log(`vercel env add ${key} ${environment}   # set value from Supabase Dashboard → Settings → API`);
  }
}

function printCommands(values, environments) {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  Vercel env sync (Supabase → Vercel)');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (isCi) {
    console.log('CI mode: secret values are omitted. Run locally or paste from the Supabase dashboard.\n');
  } else if (isInteractive) {
    console.log('Interactive mode: commands include values (pipe into vercel env add).\n');
  } else {
    console.log('Non-TTY mode: secret values omitted (same as CI).\n');
  }

  for (const env of environments) {
    console.log(`── ${env} ──`);
    for (const key of SYNC_KEYS) {
      printVercelEnvCommand(key, values[key], env);
    }
    console.log('');
  }

  console.log('Validate after setting:');
  console.log('  npm run check:prod-env -- --from-vercel');
  console.log('Docs: docs/DEPLOY_ENV_CHECKLIST.md\n');
}

if (args.has('--help') || args.has('-h')) {
  console.log(`Usage: node scripts/sync-vercel-supabase-env.mjs [options]

Options:
  --preview   Also print commands for the preview environment
  -h, --help  Show this help

Requires: supabase link, supabase login (or SUPABASE_ACCESS_TOKEN)
`);
  process.exit(0);
}

console.log('Modern Sports Intelligence — sync Vercel env from Supabase\n');

if (!hasSupabaseCli()) {
  console.error('✗ Supabase CLI not found. Install: https://supabase.com/docs/guides/cli');
  process.exit(1);
}

const projectRef = resolveProjectRef();
if (!projectRef) {
  console.error('✗ No linked Supabase project ref found.');
  console.error('  Run: supabase link --project-ref <ref>');
  console.error('  Or set SUPABASE_PROJECT_ID for CI.');
  process.exit(1);
}

console.log(`✓ Project ref: ${projectRef}`);

const { paused, keys, error } = fetchApiKeys(projectRef);
if (paused) {
  console.error('\n✗ Supabase project is paused.');
  console.error(`  Unpause / restore in the dashboard: ${dashboardUrl(projectRef)}`);
  console.error('  After restore, re-run: npm run sync:vercel-env\n');
  process.exit(1);
}

if (!keys) {
  console.error(`✗ Could not fetch API keys: ${error}`);
  console.error('  Ensure you are logged in: supabase login');
  console.error(`  Dashboard: ${dashboardUrl(projectRef)}\n`);
  process.exit(1);
}

const anonKey = pickAnonKey(keys);
if (!anonKey) {
  console.error('✗ Anon API key not returned (may be redacted).');
  console.error(`  Copy keys from: ${dashboardUrl(projectRef)}/settings/api`);
  console.error('  Then run vercel env add manually.\n');
  process.exit(1);
}

const supabaseUrl = `https://${projectRef}.supabase.co`;
const allowedOrigin = guessAllowedOrigin() ?? 'https://<your-production-domain>';

const values = {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: anonKey,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_ANON_KEY: anonKey,
  ALLOWED_ORIGIN: allowedOrigin,
};

const environments = ['production'];
if (includePreview) environments.push('preview');

printCommands(values, environments);
