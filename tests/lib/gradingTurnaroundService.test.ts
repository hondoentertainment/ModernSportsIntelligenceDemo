// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { setupLocalStorageMock } from '../helpers';
import {
  getTurnaroundReports,
  addReport,
  getTurnaroundAverages,
  getETAPrediction,
  getTurnaroundStats,
  getCompanyComparison,
  getTierComparison,
  getHistoricalTrend,
  getMySubmissions,
  formatDays,
  getCompanyColor,
  getTierLabel,
  getStatusColor,
  getTrendIcon,
  getTrendColor,
  TurnaroundReport,
} from '../../lib/core/gradingTurnaroundService';

describe('gradingTurnaroundService', () => {
  beforeEach(() => {
    setupLocalStorageMock();
  });

  // ---- getTurnaroundReports ----
  describe('getTurnaroundReports', () => {
    it('returns mock reports on first load', () => {
      const reports = getTurnaroundReports();
      expect(reports.length).toBeGreaterThanOrEqual(15);
    });

    it('persists reports to localStorage', () => {
      getTurnaroundReports();
      const stored = localStorage.getItem('msi_grading_turnaround');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('returns same data on subsequent calls', () => {
      const first = getTurnaroundReports();
      const second = getTurnaroundReports();
      expect(first).toEqual(second);
    });
  });

  // ---- addReport ----
  describe('addReport', () => {
    it('adds a new report and returns it with an id', () => {
      const newReport = addReport({
        company: 'PSA',
        tier: 'regular',
        reportedDays: 35,
        submittedDate: '2026-03-10',
        receivedDate: '2026-03-12',
        completedDate: null,
        status: 'in_progress',
        userId: 'user-test',
        location: 'Test City, TS',
      });
      expect(newReport.id).toBeDefined();
      expect(newReport.id.startsWith('gt-')).toBe(true);
      expect(newReport.company).toBe('PSA');
    });

    it('persists the added report', () => {
      const before = getTurnaroundReports().length;
      addReport({
        company: 'BGS',
        tier: 'express',
        reportedDays: 10,
        submittedDate: '2026-03-10',
        receivedDate: null,
        completedDate: null,
        status: 'in_transit',
        userId: 'user-test',
        location: 'Test',
      });
      const after = getTurnaroundReports().length;
      expect(after).toBe(before + 1);
    });
  });

  // ---- getTurnaroundAverages ----
  describe('getTurnaroundAverages', () => {
    it('returns averages grouped by company and tier', () => {
      const averages = getTurnaroundAverages();
      expect(averages.length).toBeGreaterThan(0);
      for (const avg of averages) {
        expect(avg.company).toBeDefined();
        expect(avg.tier).toBeDefined();
        expect(avg.avgDays).toBeGreaterThan(0);
        expect(avg.reportCount).toBeGreaterThan(0);
      }
    });

    it('calculates correct min/max days', () => {
      const averages = getTurnaroundAverages();
      for (const avg of averages) {
        expect(avg.minDays).toBeLessThanOrEqual(avg.maxDays);
        expect(avg.minDays).toBeLessThanOrEqual(avg.avgDays);
        expect(avg.maxDays).toBeGreaterThanOrEqual(avg.avgDays);
      }
    });

    it('includes a valid trend for each average', () => {
      const averages = getTurnaroundAverages();
      const validTrends = ['faster', 'slower', 'stable'];
      for (const avg of averages) {
        expect(validTrends).toContain(avg.trend);
      }
    });
  });

  // ---- getETAPrediction ----
  describe('getETAPrediction', () => {
    it('returns prediction for a company/tier with data', () => {
      const pred = getETAPrediction('PSA', 'regular');
      expect(pred.company).toBe('PSA');
      expect(pred.tier).toBe('regular');
      expect(pred.predictedDays).toBeGreaterThan(0);
      expect(pred.basedOnReports).toBeGreaterThan(0);
      expect(pred.confidence).toBeGreaterThan(0);
    });

    it('returns fallback prediction for missing company/tier combo', () => {
      const pred = getETAPrediction('CGC', 'super_express');
      expect(pred.company).toBe('CGC');
      expect(pred.tier).toBe('super_express');
      expect(pred.predictedDays).toBeGreaterThan(0);
      expect(pred.confidence).toBe(20);
      expect(pred.basedOnReports).toBe(0);
    });

    it('includes a valid range', () => {
      const pred = getETAPrediction('SGC', 'regular');
      expect(pred.range.min).toBeLessThanOrEqual(pred.range.max);
    });
  });

  // ---- getTurnaroundStats ----
  describe('getTurnaroundStats', () => {
    it('returns overall stats', () => {
      const stats = getTurnaroundStats();
      expect(stats.totalReports).toBeGreaterThanOrEqual(15);
      expect(stats.avgDaysAllCompanies).toBeGreaterThan(0);
      expect(['PSA', 'BGS', 'SGC', 'CGC']).toContain(stats.fastestCompany);
      expect(['PSA', 'BGS', 'SGC', 'CGC']).toContain(stats.slowestCompany);
    });

    it('fastest company avg is less than or equal to slowest company avg', () => {
      const stats = getTurnaroundStats();
      // Re-derive to verify
      const reports = getTurnaroundReports().filter(r => r.status === 'completed');
      const fastAvg = reports.filter(r => r.company === stats.fastestCompany);
      const slowAvg = reports.filter(r => r.company === stats.slowestCompany);
      const fastMean = fastAvg.reduce((s, r) => s + r.reportedDays, 0) / fastAvg.length;
      const slowMean = slowAvg.reduce((s, r) => s + r.reportedDays, 0) / slowAvg.length;
      expect(fastMean).toBeLessThanOrEqual(slowMean);
    });

    it('reports this week is a non-negative number', () => {
      const stats = getTurnaroundStats();
      expect(stats.reportsThisWeek).toBeGreaterThanOrEqual(0);
    });
  });

  // ---- getCompanyComparison ----
  describe('getCompanyComparison', () => {
    it('returns data for all 4 companies', () => {
      const comp = getCompanyComparison();
      expect(Object.keys(comp)).toEqual(expect.arrayContaining(['PSA', 'BGS', 'SGC', 'CGC']));
    });

    it('includes tier breakdown for each company', () => {
      const comp = getCompanyComparison();
      for (const company of ['PSA', 'BGS', 'SGC', 'CGC'] as const) {
        expect(comp[company]).toBeDefined();
        expect(typeof comp[company].avgDays).toBe('number');
        expect(typeof comp[company].tiers).toBe('object');
      }
    });
  });

  // ---- getTierComparison ----
  describe('getTierComparison', () => {
    it('returns averages filtered by company', () => {
      const tiers = getTierComparison('PSA');
      expect(tiers.length).toBeGreaterThan(0);
      for (const t of tiers) {
        expect(t.company).toBe('PSA');
      }
    });
  });

  // ---- getHistoricalTrend ----
  describe('getHistoricalTrend', () => {
    it('returns sorted date/days pairs', () => {
      const trend = getHistoricalTrend('PSA', 'regular');
      expect(trend.length).toBeGreaterThan(0);
      for (let i = 1; i < trend.length; i++) {
        expect(trend[i].date >= trend[i - 1].date).toBe(true);
      }
    });

    it('returns empty array for non-existent combo', () => {
      const trend = getHistoricalTrend('CGC', 'value');
      expect(trend).toEqual([]);
    });
  });

  // ---- getMySubmissions ----
  describe('getMySubmissions', () => {
    it('returns only user-1 submissions', () => {
      const mine = getMySubmissions();
      expect(mine.length).toBeGreaterThan(0);
      for (const sub of mine) {
        expect(sub.userId).toBe('user-1');
      }
    });
  });

  // ---- formatDays ----
  describe('formatDays', () => {
    it('returns singular for 1', () => {
      expect(formatDays(1)).toBe('1 day');
    });

    it('returns plural for other numbers', () => {
      expect(formatDays(5)).toBe('5 days');
      expect(formatDays(0)).toBe('0 days');
      expect(formatDays(100)).toBe('100 days');
    });
  });

  // ---- getCompanyColor ----
  describe('getCompanyColor', () => {
    it('returns a color string for each company', () => {
      expect(getCompanyColor('PSA')).toMatch(/^#/);
      expect(getCompanyColor('BGS')).toMatch(/^#/);
      expect(getCompanyColor('SGC')).toMatch(/^#/);
      expect(getCompanyColor('CGC')).toMatch(/^#/);
    });

    it('returns unique colors for different companies', () => {
      const colors = new Set(['PSA', 'BGS', 'SGC', 'CGC'].map(c => getCompanyColor(c as any)));
      expect(colors.size).toBe(4);
    });
  });

  // ---- getTierLabel ----
  describe('getTierLabel', () => {
    it('returns human-readable labels', () => {
      expect(getTierLabel('value')).toBe('Value');
      expect(getTierLabel('regular')).toBe('Regular');
      expect(getTierLabel('express')).toBe('Express');
      expect(getTierLabel('super_express')).toBe('Super Express');
      expect(getTierLabel('walk_through')).toBe('Walk-Through');
    });
  });

  // ---- getStatusColor ----
  describe('getStatusColor', () => {
    it('returns a hex color for each status', () => {
      expect(getStatusColor('in_transit')).toMatch(/^#/);
      expect(getStatusColor('received')).toMatch(/^#/);
      expect(getStatusColor('in_progress')).toMatch(/^#/);
      expect(getStatusColor('completed')).toMatch(/^#/);
    });
  });

  // ---- getTrendIcon ----
  describe('getTrendIcon', () => {
    it('returns distinct icons for each trend', () => {
      const icons = new Set([
        getTrendIcon('faster'),
        getTrendIcon('slower'),
        getTrendIcon('stable'),
      ]);
      expect(icons.size).toBe(3);
    });
  });

  // ---- getTrendColor ----
  describe('getTrendColor', () => {
    it('returns hex colors for each trend', () => {
      expect(getTrendColor('faster')).toMatch(/^#/);
      expect(getTrendColor('slower')).toMatch(/^#/);
      expect(getTrendColor('stable')).toMatch(/^#/);
    });

    it('faster is green, slower is red', () => {
      expect(getTrendColor('faster')).toBe('#10b981');
      expect(getTrendColor('slower')).toBe('#ef4444');
    });
  });
});
