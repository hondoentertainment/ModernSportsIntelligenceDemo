import { describe, it, expect } from 'vitest';
import { LiquidityService } from '../../lib/liquidityService';
import type { CardInventory } from '../../types';

describe('LiquidityService', () => {
  describe('calculateLiquidityScore', () => {
    it('calculates liquidity score for a card', () => {
      const card: CardInventory = {
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
        purchaseDate: '2024-01-01',
      };
      const score = LiquidityService.calculateLiquidityScore(card);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns higher score for graded cards', () => {
      const graded: CardInventory = {
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
        purchaseDate: '2024-01-01',
      };
      const raw: CardInventory = {
        id: 'card-2',
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
        purchaseDate: '2024-01-01',
      };
      const gradedScore = LiquidityService.calculateLiquidityScore(graded);
      const rawScore = LiquidityService.calculateLiquidityScore(raw);
      expect(gradedScore).toBeGreaterThanOrEqual(rawScore);
    });
  });
});
