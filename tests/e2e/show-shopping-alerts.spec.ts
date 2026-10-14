import { expect, test, type Page } from '@playwright/test';
import { enterDemoMode, restoreLocalKeysOnNextLoad } from '../helpers/e2eAuth';

async function seedBook(page: Page): Promise<void> {
    await expect.poll(async () => page.evaluate(() => {
        try {
            const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown;
            return Array.isArray(rows) ? rows.length : 0;
        } catch {
            return 0;
        }
    }), { timeout: 20_000 }).toBeGreaterThan(100);

    const seeded = await page.evaluate(() => {
        const card = (overrides: Record<string, unknown>) => ({
            id: 'card',
            player: 'Mike Trout',
            year: 2011,
            manufacturer: 'Topps',
            cardNumber: 'US175',
            set: 'Update',
            sport: 'Baseball',
            league: 'MLB',
            isAutographed: false,
            condition: 'Near Mint',
            isGraded: false,
            purchasePrice: 40,
            purchaseDate: '2024-01-01',
            currentValue: 80,
            status: 'active',
            ...overrides,
        });
        // Dashboard replaces a short book with the demo set. Pad past that
        // length with football rows this baseball/basketball show does not list.
        const existing = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown[];
        const fillerCount = Math.max(130, Array.isArray(existing) ? existing.length : 0);
        const fillers = Array.from({ length: fillerCount }, (_, index) => card({
            id: `pad-${index}`,
            player: `Pad ${index}`,
            year: 1999,
            manufacturer: 'Pad',
            cardNumber: String(index),
            set: 'Pad',
            sport: 'Football',
            league: 'NFL',
            currentValue: 1,
            purchasePrice: 1,
        }));
        const inventory = JSON.stringify([
            card({ id: 'trout-raw', currentValue: 80 }),
            card({
                id: 'trout-slab',
                currentValue: 220,
                isGraded: true,
                gradingCompany: 'PSA',
                grade: '10',
            }),
            ...fillers,
        ]);
        const targets = JSON.stringify([
            {
                id: 'tatum-gap',
                player: 'Jayson Tatum',
                cardDescription: '2024 Prizm Silver',
                priority: 'High',
                targetPrice: 200,
                currentMarketPrice: 180,
                sport: 'Basketball',
                league: 'NBA',
                status: 'active',
                createdAt: '2026-01-01T00:00:00.000Z',
            },
            {
                id: 'mahomes',
                player: 'Patrick Mahomes',
                cardDescription: '2020 Prizm',
                priority: 'High',
                targetPrice: 300,
                currentMarketPrice: 250,
                sport: 'Football',
                league: 'NFL',
                status: 'active',
                createdAt: '2026-01-01T00:00:00.000Z',
            },
        ]);
        localStorage.setItem('cardx_inventory', inventory);
        localStorage.setItem('cardx_targets', targets);
        return { cardx_inventory: inventory, cardx_targets: targets };
    });
    await restoreLocalKeysOnNextLoad(page, seeded);
}

test.describe('Show alerts and shopping list', () => {
    test('home radius records an in-app alert and the show lists watchlist buys plus duplicate sells', async ({ page }) => {
        test.setTimeout(120_000);
        await enterDemoMode(page);
        await seedBook(page);
        await page.reload();
        await expect(page).toHaveURL(/#\/?$/, { timeout: 20_000 });

        await page.goto('/#/local-card-shows');
        await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });
        const alerts = page.getByRole('region', { name: 'Show alerts' });
        await expect(alerts.getByText(/not a promoter feed/i)).toBeVisible();
        await expect(alerts.getByText(/owner-held VAPID/i).first()).toBeVisible();

        await alerts.getByLabel('Show alert home').selectOption('New York, NY');
        await alerts.getByLabel('Alert radius (miles)').fill('40');
        await alerts.getByLabel('Days before the show').fill('366');
        await alerts.getByRole('checkbox', { name: 'Enable show alerts' }).check();

        const markRead = alerts.getByRole('button', { name: /mark nyc monthly card meetup alert read/i });
        await expect(markRead).toBeVisible({ timeout: 10_000 });
        await markRead.click();
        await expect(alerts.getByText('Read', { exact: true })).toBeVisible();

        const shopping = page.getByRole('region', { name: /shopping list for nyc monthly card meetup/i });
        await expect(shopping.locator('p').filter({ hasText: /Jayson Tatum\s+Collection gap/ })).toBeVisible();
        await expect(shopping.getByText('Collection gap', { exact: true })).toBeVisible();
        await expect(shopping.getByText(/target buy \$180/i)).toBeVisible();
        await expect(shopping.getByText('Mike Trout')).toBeVisible();
        await expect(shopping.getByText('Sell duplicate', { exact: true })).toBeVisible();
        await expect(shopping.getByText(/offer near \$80/i)).toBeVisible();
        await expect(shopping.getByText('Patrick Mahomes')).toHaveCount(0);
        await expect(page.getByText(/not a dealer inventory/i)).toBeVisible();

        await page.reload();
        await expect(page.getByRole('region', { name: 'Show alerts' }).getByText('Read', { exact: true })).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole('region', { name: /shopping list for nyc monthly card meetup/i }).locator('p').filter({ hasText: /Jayson Tatum\s+Collection gap/ })).toBeVisible();
    });

    test('files a shopping-list buy into the collection with the paid price as cost basis', async ({ page }) => {
        test.setTimeout(120_000);
        await enterDemoMode(page);
        await seedBook(page);
        await page.reload();
        await page.goto('/#/local-card-shows');
        const shopping = page.getByRole('region', { name: /shopping list for nyc monthly card meetup/i });
        await expect(shopping.getByLabel('Paid price for Jayson Tatum')).toBeVisible({ timeout: 20_000 });
        await shopping.getByLabel('Paid price for Jayson Tatum').fill('150');
        await shopping.getByRole('button', { name: 'Add Jayson Tatum to collection' }).click();
        await expect(shopping.getByText(/Jayson Tatum in the collection · cost basis \$150\.00/i)).toBeVisible();

        const show = page.getByRole('listitem').filter({ has: shopping });
        await show.getByRole('button', { name: /plan trip, floor, and recap/i }).click();
        await show.getByRole('tab', { name: 'Recap' }).click();
        const recap = show.getByRole('region', { name: /shopping list recap for nyc monthly card meetup/i });
        await expect(recap.getByText(/Jayson Tatum in the collection · cost basis \$150\.00/i)).toBeVisible();
        await expect(recap.getByText(/not a marketplace fill/i)).toBeVisible();

        await expect.poll(async () => page.evaluate(() => {
            const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as Array<{ player?: string; purchasePrice?: number; taxBasis?: number }>;
            const filed = rows.find((row) => row.player === 'Jayson Tatum');
            return filed ? `${filed.purchasePrice}:${filed.taxBasis}` : '';
        })).toBe('150:150');

        await page.goto('/#/collection');
        await expect(page.getByRole('heading', { name: /asset repository/i })).toBeVisible({ timeout: 20_000 });
        await page.getByPlaceholder(/query collection/i).fill('Jayson Tatum');
        await expect(page.getByText('Jayson Tatum').first()).toBeVisible();
    });
});
