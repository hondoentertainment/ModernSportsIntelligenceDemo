import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Integration test for the RLS guardrail.
// Skipped entirely unless SUPABASE_DB_URL is configured, so the default
// Vitest suite remains green for local devs and external contributors.
//
// When SUPABASE_DB_URL is present we spawn the script with the same
// environment and assert it either reports SKIP (pg dep missing) or OK
// (successful policy verification). Any failure surfaces as non-zero exit.

const HAS_DB_URL = Boolean(process.env.SUPABASE_DB_URL);

describe('RLS policy guardrail', () => {
  it.skipIf(!HAS_DB_URL)(
    'scripts/run-rls-checks.mjs reports OK or SKIP and exits 0',
    () => {
      const scriptPath = resolve(process.cwd(), 'scripts/run-rls-checks.mjs');
      const result = spawnSync(process.execPath, [scriptPath], {
        encoding: 'utf8',
        env: process.env,
      });

      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

      expect(result.status, `script output:\n${output}`).toBe(0);
      expect(output).toMatch(/\[rls-check\] (OK|SKIP)/);
    },
    60_000
  );
});
