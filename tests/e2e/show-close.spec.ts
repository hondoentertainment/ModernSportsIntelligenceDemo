import { expect, test, type Locator, type Page } from '@playwright/test';
import { enterDemoMode, restoreLocalKeysOnNextLoad } from '../helpers/e2eAuth';

async function seedTrip(page: Page): Promise<void> {
  const entries = {
    cardx_targets: JSON.stringify([{
      id: 'showclose',
      player: 'Showclose Player',
      cardDescription: '2024 Topps #77',
      priority: 'High',
      targetPrice: 80,
      currentMarketPrice: 80,
      sport: 'Baseball',
      league: 'MLB',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]),
    msi_show_trip_cash_v1: JSON.stringify({ 'nyc-monthly': 10 }),
  };
  await page.evaluate((next) => {
    for (const [key, value] of Object.entries(next)) localStorage.setItem(key, value);
  }, entries);
  await restoreLocalKeysOnNextLoad(page, entries);
  await page.reload();
}

async function note(panel: Locator, input: {
  dealer: string;
  table: string;
  ask: string;
  offer: string;
  result: 'bought' | 'passed' | 'open';
}): Promise<void> {
  await panel.getByLabel(/dealer at/i).fill(input.dealer);
  await panel.getByLabel(/table at/i).fill(input.table);
  await panel.getByLabel(/player at/i).fill('Showclose Player');
  await panel.getByLabel(/card line at/i).fill('2023 Bowman #1');
  await panel.getByLabel(/ask at/i).fill(input.ask);
  await panel.getByLabel(/offer at/i).fill(input.offer);
  await panel.getByLabel(/result at/i).selectOption(input.result);
  await panel.getByRole('button', { name: 'Add table note' }).click();
}

test.describe('Show close loop', () => {
  test('fits cash, compares asks, files a buy, and revisits a cheap pass', async ({ page }) => {
    test.setTimeout(180_000);
    await enterDemoMode(page);
    await seedTrip(page);
    await page.goto('/#/local-card-shows');
    await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });

    const show = page.locator('li').filter({ has: page.getByRole('heading', { name: 'NYC Monthly Card Meetup' }) }).first();
    await expect(show).toBeVisible();
    const list = show.getByRole('region', { name: 'Shopping list for NYC Monthly Card Meetup' });
    const buy = list.locator('li').filter({ hasText: 'Showclose Player' }).first();
    await expect(buy).toContainText('Over the cash for this trip.');
    await expect(list.getByLabel('Cash fit')).toContainText(/saved for this trip/i);
    await expect(list.getByLabel('Cash fit')).toContainText(/not a fare quote/i);

    const plan = show.getByRole('button', { name: 'Plan trip, floor, and recap' });
    if (await plan.count()) await plan.click();
    await show.getByRole('tab', { name: 'Table notes' }).click();
    const notes = page.getByRole('tabpanel', { name: 'Table notes for NYC Monthly Card Meetup' });
    await expect(notes.getByText(/not a dealer quote/i)).toBeVisible();
    await note(notes, { dealer: 'Ace', table: '2', ask: '40', offer: '0', result: 'passed' });
    await note(notes, { dealer: 'Lane', table: '8', ask: '70', offer: '0', result: 'open' });
    await note(notes, { dealer: 'Rivera', table: '12', ask: '30', offer: '25', result: 'bought' });
    await expect(notes.getByLabel('Cheapest asks')).toContainText('Lowest $30.00 at Rivera table 12');
    await expect(notes.getByLabel('Cheapest asks')).toContainText('Not a dealer quote');

    await page.goto('/#/collection');
    const recap = page.getByRole('region', { name: 'Weekly collection recap' });
    await expect(recap).toContainText('1 bought note not in the book: Showclose Player', { timeout: 20_000 });
    await expect(recap).toContainText(/not a settlement/i);

    await page.goto('/#/alerts');
    const digest = page.getByRole('region', { name: 'Watchlist and show alert digest' });
    await expect(digest.getByText('Open at NYC Monthly Card Meetup')).toBeVisible({ timeout: 20_000 });
    await expect(digest.getByText('Revisit Showclose Player')).toBeVisible();
    await expect(digest.getByText(/not a live tape/i).first()).toBeVisible();
    await digest.getByRole('button', { name: 'Watch Showclose Player' }).click();
    await expect(digest.getByText('On the watchlist.')).toBeVisible();

    await page.goto('/#/local-card-shows');
    const again = page.locator('li').filter({ has: page.getByRole('heading', { name: 'NYC Monthly Card Meetup' }) }).first();
    const planAgain = again.getByRole('button', { name: 'Plan trip, floor, and recap' });
    if (await planAgain.count()) await planAgain.click();
    await again.getByRole('tab', { name: 'Table notes' }).click();
    const notesAgain = page.getByRole('tabpanel', { name: 'Table notes for NYC Monthly Card Meetup' });
    await notesAgain.getByRole('button', { name: 'Add Showclose Player to collection' }).click();
    await expect(notesAgain.getByText(/in the collection · cost basis \$25\.00/i)).toBeVisible();

    await page.goto('/#/collection');
    await expect(page.getByRole('region', { name: 'Weekly collection recap' })).toContainText(
      'No bought table note is waiting on the book.',
      { timeout: 20_000 },
    );
  });
});