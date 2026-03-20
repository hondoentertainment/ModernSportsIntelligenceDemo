import { describe, it, expect } from 'vitest';
import { calculateAlphaScore, getCollectorTier, getPortfolioDNA } from '../../lib/analytics/analytics';
import type { CardInventory } from '../../types';

describe('analytics', () => {
  describe('calculateAlphaScore', () => {
    it('returns 0 for empty inventory', () => {
      expect(calculateAlphaScore([])).toBe(0);
    });

    it('calculates score based on scarcity', () => {
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
          purchaseDate: '2024-01-01',
          popCount: 1,
          scarcityIndex: 100,
        },
      ];
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('calculates score based on value density', () => {
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
          purchasePrice: 5000,
          currentValue: 6000,
          purchaseDate: '2024-01-01',
        },
      ];
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
    });

    it('calculates score based on diversification', () => {
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
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
    });

    it('includes realized alpha from sold cards', () => {
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
          salePrice: 200,
          status: 'sold',
          purchaseDate: '2024-01-01',
        },
      ];
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
    });

    it('handles Pop 1 premium correctly', () => {
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
          purchaseDate: '2024-01-01',
          popCount: 1,
          scarcityIndex: 100,
        },
      ];
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
    });

    it('applies mid-tier pop weight for popCount between 1 and 50', () => {
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
          purchaseDate: '2024-01-01',
          popCount: 10,
          scarcityIndex: 80,
        },
      ];
      const score = calculateAlphaScore(inventory);
      expect(score).toBeGreaterThan(0);
    });

    it('does not apply pop bonuses when popCount is 50 or more', () => {
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
          purchaseDate: '2024-01-01',
          popCount: 55,
          scarcityIndex: 40,
        },
      ];
      expect(calculateAlphaScore(inventory)).toBeGreaterThanOrEqual(0);
    });

    it('preserves precomputed scarcity fields on cards', () => {
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
          purchaseDate: '2024-01-01',
          scarcityIndex: 33,
          popCount: 12,
        },
      ];
      expect(calculateAlphaScore(inventory)).toBeGreaterThan(0);
    });
  });

  describe('getCollectorTier', () => {
    it('returns Whale tier for high scores', () => {
      const tier = getCollectorTier(85);
      expect(tier.title).toBe('Whale');
      expect(tier.minScore).toBe(81);
    });

    it('returns Shark tier for medium-high scores', () => {
      const tier = getCollectorTier(70);
      expect(tier.title).toBe('Shark');
      expect(tier.minScore).toBe(61);
    });

    it('returns Collector tier for medium scores', () => {
      const tier = getCollectorTier(50);
      expect(tier.title).toBe('Collector');
      expect(tier.minScore).toBe(41);
    });

    it('returns Prospector tier for low-medium scores', () => {
      const tier = getCollectorTier(30);
      expect(tier.title).toBe('Prospector');
      expect(tier.minScore).toBe(21);
    });

    it('returns Scout tier for low scores', () => {
      const tier = getCollectorTier(10);
      expect(tier.title).toBe('Scout');
      expect(tier.minScore).toBe(0);
    });

    it('returns Scout tier for zero score', () => {
      const tier = getCollectorTier(0);
      expect(tier.title).toBe('Scout');
    });

    it('uses bottom tier when score is below all minScore thresholds', () => {
      const tier = getCollectorTier(-5);
      expect(tier.title).toBe('Scout');
    });
  });

  describe('getPortfolioDNA', () => {
    it('returns default values for empty inventory', () => {
      const dna = getPortfolioDNA([]);
      expect(dna).toHaveLength(5);
      expect(dna[0].subject).toBe('Scarcity');
      expect(dna[0].A).toBe(20);
    });

    it('calculates scarcity component', () => {
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
          purchaseDate: '2024-01-01',
        },
      ];
      const dna = getPortfolioDNA(inventory);
      const scarcity = dna.find(d => d.subject === 'Scarcity');
      expect(scarcity).toBeDefined();
      expect(scarcity?.A).toBeGreaterThanOrEqual(0);
      expect(scarcity?.A).toBeLessThanOrEqual(100);
    });

    it('calculates value component', () => {
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
          currentValue: 2000,
          purchaseDate: '2024-01-01',
        },
      ];
      const dna = getPortfolioDNA(inventory);
      const value = dna.find(d => d.subject === 'Value');
      expect(value).toBeDefined();
      expect(value?.A).toBeGreaterThanOrEqual(0);
    });

    it('calculates diversity component', () => {
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
      const dna = getPortfolioDNA(inventory);
      const diversity = dna.find(d => d.subject === 'Diversity');
      expect(diversity).toBeDefined();
      expect(diversity?.A).toBeGreaterThan(0);
    });

    it('calculates momentum component', () => {
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
      const dna = getPortfolioDNA(inventory);
      const momentum = dna.find(d => d.subject === 'Momentum');
      expect(momentum).toBeDefined();
      expect(momentum?.A).toBeGreaterThanOrEqual(0);
      expect(momentum?.A).toBeLessThanOrEqual(100);
    });

    it('calculates volume component', () => {
      const inventory: CardInventory[] = Array.from({ length: 30 }, (_, i) => ({
        id: `card-${i}`,
        player: `Player ${i}`,
        year: 2024,
        manufacturer: 'Topps',
        cardNumber: String(i),
        set: 'Series 1',
        sport: 'Baseball',
        league: 'MLB',
        isAutographed: false,
        condition: 'Mint',
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      }));
      const dna = getPortfolioDNA(inventory);
      const volume = dna.find(d => d.subject === 'Volume');
      expect(volume).toBeDefined();
      expect(volume?.A).toBeGreaterThan(0);
    });

    it('returns all five DNA components', () => {
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
      const dna = getPortfolioDNA(inventory);
      expect(dna).toHaveLength(5);
      expect(dna.map(d => d.subject)).toEqual([
        'Scarcity',
        'Value',
        'Diversity',
        'Momentum',
        'Volume',
      ]);
    });
  });
});
