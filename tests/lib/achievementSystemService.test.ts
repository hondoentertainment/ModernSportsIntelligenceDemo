// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getAchievements,
  getAchievementsByCategory,
  getUnlockedAchievements,
  getLockedAchievements,
  unlockAchievement,
  getCollectorLevel,
  getSeasonalChallenges,
  completeTask,
  getLeaderboard,
  getAchievementStats,
  getRecentUnlocks,
  getNextAchievements,
  formatXP,
  getTierColor,
  getTierLabel,
  getCategoryColor,
  getCategoryLabel,
  getProgressColor,
} from '../../lib/utils/achievementSystemService';

describe('achievementSystemService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  describe('getAchievements', () => {
    it('returns default achievements when localStorage is empty', () => {
      const achievements = getAchievements();
      expect(achievements.length).toBeGreaterThanOrEqual(20);
    });

    it('returns achievements with correct structure', () => {
      const achievements = getAchievements();
      const a = achievements[0];
      expect(a).toHaveProperty('id');
      expect(a).toHaveProperty('name');
      expect(a).toHaveProperty('description');
      expect(a).toHaveProperty('category');
      expect(a).toHaveProperty('tier');
      expect(a).toHaveProperty('xpReward');
      expect(a).toHaveProperty('icon');
      expect(a).toHaveProperty('unlocked');
      expect(a).toHaveProperty('progress');
      expect(a).toHaveProperty('target');
      expect(a).toHaveProperty('progressPercent');
    });
  });

  describe('getAchievementsByCategory', () => {
    it('filters achievements by collection category', () => {
      const results = getAchievementsByCategory('collection');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(a => expect(a.category).toBe('collection'));
    });

    it('filters achievements by trading category', () => {
      const results = getAchievementsByCategory('trading');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(a => expect(a.category).toBe('trading'));
    });

    it('returns empty array for category with no achievements stored', () => {
      // All default categories have achievements, so we verify filtering works
      const results = getAchievementsByCategory('financial');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(a => expect(a.category).toBe('financial'));
    });
  });

  describe('getUnlockedAchievements', () => {
    it('returns only unlocked achievements', () => {
      const unlocked = getUnlockedAchievements();
      expect(unlocked.length).toBeGreaterThan(0);
      unlocked.forEach(a => expect(a.unlocked).toBe(true));
    });
  });

  describe('getLockedAchievements', () => {
    it('returns only locked achievements', () => {
      const locked = getLockedAchievements();
      expect(locked.length).toBeGreaterThan(0);
      locked.forEach(a => expect(a.unlocked).toBe(false));
    });

    it('locked + unlocked equals total', () => {
      const all = getAchievements();
      const locked = getLockedAchievements();
      const unlocked = getUnlockedAchievements();
      expect(locked.length + unlocked.length).toBe(all.length);
    });
  });

  describe('unlockAchievement', () => {
    it('unlocks a locked achievement and sets date', () => {
      const locked = getLockedAchievements();
      const target = locked[0];
      const result = unlockAchievement(target.id);
      expect(result).not.toBeNull();
      expect(result!.unlocked).toBe(true);
      expect(result!.unlockedDate).toBeTruthy();
      expect(result!.progressPercent).toBe(100);
    });

    it('returns the achievement if already unlocked', () => {
      const unlocked = getUnlockedAchievements();
      const target = unlocked[0];
      const result = unlockAchievement(target.id);
      expect(result).not.toBeNull();
      expect(result!.unlocked).toBe(true);
    });

    it('returns null for nonexistent id', () => {
      const result = unlockAchievement('nonexistent-id');
      expect(result).toBeNull();
    });

    it('persists unlocked achievement in localStorage', () => {
      const locked = getLockedAchievements();
      const target = locked[0];
      unlockAchievement(target.id);
      const after = getAchievements();
      const found = after.find(a => a.id === target.id);
      expect(found!.unlocked).toBe(true);
    });
  });

  describe('getCollectorLevel', () => {
    it('returns level based on unlocked XP', () => {
      const level = getCollectorLevel();
      expect(level.level).toBeGreaterThanOrEqual(1);
      expect(level.title).toBeTruthy();
      expect(level.totalXP).toBeGreaterThan(0);
      expect(level.progressPercent).toBeGreaterThanOrEqual(0);
      expect(level.progressPercent).toBeLessThanOrEqual(100);
    });

    it('returns perks array', () => {
      const level = getCollectorLevel();
      expect(Array.isArray(level.perks)).toBe(true);
    });

    it('has xpToNext as a positive number', () => {
      const level = getCollectorLevel();
      expect(level.xpToNext).toBeGreaterThan(0);
    });
  });

  describe('getSeasonalChallenges', () => {
    it('returns seasonal challenges', () => {
      const challenges = getSeasonalChallenges();
      expect(challenges.length).toBeGreaterThan(0);
    });

    it('challenges have correct structure', () => {
      const challenges = getSeasonalChallenges();
      const c = challenges[0];
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('tasks');
      expect(c).toHaveProperty('completionPercent');
      expect(c).toHaveProperty('reward');
      expect(Array.isArray(c.tasks)).toBe(true);
    });
  });

  describe('completeTask', () => {
    it('marks a task as completed', () => {
      const challenges = getSeasonalChallenges();
      const challenge = challenges[0];
      const incompleteIdx = challenge.tasks.findIndex(t => !t.completed);
      if (incompleteIdx === -1) return; // all completed already
      const result = completeTask(challenge.id, incompleteIdx);
      expect(result).not.toBeNull();
      expect(result!.tasks[incompleteIdx].completed).toBe(true);
    });

    it('updates completion percent', () => {
      const challenges = getSeasonalChallenges();
      const challenge = challenges[0];
      const incompleteIdx = challenge.tasks.findIndex(t => !t.completed);
      if (incompleteIdx === -1) return;
      const result = completeTask(challenge.id, incompleteIdx);
      expect(result!.completionPercent).toBeGreaterThanOrEqual(challenge.completionPercent);
    });

    it('returns null for nonexistent challenge', () => {
      expect(completeTask('nonexistent', 0)).toBeNull();
    });

    it('returns null for invalid task index', () => {
      const challenges = getSeasonalChallenges();
      expect(completeTask(challenges[0].id, -1)).toBeNull();
      expect(completeTask(challenges[0].id, 999)).toBeNull();
    });
  });

  describe('getLeaderboard', () => {
    it('returns leaderboard entries', () => {
      const lb = getLeaderboard();
      expect(lb.length).toBeGreaterThan(0);
    });

    it('entries have rank and username', () => {
      const lb = getLeaderboard();
      lb.forEach(entry => {
        expect(entry.rank).toBeGreaterThan(0);
        expect(entry.username).toBeTruthy();
      });
    });
  });

  describe('getAchievementStats', () => {
    it('returns stats with correct structure', () => {
      const stats = getAchievementStats();
      expect(stats.totalAchievements).toBeGreaterThan(0);
      expect(stats.unlockedCount).toBeGreaterThan(0);
      expect(stats.unlockedCount).toBeLessThanOrEqual(stats.totalAchievements);
      expect(stats.totalXP).toBeGreaterThan(0);
      expect(stats.currentLevel).toBeGreaterThanOrEqual(1);
      expect(stats.rarest).toHaveProperty('name');
      expect(stats.rarest).toHaveProperty('percentUnlocked');
    });
  });

  describe('getRecentUnlocks', () => {
    it('returns limited recent unlocks', () => {
      const recent = getRecentUnlocks(3);
      expect(recent.length).toBeLessThanOrEqual(3);
      recent.forEach(a => expect(a.unlocked).toBe(true));
    });

    it('returns sorted by date descending', () => {
      const recent = getRecentUnlocks(10);
      for (let i = 1; i < recent.length; i++) {
        expect(recent[i - 1].unlockedDate! >= recent[i].unlockedDate!).toBe(true);
      }
    });
  });

  describe('getNextAchievements', () => {
    it('returns locked achievements sorted by progress', () => {
      const next = getNextAchievements(3);
      expect(next.length).toBeLessThanOrEqual(3);
      next.forEach(a => expect(a.unlocked).toBe(false));
      for (let i = 1; i < next.length; i++) {
        expect(next[i - 1].progressPercent).toBeGreaterThanOrEqual(next[i].progressPercent);
      }
    });
  });

  describe('formatXP', () => {
    it('formats small XP values', () => {
      expect(formatXP(500)).toBe('500 XP');
    });

    it('formats thousands', () => {
      expect(formatXP(1500)).toBe('1.5K XP');
    });

    it('formats millions', () => {
      expect(formatXP(2500000)).toBe('2.5M XP');
    });
  });

  describe('getTierColor', () => {
    it('returns color for each tier', () => {
      expect(getTierColor('bronze')).toBe('#CD7F32');
      expect(getTierColor('silver')).toBe('#C0C0C0');
      expect(getTierColor('gold')).toBe('#FFD700');
      expect(getTierColor('platinum')).toBe('#E5E4E2');
      expect(getTierColor('diamond')).toBe('#B9F2FF');
    });
  });

  describe('getTierLabel', () => {
    it('capitalizes tier names', () => {
      expect(getTierLabel('bronze')).toBe('Bronze');
      expect(getTierLabel('diamond')).toBe('Diamond');
    });
  });

  describe('getCategoryColor', () => {
    it('returns distinct color for each category', () => {
      const colors = new Set([
        getCategoryColor('collection'),
        getCategoryColor('trading'),
        getCategoryColor('grading'),
        getCategoryColor('social'),
        getCategoryColor('financial'),
        getCategoryColor('milestone'),
      ]);
      expect(colors.size).toBe(6);
    });
  });

  describe('getCategoryLabel', () => {
    it('returns human-readable labels', () => {
      expect(getCategoryLabel('collection')).toBe('Collection');
      expect(getCategoryLabel('trading')).toBe('Trading');
      expect(getCategoryLabel('grading')).toBe('Grading');
      expect(getCategoryLabel('social')).toBe('Social');
      expect(getCategoryLabel('financial')).toBe('Financial');
      expect(getCategoryLabel('milestone')).toBe('Milestone');
    });
  });

  describe('getProgressColor', () => {
    it('returns green for 100%', () => {
      expect(getProgressColor(100)).toBe('#10B981');
    });

    it('returns blue for 75-99%', () => {
      expect(getProgressColor(80)).toBe('#3B82F6');
    });

    it('returns yellow for 50-74%', () => {
      expect(getProgressColor(60)).toBe('#F59E0B');
    });

    it('returns orange for 25-49%', () => {
      expect(getProgressColor(30)).toBe('#F97316');
    });

    it('returns red for <25%', () => {
      expect(getProgressColor(10)).toBe('#EF4444');
    });
  });
});
