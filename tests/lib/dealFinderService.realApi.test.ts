import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchListings, generateListings } from '../../lib/trading/dealFinderService';
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

const cards: CardInventory[] = [
  {
    id: 'c1',
    player: 'Aaron Judge',
    year: 2017,
    manufacturer: 'Topps',
    set: 'Chrome',
    cardNumber: '79',
    sport: 'Baseball',
    league: 'MLB',
    condition: 'NM',
    isGraded: false,
    purchasePrice: 50,
    currentValue: 80,
  },
];

describe('dealFinderService fetchListings', () => {
  beforeEach(() => {
    vi.mocked(ebayAdapter.getMarketData).mockReset();
  });

  it('returns live eBay listings merged with mock filler when USE_REAL_EBAY', async () => {
    vi.mocked(ebayAdapter.getMarketData).mockResolvedValue({
      averagePrice: 75,
      medianPrice: 72,
      lowPrice: 60,
      highPrice: 90,
      totalListings: 3,
      soldListings: 2,
      trendPercent: 1,
      recentSales: [
        { price: 70, date: '2026-05-22T00:00:00.000Z', condition: 'Raw', title: 'Judge Chrome', itemId: 'ebay-1', isSold: false },
        { price: 68, date: '2026-05-21T00:00:00.000Z', condition: 'Raw', title: 'Judge Chrome', itemId: 'ebay-2', isSold: false },
      ],
      lastUpdated: new Date().toISOString(),
    });

    const listings = await fetchListings(cards);
    expect(listings.some((l) => l.platform === 'eBay' && l.id.startsWith('ebay_'))).toBe(true);
    expect(listings.length).toBeGreaterThan(0);
  });

  it('uses mock listings when eBay returns nothing', async () => {
    vi.mocked(ebayAdapter.getMarketData).mockResolvedValue({
      averagePrice: 0,
      medianPrice: 0,
      lowPrice: 0,
      highPrice: 0,
      totalListings: 0,
      soldListings: 0,
      trendPercent: 0,
      recentSales: [],
      lastUpdated: new Date().toISOString(),
    });

    const listings = await fetchListings(cards);
    const mockOnly = generateListings(cards);
    expect(listings.length).toBe(mockOnly.length);
  });
});
