import { expect, type Page } from '@playwright/test';

/**
 * Drops a fresh browser context into the authenticated demo shell.
 *
 * Mirrors the pattern used by tests/e2e/auth.spec.ts and
 * tests/e2e/release-smoke.spec.ts so that every new spec authenticates
 * the same way and stays compatible with the demo-mode preview server
 * (`npm run build:e2e && npm run preview`) configured in
 * playwright.config.ts.
 */
export async function enterDemoMode(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Skip GuidedTour overlay (z-[250]) which intercepts clicks in E2E.
        localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
    });
    await page.reload();
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 10_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}
