import { expect, test } from '@playwright/test';

async function enterDemoMode(page: import('@playwright/test').Page) {
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
    await expect(demoButton).toBeVisible({ timeout: 10000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 15000 });
}

test.describe('Release smoke coverage', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    test('core navigation routes render expected surfaces', async ({ page }) => {
        await page.goto('/#/collection');
        await expect(page.getByText(/asset repository|collection/i).first()).toBeVisible();

        await page.goto('/#/deep-search');
        await expect(page.getByText(/deep intelligence|search alpha/i).first()).toBeVisible();

        await page.goto('/#/billing');
        await expect(page.getByText(/subscription & billing|available plans/i).first()).toBeVisible();

        await page.goto('/#/settings');
        await expect(page.getByText(/subscription & billing|public profile|collector identity/i).first()).toBeVisible();
    });

    test('public portfolio route resolves cleanly', async ({ page }) => {
        await page.goto('/#/p/demo_user');
        await expect(
            page.getByText(/portfolio not found|portfolio value|@demo_user/i).first()
        ).toBeVisible({ timeout: 10000 });
    });
});
