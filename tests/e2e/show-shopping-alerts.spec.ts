import { expect, test, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

async function seedBook(page: Page): Promise<void> {
    await page.evaluate(() => {
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
        localStorage.setItem('cardx_inventory', JSON.stringify([
            card({ id: 'trout-raw', currentValue: 80 }),
            card({
                id: 'trout-slab',
                currentValue: 220,
                isGraded: true,
                gradingCompany: 'PSA',
                grade: '10',
            }),
        ]));
        localStorage.setItem('cardx_targets', JSON.stringify([
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
        ]));
    });
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
        await expect(shopping.getByText('Jayson Tatum')).toBeVisible();
        await expect(shopping.getByText('Collection gap', { exact: true })).toBeVisible();
        await expect(shopping.getByText(/target buy \$180/i)).toBeVisible();
        await expect(shopping.getByText('Mike Trout')).toBeVisible();
        await expect(shopping.getByText('Sell duplicate', { exact: true })).toBeVisible();
        await expect(shopping.getByText(/offer near \$80/i)).toBeVisible();
        await expect(shopping.getByText('Patrick Mahomes')).toHaveCount(0);
        await expect(page.getByText(/not a dealer inventory/i)).toBeVisible();

        await page.reload();
        await expect(page.getByRole('region', { name: 'Show alerts' }).getByText('Read', { exact: true })).toBeVisible({ timeout: 20_000 });
        await expect(page.getByRole('region', { name: /shopping list for nyc monthly card meetup/i }).getByText('Jayson Tatum')).toBeVisible();
    });
});
