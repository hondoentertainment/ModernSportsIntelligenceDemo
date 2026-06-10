import { expect, test } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

/**
 * Lightweight visual regression scaffold — 3 high-value desktop screens only.
 *
 * Baselines are produced locally with:
 *   npx playwright test tests/e2e/visual-smoke.spec.ts --project=chromium --update-snapshots
 *
 * Dynamic regions (live market ticker, animated charts, timestamps) are
 * masked so the snapshots remain stable across runs.
 */

const VIEWPORT = { width: 1440, height: 900 } as const;

test.describe('Visual regression smoke', () => {
    test.use({ viewport: VIEWPORT });

    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
        await page.setViewportSize(VIEWPORT);
    });

    /**
     * Region masks shared across every snapshot.  Selectors are intentionally
     * defensive — `:has()` falls back gracefully when an element is not yet
     * mounted (e.g. on a route that hasn't rendered the ticker).
     */
    function dynamicMasks(page: import('@playwright/test').Page) {
        return [
            // Marquee market ticker — animation never stops, so always mask.
            page.locator('div:has(> div:has-text("Live Market Pulse"))').first(),
            // Recharts surfaces — animated entry transitions are non-deterministic.
            page.locator('.recharts-responsive-container'),
            // Pulsing "Live" status indicators / sync badges that include the
            // current sync timestamp.
            page.locator('[data-dynamic="true"]'),
        ];
    }

    test('Dashboard at /', async ({ page }) => {
        await page.goto('/#/');
        // Wait for the hero copy ("Net Asset" or "SYSTEM") to render so we
        // don't snapshot the suspense fallback.
        await expect(
            page.getByText(/net asset|system\s+initialization/i).first(),
        ).toBeVisible({ timeout: 15_000 });
        await page.waitForTimeout(750);

        await expect(page).toHaveScreenshot('dashboard.png', {
            fullPage: false,
            mask: dynamicMasks(page),
            maxDiffPixelRatio: 0.02,
        });
    });

    test('Command palette open over Dashboard', async ({ page }) => {
        await page.goto('/#/');
        await expect(
            page.getByText(/net asset|system\s+initialization/i).first(),
        ).toBeVisible({ timeout: 15_000 });

        await page.keyboard.press('Control+K');
        const dialog = page.getByRole('dialog', { name: /command palette/i });
        await expect(dialog).toBeVisible();
        // Let focus + section list settle.
        await page.waitForTimeout(250);

        await expect(page).toHaveScreenshot('command-palette-open.png', {
            fullPage: false,
            mask: dynamicMasks(page),
            maxDiffPixelRatio: 0.02,
        });
    });

    test('Sidebar collapsed and expanded', async ({ page }) => {
        await page.goto('/#/');
        await expect(
            page.getByText(/net asset|system\s+initialization/i).first(),
        ).toBeVisible({ timeout: 15_000 });

        // Sidebar opens by default — capture the expanded state first.
        await expect(page.getByRole('complementary', { name: /main navigation/i })).toBeVisible();
        await page.waitForTimeout(400);
        await expect(page).toHaveScreenshot('sidebar-expanded.png', {
            fullPage: false,
            mask: dynamicMasks(page),
            maxDiffPixelRatio: 0.02,
        });

        // Then collapse the sidebar via its toggle button.
        const collapseBtn = page.getByRole('button', { name: /collapse sidebar/i });
        await collapseBtn.click();
        await expect(page.getByRole('button', { name: /expand sidebar/i })).toBeVisible();
        // 300ms transition + a small settle buffer.
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot('sidebar-collapsed.png', {
            fullPage: false,
            mask: dynamicMasks(page),
            maxDiffPixelRatio: 0.02,
        });
    });
});
