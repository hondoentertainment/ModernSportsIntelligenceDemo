import { describe, expect, it } from 'vitest';
import {
  SHOW_DAY_RECAP_NOTE,
  buildShowDayRecap,
  recapFills,
  showDayRecap,
} from '../../lib/collector/showDayRecap';
import type { SaleRange } from '../../lib/collector/saleRange';

const range: SaleRange = { source: 'comps', low: 40, median: 80, high: 120, count: 3 };
const point: SaleRange = { source: 'comps', low: 50, median: 50, high: 50, count: 1 };
const none: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };

describe('show-day recap', () => {
  it('totals buys and sells, the average seat, and what is left on the list', () => {
    expect(SHOW_DAY_RECAP_NOTE).toMatch(/not a settlement/i);
    const buys = [
      { id: '1', player: 'Under', usd: 20, range },
      { id: '2', player: 'Inside', usd: 80, range },
      { id: '3', player: 'Over', usd: 200, range },
      { id: '4', player: 'Point', usd: 50, range: point },
      { id: '5', player: 'Low', usd: 40, range },
      { id: '6', player: 'Off', usd: 10, range: null },
      { id: '7', player: 'Zero', usd: 0, range },
      { id: '8', player: 'Broken', usd: 10, range: { source: 'comps' as const, low: null, median: null, high: null, count: 0 } },
    ];
    const recap = showDayRecap({
      buys,
      sells: [{ id: 's', player: 'Sold', usd: 80, range }],
      lines: [
        { id: 'buy-under', side: 'buy', player: 'Under', usd: 20, checked: false },
        { id: 'buy-left', side: 'buy', player: 'Left', usd: 15, checked: false },
        { id: 'buy-checked', side: 'buy', player: 'Checked', usd: 15, checked: true },
        { id: 'sell-sold', side: 'sell', player: 'Sold', usd: 80, checked: false },
        { id: 'sell-left', side: 'sell', player: 'Extra', usd: null, checked: false },
        { id: 'blank', side: 'buy', player: ' ', usd: null, checked: false },
        { id: 'five', side: 'buy', player: 'Five', usd: 1, checked: false },
        { id: 'six', side: 'buy', player: 'Six', usd: 1, checked: false },
      ],
    });
    expect(recap.buyCount).toBe(8);
    expect(recap.sellCount).toBe(1);
    expect(recap.under).toBe(1);
    expect(recap.inside).toBeGreaterThan(0);
    expect(recap.over).toBe(1);
    expect(recap.offRange).toBe(3);
    expect(recap.positioned).toBe(6);
    expect(recap.left.map((line) => line.player.trim() || 'blank')).toEqual(['Left', 'Extra', 'blank', 'Five', 'Six']);
    expect(recap.copy).toMatch(/Bought 8 for \$410/);
    expect(recap.copy).toMatch(/and 4 more/);
    expect(recap.copy).toMatch(/Sold 1 for \$80 \(Sold\)/);
    expect(recap.copy).toMatch(/Average position is /);
    expect(recap.copy).toMatch(/1 under the low/);
    expect(recap.copy).toMatch(/over the high/);
    expect(recap.copy).toMatch(/3 prices stay off the range/);
    expect(recap.copy).toMatch(/Left on the list: Left buy, Extra sell, Card buy, Five buy, and 1 more/);
    expect(recap.copy).toMatch(/Not a settlement and not a live tape/);

    const quiet = showDayRecap({ buys: [], sells: [], lines: [] });
    expect(quiet.copy).toBe(
      'Bought 0 for $0. Sold 0 for $0. No bought or sold price sits on a sale range. Nothing left on the shopping list. Not a settlement and not a live tape.',
    );
    const oneOff = showDayRecap({
      buys: [{ id: 'x', player: 'X', usd: 10, range: none }],
      sells: [],
      lines: [{ id: 'only', side: 'sell', player: 'Only', usd: null, checked: false }],
    });
    expect(oneOff.copy).toMatch(/1 price stays off the range/);
    expect(oneOff.copy).toMatch(/Left on the list: Only sell/);
    const halfway = showDayRecap({
      buys: [{ id: 'mid', player: 'Mid', usd: 80, range }],
      sells: [],
      lines: [],
    });
    expect(halfway.copy).toMatch(/50%/);
    const quarter = showDayRecap({
      buys: [{ id: 'q', player: 'Q', usd: 50, range }],
      sells: [],
      lines: [],
    });
    expect(quarter.copy).toMatch(/12.5%/);
  });

  it('reads floor decisions and table notes, including a lot', () => {
    const fills = recapFills({
      notes: [
        { id: 'pass', result: 'passed', askUsd: 10, offerUsd: 0, player: 'Pass' },
        { id: 'empty', result: 'bought', askUsd: 0, offerUsd: 0, player: 'Empty' },
        { id: 'offer', result: 'bought', askUsd: 30, offerUsd: 25, player: 'Offer', cardId: 'offer' },
        { id: 'ask', result: 'bought', askUsd: 12, offerUsd: 0, player: ' ', cardId: 'missing' },
        { id: 'plain', result: 'bought', askUsd: 9, offerUsd: 9, player: 'No Card' },
        {
          id: 'unpaid-lot',
          result: 'bought',
          askUsd: 0,
          offerUsd: 0,
          player: 'Unpaid',
          lines: [{ player: 'A', askUsd: 0 }, { player: 'B' }],
        },
        {
          id: 'lot',
          result: 'bought',
          askUsd: 100,
          offerUsd: 80,
          player: 'Bundle',
          lines: [
            { player: 'Aaron Judge', cardId: 'judge', askUsd: 40 },
            { player: 'Jayson Tatum', cardId: 'tatum', askUsd: 60 },
          ],
        },
        {
          id: 'broken-lot',
          result: 'bought',
          askUsd: 20,
          offerUsd: 18,
          player: '',
          lines: [{ player: 'A', askUsd: 20 }, { player: 'B' }],
        },
      ],
      decisions: [
        { opportunityId: 'buy', player: 'Floor Buy', call: 'buy', tablePriceUsd: 10.005, cardId: 'floor' },
        { opportunityId: 'sell', player: 'Floor Sell', call: 'sell', tablePriceUsd: 15, cardId: null },
        { opportunityId: 'pass', player: 'Pass', call: 'pass', tablePriceUsd: null, cardId: null },
        { opportunityId: 'zero', player: 'Zero', call: 'buy', tablePriceUsd: 0, cardId: null },
        { opportunityId: 'blank', player: 'Blank', call: 'sell', tablePriceUsd: null, cardId: 'x' },
      ],
      rangeForId: (id) => (id === 'missing' ? null : range),
    });
    expect(fills.buys.map((row) => [row.player, row.usd, row.range?.median ?? null])).toEqual([
      ['Offer', 25, 80],
      ['Card', 12, null],
      ['No Card', 9, null],
      ['Aaron Judge', 32, 80],
      ['Jayson Tatum', 48, 80],
      ['Card', 18, null],
      ['Floor Buy', 10.01, 80],
    ]);
    expect(fills.sells).toEqual([
      { id: 'sell', player: 'Floor Sell', usd: 15, range: null },
    ]);
    const recap = buildShowDayRecap({
      notes: fills.buys.length ? [{ id: 'offer', result: 'bought', askUsd: 30, offerUsd: 25, player: 'Offer', cardId: 'offer' }] : [],
      decisions: [],
      lines: [{ id: 'offer-line', side: 'buy', player: 'Offer', usd: 25, checked: false }],
      rangeForId: () => range,
    });
    expect(recap.left).toEqual([]);
    expect(recap.copy).toMatch(/Bought 1 for \$25 \(Offer\)/);
  });
});
