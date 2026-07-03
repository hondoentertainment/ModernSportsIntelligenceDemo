import { expect, test } from '@playwright/test';
import { enterDemoMode } from '../helpers/e2eAuth';

/**
 * E2E for the Provenance Chain registry (/provenance) — the wave-3 beta-exit
 * gate for the `provenance-chain` feature: register a card, reload the page,
 * and the entry must survive.
 *
 * Persistence path under test (lib/core/provenanceChainService.ts):
 *   registerCard() → in-memory cache → sealedStorage.seal (AES-GCM, key in
 *   IndexedDB) → store.set (DAL → localStorage). On reload,
 *   initProvenanceService() re-hydrates the cache by unsealing the stored
 *   token, so both the DAL write and the seal/unseal round-trip are covered.
 */

const PLAYER_NAME = 'E2E Provenance Tester';
const CARD_DESCRIPTION = '2024 E2E Chrome Refractor #42 PSA 10';

test.describe('Provenance Chain registry persistence (/provenance)', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Desktop chromium smoke');

    test('registered card survives a full page reload', async ({ page }) => {
        // Demo login → register → sealed write → reload → hydrate is a long
        // flow; the 30s default budget is too tight on cold preview servers.
        test.setTimeout(90_000);
        await enterDemoMode(page);
        await page.goto('/#/provenance');

        // The provenance modal opens automatically on mount.
        await expect(
            page.getByRole('heading', { name: /card dna & provenance chain/i }),
        ).toBeVisible({ timeout: 15_000 });

        // Register a card with a name no seeded mock uses.
        await page.getByRole('button', { name: /^register$/i }).click();
        await page.getByPlaceholder('e.g., Aaron Judge').fill(PLAYER_NAME);
        await page.getByPlaceholder(/2017 topps chrome update/i).fill(CARD_DESCRIPTION);
        await page.getByRole('button', { name: /register & create digital twin/i }).click();
        await expect(page.getByText(/card registered successfully/i)).toBeVisible({ timeout: 5_000 });

        // registerCard() persists fire-and-forget (seal → store.set). Wait for
        // the DAL write to land in localStorage before reloading.
        await page.waitForFunction(
            () => Object.keys(localStorage).some((k) => k.startsWith('msi_provenance_registered_v1')),
            undefined,
            { timeout: 10_000 },
        );

        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(
            page.getByRole('heading', { name: /card dna & provenance chain/i }),
        ).toBeVisible({ timeout: 15_000 });

        // Hydration from sealed storage is async and the modal reads the cache
        // on each render — bounce tabs to force re-renders until it lands.
        await expect(async () => {
            await page.getByRole('button', { name: /^verify$/i }).click();
            await page.getByRole('button', { name: /^registry$/i }).click();
            await expect(page.getByText(PLAYER_NAME).first()).toBeVisible({ timeout: 1_000 });
        }).toPass({ timeout: 15_000 });

        // The description round-tripped through seal/unseal too.
        await expect(page.getByText(CARD_DESCRIPTION).first()).toBeVisible();
    });
});
