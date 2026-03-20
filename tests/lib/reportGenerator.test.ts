import { describe, it, expect } from 'vitest';
import { generateReport, exportToCSV } from '../../lib/reportGenerator';
import type { CardInventory } from '../../types';

describe('reportGenerator', () => {
  describe('generateReport', () => {
    it('generates report for empty inventory', () => {
      const report = generateReport([]);
      expect(report.summary.totalAssets).toBe(0);
      expect(report.summary.totalInvested).toBe(0);
      expect(report.summary.currentValue).toBe(0);
      expect(report.topGainers).toEqual([]);
      expect(report.topLosers).toEqual([]);
    });

    it('calculates summary correctly', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Player 2',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 200,
          currentValue: 250,
          purchaseDate: '2024-01-01',
        },
      ];
      const report = generateReport(inventory);
      expect(report.summary.totalAssets).toBe(2);
      expect(report.summary.totalInvested).toBe(300);
      expect(report.summary.currentValue).toBe(400);
      expect(report.summary.unrealizedGainLoss).toBe(100);
      expect(report.summary.roi).toBeCloseTo(33.33, 1);
    });

    it('identifies top gainers and losers', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Gainer',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Loser',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '2',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 200,
          currentValue: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const report = generateReport(inventory);
      expect(report.topGainers.length).toBeGreaterThan(0);
      expect(report.topLosers.length).toBeGreaterThan(0);
      expect(report.topGainers[0].card.player).toBe('Gainer');
      expect(report.topLosers[0].card.player).toBe('Loser');
    });

    it('groups by league', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Player 1',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'Player 2',
          year: 2024,
          manufacturer: 'Panini',
          cardNumber: '2',
          set: 'Prizm',
          sport: 'Basketball',
          league: 'NBA',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 200,
          currentValue: 250,
          purchaseDate: '2024-01-01',
        },
      ];
      const report = generateReport(inventory);
      expect(report.byLeague.length).toBe(2);
      expect(report.byLeague.some(l => l.league === 'MLB')).toBe(true);
      expect(report.byLeague.some(l => l.league === 'NBA')).toBe(true);
    });

    it('includes generatedAt timestamp', () => {
      const report = generateReport([]);
      expect(report.generatedAt).toBeDefined();
      expect(new Date(report.generatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('exportToCSV', () => {
    it('exports report as CSV', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: true,
          gradingCompany: 'PSA',
          grade: '10',
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const report = generateReport(inventory);
      const csv = exportToCSV(report);
      expect(csv).toContain('Player');
      expect(csv).toContain('Test Player');
      expect(csv).toContain('2024');
    });

    it('includes all required columns', () => {
      const inventory: CardInventory[] = [
        {
          id: 'card-1',
          player: 'Test Player',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'Series 1',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 150,
          purchaseDate: '2024-01-01',
        },
      ];
      const report = generateReport(inventory);
      const csv = exportToCSV(report);
      expect(csv).toContain('Player');
      expect(csv).toContain('Year');
      expect(csv).toContain('Purchase Price');
      expect(csv).toContain('Current Value');
      expect(csv).toContain('ROI %');
    });
  });
});
