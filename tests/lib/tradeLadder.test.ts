import { describe, expect, it } from 'vitest';
import { saleRange, type SaleRange } from '../../lib/collector/saleRange';
import {
  TRADE_LADDER_NOTE,
  tradeLadder,
  tradeLadderCopy,
  type TradeLadderCard,
} from '../../lib/collector/tradeLadder';

const comps = saleRange({
  id: 'judge',
  currentValue: 999,
  salesData: [
    { price: 80, soldAt: '2026-09-01' },
    { price: 100, soldAt: '2026-09-02' },
    { price: 120, soldAt: '2026-09-03' },
  ],
});

const none = saleRange({ id: 'zero', currentValue: 0 });
const demo = saleRange({ id: 'demo-card', currentValue: 100 });

function card(id: string, usd: number, range: SaleRange | null | undefined, player = 'Aaron Judge'): TradeLadderCard {
  return { id, player, usd, range };
}

describe('trade ladder', () => {
  it('waits for a card and keeps cash off the rungs', () => {
    const empty = tradeLadder([], []);
    expect(empty.call).toBe('no score');
    expect(tradeLadderCopy(empty)).toBe('No card is on this trade yet. Cash you add is not a rung. Not a live tape.');
    expect(TRADE_LADDER_NOTE).toMatch(/demo sketch/i);
    expect(TRADE_LADDER_NOTE).toMatch(/not a dealer fill/i);
    expect(TRADE_LADDER_NOTE).toMatch(/not a live tape/i);
    expect(TRADE_LADDER_NOTE).not.toMatch(/live market movers/i);
  });

  it('leaves a missing range, a zero mark, and a blank name off the count', () => {
    const ladder = tradeLadder(
      [
        card('a', 90, none),
        card('b', 0, comps),
        card('c', Number.NaN, comps, '   '),
        card('d', -5, comps, 'Pad'),
        card('e', Number.POSITIVE_INFINITY, comps),
        { id: 'f', player: 4 as unknown as string, usd: 90, range: null },
        card('g', 90, undefined),
      ],
      [card('h', 0.001, comps, 'Zero Cents'), card('i', 40, null, 'No Range')],
    );
    expect(ladder.call).toBe('no score');
    expect(ladder.giveOff).toBe(7);
    expect(ladder.receiveOff).toBe(2);
    expect(ladder.give.map((line) => line.copy)).toEqual([
      'Aaron Judge stays off the ladder.',
      'Aaron Judge stays off the ladder.',
      'Held card stays off the ladder.',
      'Pad stays off the ladder.',
      'Aaron Judge stays off the ladder.',
      'Held card stays off the ladder.',
      'Aaron Judge stays off the ladder.',
    ]);
    expect(ladder.receive[0]).toMatchObject({ onLadder: false, player: 'Zero Cents' });
    expect(tradeLadderCopy(ladder)).toBe(
      'No mark on this trade sits on a sale range. A card with no range, and a mark of zero, stay off this count. Cash is not a rung. Not a live tape.',
    );
  });

  it('places give on the sell rungs and receive on the buy rungs', () => {
    const ladder = tradeLadder(
      [
        card('ask', 120, comps, 'Ask Card'),
        card('take', 100, comps, 'Take Card'),
        card('pass', 90, comps, 'Pass Card'),
        card('under', 50, comps, 'Under Card'),
      ],
      [
        card('open', 80, comps, 'Open Card'),
        card('fair', 90, comps, 'Fair Card'),
        card('walk', 110, comps, 'Walk Card'),
        card('over', 130, comps, 'Over Card'),
      ],
    );
    expect(ladder.giveSeats).toEqual({
      'at or over ask': 1,
      'down to take': 1,
      'down to pass': 1,
      'under pass': 1,
    });
    expect(ladder.receiveSeats).toEqual({
      'at or under open': 1,
      'up to fair': 1,
      'up to walk': 1,
      'over walk': 1,
    });
    expect(ladder.give[0].copy).toBe(
      'Ask Card $120 is at or over the ask on sold comps (ask $120, take $100, pass under $80).',
    );
    expect(ladder.give[2].copy).toBe(
      'Pass Card $90 is down to the pass on sold comps (ask $120, take $100, pass under $80).',
    );
    expect(ladder.receive[1].copy).toBe(
      'Fair Card $90 is up to the fair on sold comps (open $80, fair $100, walk $120).',
    );
    expect(ladder.receive[3].copy).toBe(
      'Over Card $130 is over the walk on sold comps (open $80, fair $100, walk $120).',
    );
    expect(ladder.call).toBe('both past');
    expect(tradeLadderCopy(ladder)).toBe(
      'Trade ladder: give 1 at or over the ask, 1 down to the take, 1 down to the pass, 1 under the pass, receive 1 at or under the open, 1 up to the fair, 1 up to the walk, 1 over the walk. A card you give is under the pass, and a card you receive is over the walk. Cash is not a rung. Not a dealer fill and not a live tape.',
    );
  });

  it('names one side when the other is still on the rungs, and counts cards that stay off', () => {
    const under = tradeLadder(
      [card('under', 50, comps), card('off', 0, comps, 'Blank Mark')],
      [card('fair', 90, comps, 'Jayson Tatum'), card('missing', 40, none, 'No Tape')],
    );
    expect(under.call).toBe('giving under');
    expect(tradeLadderCopy(under)).toBe(
      'Trade ladder: give 1 under the pass, receive 1 up to the fair. A card you give is under the pass. 1 give card and 1 receive card stay off the ladder. Cash is not a rung. Not a dealer fill and not a live tape.',
    );

    const over = tradeLadder(
      [card('take', 100, comps), card('ask', 130, comps, 'Second')],
      [card('over', 140, comps, 'Jayson Tatum'), card('also', 0, none), card('third', 0, none, 'Third')],
    );
    expect(over.call).toBe('receiving over');
    expect(over.giveOff).toBe(0);
    expect(tradeLadderCopy(over)).toMatch(/2 receive cards stay off the ladder/);
    expect(tradeLadderCopy(over)).toMatch(/A card you receive is over the walk/);

    const giveOnly = tradeLadder([card('take', 100, comps)], []);
    expect(giveOnly.call).toBe('give inside');
    expect(tradeLadderCopy(giveOnly)).toBe(
      'Trade ladder: give 1 down to the take. The card you give sits on the rungs. Cash is not a rung. Not a dealer fill and not a live tape.',
    );
    const giveMany = tradeLadder([card('a', 100, comps), card('b', 110, comps, 'Two')], []);
    expect(tradeLadderCopy(giveMany)).toMatch(/The cards you give sit on the rungs/);
    expect(tradeLadderCopy(giveMany)).toMatch(/give 2 down to the take/);

    const receiveOnly = tradeLadder([], [card('open', 80, comps, 'Jayson Tatum')]);
    expect(receiveOnly.call).toBe('receive inside');
    expect(tradeLadderCopy(receiveOnly)).toBe(
      'Trade ladder: receive 1 at or under the open. The card you receive sits on the rungs. Cash is not a rung. Not a dealer fill and not a live tape.',
    );
    const receiveMany = tradeLadder([], [card('a', 80, comps), card('b', 80, comps, 'Two')]);
    expect(tradeLadderCopy(receiveMany)).toMatch(/The cards you receive sit on the rungs/);

    const both = tradeLadder([card('ask', 120, comps)], [card('walk', 110, comps, 'Jayson Tatum')]);
    expect(both.call).toBe('both inside');
    expect(tradeLadderCopy(both)).toMatch(/Both sides sit on the rungs/);
    expect(tradeLadderCopy(both)).not.toMatch(/stay off the ladder/);

    expect(tradeLadderCopy(tradeLadder(
      [card('take', 100, comps), card('off', 0, comps)],
      [],
    ))).toMatch(/1 give card stays off the ladder/);
    expect(tradeLadderCopy(tradeLadder(
      [card('take', 100, comps), card('off', 0, comps), card('off2', 0, comps, 'Two')],
      [],
    ))).toMatch(/2 give cards stay off the ladder/);
    expect(tradeLadderCopy(tradeLadder(
      [],
      [card('open', 80, comps, 'Jayson Tatum'), card('off', 0, none)],
    ))).toMatch(/1 receive card stays off the ladder/);
  });

  it('keeps a demo sketch labeled and does not borrow another card', () => {
    const ladder = tradeLadder(
      [card('demo', 100, demo, 'Demo Give')],
      [card('demo-get', 100, demo, 'Demo Receive')],
    );
    expect(ladder.give[0].copy).toMatch(/on demo sales/);
    expect(ladder.receive[0].copy).toMatch(/on demo sales/);
    expect(ladder.give[0].copy).not.toMatch(/sold comps/);
    const repeated = tradeLadder(
      [card('same', 50, comps, 'First'), card('same', 120, comps, 'Second')],
      [],
    );
    expect(repeated.give.map((line) => line.onLadder)).toEqual([true, true]);
    expect(repeated.giveSeats['under pass']).toBe(1);
    expect(repeated.giveSeats['at or over ask']).toBe(1);
    expect(repeated.call).toBe('giving under');
  });
});
