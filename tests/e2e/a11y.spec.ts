import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { enterDemoMode } from '../helpers/e2eAuth';

/**
 * Axe-core WCAG 2.0/2.1 A + AA smoke for the highest-traffic chrome routes.
 *
 * Phase-4 contrast pass: `brand.muted` was raised to oklch(0.72 0.02 240),
 * so the `color-contrast` rule is now enforced (no more disableRules).
 */

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

                const results = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
                    .analyze();

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
