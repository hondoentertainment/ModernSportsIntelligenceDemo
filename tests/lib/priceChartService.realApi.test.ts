import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPriceHistory, generatePriceHistory, resolveFallbackPriceSeries } from '../../lib/analytics/priceChartService';
import type { CardInventory } from '../../types';

vi.mock('../../lib/integrations/ebayAdapter', () => ({
  ebayAdapter: {
    getMarketData: vi.fn(),
  },
}));

vi.mock('../../lib/featureFlags', () => ({
  isFeatureEnabled: vi.fn((flag: string) => flag === 'USE_REAL_EBAY'),
}));

import { ebayAdapter } from '../../lib/integrations/ebayAdapter';

const daysAgo = (offset: number) => new Date(Date.now() - offset * 86_400_000).toISOString();

const sampleCard: CardInventory = {
  id: 'card-1',
  player: 'Mike Trout',
  year: 2011,
  manufacturer: 'Topps',
  set: 'Update',
  cardNumber: 'US175',
  sport: 'Baseball',
  league: 'MLB',
  condition: 'NM',
  isGraded: true,
  grade: 'PSA 10',
  purchasePrice: 100,
  currentValue: 150,
  purchaseDate: '2020-01-01',
};

describe('priceChartService getPriceHistory', () => {
  beforeEach(() => {
    vi.mocked(ebayAdapter.getMarketData).mockReset();
  });

  it('uses eBay sales when USE_REAL_EBAY and enough comps exist', async () => {
    vi.mocked(ebayAdapter.getMarketData).mockResolvedValue({
      averagePrice: 120,
      medianPrice: 115,
      lowPrice: 100,
      highPrice: 140,
      totalListings: 5,
      soldListings: 5,
      trendPercent: 2,
      recentSales: [
        { price: 110, date: daysAgo(3), condition: 'PSA 10', title: 'Trout', itemId: '1', isSold: true },
        { price: 115, date: daysAgo(2), condition: 'PSA 10', title: 'Trout', itemId: '2', isSold: true },
        { price: 120, date: daysAgo(1), condition: 'PSA 10', title: 'Trout', itemId: '3', isSold: true },
      ],
      lastUpdated: new Date().toISOString(),
    });

    const history = await getPriceHistory(sampleCard, '1M');
    expect(history.length).toBeGreaterThanOrEqual(3);
    expect(history[0].source).toBe('market');
    expect(ebayAdapter.getMarketData).toHaveBeenCalled();
    await expect(resolveFallbackPriceSeries(sampleCard, '1M')).resolves.toMatchObject({ kind: 'comps' });
  });

  it('falls back to simulated history when eBay returns too few sales', async () => {
    vi.mocked(ebayAdapter.getMarketData).mockResolvedValue({
      averagePrice: 120,
      medianPrice: 115,
      lowPrice: 100,
      highPrice: 140,
      totalListings: 1,
      soldListings: 1,
      trendPercent: 0,
      recentSales: [
        { price: 110, date: daysAgo(1), condition: 'PSA 10', title: 'Trout', itemId: '1', isSold: true },
      ],
      lastUpdated: new Date().toISOString(),
    });

    const history = await getPriceHistory(sampleCard, '1M');
    const simulated = generatePriceHistory(sampleCard, '1M');
    expect(history.length).toBe(simulated.length);
    await expect(resolveFallbackPriceSeries(sampleCard, '1M')).resolves.toMatchObject({ kind: 'simulated' });
  });

  it('does not call eBay comps for a demo fallback', async () => {
    const series = await resolveFallbackPriceSeries(sampleCard, '1M', { allowComps: false });
    expect(series.kind).toBe('simulated');
    expect(ebayAdapter.getMarketData).not.toHaveBeenCalled();
  });
});
