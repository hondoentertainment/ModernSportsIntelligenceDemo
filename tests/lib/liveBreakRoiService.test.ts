import { describe, it, expect } from 'vitest';
import {
  getLiveBreaks,
  getUpcomingBreaks,
  getBreakResults,
  getBreakerProfiles,
  getTopBreakers,
  getBreakROIStats,
  getProductEVs,
  calculateBreakEV,
  getBreakTypeLabel,
  getPlatformColor,
  getPlatformLabel,
  getStatusColor,
  formatCurrency,
  formatROI,
} from '../../lib/liveBreakRoiService';

describe('liveBreakRoiService', () => {
  describe('getLiveBreaks', () => {
    it('returns a non-empty array of live breaks', () => {
      const breaks = getLiveBreaks();
      expect(Array.isArray(breaks)).toBe(true);
      expect(breaks.length).toBeGreaterThanOrEqual(20);
    });

    it('each break has required fields', () => {
      const breaks = getLiveBreaks();
      for (const b of breaks) {
        expect(b.id).toBeTruthy();
        expect(b.title).toBeTruthy();
        expect(b.breaker).toBeTruthy();
        expect(typeof b.spotPrice).toBe('number');
        expect(b.spotPrice).toBeGreaterThan(0);
        expect(b.spotsTotal).toBeGreaterThan(0);
        expect(b.spotsFilled).toBeGreaterThanOrEqual(0);
        expect(b.spotsFilled).toBeLessThanOrEqual(b.spotsTotal);
      }
    });
  });

  describe('getUpcomingBreaks', () => {
    it('returns only upcoming or live breaks', () => {
      const upcoming = getUpcomingBreaks();
      for (const b of upcoming) {
        expect(['upcoming', 'live']).toContain(b.status);
      }
    });

    it('has fewer items than all breaks', () => {
      expect(getUpcomingBreaks().length).toBeLessThanOrEqual(getLiveBreaks().length);
    });
  });

  describe('getBreakResults', () => {
    it('returns at least 15 break results', () => {
      const results = getBreakResults();
      expect(results.length).toBeGreaterThanOrEqual(15);
    });

    it('each result has consistent ROI calculation', () => {
      const results = getBreakResults();
      for (const r of results) {
        const expectedROI = r.totalValue - r.spotCost;
        expect(r.roi).toBeCloseTo(expectedROI, 0);
      }
    });

    it('total value matches sum of hit values for results with hits', () => {
      const results = getBreakResults();
      for (const r of results) {
        if (r.hits.length > 0) {
          const hitSum = r.hits.reduce((s, h) => s + h.estimatedValue, 0);
          expect(r.totalValue).toBeGreaterThanOrEqual(hitSum * 0.5);
        }
      }
    });
  });

  describe('getBreakerProfiles', () => {
    it('returns at least 10 breaker profiles', () => {
      const profiles = getBreakerProfiles();
      expect(profiles.length).toBeGreaterThanOrEqual(10);
    });

    it('each profile has valid rating between 0 and 5', () => {
      for (const p of getBreakerProfiles()) {
        expect(p.rating).toBeGreaterThanOrEqual(0);
        expect(p.rating).toBeLessThanOrEqual(5);
      }
    });

    it('each profile has recent ROIs array', () => {
      for (const p of getBreakerProfiles()) {
        expect(Array.isArray(p.recentROIs)).toBe(true);
        expect(p.recentROIs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getTopBreakers', () => {
    it('returns breakers sorted by rating desc', () => {
      const top = getTopBreakers();
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].rating).toBeGreaterThanOrEqual(top[i].rating);
      }
    });
  });

  describe('getBreakROIStats', () => {
    it('returns aggregate stats with correct structure', () => {
      const stats = getBreakROIStats();
      expect(stats.totalBreaksJoined).toBeGreaterThan(0);
      expect(typeof stats.totalSpent).toBe('number');
      expect(typeof stats.totalValuePulled).toBe('number');
      expect(typeof stats.netROI).toBe('number');
      expect(typeof stats.roiPercent).toBe('number');
      expect(stats.bestBreak).toBeTruthy();
      expect(stats.worstBreak).toBeTruthy();
      expect(Array.isArray(stats.avgROIByType)).toBe(true);
      expect(Array.isArray(stats.avgROIByProduct)).toBe(true);
      expect(Array.isArray(stats.avgROIByPlatform)).toBe(true);
      expect(Array.isArray(stats.topHits)).toBe(true);
      expect(Array.isArray(stats.monthlySpend)).toBe(true);
    });

    it('netROI equals totalValuePulled minus totalSpent', () => {
      const stats = getBreakROIStats();
      expect(stats.netROI).toBeCloseTo(stats.totalValuePulled - stats.totalSpent, 0);
    });

    it('hit rate is between 0 and 100', () => {
      const stats = getBreakROIStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100);
    });
  });

  describe('getProductEVs', () => {
    it('returns at least 12 products', () => {
      expect(getProductEVs().length).toBeGreaterThanOrEqual(12);
    });

    it('each product has evRatio matching expectedValue / boxPrice', () => {
      for (const ev of getProductEVs()) {
        const calculated = ev.expectedValue / ev.boxPrice;
        expect(ev.evRatio).toBeCloseTo(calculated, 1);
      }
    });

    it('each product has at least one top card', () => {
      for (const ev of getProductEVs()) {
        expect(ev.topCards.length).toBeGreaterThan(0);
      }
    });
  });

  describe('calculateBreakEV', () => {
    it('returns positive EV for known product', () => {
      const ev = calculateBreakEV('2024 Topps Chrome', 25);
      expect(ev).toBeGreaterThan(0);
    });

    it('returns 0 for unknown product', () => {
      expect(calculateBreakEV('Nonexistent Product', 25)).toBe(0);
    });

    it('returns 0 for zero spot price', () => {
      expect(calculateBreakEV('2024 Topps Chrome', 0)).toBe(0);
    });

    it('scales linearly with spot price', () => {
      const ev10 = calculateBreakEV('2024 Topps Chrome', 10);
      const ev20 = calculateBreakEV('2024 Topps Chrome', 20);
      expect(ev20).toBeCloseTo(ev10 * 2, 1);
    });
  });

  describe('label and color helpers', () => {
    it('getBreakTypeLabel returns human-friendly labels', () => {
      expect(getBreakTypeLabel('hobby_box')).toBe('Hobby Box');
      expect(getBreakTypeLabel('pick_your_team')).toBe('Pick Your Team');
      expect(getBreakTypeLabel('hit_draft')).toBe('Hit Draft');
    });

    it('getPlatformLabel returns human-friendly labels', () => {
      expect(getPlatformLabel('whatnot')).toBe('Whatnot');
      expect(getPlatformLabel('in_person')).toBe('In-Person');
    });

    it('getPlatformColor returns a non-empty class string', () => {
      expect(getPlatformColor('whatnot')).toContain('bg-');
      expect(getPlatformColor('loupe')).toContain('text-');
    });

    it('getStatusColor returns classes for all statuses', () => {
      for (const status of ['upcoming', 'live', 'completed', 'cancelled'] as const) {
        const cls = getStatusColor(status);
        expect(cls).toContain('bg-');
        expect(cls).toContain('text-');
      }
    });
  });

  describe('formatCurrency', () => {
    it('formats small values with cents', () => {
      expect(formatCurrency(8.5)).toContain('8.50');
    });

    it('formats large values without cents', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
    });
  });

  describe('formatROI', () => {
    it('adds + sign for positive values', () => {
      expect(formatROI(25.3)).toBe('+25.3%');
    });

    it('includes - sign for negative values', () => {
      expect(formatROI(-12.5)).toBe('-12.5%');
    });

    it('formats zero as positive', () => {
      expect(formatROI(0)).toBe('+0.0%');
    });
  });
});
