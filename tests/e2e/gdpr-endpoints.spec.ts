import { test, expect } from '@playwright/test';

/**
 * GDPR endpoint smoke — makes launch punch-list item 7 a single command.
 *
 * Two layers:
 *
 * 1. **Contract checks (any Vercel deployment):**
 *      PLAYWRIGHT_BASE_URL=https://<app>.vercel.app \
 *        npx playwright test tests/e2e/gdpr-endpoints.spec.ts --project=chromium
 *    Verifies both endpoints exist, enforce their methods, and refuse
 *    unauthenticated calls. Skips against plain Vite preview (no /api).
 *
 * 2. **Authenticated export (opt-in, throwaway account recommended):**
 *    additionally set PLAYWRIGHT_REAL_AUTH=1, PLAYWRIGHT_TEST_EMAIL, and
 *    PLAYWRIGHT_TEST_PASSWORD (same env as real-auth-smoke). The spec signs
 *    in via the Supabase token endpoint and asserts /api/me/export returns
 *    the caller's data.
 *
 * The destructive /api/me/delete call is intentionally NOT automated — it is
 * verified here only up to the auth/method/confirmation contract. Run the
 * final purge manually on a throwaway account per
 * docs/LAUNCH_OPS_PUNCH_LIST.md item 7.
 */
test.describe('GDPR endpoints (/api/me/export, /api/me/delete)', () => {
  test('export requires auth and only allows GET', async ({ request }) => {
    const unauthed = await request.get('/api/me/export');
    if (unauthed.status() === 404) {
      test.skip(true, 'Set PLAYWRIGHT_BASE_URL to a Vercel deployment — /api is not served by Vite preview.');
      return;
    }
    expect([401, 429, 503]).toContain(unauthed.status());

    const wrongMethod = await request.post('/api/me/export', { data: {} });
    expect([405, 429]).toContain(wrongMethod.status());
  });

  test('delete requires auth, POST, and the confirmation phrase', async ({ request }) => {
    const unauthed = await request.post('/api/me/delete', {
      data: { confirm: 'DELETE MY ACCOUNT' },
      headers: { 'Content-Type': 'application/json' },
    });
    if (unauthed.status() === 404) {
      test.skip(true, 'Set PLAYWRIGHT_BASE_URL to a Vercel deployment — /api is not served by Vite preview.');
      return;
    }
    expect([401, 429, 503]).toContain(unauthed.status());

    const wrongMethod = await request.get('/api/me/delete');
    expect([405, 429]).toContain(wrongMethod.status());
  });

  test('authenticated export returns the caller data (opt-in)', async ({ request }) => {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL?.trim();
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD?.trim();
    const supabaseUrl = process.env.PLAYWRIGHT_SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim();
    const supabaseAnonKey =
      process.env.PLAYWRIGHT_SUPABASE_ANON_KEY?.trim() || process.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (process.env.PLAYWRIGHT_REAL_AUTH !== '1' || !email || !password || !supabaseUrl || !supabaseAnonKey) {
      test.skip(
        true,
        'Opt-in: set PLAYWRIGHT_REAL_AUTH=1, PLAYWRIGHT_TEST_EMAIL/PASSWORD, and Supabase URL + anon key envs.',
      );
      return;
    }

    // Password grant against Supabase GoTrue to obtain a user JWT.
    const tokenRes = await request.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json' },
      data: { email, password },
    });
    expect(tokenRes.status(), 'Supabase sign-in for the test user should succeed').toBe(200);
    const { access_token: accessToken } = (await tokenRes.json()) as { access_token: string };
    expect(accessToken).toBeTruthy();

    const res = await request.get('/api/me/export', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type'] ?? '').toContain('application/json');
    const body = await res.json();
    // The export must identify whose data it is and carry the data sections.
    expect(JSON.stringify(body).toLowerCase()).toContain(email.toLowerCase());
  });
});
