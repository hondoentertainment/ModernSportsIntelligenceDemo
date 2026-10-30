import { expect, test, type Locator, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

async function openNotes(page: Page): Promise<{ show: Locator; notes: Locator; exit: Locator }> {
  await page.goto('/#/local-card-shows');
  await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });
  const show = page.locator('li').filter({ has: page.getByRole('heading', { name: 'NYC Monthly Card Meetup' }) }).first();
  await expect(show).toBeVisible();
  const plan = show.getByRole('button', { name: 'Plan trip, floor, and recap' });
  if (await plan.count()) await plan.click();
  await show.getByRole('tab', { name: 'Table notes' }).click();
  const notes = page.getByRole('tabpanel', { name: 'Table notes for NYC Monthly Card Meetup' });
  const exit = show.getByRole('region', { name: 'Show exit' });
  return { show, notes, exit };
}

test.describe('Show exit book', () => {
  test('records a table sale on the sell ladder and the weekly recap', async ({ page }) => {
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
      return card ? { id: String(card.id), player: String(card.player), cost: card.purchasePrice ?? 0 } : null;
    });
    expect(held).not.toBeNull();
    const card = held!;

    const { notes, exit } = await openNotes(page);
    await expect(exit).toContainText(/no sold table note is on this exit/i);

    await notes.getByLabel(/dealer at/i).fill('Rivera');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByRole('textbox', { name: 'Offer at NYC Monthly Card Meetup' }).fill('80');
    await notes.getByLabel(/card for the ask at/i).selectOption(card.id);
    await notes.getByLabel(/result at/i).selectOption('sold');
    await expect(notes.getByLabel('Sell ladder')).toContainText(/ask/i);
    await notes.getByRole('button', { name: 'Add table note' }).click();

    await expect(exit).toContainText(card.player);
    await expect(exit).toContainText(/still held/i);
    await expect(exit).toContainText(/not a settlement and not a live tape/i);
    await exit.getByRole('button', { name: `Record ${card.player} sale` }).click();
    await expect(exit).toContainText(/sold in the book/i);
    await expect(exit).toContainText(/realized/i);
    await expect(exit).toContainText(/card-show fee/i);

    await expect.poll(async () => page.evaluate((id) => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as { id?: string; status?: string; salePrice?: number }[];
      const row = rows.find((item) => item.id === id);
      return row?.status === 'sold' && row.salePrice === 80;
    }, card.id), { timeout: 20_000 }).toBe(true);

    await page.goto('/#/collection');
    const recap = page.getByRole('region', { name: 'Weekly collection recap' });
    await expect(recap.getByLabel('Show exit this week')).toContainText(/show exit this week: 1 card, taken \$80/i, {
      timeout: 20_000,
    });
    await expect(recap.getByLabel('Show exit this week')).toContainText(/realized/i);
    await expect(recap.getByLabel('Show exit this week')).toContainText(/not a settlement and not a live tape/i);
    await expect(page.getByLabel('Show exit on the sell planner')).toContainText(/show exit this week: 1 card, taken \$80/i);
  });
});
