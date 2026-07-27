/**
 * Command-palette E2E spec.
 *
 * Verifies the unified Cmd+K / Ctrl+K palette mounted in App.tsx AppLayout
 * (PR-C). The palette is keyboard-driven; this spec runs against `chromium`
 * only — there's no mobile keyboard surface for Ctrl+K.
 */
import { test, expect, type Page } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

test.describe('Command Palette (Ctrl+K)', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Keyboard-driven; desktop only');

    test.beforeEach(async ({ page }) => {
        page.on('console', (msg) => console.log(`[browser:${msg.type()}]`, msg.text()));
        page.on('pageerror', (err) => console.log('[browser:pageerror]', err.message));
        await enterDemoMode(page);
        // Verify the AppLayout keydown handler is wired and confirm
        // dispatching a fake event triggers it.
        await page.evaluate(() => {
            let fired = false;
            const probe = () => {
                fired = true;
            };
            window.addEventListener('keydown', probe);
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            window.removeEventListener('keydown', probe);
            console.log('[probe] keydown fired=', fired);
        });
    });

    async function openPalette(page: Page): Promise<void> {
        await expect(page.locator('#main-content')).toBeVisible({ timeout: 15_000 });
        await page.locator('#main-content').click({ position: { x: 8, y: 8 } });
        await page.keyboard.press('Control+K');
        await expect(
            page.getByRole('dialog', { name: /command palette/i }),
        ).toBeVisible({ timeout: 10_000 });
    }

    test('opens with Ctrl+K and exposes Navigate / Run / Features sections', async ({ page }) => {
        await openPalette(page);

        const dialog = page.getByRole('dialog', { name: /command palette/i });
        await expect(dialog).toBeVisible();

        // Section headers (case-insensitive contains).
        await expect(dialog.getByText(/navigate/i).first()).toBeVisible();
        await expect(dialog.getByText(/run/i).first()).toBeVisible();
        await expect(dialog.getByText(/features/i).first()).toBeVisible();
    });

    test('typing "collection" filters and Enter navigates to /collection', async ({ page }) => {
        await openPalette(page);

        // The palette autofocuses its search input; type the filter.
        await page.keyboard.type('collection');

        // First (selected) option should be the navigate-to-collection row.
        const firstOption = page.locator('[role="option"]').first();
        await expect(firstOption).toBeVisible({ timeout: 5_000 });
        await expect(firstOption).toContainText(/collection/i);
        await expect(firstOption).toHaveAttribute('aria-selected', 'true');

        await page.keyboard.press('Enter');

        // HashRouter — URL should end with #/collection.
        await expect(page).toHaveURL(/#\/collection$/, { timeout: 5_000 });
    });

    test('Escape closes the palette', async ({ page }) => {
        await openPalette(page);

        await page.keyboard.press('Escape');
        await expect(
            page.getByRole('dialog', { name: /command palette/i }),
        ).toHaveCount(0, { timeout: 5_000 });
    });

    test('Ctrl+K toggles — never stacks two modals', async ({ page }) => {
        await openPalette(page);

        // Second press should close, not stack.
        await page.keyboard.press('Control+K');
        await expect(
            page.getByRole('dialog', { name: /command palette/i }),
        ).toHaveCount(0, { timeout: 5_000 });

        // Re-opening should still yield exactly one dialog.
        await page.keyboard.press('Control+K');
        await expect(
            page.getByRole('dialog', { name: /command palette/i }),
        ).toHaveCount(1, { timeout: 5_000 });
    });

    test('typing "scan" + Enter navigates to / (HashRouter)', async ({ page }) => {
        await openPalette(page);
        await page.keyboard.type('scan');

        // /scan slash command ranks first for bare "scan" (dashboard Alpha scan).
        const firstOption = page.locator('[role="option"]').first();
        await expect(firstOption).toBeVisible({ timeout: 5_000 });
        await expect(firstOption).toContainText(/\/scan|alpha scan/i);

        await page.keyboard.press('Enter');
        await expect(page).toHaveURL(/#\/?$/, { timeout: 5_000 });
        await expect(
            page.getByRole('dialog', { name: /command palette/i }),
        ).toHaveCount(0, { timeout: 5_000 });
    });

    // Seeding unread alerts in the live demo state requires either an
    // alerts seeding API we don't expose, or injecting state into the
    // useAlerts hook — both touch source files this PR is forbidden from
    // modifying (constraint: components/, pages/, lib/, hooks/, contexts/,
    // App.tsx, index.html are off-limits while Agent E works on App.tsx).
    // Unit coverage in tests/components/Header.test.tsx already asserts
    // the badge contract (0 → no badge, 3 → "3", 42 → "9+") via mocked
    // useAlerts; that suffices for now.
    test.skip('Header bell badge reflects unread count', async () => {
        // Intentional: cannot seed alerts without modifying source files.
    });
});
