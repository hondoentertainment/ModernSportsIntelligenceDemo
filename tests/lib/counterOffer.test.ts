import { describe, expect, it } from 'vitest';
import { COUNTER_OFFER_NOTE, counterOffer } from '../../lib/collector/counterOffer';
import type { SaleRange } from '../../lib/collector/saleRange';

const wide: SaleRange = { source: 'comps', low: 40, median: 50, high: 60, count: 3 };
const tight: SaleRange = { source: 'comps', low: 100, median: 100, high: 101, count: 2 };
const none: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };

describe('counter offer', () => {
  it('stays quiet when the ask is not over a walk', () => {
    expect(COUNTER_OFFER_NOTE).toMatch(/halfway/i);
    expect(counterOffer({ askUsd: 200, player: 'A', receiveId: 'a', range: null, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: Number.NaN, player: 'A', receiveId: 'a', range: wide, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: 0, player: 'A', receiveId: 'a', range: wide, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: -5, player: 'A', receiveId: 'a', range: wide, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: 60, player: 'A', receiveId: 'a', range: wide, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: 40, player: 'A', receiveId: 'a', range: wide, held: [] })).toBeNull();
    expect(counterOffer({ askUsd: 200, player: 'A', receiveId: 'a', range: none, held: [] })).toBeNull();
  });

  it('splits the difference and prices the held card that covers the most cash', () => {
    const offer = counterOffer({
      askUsd: 200,
      player: 'Aaron Judge',
      receiveId: 'judge',
      range: wide,
      held: [
        { id: '', player: 'Skip', usd: 90 },
        { id: 'judge', player: 'Aaron Judge', usd: 80 },
        { id: 'zero', player: 'Zero', usd: 0 },
        { id: 'neg', player: 'Neg', usd: -1 },
        { id: 'nan', player: 'Nan', usd: Number.NaN },
        { id: 'over', player: 'Over', usd: 200 },
        { id: 'round', player: 'Round', usd: 199.999 },
        { id: 'beta', player: 'Beta', usd: 40 },
        { id: 'gamma', player: 'Gamma', usd: 10 },
        { id: 'alpha', player: 'Alpha', usd: 40 },
      ],
    });
    expect(offer?.splitUsd).toBe(130);
    expect(offer?.trade?.giveId).toBe('alpha');
    expect(offer?.trade?.cashUsd).toBe(160);
    expect(offer?.trade?.call).toBe('you short');
    expect(offer?.copy).toMatch(/Split the difference at \$130/);
    expect(offer?.copy).toMatch(/That split is still over the walk/);
    expect(offer?.copy).toMatch(/give Alpha \(\$40\) and \$160 cash/);
    expect(offer?.copy).toMatch(/fair \(\$50\)/);
    expect(offer?.copy).toMatch(/you short/);
    expect(offer?.copy).toMatch(/Not a dealer fill and not a live tape/);
  });

  it('breaks cash ties by name and then id, and can still call the trade fair', () => {
    const named = counterOffer({
      askUsd: 200,
      player: ' ',
      receiveId: 'recv',
      range: wide,
      held: [
        { id: 'b', player: 'Beta', usd: 40 },
        { id: 'a2', player: 'Alpha', usd: 40 },
        { id: 'a', player: 'Alpha', usd: 40 },
      ],
    });
    expect(named?.trade?.giveId).toBe('a');
    expect(named?.copy).toMatch(/Held card/);

    const sameName = counterOffer({
      askUsd: 200,
      player: 'Judge',
      receiveId: 'recv',
      range: wide,
      held: [
        { id: 'b', player: 'Alpha', usd: 40 },
        { id: 'a', player: 'Alpha', usd: 40 },
      ],
    });
    expect(sameName?.trade?.giveId).toBe('a');

    const fair = counterOffer({
      askUsd: 102,
      player: 'Judge',
      receiveId: 'recv',
      range: tight,
      held: [{ id: 'pad', player: 'Pad', usd: 20, range: wide }],
    });
    expect(fair?.splitUsd).toBe(101.5);
    expect(fair?.trade?.call).toBe('fair');
    expect(fair?.copy).toMatch(/Split the difference at \$101\.5/);
    expect(fair?.copy).toMatch(/give Pad \(\$20\)/);
    expect(fair?.trade?.ladderCopy).toMatch(/under the pass/);

    const blankId = counterOffer({
      askUsd: 200,
      player: 'Judge',
      receiveId: '',
      range: wide,
      held: [],
    });
    expect(blankId?.trade).toBeNull();

    const noneHeld = counterOffer({
      askUsd: 200,
      player: 'Judge',
      receiveId: 'recv',
      range: wide,
      held: [],
    });
    expect(noneHeld?.trade).toBeNull();
    expect(noneHeld?.copy).toMatch(/no trade-plus-cash/i);
  });
});
