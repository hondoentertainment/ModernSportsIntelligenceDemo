import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateMockAuctions,
  analyzeListing,
  calculateOptimalBid,
  getAuctionAlerts,
  getBidTimingRecommendation,
  getAuctionStats,
  getWatchedAuctions,
  watchAuction,
  unwatchAuction,
  isAuctionWatched,
} from '../../lib/auctionSniperService';
import type { AuctionListing } from '../../lib/auctionSniperService';
import { makeCard, setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

function makeListing(overrides: Partial<AuctionListing> = {}): AuctionListing {
  return {
    id: 'auction-1',
    player: 'Mike Trout',
    year: 2023,
    manufacturer: 'Topps',
    set: 'Chrome',
    sport: 'Baseball',
    grade: 'PSA 10',
    currentBid: 80,
    bidCount: 5,
    startPrice: 50,
    estimatedValue: 200,
    timeRemaining: 7200,
    endTime: new Date(Date.now() + 7200000).toISOString(),
    seller: 'cardking99',
    condition: 'Gem Mint',
    image: '',
    watchers: 10,
    isHot: false,
    ...overrides,
  };
}

describe('auctionSniperService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('generateMockAuctions', () => {
    it('generates 8-12 listings', () => {
      const listings = generateMockAuctions([]);
      expect(listings.length).toBeGreaterThanOrEqual(8);
      expect(listings.length).toBeLessThanOrEqual(12);
    });

    it('is deterministic (same results for same day)', () => {
      const a = generateMockAuctions([]);
      const b = generateMockAuctions([]);
      expect(a.length).toBe(b.length);
      expect(a[0].player).toBe(b[0].player);
    });

    it('incorporates inventory cards', () => {
      const inventory = Array.from({ length: 10 }, (_, i) =>
        makeCard({ id: `c${i}`, player: `Inv Player ${i}` })
      );
      const listings = generateMockAuctions(inventory);
      expect(listings.length).toBeGreaterThanOrEqual(8);
    });

    it('all listings have positive values', () => {
      const listings = generateMockAuctions([]);
      for (const l of listings) {
        expect(l.estimatedValue).toBeGreaterThan(0);
        expect(l.currentBid).toBeGreaterThan(0);
        expect(l.timeRemaining).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('analyzeListing', () => {
    it('recommends snipe for ending-soon low-bid auctions', () => {
      const listing = makeListing({
        timeRemaining: 600,
        bidCount: 3,
        currentBid: 80,
        estimatedValue: 200,
        watchers: 2,
      });
      const analysis = analyzeListing(listing);
      expect(analysis.strategy).toBe('snipe');
      expect(analysis.riskLevel).toBe('low');
    });

    it('recommends skip when bid is at fair value', () => {
      const listing = makeListing({
        currentBid: 195,
        estimatedValue: 200,
      });
      const analysis = analyzeListing(listing);
      expect(analysis.strategy).toBe('skip');
    });

    it('recommends early_bid for undervalued low-watcher listings', () => {
      const listing = makeListing({
        currentBid: 60,
        estimatedValue: 200,
        watchers: 3,
        timeRemaining: 86400,
        bidCount: 2,
      });
      const analysis = analyzeListing(listing);
      expect(analysis.strategy).toBe('early_bid');
    });

    it('returns valid confidence between 0 and 100', () => {
      const listing = makeListing();
      const analysis = analyzeListing(listing);
      expect(analysis.confidence).toBeGreaterThanOrEqual(0);
      expect(analysis.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateOptimalBid', () => {
    it('bids below estimated value for low competition', () => {
      const listing = makeListing({
        bidCount: 1,
        watchers: 2,
        estimatedValue: 100,
        currentBid: 10,
      });
      const bid = calculateOptimalBid(listing);
      expect(bid).toBeLessThan(listing.estimatedValue);
      expect(bid).toBeGreaterThan(listing.currentBid);
    });

    it('never returns below current bid', () => {
      const listing = makeListing({
        currentBid: 195,
        estimatedValue: 200,
        bidCount: 0,
        watchers: 0,
      });
      const bid = calculateOptimalBid(listing);
      expect(bid).toBeGreaterThanOrEqual(listing.currentBid);
    });

    it('bids higher for fierce competition', () => {
      const lowComp = makeListing({ bidCount: 1, watchers: 2, estimatedValue: 200, currentBid: 50 });
      const highComp = makeListing({ bidCount: 20, watchers: 30, estimatedValue: 200, currentBid: 50 });
      const lowBid = calculateOptimalBid(lowComp);
      const highBid = calculateOptimalBid(highComp);
      expect(highBid).toBeGreaterThan(lowBid);
    });
  });

  describe('getAuctionAlerts', () => {
    it('returns ending_soon alerts for auctions under 1 hour', () => {
      const listings = [makeListing({ timeRemaining: 300 })];
      const alerts = getAuctionAlerts(listings);
      const endingSoon = alerts.filter(a => a.type === 'ending_soon');
      expect(endingSoon.length).toBe(1);
    });

    it('returns below_value alerts', () => {
      const listings = [makeListing({ currentBid: 50, estimatedValue: 200 })];
      const alerts = getAuctionAlerts(listings);
      const belowValue = alerts.filter(a => a.type === 'below_value');
      expect(belowValue.length).toBe(1);
    });

    it('returns no ending_soon for auctions with plenty of time', () => {
      const listings = [makeListing({ timeRemaining: 86400 })];
      const alerts = getAuctionAlerts(listings);
      const endingSoon = alerts.filter(a => a.type === 'ending_soon');
      expect(endingSoon).toHaveLength(0);
    });
  });

  describe('getBidTimingRecommendation', () => {
    it('recommends later snipe for low competition', () => {
      const listing = makeListing({ bidCount: 1, watchers: 2 });
      const timing = getBidTimingRecommendation(listing);
      expect(timing).toBeGreaterThan(10);
    });

    it('recommends earlier snipe for fierce competition', () => {
      const low = makeListing({ bidCount: 1, watchers: 2 });
      const high = makeListing({ bidCount: 20, watchers: 30 });
      expect(getBidTimingRecommendation(high)).toBeLessThan(getBidTimingRecommendation(low));
    });
  });

  describe('getAuctionStats', () => {
    it('returns zeros for empty listings', () => {
      const stats = getAuctionStats([]);
      expect(stats.totalActive).toBe(0);
      expect(stats.endingSoon).toBe(0);
      expect(stats.avgDiscount).toBe(0);
      expect(stats.totalPotentialSavings).toBe(0);
    });

    it('calculates stats correctly', () => {
      const listings = [
        makeListing({ timeRemaining: 300, currentBid: 100, estimatedValue: 200 }),
        makeListing({ timeRemaining: 86400, currentBid: 150, estimatedValue: 200 }),
      ];
      const stats = getAuctionStats(listings);
      expect(stats.totalActive).toBe(2);
      expect(stats.endingSoon).toBe(1);
      expect(stats.totalPotentialSavings).toBe(150);
      expect(stats.avgDiscount).toBeGreaterThan(0);
    });
  });

  describe('watch list persistence', () => {
    it('starts with empty watch list', () => {
      expect(getWatchedAuctions()).toEqual([]);
    });

    it('watches and unwatches auctions', () => {
      watchAuction('a1');
      watchAuction('a2');
      expect(getWatchedAuctions()).toEqual(['a1', 'a2']);
      expect(isAuctionWatched('a1')).toBe(true);

      unwatchAuction('a1');
      expect(getWatchedAuctions()).toEqual(['a2']);
      expect(isAuctionWatched('a1')).toBe(false);
    });

    it('does not duplicate watched auctions', () => {
      watchAuction('a1');
      watchAuction('a1');
      expect(getWatchedAuctions()).toEqual(['a1']);
    });
  });
});
