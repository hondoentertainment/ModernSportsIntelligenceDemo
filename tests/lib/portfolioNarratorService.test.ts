import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getNarratives,
  generateNarrative,
  getLatestNarrative,
  getNarrativeById,
  getPreferences,
  updatePreferences,
  getPerformanceTimeline,
  getNarratorStats,
  getActionItems,
  getHighlightsByType,
  formatCurrency,
  formatPercent,
  getToneColor,
  getToneLabel,
  getHighlightIcon,
  getPriorityColor,
  NarrativeReport,
  NarrativePeriod,
} from '../../lib/analytics/portfolioNarratorService';

describe('portfolioNarratorService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ---- getNarratives ----
  describe('getNarratives', () => {
    it('returns mock narratives when localStorage is empty', () => {
      const narratives = getNarratives();
      expect(narratives.length).toBeGreaterThanOrEqual(10);
    });

    it('returns narratives sorted by generatedAt descending', () => {
      const narratives = getNarratives();
      for (let i = 1; i < narratives.length; i++) {
        expect(new Date(narratives[i - 1].generatedAt).getTime())
          .toBeGreaterThanOrEqual(new Date(narratives[i].generatedAt).getTime());
      }
    });

    it('each narrative has required fields', () => {
      const narratives = getNarratives();
      for (const n of narratives) {
        expect(n.id).toBeDefined();
        expect(n.title).toBeDefined();
        expect(['daily', 'weekly', 'monthly', 'quarterly']).toContain(n.period);
        expect(n.generatedAt).toBeDefined();
        expect(typeof n.summary).toBe('string');
        expect(Array.isArray(n.highlights)).toBe(true);
        expect(n.portfolioSnapshot).toBeDefined();
        expect(Array.isArray(n.marketInsights)).toBe(true);
        expect(Array.isArray(n.actionItems)).toBe(true);
        expect(['bullish', 'bearish', 'neutral', 'cautious']).toContain(n.tone);
      }
    });
  });

  // ---- generateNarrative ----
  describe('generateNarrative', () => {
    it('generates a daily narrative', () => {
      const report = generateNarrative('daily');
      expect(report.period).toBe('daily');
      expect(report.id).toBeDefined();
      expect(report.generatedAt).toBeDefined();
    });

    it('generates a weekly narrative', () => {
      const report = generateNarrative('weekly');
      expect(report.period).toBe('weekly');
    });

    it('generates a monthly narrative', () => {
      const report = generateNarrative('monthly');
      expect(report.period).toBe('monthly');
    });

    it('generates a quarterly narrative', () => {
      const report = generateNarrative('quarterly');
      expect(report.period).toBe('quarterly');
    });

    it('adds the generated narrative to the stored list', () => {
      const before = getNarratives().length;
      generateNarrative('weekly');
      const after = getNarratives().length;
      expect(after).toBe(before + 1);
    });

    it('generated narrative has valid structure', () => {
      const report = generateNarrative('daily');
      expect(report.highlights.length).toBeGreaterThan(0);
      expect(report.marketInsights.length).toBeGreaterThan(0);
      expect(report.actionItems.length).toBeGreaterThan(0);
      expect(typeof report.portfolioSnapshot.totalValue).toBe('number');
      expect(typeof report.portfolioSnapshot.change).toBe('number');
      expect(typeof report.portfolioSnapshot.changePercent).toBe('number');
    });

    it('generated narrative has a valid tone', () => {
      const report = generateNarrative('weekly');
      expect(['bullish', 'bearish', 'neutral', 'cautious']).toContain(report.tone);
    });
  });

  // ---- getLatestNarrative ----
  describe('getLatestNarrative', () => {
    it('returns the most recent narrative', () => {
      const latest = getLatestNarrative();
      expect(latest).toBeDefined();
      const all = getNarratives();
      expect(latest!.id).toBe(all[0].id);
    });
  });

  // ---- getNarrativeById ----
  describe('getNarrativeById', () => {
    it('returns a narrative by its id', () => {
      const narratives = getNarratives();
      const target = narratives[0];
      const found = getNarrativeById(target.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(target.id);
    });

    it('returns undefined for unknown id', () => {
      const found = getNarrativeById('nonexistent-id');
      expect(found).toBeUndefined();
    });
  });

  // ---- getPreferences ----
  describe('getPreferences', () => {
    it('returns default preferences when none stored', () => {
      const prefs = getPreferences();
      expect(prefs.frequency).toBe('weekly');
      expect(prefs.detailLevel).toBe('detailed');
      expect(prefs.includeMarketContext).toBe(true);
      expect(Array.isArray(prefs.focusAreas)).toBe(true);
      expect(prefs.focusAreas.length).toBeGreaterThan(0);
    });
  });

  // ---- updatePreferences ----
  describe('updatePreferences', () => {
    it('updates frequency preference', () => {
      const updated = updatePreferences({ frequency: 'daily' });
      expect(updated.frequency).toBe('daily');
      expect(getPreferences().frequency).toBe('daily');
    });

    it('updates detail level preference', () => {
      const updated = updatePreferences({ detailLevel: 'brief' });
      expect(updated.detailLevel).toBe('brief');
    });

    it('preserves other preferences when updating one', () => {
      updatePreferences({ frequency: 'monthly' });
      const prefs = getPreferences();
      expect(prefs.frequency).toBe('monthly');
      expect(prefs.detailLevel).toBe('detailed');
      expect(prefs.includeMarketContext).toBe(true);
    });

    it('updates focus areas', () => {
      const updated = updatePreferences({ focusAreas: ['hockey', 'soccer'] });
      expect(updated.focusAreas).toEqual(['hockey', 'soccer']);
    });

    it('toggles market context', () => {
      updatePreferences({ includeMarketContext: false });
      expect(getPreferences().includeMarketContext).toBe(false);
    });
  });

  // ---- getPerformanceTimeline ----
  describe('getPerformanceTimeline', () => {
    it('returns an array of timeline entries', () => {
      const timeline = getPerformanceTimeline();
      expect(Array.isArray(timeline)).toBe(true);
      expect(timeline.length).toBeGreaterThan(0);
    });

    it('each entry has date, portfolioValue, benchmark, delta', () => {
      const timeline = getPerformanceTimeline();
      for (const entry of timeline) {
        expect(typeof entry.date).toBe('string');
        expect(typeof entry.portfolioValue).toBe('number');
        expect(typeof entry.benchmark).toBe('number');
        expect(typeof entry.delta).toBe('number');
      }
    });

    it('returns a copy not the original', () => {
      const a = getPerformanceTimeline();
      const b = getPerformanceTimeline();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  // ---- getNarratorStats ----
  describe('getNarratorStats', () => {
    it('returns valid stats object', () => {
      const stats = getNarratorStats();
      expect(typeof stats.totalReports).toBe('number');
      expect(typeof stats.avgGainReported).toBe('number');
      expect(typeof stats.topHighlight).toBe('string');
      expect(typeof stats.lastGenerated).toBe('string');
      expect(typeof stats.streakDays).toBe('number');
    });

    it('totalReports matches narratives count', () => {
      const stats = getNarratorStats();
      const narratives = getNarratives();
      expect(stats.totalReports).toBe(narratives.length);
    });

    it('avgGainReported is non-negative', () => {
      const stats = getNarratorStats();
      expect(stats.avgGainReported).toBeGreaterThanOrEqual(0);
    });
  });

  // ---- getActionItems ----
  describe('getActionItems', () => {
    it('returns action items from recent reports', () => {
      const items = getActionItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('each action item has priority, action, reasoning', () => {
      const items = getActionItems();
      for (const item of items) {
        expect(['high', 'medium', 'low']).toContain(item.priority);
        expect(typeof item.action).toBe('string');
        expect(typeof item.reasoning).toBe('string');
      }
    });

    it('deduplicates action items by action text', () => {
      const items = getActionItems();
      const actions = items.map((i) => i.action);
      const unique = new Set(actions);
      expect(actions.length).toBe(unique.size);
    });
  });

  // ---- getHighlightsByType ----
  describe('getHighlightsByType', () => {
    it('returns only gain highlights', () => {
      const gains = getHighlightsByType('gain');
      expect(gains.length).toBeGreaterThan(0);
      for (const h of gains) {
        expect(h.type).toBe('gain');
      }
    });

    it('returns only loss highlights', () => {
      const losses = getHighlightsByType('loss');
      expect(losses.length).toBeGreaterThan(0);
      for (const h of losses) {
        expect(h.type).toBe('loss');
      }
    });

    it('returns only milestone highlights', () => {
      const milestones = getHighlightsByType('milestone');
      expect(milestones.length).toBeGreaterThan(0);
      for (const h of milestones) {
        expect(h.type).toBe('milestone');
      }
    });

    it('returns only alert highlights', () => {
      const alerts = getHighlightsByType('alert');
      expect(alerts.length).toBeGreaterThan(0);
      for (const h of alerts) {
        expect(h.type).toBe('alert');
      }
    });
  });

  // ---- formatCurrency ----
  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      const result = formatCurrency(50000);
      expect(result).toContain('50,000');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  // ---- formatPercent ----
  describe('formatPercent', () => {
    it('formats positive percent with plus sign', () => {
      expect(formatPercent(3.2)).toBe('+3.2%');
    });

    it('formats negative percent with minus sign', () => {
      expect(formatPercent(-1.1)).toBe('-1.1%');
    });

    it('formats zero percent', () => {
      expect(formatPercent(0)).toBe('+0.0%');
    });
  });

  // ---- getToneColor ----
  describe('getToneColor', () => {
    it('returns green for bullish', () => {
      expect(getToneColor('bullish')).toContain('green');
    });

    it('returns red for bearish', () => {
      expect(getToneColor('bearish')).toContain('red');
    });

    it('returns slate for neutral', () => {
      expect(getToneColor('neutral')).toContain('slate');
    });

    it('returns yellow for cautious', () => {
      expect(getToneColor('cautious')).toContain('yellow');
    });
  });

  // ---- getToneLabel ----
  describe('getToneLabel', () => {
    it('returns correct labels', () => {
      expect(getToneLabel('bullish')).toBe('Bullish');
      expect(getToneLabel('bearish')).toBe('Bearish');
      expect(getToneLabel('neutral')).toBe('Neutral');
      expect(getToneLabel('cautious')).toBe('Cautious');
    });
  });

  // ---- getHighlightIcon ----
  describe('getHighlightIcon', () => {
    it('returns correct icon names', () => {
      expect(getHighlightIcon('gain')).toBe('TrendingUp');
      expect(getHighlightIcon('loss')).toBe('TrendingDown');
      expect(getHighlightIcon('milestone')).toBe('Award');
      expect(getHighlightIcon('alert')).toBe('AlertTriangle');
    });
  });

  // ---- getPriorityColor ----
  describe('getPriorityColor', () => {
    it('returns red for high priority', () => {
      expect(getPriorityColor('high')).toContain('red');
    });

    it('returns yellow for medium priority', () => {
      expect(getPriorityColor('medium')).toContain('yellow');
    });

    it('returns blue for low priority', () => {
      expect(getPriorityColor('low')).toContain('blue');
    });
  });
});
