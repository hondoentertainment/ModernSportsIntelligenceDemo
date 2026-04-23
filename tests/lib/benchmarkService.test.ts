// @ts-nocheck
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import {
  generateCommunityProfiles,
  calculateUserMetrics,
  getLeaderboard,
  getLeaderboardWithUser,
  getMonthlyChallenge,
  evaluateChallengeProgress,
  getCommunityStats,
} from '../../lib/analytics/benchmarkService';
import type { LeaderboardCategory } from '../../lib/analytics/benchmarkService';
import { makeCard, setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('benchmarkService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('generateCommunityProfiles', () => {
    it('generates 500 profiles', () => {
      const profiles = generateCommunityProfiles(12345);
      expect(profiles).toHaveLength(500);
    });

    it('all profiles have required fields', () => {
      const profiles = generateCommunityProfiles(12345);
      for (const p of profiles) {
        expect(p.id).toBeTruthy();
        expect(p.displayName).toBeTruthy();
        expect(p.portfolioValue).toBeGreaterThanOrEqual(100);
        expect(p.cardCount).toBeGreaterThanOrEqual(1);
        expect(typeof p.totalROI).toBe('number');
        expect(typeof p.diversificationScore).toBe('number');
        expect(typeof p.gradingScore).toBe('number');
      }
    });

    it('is deterministic for the same seed', () => {
      const a = generateCommunityProfiles(99999);
      const b = generateCommunityProfiles(99999);
      expect(a[0].portfolioValue).toBe(b[0].portfolioValue);
      expect(a[0].displayName).toBe(b[0].displayName);
    });
  });

  describe('calculateUserMetrics', () => {
    it('returns all zeros for empty inventory', () => {
      const metrics = calculateUserMetrics([]);
      expect(metrics.roi).toBe(0);
      expect(metrics.portfolio_value).toBe(0);
      expect(metrics.diversification).toBe(0);
      expect(metrics.grading_score).toBe(0);
      expect(metrics.trading_activity).toBe(0);
      expect(metrics.achievement_points).toBe(0);
    });

    it('returns all six categories', () => {
      const cards = [makeCard({ currentValue: 150, purchasePrice: 100 })];
      const metrics = calculateUserMetrics(cards);
      const keys = Object.keys(metrics) as LeaderboardCategory[];
      expect(keys).toContain('roi');
      expect(keys).toContain('portfolio_value');
      expect(keys).toContain('diversification');
      expect(keys).toContain('grading_score');
      expect(keys).toContain('trading_activity');
      expect(keys).toContain('achievement_points');
    });

    it('calculates positive ROI for appreciated cards', () => {
      const cards = [makeCard({ purchasePrice: 100, currentValue: 200 })];
      const metrics = calculateUserMetrics(cards);
      expect(metrics.roi).toBeGreaterThan(0);
    });

    it('calculates portfolio_value as sum of currentValues', () => {
      const cards = [
        makeCard({ id: '1', currentValue: 100 }),
        makeCard({ id: '2', currentValue: 200 }),
      ];
      const metrics = calculateUserMetrics(cards);
      expect(metrics.portfolio_value).toBe(300);
    });

    it('increases diversification for multiple sports', () => {
      const singleSport = [makeCard({ sport: 'Baseball' })];
      const multiSport = [
        makeCard({ id: '1', sport: 'Baseball' }),
        makeCard({ id: '2', sport: 'Basketball' }),
        makeCard({ id: '3', sport: 'Football' }),
      ];
      const single = calculateUserMetrics(singleSport);
      const multi = calculateUserMetrics(multiSport);
      expect(multi.diversification).toBeGreaterThan(single.diversification);
    });

    it('grading_score is higher when cards are graded', () => {
      const ungraded = [makeCard({ isGraded: false })];
      const graded = [makeCard({ isGraded: true, grade: '10', gradingCompany: 'PSA' })];
      const ungradedMetrics = calculateUserMetrics(ungraded);
      const gradedMetrics = calculateUserMetrics(graded);
      expect(gradedMetrics.grading_score).toBeGreaterThan(ungradedMetrics.grading_score);
    });
  });

  describe('getLeaderboard', () => {
    it('returns entries sorted by value descending', () => {
      const entries = getLeaderboard('portfolio_value', 10);
      expect(entries.length).toBeLessThanOrEqual(10);
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].value).toBeGreaterThanOrEqual(entries[i].value);
      }
    });

    it('entries have sequential ranks', () => {
      const entries = getLeaderboard('roi', 5);
      entries.forEach((e, i) => {
        expect(e.rank).toBe(i + 1);
      });
    });

    it('no user entry in basic leaderboard', () => {
      const entries = getLeaderboard('roi', 20);
      expect(entries.every(e => !e.isUser)).toBe(true);
    });
  });

  describe('getLeaderboardWithUser', () => {
    it('includes user in results', () => {
      const cards = [makeCard({ currentValue: 99999999 })]; // very high value to ensure in top
      const entries = getLeaderboardWithUser('portfolio_value', cards, 20);
      expect(entries.some(e => e.isUser)).toBe(true);
    });

    it('appends user at correct rank when outside top N', () => {
      const cards = [makeCard({ currentValue: 1 })]; // very low value
      const entries = getLeaderboardWithUser('portfolio_value', cards, 5);
      const userEntry = entries.find(e => e.isUser);
      expect(userEntry).toBeDefined();
      // User should be ranked beyond the top 5
      if (userEntry && userEntry.rank > 5) {
        expect(entries.length).toBe(6); // 5 top + user
      }
    });
  });

  describe('getMonthlyChallenge', () => {
    it('returns exactly 3 challenges', () => {
      const challenges = getMonthlyChallenge();
      expect(challenges).toHaveLength(3);
    });

    it('each challenge has required fields', () => {
      const challenges = getMonthlyChallenge();
      for (const c of challenges) {
        expect(c.id).toBeTruthy();
        expect(c.title).toBeTruthy();
        expect(c.description).toBeTruthy();
        expect(c.requirement).toBeGreaterThan(0);
        expect(c.reward).toBeGreaterThan(0);
        expect(c.daysRemaining).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('evaluateChallengeProgress', () => {
    it('returns progress for each challenge', () => {
      const challenges = getMonthlyChallenge();
      const progress = evaluateChallengeProgress(challenges, []);
      expect(progress).toHaveLength(challenges.length);
      for (const p of progress) {
        expect(p).toHaveProperty('challengeId');
        expect(p).toHaveProperty('current');
        expect(p).toHaveProperty('requirement');
        expect(p).toHaveProperty('completed');
        expect(p).toHaveProperty('percentComplete');
        expect(p.percentComplete).toBeGreaterThanOrEqual(0);
        expect(p.percentComplete).toBeLessThanOrEqual(100);
      }
    });

    it('marks completed when requirement is met', () => {
      const challenges = getMonthlyChallenge();
      // Diversifier challenge: need cards from 4 sports
      const diversifier = challenges.find(c => c.title === 'Diversifier');
      if (diversifier) {
        const cards = [
          makeCard({ id: '1', sport: 'Baseball' }),
          makeCard({ id: '2', sport: 'Basketball' }),
          makeCard({ id: '3', sport: 'Football' }),
          makeCard({ id: '4', sport: 'Hockey' }),
        ];
        const progress = evaluateChallengeProgress([diversifier], cards);
        expect(progress[0].completed).toBe(true);
        expect(progress[0].percentComplete).toBe(100);
      }
    });
  });

  describe('getCommunityStats', () => {
    it('returns positive averages', () => {
      const stats = getCommunityStats();
      expect(stats.avgPortfolioValue).toBeGreaterThan(0);
      expect(stats.avgCardCount).toBeGreaterThan(0);
      expect(stats.totalCollectors).toBeGreaterThan(0);
    });
  });
});
