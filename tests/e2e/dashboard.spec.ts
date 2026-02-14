import { test, expect } from '@playwright/test';

test.describe('Dashboard (after demo login)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/login');
        const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
        if (await demoButton.isVisible()) {
            await demoButton.click();
            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/#\/$/, { timeout: 15000 });
        }
    });

    test('Dashboard loads after demo login', async ({ page }) => {
        await expect(page.getByText(/modern sports intelligence|nav|portfolio|dashboard/i).first()).toBeVisible({ timeout: 8000 });
    });

    test('Collection link navigates to collection', async ({ page }) => {
        const collectionLink = page.getByRole('link', { name: /collection|inventory/i }).first();
        await expect(collectionLink).toBeVisible({ timeout: 5000 });
        await collectionLink.click();
        await expect(page).toHaveURL(/collection/);
    });
});
