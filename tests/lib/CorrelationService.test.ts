import { describe, it, expect } from 'vitest';
import { CorrelationService } from '../../lib/CorrelationService';
import type { CardInventory } from '../../types';

describe('CorrelationService', () => {
  describe('calculateDiversificationScore', () => {
    it('returns 0 for empty inventory', () => {
      expect(CorrelationService.calculateDiversificationScore([])).toBe(0);
    });

    it('calculates score for single sport', () => {
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
          purchaseDate: '2024-01-01',
        },
      ];
      const score = CorrelationService.calculateDiversificationScore(inventory);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('returns higher score for diversified portfolio', () => {
      const singleSport: CardInventory[] = [
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
          purchaseDate: '2024-01-01',
        },
      ];
      const multiSport: CardInventory[] = [
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
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const singleScore = CorrelationService.calculateDiversificationScore(singleSport);
      const multiScore = CorrelationService.calculateDiversificationScore(multiSport);
      expect(multiScore).toBeGreaterThan(singleScore);
    });

    it('uses currentValue when available', () => {
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
          currentValue: 200,
          purchaseDate: '2024-01-01',
        },
      ];
      const score = CorrelationService.calculateDiversificationScore(inventory);
      expect(score).toBeDefined();
    });
  });

  describe('calculateCorrelationMatrix', () => {
    it('returns correlation matrix for multiple sports', () => {
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
          purchasePrice: 100,
          purchaseDate: '2024-01-01',
        },
      ];
      const matrix = CorrelationService.calculateCorrelationMatrix(inventory);
      expect(matrix.length).toBeGreaterThan(0);
      expect(matrix.some(m => m.sportA === 'Baseball' && m.sportB === 'Baseball')).toBe(true);
    });

    it('returns self-correlation of 1 for same sport', () => {
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
          purchaseDate: '2024-01-01',
        },
      ];
      const matrix = CorrelationService.calculateCorrelationMatrix(inventory);
      const selfCorr = matrix.find(m => m.sportA === 'Baseball' && m.sportB === 'Baseball');
      expect(selfCorr?.correlation).toBe(1);
    });
  });

  describe('getHedgingRecommendations', () => {
    it('returns recommendations for portfolio', () => {
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
          purchaseDate: '2024-01-01',
        },
      ];
      const recommendations = CorrelationService.getHedgingRecommendations(inventory);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
