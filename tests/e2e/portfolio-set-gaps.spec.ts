import { expect, test } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

test.describe('Set completion from the book', () => {
  test('tracks a started demo checklist from collection gaps', async ({ page }) => {
    test.setTimeout(120_000);
    await enterDemoMode(page);
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
        purchasePrice: 4,
        purchaseDate: '2024-06-01',
        currentValue: 8,
        status: 'active',
        ...overrides,
      });
      localStorage.setItem('cardx_inventory', JSON.stringify([
        card({ id: 'judge', player: 'Aaron Judge', cardNumber: '1' }),
        card({ id: 'skenes', player: 'Paul Skenes', cardNumber: '250' }),
      ]));
    });
    await page.reload();
    await page.goto('/#/collection');
    const tracker = page.getByRole('region', { name: 'Set completion from your book' });
    await expect(tracker).toBeVisible({ timeout: 20_000 });
    await expect(tracker.getByText(/not a beckett registry/i)).toBeVisible();
    const series = tracker.getByRole('listitem', { name: '2024 Topps Series 1' });
    await expect(series.getByText('50% · 2/4')).toBeVisible();
    await expect(series.getByText('Cost to complete $16')).toBeVisible();
    await expect(series.getByText(/Missing Juan Soto, Pete Alonso/)).toBeVisible();
    await series.getByRole('button', { name: 'Track 2024 Topps Series 1' }).click();
    await expect(series.getByText('50% left to the goal')).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Stop tracking 2024 Topps Series 1' })).toBeVisible({ timeout: 20_000 });

    await page.goto('/#/set-completion');
    const advisor = page.getByRole('region', { name: 'Set completion from your book' });
    await expect(advisor).toBeVisible({ timeout: 20_000 });
    await expect(advisor.getByText(/separate demo/i)).toBeVisible();
    await expect(advisor.getByRole('button', { name: 'Stop tracking 2024 Topps Series 1' })).toBeVisible();
  });
});
