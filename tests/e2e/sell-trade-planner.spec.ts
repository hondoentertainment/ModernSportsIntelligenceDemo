import { test, expect } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

test.describe('Sell and trade-in planner', () => {
  test('collection desk shows the planner and a 44px filter on a phone', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/collection');
    const planner = page.getByRole('region', { name: /sell and trade-in planner/i });
    await expect(planner).toBeVisible({ timeout: 20_000 });
    await expect(planner.getByText(/not a Sports Card Investor or Market Movers/i)).toBeVisible();
    await expect(planner.getByText(/live market movers parity/i)).toHaveCount(0);

    const sellFilter = planner.getByRole('radio', { name: 'Sell' });
    await expect(sellFilter).toBeVisible();
    const box = await sellFilter.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

    await page.getByRole('button', { name: /plan sells and trade-ins/i }).click();
    await expect(planner).toBeInViewport();
  });

  test('local card shows keeps a 44px city field and location control', async ({ page }) => {
    await enterDemoMode(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/local-card-shows');
    const city = page.getByLabel(/city or venue/i);
    await expect(city).toBeVisible({ timeout: 20_000 });
    const cityBox = await city.boundingBox();
    expect(cityBox?.height ?? 0).toBeGreaterThanOrEqual(44);

    const location = page.getByRole('button', { name: /use my location/i });
    const locationBox = await location.boundingBox();
    expect(locationBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expect(page.getByText(/not a live promoter feed/i)).toBeVisible();
  });
});
