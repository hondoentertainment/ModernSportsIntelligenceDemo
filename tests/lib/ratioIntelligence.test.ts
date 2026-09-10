import { describe, expect, it } from 'vitest';
import {
  RATIO_INTELLIGENCE_DISCLOSURE,
  analyzeGradeRatios,
  analyzePlayerRatios,
    analyzeVariationRatios,
    buildRatioIntelligenceReport,
    gradeRatioForCard,
    parseGradeNumber,
    variationFamilySet,
    variationKind,
} from '../../lib/analytics/ratioIntelligence';
import { makeCard } from '../helpers';
import type { MarketComp } from '../../types';

function comp(title: string, price: number): MarketComp {
  return {
    title,
    price,
    condition: 'PSA',
    soldAt: '2026-08-01',
  };
}

describe('ratioIntelligence', () => {
  it('parses grades and classifies variation kinds', () => {
    expect(parseGradeNumber('PSA 10')).toBe(10);
    expect(parseGradeNumber('9.5')).toBe(9.5);
    expect(parseGradeNumber('raw')).toBeNull();
    expect(variationKind(makeCard({ set: 'Chrome', isAutographed: false }))).toBe('base');
    expect(variationKind(makeCard({ set: 'Chrome Refractor', isAutographed: false }))).toBe('parallel');
    expect(variationKind(makeCard({ isAutographed: true }))).toBe('auto');
    expect(variationKind(makeCard({ cardNumber: '12/99' }))).toBe('numbered');
    expect(variationFamilySet('Chrome Gold Refractor')).toBe('chrome');
  });

  it('returns null for sold cards and empty marks', () => {
    expect(gradeRatioForCard(makeCard({ status: 'sold', currentValue: 500 }))).toBeNull();
    expect(
      gradeRatioForCard(
        makeCard({ currentValue: 0, purchasePrice: 0, salesData: [] }),
      ),
    ).toBeNull();
  });

  it('flags missing grades and thin comps without inventing a deep book', () => {
    const row = gradeRatioForCard(
      makeCard({
        id: 'thin',
        isGraded: true,
        grade: '10',
        currentValue: 400,
        salesData: [comp('PSA 10 sale', 400)],
      }),
    );
    expect(row).not.toBeNull();
    expect(row?.psa10).toBe(400);
    expect(row?.missingGrades).toContain('raw');
    expect(row?.thinTape).toBe(true);
    expect(row?.rationale).toMatch(/missing|thin/i);
  });

  it('builds a comps-backed 10/9/raw ladder when titles exist', () => {
    const row = gradeRatioForCard(
      makeCard({
        id: 'ladder',
        currentValue: 100,
        salesData: [
          comp('2023 Chrome raw NM', 100),
          comp('2023 Chrome PSA 9', 180),
          comp('2023 Chrome PSA 10', 400),
          comp('2023 Chrome PSA 10 gem', 420),
        ],
      }),
    );
    expect(row?.source).toBe('comps');
    expect(row?.psa10Over9).toBeGreaterThan(1);
    expect(row?.psa9OverRaw).toBeGreaterThan(1);
    expect(row?.missingGrades).toEqual([]);
  });

  it('uses disclosed heuristic multipliers when comps omit grades', () => {
    const row = gradeRatioForCard(makeCard({ id: 'raw', isGraded: false, currentValue: 50, salesData: [] }));
    expect(row?.source).toBe('heuristic');
    expect(row?.psa9).toBeCloseTo(80);
    expect(row?.psa10).toBeCloseTo(175);
    expect(row?.thinTape).toBe(true);
  });

  it('fills raw from a PSA 9 comp when the card itself is graded 9', () => {
    const row = gradeRatioForCard(
      makeCard({
        id: 'psa9',
        isGraded: true,
        grade: '9',
        currentValue: 160,
        salesData: [comp('PSA 9 sold', 160), comp('another PSA 9', 170)],
      }),
    );
    expect(row?.psa9).toBeGreaterThan(0);
    expect(row?.source).toBe('mixed');
  });

  it('skips single-card players and ranks high/low when siblings exist', () => {
    expect(analyzePlayerRatios([makeCard({ player: 'Solo' })])).toEqual([]);
    const rows = analyzePlayerRatios([
      makeCard({ id: 'a', player: 'Shohei Ohtani', year: 2018, set: 'Update', currentValue: 800 }),
      makeCard({ id: 'b', player: 'Shohei Ohtani', year: 2023, set: 'Chrome', currentValue: 200 }),
      makeCard({ id: 'c', player: 'Other', currentValue: 50 }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].player).toBe('Shohei Ohtani');
    expect(rows[0].highOverLow).toBe(4);
    expect(rows[0].thinTape).toBe(true);
  });

  it('compares parallel variation to a base sibling', () => {
    const rows = analyzeVariationRatios([
      makeCard({ id: 'base', player: 'Trout', year: 2011, set: 'Update', currentValue: 100 }),
      makeCard({
        id: 'ref',
        player: 'Trout',
        year: 2011,
        set: 'Update Refractor',
        currentValue: 250,
      }),
    ]);
    expect(rows[0].variationKind).toBe('parallel');
    expect(rows[0].ratioVsBase).toBe(2.5);
    expect(rows[0].rationale).toMatch(/vs base/i);
  });

  it('falls back to cheapest family mark when no base variation exists', () => {
    const rows = analyzeVariationRatios([
      makeCard({ id: 'gold', player: 'Judge', year: 2017, set: 'Chrome Gold', currentValue: 300 }),
      makeCard({ id: 'silver', player: 'Judge', year: 2017, set: 'Chrome Silver', currentValue: 150 }),
    ]);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].baseMark).toBeNull();
    expect(rows[0].rationale).toMatch(/cheapest/i);
  });

  it('does not invent a heuristic fill when a graded 10 has no raw/9 comps', () => {
    const row = gradeRatioForCard(
      makeCard({
        id: 'only10',
        isGraded: true,
        grade: '10',
        currentValue: 400,
        salesData: [],
      }),
    );
    expect(row?.psa10).toBe(400);
    expect(row?.missingGrades).toEqual(expect.arrayContaining(['raw', 'psa9']));
    expect(row?.rationale).toMatch(/no heuristic fill/i);
  });

  it('uses raw sold-comp totalPrice and skips empty player keys', () => {
    const row = gradeRatioForCard(
      makeCard({
        id: 'raw-total',
        currentValue: 90,
        salesData: [
          { title: 'raw NM-MT', price: 0, totalPrice: 95, condition: 'raw', soldAt: '2026-08-01' },
          { title: 'PSA 9', price: 160, condition: 'PSA 9', soldAt: '2026-08-02' },
          { title: 'PSA 10', price: 350, condition: 'PSA 10', soldAt: '2026-08-03' },
          { title: 'PSA 10 gem', price: 360, condition: 'PSA 10', soldAt: '2026-08-04' },
        ],
      }),
    );
    expect(row?.rawMark).toBe(95);
    expect(row?.source).toBe('comps');
    expect(analyzePlayerRatios([makeCard({ player: '   ', currentValue: 50 }), makeCard({ id: '2', player: '   ', currentValue: 80 })])).toEqual([]);
  });

  it('skips all-base families after comparing against the cheapest sibling', () => {
    expect(
      analyzeVariationRatios([
        makeCard({ id: 'b1', player: 'Soto', year: 2020, set: 'Chrome', currentValue: 80 }),
        makeCard({ id: 'b2', player: 'Soto', year: 2020, set: 'Chrome', cardNumber: '2', currentValue: 120 }),
      ]),
    ).toEqual([]);
  });

  it('ranks three sibling holdings without a thin-pair disclaimer', () => {
    const rows = analyzePlayerRatios([
      makeCard({ id: '1', player: 'Acuña', year: 2018, set: 'Update', currentValue: 100 }),
      makeCard({ id: '2', player: 'Acuña', year: 2019, set: 'Chrome', currentValue: 200 }),
      makeCard({
        id: '3',
        player: 'Acuña',
        year: 2020,
        set: 'Prizm',
        currentValue: 300,
        salesData: [
          { title: 'a', price: 290, condition: 'raw', soldAt: '2026-08-01' },
          { title: 'b', price: 300, condition: 'raw', soldAt: '2026-08-02' },
          { title: 'c', price: 310, condition: 'raw', soldAt: '2026-08-03' },
        ],
      }),
    ]);
    expect(rows[0].cards).toHaveLength(3);
    expect(rows[0].rationale).toMatch(/across 3 holdings/i);
  });

  it('sorts grade ladders and multi-player spreads', () => {
    const grades = analyzeGradeRatios([
      makeCard({
        id: 'g1',
        player: 'One',
        currentValue: 100,
        salesData: [
          { title: 'raw', price: 100, condition: 'raw', soldAt: '2026-08-01' },
          { title: 'PSA 9', price: 150, condition: 'PSA 9', soldAt: '2026-08-02' },
          { title: 'PSA 10', price: 200, condition: 'PSA 10', soldAt: '2026-08-03' },
        ],
      }),
      makeCard({
        id: 'g2',
        player: 'Two',
        currentValue: 80,
        salesData: [
          { title: 'raw', price: 80, condition: 'raw', soldAt: '2026-08-01' },
          { title: 'PSA 9', price: 120, condition: 'PSA 9', soldAt: '2026-08-02' },
          { title: 'PSA 10', price: 360, condition: 'PSA 10', soldAt: '2026-08-03' },
        ],
      }),
    ]);
    expect(grades).toHaveLength(2);
    expect(grades[0].psa10Over9 ?? 0).toBeGreaterThanOrEqual(grades[1].psa10Over9 ?? 0);

    const players = analyzePlayerRatios([
      makeCard({ id: 'p1', player: 'Alpha', currentValue: 400 }),
      makeCard({ id: 'p2', player: 'Alpha', year: 2019, currentValue: 100 }),
      makeCard({ id: 'p3', player: 'Beta', currentValue: 300 }),
      makeCard({ id: 'p4', player: 'Beta', year: 2018, currentValue: 200 }),
    ]);
    expect(players).toHaveLength(2);
    expect(players[0].highOverLow ?? 0).toBeGreaterThanOrEqual(players[1].highOverLow ?? 0);
  });

  it('builds a report with disclosure and ignores sold lots', () => {
    const report = buildRatioIntelligenceReport([
      makeCard({
        id: 'hold',
        player: 'A',
        currentValue: 100,
        salesData: [comp('raw', 90), comp('PSA 9', 160), comp('PSA 10', 350)],
      }),
      makeCard({ id: 'sold', status: 'sold', player: 'A', currentValue: 9000 }),
    ]);
    expect(report.disclosure).toBe(RATIO_INTELLIGENCE_DISCLOSURE);
    expect(report.grades.length).toBeGreaterThan(0);
    expect(analyzeGradeRatios([makeCard({ status: 'sold' })])).toEqual([]);
  });
});
