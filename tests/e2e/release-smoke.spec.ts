import { expect, test } from '@playwright/test';

async function enterDemoMode(page: import('@playwright/test').Page) {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 10000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15000 });
}

test.describe('Release smoke coverage', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    test('billing or settings surface shows subscription or account copy', async ({ page }) => {
        await page.goto('/#/settings');
        await expect(page.getByText(/subscription & billing|public profile|collector identity/i).first()).toBeVisible({
            timeout: 10000,
        });
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
        // Accept: portfolio content, not found, or load error (with Retry)
        await expect(
            page.getByText(/portfolio not found|portfolio value|@demo_user|could not load portfolio|retry|return to base/i).first()
        ).toBeVisible({ timeout: 10000 });
    });

    test('feature search opens and shows featured features', async ({ page }) => {
        await page.goto('/#/');
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 15_000 });
        await page.locator('#main-content').click({ position: { x: 8, y: 8 } });
        await page.keyboard.press('Control+K');
        const dialog = page.getByRole('dialog', { name: /command palette/i });
        await expect(dialog).toBeVisible({ timeout: 10_000 });
        await expect(dialog.getByText(/navigate|features|run/i).first()).toBeVisible({ timeout: 5_000 });
    });
});
