import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getConsensusPrices,
  getCommunityExperts,
  getTopExperts,
  getSentimentPolls,
  getActivePolls,
  getPriceVotes,
  getTrendingCards,
  getConsensusSummary,
  castVote,
  getSentimentColor,
  getSentimentLabel,
  getTierColor,
  getTierLabel,
  formatCurrency,
  formatNumber,
} from '../../lib/analytics/consensusPricingService';
import { setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('consensusPricingService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getConsensusPrices', () => {
    it('returns at least 15 consensus prices', () => {
      const prices = getConsensusPrices();
      expect(prices.length).toBeGreaterThanOrEqual(15);
    });

    it('each price has valid vote breakdown summing to totalVotes', () => {
      const prices = getConsensusPrices();
      for (const p of prices) {
        const sum = p.voteBreakdown.fair + p.voteBreakdown.overvalued + p.voteBreakdown.undervalued;
        expect(sum).toBe(p.totalVotes);
      }
    });

    it('each price has non-empty required fields', () => {
      const prices = getConsensusPrices();
      for (const p of prices) {
        expect(p.id).toBeTruthy();
        expect(p.cardName).toBeTruthy();
        expect(p.player).toBeTruthy();
        expect(p.communityPrice).toBeGreaterThan(0);
        expect(p.priceHistory.length).toBeGreaterThan(0);
        expect(p.communityConfidence).toBeGreaterThanOrEqual(0);
        expect(p.communityConfidence).toBeLessThanOrEqual(100);
      }
    });

    it('sentiment scores are between 0 and 100', () => {
      const prices = getConsensusPrices();
      for (const p of prices) {
        expect(p.sentimentScore).toBeGreaterThanOrEqual(0);
        expect(p.sentimentScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getCommunityExperts', () => {
    it('returns at least 12 experts', () => {
      const experts = getCommunityExperts();
      expect(experts.length).toBeGreaterThanOrEqual(12);
    });

    it('expert accuracy is between 0 and 100', () => {
      const experts = getCommunityExperts();
      for (const e of experts) {
        expect(e.accuracy).toBeGreaterThanOrEqual(0);
        expect(e.accuracy).toBeLessThanOrEqual(100);
      }
    });

    it('expert tiers are valid values', () => {
      const validTiers = ['platinum', 'gold', 'silver', 'bronze'];
      const experts = getCommunityExperts();
      for (const e of experts) {
        expect(validTiers).toContain(e.tier);
      }
    });

    it('profitablePredictions does not exceed totalPredictions', () => {
      const experts = getCommunityExperts();
      for (const e of experts) {
        expect(e.profitablePredictions).toBeLessThanOrEqual(e.totalPredictions);
      }
    });
  });

  describe('getTopExperts', () => {
    it('returns at most 6 experts sorted by accuracy descending', () => {
      const top = getTopExperts();
      expect(top.length).toBeLessThanOrEqual(6);
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].accuracy).toBeGreaterThanOrEqual(top[i].accuracy);
      }
    });
  });

  describe('getSentimentPolls', () => {
    it('returns at least 8 polls', () => {
      const polls = getSentimentPolls();
      expect(polls.length).toBeGreaterThanOrEqual(8);
    });

    it('poll option percentages approximately sum to 100', () => {
      const polls = getSentimentPolls();
      for (const poll of polls) {
        const sum = poll.options.reduce((s, o) => s + o.percentage, 0);
        expect(sum).toBeGreaterThan(99);
        expect(sum).toBeLessThan(101);
      }
    });

    it('poll option votes sum to totalVotes', () => {
      const polls = getSentimentPolls();
      for (const poll of polls) {
        const sum = poll.options.reduce((s, o) => s + o.votes, 0);
        expect(sum).toBe(poll.totalVotes);
      }
    });
  });

  describe('getActivePolls', () => {
    it('returns only active polls', () => {
      const active = getActivePolls();
      for (const p of active) {
        expect(p.isActive).toBe(true);
      }
    });
  });

  describe('getPriceVotes', () => {
    it('returns at least 25 votes when no filter', () => {
      const votes = getPriceVotes();
      expect(votes.length).toBeGreaterThanOrEqual(25);
    });

    it('filters votes by cardId', () => {
      const votes = getPriceVotes('cp-012');
      expect(votes.length).toBeGreaterThan(0);
      for (const v of votes) {
        expect(v.cardId).toBe('cp-012');
      }
    });

    it('each vote has valid vote type', () => {
      const validTypes = ['fair_price', 'overvalued', 'undervalued'];
      const votes = getPriceVotes();
      for (const v of votes) {
        expect(validTypes).toContain(v.vote);
      }
    });
  });

  describe('getTrendingCards', () => {
    it('returns at least 10 trending cards', () => {
      const trending = getTrendingCards();
      expect(trending.length).toBeGreaterThanOrEqual(10);
    });

    it('each trending card has required fields', () => {
      const trending = getTrendingCards();
      for (const t of trending) {
        expect(t.cardName).toBeTruthy();
        expect(t.player).toBeTruthy();
        expect(t.mentions).toBeGreaterThan(0);
        expect(t.communityBuzz).toBeGreaterThanOrEqual(0);
        expect(t.communityBuzz).toBeLessThanOrEqual(100);
        expect(t.topReason).toBeTruthy();
      }
    });
  });

  describe('getConsensusSummary', () => {
    it('returns valid summary with positive values', () => {
      const summary = getConsensusSummary();
      expect(summary.totalCardsTracked).toBeGreaterThan(0);
      expect(summary.activeVoters).toBeGreaterThan(0);
      expect(summary.avgCommunityAccuracy).toBeGreaterThan(0);
      expect(summary.topExpertAccuracy).toBeGreaterThan(0);
      expect(summary.mostDebated.length).toBeGreaterThan(0);
    });

    it('trendingSentiment is a valid sentiment level', () => {
      const validSentiments = ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'];
      const summary = getConsensusSummary();
      expect(validSentiments).toContain(summary.trendingSentiment);
    });
  });

  describe('castVote', () => {
    it('adds a new vote to storage', () => {
      const before = getPriceVotes().length;
      castVote('cp-001', 'fair_price', 4200);
      const after = getPriceVotes().length;
      expect(after).toBe(before + 1);
    });
  });

  describe('utility functions', () => {
    it('getSentimentColor returns hex color for each sentiment', () => {
      const sentiments = ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'] as const;
      for (const s of sentiments) {
        const color = getSentimentColor(s);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('getSentimentLabel returns non-empty label for each sentiment', () => {
      const sentiments = ['very_bullish', 'bullish', 'neutral', 'bearish', 'very_bearish'] as const;
      for (const s of sentiments) {
        expect(getSentimentLabel(s)).toBeTruthy();
      }
    });

    it('getTierColor returns hex color for each tier', () => {
      const tiers = ['platinum', 'gold', 'silver', 'bronze'] as const;
      for (const t of tiers) {
        const color = getTierColor(t);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('getTierLabel returns non-empty label for each tier', () => {
      const tiers = ['platinum', 'gold', 'silver', 'bronze'] as const;
      for (const t of tiers) {
        expect(getTierLabel(t)).toBeTruthy();
      }
    });

    it('formatCurrency formats numbers with dollar sign', () => {
      expect(formatCurrency(1500)).toContain('$');
      expect(formatCurrency(50)).toBe('$50');
    });

    it('formatNumber abbreviates large numbers', () => {
      expect(formatNumber(1500)).toContain('K');
      expect(formatNumber(1500000)).toContain('M');
      expect(formatNumber(500)).toBe('500');
    });
  });
});
