import { readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { test, expect, type Page } from '@playwright/test';

/** Minimal valid row for `cardx_inventory` so War Room enables refresh without relying on dashboard timing. */
const E2E_SEED_CARD = [
    {
        id: 'e2e-war-room-seed',
        player: 'E2E War Room Seed',
        year: 2020,
        manufacturer: 'TestCo',
        cardNumber: '1',
        set: 'Chrome',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Near Mint',
        isGraded: false,
        purchasePrice: 25,
        purchaseDate: '2024-06-01',
        currentValue: 25,
        lastValuationDate: '2026-01-01',
        status: 'active' as const,
    },
];

async function enterDemoMode(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.goto('/#/login');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('msi-guided-tour-completed', JSON.stringify('true'));
    });
    await page.reload();
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo mode/i });
    await expect(demoButton).toBeVisible({ timeout: 10_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/?$/, { timeout: 15_000 });
}

test.describe('War Room', () => {
    test('War Room loads after demo login, shows AI disclaimer, refresh does not crash', async ({ page }) => {
        test.setTimeout(60_000);
        await enterDemoMode(page);
        await page.evaluate((cards) => {
            localStorage.setItem('cardx_inventory', JSON.stringify(cards));
        }, E2E_SEED_CARD);

        const jsErrors: string[] = [];
        page.on('pageerror', (err) => jsErrors.push(err.message));

        await page.goto('/#/war-room');

        await expect(page.getByRole('heading', { name: /Analyst War Room/i })).toBeVisible({ timeout: 15_000 });
        await expect(
            page.getByText(/Multi-agent output is AI-generated guidance/i),
        ).toBeVisible();

        const refreshBtn = page.getByRole('button', { name: /refresh intelligence/i });
        await expect(refreshBtn).toBeEnabled({ timeout: 15_000 });
        await refreshBtn.click();

        await expect(refreshBtn).toBeEnabled({ timeout: 30_000 });
        await expect(page.getByRole('heading', { name: /Analyst War Room/i })).toBeVisible();
        expect(jsErrors, jsErrors.join('; ')).toHaveLength(0);
    });

    test('War Room export downloads JSON thesis package with expected skeleton', async ({ page }) => {
        test.setTimeout(45_000);
        await enterDemoMode(page);
        await page.evaluate((cards) => {
            localStorage.setItem('cardx_inventory', JSON.stringify(cards));
            const thesis = {
                id: 'e2e-export-thesis-00000000-0000-4000-8000-000000000001',
                summary: 'E2E export summary',
                keyTakeaways: ['takeaway-a'],
                riskAssessment: 'moderate',
                recommendedAction: 'hold',
                agents: [
                    {
                        agentId: 'atlas',
                        agentName: 'Atlas',
                        persona: 'value',
                        insight: 'E2E insight',
                        sentiment: 'neutral',
                        confidence: 0.5,
                    },
                ],
                createdAt: '2026-04-02T12:00:00.000Z',
                runMetadata: {
                    inputHash: '0'.repeat(32),
                    promptVersion: 'war-room-committee-2026-04-v1',
                    modelId: 'gemini-1.5-flash',
                    includeStrategist: true,
                },
            };
            localStorage.setItem('msi_war_room_last_thesis_v1', JSON.stringify(thesis));
        }, E2E_SEED_CARD);

        await page.goto('/#/war-room');
        await expect(page.getByRole('heading', { name: /Analyst War Room/i })).toBeVisible({ timeout: 15_000 });
        await expect(page.getByText(/Run traceability/i)).toBeVisible();
        await expect(page.getByText('0'.repeat(32))).toBeVisible();

        const exportBtn = page.getByRole('button', { name: /export thesis json/i });
        await expect(exportBtn).toBeVisible();

        const outPath = join(tmpdir(), `msi-war-room-export-${Date.now()}.json`);
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            exportBtn.click(),
        ]);
        expect(download.suggestedFilename()).toMatch(/\.json$/i);
        await download.saveAs(outPath);
        const raw = await readFile(outPath, 'utf8');
        await unlink(outPath).catch(() => {});

        const parsed = JSON.parse(raw) as {
            format?: string;
            thesis?: { summary?: string; runMetadata?: { inputHash?: string } };
        };
        expect(parsed.format).toBe('msi-war-room-thesis-v1');
        expect(parsed.thesis?.summary).toBe('E2E export summary');
        expect(parsed.thesis?.runMetadata?.inputHash).toBe('0'.repeat(32));
    });


});
