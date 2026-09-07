import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildLeagueAllocation, drawLeagueAllocationBars, generateBriefingReport, generatePortfolioReport } from '../../lib/pdfExport';
import type { CardInventory } from '../../types';

// Mock jsPDF to avoid actual PDF generation in tests
const mockDoc = {
  setFillColor: vi.fn().mockReturnThis(),
  rect: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  setFont: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  save: vi.fn(),
  internal: {
    pageSize: {
      getWidth: () => 210,
    },
  },
};

vi.mock('jspdf', () => {
  class MockJsPDF {
    constructor() {
      return mockDoc;
    }
  }
  return {
    default: MockJsPDF,
  };
});

describe('pdfExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePortfolioReport', () => {
    it('generates PDF for empty inventory', () => {
      // Just verify it doesn't throw
      expect(() => generatePortfolioReport([])).not.toThrow();
    });

    it('generates PDF with portfolio data', () => {
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
      expect(() => generatePortfolioReport(inventory, 'Test User')).not.toThrow();
    });

    it('draws league allocation bars from inventory slices', () => {
      const slices = buildLeagueAllocation([
        {
          id: 'card-1',
          player: 'A',
          year: 2024,
          manufacturer: 'Topps',
          cardNumber: '1',
          set: 'S',
          sport: 'Baseball',
          league: 'MLB',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 75,
          purchaseDate: '2024-01-01',
        },
        {
          id: 'card-2',
          player: 'B',
          year: 2024,
          manufacturer: 'Panini',
          cardNumber: '2',
          set: 'P',
          sport: 'Basketball',
          league: 'NBA',
          isAutographed: false,
          condition: 'Mint',
          isGraded: false,
          purchasePrice: 100,
          currentValue: 25,
          purchaseDate: '2024-01-01',
        },
      ]);
      expect(slices[0].league).toBe('MLB');
      expect(slices[0].pct).toBe(75);
      const y = drawLeagueAllocationBars(mockDoc, slices, { x: 20, y: 40, width: 160 });
      expect(y).toBeGreaterThan(40);
      expect(mockDoc.rect).toHaveBeenCalled();
    });

    it('generates a morning briefing PDF with allocation', () => {
      expect(() => generateBriefingReport([
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
      ], [{ title: 'Alert', description: 'Seeded insight' }])).not.toThrow();
    });

    it('handles multiple cards', () => {
      const inventory: CardInventory[] = Array.from({ length: 10 }, (_, i) => ({
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
        currentValue: 200 - i * 10,
        purchaseDate: '2024-01-01',
      }));
      expect(() => generatePortfolioReport(inventory)).not.toThrow();
    });
  });
});
