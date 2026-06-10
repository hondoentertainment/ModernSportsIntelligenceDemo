#!/usr/bin/env node
// Automated RLS guardrail. Runs the queries in scripts/rls-verify-queries.sql
// against the project's Postgres instance and fails if:
//   - any table in `public` has relrowsecurity = false, or
//   - the total number of policies in `public` is below RLS_MIN_POLICIES.
//
// Skip semantics (so this is safe in any environment):
//   - Missing SUPABASE_DB_URL              -> exit 0 with [rls-check] SKIP
//   - Missing optional `pg` runtime dep    -> exit 0 with [rls-check] SKIP
//
// Real failures (creds + pg present) exit non-zero so CI fails loudly.
//
// See docs/SUPABASE_RLS.md (#automated-verification).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_PATH = resolve(__dirname, 'rls-verify-queries.sql');

const DB_URL = process.env.SUPABASE_DB_URL;
const MIN_POLICIES = Number.parseInt(process.env.RLS_MIN_POLICIES ?? '4', 10);

if (!DB_URL) {
  console.log('[rls-check] SKIP — SUPABASE_DB_URL not set');
  process.exit(0);
}

let pgModule;
try {
  pgModule = await import('pg');
} catch {
  console.log("[rls-check] SKIP — 'pg' not installed; install with: npm i -D pg");
  process.exit(0);
}

const { Client } = pgModule.default ?? pgModule;

let sqlText;
try {
  sqlText = readFileSync(SQL_PATH, 'utf8');
} catch (err) {
  console.error(`[rls-check] ERROR — failed to read ${SQL_PATH}: ${err.message}`);
  process.exit(1);
}

// The verification file contains two SELECT statements separated by a blank
// line and SQL comments. Strip line-comments and split on the trailing `;`.
const statements = sqlText
  .split('\n')
  .filter((line) => !line.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

if (statements.length < 2) {
  console.error(
    `[rls-check] ERROR — expected at least 2 SQL statements in ${SQL_PATH}, found ${statements.length}`
  );
  process.exit(1);
}

const [rlsOffQuery, policiesQuery] = statements;

const client = new Client({ connectionString: DB_URL });

let exitCode = 0;
try {
  await client.connect();

  const rlsOff = await client.query(rlsOffQuery);
  if (rlsOff.rows.length > 0) {
    exitCode = 1;
    console.error('[rls-check] FAIL — tables in public.* without RLS:');
    for (const row of rlsOff.rows) {
      console.error(`  - ${row.table_name}`);
    }
  }

  const policies = await client.query(policiesQuery);
  const policyCount = policies.rows.length;
  const tableCount = new Set(policies.rows.map((r) => r.tablename)).size;

  if (policyCount < MIN_POLICIES) {
    exitCode = 1;
    console.error(
      `[rls-check] FAIL — only ${policyCount} policies found in public.* (minimum ${MIN_POLICIES}). ` +
        `Override with RLS_MIN_POLICIES.`
    );
  }

  if (exitCode === 0) {
    console.log(`[rls-check] OK — ${tableCount} tables, ${policyCount} policies`);
  }
} catch (err) {
  exitCode = 1;
  console.error(`[rls-check] ERROR — ${err.message}`);
} finally {
  try {
    await client.end();
  } catch {
    // ignore close errors
  }
}

process.exit(exitCode);
