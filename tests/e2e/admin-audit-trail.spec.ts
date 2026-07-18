import { expect, test } from '@playwright/test';
import { enterDemoMode, skipUnlessRealAuthConfigured, signInWithTestCredentials, isDemoModeBuild } from '../helpers/e2eAuth';

/**
 * E2E smoke for the operator cross-user audit viewer at
 * `/audit-trail/admin`.
 *
 * Two lanes:
 *   1) **Demo lane** (default) — demo users have `operatorRole === 'member'`,
 *      so `<AdminRoute>` should redirect them to the user-scoped viewer at
 *      `/audit-trail`. This lane runs on every CI E2E job and pins the
 *      redirect / gate behavior.
 *   2) **Real lane** (opt-in) — when `PLAYWRIGHT_REAL_AUTH=1` and a
 *      support/admin account is provisioned via env, sign in and confirm
 *      the admin viewer actually renders with its operator banner. Skipped
 *      otherwise so demo CI doesn't need Supabase creds.
 *
 * Server-side proof (audit-of-audit row insertion) lives in the Vitest
 * suite at `tests/api/admin-audit-events.test.ts` — this E2E only asserts
 * the client-side gate and the operator surface renders.
 */
test.describe('Admin Audit Trail — /audit-trail/admin', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Desktop chromium smoke');

    test.describe('demo lane (member users get redirected)', () => {
        test.beforeEach(async ({ page }) => {
            await enterDemoMode(page);
        });

        test('member operator role is bounced to the user viewer', async ({ page }) => {
            await page.goto('/#/audit-trail/admin');

            // Redirect happens after the loading shell clears; assert on the
            // final target rather than the transient state so the test isn't
            // timing-sensitive.
            await expect(
                page.getByRole('heading', { name: /audit trail & compliance logging/i }),
            ).toBeVisible({ timeout: 15_000 });

            // The operator banner (with the `ShieldAlert` icon and the
            // "Operator view" copy) belongs to /audit-trail/admin only; a
            // successful redirect means it must NOT be visible.
            await expect(page.getByText(/every read below is written to/i)).not.toBeVisible();
            await expect(page.getByRole('heading', { name: /cross-user audit trail/i })).not.toBeVisible();
        });
    });

    test.describe('real auth lane (support / admin operator)', () => {
        test('operator sees the admin viewer with the audit-of-audit banner', async ({ page }) => {
            const credentials = skipUnlessRealAuthConfigured();
            if (!credentials) return;
            if (await isDemoModeBuild(page)) {
                test.skip(true, 'Real-auth lane requires a Supabase-backed build.');
                return;
            }
            const operatorRoleHint = process.env.PLAYWRIGHT_TEST_OPERATOR_ROLE;
            if (operatorRoleHint !== 'support' && operatorRoleHint !== 'admin') {
                test.skip(
                    true,
                    'Set PLAYWRIGHT_TEST_OPERATOR_ROLE=support|admin (matching the seeded account) to run.',
                );
                return;
            }

            await signInWithTestCredentials(page, credentials.email, credentials.password);
            await page.goto('/#/audit-trail/admin');

            // The persistent operator banner is the load-bearing signal that
            // we're actually on the admin viewer, not the redirect target.
            await expect(page.getByText(/every read below is written to/i)).toBeVisible({
                timeout: 20_000,
            });
            await expect(
                page.getByRole('heading', { name: /cross-user audit trail/i }),
            ).toBeVisible();

            // CSV export button is present and enabled once the initial query
            // completes (fires on mount).
            const csvBtn = page.getByRole('button', { name: /export csv/i });
            await expect(csvBtn).toBeVisible({ timeout: 15_000 });
        });
    });
});
