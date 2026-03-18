import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Feature Flags ───────────────────────────────────────────────

describe('featureFlags', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
  });

  it('all flags default to false', async () => {
    const { getFeatureFlags } = await import('../../lib/featureFlags');
    const flags = getFeatureFlags();
    expect(flags.USE_REAL_EBAY).toBe(false);
    expect(flags.USE_REAL_PSA).toBe(false);
    expect(flags.USE_REAL_BGS).toBe(false);
    expect(flags.USE_REAL_SPORTS).toBe(false);
    expect(flags.USE_REAL_COMC).toBe(false);
    expect(flags.USE_REAL_GEMINI).toBe(false);
  });

  it('setFeatureFlag overrides a flag', async () => {
    const { getFeatureFlags, setFeatureFlag, isFeatureEnabled } = await import('../../lib/featureFlags');
    setFeatureFlag('USE_REAL_EBAY', true);
    expect(isFeatureEnabled('USE_REAL_EBAY')).toBe(true);
    expect(getFeatureFlags().USE_REAL_EBAY).toBe(true);
  });

  it('resetFeatureFlags restores defaults', async () => {
    const { setFeatureFlag, resetFeatureFlags, isFeatureEnabled } = await import('../../lib/featureFlags');
    setFeatureFlag('USE_REAL_PSA', true);
    expect(isFeatureEnabled('USE_REAL_PSA')).toBe(true);
    resetFeatureFlags();
    expect(isFeatureEnabled('USE_REAL_PSA')).toBe(false);
  });
});

// ─── API Cache ───────────────────────────────────────────────────

describe('ApiCache', () => {
  let ApiCache: typeof import('../../lib/apiCache').ApiCache;

  beforeEach(async () => {
    const mod = await import('../../lib/apiCache');
    ApiCache = mod.ApiCache;
  });

  it('stores and retrieves values', () => {
    const cache = new ApiCache();
    cache.set('key1', { foo: 'bar' });
    expect(cache.get('key1')).toEqual({ foo: 'bar' });
  });

  it('returns undefined for missing keys', () => {
    const cache = new ApiCache();
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('expires entries after TTL', () => {
    const cache = new ApiCache({ defaultTtlMs: 50 });
    cache.set('key1', 'value');
    // Manually expire by mocking time
    vi.useFakeTimers();
    vi.advanceTimersByTime(100);
    expect(cache.get('key1')).toBeUndefined();
    vi.useRealTimers();
  });

  it('respects per-key TTL override', () => {
    vi.useFakeTimers();
    const cache = new ApiCache({ defaultTtlMs: 10000 });
    cache.set('short', 'value', 50);
    vi.advanceTimersByTime(100);
    expect(cache.get('short')).toBeUndefined();
    vi.useRealTimers();
  });

  it('evicts LRU when at capacity', () => {
    const cache = new ApiCache({ maxEntries: 3 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('d')).toBe(4);
  });

  it('getOrFetch caches the result', async () => {
    const cache = new ApiCache();
    const fetcher = vi.fn().mockResolvedValue('fetched');

    const r1 = await cache.getOrFetch('k', fetcher);
    const r2 = await cache.getOrFetch('k', fetcher);

    expect(r1).toBe('fetched');
    expect(r2).toBe('fetched');
    expect(fetcher).toHaveBeenCalledTimes(1); // second call served from cache
  });

  it('tracks hit/miss stats', () => {
    const cache = new ApiCache();
    cache.set('x', 1);
    cache.get('x'); // hit
    cache.get('y'); // miss
    cache.get('x'); // hit

    const stats = cache.getStats();
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBeCloseTo(2/3);
  });

  it('has() returns false for expired entries', () => {
    vi.useFakeTimers();
    const cache = new ApiCache({ defaultTtlMs: 50 });
    cache.set('k', 'v');
    expect(cache.has('k')).toBe(true);
    vi.advanceTimersByTime(100);
    expect(cache.has('k')).toBe(false);
    vi.useRealTimers();
  });

  it('clear resets everything', () => {
    const cache = new ApiCache();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.getStats().hits).toBe(0);
    expect(cache.getStats().size).toBe(0);
  });

  it('purgeExpired removes stale entries', () => {
    vi.useFakeTimers();
    const cache = new ApiCache({ defaultTtlMs: 50 });
    cache.set('a', 1);
    cache.set('b', 2, 200); // longer TTL
    vi.advanceTimersByTime(100);
    const purged = cache.purgeExpired();
    expect(purged).toBe(1); // only 'a' expired
    expect(cache.has('b')).toBe(true);
    vi.useRealTimers();
  });
});

// ─── Zod Schemas (new additions) ─────────────────────────────────

describe('schemas', () => {
  it('PSACertResponseSchema validates correct data', async () => {
    const { PSACertResponseSchema } = await import('../../lib/schemas');
    const valid = {
      certNumber: '12345678',
      verified: true,
      grade: '10',
      player: 'Mike Trout',
      lookupDate: new Date().toISOString(),
    };
    expect(PSACertResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('PSACertResponseSchema rejects missing required fields', async () => {
    const { PSACertResponseSchema } = await import('../../lib/schemas');
    expect(PSACertResponseSchema.safeParse({ verified: true }).success).toBe(false); // missing certNumber
  });

  it('PopulationReportSchema validates complete report', async () => {
    const { PopulationReportSchema } = await import('../../lib/schemas');
    const report = {
      year: '2023',
      brand: 'Topps',
      set: 'Chrome',
      cardNumber: '1',
      player: 'Ohtani',
      grades: [{ grade: '10', count: 100 }, { grade: '9', count: 500 }],
      totalGraded: 600,
      lastUpdated: new Date().toISOString(),
    };
    expect(PopulationReportSchema.safeParse(report).success).toBe(true);
  });

  it('MarketListingSchema validates listing', async () => {
    const { MarketListingSchema } = await import('../../lib/schemas');
    const listing = {
      id: 'abc123',
      source: 'ebay',
      title: 'Test Card',
      price: 99.99,
      condition: 'Near Mint',
      isSold: false,
    };
    expect(MarketListingSchema.safeParse(listing).success).toBe(true);
  });

  it('MarketListingSchema rejects invalid source', async () => {
    const { MarketListingSchema } = await import('../../lib/schemas');
    const listing = {
      id: 'abc',
      source: 'amazon', // not a valid source
      title: 'Test',
      price: 10,
      condition: 'Good',
      isSold: false,
    };
    expect(MarketListingSchema.safeParse(listing).success).toBe(false);
  });

  it('GameEventSchema validates event', async () => {
    const { GameEventSchema } = await import('../../lib/schemas');
    const event = {
      id: 'evt1',
      type: 'milestone',
      playerId: 'p1',
      playerName: 'Trout',
      sport: 'baseball',
      headline: '500th HR',
      description: 'Hit 500th career home run',
      impactScore: 95,
      priceImpactPercent: 15.5,
      timestamp: new Date().toISOString(),
      source: 'espn',
    };
    expect(GameEventSchema.safeParse(event).success).toBe(true);
  });

  it('PriceAggregateSchema validates aggregate', async () => {
    const { PriceAggregateSchema } = await import('../../lib/schemas');
    const agg = {
      averagePrice: 150.50,
      medianPrice: 145,
      lowPrice: 100,
      highPrice: 250,
      totalListings: 50,
      soldListings: 35,
      trendPercent: 5.2,
      lastUpdated: new Date().toISOString(),
    };
    expect(PriceAggregateSchema.safeParse(agg).success).toBe(true);
  });
});

// ─── PSA Adapter ─────────────────────────────────────────────────

describe('psaAdapter', () => {
  beforeEach(async () => {
    vi.resetModules();
    // Ensure flags are off (mock mode)
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    // Clear cache
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock cert data when flag is off', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    const result = await psaAdapter.verifyCert('12345678');
    expect(result.certNumber).toBe('12345678');
    expect(result.verified).toBe(true);
    expect(result.player).toBeDefined();
    expect(result.grade).toBeDefined();
  });

  it('returns mock pop report when flag is off', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    const result = await psaAdapter.getPopReport('Mike Trout', '2023', 'Chrome');
    expect(result.player).toBe('Mike Trout');
    expect(result.grades.length).toBeGreaterThan(0);
    expect(result.totalGraded).toBeGreaterThan(0);
  });

  it('isLive returns false when flag is off', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    expect(psaAdapter.isLive()).toBe(false);
  });

  it('caches cert lookup results', async () => {
    const { psaAdapter } = await import('../../lib/integrations/psaAdapter');
    const r1 = await psaAdapter.verifyCert('99999');
    const r2 = await psaAdapter.verifyCert('99999');
    // Same reference means it was served from cache
    expect(r1).toEqual(r2);
  });
});

// ─── eBay Adapter ────────────────────────────────────────────────

describe('ebayAdapter', () => {
  beforeEach(async () => {
    vi.resetModules();
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock market data when flag is off', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const result = await ebayAdapter.getMarketData({ playerName: 'Mike Trout' });
    expect(result.averagePrice).toBeGreaterThan(0);
    expect(result.recentSales.length).toBeGreaterThan(0);
    expect(result.lastUpdated).toBeDefined();
  });

  it('isLive returns false when flag is off', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    expect(ebayAdapter.isLive()).toBe(false);
  });

  it('getStatus reports mock mode', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const status = await ebayAdapter.getStatus();
    expect(status.live).toBe(false);
    expect(status.message).toContain('mock');
  });

  it('caches market data results', async () => {
    const { ebayAdapter } = await import('../../lib/integrations/ebayAdapter');
    const r1 = await ebayAdapter.getMarketData({ playerName: 'Ohtani', cardYear: '2023' });
    const r2 = await ebayAdapter.getMarketData({ playerName: 'Ohtani', cardYear: '2023' });
    expect(r1).toEqual(r2);
  });
});

// ─── CACHE_TTL constants ─────────────────────────────────────────

describe('CACHE_TTL', () => {
  it('has expected TTL values', async () => {
    const { CACHE_TTL } = await import('../../lib/apiCache');
    expect(CACHE_TTL.PRICE_REALTIME).toBe(2 * 60 * 1000);
    expect(CACHE_TTL.CERT_VERIFICATION).toBe(24 * 60 * 60 * 1000);
    expect(CACHE_TTL.POP_REPORT).toBe(6 * 60 * 60 * 1000);
  });
});
