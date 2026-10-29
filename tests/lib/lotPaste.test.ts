import { describe, expect, it } from 'vitest';
import { LOT_PASTE_NOTE, parseLotList, priceLot, type LotBookCard } from '../../lib/collector/lotPaste';
import type { SaleRange } from '../../lib/collector/saleRange';

const comps: SaleRange = { source: 'comps', low: 80, median: 100, high: 120, count: 3, band: 'raw' };
const none: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };

function card(overrides: Partial<LotBookCard> = {}): LotBookCard {
  return {
    id: 'judge',
    player: 'Aaron Judge',
    detail: '2024 Topps',
    gradeKey: 'raw',
    range: comps,
    ...overrides,
  };
}

describe('lot paste', () => {
  it('parses one card per line and ignores blanks, comments, and a bare year', () => {
    expect(LOT_PASTE_NOTE).toMatch(/one card per line/i);
    const parsed = parseLotList([
      '',
      '# skip',
      'Aaron Judge 2024',
      'Aaron Judge, 2024 Topps, $40',
      'Jayson Tatum | PSA 10 | $220',
      'Mookie Betts - 2018 Chrome, 12.50',
      'Aaron Judge, 0',
      'Aaron Judge, 1000001',
      '$40',
      ',, 10',
      'raw card, raw, $15',
    ].join('\r\n'));
    expect(parsed.omitted).toBe(0);
    expect(parsed.lines.map((line) => [line.player, line.detail, line.askUsd, line.gradeKey])).toEqual([
      ['Aaron Judge 2024', '', null, null],
      ['Aaron Judge', '2024 Topps', 40, null],
      ['Jayson Tatum', 'PSA 10', 220, 'PSA 10'],
      ['Mookie Betts', '2018 Chrome', 12.5, null],
      ['Aaron Judge', '', null, null],
      ['Aaron Judge', '', null, null],
      ['raw card', 'raw', 15, 'raw'],
    ]);
  });

  it('prices each match on its ladder and sums the fairs', () => {
    const book = [
      card({ id: 'p2', player: 'Aaron Judge', gradeKey: 'PSA 10', range: { ...comps, low: 200, median: 220, high: 240, band: 'PSA 10' } }),
      card({ id: 'a' }),
      card({ id: 'p1', player: 'Aaron Judge', gradeKey: 'PSA 10', range: { ...comps, low: 180, median: 200, high: 210, band: 'PSA 10' } }),
      card({ id: 'empty', player: 'Empty', gradeKey: null, range: none }),
      card({ id: 'mookie', player: 'Mookie Betts', gradeKey: null, range: comps }),
    ];
    const text = [
      'aaron judge, $90',
      'Aaron Judge, PSA 10, $250',
      'Empty $10',
      'Nobody $5',
      'Mookie Betts',
      'Aaron Judge, BGS 9.5, $10',
    ].join('\n');
    const priced = priceLot(parseLotList(text), book);
    expect(priced.matched).toBe(3);
    expect(priced.offerUsd).toBe(400);
    expect(priced.walkUsd).toBe(450);
    expect(priced.lines[0]?.copy).toMatch(/Open \$80, fair \$100, walk \$120/);
    expect(priced.lines[0]?.copy).toMatch(/This ask \$90 is up to the fair/);
    expect(priced.lines[1]?.copy).toMatch(/PSA 10 sold comps/);
    expect(priced.lines[2]?.copy).toMatch(/no sale range/i);
    expect(priced.lines[3]?.copy).toMatch(/Nobody stays off the ladder/);
    expect(priced.lines[4]?.copy).not.toMatch(/This ask/);
    expect(priced.lines[5]?.copy).toMatch(/No BGS 9.5 copy of Aaron Judge/);
    expect(priced.copy).toMatch(/Total offer \$400, the fair on 3 cards/);
    expect(priced.copy).toMatch(/walk for the lot is \$450/);
    expect(priced.copy).toMatch(/3 lines stay off the ladder/);
    expect(priced.copy).toMatch(/not one card's sale/i);

    const mixed = priceLot(
      parseLotList('Mookie Betts, $90\nNobody $5'),
      [card({ id: 'mookie', player: 'Mookie Betts', gradeKey: null })],
    );
    expect(mixed.copy).toMatch(/1 line stays off the ladder/);

    const one = priceLot(parseLotList('Mookie Betts, $90'), [card({ id: 'mookie', player: 'Mookie Betts', gradeKey: null })]);
    expect(one.copy).toMatch(/the fair on 1 card/);
    expect(one.copy).not.toMatch(/stay off the ladder/);

    const empty = priceLot(parseLotList(' \n# none'), []);
    expect(empty.offerUsd).toBeNull();
    expect(empty.copy).toMatch(/Paste one card per line/);

    const unmatched = priceLot(parseLotList('Nobody $5'), book);
    expect(unmatched.copy).toMatch(/no total offer/i);

    const overflow = parseLotList(Array.from({ length: 9 }, (_, index) => `Player ${index}, $10`).join('\n'));
    expect(overflow.lines).toHaveLength(8);
    expect(overflow.omitted).toBe(1);
    const pricedOverflow = priceLot(overflow, []);
    expect(pricedOverflow.copy).toMatch(/1 more line stays off this lot/);
    const many = priceLot(parseLotList(Array.from({ length: 10 }, (_, index) => `Player ${index}`).join('\n')), []);
    expect(many.copy).toMatch(/2 more lines stay off this lot/);
  });
});
