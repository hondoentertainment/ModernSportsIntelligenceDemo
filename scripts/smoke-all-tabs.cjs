#!/usr/bin/env node
/**
 * Smoke-test every tab/route declared in NAV_ITEMS by visiting it under
 * a single demo-logged-in browser context and recording any pages that
 * crash, throw uncaught errors, or fail to render meaningful content.
 *
 * Run against a running preview server (default http://localhost:4173).
 * Override with SMOKE_BASE_URL=http://localhost:3000 for the dev server.
 */
const fs = require('fs');
const path = require('path');

// Use Playwright's library API (chromium.launch), not the test runner.
const { chromium } = require('playwright');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:4173';
const ROUTE_TIMEOUT_MS = Number(process.env.SMOKE_ROUTE_TIMEOUT_MS || 15000);
const ONLY = process.env.SMOKE_ONLY ? process.env.SMOKE_ONLY.split(',').map(s => s.trim()) : null;

function extractNavRoutes() {
    const src = fs.readFileSync(path.join(__dirname, '..', 'constants.tsx'), 'utf8');
    // Match NAV_ITEMS array
    const start = src.indexOf('export const NAV_ITEMS');
    if (start === -1) throw new Error('NAV_ITEMS not found in constants.tsx');
    const end = src.indexOf('];', start);
    const block = src.slice(start, end + 2);
    // Use [\s\S] (any char incl. newline) so JSX icon nodes between props don't trip us up.
    const re = /\{\s*id:\s*'([^']+)'\s*,\s*label:\s*['"]([^'"]+)['"][\s\S]*?path:\s*'([^']+)'/g;
    const out = [];
    let m;
    while ((m = re.exec(block))) {
        out.push({ id: m[1], label: m[2], path: m[3] });
    }
    // De-dupe by path (some ids appear with different labels for same path)
    const seen = new Set();
    return out.filter(r => {
        if (seen.has(r.path)) return false;
        seen.add(r.path);
        return true;
    });
}

async function ensureDemoLogin(page) {
    await page.goto(`${BASE_URL}/#/login`, { waitUntil: 'domcontentloaded' });
    // Try the demo button; fall back to direct localStorage flag if not visible.
    const demoBtn = page.getByRole('button', { name: /enter demo mode|^demo$/i });
    try {
        await demoBtn.waitFor({ state: 'visible', timeout: 8000 });
        await demoBtn.click();
    } catch {
        // Demo button not present — Supabase likely configured. Use evaluate to
        // seed a demo session token so ProtectedRoute lets us through.
        await page.evaluate(() => {
            localStorage.setItem('msi_demo_session', 'true');
        });
        await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    }
    await page.waitForURL(/#\/?$/, { timeout: 15000 }).catch(() => { });
    // Wait for dashboard surface to indicate auth is settled.
    await page.locator('main, [role="main"], aside').first().waitFor({ state: 'visible', timeout: 15000 });
}

async function visitRoute(page, route) {
    const errors = [];
    const onPageError = (err) => errors.push(`pageerror: ${err.message}`);
    const onConsoleError = (msg) => {
        if (msg.type() !== 'error') return;
        const text = msg.text();
        // Ignore noisy non-fatal stuff (network 4xx, vendor logs)
        if (/Failed to load resource|favicon|net::ERR_/i.test(text)) return;
        if (/ChunkLoadError|Loading chunk|dynamically imported|Uncaught|TypeError|ReferenceError|SyntaxError/i.test(text)) {
            errors.push(`console: ${text}`);
        }
    };
    page.on('pageerror', onPageError);
    page.on('console', onConsoleError);

    let status = 'ok';
    let detail = '';
    try {
        await page.goto(`${BASE_URL}/#${route.path}`, { waitUntil: 'domcontentloaded', timeout: ROUTE_TIMEOUT_MS });
        // Wait for any of: main content, an h1/h2/h3, or chart surface.
        await page.locator('main, [role="main"], h1, h2, h3, .recharts-wrapper, svg.recharts-surface').first().waitFor({ state: 'visible', timeout: ROUTE_TIMEOUT_MS });
        // Give async lazy chunks a moment to settle and detect runtime errors.
        await page.waitForTimeout(500);

        // Detect either error boundary rendering (Global or Lazy)
        const errorBoundaryText = await page.locator('text=/Something went wrong|Connection Error/i').first().isVisible().catch(() => false);
        if (errorBoundaryText) {
            status = 'error-boundary';
            detail = 'Error boundary rendered';
        }
    } catch (e) {
        status = 'timeout';
        detail = e.message.split('\n')[0];
    } finally {
        page.off('pageerror', onPageError);
        page.off('console', onConsoleError);
    }

    if (status === 'ok' && errors.length > 0) {
        status = 'errors';
        detail = errors.slice(0, 3).join(' | ');
    }
    return { status, detail, errors };
}

(async () => {
    const allRoutes = extractNavRoutes();
    const routes = ONLY ? allRoutes.filter(r => ONLY.includes(r.path) || ONLY.includes(r.id)) : allRoutes;
    console.log(`[smoke] Testing ${routes.length} unique routes against ${BASE_URL}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        await ensureDemoLogin(page);
        console.log('[smoke] Demo login complete');
    } catch (e) {
        console.error('[smoke] Demo login failed:', e.message);
        await browser.close();
        process.exit(2);
    }

    const results = [];
    let pass = 0, fail = 0;
    let idx = 0;
    for (const route of routes) {
        idx++;
        const r = await visitRoute(page, route);
        results.push({ ...route, ...r });
        const icon = r.status === 'ok' ? 'PASS' : 'FAIL';
        if (r.status === 'ok') pass++; else fail++;
        const detail = r.detail ? ` — ${r.detail}` : '';
        console.log(`[${idx.toString().padStart(3, ' ')}/${routes.length}] ${icon} ${route.path} (${route.label})${detail}`);
    }

    await browser.close();

    const reportPath = path.join(__dirname, '..', 'smoke-all-tabs-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ baseUrl: BASE_URL, total: routes.length, pass, fail, results }, null, 2));
    console.log(`\n[smoke] Wrote report: ${reportPath}`);
    console.log(`[smoke] Pass: ${pass}  Fail: ${fail}`);

    if (fail > 0) {
        console.log('\n[smoke] Failing routes:');
        results.filter(r => r.status !== 'ok').forEach(r => {
            console.log(` - ${r.path} [${r.status}] ${r.detail}`);
        });
        process.exit(1);
    }
})().catch((e) => {
    console.error('[smoke] Fatal:', e);
    process.exit(2);
});
