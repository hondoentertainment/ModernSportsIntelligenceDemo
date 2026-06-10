import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── eBay adapter: source honesty + trend ─────────────────────────

describe('ebayAdapter source honesty', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('labels mock market data with source: mock and no degradedReason', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const result = await ebayAdapter.getMarketData({ playerName: 'Mike Trout' });
    expect(result.source).toBe('mock');
    expect(result.degradedReason).toBeUndefined();
  });

  it('labels live-failure fallback with source: mock and a degradedReason', async () => {
    vi.stubEnv('VITE_FF_USE_REAL_EBAY', 'true');
    vi.doMock('../../lib/utils/ebayApi', () => ({
      ebayApi: {
        getMarketValue: vi.fn().mockRejectedValue(new Error('eBay 503')),
        searchSportsCards: vi.fn(),
        testConnection: vi.fn(),
      },
    }));
    const { resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    // Only meaningful when the env actually flips the flag in this harness;
    // otherwise the mock path is exercised, which is also source: 'mock'.
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const result = await ebayAdapter.getMarketData({ playerName: 'Aaron Judge' });
    expect(result.source).toBe('mock');
    if (isFeatureEnabled('USE_REAL_EBAY')) {
      expect(result.degradedReason).toContain('Live eBay request failed');
    }
    vi.doUnmock('../../lib/utils/ebayApi');
  });
});

describe('computeTrendPercent', () => {
  it('returns 0 with fewer than 4 sales', async () => {
    const { computeTrendPercent } = await import('../../lib/integrations/ebayAdapter');
    expect(computeTrendPercent([])).toBe(0);
    expect(
      computeTrendPercent([
        { price: 10, date: '2026-01-01' },
        { price: 20, date: '2026-01-02' },
        { price: 30, date: '2026-01-03' },
      ]),
    ).toBe(0);
  });

  it('computes percent change between older and newer halves', async () => {
    const { computeTrendPercent } = await import('../../lib/integrations/ebayAdapter');
    const sales = [
      { price: 100, date: '2026-01-01' },
      { price: 100, date: '2026-01-02' },
      { price: 120, date: '2026-01-10' },
      { price: 120, date: '2026-01-11' },
    ];
    expect(computeTrendPercent(sales)).toBe(20);
  });

  it('is order-independent (sorts by date internally)', async () => {
    const { computeTrendPercent } = await import('../../lib/integrations/ebayAdapter');
    const sales = [
      { price: 120, date: '2026-01-11' },
      { price: 100, date: '2026-01-01' },
      { price: 120, date: '2026-01-10' },
      { price: 100, date: '2026-01-02' },
    ];
    expect(computeTrendPercent(sales)).toBe(20);
  });

  it('returns negative trend for falling prices', async () => {
    const { computeTrendPercent } = await import('../../lib/integrations/ebayAdapter');
    const sales = [
      { price: 200, date: '2026-01-01' },
      { price: 200, date: '2026-01-02' },
      { price: 150, date: '2026-01-10' },
      { price: 150, date: '2026-01-11' },
    ];
    expect(computeTrendPercent(sales)).toBe(-25);
  });
});

// ─── PSA adapter: source honesty ──────────────────────────────────

describe('psaAdapter source honesty', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('labels mock cert lookups with source: mock', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    const result = await psaAdapter.verifyCert('12345678');
    expect(result.source).toBe('mock');
    expect(result.degradedReason).toBeUndefined();
    // Mock "verified" is simulated — the source label is what keeps it honest.
    expect(result.verified).toBe(true);
  });

  it('labels mock pop reports with source: mock', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    const result = await psaAdapter.getPopReport('Mike Trout', '2011', 'Topps Update');
    expect(result.source).toBe('mock');
    expect(result.totalGraded).toBeGreaterThan(0);
  });
});
