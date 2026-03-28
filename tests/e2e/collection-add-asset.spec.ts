import { test, expect } from '@playwright/test';

async function enterDemoMode(page: import('@playwright/test').Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Skip GuidedTour overlay (z-[250]) which blocks clicks on Collection.
        localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
    });
    await page.reload();
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 15_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}

test.describe('Collection — Add Asset', () => {
    test('adds a card from the modal (demo)', async ({ page }) => {
        await enterDemoMode(page);

        await page.goto('/#/collection');
        await expect(page).toHaveURL(/collection/);

        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({
            timeout: 20_000,
        });

        const uniquePlayer = `PW E2E ${Date.now()}`;
        await page.getByRole('button', { name: 'Add Asset' }).first().click();

        const dialog = page.getByRole('dialog', { name: /add new asset/i });
        await expect(dialog).toBeVisible({ timeout: 10_000 });

        await dialog.getByPlaceholder('e.g. Michael Jordan').fill(uniquePlayer);
        await dialog.getByPlaceholder('e.g. Panini').fill('E2E Manufacturer');
        await dialog.getByPlaceholder('e.g. Prizm').fill('E2E Set');

        await dialog.getByRole('button', { name: 'Add Asset' }).click();

        await expect(dialog).toBeHidden({ timeout: 10_000 });

        await page
            .getByPlaceholder('Query collection players, manufacturers, or sets...')
            .fill(uniquePlayer);

        await expect(
            page.getByRole('heading', { level: 3, name: uniquePlayer }).first(),
        ).toBeVisible({ timeout: 10_000 });
    });
});
