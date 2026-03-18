import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── BGS/SGC Adapter ─────────────────────────────────────────────

describe('bgsAdapter', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock BGS cert data when flag is off', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    const result = await bgsAdapter.verifyCert('1234567890');
    expect(result.certNumber).toBe('1234567890');
    expect(result.company).toBe('BGS');
    expect(result.verified).toBe(true);
    expect(result.player).toBeDefined();
    expect(result.grade).toBeDefined();
    expect(result.subgrades).toBeDefined();
    expect(result.subgrades!.length).toBe(4);
  });

  it('BGS subgrades have all 4 categories', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    const result = await bgsAdapter.verifyCert('9999');
    const categories = result.subgrades!.map(s => s.category).sort();
    expect(categories).toEqual(['centering', 'corners', 'edges', 'surface']);
  });

  it('returns mock BGS pop report', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    const result = await bgsAdapter.getPopReport('LeBron James', '2003', 'Prizm');
    expect(result.player).toBe('LeBron James');
    expect(result.company).toBe('BGS');
    expect(result.grades.length).toBeGreaterThan(0);
    expect(result.totalGraded).toBeGreaterThan(0);
  });

  it('isLive returns false when flag is off', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    expect(bgsAdapter.isLive()).toBe(false);
  });

  it('getCompany returns BGS', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    expect(bgsAdapter.getCompany()).toBe('BGS');
  });

  it('caches cert results', async () => {
    const { bgsAdapter } = await import('../../lib/integrations/bgsAdapter');
    const r1 = await bgsAdapter.verifyCert('555');
    const r2 = await bgsAdapter.verifyCert('555');
    expect(r1).toEqual(r2);
  });
});

describe('sgcAdapter', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock SGC cert data', async () => {
    const { sgcAdapter } = await import('../../lib/integrations/bgsAdapter');
    const result = await sgcAdapter.verifyCert('7777');
    expect(result.company).toBe('SGC');
    expect(result.verified).toBe(true);
    expect(result.subgrades).toBeUndefined(); // SGC doesn't have subgrades
  });

  it('getCompany returns SGC', async () => {
    const { sgcAdapter } = await import('../../lib/integrations/bgsAdapter');
    expect(sgcAdapter.getCompany()).toBe('SGC');
  });
});

// ─── Sports Data Adapter ─────────────────────────────────────────

describe('sportsDataAdapter', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns known player profile for Mike Trout', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const player = await sportsDataAdapter.getPlayer('Mike Trout');
    expect(player.name).toBe('Mike Trout');
    expect(player.sport).toBe('baseball');
    expect(player.league).toBe('MLB');
    expect(player.team).toContain('Angels');
    expect(player.isActive).toBe(true);
  });

  it('returns known player profile for LeBron James', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const player = await sportsDataAdapter.getPlayer('LeBron James');
    expect(player.name).toBe('LeBron James');
    expect(player.sport).toBe('basketball');
    expect(player.league).toBe('NBA');
  });

  it('generates mock profile for unknown player', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const player = await sportsDataAdapter.getPlayer('Fake Player XYZ');
    expect(player.name).toBe('Fake Player XYZ');
    expect(player.firstName).toBe('Fake');
    expect(player.isActive).toBe(true);
  });

  it('returns player stats', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const stats = await sportsDataAdapter.getStats('mlb-545361', '2024');
    expect(stats.playerId).toBe('mlb-545361');
    expect(stats.season).toBe('2024');
    expect(stats.gamesPlayed).toBeGreaterThan(0);
    expect(['up', 'down', 'stable']).toContain(stats.trending);
  });

  it('returns recent game events', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const events = await sportsDataAdapter.getRecentEvents('Shohei Ohtani', 'baseball');
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].playerName).toBe('Shohei Ohtani');
    expect(events[0].sport).toBe('baseball');
    expect(events[0].impactScore).toBeGreaterThanOrEqual(0);
    expect(events[0].impactScore).toBeLessThanOrEqual(100);
  });

  it('calculates price impact with recommendation', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    const impact = await sportsDataAdapter.getPriceImpact('Patrick Mahomes', 'football');
    expect(impact.events.length).toBeGreaterThan(0);
    expect(['buy', 'sell', 'hold']).toContain(impact.recommendation);
    expect(typeof impact.totalImpactPercent).toBe('number');
  });

  it('isLive returns false when flag is off', async () => {
    const { sportsDataAdapter } = await import('../../lib/integrations/sportsDataAdapter');
    expect(sportsDataAdapter.isLive()).toBe(false);
  });
});

// ─── COMC/MySlabs Adapter ────────────────────────────────────────

describe('comcAdapter', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock COMC listings', async () => {
    const { comcAdapter } = await import('../../lib/integrations/comcAdapter');
    const listings = await comcAdapter.searchListings({ playerName: 'Mike Trout' });
    expect(listings.length).toBeGreaterThan(0);
    expect(listings[0].source).toBe('comc');
    expect(listings[0].price).toBeGreaterThan(0);
    expect(listings[0].title).toContain('Mike Trout');
  });

  it('returns mock COMC price aggregate', async () => {
    const { comcAdapter } = await import('../../lib/integrations/comcAdapter');
    const prices = await comcAdapter.getPriceAggregate({ playerName: 'Ohtani' });
    expect(prices.averagePrice).toBeGreaterThan(0);
    expect(prices.sources).toContain('comc');
    expect(prices.lastUpdated).toBeDefined();
  });

  it('isLive returns false when flag is off', async () => {
    const { comcAdapter } = await import('../../lib/integrations/comcAdapter');
    expect(comcAdapter.isLive()).toBe(false);
  });

  it('getSource returns comc', async () => {
    const { comcAdapter } = await import('../../lib/integrations/comcAdapter');
    expect(comcAdapter.getSource()).toBe('comc');
  });

  it('getStatus reports mock mode', async () => {
    const { comcAdapter } = await import('../../lib/integrations/comcAdapter');
    const status = await comcAdapter.getStatus();
    expect(status.live).toBe(false);
    expect(status.marketplace).toBe('comc');
  });
});

describe('myslabsAdapter', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('returns mock MySlabs listings', async () => {
    const { myslabsAdapter } = await import('../../lib/integrations/comcAdapter');
    const listings = await myslabsAdapter.searchListings({ playerName: 'Aaron Judge' });
    expect(listings.length).toBeGreaterThan(0);
    expect(listings[0].source).toBe('myslabs');
  });

  it('getSource returns myslabs', async () => {
    const { myslabsAdapter } = await import('../../lib/integrations/comcAdapter');
    expect(myslabsAdapter.getSource()).toBe('myslabs');
  });
});

// ─── Multi-marketplace Aggregation ───────────────────────────────

describe('searchAllMarketplaces', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('merges results from COMC and MySlabs', async () => {
    const { searchAllMarketplaces } = await import('../../lib/integrations/comcAdapter');
    const result = await searchAllMarketplaces({ playerName: 'Trout' });
    expect(result.listings.length).toBeGreaterThan(0);
    expect(result.bySource.comc.length).toBeGreaterThan(0);
    expect(result.bySource.myslabs.length).toBeGreaterThan(0);
    // Should be sorted by price ascending
    for (let i = 1; i < result.listings.length; i++) {
      expect(result.listings[i].price).toBeGreaterThanOrEqual(result.listings[i - 1].price);
    }
  });
});

describe('aggregateMarketplacePrices', () => {
  beforeEach(async () => {
    const { resetFeatureFlags } = await import('../../lib/featureFlags');
    resetFeatureFlags();
    const { apiCache } = await import('../../lib/apiCache');
    apiCache.clear();
  });

  it('aggregates pricing across marketplaces', async () => {
    const { aggregateMarketplacePrices } = await import('../../lib/integrations/comcAdapter');
    const result = await aggregateMarketplacePrices({ playerName: 'Wembanyama' });
    expect(result.averagePrice).toBeGreaterThan(0);
    expect(result.sources.length).toBeGreaterThanOrEqual(1);
    expect(result.lastUpdated).toBeDefined();
  });
});

// ─── New Zod Schemas ─────────────────────────────────────────────

describe('new Zod schemas', () => {
  it('BGSCertResponseSchema validates correct data', async () => {
    const { BGSCertResponseSchema } = await import('../../lib/schemas');
    const valid = {
      certNumber: '9876543',
      company: 'BGS',
      verified: true,
      grade: '9.5',
      subgrades: [
        { category: 'centering', grade: 9.5 },
        { category: 'corners', grade: 10 },
        { category: 'edges', grade: 9.5 },
        { category: 'surface', grade: 9.5 },
      ],
      lookupDate: new Date().toISOString(),
    };
    expect(BGSCertResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('BGSCertResponseSchema rejects invalid company', async () => {
    const { BGSCertResponseSchema } = await import('../../lib/schemas');
    const invalid = {
      certNumber: '123',
      company: 'FAKE',
      verified: true,
      lookupDate: new Date().toISOString(),
    };
    expect(BGSCertResponseSchema.safeParse(invalid).success).toBe(false);
  });

  it('BGSSubgradeSchema rejects out-of-range grade', async () => {
    const { BGSSubgradeSchema } = await import('../../lib/schemas');
    expect(BGSSubgradeSchema.safeParse({ category: 'corners', grade: 11 }).success).toBe(false);
    expect(BGSSubgradeSchema.safeParse({ category: 'corners', grade: 0 }).success).toBe(false);
  });

  it('PlayerProfileSchema validates complete profile', async () => {
    const { PlayerProfileSchema } = await import('../../lib/schemas');
    const profile = {
      id: 'mlb-123',
      name: 'Test Player',
      firstName: 'Test',
      lastName: 'Player',
      sport: 'baseball',
      league: 'MLB',
      team: 'Test Team',
      position: 'SS',
      isRookie: true,
      isActive: true,
      experience: 0,
      externalIds: { mlbId: 123 },
    };
    expect(PlayerProfileSchema.safeParse(profile).success).toBe(true);
  });

  it('PlayerStatsSummarySchema validates stats', async () => {
    const { PlayerStatsSummarySchema } = await import('../../lib/schemas');
    const stats = {
      playerId: 'p1',
      season: '2024',
      gamesPlayed: 150,
      stats: { avg: '.300', hr: 40, rbi: 100 },
      performanceRating: 92,
      trending: 'up',
    };
    expect(PlayerStatsSummarySchema.safeParse(stats).success).toBe(true);
  });

  it('PlayerStatsSummarySchema rejects invalid trending', async () => {
    const { PlayerStatsSummarySchema } = await import('../../lib/schemas');
    const stats = {
      playerId: 'p1', season: '2024', gamesPlayed: 10,
      stats: {}, performanceRating: 50, trending: 'sideways',
    };
    expect(PlayerStatsSummarySchema.safeParse(stats).success).toBe(false);
  });
});

// ─── Integrations Index ──────────────────────────────────────────

describe('integrations index', () => {
  it('exports all adapters', async () => {
    const integrations = await import('../../lib/integrations/index');
    expect(integrations.psaAdapter).toBeDefined();
    expect(integrations.ebayAdapter).toBeDefined();
    expect(integrations.bgsAdapter).toBeDefined();
    expect(integrations.sgcAdapter).toBeDefined();
    expect(integrations.sportsDataAdapter).toBeDefined();
    expect(integrations.comcAdapter).toBeDefined();
    expect(integrations.myslabsAdapter).toBeDefined();
    expect(integrations.searchAllMarketplaces).toBeDefined();
    expect(integrations.aggregateMarketplacePrices).toBeDefined();
  });
});
