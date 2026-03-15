import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTradePosts,
  createPost,
  getTradeOffers,
  makeOffer,
  respondToOffer,
  getUserReputation,
  getTradingStats,
  getTopTraders,
  searchPosts,
  filterByType,
  filterBySport,
  getRecentActivity,
  formatCurrency,
  getStatusColor,
  getTypeLabel,
  getTypeBadgeColor,
} from '../../lib/communityTradingService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('communityTradingService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // --- getTradePosts ---
  describe('getTradePosts', () => {
    it('returns mock posts when localStorage is empty', () => {
      const posts = getTradePosts();
      expect(posts.length).toBeGreaterThanOrEqual(15);
    });

    it('returns posts sorted by timestamp descending', () => {
      const posts = getTradePosts();
      for (let i = 1; i < posts.length; i++) {
        expect(new Date(posts[i - 1].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(posts[i].timestamp).getTime());
      }
    });

    it('every post has required fields', () => {
      const posts = getTradePosts();
      for (const p of posts) {
        expect(p.id).toBeTruthy();
        expect(p.userId).toBeTruthy();
        expect(p.username).toBeTruthy();
        expect(['want', 'have', 'trade']).toContain(p.type);
        expect(['active', 'pending', 'completed', 'expired']).toContain(p.status);
        expect(p.estimatedValue).toBeGreaterThan(0);
        expect(Array.isArray(p.tags)).toBe(true);
        expect(Array.isArray(p.images)).toBe(true);
      }
    });
  });

  // --- createPost ---
  describe('createPost', () => {
    it('creates a new post with generated id and defaults', () => {
      const post = createPost({
        userId: 'u-099', username: 'TestUser', avatar: '/test.png',
        type: 'have', cardName: 'Test Card', player: 'Test Player',
        sport: 'Baseball', year: 2024, set: 'Topps', condition: 'Mint',
        estimatedValue: 100, description: 'A test card', images: [], tags: ['test'],
      });
      expect(post.id).toMatch(/^tp-/);
      expect(post.status).toBe('active');
      expect(post.likes).toBe(0);
      expect(post.comments).toBe(0);
      expect(post.timestamp).toBeTruthy();
    });

    it('new post appears first in getTradePosts', () => {
      const post = createPost({
        userId: 'u-099', username: 'TestUser', avatar: '/test.png',
        type: 'want', cardName: 'New Want Card', player: 'Someone',
        sport: 'Football', year: 2024, set: 'Prizm', condition: 'NM',
        estimatedValue: 50, description: 'Need this', images: [], tags: [],
      });
      const posts = getTradePosts();
      expect(posts[0].id).toBe(post.id);
    });
  });

  // --- getTradeOffers ---
  describe('getTradeOffers', () => {
    it('returns mock offers when localStorage is empty', () => {
      const offers = getTradeOffers();
      expect(offers.length).toBeGreaterThanOrEqual(3);
    });

    it('offers are sorted by timestamp descending', () => {
      const offers = getTradeOffers();
      for (let i = 1; i < offers.length; i++) {
        expect(new Date(offers[i - 1].timestamp).getTime())
          .toBeGreaterThanOrEqual(new Date(offers[i].timestamp).getTime());
      }
    });

    it('each offer has offeredCards and requestedCards arrays', () => {
      const offers = getTradeOffers();
      for (const o of offers) {
        expect(Array.isArray(o.offeredCards)).toBe(true);
        expect(o.offeredCards.length).toBeGreaterThan(0);
        expect(Array.isArray(o.requestedCards)).toBe(true);
        expect(o.requestedCards.length).toBeGreaterThan(0);
      }
    });
  });

  // --- makeOffer ---
  describe('makeOffer', () => {
    it('creates an offer with pending status', () => {
      const offer = makeOffer({
        postId: 'tp-001', fromUser: 'TestUser', toUser: 'CardKingMike',
        offeredCards: [{ cardName: 'Test', player: 'Test', value: 100 }],
        requestedCards: [{ cardName: 'Target', player: 'Target', value: 200 }],
        cashDifference: 100, message: 'Deal?',
      });
      expect(offer.id).toMatch(/^to-/);
      expect(offer.status).toBe('pending');
      expect(offer.timestamp).toBeTruthy();
    });
  });

  // --- respondToOffer ---
  describe('respondToOffer', () => {
    it('updates offer status to accepted', () => {
      // First create an offer so it is stored
      const offer = makeOffer({
        postId: 'tp-001', fromUser: 'A', toUser: 'B',
        offeredCards: [{ cardName: 'C', player: 'P', value: 50 }],
        requestedCards: [{ cardName: 'D', player: 'Q', value: 60 }],
        cashDifference: 10, message: 'Hi',
      });
      const updated = respondToOffer(offer.id, 'accepted');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('accepted');
    });

    it('returns null for unknown offer id', () => {
      const result = respondToOffer('nonexistent', 'declined');
      expect(result).toBeNull();
    });

    it('updates offer status to declined', () => {
      const offer = makeOffer({
        postId: 'tp-002', fromUser: 'X', toUser: 'Y',
        offeredCards: [{ cardName: 'E', player: 'R', value: 30 }],
        requestedCards: [{ cardName: 'F', player: 'S', value: 40 }],
        cashDifference: 10, message: 'Nope',
      });
      const updated = respondToOffer(offer.id, 'declined');
      expect(updated).not.toBeNull();
      expect(updated!.status).toBe('declined');
    });
  });

  // --- getUserReputation ---
  describe('getUserReputation', () => {
    it('returns reputation for valid user', () => {
      const rep = getUserReputation('u-001');
      expect(rep).not.toBeNull();
      expect(rep!.username).toBe('CardKingMike');
      expect(rep!.rating).toBeGreaterThanOrEqual(1);
      expect(rep!.rating).toBeLessThanOrEqual(5);
      expect(Array.isArray(rep!.badges)).toBe(true);
    });

    it('returns null for unknown user', () => {
      expect(getUserReputation('u-unknown')).toBeNull();
    });
  });

  // --- getTradingStats ---
  describe('getTradingStats', () => {
    it('returns valid stats object', () => {
      const stats = getTradingStats();
      expect(stats.totalActivePosts).toBeGreaterThan(0);
      expect(stats.avgTradeValue).toBeGreaterThan(0);
      expect(stats.topTrader).toBeTruthy();
      expect(stats.totalVolume).toBeGreaterThan(0);
      expect(typeof stats.tradesCompletedToday).toBe('number');
    });
  });

  // --- getTopTraders ---
  describe('getTopTraders', () => {
    it('returns traders sorted by completedTrades descending', () => {
      const traders = getTopTraders();
      expect(traders.length).toBeGreaterThanOrEqual(5);
      for (let i = 1; i < traders.length; i++) {
        expect(traders[i - 1].completedTrades).toBeGreaterThanOrEqual(traders[i].completedTrades);
      }
    });
  });

  // --- searchPosts ---
  describe('searchPosts', () => {
    it('finds posts by player name', () => {
      const results = searchPosts('Wembanyama');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].player).toContain('Wembanyama');
    });

    it('finds posts by tag', () => {
      const results = searchPosts('vintage');
      expect(results.length).toBeGreaterThan(0);
    });

    it('returns empty for no match', () => {
      const results = searchPosts('xyznonexistent123');
      expect(results).toHaveLength(0);
    });
  });

  // --- filterByType ---
  describe('filterByType', () => {
    it('returns only want posts', () => {
      const posts = filterByType('want');
      expect(posts.length).toBeGreaterThan(0);
      for (const p of posts) {
        expect(p.type).toBe('want');
      }
    });

    it('returns only have posts', () => {
      const posts = filterByType('have');
      expect(posts.length).toBeGreaterThan(0);
      for (const p of posts) {
        expect(p.type).toBe('have');
      }
    });

    it('returns only trade posts', () => {
      const posts = filterByType('trade');
      expect(posts.length).toBeGreaterThan(0);
      for (const p of posts) {
        expect(p.type).toBe('trade');
      }
    });
  });

  // --- filterBySport ---
  describe('filterBySport', () => {
    it('filters by Basketball', () => {
      const posts = filterBySport('Basketball');
      expect(posts.length).toBeGreaterThan(0);
      for (const p of posts) {
        expect(p.sport).toBe('Basketball');
      }
    });

    it('case-insensitive match', () => {
      const posts = filterBySport('baseball');
      expect(posts.length).toBeGreaterThan(0);
      for (const p of posts) {
        expect(p.sport.toLowerCase()).toBe('baseball');
      }
    });
  });

  // --- getRecentActivity ---
  describe('getRecentActivity', () => {
    it('returns activity data with date, volume, and trades', () => {
      const activity = getRecentActivity();
      expect(activity.length).toBeGreaterThan(0);
      for (const a of activity) {
        expect(a.date).toBeTruthy();
        expect(a.volume).toBeGreaterThan(0);
        expect(a.trades).toBeGreaterThan(0);
      }
    });
  });

  // --- formatCurrency ---
  describe('formatCurrency', () => {
    it('formats number as USD currency', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
      expect(result).toContain('$');
    });

    it('handles zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('$');
      expect(result).toContain('0');
    });
  });

  // --- getStatusColor ---
  describe('getStatusColor', () => {
    it('returns green for active', () => {
      expect(getStatusColor('active')).toContain('green');
    });

    it('returns yellow for pending', () => {
      expect(getStatusColor('pending')).toContain('yellow');
    });

    it('returns blue for completed', () => {
      expect(getStatusColor('completed')).toContain('blue');
    });

    it('returns red for expired', () => {
      expect(getStatusColor('expired')).toContain('red');
    });

    it('returns blue for accepted', () => {
      expect(getStatusColor('accepted')).toContain('blue');
    });

    it('returns red for declined', () => {
      expect(getStatusColor('declined')).toContain('red');
    });

    it('returns purple for countered', () => {
      expect(getStatusColor('countered')).toContain('purple');
    });
  });

  // --- getTypeLabel ---
  describe('getTypeLabel', () => {
    it('returns Looking For for want', () => {
      expect(getTypeLabel('want')).toBe('Looking For');
    });

    it('returns Available for have', () => {
      expect(getTypeLabel('have')).toBe('Available');
    });

    it('returns Open to Trade for trade', () => {
      expect(getTypeLabel('trade')).toBe('Open to Trade');
    });
  });

  // --- getTypeBadgeColor ---
  describe('getTypeBadgeColor', () => {
    it('returns blue for want', () => {
      expect(getTypeBadgeColor('want')).toContain('blue');
    });

    it('returns green for have', () => {
      expect(getTypeBadgeColor('have')).toContain('green');
    });

    it('returns purple for trade', () => {
      expect(getTypeBadgeColor('trade')).toContain('purple');
    });
  });
});
