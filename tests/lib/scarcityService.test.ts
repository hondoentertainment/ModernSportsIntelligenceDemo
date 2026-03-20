import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScarcityService, generatePopData } from '../../lib/analytics/scarcityService';
import type { CardInventory } from '../../types';

describe('scarcityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePopData', () => {
    it('generates pop data for a card', () => {
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
      const data = generatePopData(card);
      expect(data.popCount).toBeGreaterThan(0);
      expect(data.scarcityIndex).toBeGreaterThanOrEqual(0);
      expect(data.scarcityIndex).toBeLessThanOrEqual(100);
    });

    it('uses existing popCount when available', () => {
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
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
        popCount: 5,
        popHigher: 2,
      };
      const data = generatePopData(card);
      expect(data.popCount).toBe(5);
      expect(data.popHigher).toBe(2);
    });

    it('calculates scarcity index correctly', () => {
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
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      };
      const data = generatePopData(card);
      expect(data.scarcityIndex).toBeGreaterThanOrEqual(0);
      expect(data.scarcityIndex).toBeLessThanOrEqual(100);
    });
  });

  describe('ScarcityService.getBadgeType', () => {
    it('returns Apex for Pop 1', () => {
      expect(ScarcityService.getBadgeType(1, 0)).toBe('Apex');
    });

    it('returns Low Pop for small populations', () => {
      expect(ScarcityService.getBadgeType(10, 2)).toBe('Low Pop');
      expect(ScarcityService.getBadgeType(49, 5)).toBe('Low Pop');
    });

    it('returns Standard for larger populations', () => {
      expect(ScarcityService.getBadgeType(100, 10)).toBe('Standard');
      expect(ScarcityService.getBadgeType(500, 50)).toBe('Standard');
    });
  });

  describe('ScarcityService.getScarcityMultiplier', () => {
    it('returns high multiplier for Pop 1', () => {
      const report = {
        popTotal: 1,
        popAtGrade: 1,
        popHigher: 0,
        lastChecked: '2024-01-01',
        source: 'psa' as const,
        badge: 'Apex' as const,
      };
      expect(ScarcityService.getScarcityMultiplier(report)).toBe(2.5);
    });

    it('returns multiplier based on population', () => {
      const report1 = {
        popTotal: 50,
        popAtGrade: 15,
        popHigher: 2,
        lastChecked: '2024-01-01',
        source: 'psa' as const,
        badge: 'Low Pop' as const,
      };
      expect(ScarcityService.getScarcityMultiplier(report1)).toBe(1.8);

      const report2 = {
        popTotal: 200,
        popAtGrade: 80,
        popHigher: 10,
        lastChecked: '2024-01-01',
        source: 'psa' as const,
        badge: 'Low Pop' as const,
      };
      expect(ScarcityService.getScarcityMultiplier(report2)).toBe(1.4);
    });
  });

  describe('ScarcityService.calculateGradingRoi', () => {
    it('calculates ROI correctly', () => {
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
        isGraded: false,
        purchasePrice: 100,
        currentValue: 200,
        gradingFees: 25,
        shippingFees: 10,
        purchaseDate: '2024-01-01',
      };
      const roi = ScarcityService.calculateGradingRoi(card);
      expect(roi).toBeGreaterThan(0);
    });

    it('returns 0 when no purchase price', () => {
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
        isGraded: false,
        purchaseDate: '2024-01-01',
      };
      expect(ScarcityService.calculateGradingRoi(card)).toBe(0);
    });

    it('returns 0 when no current value', () => {
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
        isGraded: false,
        purchasePrice: 100,
        purchaseDate: '2024-01-01',
      };
      expect(ScarcityService.calculateGradingRoi(card)).toBe(0);
    });
  });
});
