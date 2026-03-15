import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getGuides,
  getGuideById,
  getGuidesByCategory,
  getChecklists,
  createChecklist,
  updateChecklistItem,
  getCommonMistakes,
  getMistakesBySeverity,
  getHolderRecommendations,
  getSubmissionTips,
  getPrepStats,
  formatTime,
  getCategoryColor,
  getCategoryLabel,
  getDifficultyColor,
  getSeverityColor,
  getFrequencyLabel,
  type PrepGuide,
  type SubmissionChecklist,
  type CommonMistake,
  type HolderRecommendation,
  type PrepStats,
} from '../../lib/gradingPrepService';

describe('gradingPrepService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ---- getGuides ----
  describe('getGuides', () => {
    it('returns mock guides on first load', () => {
      const guides = getGuides();
      expect(guides.length).toBeGreaterThanOrEqual(12);
    });

    it('persists guides to localStorage', () => {
      getGuides();
      const stored = localStorage.getItem('msi_grading_prep_guides');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('returns same data on subsequent calls', () => {
      const first = getGuides();
      const second = getGuides();
      expect(first).toEqual(second);
    });

    it('each guide has required fields', () => {
      const guides = getGuides();
      guides.forEach((g) => {
        expect(g.id).toBeTruthy();
        expect(g.title).toBeTruthy();
        expect(['cleaning', 'holders', 'submission', 'inspection', 'shipping']).toContain(g.category);
        expect(['beginner', 'intermediate', 'advanced']).toContain(g.difficulty);
        expect(g.steps.length).toBeGreaterThan(0);
        expect(g.tools.length).toBeGreaterThan(0);
        expect(g.estimatedTime).toBeTruthy();
      });
    });
  });

  // ---- getGuideById ----
  describe('getGuideById', () => {
    it('returns a guide when given a valid id', () => {
      const guide = getGuideById('guide-1');
      expect(guide).toBeDefined();
      expect(guide!.id).toBe('guide-1');
    });

    it('returns undefined for non-existent id', () => {
      const guide = getGuideById('non-existent');
      expect(guide).toBeUndefined();
    });
  });

  // ---- getGuidesByCategory ----
  describe('getGuidesByCategory', () => {
    it('returns only guides matching the category', () => {
      const cleaning = getGuidesByCategory('cleaning');
      cleaning.forEach((g) => expect(g.category).toBe('cleaning'));
      expect(cleaning.length).toBeGreaterThan(0);
    });

    it('returns different results for different categories', () => {
      const cleaning = getGuidesByCategory('cleaning');
      const shipping = getGuidesByCategory('shipping');
      expect(cleaning).not.toEqual(shipping);
    });
  });

  // ---- getChecklists / createChecklist ----
  describe('getChecklists', () => {
    it('returns empty array on first load', () => {
      const checklists = getChecklists();
      expect(checklists).toEqual([]);
    });
  });

  describe('createChecklist', () => {
    it('creates a checklist with generated id and timestamps', () => {
      const checklist = createChecklist({
        cardName: '2023 Topps Chrome',
        player: 'Julio Rodriguez',
        items: [
          { task: 'Inspect surface', completed: false, category: 'inspection' },
          { task: 'Clean card', completed: false, category: 'cleaning' },
        ],
        notes: 'First submission',
      });
      expect(checklist.id).toContain('checklist-');
      expect(checklist.createdAt).toBeTruthy();
      expect(checklist.completionPercent).toBe(0);
    });

    it('calculates completion percent correctly with some items completed', () => {
      const checklist = createChecklist({
        cardName: 'Test Card',
        player: 'Test Player',
        items: [
          { task: 'Task 1', completed: true, category: 'inspection' },
          { task: 'Task 2', completed: false, category: 'cleaning' },
        ],
        notes: '',
      });
      expect(checklist.completionPercent).toBe(50);
    });

    it('persists checklist to localStorage', () => {
      createChecklist({
        cardName: 'Test',
        player: 'Player',
        items: [{ task: 'Task', completed: false, category: 'test' }],
        notes: '',
      });
      const checklists = getChecklists();
      expect(checklists.length).toBe(1);
    });
  });

  // ---- updateChecklistItem ----
  describe('updateChecklistItem', () => {
    it('updates item completion status', () => {
      const checklist = createChecklist({
        cardName: 'Test',
        player: 'Player',
        items: [
          { task: 'Task 1', completed: false, category: 'test' },
          { task: 'Task 2', completed: false, category: 'test' },
        ],
        notes: '',
      });
      const updated = updateChecklistItem(checklist.id, 0, true);
      expect(updated).toBeDefined();
      expect(updated!.items[0].completed).toBe(true);
      expect(updated!.completionPercent).toBe(50);
    });

    it('returns undefined for non-existent checklist', () => {
      const result = updateChecklistItem('fake-id', 0, true);
      expect(result).toBeUndefined();
    });

    it('returns undefined for out-of-range task index', () => {
      const checklist = createChecklist({
        cardName: 'Test',
        player: 'Player',
        items: [{ task: 'Task', completed: false, category: 'test' }],
        notes: '',
      });
      const result = updateChecklistItem(checklist.id, 5, true);
      expect(result).toBeUndefined();
    });
  });

  // ---- getCommonMistakes ----
  describe('getCommonMistakes', () => {
    it('returns mock mistakes on first load', () => {
      const mistakes = getCommonMistakes();
      expect(mistakes.length).toBeGreaterThanOrEqual(12);
    });

    it('each mistake has required fields', () => {
      const mistakes = getCommonMistakes();
      mistakes.forEach((m) => {
        expect(m.id).toBeTruthy();
        expect(m.title).toBeTruthy();
        expect(m.description).toBeTruthy();
        expect(['minor', 'major', 'critical']).toContain(m.severity);
        expect(['common', 'occasional', 'rare']).toContain(m.frequency);
        expect(m.prevention).toBeTruthy();
      });
    });
  });

  // ---- getMistakesBySeverity ----
  describe('getMistakesBySeverity', () => {
    it('returns only mistakes matching the severity', () => {
      const critical = getMistakesBySeverity('critical');
      critical.forEach((m) => expect(m.severity).toBe('critical'));
      expect(critical.length).toBeGreaterThan(0);
    });
  });

  // ---- getHolderRecommendations ----
  describe('getHolderRecommendations', () => {
    it('returns recommendations for standard card size', () => {
      const recs = getHolderRecommendations('standard');
      expect(recs.length).toBeGreaterThan(0);
      recs.forEach((r) => expect(r.cardSize).toBe('standard'));
    });

    it('returns recommendations for thick card size', () => {
      const recs = getHolderRecommendations('thick');
      expect(recs.length).toBeGreaterThan(0);
      recs.forEach((r) => expect(r.cardSize).toBe('thick'));
    });

    it('each recommendation has required fields', () => {
      const recs = getHolderRecommendations('standard');
      recs.forEach((r) => {
        expect(r.holderType).toBeTruthy();
        expect(r.brand).toBeTruthy();
        expect(typeof r.cost).toBe('number');
        expect(r.fits).toBeTruthy();
        expect(typeof r.recommended).toBe('boolean');
      });
    });
  });

  // ---- getSubmissionTips ----
  describe('getSubmissionTips', () => {
    it('returns an array of tips', () => {
      const tips = getSubmissionTips();
      expect(tips.length).toBeGreaterThan(0);
      tips.forEach((t) => expect(typeof t).toBe('string'));
    });

    it('returns a copy, not a reference', () => {
      const tips1 = getSubmissionTips();
      const tips2 = getSubmissionTips();
      expect(tips1).toEqual(tips2);
      expect(tips1).not.toBe(tips2);
    });
  });

  // ---- getPrepStats ----
  describe('getPrepStats', () => {
    it('returns stats object with required fields', () => {
      const stats = getPrepStats();
      expect(typeof stats.totalGuidesRead).toBe('number');
      expect(typeof stats.checklistsCompleted).toBe('number');
      expect(typeof stats.avgCompletionRate).toBe('number');
      expect(typeof stats.topCategory).toBe('string');
      expect(typeof stats.mistakesAvoided).toBe('number');
    });

    it('reflects guide count', () => {
      const stats = getPrepStats();
      const guides = getGuides();
      expect(stats.totalGuidesRead).toBe(guides.length);
    });
  });

  // ---- formatTime ----
  describe('formatTime', () => {
    it('formats minutes under 60', () => {
      expect(formatTime(5)).toBe('5 mins');
      expect(formatTime(1)).toBe('1 min');
    });

    it('formats exact hours', () => {
      expect(formatTime(60)).toBe('1 hr');
      expect(formatTime(120)).toBe('2 hrs');
    });

    it('formats hours and minutes', () => {
      expect(formatTime(90)).toBe('1 hr 30 mins');
      expect(formatTime(61)).toBe('1 hr 1 min');
    });
  });

  // ---- getCategoryColor ----
  describe('getCategoryColor', () => {
    it('returns a color string for each category', () => {
      expect(getCategoryColor('cleaning')).toBe('#3b82f6');
      expect(getCategoryColor('holders')).toBe('#8b5cf6');
      expect(getCategoryColor('submission')).toBe('#10b981');
      expect(getCategoryColor('inspection')).toBe('#f59e0b');
      expect(getCategoryColor('shipping')).toBe('#ef4444');
    });
  });

  // ---- getCategoryLabel ----
  describe('getCategoryLabel', () => {
    it('returns proper labels', () => {
      expect(getCategoryLabel('cleaning')).toBe('Cleaning');
      expect(getCategoryLabel('holders')).toBe('Holders');
      expect(getCategoryLabel('submission')).toBe('Submission');
      expect(getCategoryLabel('inspection')).toBe('Inspection');
      expect(getCategoryLabel('shipping')).toBe('Shipping');
    });
  });

  // ---- getDifficultyColor ----
  describe('getDifficultyColor', () => {
    it('returns correct colors', () => {
      expect(getDifficultyColor('beginner')).toBe('#22c55e');
      expect(getDifficultyColor('intermediate')).toBe('#f59e0b');
      expect(getDifficultyColor('advanced')).toBe('#ef4444');
    });
  });

  // ---- getSeverityColor ----
  describe('getSeverityColor', () => {
    it('returns correct colors', () => {
      expect(getSeverityColor('minor')).toBe('#f59e0b');
      expect(getSeverityColor('major')).toBe('#f97316');
      expect(getSeverityColor('critical')).toBe('#ef4444');
    });
  });

  // ---- getFrequencyLabel ----
  describe('getFrequencyLabel', () => {
    it('returns correct labels', () => {
      expect(getFrequencyLabel('common')).toBe('Common');
      expect(getFrequencyLabel('occasional')).toBe('Occasional');
      expect(getFrequencyLabel('rare')).toBe('Rare');
    });
  });
});
