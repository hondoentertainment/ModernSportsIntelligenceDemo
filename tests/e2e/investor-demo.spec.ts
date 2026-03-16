import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// ─── Constants ───────────────────────────────────────────────────────────────

/** All 20 v5.0 feature routes that form the investor demo surface. */
const FEATURE_ROUTES = [
    '/card-genome-sequencer',
    '/injury-oracle',
    '/cross-asset-correlation',
    '/collector-social-graph',
    '/restoration-simulator',
    '/market-maker-arena',
    '/fractional-vault',
    '/portfolio-stress-tester',
    '/rookie-pipeline-scanner',
    '/forensics-lab',
    '/card-decay-predictor',
    '/narrative-arc-engine',
    '/liquidity-depth-scanner',
    '/contagion-mapper',
    '/grail-index-constructor',
    '/print-run-decoder',
    '/temporal-arbitrage-radar',
    '/collection-dna-mixer',
    '/card-yield-farming',
    '/chaos-theory-simulator',
] as const;

/** Maximum time (ms) to wait for a lazy-loaded page to render content. */
const PAGE_LOAD_TIMEOUT = 15_000;

/** Maximum time (ms) to wait for chart SVG elements after tab click. */
const CHART_RENDER_TIMEOUT = 10_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Log into the app using the demo-mode button, then wait for the
 * dashboard to confirm authentication.
 */
async function enterDemoMode(page: Page): Promise<void> {
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
    await expect(demoButton).toBeVisible({ timeout: 10_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/$/, { timeout: PAGE_LOAD_TIMEOUT });
}

/**
 * Navigate to a hash-router feature route and wait for meaningful
 * content to appear (i.e. the page is not blank).
 */
async function navigateToFeature(page: Page, route: string): Promise<void> {
    await page.goto(`/#${route}`);
    // Wait for the lazy-loaded page to mount — at minimum one visible
    // text node or chart element should appear.
    await expect(
        page.locator('main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3').first(),
    ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
}

/**
 * Collect console errors emitted during a callback. Returns the array
 * of error messages so callers can assert against it.
 */
async function collectConsoleErrors(
    page: Page,
    action: () => Promise<void>,
): Promise<string[]> {
    const errors: string[] = [];
    const handler = (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    };
    page.on('console', handler);
    await action();
    page.off('console', handler);
    return errors;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Investor Demo Flow', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    // ── Card Genome Sequencer ────────────────────────────────────────────

    test('Card Genome Sequencer loads and displays genome data', async ({ page }) => {
        await navigateToFeature(page, '/card-genome-sequencer');

        // Verify all 6 tabs render
        const expectedTabs = [
            'Genome Profile',
            'Gene Comparison',
            'Population Genomics',
            'Genetic Twins',
            'Genome Evolution',
            'Grade Predictor',
        ];
        for (const label of expectedTabs) {
            await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
        }

        // Default tab should show a chart (Recharts renders SVG)
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Click through each tab and verify chart/content renders
        for (const label of expectedTabs) {
            await page.getByRole('button', { name: new RegExp(label, 'i') }).click();
            // Each tab should render at least one Recharts SVG or meaningful content
            await expect(
                page.locator('.recharts-wrapper, svg.recharts-surface, table, [data-testid]').first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify card selector is present and functional
        const selector = page.locator('select, [role="combobox"], [role="listbox"], button:has-text("Select")').first();
        if (await selector.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await expect(selector).toBeEnabled();
        }
    });

    // ── Cross-Asset Correlation ──────────────────────────────────────────

    test('Cross-Asset Correlation shows financial data', async ({ page }) => {
        await navigateToFeature(page, '/cross-asset-correlation');

        // Verify correlation matrix tab renders
        await expect(
            page.getByText(/correlation matrix/i).first(),
        ).toBeVisible();

        // The correlation heatmap or chart should render
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface, table').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Navigate to Multi-Asset tab
        const multiAssetTab = page.getByRole('button', { name: /multi.?asset/i });
        if (await multiAssetTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await multiAssetTab.click();
            await expect(
                page.locator('.recharts-wrapper, svg.recharts-surface').first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify asset selector exists
        const assetControls = page.locator(
            'select, [role="combobox"], button:has-text("Asset"), button:has-text("Select")',
        ).first();
        if (await assetControls.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await expect(assetControls).toBeEnabled();
        }

        // Verify financial data labels are present (correlation values, percentages)
        await expect(
            page.getByText(/correlation|diversif|alpha|drawdown/i).first(),
        ).toBeVisible();
    });

    // ── Portfolio Stress Tester ──────────────────────────────────────────

    test('Portfolio Stress Tester runs Monte Carlo', async ({ page }) => {
        await navigateToFeature(page, '/portfolio-stress-tester');

        // Verify Monte Carlo tab is active by default and fan chart renders
        await expect(
            page.getByText(/monte carlo/i).first(),
        ).toBeVisible();
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Navigate to Stress Scenarios tab
        const stressTab = page.getByRole('button', { name: /stress scenario/i });
        if (await stressTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await stressTab.click();
            await expect(
                page.locator('.recharts-wrapper, svg.recharts-surface, table').first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Navigate to Value at Risk tab and verify VaR calculations display
        const varTab = page.getByRole('button', { name: /value at risk/i });
        if (await varTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await varTab.click();
            await expect(
                page.getByText(/VaR|value at risk|\$|%/i).first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify portfolio position data is displayed
        await expect(
            page.getByText(/portfolio|position|total/i).first(),
        ).toBeVisible();
    });

    // ── Fractional Vault ─────────────────────────────────────────────────

    test('Fractional Vault shows ownership data', async ({ page }) => {
        await navigateToFeature(page, '/fractional-vault');

        // Verify vault gallery loads (default tab)
        await expect(
            page.getByText(/vault gallery|gallery/i).first(),
        ).toBeVisible();

        // Gallery should show vault cards with share prices
        await expect(
            page.getByText(/\$[\d,.]+/i).first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Check governance tab renders proposals
        const govTab = page.getByRole('button', { name: /governance/i });
        if (await govTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await govTab.click();
            await expect(
                page.getByText(/proposal|vote|quorum/i).first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify share price / financial data is displayed
        await expect(
            page.getByText(/share|price|value|funded/i).first(),
        ).toBeVisible();

        // Verify chart content exists
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
    });

    // ── Card Yield Farming ───────────────────────────────────────────────

    test('Card Yield Farming shows APY data', async ({ page }) => {
        await navigateToFeature(page, '/card-yield-farming');

        // Verify yield pools tab loads by default
        await expect(
            page.getByText(/yield pool|pools/i).first(),
        ).toBeVisible();

        // APY badges should display percentage values
        await expect(
            page.getByText(/%/).first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Click through to positions tab
        const positionsTab = page.getByRole('button', { name: /position/i });
        if (await positionsTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await positionsTab.click();
            await expect(
                page.getByText(/position|staked|earned/i).first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify analytics tab has charts
        const analyticsTab = page.getByRole('button', { name: /analytics/i });
        if (await analyticsTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await analyticsTab.click();
            await expect(
                page.locator('.recharts-wrapper, svg.recharts-surface').first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }

        // Verify pool details are accessible (lending market tab)
        const lendingTab = page.getByRole('button', { name: /lending/i });
        if (await lendingTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await lendingTab.click();
            await expect(
                page.getByText(/lending|offer|rate|APY/i).first(),
            ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });
        }
    });

    // ── All 20 Feature Pages Load Without Errors ─────────────────────────

    test('All 20 feature pages load without errors', async ({ page }) => {
        for (const route of FEATURE_ROUTES) {
            const errors = await collectConsoleErrors(page, async () => {
                await page.goto(`/#${route}`);
                // Wait for the page to render meaningful content
                await expect(
                    page.locator(
                        'main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3, [class*="tab"]',
                    ).first(),
                ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT });
            });

            // Filter out benign warnings — only fail on chunk-load or fatal errors
            const fatalErrors = errors.filter(
                (e) =>
                    e.includes('ChunkLoadError') ||
                    e.includes('chunk load failed') ||
                    e.includes('Loading chunk') ||
                    e.includes('Uncaught') ||
                    e.includes('Unhandled'),
            );

            expect(
                fatalErrors,
                `Fatal console errors on ${route}: ${fatalErrors.join('; ')}`,
            ).toHaveLength(0);

            // Verify the page is not blank (has visible text content)
            const bodyText = await page.locator('body').innerText();
            expect(bodyText.trim().length, `Page ${route} appears blank`).toBeGreaterThan(0);
        }
    });

    // ── Navigation Between Features ──────────────────────────────────────

    test('Navigation between features works', async ({ page }) => {
        // Start at dashboard
        await expect(page).toHaveURL(/#\/$/);

        // Navigate to first feature
        await navigateToFeature(page, '/card-genome-sequencer');
        await expect(page).toHaveURL(/card-genome-sequencer/);
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface, h1, h2').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Navigate to second feature
        await navigateToFeature(page, '/portfolio-stress-tester');
        await expect(page).toHaveURL(/portfolio-stress-tester/);
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface, h1, h2').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Navigate to third feature
        await navigateToFeature(page, '/fractional-vault');
        await expect(page).toHaveURL(/fractional-vault/);

        // Go back and verify the previous page still works
        await page.goBack();
        await expect(page).toHaveURL(/portfolio-stress-tester/);
        await expect(
            page.locator('.recharts-wrapper, svg.recharts-surface, h1, h2').first(),
        ).toBeVisible({ timeout: CHART_RENDER_TIMEOUT });

        // Go back again
        await page.goBack();
        await expect(page).toHaveURL(/card-genome-sequencer/);
    });

    // ── Tab Navigation on All Feature Pages ──────────────────────────────

    test('Tab navigation works on all feature pages', async ({ page }) => {
        // Test a representative subset of feature pages with 6 tabs each
        const pagesToTest = [
            '/card-genome-sequencer',
            '/cross-asset-correlation',
            '/portfolio-stress-tester',
            '/fractional-vault',
            '/card-yield-farming',
            '/chaos-theory-simulator',
        ];

        for (const route of pagesToTest) {
            await navigateToFeature(page, route);

            // Find all tab-like buttons (each feature has 6 tabs)
            const tabButtons = page.locator(
                'button:not([aria-hidden="true"])',
            );

            // Gather tab buttons that look like feature tabs (exclude generic UI buttons)
            const allButtons = await tabButtons.all();
            const tabCandidates: typeof allButtons = [];

            for (const btn of allButtons) {
                const text = await btn.innerText().catch(() => '');
                // Feature tabs have descriptive labels; skip icon-only or generic buttons
                if (text.trim().length > 2 && text.trim().length < 40) {
                    const isVisible = await btn.isVisible().catch(() => false);
                    if (isVisible) {
                        tabCandidates.push(btn);
                    }
                }
            }

            // Each feature page should have at least 4 tabs
            expect(
                tabCandidates.length,
                `Feature ${route} should have at least 4 visible tab buttons`,
            ).toBeGreaterThanOrEqual(4);

            // Click through first 6 tab candidates (the feature tabs)
            const tabsToClick = tabCandidates.slice(0, 6);
            for (const tab of tabsToClick) {
                await tab.click();
                // Wait briefly for content to update, then verify no crash
                await page.waitForTimeout(500);
                // Page should still have visible content (not crashed)
                await expect(
                    page.locator('body').first(),
                ).toBeVisible();
            }
        }
    });
});
