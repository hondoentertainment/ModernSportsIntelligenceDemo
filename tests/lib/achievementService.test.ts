// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  evaluateAchievements,
  getAchievementSummary,
  getAchievementCategories,
  getRecentlyUnlocked,
  markAsSeen,
  calculateLevel,
} from '../../lib/utils/achievementService';
import { makeCard, setupLocalStorageMock } from '../helpers';

const localStorageMock = setupLocalStorageMock();

describe('achievementService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('evaluateAchievements', () => {
    it('returns all achievement definitions', () => {
      const achievements = evaluateAchievements([]);
      expect(achievements.length).toBeGreaterThan(30);
      for (const a of achievements) {
        expect(a.id).toBeTruthy();
        expect(a.name).toBeTruthy();
        expect(a.category).toBeTruthy();
        expect(a.tier).toBeTruthy();
        expect(a.progress).toBeGreaterThanOrEqual(0);
        expect(a.progress).toBeLessThanOrEqual(100);
      }
    });

    it('unlocks first_card with 1 card', () => {
      const achievements = evaluateAchievements([makeCard()]);
      const firstCard = achievements.find(a => a.id === 'first_card')!;
      expect(firstCard.isUnlocked).toBe(true);
      expect(firstCard.progress).toBe(100);
    });

    it('nothing unlocked for empty inventory', () => {
      const achievements = evaluateAchievements([]);
      const unlocked = achievements.filter(a => a.isUnlocked);
      expect(unlocked).toHaveLength(0);
    });

    it('calculates progress correctly for partial completion', () => {
      const cards = Array.from({ length: 5 }, (_, i) => makeCard({ id: `c${i}` }));
      const achievements = evaluateAchievements(cards);
      const starterPack = achievements.find(a => a.id === 'starter_pack')!;
      expect(starterPack.progress).toBe(50); // 5/10
      expect(starterPack.isUnlocked).toBe(false);
    });

    it('unlocks grade_getter for graded cards', () => {
      const card = makeCard({ isGraded: true, gradingCompany: 'PSA', grade: '10' });
      const achievements = evaluateAchievements([card]);
      const gradeGetter = achievements.find(a => a.id === 'grade_getter')!;
      expect(gradeGetter.isUnlocked).toBe(true);
    });

    it('unlocks multi_sport with 3 sports', () => {
      const cards = [
        makeCard({ id: '1', sport: 'Baseball' }),
        makeCard({ id: '2', sport: 'Basketball' }),
        makeCard({ id: '3', sport: 'Football' }),
      ];
      const achievements = evaluateAchievements(cards);
      const multiSport = achievements.find(a => a.id === 'multi_sport')!;
      expect(multiSport.isUnlocked).toBe(true);
    });

    it('unlocks first_sale for sold cards', () => {
      const card = makeCard({ status: 'sold', salePrice: 150 });
      const achievements = evaluateAchievements([card]);
      const firstSale = achievements.find(a => a.id === 'first_sale')!;
      expect(firstSale.isUnlocked).toBe(true);
    });

    it('unlocks value_surge when card doubles in value', () => {
      const card = makeCard({ purchasePrice: 50, currentValue: 110 });
      const achievements = evaluateAchievements([card]);
      const surge = achievements.find(a => a.id === 'value_surge')!;
      expect(surge.isUnlocked).toBe(true);
    });

    it('unlocks perfect_10 for PSA 10', () => {
      const card = makeCard({ isGraded: true, gradingCompany: 'PSA', grade: '10' });
      const achievements = evaluateAchievements([card]);
      const perfect = achievements.find(a => a.id === 'perfect_10')!;
      expect(perfect.isUnlocked).toBe(true);
    });
  });

  describe('getAchievementSummary', () => {
    it('returns correct summary for empty inventory', () => {
      const summary = getAchievementSummary([]);
      expect(summary.totalUnlocked).toBe(0);
      expect(summary.totalAvailable).toBeGreaterThan(30);
      expect(summary.completionPercent).toBe(0);
      expect(summary.pointsEarned).toBe(0);
      expect(summary.level).toBe(1);
    });

    it('returns unlocked achievements and points', () => {
      const cards = Array.from({ length: 10 }, (_, i) => makeCard({ id: `c${i}` }));
      const summary = getAchievementSummary(cards);
      expect(summary.totalUnlocked).toBeGreaterThan(0);
      expect(summary.pointsEarned).toBeGreaterThan(0);
      expect(summary.completionPercent).toBeGreaterThan(0);
    });

    it('provides next to unlock suggestions sorted by progress', () => {
      const summary = getAchievementSummary([makeCard()]);
      expect(summary.nextToUnlock.length).toBeGreaterThan(0);
      for (let i = 1; i < summary.nextToUnlock.length; i++) {
        expect(summary.nextToUnlock[i].progress).toBeLessThanOrEqual(
          summary.nextToUnlock[i - 1].progress
        );
      }
    });
  });

  describe('getAchievementCategories', () => {
    it('returns 5 categories', () => {
      const achievements = evaluateAchievements([]);
      const categories = getAchievementCategories(achievements);
      expect(categories).toHaveLength(5);
      const ids = categories.map(c => c.id);
      expect(ids).toContain('collection');
      expect(ids).toContain('trading');
      expect(ids).toContain('grading');
      expect(ids).toContain('diversification');
      expect(ids).toContain('value');
    });

    it('counts unlocked correctly per category', () => {
      const cards = Array.from({ length: 10 }, (_, i) => makeCard({ id: `c${i}` }));
      const achievements = evaluateAchievements(cards);
      const categories = getAchievementCategories(achievements);
      const collection = categories.find(c => c.id === 'collection')!;
      expect(collection.unlockedCount).toBeGreaterThan(0);
      expect(collection.unlockedCount).toBeLessThanOrEqual(collection.count);
    });
  });

  describe('getRecentlyUnlocked', () => {
    it('returns new unlocks not yet seen', () => {
      const recent = getRecentlyUnlocked([makeCard()]);
      const firstCard = recent.find(a => a.id === 'first_card');
      expect(firstCard).toBeDefined();
    });

    it('excludes seen achievements', () => {
      markAsSeen('first_card');
      const recent = getRecentlyUnlocked([makeCard()]);
      const firstCard = recent.find(a => a.id === 'first_card');
      expect(firstCard).toBeUndefined();
    });
  });

  describe('markAsSeen', () => {
    it('accumulates seen ids', () => {
      markAsSeen('first_card');
      markAsSeen('starter_pack');
      // Verify via getRecentlyUnlocked (public API) that these are excluded
      const cards = Array.from({ length: 10 }, (_, i) => makeCard({ id: `c${i}` }));
      const recent = getRecentlyUnlocked(cards);
      expect(recent.find(a => a.id === 'first_card')).toBeUndefined();
      expect(recent.find(a => a.id === 'starter_pack')).toBeUndefined();
    });
  });

  describe('calculateLevel', () => {
    it('returns level 1 for 0 points', () => {
      const { level } = calculateLevel(0);
      expect(level).toBe(1);
    });

    it('returns level 1 for small points', () => {
      const { level } = calculateLevel(5);
      expect(level).toBe(1);
    });

    it('increases level with more points', () => {
      const l1 = calculateLevel(10);
      const l2 = calculateLevel(100);
      const l3 = calculateLevel(1000);
      expect(l2.level).toBeGreaterThanOrEqual(l1.level);
      expect(l3.level).toBeGreaterThan(l2.level);
    });

    it('caps at level 50', () => {
      const { level } = calculateLevel(1000000);
      expect(level).toBe(50);
    });

    it('level progress is between 0 and 100', () => {
      for (const pts of [0, 10, 50, 100, 500, 1000]) {
        const { levelProgress } = calculateLevel(pts);
        expect(levelProgress).toBeGreaterThanOrEqual(0);
        expect(levelProgress).toBeLessThanOrEqual(100);
      }
    });
  });
});
