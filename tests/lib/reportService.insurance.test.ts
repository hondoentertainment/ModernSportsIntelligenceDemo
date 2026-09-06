import { describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { generateInsuranceReport } from '../../lib/utils/reportService';

const card = (over: Partial<CardInventory> = {}): CardInventory =>
  ({
    id: 'ins-1',
    player: 'Ken Griffey Jr.',
    year: 1989,
    manufacturer: 'Upper Deck',
    cardNumber: '1',
    set: 'Upper Deck',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Mint',
    isGraded: true,
    gradingCompany: 'PSA',
    grade: '10',
    certNumber: '998877',
    purchasePrice: 500,
    purchaseDate: '2018-01-01',
    currentValue: 2500,
    lastValuationDate: '2026-07-01T00:00:00.000Z',
    valuationSource: 'historical-comps',
    status: 'active',
    ...over,
  }) as CardInventory;

describe('generateInsuranceReport (reportService)', () => {
  it('includes timestamped FMV, totals, methodology, and disclaimer', () => {
    const report = generateInsuranceReport([card()], {
      includeSold: false,
      sections: ['insurance'],
    });
    expect(report.title).toBe('Insurance Valuation Report');
    expect(report.metadata.totalCollectionValue).toBe(2500);
    const titles = report.sections.map((s) => s.title);
    expect(titles).toContain('Valuation Methodology');
    expect(titles).toContain('Carrier Disclaimer');
    expect(titles).toContain('Complete Itemized Inventory');
    const inventory = report.sections.find((s) => s.title === 'Complete Itemized Inventory');
    expect(inventory?.data[0]).toMatchObject({
      certNumber: '998877',
      currentValue: 2500,
    });
    expect(String(inventory?.data[0]?.fmvAsOf)).toContain('2026-07-01');
  });
});
