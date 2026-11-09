import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiscalService } from '../../lib/utils/FiscalService';
import {
  HOLD_WORTH_NOTE,
  LONG_TERM_TAX_RATE,
  SHORT_TERM_TAX_RATE,
  exitHoldWorthCopy,
  gainWorth,
  holdWorthCopy,
  holdWorthLine,
  percentRate,
  type ExitHoldRow,
  type HoldWorthSource,
} from '../../lib/collector/holdWorth';
import { exitMath } from '../../lib/collector/showExit';
import { makeCard } from '../helpers';

const NOW = Date.parse('2026-10-31T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;
const RATE = 'Estimated tax is 35% while the gain is short-term and 20% once it is long-term, on the gain after the ~4% card-show fee. Not a tax determination.';

function source(overrides: Partial<HoldWorthSource> = {}): HoldWorthSource {
  return {
    player: 'Near',
    holdCall: 'hold',
    treatment: 'short-term',
    holdRealizedUsd: 56.8,
    ...overrides,
  };
}

function exitRow(overrides: Partial<ExitHoldRow> = {}): ExitHoldRow {
  return {
    player: 'Near',
    held: true,
    cardId: 'near',
    takenUsd: 80,
    costUsd: 20,
    ...overrides,
  };
}

describe('hold worth', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the sell planner card-show rates and leaves the eBay fee off', () => {
    expect(HOLD_WORTH_NOTE).toMatch(/not a tax determination and not a live tape/i);
    expect(HOLD_WORTH_NOTE).toMatch(/35%/);
    expect(HOLD_WORTH_NOTE).toMatch(/more than 45 days/);
    expect(SHORT_TERM_TAX_RATE).toBe(0.35);
    expect(LONG_TERM_TAX_RATE).toBe(0.2);
    expect(percentRate(SHORT_TERM_TAX_RATE)).toBe('35%');
    expect(percentRate(LONG_TERM_TAX_RATE)).toBe('20%');
    const asOf = new Date(NOW);
    const basis = { purchasePrice: 100, gradingFees: 0, shippingFees: 0, insuranceFees: 0 };
    const long = FiscalService.simulateExit(
      makeCard({ ...basis, purchaseDate: '2020-01-01' }),
      200,
      undefined,
      asOf,
    );
    const short = FiscalService.simulateExit(
      makeCard({ ...basis, purchaseDate: new Date(NOW - 10 * DAY).toISOString() }),
      200,
      undefined,
      asOf,
    );
    const showLong = long.venueEstimates.find((row) => row.venue === 'Card Show');
    const showShort = short.venueEstimates.find((row) => row.venue === 'Card Show');
    const realized = exitMath(200, 100).realizedUsd;
    expect(showLong?.feeRate).toBe(0.04);
    expect(long.saleFees).toBeCloseTo(26);
    expect(gainWorth(realized, 'long-term')).toMatchObject({
      realizedUsd: 92,
      taxNowUsd: Math.round((showLong?.estimatedTax ?? 0) * 100) / 100,
      keptUsd: 0,
    });
    expect(gainWorth(realized, 'short-term')).toMatchObject({
      taxNowUsd: Math.round((showShort?.estimatedTax ?? 0) * 100) / 100,
      taxLongTermUsd: Math.round((showLong?.estimatedTax ?? 0) * 100) / 100,
      keptUsd: 13.8,
    });
    expect(gainWorth(Number.NaN, 'short-term')).toBeNull();
    expect(gainWorth(Number.POSITIVE_INFINITY, 'short-term')).toBeNull();
    expect(gainWorth(10, null)).toBeNull();
    expect(gainWorth(10, undefined)).toBeNull();
    expect(gainWorth(-4, 'short-term')).toEqual({
      realizedUsd: -4,
      taxNowUsd: 0,
      taxLongTermUsd: 0,
      keptUsd: 0,
    });
    expect(gainWorth(0, 'long-term')?.keptUsd).toBe(0);
    expect(gainWorth(0.01, 'short-term')?.keptUsd).toBe(0);
  });

  it('names the dollars on a hold and nothing more when the call is clear or under', () => {
    expect(holdWorthLine('hold', null)).toBe('');
    expect(holdWorthLine('hold', gainWorth(0.01, 'short-term'))).toBe(
      'Waiting keeps nothing more on this mark. Not a tax determination.',
    );
    expect(holdWorthLine('hold', gainWorth(56.8, 'short-term'))).toBe(
      'Waiting on this mark keeps $8.52 versus the 20% long-term rate. Estimated tax is $19.88 while it is short-term. Not a tax determination.',
    );
    expect(holdWorthLine('clear', null)).toMatch(/already on the 20% long-term rate/);
    expect(holdWorthLine('under', gainWorth(-1, 'short-term'))).toMatch(/estimated tax stays off/);
  });

  it('totals waiting, cards that keep nothing, and recorded short-term sales', () => {
    expect(holdWorthCopy([], [])).toBe('');
    expect(holdWorthCopy([source({ holdCall: null })], [source({ treatment: null, realizedUsd: 9.2 })])).toBe('');
    expect(holdWorthCopy([source({ holdCall: 'hold', holdRealizedUsd: null })], [])).toBe('');
    expect(holdWorthCopy([source({ treatment: null })], [])).toBe('');
    expect(holdWorthCopy([source()], [])).toBe(
      `Hold worth: waiting keeps $8.52 on the stored mark for 1 card inside the hold window (Near). ${RATE}`,
    );
    expect(holdWorthCopy([
      source(),
      source({ player: 'Soon', holdRealizedUsd: 61.8 }),
    ], [])).toBe(
      `Hold worth: waiting keeps $17.79 on the stored mark for 2 cards inside the hold window (Near, Soon). ${RATE}`,
    );
    expect(holdWorthCopy([
      source({ player: 'A' }),
      source({ player: 'B' }),
      source({ player: 'C' }),
      source({ player: 'D' }),
      source({ player: 'E' }),
    ], [])).toMatch(/\(A, B, C, D, and 1 more\)/);
    expect(holdWorthCopy([source({ holdCall: 'clear', treatment: 'long-term', holdRealizedUsd: 64.8 })], [])).toBe(
      `Hold worth: 1 card already long-term or under the fee keeps nothing more (Near). ${RATE}`,
    );
    expect(holdWorthCopy([
      source({ player: 'Booked', holdCall: 'clear', treatment: 'long-term', holdRealizedUsd: 64.8 }),
      source({ player: 'Insured', holdCall: 'under', treatment: 'long-term', holdRealizedUsd: -0.48 }),
    ], [])).toMatch(/2 cards already long-term or under the fee keep nothing more \(Booked, Insured\)/);
    expect(holdWorthCopy([
      source({ holdRealizedUsd: 0.01 }),
      source({ player: 'Booked', holdCall: 'clear', treatment: null }),
    ], [])).toMatch(/2 cards already long-term or under the fee keep nothing more \(Near, Booked\)/);
    expect(holdWorthCopy([], [source({ treatment: 'short-term', realizedUsd: 9.2, holdCall: null })])).toBe(
      `Hold worth: a recorded short-term sale left $1.38 versus the 20% long-term rate (Near). ${RATE}`,
    );
    expect(holdWorthCopy([], [
      source({ player: 'Short', treatment: 'short-term', realizedUsd: 9.2 }),
      source({ player: 'Also', treatment: 'short-term', realizedUsd: 20 }),
      source({ player: 'Loss', treatment: 'short-term', realizedUsd: -2 }),
      source({ player: 'Tiny', treatment: 'short-term', realizedUsd: 0.01 }),
      source({ player: 'Bare', treatment: 'short-term', realizedUsd: null }),
      source({ player: 'Long', treatment: 'long-term', realizedUsd: 18.8 }),
      source({ player: 'Undated', treatment: null, realizedUsd: 4.4 }),
    ])).toMatch(/recorded short-term sales left \$4\.38 versus the 20% long-term rate \(Short, Also\)/);
    expect(holdWorthCopy(
      [source(), source({ player: 'Booked', holdCall: 'clear', treatment: 'long-term', holdRealizedUsd: 64.8 })],
      [source({ player: 'Short', treatment: 'short-term', realizedUsd: 9.2 })],
    )).toBe(
      `Hold worth: waiting keeps $8.52 on the stored mark for 1 card inside the hold window (Near). 1 card already long-term or under the fee keeps nothing more (Booked). a recorded short-term sale left $1.38 versus the 20% long-term rate (Short). ${RATE}`,
    );
  });

  it('prices a taken price that is still held and leaves the same cards off', () => {
    const nearAt = new Date(NOW - 330 * DAY).toISOString();
    const farAt = new Date(NOW - 10 * DAY).toISOString();
    expect(exitHoldWorthCopy({ rows: [exitRow({ held: false })], cards: [], now: NOW })).toBe('');
    expect(exitHoldWorthCopy({
      rows: [exitRow({ cardId: null })],
      cards: [],
      now: NOW,
    })).toMatch(/this price stays off/);
    expect(exitHoldWorthCopy({
      rows: [exitRow(), exitRow({ player: 'Bare', cardId: 'bare', costUsd: null })],
      cards: [{ id: 'near' }, { id: 'bare', purchaseDate: 'not-a-date' }],
      now: NOW,
    })).toMatch(/this price stays off/);
    expect(exitHoldWorthCopy({
      rows: [exitRow({ takenUsd: -5 })],
      cards: [{ id: 'near', purchaseDate: nearAt }],
      now: NOW,
    })).toMatch(/missing purchase date, no cost, and a short-term gain more than 45 days/);
    expect(exitHoldWorthCopy({
      rows: [exitRow({ player: 'Far', takenUsd: 100, costUsd: 10 })],
      cards: [{ id: 'near', purchaseDate: farAt }],
      now: NOW,
    })).toMatch(/this price stays off/);
    expect(exitHoldWorthCopy({
      rows: [exitRow()],
      cards: [{ id: 'near', purchaseDate: nearAt }],
      now: NOW,
    })).toBe(
      `Hold worth: waiting keeps $8.52 versus taking this price now for 1 card inside the hold window (Near). ${RATE}`,
    );
    expect(exitHoldWorthCopy({
      rows: [
        exitRow(),
        exitRow({ player: 'Soon', cardId: 'soon', takenUsd: 80, costUsd: 15 }),
        exitRow({ player: 'A', cardId: 'a' }),
        exitRow({ player: 'B', cardId: 'b' }),
        exitRow({ player: 'C', cardId: 'c' }),
      ],
      cards: ['near', 'soon', 'a', 'b', 'c'].map((id) => ({ id, purchaseDate: nearAt })),
      now: NOW,
    })).toMatch(/5 cards inside the hold window \(Near, Soon, A, B, and 1 more\)/);
    expect(exitHoldWorthCopy({
      rows: [exitRow({ player: 'Booked', takenUsd: 80, costUsd: 12 })],
      cards: [{ id: 'near', purchaseDate: '2024-01-01' }],
      now: NOW,
    })).toBe(
      `Hold worth: 1 price is already long-term, so waiting keeps nothing more (Booked). ${RATE}`,
    );
    expect(exitHoldWorthCopy({
      rows: [
        exitRow({ player: 'Booked', cardId: 'booked', takenUsd: 80, costUsd: 12 }),
        exitRow({ player: 'Older', cardId: 'older', takenUsd: 40, costUsd: 10 }),
      ],
      cards: [
        { id: 'booked', purchaseDate: '2024-01-01' },
        { id: 'older', purchaseDate: '2020-01-01' },
      ],
      now: NOW,
    })).toMatch(/2 prices are already long-term, so waiting keeps nothing more \(Booked, Older\)/);
    expect(exitHoldWorthCopy({
      rows: [exitRow({ player: 'Cheap', takenUsd: 20, costUsd: 40 })],
      cards: [{ id: 'near', purchaseDate: nearAt }],
      now: NOW,
    })).toBe(
      `Hold worth: 1 price is not ahead after the card-show fee, so waiting keeps nothing more (Cheap). ${RATE}`,
    );
    expect(exitHoldWorthCopy({
      rows: [
        exitRow({ player: 'Cheap', cardId: 'cheap', takenUsd: 20, costUsd: 40 }),
        exitRow({ player: 'Zero', cardId: 'zero', takenUsd: 0, costUsd: 20 }),
      ],
      cards: [
        { id: 'cheap', purchaseDate: farAt },
        { id: 'zero', purchaseDate: '2024-01-01' },
      ],
      now: NOW,
    })).toMatch(/2 prices are not ahead after the card-show fee, so waiting keeps nothing more \(Cheap, Zero\)/);
    expect(exitHoldWorthCopy({
      rows: [exitRow({ player: 'Tiny', takenUsd: 0.01, costUsd: 0 })],
      cards: [{ id: 'near', purchaseDate: nearAt }],
      now: NOW,
    })).toBe(
      `Hold worth: 1 card inside the hold window keeps nothing more (Tiny). ${RATE}`,
    );
    expect(exitHoldWorthCopy({
      rows: [
        exitRow({ player: 'Tiny', cardId: 'tiny', takenUsd: 0.01, costUsd: 0 }),
        exitRow({ player: 'Small', cardId: 'small', takenUsd: 0.01, costUsd: 0 }),
      ],
      cards: [
        { id: 'tiny', purchaseDate: nearAt },
        { id: 'small', purchaseDate: nearAt },
      ],
      now: NOW,
    })).toMatch(/2 cards inside the hold window keep nothing more \(Tiny, Small\)/);
    expect(exitHoldWorthCopy({
      rows: [
        exitRow(),
        exitRow({ player: 'Far', cardId: 'far', takenUsd: 100, costUsd: 10 }),
      ],
      cards: [
        { id: 'near', purchaseDate: nearAt },
        { id: 'far', purchaseDate: farAt },
      ],
      now: NOW,
    })).toMatch(/1 price stays off/);
    expect(exitHoldWorthCopy({
      rows: [
        exitRow(),
        exitRow({ player: 'Far', cardId: 'far', takenUsd: 100, costUsd: 10 }),
        exitRow({ player: 'Bare', cardId: 'bare', costUsd: null }),
      ],
      cards: [
        { id: 'near', purchaseDate: nearAt },
        { id: 'far', purchaseDate: farAt },
      ],
      now: NOW,
    })).toMatch(/2 prices stay off/);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(NOW));
    expect(exitHoldWorthCopy({
      rows: [exitRow()],
      cards: [{ id: 'near', purchaseDate: nearAt }],
    })).toMatch(/waiting keeps \$8\.52 versus taking this price now/);
  });
});
