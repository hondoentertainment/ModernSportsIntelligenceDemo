import { describe, expect, it } from 'vitest';
import { DEALER_HISTORY_NOTE, dealerHistory, dealerRowCopy } from '../../lib/collector/dealerHistory';
import type { SaleRange } from '../../lib/collector/saleRange';

const range: SaleRange = { source: 'comps', low: 40, median: 50, high: 60, count: 3 };

describe('dealer history', () => {
  it('groups prices by dealer and table and scores asks against the walk', () => {
    expect(DEALER_HISTORY_NOTE).toMatch(/not a dealer rating/i);
    const rows = dealerHistory([
      { dealer: '  ', table: '1', askUsd: 10, offerUsd: 0, result: 'open' },
      { dealer: 'Ace', table: '  ', askUsd: 10, offerUsd: 0, result: 'open' },
      {
        dealer: 'Rivera',
        table: '12',
        askUsd: 200,
        offerUsd: 65,
        result: 'bought',
        cardId: 'judge',
      },
      {
        dealer: 'rivera',
        table: '12',
        askUsd: 50,
        offerUsd: 0,
        result: 'passed',
        cardId: 'judge',
      },
      {
        dealer: 'Ace',
        table: '2',
        askUsd: 10,
        offerUsd: 0,
        result: 'open',
        cardId: 'missing',
      },
      {
        dealer: 'Ace',
        table: '2',
        askUsd: 0,
        offerUsd: 0,
        result: 'bought',
      },
      {
        dealer: 'Beta',
        table: '1',
        askUsd: 80,
        offerUsd: 0,
        result: 'held',
        cardId: 'judge',
      },
      {
        dealer: 'Lot',
        table: '3',
        askUsd: 100,
        offerUsd: 80,
        result: 'bought',
        lines: [
          { cardId: 'judge', askUsd: 200 },
          { askUsd: 10 },
          { cardId: 'judge' },
        ],
      },
    ], { judge: range, missing: null });

    const rivera = rows.find((row) => row.key === 'rivera|12');
    expect(rivera).toMatchObject({
      dealer: 'Rivera',
      count: 2,
      bought: 1,
      passed: 1,
      paidUsd: 65,
      quotedUsd: 250,
      overWalk: 1,
      atOrUnder: 1,
      call: 'even',
    });
    expect(dealerRowCopy(rivera!)).toMatch(/2 notes/);
    expect(dealerRowCopy(rivera!)).toMatch(/Even on this book/);
    expect(dealerRowCopy(rivera!)).toMatch(/Not a dealer rating/);

    const ace = rows.find((row) => row.key === 'ace|2');
    expect(ace?.call).toBe('unscored');
    expect(ace?.bought).toBe(1);
    expect(ace?.open).toBe(1);
    expect(dealerRowCopy(ace!)).toMatch(/No ask on this dealer sits on a card in the book/);
    expect(dealerRowCopy(ace!)).toMatch(/1 bought, 1 passed, 1 open|2 notes/);

    const beta = rows.find((row) => row.dealer === 'Beta');
    expect(beta?.call).toBe('steep');
    expect(beta?.bought).toBe(0);
    expect(dealerRowCopy(beta!)).toMatch(/1 ask sits over the walk, 0 at or under/);
    expect(dealerRowCopy(beta!)).toMatch(/Steep on this book/);

    const lot = rows.find((row) => row.dealer === 'Lot');
    expect(lot).toMatchObject({ paidUsd: 80, quotedUsd: 100, overWalk: 1, unscored: 2, call: 'steep' });
    expect(dealerRowCopy(lot!)).toMatch(/2 asks stay off the score/);

    expect(rows.map((row) => row.key)).toEqual(['rivera|12', 'ace|2', 'lot|3', 'beta|1']);
  });

  it('calls the table fair when more asks sit at or under the walk', () => {
    const rows = dealerHistory([
      { dealer: 'Zed', table: '9', askUsd: 40, offerUsd: 40, result: 'bought', cardId: 'a' },
      { dealer: 'Zed', table: '9', askUsd: 45, offerUsd: 0, result: 'open', cardId: 'a' },
      { dealer: 'Zed', table: '9', askUsd: 200, offerUsd: 0, result: 'passed', cardId: 'a' },
      { dealer: 'Zed', table: '9', askUsd: 10, offerUsd: 0, result: 'open' },
      { dealer: 'Amy', table: '2', askUsd: 30, offerUsd: 0, result: 'open', cardId: 'a' },
      { dealer: 'Amy', table: '1', askUsd: 30, offerUsd: 0, result: 'open', cardId: 'a' },
      { dealer: 'Nil', table: '1', askUsd: 0, offerUsd: 0, result: 'open', cardId: 'a' },
    ], { a: range });
    const zed = rows[0];
    expect(zed?.call).toBe('fair');
    expect(zed?.unscored).toBe(1);
    expect(dealerRowCopy(zed!)).toMatch(/2 asks sit at or under the walk, 1 over/);
    expect(dealerRowCopy(zed!)).toMatch(/Fair on this book/);
    expect(dealerRowCopy(zed!)).toMatch(/1 ask stays off the score/);
    expect(rows.map((row) => row.key)).toEqual(['zed|9', 'amy|1', 'amy|2', 'nil|1']);
    expect(rows.find((row) => row.dealer === 'Nil')?.call).toBe('unscored');
    const one = dealerHistory([
      { dealer: 'Solo', table: '1', askUsd: 40, offerUsd: 0, result: 'passed', cardId: 'a' },
    ], { a: range })[0];
    expect(dealerRowCopy(one!)).toMatch(/1 note/);
    expect(dealerRowCopy(one!)).toMatch(/1 ask sits at or under the walk, 0 over/);
  });
});
