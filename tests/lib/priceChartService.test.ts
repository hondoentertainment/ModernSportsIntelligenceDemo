import { describe, it, expect } from 'vitest';
import {
  generatePriceHistory,
  calculateStatistics,
  getAnnotations,
  calculateMovingAverage,
  calculateBollingerBands,
  detectTrendline,
  getSupportResistance,
} from '../../lib/priceChartService';

function makeCard(overrides: Record<string, any> = {}) {
  return {
    id: 'card-1',
    player: 'Mike Trout',
    year: 2023,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Chrome',
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    purchasePrice: 100,
    currentValue: 150,
    purchaseDate: '2024-01-01',
    gradingFees: 0,
    shippingFees: 0,
    ...overrides,
  } as any;
}

describe('priceChartService', () => {
  describe('generatePriceHistory', () => {
    it('generates data points for 1W range', () => {
      const data = generatePriceHistory(makeCard(), '1W');
      expect(data.length).toBeGreaterThan(0);
      expect(data.length).toBeLessThanOrEqual(8); // ~7 days
    });

    it('generates more points for longer ranges', () => {
      const week = generatePriceHistory(makeCard(), '1W');
      const year = generatePriceHistory(makeCard(), '1Y');
      expect(year.length).toBeGreaterThan(week.length);
    });

    it('last data point price equals currentValue', () => {
      const card = makeCard({ currentValue: 200 });
      const data = generatePriceHistory(card, '1M');
      expect(data[data.length - 1].price).toBe(200);
    });

    it('all prices are positive', () => {
      const data = generatePriceHistory(makeCard(), '3M');
      for (const point of data) {
        expect(point.price).toBeGreaterThan(0);
        expect(point.high).toBeGreaterThan(0);
        expect(point.low).toBeGreaterThan(0);
      }
    });

    it('is deterministic for same card and range', () => {
      const card = makeCard();
      const a = generatePriceHistory(card, '1M');
      const b = generatePriceHistory(card, '1M');
      expect(a.length).toBe(b.length);
      expect(a[0].price).toBe(b[0].price);
    });

    it('includes date strings in ISO format', () => {
      const data = generatePriceHistory(makeCard(), '1M');
      for (const point of data) {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });
  });

  describe('calculateStatistics', () => {
    it('returns zeros for empty data', () => {
      const stats = calculateStatistics([]);
      expect(stats.currentPrice).toBe(0);
      expect(stats.allTimeHigh).toBe(0);
      expect(stats.volatility).toBe(0);
    });

    it('calculates basic stats correctly', () => {
      const data = generatePriceHistory(makeCard({ purchasePrice: 100, currentValue: 150 }), '3M');
      const stats = calculateStatistics(data);
      expect(stats.currentPrice).toBe(150);
      expect(stats.allTimeHigh).toBeGreaterThanOrEqual(stats.currentPrice);
      expect(stats.allTimeLow).toBeLessThanOrEqual(stats.currentPrice);
      expect(stats.allTimeHigh).toBeGreaterThanOrEqual(stats.allTimeLow);
      expect(stats.avgPrice).toBeGreaterThan(0);
    });

    it('calculates positive price change for appreciating card', () => {
      const data = generatePriceHistory(makeCard({ purchasePrice: 50, currentValue: 100 }), '1Y');
      const stats = calculateStatistics(data);
      expect(stats.priceChange).toBeGreaterThan(0);
      expect(stats.priceChangePct).toBeGreaterThan(0);
    });

    it('max drawdown is non-negative', () => {
      const data = generatePriceHistory(makeCard(), '6M');
      const stats = calculateStatistics(data);
      expect(stats.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(stats.maxDrawdownPct).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAnnotations', () => {
    it('includes purchase annotation', () => {
      const card = makeCard({ purchaseDate: '2024-01-15', purchasePrice: 100 });
      const annotations = getAnnotations(card);
      const purchase = annotations.find(a => a.type === 'purchase');
      expect(purchase).toBeDefined();
      expect(purchase!.date).toBe('2024-01-15');
    });

    it('includes sale annotation when card is sold', () => {
      const card = makeCard({
        status: 'sold',
        saleDate: '2024-06-01',
        salePrice: 200,
      });
      const annotations = getAnnotations(card);
      const sale = annotations.find(a => a.type === 'sale');
      expect(sale).toBeDefined();
    });

    it('includes grade annotation for graded cards', () => {
      const card = makeCard({
        isGraded: true,
        gradingCompany: 'PSA',
        grade: '10',
      });
      const annotations = getAnnotations(card);
      const grade = annotations.find(a => a.type === 'grade');
      expect(grade).toBeDefined();
      expect(grade!.label).toContain('PSA 10');
    });

    it('includes milestone for doubled value', () => {
      const card = makeCard({ purchasePrice: 50, currentValue: 120 });
      const annotations = getAnnotations(card);
      const milestone = annotations.find(a => a.type === 'milestone');
      expect(milestone).toBeDefined();
      expect(milestone!.label).toContain('2x');
    });
  });

  describe('calculateMovingAverage', () => {
    it('returns null for points before the period', () => {
      const data = generatePriceHistory(makeCard(), '1M');
      const ma = calculateMovingAverage(data, 7);
      for (let i = 0; i < 6; i++) {
        expect(ma[i].ma).toBeNull();
      }
      expect(ma[6].ma).not.toBeNull();
    });

    it('calculates correct moving average', () => {
      const data = [
        { date: '2024-01-01', price: 10, volume: 1, high: 11, low: 9, source: 'market' as const },
        { date: '2024-01-02', price: 20, volume: 1, high: 21, low: 19, source: 'market' as const },
        { date: '2024-01-03', price: 30, volume: 1, high: 31, low: 29, source: 'market' as const },
      ];
      const ma = calculateMovingAverage(data, 3);
      expect(ma[2].ma).toBe(20); // (10+20+30)/3
    });
  });

  describe('calculateBollingerBands', () => {
    it('returns null bands before the period', () => {
      const data = generatePriceHistory(makeCard(), '3M');
      const bb = calculateBollingerBands(data, 20);
      for (let i = 0; i < 19; i++) {
        expect(bb[i].upper).toBeNull();
        expect(bb[i].lower).toBeNull();
        expect(bb[i].middle).toBeNull();
      }
    });

    it('upper > middle > lower after period', () => {
      const data = generatePriceHistory(makeCard(), '3M');
      const bb = calculateBollingerBands(data, 20);
      const valid = bb.filter(b => b.upper !== null);
      for (const b of valid) {
        expect(b.upper!).toBeGreaterThanOrEqual(b.middle!);
        expect(b.middle!).toBeGreaterThanOrEqual(b.lower!);
      }
    });
  });

  describe('detectTrendline', () => {
    it('returns zero slope for constant prices', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        price: 100,
        volume: 1,
        high: 100,
        low: 100,
        source: 'market' as const,
      }));
      const trend = detectTrendline(data);
      expect(trend.slope).toBe(0);
      expect(trend.intercept).toBe(100);
    });

    it('returns positive slope for increasing prices', () => {
      const data = Array.from({ length: 10 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        price: 100 + i * 10,
        volume: 1,
        high: 100 + i * 10,
        low: 100 + i * 10,
        source: 'market' as const,
      }));
      const trend = detectTrendline(data);
      expect(trend.slope).toBeGreaterThan(0);
    });

    it('handles single data point', () => {
      const data = [{ date: '2024-01-01', price: 50, volume: 1, high: 50, low: 50, source: 'market' as const }];
      const trend = detectTrendline(data);
      expect(trend.slope).toBe(0);
      expect(trend.intercept).toBe(50);
    });
  });

  describe('getSupportResistance', () => {
    it('returns zeros for empty data', () => {
      const sr = getSupportResistance([]);
      expect(sr.support).toBe(0);
      expect(sr.resistance).toBe(0);
    });

    it('support <= resistance', () => {
      const data = generatePriceHistory(makeCard(), '3M');
      const sr = getSupportResistance(data);
      expect(sr.support).toBeLessThanOrEqual(sr.resistance);
    });

    it('support and resistance are within price range', () => {
      const data = generatePriceHistory(makeCard(), '3M');
      const prices = data.map(d => d.price);
      const sr = getSupportResistance(data);
      expect(sr.support).toBeGreaterThanOrEqual(Math.min(...prices));
      expect(sr.resistance).toBeLessThanOrEqual(Math.max(...prices));
    });
  });
});
