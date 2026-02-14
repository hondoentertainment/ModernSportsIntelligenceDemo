import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
    test('Login page renders and demo mode works', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/(login|#\/login)/);

        await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible();

        const demoButton = page.getByRole('button', { name: /demo/i });
        if (await demoButton.isVisible()) {
            await demoButton.click();
            await expect(page).toHaveURL(/\/#\/$/);
        }
    });

    test('Forgot password link navigates to reset page', async ({ page }) => {
        await page.goto('/#/login');
        await page.getByRole('link', { name: /forgot/i }).click();
        await expect(page).toHaveURL(/forgot-password/);
        await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    });

    test('Signup link navigates to signup page', async ({ page }) => {
        await page.goto('/#/login');
        await page.getByRole('link', { name: /initialize account|sign up|create account/i }).first().click();
        await expect(page).toHaveURL(/signup/);
    });
});
