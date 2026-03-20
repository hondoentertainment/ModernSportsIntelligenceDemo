import { describe, it, expect } from 'vitest';
import { calculateStats } from '../../lib/utils/useInventory';
import type { CardInventory } from '../../types';

describe('useInventory', () => {
  describe('calculateStats', () => {
    it('calculates stats for empty inventory', () => {
      const stats = calculateStats([]);
      expect(stats.totalValue).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.cardCount).toBe(0);
      expect(stats.roi).toBe(0);
    });

    it('calculates total value and cost', () => {
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
      const stats = calculateStats(inventory);
      expect(stats.totalValue).toBe(400);
      expect(stats.grossCost).toBe(300);
      expect(stats.cardCount).toBe(2);
    });

    it('includes fees in total cost', () => {
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
          gradingFees: 25,
          shippingFees: 10,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.totalCost).toBe(135);
      expect(stats.totalFees).toBe(35);
    });

    it('calculates profit and ROI', () => {
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
      ];
      const stats = calculateStats(inventory);
      expect(stats.profit).toBe(50);
      expect(stats.roi).toBe(50);
    });

    it('handles zero cost basis', () => {
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
          purchasePrice: 0,
          currentValue: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const stats = calculateStats(inventory);
      expect(stats.roi).toBe(0);
    });
  });
});
