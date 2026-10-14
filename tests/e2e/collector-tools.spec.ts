import { expect, test, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';
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

  await page.evaluate(() => {
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
    localStorage.setItem('cardx_inventory', JSON.stringify([
      card({ id: 'judge', player: 'Aaron Judge', currentValue: 100, purchasePrice: 40 }),
      ...fillers,
    ]));
    localStorage.setItem('cardx_targets', JSON.stringify([{
      id: 'tatum',
      player: 'Jayson Tatum',
      cardDescription: '2024 Prizm',
      priority: 'High',
      targetPrice: 200,
      sport: 'Basketball',
      league: 'NBA',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
    }]));
  });
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
  });

  test('opens a read-only want-list link with no server copy', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
    await seedBook(page);
    await page.reload();
    await page.goto('/#/alerts');
    const share = page.getByRole('region', { name: 'Want-list share' });
    await expect(share.getByText(/no server copy/i)).toBeVisible({ timeout: 20_000 });
    const href = await share.getByLabel('Want-list share link').inputValue();
    expect(href).toContain('#/alerts?want=');
    await page.goto(href);
    const shared = page.getByLabel('Shared want list');
    await expect(shared.getByText(/read-only/i)).toBeVisible();
    await expect(shared.getByText('Jayson Tatum 2024 Prizm · 2024 · max $200')).toBeVisible();
  });
});
