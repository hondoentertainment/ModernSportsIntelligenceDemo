import { expect, test } from '@playwright/test';
import { prepareFreshBrowserSession } from '../helpers/e2eAuth';

const OFF_COPY =
  /does not name an equal share|no held card is on this desk|no favorite is on this desk|cannot move to an equal share/;

test('public demo entry shows equal-share trim and fill lines', async ({ page }) => {
  await prepareFreshBrowserSession(page);
  const demoEntry = page.getByRole('button', { name: /try the demo/i });
  await expect(demoEntry).toBeVisible();
  await demoEntry.click();
  await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
  await expect(page.getByRole('status').filter({ hasText: 'Demo mode' })).toBeVisible({
    timeout: 15_000,
  });

  await expect(page.getByLabel('Equal share', { exact: true }).first()).toContainText(
    /trim of sparkline start/,
    { timeout: 20_000 }
  );
  await expect(page.getByLabel('Equal share', { exact: true }).first()).not.toContainText(OFF_COPY);
  await expect(page.getByLabel('Favorites equal share', { exact: true }).first()).toContainText(
    /fill, not a buy/
  );

  await page.goto('/#/collection');
  await expect(page.getByLabel('Equal share', { exact: true }).first()).toContainText(
    /trim of sparkline start/,
    { timeout: 20_000 }
  );
  await expect(page.getByLabel('Equal share', { exact: true }).first()).not.toContainText(OFF_COPY);

  await page.goto('/#/alerts');
  await expect(page.getByLabel('Equal share', { exact: true }).first()).toContainText(
    /trim of sparkline start/,
    { timeout: 20_000 }
  );
  await expect(page.getByLabel('Equal share', { exact: true }).first()).not.toContainText(OFF_COPY);

  await page.goto('/#/favorites');
  await expect(page.getByLabel('Favorites equal share', { exact: true }).first()).toContainText(
    /fill, not a buy/,
    { timeout: 20_000 }
  );
  await expect(page.getByLabel('Favorites equal share', { exact: true }).first()).not.toContainText(
    OFF_COPY
  );
});
