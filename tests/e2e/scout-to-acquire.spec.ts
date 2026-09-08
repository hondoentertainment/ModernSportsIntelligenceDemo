import { test, expect, type Page } from '@playwright/test';

/** Same seed shape as War Room / collection-add-asset smokes — local only, no cloud. */
const E2E_SEED_CARD = [
    {
        id: 'e2e-scout-acquire-seed',
        player: 'E2E Scout Seed',
        year: 2021,
        manufacturer: 'TestCo',
        cardNumber: '9',
        set: 'Chrome',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Near Mint',
        isGraded: false,
        purchasePrice: 40,
        purchaseDate: '2024-06-01',
        currentValue: 40,
        lastValuationDate: '2026-01-01',
        status: 'active' as const,
    },
];

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
    test('Collection holding → War Room scout desk → acquisition campaign persists', async ({ page }) => {
        test.setTimeout(90_000);
        await enterDemoMode(page);
        await page.evaluate((cards) => {
            localStorage.setItem('cardx_inventory', JSON.stringify(cards));
        }, E2E_SEED_CARD);

        await page.goto('/#/collection');
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({ timeout: 20_000 });
        await expect(page.getByText('E2E Scout Seed').first()).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole('heading', { name: /peer intent board/i })).toBeVisible();
        await expect(page.getByText(/not a P2P exchange/i).first()).toBeVisible();

        await page.goto('/#/');
        await page.getByRole('link', { name: /launch war room/i }).click();
        await expect(page).toHaveURL(/war-room/);
        await expect(page.getByRole('heading', { name: /Analyst War Room/i })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/Multi-agent output is AI-generated guidance/i)).toBeVisible();

        await page.getByRole('link', { name: /open acquisition desk/i }).click();
        await expect(page).toHaveURL(/autonomous-acquisition/);
        await expect(page.getByText(/simulated demo data/i)).toBeVisible({ timeout: 15_000 });

        const campaignPlayer = `MSI Scout Acquire ${Date.now()}`;
        await page.getByRole('button', { name: /new campaign/i }).click();
        await page.getByPlaceholder(/e\.g\. Mike Trout/i).fill(campaignPlayer);
        await page.getByPlaceholder('$').fill('250');
        await page.getByRole('button', { name: /launch campaign/i }).click();
        await expect(page.getByText(campaignPlayer).first()).toBeVisible();

        await page.reload();
        await expect(page.getByText(/simulated demo data/i)).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(campaignPlayer).first()).toBeVisible();
    });
});
