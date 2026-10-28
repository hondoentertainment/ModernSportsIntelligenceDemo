import { describe, expect, it } from 'vitest';
import {
  OFFER_LADDER_CASH_NOTE,
  OFFER_LADDER_NOTE,
  SELL_LADDER_NOTE,
  buyLadder,
  buyLadderCopy,
  ladderCashRoom,
  sellLadder,
  sellLadderCopy,
  shopLadderCopy,
} from '../../lib/collector/offerLadder';
import { saleRange } from '../../lib/collector/saleRange';

const comps = saleRange({
  id: 'judge',
  currentValue: 999,
  salesData: [
    { price: 80, soldAt: '2026-09-01' },
    { price: 100, soldAt: '2026-09-02' },
    { price: 120, soldAt: '2026-09-03' },
  ],
});

describe('offer ladder', () => {
  it('opens at the low, calls the median fair, and walks at the high', () => {
    const ladder = buyLadder(comps);
    expect(buyLadderCopy(ladder)).toBe('Open $80, fair $100, walk $120 on sold comps.');
    expect(buyLadderCopy(null)).toBeNull();
    expect(buyLadder({ source: 'none', low: null, median: null, high: null, count: 0 })).toBeNull();
    expect(buyLadder({ source: 'comps', low: 80, median: null, high: 120, count: 2 })).toBeNull();
    expect(OFFER_LADDER_NOTE).toMatch(/not a live tape/i);
    expect(OFFER_LADDER_NOTE).not.toMatch(/live market movers/i);
    expect(OFFER_LADDER_CASH_NOTE).toMatch(/cheapest first/i);
  });

  it('pulls the walk down to a target and refuses a target under the low', () => {
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 90 }))).toBe(
      'Open $80, fair $90, walk $90 on sold comps. Walk is the target you set.',
    );
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 110 }))).toBe(
      'Open $80, fair $100, walk $110 on sold comps. Walk is the target you set.',
    );
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 120 }))).toBe(
      'Open $80, fair $100, walk $120 on sold comps.',
    );
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 40 }))).toBe(
      'Your target $40 is under the low of sold comps ($80). No offer inside that range.',
    );
    expect(buyLadder(comps, { targetUsd: 0 })).toEqual(buyLadder(comps));
    expect(buyLadder(comps, { targetUsd: Number.NaN })).toEqual(buyLadder(comps));
  });

  it('caps the walk with cash still left and refuses cash under the low', () => {
    expect(buyLadderCopy(buyLadder(comps, { cashUsd: 90 }))).toBe(
      'Open $80, fair $90, walk $90 on sold comps. Walk is the cash left, under the median.',
    );
    expect(buyLadderCopy(buyLadder(comps, { cashUsd: 110 }))).toBe(
      'Open $80, fair $100, walk $110 on sold comps. Walk is the cash left.',
    );
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 110, cashUsd: 90 }))).toBe(
      'Open $80, fair $90, walk $90 on sold comps. Walk is the cash left, under the median.',
    );
    expect(buyLadderCopy(buyLadder(comps, { cashUsd: 50 }))).toBe(
      'Cash left $50 is under the low of sold comps ($80). No offer inside that range.',
    );
    expect(buyLadderCopy(buyLadder(comps, { cashUsd: 0 }))).toMatch(/Cash left \$0 is under the low/);
    expect(buyLadderCopy(buyLadder(comps, { targetUsd: 40, cashUsd: 30 }))).toBe(
      'Your target $40 and cash left $30 are under the low of sold comps ($80). No offer inside that range.',
    );
    expect(buyLadder(comps, { cashUsd: -5 })).toEqual(buyLadder(comps));
    expect(buyLadder(comps, { cashUsd: Number.POSITIVE_INFINITY })).toEqual(buyLadder(comps));
    expect(buyLadderCopy({
      source: 'comps',
      open: 80,
      fair: 100,
      walk: 120,
      walkFrom: 'high',
      medianAboveWalk: false,
      blocked: 'target',
      low: 80,
      targetUsd: null,
      cashUsd: null,
    })).toBeNull();
  });

  it('asks the high, takes the median, and passes under the low', () => {
    expect(sellLadderCopy(sellLadder(comps))).toBe(
      'Ask $120, take $100, pass under $80 on sold comps.',
    );
    expect(sellLadderCopy(sellLadder(comps, 90))).toBe(
      'Ask $120, take $100, pass under $80 on sold comps. Cost $90 is over the low.',
    );
    expect(sellLadderCopy(sellLadder(comps, 150))).toBe(
      'Ask $120, take $100, pass under $80 on sold comps. Cost $150 is over the high.',
    );
    expect(sellLadderCopy(sellLadder(comps, 80))).toBe(
      'Ask $120, take $100, pass under $80 on sold comps.',
    );
    expect(sellLadder(comps, 0)).toEqual(sellLadder(comps));
    expect(sellLadderCopy(null)).toBeNull();
    expect(sellLadder({ source: 'none', low: null, median: null, high: null, count: 0 })).toBeNull();
    const demo = saleRange({ id: 'demo-card', currentValue: 100 });
    expect(sellLadderCopy(sellLadder(demo))).toMatch(/on demo sales\.$/);
    expect(SELL_LADDER_NOTE).toMatch(/not a dealer bid/i);
    expect(SELL_LADDER_NOTE).toMatch(/not a live tape/i);
  });

  it('keeps cash for the next buy only after a cheaper one fits', () => {
    expect(ladderCashRoom(
      [
        { id: 'dear', usd: 100 },
        { id: 'cheap', usd: 40 },
        { id: 'blank', usd: null },
        { id: 'bad', usd: Number.NaN },
        { id: 'free', usd: -1 },
      ],
      90,
    )).toEqual({
      dear: 50,
      cheap: 90,
      blank: null,
      bad: null,
      free: null,
    });
    expect(ladderCashRoom([{ id: 'a', usd: 10 }], null)).toEqual({ a: null });
    expect(ladderCashRoom([{ id: 'a', usd: 10 }], -1)).toEqual({ a: null });
    const tight = ladderCashRoom(
      [{ id: 'b', usd: 40 }, { id: 'a', usd: 40 }],
      40,
    );
    expect(tight.a).toBe(40);
    expect(tight.b).toBe(0);
  });

  it('skips a demo checklist hole and uses the tightest active target', () => {
    expect(shopLadderCopy({ side: 'buy', kind: 'set-hole', range: comps, targetUsd: 90 })).toBeNull();
    expect(shopLadderCopy({ side: 'buy', kind: 'watchlist', range: null })).toBeNull();
    expect(shopLadderCopy({ side: 'sell', kind: 'duplicate-sell', range: comps })).toMatch(/Ask \$120/);
    expect(shopLadderCopy({
      side: 'buy',
      kind: 'watchlist',
      range: comps,
      targetUsd: 90,
      cashUsd: 200,
    })).toMatch(/Walk is the target you set/);
    const raw = {
      source: 'comps' as const,
      low: 40,
      median: 50,
      high: 60,
      count: 2,
      band: 'raw',
    };
    expect(buyLadderCopy(buyLadder(raw))).toBe('Open $40, fair $50, walk $60 on raw sold comps.');
    expect(sellLadderCopy(sellLadder(raw))).toBe('Ask $60, take $50, pass under $40 on raw sold comps.');
    expect(buyLadder(raw)?.band).toBe('raw');
    expect(sellLadder(raw)?.band).toBe('raw');
  });
});
