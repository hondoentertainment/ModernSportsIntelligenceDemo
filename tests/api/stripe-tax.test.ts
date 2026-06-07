import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Stripe Tax on checkout (regression guard)', () => {
  const src = readFileSync(
    join(process.cwd(), 'supabase', 'functions', 'create-checkout-session', 'index.ts'),
    'utf8',
  );

  it('enables automatic_tax', () => {
    expect(src).toMatch(/automatic_tax\s*:\s*\{\s*enabled\s*:\s*true\s*\}/);
  });

  it('enables tax_id_collection for B2B reverse-charge', () => {
    expect(src).toMatch(/tax_id_collection\s*:\s*\{\s*enabled\s*:\s*true\s*\}/);
  });

  it('sets customer_update.address to "auto" so Stripe can derive jurisdiction', () => {
    // Match either single or double quoted 'auto'.
    expect(src).toMatch(/customer_update\s*:\s*\{[^}]*address\s*:\s*['"]auto['"]/);
  });

  it('mentions Stripe Tax in a comment near the params for future-author context', () => {
    expect(src).toMatch(/Stripe\s+Tax/i);
  });
});
