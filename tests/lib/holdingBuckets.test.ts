import { describe, expect, it } from 'vitest';
import {
  HOLDING_BUCKET_NOTE,
  holdCallCopy,
  holdCallFor,
  holdRowBit,
  holdingBucketCopy,
  storedMarkUsd,
  type BucketRow,
} from '../../lib/collector/holdingBuckets';

function sold(overrides: Partial<BucketRow> = {}): BucketRow {
  return {
    side: 'sold',
    player: 'Aaron Judge',
    takenUsd: 80,
    feeUsd: 3.2,
    realizedUsd: 36.8,
    treatment: 'short-term',
    ...overrides,
  };
}

function unsold(overrides: Partial<BucketRow> = {}): BucketRow {
  return {
    side: 'unsold',
    player: 'Near',
    takenUsd: null,
    feeUsd: null,
    realizedUsd: null,
    treatment: 'short-term',
    daysToLongTerm: 20,
    holdCall: 'hold',
    holdMarkUsd: 80,
    ...overrides,
  };
}

describe('holding buckets and the hold call', () => {
  it('keeps the disclosure off a tax form', () => {
    expect(HOLDING_BUCKET_NOTE).toMatch(/not a tax determination and not a live tape/i);
    expect(HOLDING_BUCKET_NOTE).toMatch(/missing mark/i);
    expect(HOLDING_BUCKET_NOTE).toMatch(/more than 45 days/i);
  });

  it('reads a stored mark and ignores a missing or bad one', () => {
    expect(storedMarkUsd(undefined)).toBeNull();
    expect(storedMarkUsd(Number.NaN)).toBeNull();
    expect(storedMarkUsd(Number.POSITIVE_INFINITY)).toBeNull();
    expect(storedMarkUsd(-1)).toBeNull();
    expect(storedMarkUsd(0)).toBe(0);
    expect(storedMarkUsd(10.126)).toBe(10.13);
  });

  it('holds a near-term gain, clears a long-term gain, and marks the rest under or off', () => {
    const ahead = { markUsd: 80, costUsd: 20 };
    expect(holdCallFor({ treatment: null, daysToLongTerm: 10, ...ahead })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 10, markUsd: null, costUsd: 20 })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 10, markUsd: 80, costUsd: null })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 10, markUsd: 80, costUsd: Number.NaN })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 20, ...ahead })).toBe('hold');
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 1, ...ahead })).toBe('hold');
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 45, ...ahead })).toBe('hold');
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 46, ...ahead })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 0, ...ahead })).toBeNull();
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: null, ...ahead })).toBeNull();
    expect(holdCallFor({ treatment: 'long-term', daysToLongTerm: 0, ...ahead })).toBe('clear');
    expect(holdCallFor({ treatment: 'short-term', daysToLongTerm: 10, markUsd: 20, costUsd: 20 })).toBe('under');
    expect(holdCallFor({ treatment: 'long-term', daysToLongTerm: 0, markUsd: 0, costUsd: 20 })).toBe('under');
    expect(holdCallFor({ treatment: 'long-term', daysToLongTerm: 0, markUsd: 10, costUsd: 40 })).toBe('under');
  });

  it('adds short-term, long-term, and undated recorded sales', () => {
    expect(holdingBucketCopy([])).toBe('');
    expect(holdingBucketCopy([unsold(), sold({ takenUsd: null, realizedUsd: null })])).toBe('');
    expect(holdingBucketCopy([sold()])).toBe(
      'Holding buckets: short-term 1 card, taken $80, card-show fee $3.2, realized $36.8.',
    );
    expect(holdingBucketCopy([
      sold({ player: 'A', realizedUsd: null, feeUsd: null }),
      sold({ player: 'B', takenUsd: 20, feeUsd: 0.8, realizedUsd: null }),
    ])).toBe(
      'Holding buckets: short-term 2 cards, taken $100, card-show fee $0.8, realized stays off without a cost.',
    );
    expect(holdingBucketCopy([
      sold({ treatment: 'long-term', realizedUsd: -4 }),
      sold({ player: 'B', treatment: 'long-term', takenUsd: 50, feeUsd: 2, realizedUsd: 10 }),
    ])).toBe(
      'Holding buckets: long-term 2 cards, taken $130, card-show fee $5.2, realized $6.',
    );
    expect(holdingBucketCopy([
      sold({ realizedUsd: 10, takenUsd: 40, feeUsd: 1.6 }),
      sold({ player: 'B', treatment: 'long-term', takenUsd: 50, feeUsd: 2, realizedUsd: 8 }),
    ])).toBe(
      'Holding buckets: short-term 1 card, taken $40, card-show fee $1.6, realized $10 and long-term 1 card, taken $50, card-show fee $2, realized $8.',
    );
    expect(holdingBucketCopy([sold({ treatment: null, takenUsd: 15, feeUsd: 0.6, realizedUsd: 4.4 })])).toBe(
      'Holding buckets: no holding dates on 1 card, taken $15, card-show fee $0.6, realized $4.4.',
    );
    expect(holdingBucketCopy([
      sold({ treatment: null, player: 'A', takenUsd: 15, feeUsd: 0.6, realizedUsd: 4 }),
      sold({ treatment: undefined, player: 'B', takenUsd: 15, feeUsd: 0.6, realizedUsd: 4 }),
    ])).toBe(
      'Holding buckets: no holding dates on 2 cards, taken $30, card-show fee $1.2, realized $8.',
    );
    expect(holdingBucketCopy([
      sold({ takenUsd: 40, feeUsd: 1.6, realizedUsd: 10 }),
      sold({ player: 'Long', treatment: 'long-term', takenUsd: 50, feeUsd: 2, realizedUsd: 8 }),
      sold({ player: 'Bare', treatment: null, takenUsd: 15, feeUsd: 0.6, realizedUsd: 4 }),
    ])).toBe(
      'Holding buckets: short-term 1 card, taken $40, card-show fee $1.6, realized $10 and long-term 1 card, taken $50, card-show fee $2, realized $8. No holding dates: 1 card, taken $15, card-show fee $0.6, realized $4.',
    );
  });

  it('names hold, clear, and under, and leaves the rest off the call', () => {
    expect(holdCallCopy([])).toBe('');
    expect(holdCallCopy([unsold({ holdCall: null }), sold({ holdCall: 'hold' })])).toBe('');
    expect(holdCallCopy([unsold()])).toBe(
      'Hold call: hold 1 card inside 45 days of long-term (Near).',
    );
    expect(holdCallCopy([
      unsold({ player: 'A' }),
      unsold({ player: 'B' }),
    ])).toBe(
      'Hold call: hold 2 cards inside 45 days of long-term (A, B).',
    );
    expect(holdCallCopy([
      unsold({ player: 'A', holdCall: 'clear' }),
    ])).toBe(
      'Hold call: clear 1 card already long-term and still ahead after the card-show fee (A).',
    );
    expect(holdCallCopy([
      unsold({ player: 'A', holdCall: 'clear' }),
      unsold({ player: 'B', holdCall: 'clear' }),
    ])).toBe(
      'Hold call: clear 2 cards already long-term and still ahead after the card-show fee (A, B).',
    );
    expect(holdCallCopy([unsold({ player: 'Cheap', holdCall: 'under' })])).toBe(
      'Hold call: under 1 card not ahead after the card-show fee (Cheap).',
    );
    expect(holdCallCopy([
      unsold({ player: 'A', holdCall: 'under' }),
      unsold({ player: 'B', holdCall: 'under' }),
    ])).toBe(
      'Hold call: under 2 cards not ahead after the card-show fee (A, B).',
    );
    expect(holdCallCopy([
      unsold({ player: 'Near' }),
      unsold({ player: 'Booked', holdCall: 'clear' }),
      unsold({ player: 'Cheap', holdCall: 'under' }),
      unsold({ player: 'Far', holdCall: null }),
      unsold({ player: 'Bare', holdCall: undefined }),
    ])).toBe(
      'Hold call: hold 1 card inside 45 days of long-term (Near), clear 1 card already long-term and still ahead after the card-show fee (Booked), and under 1 card not ahead after the card-show fee (Cheap). 2 unsold cards stay off this call.',
    );
    expect(holdCallCopy([
      unsold({ player: 'Near' }),
      unsold({ player: 'Far', holdCall: null }),
    ])).toBe(
      'Hold call: hold 1 card inside 45 days of long-term (Near). 1 unsold card stays off this call.',
    );
    expect(holdCallCopy([
      unsold({ player: 'A' }),
      unsold({ player: 'B' }),
      unsold({ player: 'C' }),
      unsold({ player: 'D' }),
      unsold({ player: 'E' }),
    ])).toBe(
      'Hold call: hold 5 cards inside 45 days of long-term (A, B, C, D, and 1 more).',
    );
  });

  it('puts the call and the mark on the unsold row', () => {
    expect(holdRowBit({})).toBe('');
    expect(holdRowBit({ holdCall: 'hold' })).toBe('');
    expect(holdRowBit({ holdCall: null, holdMarkUsd: 10 })).toBe('');
    expect(holdRowBit({ holdCall: 'hold', holdMarkUsd: 80 })).toBe(' · hold until long-term · mark $80');
    expect(holdRowBit({ holdCall: 'clear', holdMarkUsd: 80.5 })).toBe(' · clear after the card-show fee · mark $80.5');
    expect(holdRowBit({ holdCall: 'under', holdMarkUsd: 0 })).toBe(' · under after the card-show fee · mark $0');
  });
});
