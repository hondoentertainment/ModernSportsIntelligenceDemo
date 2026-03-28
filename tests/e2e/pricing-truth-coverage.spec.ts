import { expect, test } from '@playwright/test';

async function enterDemoMode(page: import('@playwright/test').Page): Promise<void> {
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

test.describe('Pricing truth coverage guardrails', () => {
  test('shows degraded watchlist banner and no duplicate degraded toast', async ({ page }) => {
    await enterDemoMode(page);

    await page.evaluate(() => {
      localStorage.removeItem('msi_valuation_coverage_health_v1:watchlist');
    });

    await page.goto('/#/favorites');
    await page.getByRole('button', { name: /add target/i }).first().click();
    await page.getByPlaceholder('e.g. Shohei Ohtani').fill(`Coverage Probe ${Date.now()}`);
    await page.getByPlaceholder('e.g. 2018 Bowman Chrome Auto PSA 10').fill('Coverage Check Card');
    await page.getByPlaceholder('0.00').fill('120');
    await page.getByRole('button', { name: /^Add Target$/ }).last().click();

    await expect(page.getByText(/watchlist pricing coverage below SLA/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/watchlist pricing degraded:/i)).toBeVisible({ timeout: 8_000 });

    await expect(page.getByText(/watchlist pricing degraded:/i)).toHaveCount(1);
  });
});
