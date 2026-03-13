import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getActiveListings,
  getAllListings,
  getMyListings,
  getOffers,
  getMyOffers,
  getTopSellers,
  getSellerProfile,
  getMarketplaceStats,
  getListingDealScore,
  getListingsByFilters,
} from '../../lib/p2pMarketplaceService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('p2pMarketplaceService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getActiveListings', () => {
    it('returns only active listings', () => {
      const listings = getActiveListings();
      expect(listings.length).toBeGreaterThan(0);
      for (const l of listings) {
        expect(l.status).toBe('active');
      }
    });

    it('sorted by createdAt descending', () => {
      const listings = getActiveListings();
      for (let i = 1; i < listings.length; i++) {
        expect(new Date(listings[i - 1].createdAt).getTime())
          .toBeGreaterThanOrEqual(new Date(listings[i].createdAt).getTime());
      }
    });
  });

  describe('getAllListings', () => {
    it('returns all listings including sold and pending', () => {
      const all = getAllListings();
      const statuses = new Set(all.map(l => l.status));
      expect(all.length).toBeGreaterThan(getActiveListings().length);
      expect(statuses.size).toBeGreaterThan(1);
    });
  });

  describe('getMyListings', () => {
    it('returns listings for seller S001', () => {
      const my = getMyListings('S001');
      expect(my.length).toBeGreaterThan(0);
      for (const l of my) {
        expect(l.sellerId).toBe('S001');
      }
    });

    it('defaults to S001', () => {
      const my = getMyListings();
      expect(my.length).toBeGreaterThan(0);
    });

    it('returns empty for unknown seller', () => {
      const my = getMyListings('UNKNOWN_SELLER');
      expect(my).toEqual([]);
    });
  });

  describe('getOffers', () => {
    it('returns all offers when no filter', () => {
      const offers = getOffers();
      expect(offers.length).toBeGreaterThan(0);
    });

    it('filters by listing ID', () => {
      const offers = getOffers('L001');
      expect(offers.length).toBeGreaterThan(0);
      for (const o of offers) {
        expect(o.listingId).toBe('L001');
      }
    });

    it('returns empty for listing with no offers', () => {
      const offers = getOffers('NONEXISTENT');
      expect(offers).toEqual([]);
    });

    it('offers have valid fields', () => {
      const offers = getOffers();
      for (const o of offers) {
        expect(o.id).toBeTruthy();
        expect(o.buyer).toBeTruthy();
        expect(o.amount).toBeGreaterThan(0);
        expect(['pending', 'accepted', 'rejected', 'countered', 'expired']).toContain(o.status);
      }
    });
  });

  describe('getMyOffers', () => {
    it('filters by buyer ID', () => {
      const offers = getMyOffers('B001');
      for (const o of offers) {
        expect(o.buyerId).toBe('B001');
      }
    });
  });

  describe('getTopSellers', () => {
    it('returns sellers sorted by rating descending', () => {
      const sellers = getTopSellers();
      expect(sellers.length).toBeGreaterThan(0);
      for (let i = 1; i < sellers.length; i++) {
        expect(sellers[i - 1].rating).toBeGreaterThanOrEqual(sellers[i].rating);
      }
    });

    it('each seller has valid fields', () => {
      const sellers = getTopSellers();
      for (const s of sellers) {
        expect(s.id).toBeTruthy();
        expect(s.username).toBeTruthy();
        expect(s.rating).toBeGreaterThan(0);
        expect(s.rating).toBeLessThanOrEqual(5);
        expect(s.totalSales).toBeGreaterThan(0);
        expect(typeof s.verified).toBe('boolean');
      }
    });
  });

  describe('getSellerProfile', () => {
    it('returns profile for known seller', () => {
      const profile = getSellerProfile('S001');
      expect(profile).toBeDefined();
      expect(profile!.username).toBe('CardVaultKing');
    });

    it('returns undefined for unknown seller', () => {
      const profile = getSellerProfile('UNKNOWN');
      expect(profile).toBeUndefined();
    });
  });

  describe('getMarketplaceStats', () => {
    it('returns valid stats', () => {
      const stats = getMarketplaceStats();
      expect(stats.activeListings).toBeGreaterThan(0);
      expect(stats.totalVolume).toBeGreaterThan(0);
      expect(stats.avgPrice).toBeGreaterThan(0);
      expect(stats.totalSellers).toBeGreaterThan(0);
      expect(stats.avgDealScore).toBeGreaterThan(0);
      expect(stats.avgDealScore).toBeLessThanOrEqual(99);
    });
  });

  describe('getListingDealScore', () => {
    it('returns higher score for better deals', () => {
      const good = getActiveListings().find(l => l.askingPrice < l.marketValue * 0.8);
      const fair = getActiveListings().find(l => l.askingPrice >= l.marketValue * 0.9);
      if (good && fair) {
        expect(getListingDealScore(good)).toBeGreaterThan(getListingDealScore(fair));
      }
    });

    it('returns score between 1 and 99', () => {
      const listings = getActiveListings();
      for (const l of listings) {
        const score = getListingDealScore(l);
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(99);
      }
    });
  });

  describe('getListingsByFilters', () => {
    it('filters by sport', () => {
      const results = getListingsByFilters({ sport: 'Basketball' });
      for (const r of results) {
        expect(r.sport).toBe('Basketball');
      }
    });

    it('filters by min/max price', () => {
      const results = getListingsByFilters({ minPrice: 500, maxPrice: 2000 });
      for (const r of results) {
        expect(r.askingPrice).toBeGreaterThanOrEqual(500);
        expect(r.askingPrice).toBeLessThanOrEqual(2000);
      }
    });

    it('filters by search query', () => {
      const results = getListingsByFilters({ search: 'Luka' });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        const searchable = (r.player + r.cardDescription + r.seller).toLowerCase();
        expect(searchable).toContain('luka');
      }
    });

    it('returns active only', () => {
      const results = getListingsByFilters({});
      for (const r of results) {
        expect(r.status).toBe('active');
      }
    });

    it('returns empty for impossible filters', () => {
      const results = getListingsByFilters({ minPrice: 999999 });
      expect(results).toEqual([]);
    });
  });
});
