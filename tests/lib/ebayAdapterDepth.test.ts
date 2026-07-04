import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── getMarketValue pagination ─────────────────────────────────────
//
// The Browse API caps a page at 100 items; getMarketValue aggregates up to
// `maxPages` pages (default 3) by walking the offset until a short page or
// the reported total is reached.

function makeItems(count: number, startId: number, price: number) {
  return Array.from({ length: count }, (_, i) => ({
    itemId: `v1|${startId + i}|0`,
    title: `Card ${startId + i}`,
    price: { value: String(price), currency: 'USD' },
    condition: 'PSA 10',
    itemCreationDate: '2026-06-01T00:00:00.000Z',
  }));
}

describe('ebayApi.getMarketValue pagination', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('walks pages until the reported total is collected', async () => {
    const { ebayApi } = await import('../../lib/utils/ebayApi');
    const search = vi
      .spyOn(ebayApi, 'searchSportsCards')
      .mockResolvedValueOnce({ itemSummaries: makeItems(100, 0, 100), total: 250 })
      .mockResolvedValueOnce({ itemSummaries: makeItems(100, 100, 110), total: 250 })
      .mockResolvedValueOnce({ itemSummaries: makeItems(50, 200, 120), total: 250 });

    const result = await ebayApi.getMarketValue({ playerName: 'Mike Trout' });

    expect(search).toHaveBeenCalledTimes(3);
    expect(search.mock.calls[0][0]).toMatchObject({ limit: 100, offset: 0 });
    expect(search.mock.calls[1][0]).toMatchObject({ limit: 100, offset: 100 });
    expect(search.mock.calls[2][0]).toMatchObject({ limit: 100, offset: 200 });
    expect(result.totalListings).toBe(250);
    search.mockRestore();
  });

  it('stops after one call when the first page is short', async () => {
    const { ebayApi } = await import('../../lib/utils/ebayApi');
    const search = vi
      .spyOn(ebayApi, 'searchSportsCards')
      .mockResolvedValue({ itemSummaries: makeItems(7, 0, 55), total: 7 });

    const result = await ebayApi.getMarketValue({ playerName: 'Aaron Judge' });

    expect(search).toHaveBeenCalledTimes(1);
    expect(result.totalListings).toBe(7);
    expect(result.averagePrice).toBe(55);
    search.mockRestore();
  });

  it('keeps earlier pages when a later page fails mid-walk', async () => {
    const { ebayApi } = await import('../../lib/utils/ebayApi');
    const search = vi
      .spyOn(ebayApi, 'searchSportsCards')
      .mockResolvedValueOnce({ itemSummaries: makeItems(100, 0, 100), total: 250 })
      .mockRejectedValueOnce(new Error('eBay 503 on page 2'));

    const result = await ebayApi.getMarketValue({ playerName: 'Mike Trout' });

    expect(search).toHaveBeenCalledTimes(2);
    expect(result.totalListings).toBe(100);
    expect(result.averagePrice).toBe(100);
    search.mockRestore();
  });

  it('propagates a first-page failure so callers can fall back', async () => {
    const { ebayApi } = await import('../../lib/utils/ebayApi');
    const search = vi
      .spyOn(ebayApi, 'searchSportsCards')
      .mockRejectedValue(new Error('eBay 503'));

    await expect(ebayApi.getMarketValue({ playerName: 'Aaron Judge' })).rejects.toThrow('eBay 503');
    search.mockRestore();
  });

  it('respects the maxPages cap even when more results are reported', async () => {
    const { ebayApi } = await import('../../lib/utils/ebayApi');
    const search = vi
      .spyOn(ebayApi, 'searchSportsCards')
      .mockResolvedValue({ itemSummaries: makeItems(100, 0, 80), total: 5_000 });

    await ebayApi.getMarketValue({ playerName: 'Shohei Ohtani', maxPages: 2 });

    expect(search).toHaveBeenCalledTimes(2);
    search.mockRestore();
  });
});

// ─── last-known-good comps fallback ────────────────────────────────
//
// A successful live comp set is persisted per (player, year, set, grade); a
// later live failure serves it back labeled `stale` instead of jumping to
// mock. Same env-stub hedge as integrationsSourceHonesty.test.ts — the
// assertions specific to the live path only run when the flag stuck.

describe('ebayAdapter last-known-good fallback', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    localStorage.clear();
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('serves stale last-known-good comps when live fails after a success', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    const getMarketValue = vi
      .fn()
      .mockResolvedValueOnce({
        averagePrice: 321,
        medianPrice: 300,
        priceRange: { min: 200, max: 450 },
        totalListings: 42,
        recentSales: [
          { price: 321, date: '2026-06-01T00:00:00.000Z', condition: 'PSA 10', title: 'LKG card', itemId: 'v1|1|0' },
        ],
      })
      .mockRejectedValue(new Error('eBay 503'));
    vi.doMock('../../lib/utils/ebayApi', () => ({
      ebayApi: { getMarketValue, searchSportsCards: vi.fn(), testConnection: vi.fn() },
    }));

    const { resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const params = { playerName: 'Juan Soto', cardYear: '2018', cardSet: 'Topps Update', grade: 'PSA 10' };

    const first = await ebayAdapter.getMarketData(params);
    if (isFeatureEnabled('USE_REAL_EBAY')) {
      expect(first.source).toBe('live');

      const { apiCache } = await import('../../lib/apiCache');
      apiCache.clear();

      const second = await ebayAdapter.getMarketData(params);
      expect(second.source).toBe('stale');
      expect(second.averagePrice).toBe(321);
      expect(second.recentSales[0].title).toBe('LKG card');
      expect(second.degradedReason).toContain('Live eBay request failed');
    } else {
      expect(first.source).toBe('mock');
    }
    vi.doUnmock('../../lib/utils/ebayApi');
  });

  it('still falls back to mock when live fails with no last-known-good set', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    vi.doMock('../../lib/utils/ebayApi', () => ({
      ebayApi: {
        getMarketValue: vi.fn().mockRejectedValue(new Error('eBay 503')),
        searchSportsCards: vi.fn(),
        testConnection: vi.fn(),
      },
    }));
    const { resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const result = await ebayAdapter.getMarketData({ playerName: 'Nobody Cached' });
    expect(result.source).toBe('mock');
    if (isFeatureEnabled('USE_REAL_EBAY')) {
      expect(result.degradedReason).toContain('Live eBay request failed');
    }
    vi.doUnmock('../../lib/utils/ebayApi');
  });
});

// ─── searchListings / getStatus / isLive ───────────────────────────

describe('ebayAdapter search and status surface', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    localStorage.clear();
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('searchListings returns empty mock results when the live flag is off', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const result = await ebayAdapter.searchListings({ playerName: 'Mike Trout' });
    expect(result).toEqual({ itemSummaries: [], total: 0 });
  });

  it('searchListings passes through live results and swallows live errors', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    const live = { itemSummaries: [{ itemId: 'v1|1|0', title: 'Card' }], total: 1 };
    const searchSportsCards = vi.fn().mockResolvedValueOnce(live).mockRejectedValue(new Error('503'));
    vi.doMock('../../lib/utils/ebayApi', () => ({
      ebayApi: { searchSportsCards, getMarketValue: vi.fn(), testConnection: vi.fn() },
    }));
    const { resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');

    const first = await ebayAdapter.searchListings({ playerName: 'Aaron Judge' });
    if (isFeatureEnabled('USE_REAL_EBAY')) {
      expect(first).toEqual(live);
      const { apiCache } = await import('../../lib/apiCache');
      apiCache.clear();
      const second = await ebayAdapter.searchListings({ playerName: 'Aaron Judge' });
      expect(second).toEqual({ itemSummaries: [], total: 0 });
    } else {
      expect(first).toEqual({ itemSummaries: [], total: 0 });
    }
    vi.doUnmock('../../lib/utils/ebayApi');
  });

  it('getStatus reports mock mode when the live flag is off, and isLive follows the flag', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const status = await ebayAdapter.getStatus();
    expect(status.live).toBe(false);
    expect(status.message).toContain('USE_REAL_EBAY=false');
    expect(ebayAdapter.isLive()).toBe(false);
  });

  it('getStatus surfaces the live connection check when the flag is on', async () => {
    vi.stubEnv('VITE_FF_REAL_EBAY', 'true');
    const testConnection = vi
      .fn()
      .mockResolvedValueOnce('eBay API connection successful')
      .mockResolvedValueOnce('eBay API connection failed: 401')
      .mockRejectedValueOnce(new Error('network down'));
    vi.doMock('../../lib/utils/ebayApi', () => ({
      ebayApi: { testConnection, searchSportsCards: vi.fn(), getMarketValue: vi.fn() },
    }));
    const { resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');

    if (isFeatureEnabled('USE_REAL_EBAY')) {
      expect((await ebayAdapter.getStatus()).live).toBe(true);
      expect((await ebayAdapter.getStatus()).live).toBe(false);
      const errored = await ebayAdapter.getStatus();
      expect(errored.live).toBe(false);
      expect(errored.message).toContain('Connection failed');
      expect(ebayAdapter.isLive()).toBe(true);
    }
    vi.doUnmock('../../lib/utils/ebayApi');
  });
});
