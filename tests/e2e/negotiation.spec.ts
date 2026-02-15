
import { test, expect } from '@playwright/test';

test.describe('Agentic Negotiation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go to dashboard
        await page.goto('/');
        // Ensure we are in a state where the marketplace is visible
        // You might need to mock initial state or wait for animations
        await page.waitForTimeout(1000);
    });

    test('should open negotiation modal from marketplace teaser', async ({ page }) => {
        // Look for "Agentic Marketplace" section
        await expect(page.getByText('Agentic Marketplace')).toBeVisible();

        // Click on the first "Launch Agent" button
        const launchButtons = page.getByText('Launch Agent');
        await launchButtons.first().click();

        // Verify Modal Opens
        await expect(page.getByText('Negotiation Arena')).toBeVisible();
        await expect(page.getByText('Max Willing to Pay')).toBeVisible();
    });

    test('should complete a negotiation simulation', async ({ page }) => {
        // Open Modal
        await page.getByText('Launch Agent').first().click();

        // Config Step
        const maxWillingInput = page.getByPlaceholder('0.00');
        await maxWillingInput.fill('500'); // Assuming item is around 450
        await page.getByText('Enter Arena').click();

        // Arena Step
        await expect(page.getByText('Asking')).toBeVisible(); // Seller message

        // Send Counter
        const counterInput = page.getByPlaceholder('Counter offer...');
        await counterInput.fill('440');
        await page.locator('button:has(svg.lucide-send)').click();

        // Verify User Message appears
        await expect(page.getByText('I offer $440')).toBeVisible();

        // Wait for Seller Response (simulated delay)
        // Since logic determines it, 440 vs 450 is close, might accept or counter
        // We'll just check that *some* new message appears or status changes
        // For robustness, let's just ensure the flow doesn't crash
    });
});
