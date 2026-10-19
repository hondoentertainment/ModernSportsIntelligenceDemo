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
        const signupLink = page.getByRole('link', {
            name: /initialize account|sign up|create account/i
        }).first();
        await expect(signupLink).toBeVisible({ timeout: 10000 });
        await Promise.all([
            page.waitForURL(/signup/, { timeout: 15000 }),
            signupLink.click(),
        ]);
        await expect(page.getByRole('heading', { name: /create account|join the alpha/i }).first()).toBeVisible({ timeout: 10000 });
    });

    test('Login accepts a username or an email', async ({ page }) => {
        await page.goto('/#/login');
        await expect(page.getByLabel(/username or email/i)).toBeVisible({ timeout: 10000 });
        const password = page.getByLabel(/^password$/i);
        await expect(password).toHaveAttribute('type', 'password');
        await page.getByRole('button', { name: /show password/i }).click();
        await expect(password).toHaveAttribute('type', 'text');
    });

    test('Signup rejects a username that is too short', async ({ page }) => {
        await page.goto('/#/signup');
        await expect(page.getByLabel(/^username$/i)).toBeVisible({ timeout: 10000 });
        await page.getByLabel(/^username$/i).fill('ab');
        await page.getByLabel(/^email$/i).fill('fan@example.com');
        await page.getByLabel(/^password$/i).fill('Password1');
        await page.getByLabel(/^confirm$/i).fill('Password1');
        await page.getByRole('checkbox').check();
        await page.getByRole('button', { name: /create account|initialize local session/i }).click();
        await expect(page.getByRole('alert')).toContainText(/3-20/);
    });
});
