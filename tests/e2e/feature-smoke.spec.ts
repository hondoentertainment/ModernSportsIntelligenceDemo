import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// ─── Constants ───────────────────────────────────────────────────────────────

/** All 20 v5.0 investor-demo feature routes. */
const FEATURE_ROUTES: { route: string; name: string }[] = [
    { route: '/card-genome-sequencer', name: 'Card Genome Sequencer' },
    { route: '/injury-oracle', name: 'Injury Oracle' },
    { route: '/cross-asset-correlation', name: 'Cross-Asset Correlation' },
    { route: '/collector-social-graph', name: 'Collector Social Graph' },
    { route: '/restoration-simulator', name: 'Restoration Simulator' },
    { route: '/market-maker-arena', name: 'Market Maker Arena' },
    { route: '/fractional-vault', name: 'Fractional Vault' },
    { route: '/portfolio-stress-tester', name: 'Portfolio Stress Tester' },
    { route: '/rookie-pipeline-scanner', name: 'Rookie Pipeline Scanner' },
    { route: '/forensics-lab', name: 'Forensics Lab' },
    { route: '/card-decay-predictor', name: 'Card Decay Predictor' },
    { route: '/narrative-arc-engine', name: 'Narrative Arc Engine' },
    { route: '/liquidity-depth-scanner', name: 'Liquidity Depth Scanner' },
    { route: '/contagion-mapper', name: 'Contagion Mapper' },
    { route: '/grail-index-constructor', name: 'Grail Index Constructor' },
    { route: '/print-run-decoder', name: 'Print Run Decoder' },
    { route: '/temporal-arbitrage-radar', name: 'Temporal Arbitrage Radar' },
    { route: '/collection-dna-mixer', name: 'Collection DNA Mixer' },
    { route: '/card-yield-farming', name: 'Card Yield Farming' },
    { route: '/chaos-theory-simulator', name: 'Chaos Theory Simulator' },
];

/** v5.2 Frontier — 10 industry-absent feature routes. */
const NEW_FRONTIER_ROUTES: { route: string; name: string }[] = [
    { route: '/bid-ask-spread-predictor', name: 'Bid-Ask Spread Predictor' },
    { route: '/wash-sale-horizon', name: 'Wash-Sale Horizon Calendar' },
    { route: '/seller-urgency-score', name: 'Seller Urgency Score' },
    { route: '/portfolio-beta-index', name: 'Portfolio Beta to Index' },
    { route: '/grading-queue-estimator', name: 'Grading Queue Estimator' },
    { route: '/reputation-decay-tracker', name: 'Reputation Decay Tracker' },
    { route: '/event-impact-attribution', name: 'Event Impact Attribution' },
    { route: '/liquidity-reserve-calculator', name: 'Liquidity Reserve Calculator' },
    { route: '/cross-sport-momentum', name: 'Cross-Sport Momentum' },
    { route: '/agent-confidence-history', name: 'Agent Confidence History' },
];

/** Maximum time for a page load — investor demo should feel snappy. */
const MAX_PAGE_LOAD_MS = 5_000;

/** Time to wait for chart SVG to appear after page load. */
const CHART_TIMEOUT_MS = 10_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function enterDemoMode(page: Page): Promise<void> {
    await page.goto('/#/login');
    const demoButton = page.getByRole('button', { name: /demo|enter demo/i });
    await expect(demoButton).toBeVisible({ timeout: 10_000 });
    await demoButton.click();
    await expect(page).toHaveURL(/#\/$/, { timeout: 15_000 });
}

// ─── Smoke Tests ─────────────────────────────────────────────────────────────

test.describe('Feature Smoke Tests', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    // ── Page Load Performance ────────────────────────────────────────────

    for (const { route, name } of FEATURE_ROUTES) {
        test(`${name} loads in under 5 seconds`, async ({ page }) => {
            const start = Date.now();

            await page.goto(`/#${route}`);

            // Wait for meaningful content to appear
            await expect(
                page.locator(
                    'main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3',
                ).first(),
            ).toBeVisible({ timeout: MAX_PAGE_LOAD_MS });

            const elapsed = Date.now() - start;
            expect(
                elapsed,
                `${name} took ${elapsed}ms to load (limit: ${MAX_PAGE_LOAD_MS}ms)`,
            ).toBeLessThan(MAX_PAGE_LOAD_MS);
        });
    }

    // ── Recharts SVG Rendering ───────────────────────────────────────────

    for (const { route, name } of FEATURE_ROUTES) {
        test(`${name} renders at least one Recharts SVG element`, async ({ page }) => {
            await page.goto(`/#${route}`);

            // Wait for page to load
            await expect(
                page.locator(
                    'main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3',
                ).first(),
            ).toBeVisible({ timeout: MAX_PAGE_LOAD_MS });

            // Verify at least one Recharts chart renders
            // Recharts uses .recharts-wrapper or svg.recharts-surface
            const chartLocator = page.locator(
                '.recharts-wrapper, svg.recharts-surface',
            );
            await expect(chartLocator.first()).toBeVisible({ timeout: CHART_TIMEOUT_MS });

            // Verify the chart has actual rendered content (paths, rects, circles)
            const svgChildren = page.locator(
                '.recharts-wrapper path, .recharts-wrapper rect, .recharts-wrapper circle, ' +
                'svg.recharts-surface path, svg.recharts-surface rect, svg.recharts-surface circle',
            );
            const childCount = await svgChildren.count();
            expect(
                childCount,
                `${name} chart should have rendered SVG elements (paths/rects/circles)`,
            ).toBeGreaterThan(0);
        });
    }

    // ── No Uncaught JavaScript Errors ────────────────────────────────────

    for (const { route, name } of FEATURE_ROUTES) {
        test(`${name} has no uncaught JavaScript errors`, async ({ page }) => {
            const errors: string[] = [];

            // Listen for uncaught exceptions
            page.on('pageerror', (error) => {
                errors.push(error.message);
            });

            // Also capture console.error for chunk-load failures
            page.on('console', (msg: ConsoleMessage) => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    if (
                        text.includes('ChunkLoadError') ||
                        text.includes('chunk load failed') ||
                        text.includes('Loading chunk') ||
                        text.includes('Uncaught') ||
                        text.includes('Unhandled')
                    ) {
                        errors.push(text);
                    }
                }
            });

            await page.goto(`/#${route}`);

            // Wait for page to stabilize
            await expect(
                page.locator(
                    'main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3',
                ).first(),
            ).toBeVisible({ timeout: MAX_PAGE_LOAD_MS });

            // Allow async errors to surface
            await page.waitForTimeout(1_000);

            expect(
                errors,
                `${name} had uncaught errors: ${errors.join('; ')}`,
            ).toHaveLength(0);
        });
    }

    // ── Tab Switching ────────────────────────────────────────────────────

    for (const { route, name } of FEATURE_ROUTES) {
        test(`${name} tab switching works without crashes`, async ({ page }) => {
            const uncaughtErrors: string[] = [];
            page.on('pageerror', (error) => {
                uncaughtErrors.push(error.message);
            });

            await page.goto(`/#${route}`);

            // Wait for page to load
            await expect(
                page.locator(
                    'main, [role="main"], .recharts-wrapper, svg.recharts-surface, h1, h2, h3',
                ).first(),
            ).toBeVisible({ timeout: MAX_PAGE_LOAD_MS });

            // Identify tab buttons — each feature page has ~6 tabs
            // Tabs are typically buttons with short descriptive text inside a
            // tab-bar-like container near the top of the page.
            const allButtons = await page.locator('button:visible').all();
            const tabButtons: typeof allButtons = [];

            for (const btn of allButtons) {
                const text = await btn.innerText().catch(() => '');
                const trimmed = text.trim();
                // Feature tabs have descriptive labels between 3–40 chars
                if (trimmed.length >= 3 && trimmed.length <= 40) {
                    tabButtons.push(btn);
                }
            }

            // Each feature should have at least 4 tab-like buttons
            expect(
                tabButtons.length,
                `${name} should have tab buttons`,
            ).toBeGreaterThanOrEqual(4);

            // Click up to 6 tabs
            const tabsToTest = tabButtons.slice(0, 6);
            for (const tab of tabsToTest) {
                await tab.click();
                // Brief wait for content transition
                await page.waitForTimeout(300);

                // Verify page didn't crash — body is still visible
                await expect(page.locator('body')).toBeVisible();
            }

            // Verify no uncaught errors occurred during tab switching
            expect(
                uncaughtErrors,
                `${name} had errors during tab switching: ${uncaughtErrors.join('; ')}`,
            ).toHaveLength(0);
        });
    }
});

// ─── v5.2 Frontier feature smoke ─────────────────────────────────────────────

const FRONTIER_MAX_PAGE_LOAD_MS = 8_000;

test.describe('v5.2 Frontier feature smoke', () => {
    test.beforeEach(async ({ page }) => {
        await enterDemoMode(page);
    });

    for (const { route, name } of NEW_FRONTIER_ROUTES) {
        test(`${name} loads and shows main content`, async ({ page }) => {
            await page.goto(`/#${route}`);
            await expect(
                page.locator('main, h1, [role="main"]').first(),
            ).toBeVisible({ timeout: FRONTIER_MAX_PAGE_LOAD_MS });
        });
    }

    for (const { route, name } of NEW_FRONTIER_ROUTES) {
        test(`${name} loads in under 8 seconds`, async ({ page }) => {
            const start = Date.now();
            await page.goto(`/#${route}`);
            await expect(
                page.locator('main, h1, [role="main"]').first(),
            ).toBeVisible({ timeout: FRONTIER_MAX_PAGE_LOAD_MS });
            const elapsed = Date.now() - start;
            expect(
                elapsed,
                `${name} took ${elapsed}ms to load (limit: ${FRONTIER_MAX_PAGE_LOAD_MS}ms)`,
            ).toBeLessThan(FRONTIER_MAX_PAGE_LOAD_MS);
        });
    }
});
