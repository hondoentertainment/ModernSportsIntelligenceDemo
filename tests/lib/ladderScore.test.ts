import { describe, expect, it } from 'vitest';
import {
  LADDER_SCORE_NOTE,
  buyScoreCopy,
  buySeat,
  cardRanges,
  sellScoreCopy,
  sellSeat,
  tableScore,
  weekLadder,
  weekLadderCopy,
} from '../../lib/collector/ladderScore';
import {
  buyLadder,
  sellLadder,
  type BuyLadder,
  type SellLadder,
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

const buy = buyLadder(comps) as BuyLadder;
const sell = sellLadder(comps) as SellLadder;

const blocked: BuyLadder = { ...buy, blocked: 'target', targetUsd: 40 };

describe('ladder score', () => {
  it('places a buy on the open, the fair, the walk, or past the walk', () => {
    expect(buySeat(80, buy)).toBe('at or under open');
    expect(buySeat(80.004, buy)).toBe('at or under open');
    expect(buySeat(80.005, buy)).toBe('up to fair');
    expect(buySeat(100, buy)).toBe('up to fair');
    expect(buySeat(110, buy)).toBe('up to walk');
    expect(buySeat(120, buy)).toBe('up to walk');
    expect(buySeat(120.02, buy)).toBe('over walk');
    expect(buyScoreCopy(85, buy, 'This buy')).toBe(
      'This buy $85 is up to the fair on sold comps (open $80, fair $100, walk $120).'
    );
    expect(buyScoreCopy(130, buy, 'Paid')).toBe(
      'Paid $130 is over the walk on sold comps (open $80, fair $100, walk $120).'
    );
    expect(buySeat(null, buy)).toBeNull();
    expect(buySeat(0, buy)).toBeNull();
    expect(buySeat(0.001, buy)).toBeNull();
    expect(buySeat(Number.NaN, buy)).toBeNull();
    expect(buySeat(Number.POSITIVE_INFINITY, buy)).toBeNull();
    expect(buySeat(10, null)).toBeNull();
    expect(buySeat(90, blocked)).toBeNull();
    expect(buyScoreCopy(90, blocked, 'This buy')).toBeNull();
    expect(buyScoreCopy(0, buy, 'This buy')).toBeNull();
    expect(buyScoreCopy(10, null, 'This buy')).toBeNull();
    expect(LADDER_SCORE_NOTE).toMatch(/demo sketch/i);
    expect(LADDER_SCORE_NOTE).toMatch(/not a live tape/i);
    expect(LADDER_SCORE_NOTE).not.toMatch(/live market movers/i);
  });

  it('places a sell on the ask, the take, the pass, or under the pass', () => {
    expect(sellSeat(120, sell)).toBe('at or over ask');
    expect(sellSeat(119.996, sell)).toBe('at or over ask');
    expect(sellSeat(110, sell)).toBe('down to take');
    expect(sellSeat(100, sell)).toBe('down to take');
    expect(sellSeat(80, sell)).toBe('down to pass');
    expect(sellSeat(79.99, sell)).toBe('under pass');
    expect(sellScoreCopy(90, sell, 'This mark')).toBe(
      'This mark $90 is down to the pass on sold comps (ask $120, take $100, pass under $80).'
    );
    const demo = sellLadder(saleRange({ id: 'demo-card', currentValue: 100 }));
    expect(sellScoreCopy(100, demo, 'Local mark')).toMatch(/on demo sales/);
    expect(sellSeat(10, null)).toBeNull();
    expect(sellSeat(0, sell)).toBeNull();
    expect(sellScoreCopy(null, sell, 'This offer')).toBeNull();
    expect(sellScoreCopy(40, null, 'This offer')).toBeNull();
  });

  it('scores a bought, passed, or open table note and skips a number that is not an offer', () => {
    expect(tableScore({ result: 'bought', offerUsd: 90, askUsd: 140 }, buy)).toMatchObject({
      call: 'inside walk',
      copy: 'Paid $90 is up to the fair on sold comps (open $80, fair $100, walk $120). Bought inside the walk.',
    });
    expect(tableScore({ result: 'bought', offerUsd: 0, askUsd: 130 }, buy)?.call).toBe('over walk');
    expect(tableScore({ result: 'bought', offerUsd: 0, askUsd: 0 }, buy)).toBeNull();
    expect(tableScore({ result: 'bought', offerUsd: -5, askUsd: 80 }, buy)?.copy).toMatch(
      /Paid \$80/
    );
    expect(tableScore({ result: 'passed', offerUsd: 50, askUsd: 90 }, buy)?.call).toBe(
      'left the walk'
    );
    expect(tableScore({ result: 'passed', offerUsd: 50, askUsd: 140 }, buy)?.copy).toMatch(
      /The pass held/
    );
    expect(tableScore({ result: 'passed', offerUsd: 50, askUsd: 0 }, buy)).toBeNull();
    expect(tableScore({ result: 'open', offerUsd: 110, askUsd: 140 }, buy)).toMatchObject({
      call: 'open inside',
      copy: expect.stringMatching(/This offer \$110.*Still open, at or under the walk/),
    });
    expect(tableScore({ result: 'open', offerUsd: 0, askUsd: 140 }, buy)?.call).toBe('open over');
    expect(tableScore({ result: 'open', offerUsd: Number.NaN, askUsd: 80 }, buy)?.copy).toMatch(
      /This ask \$80/
    );
    expect(tableScore({ result: 'open', offerUsd: 0, askUsd: 0 }, buy)).toBeNull();
    expect(tableScore({ result: 'later', offerUsd: 90, askUsd: 90 }, buy)).toBeNull();
    expect(tableScore({ result: 'bought', offerUsd: 90, askUsd: 90 }, null)).toBeNull();
    expect(tableScore({ result: 'bought', offerUsd: 90, askUsd: 90 }, blocked)).toBeNull();
  });

  it('counts dated notes on a card in the book and leaves the rest off the week', () => {
    const now = Date.parse('2026-10-27T15:00:00.000Z');
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const ranges = {
      judge: comps,
      empty: saleRange({ id: 'empty', currentValue: 0 }),
      ...cardRanges([
        { id: '', currentValue: 10 },
        { id: 'demo', currentValue: 40 },
      ]),
    };
    expect(ranges.demo.source).toBe('demo');
    expect(Object.hasOwn(ranges, '')).toBe(false);
    const note = (
      result: string,
      offerUsd: number,
      askUsd: number,
      cardId: string | undefined,
      savedAt: string | undefined
    ) => ({ result, offerUsd, askUsd, cardId, savedAt });
    const at = (ms: number) => new Date(ms).toISOString();
    const week = weekLadder(
      [
        note('bought', 90, 140, 'judge', at(now)),
        note('bought', 130, 140, 'judge', at(now - 1000)),
        note('passed', 50, 90, 'judge', at(now - weekMs)),
        note('passed', 50, 140, 'judge', at(now - 2000)),
        note('open', 110, 140, 'judge', at(now - 3000)),
        note('open', 0, 140, 'judge', at(now - 4000)),
        note('bought', 90, 90, 'judge', at(now + 1)),
        note('bought', 90, 90, 'judge', at(now - weekMs - 1)),
        note('bought', 90, 90, 'judge', 'not-a-date'),
        note('bought', 90, 90, 'judge', undefined),
        note('bought', 90, 90, undefined, at(now)),
        note('bought', 90, 90, '   ', at(now)),
        note('bought', 90, 90, ' judge ', at(now - 5000)),
        note('bought', 90, 90, 'missing', at(now)),
        note('bought', 90, 90, 'empty', at(now)),
        note('later', 90, 90, 'judge', at(now)),
      ],
      ranges,
      now
    );
    expect(week).toEqual({
      inside: 2,
      over: 1,
      left: 1,
      held: 1,
      openInside: 1,
      openOver: 1,
      scored: 7,
    });
    expect(weekLadderCopy(week)).toBe(
      'Ladder this week: 2 bought inside the walk, 1 bought over the walk, 1 pass left the walk, 1 pass held, 2 still open. Not a settlement and not a live tape.'
    );
    expect(
      weekLadderCopy({
        ...week,
        inside: 1,
        over: 0,
        left: 2,
        held: 0,
        openInside: 1,
        openOver: 0,
        scored: 4,
      })
    ).toBe(
      'Ladder this week: 1 bought inside the walk, 0 bought over the walk, 2 passes left the walk, 0 passes held, 1 still open. Not a settlement and not a live tape.'
    );
    expect(
      weekLadderCopy({
        inside: 4,
        over: 0,
        left: 0,
        held: 0,
        openInside: 0,
        openOver: 0,
        scored: 0,
      })
    ).toMatch(/No dated table note sits on a sale range this week/);
    const lot = weekLadder(
      [{
        result: 'bought',
        offerUsd: 200,
        askUsd: 200,
        cardId: 'judge',
        savedAt: at(now),
        lines: [
          { cardId: 'judge', askUsd: 40 },
          { cardId: 'judge', askUsd: 160 },
        ],
      }, {
        result: 'bought',
        offerUsd: 200,
        askUsd: 200,
        cardId: 'judge',
        savedAt: at(now),
        lines: [
          { cardId: 'judge', askUsd: 90 },
          { cardId: 'judge', askUsd: 0 },
        ],
      }, {
        result: 'passed',
        offerUsd: 0,
        askUsd: 200,
        cardId: 'judge',
        savedAt: at(now),
        lines: [{ cardId: 'judge', askUsd: 140 }, { cardId: 'judge', askUsd: 90 }],
      }, {
        result: 'bought',
        offerUsd: 90,
        askUsd: 90,
        cardId: 'judge',
        savedAt: at(now),
        lines: [{ cardId: 'missing', askUsd: 10 }],
      }],
      ranges,
      now,
    );
    expect(lot).toMatchObject({ inside: 2, over: 1, left: 1, held: 1, scored: 5 });
    expect(buyScoreCopy(55, buyLadder({
      source: 'comps',
      low: 40,
      median: 50,
      high: 60,
      count: 2,
      band: 'raw',
    }), 'This buy')).toMatch(/on raw sold comps/);
    expect(sellScoreCopy(55, sellLadder({
      source: 'comps',
      low: 40,
      median: 50,
      high: 60,
      count: 2,
      band: 'PSA 10',
    }), 'This mark')).toMatch(/on PSA 10 sold comps/);
    expect(weekLadder([], {}, now).scored).toBe(0);
    expect(
      weekLadder(
        [{ result: 'bought', offerUsd: 1, askUsd: 1, cardId: 'judge', savedAt: at(now) }],
        { judge: null },
        now
      ).scored
    ).toBe(0);
  });
});
