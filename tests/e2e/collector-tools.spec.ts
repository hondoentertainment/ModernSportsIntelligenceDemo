import { expect, test, type Page } from '@playwright/test';
import { enterDemoMode, restoreLocalKeysOnNextLoad } from '../helpers/e2eAuth';
import fs from 'node:fs';

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
      player: 'Aaron Judge',
      year: 2024,
      manufacturer: 'Topps',
      cardNumber: '1',
      set: 'Series 1',
      sport: 'Baseball',
      league: 'MLB',
      isAutographed: false,
      condition: 'Near Mint',
      isGraded: false,
      purchasePrice: 40,
      purchaseDate: '2024-06-01',
      currentValue: 8,
      status: 'active',
      ...overrides,
    });
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
      purchasePrice: 1,
      currentValue: 1,
      purchaseDate: '1999-01-01',
    }));
    const inventory = JSON.stringify([
      card({ id: 'judge', player: 'Aaron Judge', currentValue: 100, purchasePrice: 40 }),
      ...fillers,
    ]);
    const targets = JSON.stringify([{
      id: 'tatum',
      player: 'Jayson Tatum',
      cardDescription: '2024 Prizm',
      priority: 'High',
      targetPrice: 200,
      sport: 'Basketball',
      league: 'NBA',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]);
    localStorage.setItem('cardx_inventory', inventory);
    localStorage.setItem('cardx_targets', targets);
    return { cardx_inventory: inventory, cardx_targets: targets };
  });
  await restoreLocalKeysOnNextLoad(page, seeded);
}

test.describe('Collector desk tools', () => {
  test('saves a dealer table note on the show trip', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await page.goto('/#/local-card-shows');
    await expect(page.getByRole('heading', { name: /local card shows/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('tab', { name: 'Table notes' }).click();
    const notes = page.getByRole('tabpanel', { name: /table notes for/i });
    await expect(notes.getByText(/not a dealer quote/i)).toBeVisible();
    await notes.getByLabel(/dealer at/i).fill('Rivera Cards');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByLabel(/ask at/i).fill('80');
    await notes.getByLabel(/offer at/i).fill('65');
    await notes.getByLabel(/result at/i).selectOption('bought');
    await notes.getByLabel(/note at/i).fill('Moved off 80');
    await notes.getByRole('button', { name: 'Add table note' }).click();
    await expect(notes.getByText('Rivera Cards · table 12')).toBeVisible();
    await expect(notes.getByText('Ask $80.00 · offer $65.00 · bought')).toBeVisible();

    await page.reload();
    await page.getByRole('tab', { name: 'Table notes' }).click();
    await expect(page.getByRole('tabpanel', { name: /table notes for/i }).getByText('Rivera Cards · table 12')).toBeVisible({ timeout: 20_000 });
  });

  test('charts the book, names a grading submit, and round-trips CSV', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await seedBook(page);
    await page.reload();
    await page.goto('/#/collection');
    const chart = page.getByRole('region', { name: 'Portfolio performance' });
    await expect(chart).toBeVisible({ timeout: 20_000 });
    await expect(chart.getByText(/not a live price history/i)).toBeVisible();
    await expect(chart.getByRole('img', { name: /demo portfolio value/i })).toBeVisible();
    await expect(chart.getByText(/\$\d/)).toBeVisible();

    const grading = page.getByRole('region', { name: 'Grading submit decision' });
    await expect(grading.getByText(/not a psa or bgs quote/i)).toBeVisible();
    const judge = grading.getByRole('listitem', { name: 'Aaron Judge' });
    await expect(judge.getByText(/Submit PSA Economy/)).toBeVisible();
    await expect(judge.getByText(/Demo pop 1200/)).toBeVisible();
    await expect(judge.getByText(/BGS Standard/)).toBeVisible();

    const csv = page.getByRole('region', { name: 'Collection CSV' });
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      csv.getByRole('button', { name: 'Export collection CSV' }).click(),
    ]);
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
    const text = fs.readFileSync(filePath as string, 'utf8');
    const lines = text.split('\n').map((line) => {
      if (!line.startsWith('judge,')) return line;
      const cells = line.split(',');
      cells[10] = '99';
      return cells.join(',');
    });
    const imported = filePath + '.edited.csv';
    fs.writeFileSync(imported, lines.join('\n'));
    await csv.getByLabel('Import collection CSV').setInputFiles(imported);
    await expect(csv.getByText(/Applied \d+ rows/)).toBeVisible();
    await expect.poll(async () => page.evaluate(() => {
      const rows = JSON.parse(localStorage.getItem('cardx_inventory') || '[]') as Array<{ id?: string; currentValue?: number }>;
      return rows.find((row) => row.id === 'judge')?.currentValue ?? 0;
    })).toBe(99);

    const desk = page.getByRole('region', { name: 'Weekly collection recap' });
    await expect(desk).toContainText(/buys/i);
    await expect(desk).toContainText(/sells/i);
    const comps = page.getByRole('region', { name: 'Comps snapshot' });
    await comps.getByLabel('Comps snapshot card').selectOption('judge');
    await expect(comps.getByRole('img', { name: 'Demo sales sparkline' })).toBeVisible();
    await expect(comps).toContainText(/median/i);
    await expect(comps.getByLabel('Sell ladder')).toContainText(/Ask \$/);
    await expect(comps.getByLabel('Ladder score')).toContainText(/Local mark/);
    await expect(comps.getByLabel('Ladder score')).toContainText(/demo sales/);
    await expect(comps).toContainText(/not a dealer bid/i);
    await expect(desk).toContainText(/no dated table note sits on a sale range this week/i);
    const trade = page.getByRole('region', { name: 'Trade value balancer' });
    await trade.getByLabel('Trade card').selectOption('pad-0');
    await trade.getByRole('button', { name: 'Add to give' }).click();
    await trade.getByLabel('Trade card').selectOption('judge');
    await trade.getByRole('button', { name: 'Add to receive' }).click();
    await expect(trade.getByLabel('Trade call')).toContainText('you ahead');
    const place = page.getByRole('region', { name: 'Card location' });
    await place.getByLabel('Location card').selectOption('judge');
    await place.getByLabel('Location place').selectOption('slab');
    await place.getByRole('button', { name: 'Save location' }).click();
    await place.getByRole('button', { name: 'slab' }).click();
    await expect(place).toContainText('Aaron Judge · slab');

    await page.evaluate(() => localStorage.setItem('cardx_inventory', '[]'));
    await page.reload();
    await expect(page.getByLabel('Import collection CSV')).toBeAttached();
  });

  test('checks off a show-day line and keeps the budget on this browser', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await seedBook(page);
    await page.reload();
    await page.goto('/#/local-card-shows');
    const line = page.getByRole('checkbox', { name: 'buy Jayson Tatum' }).first();
    await expect(line).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/budget left/i).first()).toBeVisible();
    await expect(page.getByText(/offline checklist/i).first()).toBeVisible();
    await line.check();
    await expect(line).toBeChecked();
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'buy Jayson Tatum' }).first()).toBeChecked();

    await page.getByRole('tab', { name: 'Table notes' }).first().click();
    const notes = page.getByRole('tabpanel', { name: /table notes for/i }).first();
    await notes.getByLabel(/dealer at/i).fill('Rivera');
    await notes.getByLabel(/table at/i).fill('12');
    await notes.getByLabel(/^Ask at /i).fill('5');
    await notes.getByLabel(/offer at/i).fill('4');
    await notes.getByLabel(/result at/i).selectOption('bought');
    await notes.getByLabel(/card for the ask/i).selectOption('judge');
    await expect(notes.getByLabel('Ladder score')).toContainText(/Paid \$4 is at or under the open on demo sales/);
    await expect(notes.getByLabel('Ladder score')).toContainText(/Bought inside the walk/);
    await notes.getByRole('button', { name: 'Add table note' }).click();
    await expect(notes.getByLabel('Ladder score for Rivera table 12')).toContainText(/Bought inside the walk/);
  });

  test('opens a read-only want-list link with no server copy', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await seedBook(page);
    await page.reload();
    await page.goto('/#/alerts');
    const share = page.getByRole('region', { name: 'Want-list share' });
    await expect(share.getByText(/no server copy/i)).toBeVisible({ timeout: 20_000 });
    const link = share.getByLabel('Want-list share link');
    await expect(link).toHaveValue(/#\/alerts\?want=/, { timeout: 20_000 });
    const href = await link.inputValue();
    await page.goto(href);
    const shared = page.getByLabel('Shared want list');
    await expect(shared.getByText(/read-only/i)).toBeVisible();
    await expect(shared.getByText('Jayson Tatum 2024 Prizm · 2024 · max $200')).toBeVisible();
  });
});
