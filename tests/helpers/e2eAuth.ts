import { expect, test, type Page } from '@playwright/test';

/**
 * E2E auth helpers — demo mode and optional real Supabase sign-in.
 *
 * ## Demo mode (default CI / `npm run build:e2e`)
 * `.env.e2e` leaves `VITE_SUPABASE_URL` empty so the login page shows
 * **Enter Demo Mode**. Use `enterDemoMode()` for smoke specs.
 *
 * ## Real auth smoke (`npm run test:e2e:real-auth`)
 * Opt-in only. Set **all** of:
 *
 * | Variable | Purpose |
 * |----------|---------|
 * | `PLAYWRIGHT_REAL_AUTH` | Must be `1` to run real-auth specs (otherwise skipped). |
 * | `PLAYWRIGHT_TEST_EMAIL` | Supabase test user email (dedicated E2E account). |
 * | `PLAYWRIGHT_TEST_PASSWORD` | Password for the test user. |
 *
 * The app build must have Supabase configured (`VITE_SUPABASE_URL` +
 * `VITE_SUPABASE_ANON_KEY` baked in). Options:
 *
 * 1. **Deployed:** `PLAYWRIGHT_BASE_URL=https://<vercel-app>` (production/preview).
 * 2. **Local:** create gitignored `.env.e2e.local` with real Supabase vars, then
 *    `npm run build:e2e && npm run preview` before running the spec.
 *
 * Never commit real credentials. Prefer a disposable Supabase user with minimal data.
 */

export function isRealAuthRunRequested(): boolean {
    return process.env.PLAYWRIGHT_REAL_AUTH === '1';
}

export function getRealAuthCredentials(): { email: string; password: string } | null {
    const email = process.env.PLAYWRIGHT_TEST_EMAIL?.trim();
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD?.trim();
    if (!email || !password) return null;
    return { email, password };
}

/** Clears storage and skips the guided-tour overlay (HashRouter `/#/login`). */
export async function prepareFreshBrowserSession(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
    });
    await page.reload();
    await page.goto('/#/login');
}

/**
 * True when the preview build has no Supabase URL (demo login button visible).
 */
export async function isDemoModeBuild(page: Page): Promise<boolean> {
    await prepareFreshBrowserSession(page);
    const demoButton = page.getByRole('button', { name: /enter demo mode/i });
    try {
        await expect(demoButton).toBeVisible({ timeout: 5_000 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Skips the current test unless real-auth env + credentials are present.
 * Returns credentials when the test should run; otherwise returns null after skip.
 */
export function skipUnlessRealAuthConfigured(): { email: string; password: string } | null {
    if (!isRealAuthRunRequested()) {
        test.skip(true, 'Set PLAYWRIGHT_REAL_AUTH=1 to run real Supabase auth smoke tests.');
        return null;
    }
    const credentials = getRealAuthCredentials();
    if (!credentials) {
        test.skip(
            true,
            'Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD for real auth smoke tests.',
        );
        return null;
    }
    return credentials;
}

export async function signInWithTestCredentials(
    page: Page,
    email: string,
    password: string,
): Promise<void> {
    await page.getByPlaceholder('investor@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 20_000 });
    await expect(page.getByRole('button', { name: /enter demo mode/i })).toHaveCount(0);
}

/**
 * Drops a fresh browser context into the authenticated demo shell.
 *
 * Mirrors the pattern used by tests/e2e/auth.spec.ts and
 * tests/e2e/release-smoke.spec.ts so that every new spec authenticates
 * the same way and stays compatible with the demo-mode preview server
 * (`npm run build:e2e && npm run preview`) configured in
 * playwright.config.ts.
 */
export async function enterDemoMode(page: Page): Promise<void> {
    await prepareFreshBrowserSession(page);
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 10_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}
