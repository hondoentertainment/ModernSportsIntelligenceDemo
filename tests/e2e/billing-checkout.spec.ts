// @ts-nocheck
import { test, expect, type Page } from '@playwright/test';

async function enterDemoMode(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/#/login');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
  });
  await page.reload();
  await page.goto('/#/login');
  const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
  await expect(demoButton).toBeVisible({ timeout: 10_000 });
  await demoButton.click();
  await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}

test.describe('Billing and checkout UX', () => {
  test('billing page shows subscription shell and demo-mode billing notice', async ({ page }) => {
    await enterDemoMode(page);
    await page.goto('/#/billing');
    await expect(page.getByRole('heading', { name: /Subscription & Billing/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Subscription management is disabled in Demo Mode/i)).toBeVisible();
  });

  test('billing success query shows confirmation message', async ({ page }) => {
    await enterDemoMode(page);
    await page.goto('/#/billing?success=true');
    await expect(page.getByText(/Payment received/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test('billing canceled query shows canceled message', async ({ page }) => {
    await enterDemoMode(page);
    await page.goto('/#/billing?canceled=true');
    await expect(page.getByText(/Checkout was canceled/i)).toBeVisible({ timeout: 15_000 });
  });
});
