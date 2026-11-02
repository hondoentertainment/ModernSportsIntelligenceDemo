import fs from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

async function openNotes(page: Page): Promise<{ show: Locator; notes: Locator; pnl: Locator }> {
  await page.goto('/#/local-card-shows');
  await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });
  const show = page.locator('li').filter({ has: page.getByRole('heading', { name: 'NYC Monthly Card Meetup' }) }).first();
  await expect(show).toBeVisible();
  const plan = show.getByRole('button', { name: 'Plan trip, floor, and recap' });
  if (await plan.count()) await plan.click();
  await show.getByRole('tab', { name: 'Table notes' }).click();
  const notes = page.getByRole('tabpanel', { name: 'Table notes for NYC Monthly Card Meetup' });
  const pnl = show.getByRole('region', { name: 'Show profit and loss' });
  return { show, notes, pnl };
}

test.describe('Show profit and loss', () => {
  test('separates an unsold buy from a recorded sale on the recap and the week', async ({ page }) => {
    test.setTimeout(180_000);
    await enterDemoMode(page);
    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown;
      return Array.isArray(rows) ? rows.length : 0;
    }), { timeout: 20_000 }).toBeGreaterThan(100);

    const held = await page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as {
        id?: string;
        player?: string;
        status?: string;
        purchasePrice?: number;
      }[];
      const card = rows.find((row) => (
        row.status !== 'sold'
        && row.status !== 'consignment'
        && typeof row.purchasePrice === 'number'
        && row.purchasePrice > 0
        && Boolean(row.player)
        && Boolean(row.id)
      ));
      return card ? { id: String(card.id), player: String(card.player) } : null;
    });
    expect(held).not.toBeNull();
    const card = held!;

    const { show, notes, pnl } = await openNotes(page);
    await expect(pnl).toContainText(/no demo buy or recorded sale is on this profit and loss/i);

    await notes.getByLabel(/dealer at/i).fill('Rivera');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByLabel(/player at/i).fill('Pnl Buy');
    await notes.getByRole('textbox', { name: 'Offer at NYC Monthly Card Meetup' }).fill('22');
    await notes.getByLabel(/result at/i).selectOption('bought');
    await notes.getByRole('button', { name: 'Add table note' }).click();

    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/unsold inventory: 1 card, cost \$22/i);
    await expect(pnl.getByRole('list', { name: 'Unsold inventory', exact: true })).toContainText('Pnl Buy');
    await expect(pnl.getByRole('list', { name: 'Unsold inventory', exact: true })).toContainText(/unsold/i);
    await expect(pnl.getByRole('list', { name: 'Unsold inventory', exact: true })).toContainText(/short-term/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/inventory age: 1 short-term/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/sold inventory: none/i);

    await notes.getByLabel(/dealer at/i).fill('Rivera');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByRole('textbox', { name: 'Offer at NYC Monthly Card Meetup' }).fill('80');
    await notes.getByLabel(/card for the ask at/i).selectOption(card.id);
    await notes.getByLabel(/result at/i).selectOption('sold');
    await notes.getByRole('button', { name: 'Add table note' }).click();
    const exit = show.getByRole('region', { name: 'Show exit' });
    await exit.getByRole('button', { name: `Record ${card.player} sale` }).click();
    await expect(exit).toContainText(/sold in the book/i);

    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/bought 1 card for \$22/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/recorded sales: 1 card for \$80/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/card-show fee/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/realized/i);
    await expect(pnl.getByRole('list', { name: 'Unsold inventory', exact: true })).toContainText('Pnl Buy');
    await expect(pnl.getByRole('list', { name: 'Sold inventory', exact: true })).toContainText(card.player);
    await expect(pnl.getByRole('list', { name: 'Sold inventory', exact: true })).toContainText(/short-term|long-term/);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/recorded holding/i);
    await expect(pnl.getByLabel('Show profit and loss totals')).toContainText(/not a settlement and not a live tape/i);
    const downloadPromise = page.waitForEvent('download');
    await pnl.getByRole('button', { name: 'Download realized results' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('msi-show-realized.csv');
    const file = await download.path();
    expect(file).toBeTruthy();
    const csv = fs.readFileSync(file!, 'utf8');
    expect(csv).toContain('player,paid,cost,taken,fee,realized,acquired,sold,days_held,holding');
    expect(csv).toContain(card.player);

    await page.goto('/#/collection');
    const recap = page.getByRole('region', { name: 'Weekly collection recap' });
    const week = recap.getByLabel('Show profit and loss this week');
    await expect(week).toContainText(/show profit and loss this week: bought 1 card for \$22/i, { timeout: 20_000 });
    await expect(week).toContainText(/unsold inventory: 1 card, cost \$22/i);
    await expect(week).toContainText(/sold inventory: 1 card, taken \$80/i);
    await expect(week).toContainText(/card-show fee/i);
    await expect(week).toContainText(/realized/i);
    await expect(week).toContainText(/not a settlement and not a live tape/i);
    await expect(week).toContainText(/inventory age/i);
    await expect(week).toContainText(/recorded holding/i);
    const weekDownloadPromise = page.waitForEvent('download');
    await recap.getByRole('button', { name: /download this week's realized results/i }).click();
    const weekDownload = await weekDownloadPromise;
    expect(weekDownload.suggestedFilename()).toBe('msi-week-realized.csv');
  });
});