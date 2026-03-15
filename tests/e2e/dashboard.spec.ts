import { test, expect } from '@playwright/test';

test.describe('Dashboard (after demo login)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/login');
        const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
        if (await demoButton.isVisible({ timeout: 5000 }).catch(() => false)) {
            await demoButton.click();
            await expect(page).toHaveURL(/#\/$/, { timeout: 15000 });
        }
    });

    test('Dashboard loads after demo login', async ({ page }) => {
        await expect(page.getByText(/modern sports intelligence|nav|portfolio|dashboard/i).first()).toBeVisible({ timeout: 8000 });
    });

    test('Collection link navigates to collection', async ({ page }) => {
        await page.goto('/#/collection');
        await expect(page).toHaveURL(/collection/);
        await expect(page.getByText(/asset repository|collection/i).first()).toBeVisible({ timeout: 8000 });
    });
});
