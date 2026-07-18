#!/usr/bin/env node
/**
 * Automated RLS smoke test. Connects to Supabase with the ANON key and NO
 * authenticated session, then reads each strictly-tenant-scoped table. With
 * correct Row Level Security every such read must return zero rows, because
 * the policies scope rows to `auth.uid()` and there is no signed-in user.
 *
 * A non-empty result means RLS is disabled or a policy is too permissive
 * (e.g. `USING (true)`) — a cross-tenant data leak. The complementary
 * SQL Editor checks live in scripts/rls-verify-queries.sql; see
 * docs/SUPABASE_RLS.md.
 *
 * Env (CI secrets or .env): SUPABASE_URL + SUPABASE_ANON_KEY
 * (VITE_-prefixed names are also accepted). Missing creds -> clean skip.
 *
 * Exit codes: 0 = ok or skipped, 1 = an RLS leak was detected.
 */
import { createClient } from '@supabase/supabase-js';

// Tables that must NEVER return rows to an unauthenticated anon client.
// Excludes `profiles` and `cards`, which intentionally allow public reads
// (is_public profiles and their cards).
const STRICT_TENANT_TABLES = [
  'user_data',
  'targets',
  'price_history',
  'market_events',
  'audit_events',
  'stripe_processed_events',
];

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  console.log('rls-verify: SUPABASE_URL / SUPABASE_ANON_KEY not set — skipping.');
  console.log('Set them (CI secrets or local env) to run the anon RLS smoke test.');
  process.exit(0);
}

/** @type {import('@supabase/supabase-js').SupabaseClientOptions} */
const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

// supabase-js constructs RealtimeClient at createClient time. Node 20 CI runners
// lack global WebSocket; provide a minimal transport so REST-only checks still run.
if (typeof globalThis.WebSocket === 'undefined') {
  clientOptions.realtime = {
    transport: class RlsVerifyNoopWebSocket {
      constructor() {
        queueMicrotask(() => this.onopen?.());
      }
      close() {}
      send() {}
      addEventListener() {}
      removeEventListener() {}
      dispatchEvent() {
        return false;
      }
    },
  };
}

const supabase = createClient(url, anonKey, clientOptions);

/** @returns {Promise<{table: string, status: 'ok'|'leak'|'missing'|'error', detail: string}>} */
async function checkTable(table) {
  const { data, error } = await supabase.from(table).select('*').limit(1);

  if (error) {
    // 42P01 = undefined_table. Permission-style errors also mean "denied".
    if (error.code === '42P01') {
      return { table, status: 'missing', detail: 'table does not exist' };
    }
    // An error here means the read was rejected — RLS is doing its job.
    return { table, status: 'ok', detail: `denied (${error.code || 'error'})` };
  }

  if (Array.isArray(data) && data.length > 0) {
    return {
      table,
      status: 'leak',
      detail: `returned ${data.length} row(s) to an unauthenticated anon client`,
    };
  }
  return { table, status: 'ok', detail: 'no rows (RLS enforced)' };
}

const results = await Promise.all(STRICT_TENANT_TABLES.map(checkTable));

let leaks = 0;
for (const r of results) {
  const mark = r.status === 'leak' ? 'LEAK' : r.status === 'missing' ? 'skip' : 'ok';
  console.log(`  [${mark}] ${r.table} — ${r.detail}`);
  if (r.status === 'leak') leaks += 1;
}

if (leaks > 0) {
  console.error(`\nrls-verify: ${leaks} table(s) leaked rows to an anonymous client.`);
  console.error('Enable RLS and scope policies to auth.uid(). See docs/SUPABASE_RLS.md.');
  process.exit(1);
}

console.log('\nrls-verify: all strict-tenant tables deny anonymous reads.');
process.exit(0);
