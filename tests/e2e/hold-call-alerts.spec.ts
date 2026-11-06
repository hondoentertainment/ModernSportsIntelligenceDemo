import { expect, test } from '@playwright/test';
import { enterDemoMode, restoreLocalKeysOnNextLoad } from '../helpers/e2eAuth';

test.describe('Hold-call alerts', () => {
  test('lists hold, clear, and under on the watchlist and the alert digest', async ({ page }) => {
    test.setTimeout(180_000);
    await enterDemoMode(page);
    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown;
      return Array.isArray(rows) ? rows.length : 0;
    }), { timeout: 20_000 }).toBeGreaterThan(100);
    const seeded = await page.evaluate(() => {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const nearAt = new Date(now - 330 * day).toISOString();
      const notes = [
        {
          id: 'near-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '1',
          askUsd: 20,
          offerUsd: 20,
          result: 'bought',
          note: '',
          player: 'Near Card',
          savedAt: nearAt,
        },
        {
          id: 'clear-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '2',
          askUsd: 12,
          offerUsd: 12,
          result: 'bought',
          note: '',
          player: 'Clear Card',
          savedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'under-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '3',
          askUsd: 50,
          offerUsd: 50,
          result: 'bought',
          note: '',
          player: 'Under Card',
          savedAt: '2024-06-01T00:00:00.000Z',
        },
        {
          id: 'far-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '4',
          askUsd: 10,
          offerUsd: 10,
          result: 'bought',
          note: '',
          player: 'Far Card',
          savedAt: new Date(now - 20 * day).toISOString(),
        },
        {
          id: 'loose-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '5',
          askUsd: 9,
          offerUsd: 9,
          result: 'bought',
          note: '',
          player: 'Loose Card',
          savedAt: nearAt,
        },
        {
          id: 'bare-buy',
          showId: 'nyc-monthly',
          dealer: 'Ada',
          table: '6',
          askUsd: 8,
          offerUsd: 8,
          result: 'bought',
          note: '',
          player: 'No Mark Card',
          savedAt: '2024-06-01T00:00:00.000Z',
        },
      ];
      const inventory = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown[];
      inventory.push(
        {
          id: 'floor:near-buy',
          player: 'Near Card',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Chrome',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Raw',
          isGraded: false,
          purchasePrice: 20,
          purchaseDate: nearAt,
          currentValue: 80,
          status: 'active',
          taxBasis: 20,
        },
        {
          id: 'floor:clear-buy',
          player: 'Clear Card',
          year: 2023,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Chrome',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Raw',
          isGraded: false,
          purchasePrice: 12,
          purchaseDate: '2024-01-01',
          currentValue: 80,
          status: 'active',
          taxBasis: 12,
        },
        {
          id: 'floor:under-buy',
          player: 'Under Card',
          year: 2022,
          manufacturer: 'Topps',
          cardNumber: '3',
          set: 'Chrome',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Raw',
          isGraded: false,
          purchasePrice: 50,
          insuranceFees: 10,
          purchaseDate: '2024-01-01',
          currentValue: 62,
          status: 'active',
          taxBasis: 50,
        },
        {
          id: 'floor:far-buy',
          player: 'Far Card',
          year: 2025,
          manufacturer: 'Topps',
          cardNumber: '4',
          set: 'Chrome',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Raw',
          isGraded: false,
          purchasePrice: 10,
          purchaseDate: new Date(now - 20 * day).toISOString(),
          currentValue: 100,
          status: 'active',
          taxBasis: 10,
        },
        {
          id: 'floor:bare-buy',
          player: 'No Mark Card',
          year: 2020,
          manufacturer: 'Topps',
          cardNumber: '5',
          set: 'Chrome',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Raw',
          isGraded: false,
          purchasePrice: 8,
          purchaseDate: '2024-01-01',
          status: 'active',
          taxBasis: 8,
        },
      );
      const book = JSON.stringify(inventory);
      const haggle = JSON.stringify(notes);
      localStorage.setItem('cardx_inventory', book);
      localStorage.setItem('msi_show_haggle_v1', haggle);
      return { cardx_inventory: book, msi_show_haggle_v1: haggle };
    });
    await restoreLocalKeysOnNextLoad(page, seeded);
    await page.reload();

    await page.goto('/#/favorites');
    const watch = page.getByRole('region', { name: 'Hold call alerts' });
    await expect(watch).toBeVisible({ timeout: 20_000 });
    await expect(watch.getByText(/not a tax determination/i).first()).toBeVisible();
    await expect(watch.getByText('Near Card · hold')).toBeVisible();
    await expect(watch.getByText(/days to long-term/)).toBeVisible();
    await expect(watch.getByText('Clear Card · clear')).toBeVisible();
    await expect(watch.getByText(/crossed into long-term/i)).toBeVisible();
    await expect(watch.getByText('Under Card · under')).toBeVisible();
    await expect(watch.getByText(/no longer clears the ~4% card-show fee/i)).toBeVisible();
    await expect(watch.getByText(/Far Card/)).toHaveCount(0);
    await expect(watch.getByText(/Loose Card/)).toHaveCount(0);
    await expect(watch.getByText(/No Mark Card/)).toHaveCount(0);

    await page.goto('/#/alerts');
    const digest = page.getByRole('region', { name: 'Watchlist and show alert digest' });
    await expect(digest).toBeVisible({ timeout: 20_000 });
    const alerts = digest.getByRole('region', { name: 'Hold call alerts' });
    await expect(alerts.getByText('Near Card · hold')).toBeVisible();
    await expect(alerts.getByText('Clear Card · clear')).toBeVisible();
    await expect(alerts.getByText('Under Card · under')).toBeVisible();
    await alerts.getByRole('link', { name: 'Open Near Card' }).click();
    await expect(page).toHaveURL(/audit-dossier\?cardId=floor%3Anear-buy/);
  });
});
