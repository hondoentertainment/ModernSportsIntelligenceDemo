// @ts-nocheck
import { expect, test } from '@playwright/test';

test.describe('Offline PWA shell', () => {
  test('offline.html is reachable and exposes recovery actions', async ({ page }) => {
    await page.goto('/offline.html');
    await expect(page.getByRole('heading', { name: /you're offline/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute('href', '/#/');
  });

  test('uncached navigation while offline falls back to offline shell; dashboard link uses hash route', async ({
    page,
    context,
  }) => {
    await page.goto('/#/login', { waitUntil: 'load', timeout: 60_000 });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), null, {
      timeout: 20_000,
    });

    await context.setOffline(true);

    const uncached = `/e2e-offline-uncached-${Date.now()}`;
    await page.goto(uncached, { waitUntil: 'commit', timeout: 15_000 });

    await expect(page.getByRole('heading', { name: /you're offline/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: /back to dashboard/i }).click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });

    await context.setOffline(false);
  });
});
