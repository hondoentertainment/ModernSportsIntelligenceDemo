import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatsService } from '../../lib/utils/statsService';
import { getPlayerStats, searchMLBPlayers } from '../../lib/utils/mlbApi';
import { logger } from '../../lib/logger';

vi.mock('../../lib/utils/mlbApi', () => ({
  getPlayerStats: vi.fn(),
  searchMLBPlayers: vi.fn(),
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('StatsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlayerPerformance', () => {
    it('returns null when player not found', async () => {
      vi.mocked(searchMLBPlayers).mockResolvedValue([]);
      const result = await StatsService.getPlayerPerformance('Unknown Player');
      expect(result).toBeNull();
    });

    it('returns performance data for found player', async () => {
      vi.mocked(searchMLBPlayers).mockResolvedValue([
        {
          id: 123,
          fullName: 'Test Player',
          primaryNumber: '5',
        },
      ]);
      vi.mocked(getPlayerStats).mockResolvedValue([
        {
          group: { displayName: 'hitting' },
          splits: [
            {
              stat: {
                avg: '.300',
                homeRuns: 25,
                rbi: 80,
                ops: '.900',
              },
            },
          ],
        },
      ]);
      const result = await StatsService.getPlayerPerformance('Test Player');
      expect(result).toBeDefined();
      expect(result?.fullName).toBe('Test Player');
      expect(result?.stats.length).toBeGreaterThan(0);
    });

    it('returns null when no hitting stats', async () => {
      vi.mocked(searchMLBPlayers).mockResolvedValue([
        {
          id: 123,
          fullName: 'Test Player',
        },
      ]);
      vi.mocked(getPlayerStats).mockResolvedValue([]);
      const result = await StatsService.getPlayerPerformance('Test Player');
      expect(result).toBeNull();
    });

    it('handles errors gracefully', async () => {
      vi.mocked(searchMLBPlayers).mockRejectedValue(new Error('API error'));
      const result = await StatsService.getPlayerPerformance('Test Player');
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getPlayerHeadshot', () => {
    it('returns headshot URL for found player', async () => {
      vi.mocked(searchMLBPlayers).mockResolvedValue([
        {
          id: 123,
          fullName: 'Test Player',
        },
      ]);
      const url = await StatsService.getPlayerHeadshot('Test Player');
      expect(url).toBe('https://img.mlbstatic.com/mlb-photos/person/123.jpg');
    });

    it('returns null when player not found', async () => {
      vi.mocked(searchMLBPlayers).mockResolvedValue([]);
      const url = await StatsService.getPlayerHeadshot('Unknown Player');
      expect(url).toBeNull();
    });

    it('handles errors gracefully', async () => {
      vi.mocked(searchMLBPlayers).mockRejectedValue(new Error('API error'));
      const url = await StatsService.getPlayerHeadshot('Test Player');
      expect(url).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('calculateEstimatedTax', () => {
    it('calculates tax for long-term holdings', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        },
      ];
      const tax = StatsService.calculateEstimatedTax(inventory);
      expect(tax.total).toBe(20); // 20% of $100 gain
      expect(tax.longTerm).toBe(20);
      expect(tax.shortTerm).toBe(0);
    });

    it('calculates tax for short-term holdings', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
        },
      ];
      const tax = StatsService.calculateEstimatedTax(inventory);
      expect(tax.total).toBe(35); // 35% of $100 gain
      expect(tax.shortTerm).toBe(35);
      expect(tax.longTerm).toBe(0);
    });

    it('handles cards with no gain', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 50,
          purchaseDate: new Date().toISOString(),
          status: 'active',
        },
      ];
      const tax = StatsService.calculateEstimatedTax(inventory);
      expect(tax.total).toBe(0);
    });

    it('skips tax when gain is exactly zero', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 100,
          purchaseDate: new Date().toISOString(),
          status: 'active',
        },
      ];
      expect(StatsService.calculateEstimatedTax(inventory).total).toBe(0);
    });

    it('uses dateAdded when purchaseDate is missing', () => {
      const recent = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString();
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          dateAdded: recent,
          status: 'active',
        },
      ];
      const tax = StatsService.calculateEstimatedTax(inventory);
      expect(tax.shortTerm).toBeGreaterThan(0);
    });

    it('filters out sold cards', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          purchaseDate: new Date().toISOString(),
          status: 'sold',
        },
      ];
      const tax = StatsService.calculateEstimatedTax(inventory);
      expect(tax.total).toBe(0);
    });
  });

  describe('getSellCandidates', () => {
    it('identifies cards with >50% ROI', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          status: 'active',
        },
        {
          id: 'card-2',
          purchasePrice: 100,
          currentValue: 40,
          status: 'active',
        },
      ];
      const candidates = StatsService.getSellCandidates(inventory);
      expect(candidates.length).toBe(1);
      expect(candidates[0].id).toBe('card-1');
    });

    it('sorts by ROI descending', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          status: 'active',
        },
        {
          id: 'card-2',
          purchasePrice: 100,
          currentValue: 300,
          status: 'active',
        },
      ];
      const candidates = StatsService.getSellCandidates(inventory);
      expect(candidates[0].id).toBe('card-2');
    });

    it('filters out sold cards', () => {
      const inventory = [
        {
          id: 'card-1',
          purchasePrice: 100,
          currentValue: 200,
          status: 'sold',
        },
      ];
      const candidates = StatsService.getSellCandidates(inventory);
      expect(candidates.length).toBe(0);
    });
  });
});
