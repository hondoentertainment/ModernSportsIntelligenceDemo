// @ts-nocheck
import { test, expect, type Page } from '@playwright/test';

async function enterDemoMode(page: Page) {
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
    if (!(await demoButton.isVisible())) {
        return false;
    }
    await demoButton.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/#\/$/, { timeout: 15000 });
    return true;
}

test.describe('Differentiator routes', () => {
    test('dashboard exposes differentiator links', async ({ page }) => {
        if (!(await enterDemoMode(page))) {
            test.skip(true, 'Demo login is not available in this environment.');
        }
        await expect(page.getByRole('link', { name: /Liquidity Twin/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Private Deal Room/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Trust Graph/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Catalyst Market/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /Scenario Theater/i })).toBeVisible();
    });

    test('liquidity twin route loads', async ({ page }) => {
        if (!(await enterDemoMode(page))) {
            test.skip(true, 'Demo login is not available in this environment.');
        }
        await page.goto('/#/liquidity-twin');
        await expect(page.getByRole('heading', { name: /Exit Intelligence & Venue Routing/i })).toBeVisible({ timeout: 10000 });
    });

    test('scenario theater route loads', async ({ page }) => {
        if (!(await enterDemoMode(page))) {
            test.skip(true, 'Demo login is not available in this environment.');
        }
        await page.goto('/#/portfolio-scenario-theater');
        await expect(page.getByRole('heading', { name: /Forward Simulation & Decision Rehearsal/i })).toBeVisible({ timeout: 10000 });
    });
});
