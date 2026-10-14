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
    await expect(digest.getByText(/not a live tape/i)).toBeVisible();
    await expect(digest.getByText(/owner-held VAPID/i)).toBeVisible();
    await expect(digest.getByText('Jayson Tatum under target')).toBeVisible();
    await expect(digest.getByText(/60% under your \$200 target/i)).toBeVisible();
    await expect(digest.getByText('NYC Monthly Card Meetup')).toBeVisible();
    await digest.getByRole('link', { name: 'Open' }).first().click();
    await expect(page).toHaveURL(/collection|local-card-shows/);
  });
});
