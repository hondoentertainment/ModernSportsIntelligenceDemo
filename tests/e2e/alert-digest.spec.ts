import { expect, test } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

test.describe('Watchlist and show alert digest', () => {
  test('lists a local price drop and a nearby seeded show', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await page.evaluate(() => {
      localStorage.setItem('cardx_targets', JSON.stringify([{
        id: 'tatum-gap',
        player: 'Jayson Tatum',
        cardDescription: '2024 Prizm Silver',
        priority: 'High',
        targetPrice: 200,
        currentMarketPrice: 80,
        sport: 'Basketball',
        league: 'NBA',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      }]));
      localStorage.setItem('msi_show_alert_prefs_v1', JSON.stringify({
        enabled: true,
        home: { label: 'New York, NY', lat: 40.7571, lng: -74.0023 },
        radiusMiles: 40,
        leadDays: 366,
      }));
    });
    await page.reload();
    await page.goto('/#/alerts');
    const digest = page.getByRole('region', { name: 'Watchlist and show alert digest' });
    await expect(digest).toBeVisible({ timeout: 20_000 });
    await expect(digest.getByText(/not a live tape/i).first()).toBeVisible();
    await expect(digest.getByText(/not a dealer quote/i)).toBeVisible();
    await expect(digest.getByText(/Open \$/)).toBeVisible();
    await expect(digest.getByText(/owner-held VAPID/i)).toBeVisible();
    await expect(digest.getByText('Jayson Tatum under target')).toBeVisible();
    await expect(digest.getByText(/60% under your \$200 target/i)).toBeVisible();
    await expect(digest.getByText('NYC Monthly Card Meetup')).toBeVisible();
    await digest.getByRole('link', { name: 'Open' }).first().click();
    await expect(page).toHaveURL(/collection|local-card-shows/);
  });

  test('alerts a graded watchlist target on that grade band', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await page.evaluate(() => {
      localStorage.setItem('cardx_targets', JSON.stringify([{
        id: 'psa-judge',
        player: 'Aaron Judge',
        cardDescription: '2017 Update PSA 10',
        priority: 'High',
        targetPrice: 300,
        currentMarketPrice: 40,
        sport: 'Baseball',
        league: 'MLB',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        salesData: [
          { title: 'raw', price: 40, condition: 'raw', soldAt: '2026-09-01' },
          { title: 'raw 2', price: 60, condition: 'raw', soldAt: '2026-09-02' },
          { title: 'slab', price: 200, condition: 'PSA 10', soldAt: '2026-09-03' },
          { title: 'slab 2', price: 240, condition: 'PSA 10', soldAt: '2026-09-04' },
        ],
      }]));
    });
    await page.reload();
    await page.goto('/#/alerts');
    const digest = page.getByRole('region', { name: 'Watchlist and show alert digest' });
    await expect(digest.getByText('Aaron Judge under target')).toBeVisible({ timeout: 20_000 });
    await expect(digest.getByText(/PSA 10 sold comps median \$220 is 26.7% under your \$300 target/)).toBeVisible();
    await expect(digest.getByText(/does not stand in for a missing grade/i)).toBeVisible();
    await expect(digest.getByText(/\$40 is /)).toHaveCount(0);
  });
});
