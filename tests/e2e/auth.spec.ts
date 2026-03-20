import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload();
    });

    test('Login page renders and demo mode works', async ({ page }) => {
        await page.goto('/#/login');
        await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible({ timeout: 15000 });

        const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
        await expect(demoButton).toBeVisible({ timeout: 10000 });
        await demoButton.click();
        await expect(page).toHaveURL(/#\/?$/, { timeout: 15000 });
    });

    test('Forgot password link navigates to reset page', async ({ page }) => {
        await page.goto('/#/login');
        await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible({ timeout: 10000 });
        await page.getByRole('link', { name: /forgot/i }).click();
        await expect(page).toHaveURL(/forgot-password/);
        await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    });

    test('Signup link navigates to signup page', async ({ page }) => {
        await page.goto('/#/login');
        await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible({ timeout: 10000 });
        await page.getByRole('link', { name: /initialize account|sign up|create account/i }).first().click();
        await expect(page).toHaveURL(/signup/);
    });
});
