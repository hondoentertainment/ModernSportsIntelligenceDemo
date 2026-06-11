import { expect, test } from '@playwright/test';
import {
    isDemoModeBuild,
    prepareFreshBrowserSession,
    signInWithTestCredentials,
    skipUnlessRealAuthConfigured,
} from '../helpers/e2eAuth';

/**
 * Optional Supabase sign-in smoke — skipped in default demo E2E builds.
 *
 *   PLAYWRIGHT_REAL_AUTH=1 \
 *   PLAYWRIGHT_TEST_EMAIL=... PLAYWRIGHT_TEST_PASSWORD=... \
 *   PLAYWRIGHT_BASE_URL=https://<vercel-app> npm run test:e2e:real-auth
 *
 * See tests/helpers/e2eAuth.ts for full env documentation.
 */
test.describe('Real auth smoke (Supabase)', () => {
    test('sign-in → collection → session persists after reload', async ({ page }) => {
        const credentials = skipUnlessRealAuthConfigured();
        if (!credentials) return;

        if (await isDemoModeBuild(page)) {
            test.skip(
                true,
                'VITE_SUPABASE_URL is not configured in this build (demo mode). Use a Supabase-backed deployment or .env.e2e.local.',
            );
            return;
        }

        await signInWithTestCredentials(page, credentials.email, credentials.password);

        await page.goto('/#/collection');
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({
            timeout: 20_000,
        });

        // Persistence hint: cloud-backed session shows sync badge (or hydrates without demo notice).
        await expect(
            page.getByText(/cloud synced|local terminal/i).first(),
        ).toBeVisible({ timeout: 15_000 });

        await page.reload();
        await expect(page).not.toHaveURL(/login/, { timeout: 15_000 });
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({
            timeout: 20_000,
        });
    });

    test('fresh context requires sign-in again', async ({ page }) => {
        const credentials = skipUnlessRealAuthConfigured();
        if (!credentials) return;

        if (await isDemoModeBuild(page)) {
            test.skip(
                true,
                'VITE_SUPABASE_URL is not configured in this build (demo mode). Use a Supabase-backed deployment or .env.e2e.local.',
            );
            return;
        }

        await signInWithTestCredentials(page, credentials.email, credentials.password);
        await page.goto('/#/collection');
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({
            timeout: 20_000,
        });

        await page.context().clearCookies();
        await prepareFreshBrowserSession(page);
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({
            timeout: 10_000,
        });
    });
});
