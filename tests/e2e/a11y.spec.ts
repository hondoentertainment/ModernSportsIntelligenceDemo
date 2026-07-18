import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enterDemoMode } from '../helpers/e2eAuth';

/**
 * Axe-core WCAG 2.0/2.1 A + AA smoke for shared app chrome on high-traffic routes.
 *
 * Scans header + sidebar only (not lazy feature widgets) so the suite stays stable
 * across 200+ demo pages while still guarding navigation contrast and naming.
 */

const SHELL_SELECTORS = ['header', '[role="complementary"]', 'a[href="#main-content"]'] as const;

const VIEWPORTS = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 }, // iPhone 13
] as const;

const ROUTES = [
    { hash: '/', label: 'Dashboard' },
    { hash: '/collection', label: 'Collection' },
    { hash: '/features', label: 'FeatureDirectory' },
    { hash: '/alerts', label: 'Alerts' },
    { hash: '/settings', label: 'Settings' },
    // Phase 31 surfaces. `/audit-trail/admin` under demo mode redirects to
    // `/audit-trail` (demo users are `member`), so the shell scan below
    // covers both effectively via the redirect target.
    { hash: '/audit-trail', label: 'AuditTrail' },
    { hash: '/audit-trail/admin', label: 'AdminAuditTrail (redirects to user view for member)' },
] as const;

test.describe('Accessibility — WCAG 2 A/AA smoke', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    for (const viewport of VIEWPORTS) {
        for (const route of ROUTES) {
            test(`${route.label} @ ${viewport.name} has no axe violations`, async ({ page }) => {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto(`/#${route.hash}`);

                // Wait for the rendered route content (not the Suspense fallback)
                // before axe walks the tree.
                await expect(
                    page.locator('main, [role="main"], h1, h2').first(),
                ).toBeVisible({ timeout: 15_000 });
                await page
                    .waitForLoadState('networkidle', { timeout: 15_000 })
                    .catch(() => {
                        // Some routes schedule background polling; fall back to
                        // a short fixed delay so axe still runs.
                    });
                await page.waitForTimeout(500);

                const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
                for (const selector of SHELL_SELECTORS) {
                    builder.include(selector);
                }
                const results = await builder.analyze();

                if (results.violations.length > 0) {
                    // Emit a structured summary so CI logs make it easy to triage.
                    const summary = results.violations.map((v) => ({
                        id: v.id,
                        impact: v.impact,
                        help: v.help,
                        nodes: v.nodes.length,
                    }));
                     
                    console.error(
                        `[a11y] ${route.label} @ ${viewport.name} violations:`,
                        JSON.stringify(summary, null, 2),
                    );
                }

                expect(
                    results.violations,
                    `Accessibility violations on ${route.label} (${viewport.name})`,
                ).toEqual([]);
            });
        }
    }
});
