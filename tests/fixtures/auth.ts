import { Page } from '@playwright/test';

/** Demo login helper - use when Supabase is in demo mode (no credentials). */
export async function demoLogin(page: Page): Promise<void> {
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
    if (await demoButton.isVisible()) {
        await demoButton.click();
        await page.waitForTimeout(500);
        await page.waitForURL(/#\/$/, { timeout: 15000 });
    }
}

/** Clear session (localStorage + cookies) to simulate logged-out state. */
export async function clearSession(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.evaluate(() => {
        localStorage.removeItem('msi_demo_session');
        localStorage.clear();
    });
}
