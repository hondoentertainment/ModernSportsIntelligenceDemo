import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getActiveAuctions,
  analyzeListing,
  generateBidStrategy,
  getSniperStats,
  getAuctionAlerts,
  getAuctionStats,
  analyzeBidHistory,
  getEndingSoon,
  getAuctionHistory,
  generateMockAuctions,
  type AuctionListing,
} from '../../lib/auctionSniperService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

function makeListing(overrides: Partial<AuctionListing> = {}): AuctionListing {
  return {
    id: 'auc-test-1',
    platform: 'eBay',
    player: 'Mike Trout',
    cardDescription: '2023 Topps Chrome RC Auto',
    grade: 'PSA 10',
    currentBid: 100,
    bidCount: 5,
    timeRemaining: 7200,
    endTime: new Date(Date.now() + 7200000).toISOString(),
    sellerRating: 98.5,
    estimatedFMV: 200,
    dealScore: 60,
    bidPattern: 'organic',
    shillRisk: 10,
    watchers: 12,
    image: '',
    ...overrides,
  };
}

describe('auctionSniperService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getActiveAuctions', () => {
    it('returns an array of auctions', () => {
      const auctions = getActiveAuctions();
      expect(Array.isArray(auctions)).toBe(true);
      expect(auctions.length).toBeGreaterThanOrEqual(10);
    });

    it('auctions have all required fields', () => {
      const auctions = getActiveAuctions();
      for (const a of auctions) {
        expect(a.id).toBeTruthy();
        expect(a.platform).toBeTruthy();
        expect(a.player).toBeTruthy();
        expect(a.estimatedFMV).toBeGreaterThan(0);
        expect(a.currentBid).toBeGreaterThan(0);
        expect(a.timeRemaining).toBeGreaterThanOrEqual(0);
        expect(a.dealScore).toBeGreaterThanOrEqual(0);
        expect(a.dealScore).toBeLessThanOrEqual(100);
      }
    });

    it('returns sorted by timeRemaining ascending', () => {
      const auctions = getActiveAuctions();
      for (let i = 1; i < auctions.length; i++) {
        expect(auctions[i].timeRemaining).toBeGreaterThanOrEqual(auctions[i - 1].timeRemaining);
      }
    });

    it('is deterministic (cached in localStorage)', () => {
      const a = getActiveAuctions();
      const b = getActiveAuctions();
      expect(a.length).toBe(b.length);
      expect(a[0].id).toBe(b[0].id);
    });
  });

  describe('analyzeListing', () => {
    it('returns snipe strategy for high deal score', () => {
      const listing = makeListing({ dealScore: 80 });
      const result = analyzeListing(listing);
      expect(result.strategy).toBe('snipe');
    });

    it('returns early_bid strategy for medium deal score', () => {
      const listing = makeListing({ dealScore: 60 });
      const result = analyzeListing(listing);
      expect(result.strategy).toBe('early_bid');
    });

    it('returns watch strategy for moderate deal score', () => {
      const listing = makeListing({ dealScore: 30 });
      const result = analyzeListing(listing);
      expect(result.strategy).toBe('watch');
    });

    it('returns skip strategy for low deal score', () => {
      const listing = makeListing({ dealScore: 10 });
      const result = analyzeListing(listing);
      expect(result.strategy).toBe('skip');
    });

    it('preserves all original listing fields', () => {
      const listing = makeListing({ player: 'Test Player' });
      const result = analyzeListing(listing);
      expect(result.player).toBe('Test Player');
      expect(result.id).toBe(listing.id);
    });

    it('handles boundary deal scores', () => {
      expect(analyzeListing(makeListing({ dealScore: 75 })).strategy).toBe('snipe');
      expect(analyzeListing(makeListing({ dealScore: 50 })).strategy).toBe('early_bid');
      expect(analyzeListing(makeListing({ dealScore: 25 })).strategy).toBe('watch');
      expect(analyzeListing(makeListing({ dealScore: 0 })).strategy).toBe('skip');
    });
  });

  describe('generateBidStrategy', () => {
    it('returns a strategy for existing auction', () => {
      const auctions = getActiveAuctions();
      const strategy = generateBidStrategy(auctions[0].id, 5000);
      expect(strategy.auctionId).toBe(auctions[0].id);
      expect(strategy.maxBid).toBeGreaterThan(0);
      expect(strategy.confidence).toBeGreaterThanOrEqual(15);
      expect(strategy.confidence).toBeLessThanOrEqual(95);
      expect(strategy.reasoning).toBeTruthy();
      expect(['early_bid', 'mid_game', 'snipe', 'proxy']).toContain(strategy.strategy);
    });

    it('returns default for non-existent auction', () => {
      const strategy = generateBidStrategy('nonexistent-id', 1000);
      expect(strategy.auctionId).toBe('nonexistent-id');
      expect(strategy.maxBid).toBe(0);
      expect(strategy.confidence).toBe(0);
      expect(strategy.reasoning).toBe('Auction not found.');
    });

    it('respects max budget', () => {
      const auctions = getActiveAuctions();
      const strategy = generateBidStrategy(auctions[0].id, 50);
      expect(strategy.maxBid).toBeLessThanOrEqual(50);
    });

    it('recommends snipe for high shill risk auctions', () => {
      // Find or ensure a shill_suspect auction
      const auctions = getActiveAuctions();
      const shillAuction = auctions.find(a => a.shillRisk > 60);
      if (shillAuction) {
        const strategy = generateBidStrategy(shillAuction.id, 10000);
        expect(strategy.strategy).toBe('snipe');
        expect(strategy.snipeTime).toBeLessThanOrEqual(5);
      }
    });
  });

  describe('getSniperStats', () => {
    it('returns valid stats', () => {
      const stats = getSniperStats();
      expect(stats.totalTracked).toBeGreaterThan(0);
      expect(stats.totalWon).toBeGreaterThanOrEqual(0);
      expect(stats.winRate).toBeGreaterThanOrEqual(0);
      expect(stats.winRate).toBeLessThanOrEqual(100);
      expect(stats.totalSaved).toBeGreaterThanOrEqual(0);
      expect(stats.bestDeal).toBeDefined();
      expect(stats.bestDeal.player).toBeTruthy();
    });

    it('win rate is consistent with total tracked and won', () => {
      const stats = getSniperStats();
      if (stats.totalTracked > 0) {
        const expectedRate = Math.round((stats.totalWon / stats.totalTracked) * 1000) / 10;
        expect(stats.winRate).toBe(expectedRate);
      }
    });
  });

  describe('getAuctionAlerts', () => {
    it('returns ending alerts for auctions under 10 minutes', () => {
      const listings = [makeListing({ timeRemaining: 300, player: 'Test' })];
      const alerts = getAuctionAlerts(listings);
      const ending = alerts.filter(a => a.type === 'ending');
      expect(ending.length).toBe(1);
      expect(ending[0].message).toContain('Test');
    });

    it('returns shill alerts for high risk listings', () => {
      const listings = [makeListing({ shillRisk: 80, player: 'Shill Player' })];
      const alerts = getAuctionAlerts(listings);
      const shill = alerts.filter(a => a.type === 'shill');
      expect(shill.length).toBe(1);
      expect(shill[0].message).toContain('80%');
    });

    it('returns deal alerts for high deal score listings', () => {
      const listings = [makeListing({ dealScore: 85, player: 'Deal Player' })];
      const alerts = getAuctionAlerts(listings);
      const deal = alerts.filter(a => a.type === 'deal');
      expect(deal.length).toBe(1);
      expect(deal[0].message).toContain('85');
    });

    it('returns empty array for empty input', () => {
      const alerts = getAuctionAlerts([]);
      expect(alerts).toEqual([]);
    });

    it('does not generate alerts for normal listings', () => {
      const listings = [makeListing({
        timeRemaining: 86400,
        shillRisk: 10,
        dealScore: 50,
      })];
      const alerts = getAuctionAlerts(listings);
      expect(alerts).toHaveLength(0);
    });
  });

  describe('getAuctionStats', () => {
    it('returns zeros for empty listings', () => {
      const stats = getAuctionStats([]);
      expect(stats.total).toBe(0);
      expect(stats.endingSoon).toBe(0);
      expect(stats.avgDealScore).toBe(0);
      expect(stats.totalValue).toBe(0);
    });

    it('calculates stats correctly', () => {
      const listings = [
        makeListing({ timeRemaining: 300, currentBid: 100, dealScore: 80 }),
        makeListing({ timeRemaining: 86400, currentBid: 200, dealScore: 60 }),
      ];
      const stats = getAuctionStats(listings);
      expect(stats.total).toBe(2);
      expect(stats.endingSoon).toBe(1);
      expect(stats.avgDealScore).toBe(70);
      expect(stats.totalValue).toBe(300);
    });

    it('counts ending soon correctly (within 1 hour)', () => {
      const listings = [
        makeListing({ timeRemaining: 3599 }),
        makeListing({ timeRemaining: 3600 }),
        makeListing({ timeRemaining: 3601 }),
      ];
      const stats = getAuctionStats(listings);
      expect(stats.endingSoon).toBe(2);
    });
  });

  describe('analyzeBidHistory', () => {
    it('returns bid history for existing auction', () => {
      const auctions = getActiveAuctions();
      const analysis = analyzeBidHistory(auctions[0].id);
      expect(analysis.auctionId).toBe(auctions[0].id);
      expect(analysis.bids.length).toBeGreaterThan(0);
      expect(analysis.avgBidIncrement).toBeGreaterThanOrEqual(0);
    });

    it('returns empty result for non-existent auction', () => {
      const analysis = analyzeBidHistory('fake-id');
      expect(analysis.auctionId).toBe('fake-id');
      expect(analysis.bids).toEqual([]);
      expect(analysis.pattern).toBe('organic');
      expect(analysis.shillIndicators).toEqual([]);
    });
  });

  describe('getEndingSoon', () => {
    it('returns only auctions ending within 1 hour', () => {
      const ending = getEndingSoon(3600);
      for (const a of ending) {
        expect(a.timeRemaining).toBeLessThanOrEqual(3600);
      }
    });
  });

  describe('getAuctionHistory', () => {
    it('returns history records sorted by date descending', () => {
      const history = getAuctionHistory();
      expect(history.length).toBe(20);
      for (let i = 1; i < history.length; i++) {
        expect(new Date(history[i - 1].endedAt).getTime())
          .toBeGreaterThanOrEqual(new Date(history[i].endedAt).getTime());
      }
    });

    it('history records have valid fields', () => {
      const history = getAuctionHistory();
      for (const h of history) {
        expect(h.id).toBeTruthy();
        expect(h.player).toBeTruthy();
        expect(h.finalPrice).toBeGreaterThan(0);
        expect(h.estimatedFMV).toBeGreaterThan(0);
        expect(typeof h.won).toBe('boolean');
      }
    });
  });

  describe('generateMockAuctions', () => {
    it('returns same as getActiveAuctions', () => {
      const mocks = generateMockAuctions([]);
      const active = getActiveAuctions();
      expect(mocks.length).toBe(active.length);
    });
  });
});
