import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePortfolioReport } from '../../lib/pdfExport';
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
