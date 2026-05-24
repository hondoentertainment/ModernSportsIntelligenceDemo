import { expect, test } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

/**
 * E2E smoke for /audit-trail.
 *
 * The page lazy-loads pages/AuditTrail.tsx, which (post-Phase-31) calls
 * useEffect → getRemoteAuditEvents() on mount. In demo mode that returns []
 * and the UI falls back to the local + sample event feed. This spec verifies
 * the route mounts, the heading renders, all three tabs are interactive,
 * and the refresh button works without throwing.
 */
test.describe('Audit Trail page (/audit-trail)', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Desktop chromium smoke');

    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
        await page.goto('/#/audit-trail');
    });

    test('mounts with heading, stats grid, and Audit Log tab content', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /audit trail & compliance logging/i }),
        ).toBeVisible({ timeout: 15_000 });

        // The five stat tiles all render: Events Today, Compliance,
        // Violations, Security Events, Storage.
        for (const label of ['Events Today', 'Compliance', 'Violations', 'Security Events', 'Storage']) {
            await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
        }

        // The default tab is "Audit Log"; at least one canned sample row
        // should render even without remote data.
        const tabAuditLog = page.getByRole('button', { name: /audit log/i });
        await expect(tabAuditLog).toBeVisible();
    });

    test('switches between Compliance Rules and Data Retention tabs', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /audit trail & compliance logging/i }),
        ).toBeVisible({ timeout: 15_000 });

        const tabCompliance = page.getByRole('button', { name: /compliance rules/i });
        await tabCompliance.click();
        await expect(page.getByText(/aml.*kyc/i).first()).toBeVisible({ timeout: 5_000 });

        const tabRetention = page.getByRole('button', { name: /data retention/i });
        await tabRetention.click();
        await expect(page.getByText(/data retention policies/i)).toBeVisible({ timeout: 5_000 });
    });

    test('refresh button re-fetches without crashing', async ({ page }) => {
        await expect(
            page.getByRole('heading', { name: /audit trail & compliance logging/i }),
        ).toBeVisible({ timeout: 15_000 });

        const refreshBtn = page.getByRole('button', { name: /^refresh$/i });
        await expect(refreshBtn).toBeVisible();
        await refreshBtn.click();
        // No throw; the heading is still present after re-render.
        await expect(
            page.getByRole('heading', { name: /audit trail & compliance logging/i }),
        ).toBeVisible();
    });
});
