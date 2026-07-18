#!/usr/bin/env node
/**
 * Promote a profiles.role to admin/support out-of-band (service role / SQL).
 *
 * Usage:
 *   node scripts/promote-admin.mjs --email you@example.com
 *   node scripts/promote-admin.mjs --email you@example.com --role support
 *
 * Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or .env.supabase.local)
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvFile(rel) {
  const path = resolve(ROOT, rel);
  if (!existsSync(path)) return;
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

loadEnvFile('.env.supabase.local');
loadEnvFile('.env.local');

const args = process.argv.slice(2);
function flag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const email = (flag('--email') || '').trim().toLowerCase();
const role = (flag('--role') || 'admin').trim().toLowerCase();

if (!email || !['admin', 'support'].includes(role)) {
  console.error('Usage: node scripts/promote-admin.mjs --email you@example.com [--role admin|support]');
  process.exit(1);
}

const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (!url || !serviceKey) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
if (listErr) {
  console.error('listUsers failed:', listErr.message);
  process.exit(1);
}

const user = (list?.users ?? []).find((u) => (u.email || '').toLowerCase() === email);
if (!user) {
  console.error(`No auth.users row for ${email}. Sign up first or run scripts/bootstrap-launch-ops.mjs`);
  process.exit(1);
}

const { data: profile, error: updErr } = await admin
  .from('profiles')
  .update({ role })
  .eq('id', user.id)
  .select('id, role, username, display_name')
  .maybeSingle();

if (updErr) {
  console.error('profiles update failed:', updErr.message);
  process.exit(1);
}

console.log(`Promoted ${email} → role=${profile?.role ?? role} (id=${user.id})`);
process.exit(0);
