import { test, expect } from '@playwright/test';

/**
 * Run against a deployment that serves Vercel serverless routes (e.g. Vercel preview/prod).
 *
 *   PLAYWRIGHT_BASE_URL=https://your-app.vercel.app npm run test:e2e:deployed
 *
 * With Vite preview alone, tests skip (same pattern as api-health.spec.ts).
 */
test.describe('Deployed API (Vercel)', () => {
  test('GET /api/health returns MSI JSON when available', async ({ request }) => {
    const res = await request.get('/api/health');
    if (res.status() !== 200) {
      test.skip(
        true,
        'Set PLAYWRIGHT_BASE_URL to a Vercel deployment to assert /api/health (not served by Vite preview).'
      );
      return;
    }
    const ct = res.headers()['content-type'] ?? '';
    if (!ct.includes('application/json')) {
      test.skip(true, 'Expected JSON from /api/health on deployment.');
      return;
    }
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, service: 'msi' });
  });

  test('POST /api/ai/generate without auth returns 401 or 503', async ({ request }) => {
    const res = await request.post('/api/ai/generate', {
      data: { model: 'x', contents: [] },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() === 404) {
      test.skip(true, '/api/ai/generate not available on this host.');
      return;
    }
    expect([401, 503]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(body).toMatchObject({
      code: expect.stringMatching(/api_auth_required|api_auth_misconfigured/),
    });
  });

  test('POST /api/market/ebay without auth returns 401 or 503', async ({ request }) => {
    const res = await request.post('/api/market/ebay', {
      data: { action: 'search', query: 'test', limit: 1 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() === 404) {
      test.skip(true, '/api/market/ebay not available on this host.');
      return;
    }
    expect([401, 503]).toContain(res.status());
    const body = await res.json().catch(() => ({}));
    expect(body).toMatchObject({
      code: expect.stringMatching(/api_auth_required|api_auth_misconfigured/),
    });
  });

  test('POST /api/grading/psa/cert without auth returns 401 or 503', async ({ request }) => {
    const res = await request.post('/api/grading/psa/cert', {
      data: { certNumber: '12345678' },
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status() === 404) {
      test.skip(true, '/api/grading/psa/cert not available on this host.');
      return;
    }
    expect([401, 503]).toContain(res.status());
  });
});
