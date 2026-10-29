import { expect, test, type Locator, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

async function openNotes(page: Page): Promise<{ show: Locator; notes: Locator; haul: Locator }> {
  await page.goto('/#/local-card-shows');
  await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });
  const show = page.locator('li').filter({ has: page.getByRole('heading', { name: 'NYC Monthly Card Meetup' }) }).first();
  await expect(show).toBeVisible();
  const plan = show.getByRole('button', { name: 'Plan trip, floor, and recap' });
  if (await plan.count()) await plan.click();
  await show.getByRole('tab', { name: 'Table notes' }).click();
  const notes = page.getByRole('tabpanel', { name: 'Table notes for NYC Monthly Card Meetup' });
  const haul = show.getByRole('region', { name: 'Show haul' });
  return { show, notes, haul };
}

test.describe('Show haul book', () => {
  test('files a table buy, shelves it, and reads it on the weekly recap', async ({ page }) => {
    test.setTimeout(180_000);
    await enterDemoMode(page);
    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown;
      return Array.isArray(rows) ? rows.length : 0;
    }), { timeout: 20_000 }).toBeGreaterThan(100);
    const { notes, haul } = await openNotes(page);
    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as unknown;
      return Array.isArray(rows) ? rows.length : 0;
    }), { timeout: 20_000 }).toBeGreaterThan(100);
    await expect(haul).toContainText(/no bought table note is on this haul/i);
    await expect(haul.getByRole('button', { name: 'Put unplaced haul cards in the binder' })).toBeDisabled();

    await notes.getByLabel(/dealer at/i).fill('Rivera');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByLabel(/player at/i).fill('Haul Player');
    await notes.getByLabel(/card line at/i).fill('2024 Topps #7');
    await notes.getByRole('textbox', { name: 'Ask at NYC Monthly Card Meetup' }).fill('30');
    await notes.getByRole('textbox', { name: 'Offer at NYC Monthly Card Meetup' }).fill('22');
    await notes.getByLabel(/result at/i).selectOption('bought');
    await notes.getByRole('button', { name: 'Add table note' }).click();

    await expect(haul).toContainText('Haul Player');
    await expect(haul).toContainText(/still off the book/i);
    await expect(haul).toContainText(/no ladder/i);
    await expect(haul).toContainText(/not a settlement and not a live tape/i);

    await notes.getByRole('button', { name: 'Add Haul Player to collection' }).click();
    await expect(notes.getByText(/in the collection · cost basis \$22\.00/i)).toBeVisible();
    await expect(haul).toContainText(/in the book at \$22/i);
    await expect(haul).toContainText(/no place/i);

    await haul.getByRole('button', { name: 'Put unplaced haul cards in the binder' }).click();
    await expect(haul).toContainText('in the book at $22 · binder');
    await expect(haul.getByRole('button', { name: 'Put unplaced haul cards in the binder' })).toBeDisabled();

    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as { player?: string }[];
      return Array.isArray(rows) && rows.length > 100 && rows.some((row) => row.player === 'Haul Player');
    }), { timeout: 20_000 }).toBe(true);
    await page.goto('/#/collection');
    const recap = page.getByRole('region', { name: 'Weekly collection recap' });
    await expect(recap.getByLabel('Show haul this week')).toContainText(/show haul in the book this week: 1 card, paid \$22/i, {
      timeout: 20_000,
    });
    await expect(recap.getByLabel('Show haul this week')).toContainText(/every filed card has a binder, box, or slab/i);
    await expect(recap.getByLabel('Show haul this week')).toContainText(/not a settlement and not a live tape/i);
  });
});
