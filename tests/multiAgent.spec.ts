// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Phase 19: Multi-Agent Intelligence', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app and bypass login if necessary (assuming local dev is fine)
        await page.goto('http://localhost:5173/');

        // Wait for the app to load
        await expect(page.locator('text=CardX')).toBeVisible();
    });

    test('should navigate to Analyst War Room and generate a thesis', async ({ page }) => {
        // Navigate via Sidebar
        await page.click('text=Analyst War Room');
        await expect(page).toHaveURL(/.*war-room/);

        // Check title
        await expect(page.locator('h1')).toHaveText('Analyst War Room');

        // Trigger Refresh Intel
        await page.click('text=REFRESH INTELLIGENCE');

        // Wait for "CONVENING COMMITTEE..." state
        await expect(page.locator('text=CONVENING COMMITTEE...')).toBeVisible();

        // Wait for completion (Collaborative Thesis should appear)
        await expect(page.locator('text=Collaborative Thesis')).toBeVisible({ timeout: 30000 });

        // Verify all 4 agents are present
        const agents = ['Scout Prime', 'Market Sentinel', 'Risk Warden', 'The Closer'];
        for (const agent of agents) {
            await expect(page.locator(`text=${agent}`)).toBeVisible();
        }

        // Verify presence of specific sections
        await expect(page.locator('text=Key Signals')).toBeVisible();
        await expect(page.locator('text=Risk Vector')).toBeVisible();
        await expect(page.locator('text=Recommended Action')).toBeVisible();
        await expect(page.locator('text=EXECUTE STRATEGY')).toBeVisible();
    });
});
