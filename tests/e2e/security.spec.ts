import { test, expect } from '@playwright/test';
import { demoLogin, clearSession } from '../fixtures/auth';

test.describe('Security: Authentication & Route Protection', () => {
    test.describe('Protected route access', () => {
        test('unauthenticated user is redirected to login when accessing dashboard', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/');
            await expect(page).toHaveURL(/login/i);
        });

        test('unauthenticated user is redirected to login when accessing collection', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/collection');
            await expect(page).toHaveURL(/login/i);
        });

        test('unauthenticated user is redirected to login when accessing settings/profile', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/settings');
            await expect(page).toHaveURL(/login/i);
        });

        test('unauthenticated user is redirected to login when accessing deep-search', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/deep-search');
            await expect(page).toHaveURL(/login/i);
        });

        test('unauthenticated user cannot access arbitrary protected path', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/audit');
            await expect(page).toHaveURL(/login/i);
        });
    });

    test.describe('Public routes remain accessible', () => {
        test('login page is accessible when unauthenticated', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/login');
            await expect(page).toHaveURL(/login/i);
            await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible();
        });

        test('signup page is accessible when unauthenticated', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/signup');
            await expect(page).toHaveURL(/signup/i);
        });

        test('forgot-password page is accessible when unauthenticated', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/forgot-password');
            await expect(page).toHaveURL(/forgot-password/i);
        });

        test('public portfolio page is accessible without auth', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/p/testuser');
            // Public portfolio does not require auth; may show empty or error state
            await expect(page).not.toHaveURL(/login/i);
        });
    });

    test.describe('Session & logout', () => {
        test.beforeEach(async ({ page }) => {
            await demoLogin(page);
        });

        test('authenticated user can access protected routes', async ({ page }) => {
            await page.goto('/#/');
            await expect(page).toHaveURL(/#\/$/);
            await expect(page.getByText(/modern sports intelligence|portfolio|dashboard/i).first()).toBeVisible({ timeout: 8000 });
        });

        test('user can sign out and is redirected away from protected content', async ({ page }) => {
            await page.goto('/#/');
            await expect(page).toHaveURL(/#\/$/);

            // Navigate to Settings where Sign Out is always visible
            await page.goto('/#/settings');
            await page.waitForTimeout(500);
            const signOutBtn = page.getByRole('button', { name: /sign out of intelligence|sign out/i });
            await expect(signOutBtn).toBeVisible({ timeout: 5000 });
            await signOutBtn.click();

            await page.waitForTimeout(500);
            await expect(page).toHaveURL(/login/i);
        });

        test('after logout, direct access to protected route redirects to login', async ({ page }) => {
            await page.goto('/#/');
            await expect(page).toHaveURL(/#\/$/);

            await page.goto('/#/settings');
            await page.waitForTimeout(500);
            await page.getByRole('button', { name: /sign out of intelligence|sign out/i }).click();

            await page.waitForTimeout(500);
            await page.goto('/#/collection');
            await expect(page).toHaveURL(/login/i);
        });
    });

    test.describe('Direct URL manipulation', () => {
        test('hash-based navigation to protected path without session redirects to login', async ({ page }) => {
            await clearSession(page);
            await page.goto('/#/builder');
            await expect(page).toHaveURL(/login/i);
        });
    });
});
