import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scoreDeal,
  findDeals,
  findArbitrage,
  getDealAlerts,
  getDealSummary,
  generateListings,
  loadPrefs,
  savePrefs,
  getDealHistory,
  logDealAction,
  PLATFORM_FEES,
} from '../../lib/trading/dealFinderService';
import type { MarketplaceListing, Deal } from '../../lib/trading/dealFinderService';
import { makeCard, setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

function makeListing(overrides: Partial<MarketplaceListing> = {}): MarketplaceListing {
  return {
    id: 'listing-1',
    cardId: 'card-1',
    player: 'Mike Trout',
    cardDescription: '2023 Topps Chrome #1',
    sport: 'Baseball',
    platform: 'eBay',
    listPrice: 80,
    fairValue: 100,
    condition: 'Near Mint',
    isGraded: true,
    grade: 'PSA 10',
    sellerRating: 95,
    listingAge: 2,
    ...overrides,
  };
}

describe('dealFinderService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('PLATFORM_FEES', () => {
    it('contains expected platforms', () => {
      expect(PLATFORM_FEES).toHaveProperty('eBay');
      expect(PLATFORM_FEES).toHaveProperty('COMC');
      expect(PLATFORM_FEES).toHaveProperty('Private');
    });

    it('Private has zero fee', () => {
      expect(PLATFORM_FEES.Private).toBe(0);
    });

    it('all fees are between 0 and 1', () => {
      for (const [, fee] of Object.entries(PLATFORM_FEES)) {
        expect(fee).toBeGreaterThanOrEqual(0);
        expect(fee).toBeLessThan(1);
      }
    });
  });

  describe('scoreDeal', () => {
    it('returns 0 score for zero fair value', () => {
      const listing = makeListing({ listPrice: 50 });
      const result = scoreDeal(listing, 0);
      expect(result.dealScore).toBe(0);
      expect(result.savingsAmount).toBe(0);
    });

    it('returns higher score for bigger discount', () => {
      const listing1 = makeListing({ listPrice: 90 });
      const listing2 = makeListing({ listPrice: 50 });
      const score1 = scoreDeal(listing1, 100);
      const score2 = scoreDeal(listing2, 100);
      expect(score2.dealScore).toBeGreaterThan(score1.dealScore);
    });

    it('calculates savings amount and percent correctly', () => {
      const listing = makeListing({ listPrice: 80 });
      const result = scoreDeal(listing, 100);
      expect(result.savingsAmount).toBe(20);
      expect(result.savingsPercent).toBe(20);
    });

    it('returns negative savings for overpriced listings', () => {
      const listing = makeListing({ listPrice: 120 });
      const result = scoreDeal(listing, 100);
      expect(result.savingsAmount).toBeLessThan(0);
    });

    it('score is always between 0 and 100', () => {
      // Extremely overpriced
      const over = scoreDeal(makeListing({ listPrice: 500 }), 100);
      expect(over.dealScore).toBeGreaterThanOrEqual(0);
      expect(over.dealScore).toBeLessThanOrEqual(100);

      // Extremely underpriced
      const under = scoreDeal(makeListing({ listPrice: 1, sellerRating: 100, listingAge: 0 }), 1000);
      expect(under.dealScore).toBeGreaterThanOrEqual(0);
      expect(under.dealScore).toBeLessThanOrEqual(100);
    });
  });

  describe('findDeals', () => {
    it('returns empty array for empty listings', () => {
      expect(findDeals([])).toEqual([]);
    });

    it('applies sport filter', () => {
      const listings = [
        makeListing({ id: '1', sport: 'Baseball' }),
        makeListing({ id: '2', sport: 'Basketball' }),
      ];
      const deals = findDeals(listings, { sport: 'Baseball' });
      expect(deals.every(d => d.listing.sport === 'Baseball')).toBe(true);
    });

    it('applies platform filter', () => {
      const listings = [
        makeListing({ id: '1', platform: 'eBay' }),
        makeListing({ id: '2', platform: 'COMC' }),
      ];
      const deals = findDeals(listings, { platform: 'eBay' });
      expect(deals.every(d => d.listing.platform === 'eBay')).toBe(true);
    });

    it('applies maxPrice filter', () => {
      const listings = [
        makeListing({ id: '1', listPrice: 50 }),
        makeListing({ id: '2', listPrice: 200 }),
      ];
      const deals = findDeals(listings, { maxPrice: 100 });
      expect(deals.every(d => d.listing.listPrice <= 100)).toBe(true);
    });

    it('applies minScore filter', () => {
      const listings = [makeListing({ listPrice: 99, fairValue: 100 })]; // low savings = low score
      const deals = findDeals(listings, { minScore: 90 });
      expect(deals.every(d => d.dealScore >= 90)).toBe(true);
    });

    it('sorts by score by default (descending)', () => {
      const listings = [
        makeListing({ id: '1', listPrice: 90, fairValue: 100 }),
        makeListing({ id: '2', listPrice: 50, fairValue: 100 }),
      ];
      const deals = findDeals(listings);
      if (deals.length >= 2) {
        expect(deals[0].dealScore).toBeGreaterThanOrEqual(deals[1].dealScore);
      }
    });

    it('each deal has correct shape', () => {
      const listings = [makeListing()];
      const deals = findDeals(listings);
      expect(deals.length).toBeGreaterThan(0);
      const deal = deals[0];
      expect(deal).toHaveProperty('id');
      expect(deal).toHaveProperty('listing');
      expect(deal).toHaveProperty('dealScore');
      expect(deal).toHaveProperty('savingsAmount');
      expect(deal).toHaveProperty('recommendation');
      expect(['strong_buy', 'buy', 'fair', 'overpriced']).toContain(deal.recommendation);
    });
  });

  describe('findArbitrage', () => {
    it('returns empty for empty listings', () => {
      expect(findArbitrage([])).toEqual([]);
    });

    it('returns empty when all listings are on the same platform', () => {
      const listings = [
        makeListing({ id: '1', cardId: 'c1', platform: 'eBay', listPrice: 50 }),
        makeListing({ id: '2', cardId: 'c1', platform: 'eBay', listPrice: 100 }),
      ];
      expect(findArbitrage(listings)).toEqual([]);
    });

    it('finds cross-platform arbitrage when price gap covers fees', () => {
      const listings = [
        makeListing({ id: '1', cardId: 'c1', platform: 'Private', listPrice: 50 }),
        makeListing({ id: '2', cardId: 'c1', platform: 'eBay', listPrice: 100 }),
      ];
      const arbs = findArbitrage(listings);
      expect(arbs.length).toBeGreaterThan(0);
      expect(arbs[0].netProfit).toBeGreaterThan(0);
    });

    it('assigns risk levels', () => {
      const listings = [
        makeListing({ id: '1', cardId: 'c1', platform: 'Private', listPrice: 10, sellerRating: 98 }),
        makeListing({ id: '2', cardId: 'c1', platform: 'eBay', listPrice: 100 }),
      ];
      const arbs = findArbitrage(listings);
      if (arbs.length > 0) {
        expect(['low', 'medium', 'high']).toContain(arbs[0].riskLevel);
      }
    });

    it('returns at most 20 opportunities', () => {
      // Create many listings for the same card across platforms
      const listings: MarketplaceListing[] = [];
      for (let i = 0; i < 30; i++) {
        listings.push(makeListing({
          id: `l${i}`,
          cardId: 'c1',
          platform: i % 2 === 0 ? 'Private' : 'eBay',
          listPrice: 50 + i * 10,
        }));
      }
      const arbs = findArbitrage(listings);
      expect(arbs.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getDealAlerts', () => {
    it('returns empty for empty inputs', () => {
      expect(getDealAlerts([], [])).toEqual([]);
    });

    it('matches listings below target price', () => {
      const listings = [makeListing({ player: 'Mike Trout', listPrice: 80 })];
      const watchlist = [{ id: 'w1', player: 'Mike Trout', targetPrice: 100 }];
      const alerts = getDealAlerts(listings, watchlist);
      expect(alerts.length).toBe(1);
      expect(alerts[0].priceDiff).toBe(20);
    });

    it('does not match listings above target price', () => {
      const listings = [makeListing({ player: 'Mike Trout', listPrice: 120 })];
      const watchlist = [{ id: 'w1', player: 'Mike Trout', targetPrice: 100 }];
      const alerts = getDealAlerts(listings, watchlist);
      expect(alerts.length).toBe(0);
    });

    it('matches case-insensitively', () => {
      const listings = [makeListing({ player: 'mike trout', listPrice: 80 })];
      const watchlist = [{ id: 'w1', player: 'Mike Trout', targetPrice: 100 }];
      const alerts = getDealAlerts(listings, watchlist);
      expect(alerts.length).toBe(1);
    });
  });

  describe('getDealSummary', () => {
    it('returns zeros for empty inputs', () => {
      const summary = getDealSummary([], []);
      expect(summary.totalDeals).toBe(0);
      expect(summary.topDealScore).toBe(0);
      expect(summary.totalSavings).toBe(0);
      expect(summary.arbitrageCount).toBe(0);
    });

    it('counts only deals with score >= 50', () => {
      const deals: Deal[] = [
        { id: 'd1', listing: makeListing(), dealScore: 70, savingsAmount: 10, savingsPercent: 10, afterFees: 90, platformFee: 10, recommendation: 'buy' },
        { id: 'd2', listing: makeListing(), dealScore: 30, savingsAmount: 5, savingsPercent: 5, afterFees: 95, platformFee: 5, recommendation: 'fair' },
      ];
      const summary = getDealSummary(deals, []);
      expect(summary.totalDeals).toBe(1);
    });
  });

  describe('generateListings', () => {
    it('returns empty for empty cards', () => {
      expect(generateListings([])).toEqual([]);
    });

    it('generates listings from inventory cards', () => {
      const cards = [
        makeCard({ id: 'c1', currentValue: 100 }),
        makeCard({ id: 'c2', currentValue: 200 }),
      ];
      const listings = generateListings(cards);
      expect(listings.length).toBeGreaterThan(0);
      expect(listings[0]).toHaveProperty('id');
      expect(listings[0]).toHaveProperty('platform');
      expect(listings[0]).toHaveProperty('listPrice');
    });

    it('all listing prices are positive', () => {
      const cards = [makeCard({ id: 'c1', currentValue: 50 })];
      const listings = generateListings(cards);
      for (const l of listings) {
        expect(l.listPrice).toBeGreaterThan(0);
      }
    });
  });

  describe('localStorage persistence', () => {
    it('loadPrefs returns empty object when nothing stored', () => {
      expect(loadPrefs()).toEqual({});
    });

    it('savePrefs and loadPrefs round-trip', () => {
      savePrefs({ sport: 'Baseball', minScore: 50 });
      const loaded = loadPrefs();
      expect(loaded.sport).toBe('Baseball');
      expect(loaded.minScore).toBe(50);
    });

    it('getDealHistory returns empty array when nothing stored', () => {
      expect(getDealHistory()).toEqual([]);
    });

    it('logDealAction persists to history', () => {
      const listing = makeListing();
      logDealAction('d1', 'purchased', listing, 80, 20);
      const history = getDealHistory();
      expect(history.length).toBe(1);
      expect(history[0].action).toBe('purchased');
      expect(history[0].dealId).toBe('d1');
    });
  });
});
