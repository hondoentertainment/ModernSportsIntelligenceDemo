import { test, expect, type Page } from '@playwright/test';

async function enterDemoMode(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
    });
    await page.reload();
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 15_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}

test.describe('Scout-to-Acquire happy path (demo smoke)', () => {
    test('Collection add-asset → War Room scout desk → acquisition campaign persists', async ({ page }) => {
        test.setTimeout(120_000);
        await enterDemoMode(page);

        await page.goto('/#/collection');
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole('heading', { name: /peer intent board/i })).toBeVisible();
        await expect(page.getByText(/not a P2P exchange/i).first()).toBeVisible();

        const uniquePlayer = `PW Scout ${Date.now()}`;
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

        await page.goto('/#/');
        await expect(page.getByRole('link', { name: /launch war room/i })).toBeVisible({ timeout: 15_000 });
        await page.getByRole('link', { name: /launch war room/i }).click();
        await expect(page).toHaveURL(/#\/war-room/);
        await expect(page.getByRole('heading', { name: 'Analyst War Room', level: 1 })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/Multi-agent output is AI-generated guidance/i)).toBeVisible();

        await page.getByRole('link', { name: /open acquisition desk/i }).click();
        await expect(page).toHaveURL(/autonomous-acquisition/);
        await expect(page.getByText(/simulated demo data/i)).toBeVisible({ timeout: 15_000 });

        const campaignPlayer = `MSI Scout Acquire ${Date.now()}`;
        await page.getByRole('button', { name: /new campaign/i }).click();
        await page.getByPlaceholder(/e\.g\. Mike Trout/i).fill(campaignPlayer);
        await page.getByPlaceholder('$').fill('150');
        await page.getByRole('button', { name: /launch campaign/i }).click();
        await expect(page.getByText(campaignPlayer).first()).toBeVisible();

        await page.reload();
        await expect(page.getByText(/simulated demo data/i)).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(campaignPlayer).first()).toBeVisible();
    });
});
