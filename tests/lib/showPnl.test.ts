import { describe, expect, it } from 'vitest';
import { exitMarker } from '../../lib/collector/showExit';
import { floorBuyId } from '../../lib/collector/showClose';
import { lotCardId } from '../../lib/collector/tableLot';
import { collectionDraftId, floorSaleMarker } from '../../lib/shows/showTripLoop';
import {
  SHOW_PNL_NOTE,
  pnlCopy,
  pnlRowCopy,
  showPnl,
  weekPnl,
  type PnlBookCard,
  type PnlDecision,
  type PnlNote,
  type PnlRow,
} from '../../lib/collector/showPnl';

const NOW = Date.parse('2026-10-31T12:00:00.000Z');
const WEEK = 7 * 24 * 60 * 60 * 1000;

function card(overrides: Partial<PnlBookCard> = {}): PnlBookCard {
  return {
    id: 'judge',
    player: 'Aaron Judge',
    status: 'active',
    purchasePrice: 40,
    ...overrides,
  };
}

function note(overrides: Partial<PnlNote> = {}): PnlNote {
  return {
    id: 'n1',
    result: 'bought',
    askUsd: 30,
    offerUsd: 22,
    player: 'Aaron Judge',
    savedAt: '2026-10-30T00:00:00.000Z',
    ...overrides,
  };
}

function decision(overrides: Partial<PnlDecision> = {}): PnlDecision {
  return {
    opportunityId: 'opp-1',
    showId: 'nyc',
    player: 'Floor Player',
    call: 'buy',
    tablePriceUsd: 18,
    cardId: null,
    decidedAt: '2026-10-30T00:00:00.000Z',
    ...overrides,
  };
}

describe('show profit and loss', () => {
  it('prices a demo buy apart from a recorded sale', () => {
    expect(SHOW_PNL_NOTE).toMatch(/not a settlement and not a live tape/i);
    const buyId = floorBuyId('buy-1');
    const pnl = showPnl({
      notes: [
        note({ id: 'buy-1', player: '  Pnl   Buy  ', offerUsd: 22 }),
        note({ id: 'pass', result: 'passed', player: 'Passed' }),
        note({ id: 'open', result: 'open', player: 'Open' }),
        note({ id: 'zero', offerUsd: 0, askUsd: 0, player: 'Zero' }),
        note({
          id: 'lot-bad',
          player: 'Lot',
          lines: [{ player: 'A', askUsd: 10 }, { player: 'B', askUsd: 0 }],
        }),
        note({
          id: 'lot',
          offerUsd: 30,
          lines: [
            { player: 'Lot A', askUsd: 10 },
            { player: '  Lot   B ', askUsd: 20 },
            { player: '', askUsd: 10 },
          ],
        }),
        note({ id: 'sold-note', result: 'sold', offerUsd: 80, player: 'Held', cardId: 'held' }),
        note({ id: 'still', result: 'sold', offerUsd: 50, player: 'Still', cardId: 'still' }),
        note({ id: 'other', result: 'sold', offerUsd: 40, player: 'Other', cardId: 'other' }),
        note({ id: 'parked', result: 'sold', offerUsd: 15, player: 'Park', cardId: 'park' }),
        note({ id: 'ghost', result: 'sold', offerUsd: 10, player: '', cardId: '' }),
        note({ id: 'lot-sold', result: 'sold', offerUsd: 90, player: 'Bundle', lines: [{ player: 'A' }, { player: 'B' }] }),
      ],
      inventory: [
        card({ id: buyId, player: 'Pnl Buy', purchasePrice: 22, gradingFees: 0 }),
        card({
          id: lotCardId('lot', 0),
          player: 'Lot A',
          status: 'sold',
          purchasePrice: 10,
          salePrice: 40,
        }),
        card({ id: 'held', player: 'Held Card', status: 'sold', salePrice: 100, notes: `${exitMarker('sold-note')} sold.`, purchasePrice: 40, gradingFees: 10 }),
        card({ id: 'still', player: 'Still', status: 'active', purchasePrice: 20 }),
        card({ id: 'other', player: 'Other', status: 'sold', salePrice: 70, notes: 'Sold somewhere else.' }),
        card({ id: 'park', player: 'Park', status: 'consignment' }),
        card({ id: 'consign-buy', player: 'Consign Buy', status: 'consignment' }),
      ],
      decisions: [
        decision(),
        decision({ opportunityId: 'blank-player', player: '   ' }),
        decision({ opportunityId: 'no-price', tablePriceUsd: 0 }),
        decision({ opportunityId: 'nan', tablePriceUsd: Number.NaN }),
        decision({ call: 'pass', opportunityId: 'passed-floor' }),
      ],
    });
    expect(pnl.unsold.map((row) => row.player)).toEqual(['Floor Player', 'Lot B', 'Pnl Buy']);
    expect(pnl.buyCount).toBe(4);
    expect(pnl.buyUsd).toBe(62.5);
    expect(pnl.sold.map((row) => row.player)).toEqual(['Held', 'Lot A']);
    const held = pnl.sold.find((row) => row.player === 'Held');
    expect(held).toMatchObject({ takenUsd: 100, feeUsd: 4, costUsd: 50, realizedUsd: 46, paidUsd: null });
    const lot = pnl.sold.find((row) => row.player === 'Lot A');
    expect(lot).toMatchObject({ takenUsd: 40, feeUsd: 1.6, realizedUsd: 28.4, paidUsd: 7.5 });
    expect(pnl.unrecorded).toBe(2);
    expect(pnl.otherSale).toBe(1);
    expect(pnl.consigned).toBe(1);
    expect(pnl.copy).toMatch(/Show profit and loss: Bought 4 cards for \$62.5/);
    expect(pnl.copy).toMatch(/Recorded sales: 2 cards for \$140, card-show fee \$5.6, realized \$74.4/);
    expect(pnl.copy).toMatch(/Unsold inventory: 3 cards, cost \$55 \(Floor Player, Lot B, Pnl Buy\)/);
    expect(pnl.copy).toMatch(/Sold inventory: 2 cards, taken \$140, card-show fee \$5.6, realized \$74.4 after the card-show fee/);
    expect(pnl.copy).toMatch(/2 sales are still held, 1 is not the sale recorded, and 1 is on consignment/);
    expect(pnl.copy).toMatch(/Not a settlement and not a live tape/);
    expect(pnlRowCopy(pnl.unsold[0])).toMatch(/unsold/);
    expect(pnlRowCopy(held as PnlRow)).toMatch(/realized \$46/);
  });

  it('keeps a filed buy on the sold side once the book has a sale price', () => {
    const id = floorBuyId('buy-1');
    const pnl = showPnl({
      notes: [
        note({ id: 'buy-1', offerUsd: 40, player: 'Filed' }),
        note({ id: 'exit', result: 'sold', offerUsd: 90, player: 'Filed', cardId: id }),
      ],
      inventory: [card({
        id,
        player: 'Filed',
        status: 'sold',
        purchasePrice: 40,
        salePrice: 80,
        notes: `${exitMarker('exit')} sold.`,
      })],
    });
    expect(pnl.unsold).toHaveLength(0);
    expect(pnl.sold).toHaveLength(1);
    expect(pnl.sold[0]).toMatchObject({ takenUsd: 80, feeUsd: 3.2, realizedUsd: 36.8, paidUsd: 40 });
    expect(pnl.unrecorded).toBe(0);
    expect(pnl.copy).toMatch(/Bought 1 card for \$40/);
    expect(pnl.copy).toMatch(/Unsold inventory: none/);
    expect(pnl.copy).toMatch(/Sold inventory: 1 card, taken \$80/);
  });

  it('names a sold buy with no price, a sale with no cost, and a second copy', () => {
    const bare = floorBuyId('bare');
    const rich = floorBuyId('rich');
    const pnl = showPnl({
      notes: [
        note({ id: 'bare', player: 'Bare' }),
        note({ id: 'rich', player: 'Rich', offerUsd: 25 }),
        note({ id: 'basis', result: 'sold', offerUsd: 10, askUsd: 0, player: 'No Basis', cardId: 'basis' }),
        note({ id: 'again', result: 'sold', offerUsd: 12, player: 'No Basis', cardId: 'basis' }),
      ],
      inventory: [
        card({ id: bare, player: 'Bare', status: 'sold', purchasePrice: 22, salePrice: undefined }),
        card({ id: rich, player: 'Rich', status: 'sold', purchasePrice: undefined, salePrice: 50, gradingFees: 5 }),
        card({ id: 'basis', player: 'No Basis', status: 'sold', purchasePrice: undefined, salePrice: 10, notes: `${exitMarker('basis')} sold.` }),
      ],
    });
    expect(pnl.sold.map((row) => row.player)).toEqual(['Bare', 'No Basis', 'Rich']);
    expect(pnl.noBasis).toBe(1);
    expect(pnl.realizedRows).toBe(1);
    expect(pnl.copy).toMatch(/1 has no sale price/);
    expect(pnl.copy).toMatch(/1 recorded sale has no cost basis/);
    expect(pnl.copy).toMatch(/realized stays off without a cost|realized \$/);
    expect(pnlRowCopy(pnl.sold[0])).toMatch(/no sale price/);
    expect(pnlRowCopy(pnl.sold[1])).toMatch(/no cost basis/);
    expect(pnl.unrecorded).toBe(0);
  });

  it('separates several missing prices and missing costs', () => {
    const pnl = showPnl({
      notes: [
        note({ id: 'a', player: 'A', offerUsd: 5 }),
        note({ id: 'b', player: 'B', offerUsd: 5 }),
        note({ id: 'c', result: 'sold', offerUsd: 20, player: 'C', cardId: 'c' }),
        note({ id: 'd', result: 'sold', offerUsd: 20, player: 'D', cardId: 'd' }),
        note({ id: 'e', result: 'sold', offerUsd: 20, player: 'E', cardId: 'e' }),
      ],
      inventory: [
        card({ id: floorBuyId('a'), player: 'A', status: 'sold', purchasePrice: 5, salePrice: undefined }),
        card({ id: floorBuyId('b'), player: 'B', status: 'sold', purchasePrice: 5, salePrice: undefined }),
        card({ id: 'c', player: 'C', status: 'sold', purchasePrice: undefined, salePrice: 20, notes: `${exitMarker('c')} sold.` }),
        card({ id: 'd', player: 'D', status: 'sold', purchasePrice: undefined, salePrice: 20, notes: `${exitMarker('d')} sold.` }),
        card({ id: 'e', player: 'E', status: 'sold', purchasePrice: 4, salePrice: 20, notes: `${exitMarker('e')} sold.` }),
      ],
    });
    expect(pnl.copy).toMatch(/and 1 more/);
    expect(pnl.copy).toMatch(/2 have no sale price/);
    expect(pnl.copy).toMatch(/2 recorded sales have no cost basis/);
    expect(pnl.realizedUsd).toBeCloseTo(20 - 0.8 - 4, 5);
  });

  it('counts only cards that have no sale price', () => {
    const pnl = showPnl({
      notes: [
        note({ id: 'a', player: 'A' }),
        note({ id: 'b', player: 'B' }),
      ],
      inventory: [
        card({ id: floorBuyId('a'), player: 'A', status: 'sold', salePrice: undefined }),
        card({ id: floorBuyId('b'), player: 'B', status: 'sold', salePrice: undefined }),
      ],
    });
    expect(pnl.copy).toMatch(/No recorded sale/);
    expect(pnl.copy).toMatch(/Sold inventory: 2 cards have no sale price \(A, B\)/);
    expect(pnl.copy).toMatch(/Unsold inventory: none/);
  });

  it('uses the book price when the marker is present and the note price differs', () => {
    const pnl = showPnl({
      notes: [note({ id: 's', result: 'sold', offerUsd: 10, player: '', cardId: 'held' })],
      inventory: [card({
        id: 'held',
        player: 'Book',
        status: 'sold',
        purchasePrice: 100,
        salePrice: 50,
        notes: exitMarker('s'),
      })],
    });
    expect(pnl.sold[0]).toMatchObject({ player: 'Book', takenUsd: 50, feeUsd: 2, realizedUsd: -52 });
    expect(pnl.copy).toMatch(/No demo buy on this show/);
    expect(pnl.copy).toMatch(/realized -\$52/);
    expect(pnlRowCopy({ ...pnl.sold[0], paidUsd: null, feeUsd: null })).toMatch(/no sale price/);
  });

  it('follows a floor buy into the book and a floor sale onto the fee', () => {
    const buyId = collectionDraftId('nyc', 'floor-buy');
    const pnl = showPnl({
      showId: 'nyc',
      notes: [],
      decisions: [
        decision({ opportunityId: 'floor-buy', showId: '  ', player: 'Walk Up' }),
        decision({ opportunityId: 'floor-buy', showId: '', player: 'Walk Up' }),
        decision({
          opportunityId: 'floor-sell',
          call: 'sell',
          player: '  Walk   Sale ',
          cardId: 'sale',
          tablePriceUsd: 80,
        }),
        decision({ opportunityId: 'no-card', call: 'sell', cardId: null, tablePriceUsd: 10 }),
        decision({ opportunityId: 'zero-sell', call: 'sell', cardId: 'sale', tablePriceUsd: 0 }),
        decision({ opportunityId: 'park', call: 'sell', cardId: 'parked', tablePriceUsd: 12, player: 'Parked' }),
        decision({ opportunityId: 'open-sell', call: 'sell', cardId: 'open', tablePriceUsd: 12, player: 'Open' }),
      ],
      inventory: [
        card({ id: buyId, player: 'Walk Up', status: 'active', purchasePrice: 18 }),
        card({
          id: 'sale',
          player: 'Walk Sale',
          status: 'sold',
          purchasePrice: 40,
          salePrice: 80,
          notes: `Show recap 2026-10-30: sold at $80. ${floorSaleMarker('nyc', 'floor-sell')}`,
        }),
        card({ id: 'parked', player: 'Parked', status: 'consignment' }),
        card({ id: 'open', player: 'Open', status: 'active' }),
      ],
    });
    expect(pnl.unsold.map((row) => row.id)).toEqual([buyId]);
    expect(pnl.sold[0]).toMatchObject({ takenUsd: 80, feeUsd: 3.2, realizedUsd: 36.8 });
    expect(pnl.consigned).toBe(1);
    expect(pnl.unrecorded).toBe(1);
    expect(pnl.copy).toMatch(/1 sale is still held and 1 is on consignment/);
  });

  it('keeps the first floor buy when the same id is repeated', () => {
    const pnl = showPnl({
      notes: [],
      decisions: [
        decision({ opportunityId: 'same', showId: 'nyc', player: 'Same', tablePriceUsd: 11 }),
        decision({ opportunityId: 'same', showId: 'nyc', player: 'Same', tablePriceUsd: 99 }),
      ],
      inventory: [],
    });
    expect(pnl.unsold).toEqual([expect.objectContaining({ id: collectionDraftId('nyc', 'same'), paidUsd: 11 })]);
  });

  it('puts an undated buy on the show and leaves it off the week', () => {
    const quiet = showPnl({ notes: [], inventory: [] });
    expect(quiet.copy).toMatch(/No demo buy or recorded sale is on this profit and loss/);
    expect(pnlCopy(quiet, 'week')).toMatch(/No dated show buy or recorded sale this week/);
    const pnl = showPnl({
      notes: [note({ id: 'undated', savedAt: undefined, player: 'Undated' })],
      inventory: [],
    });
    expect(pnl.unsold).toHaveLength(1);
    const week = weekPnl({
      notes: [
        note({ id: 'undated', savedAt: undefined, player: 'Undated' }),
        note({ id: 'old', savedAt: new Date(NOW - WEEK - 1000).toISOString(), player: 'Old' }),
        note({ id: 'future', savedAt: new Date(NOW + 60_000).toISOString(), player: 'Future' }),
        note({ id: 'bad', savedAt: 'not-a-date', player: 'Bad' }),
        note({ id: 'week', savedAt: new Date(NOW - 1000).toISOString(), player: 'This Week', offerUsd: 15 }),
      ],
      decisions: [
        decision({ opportunityId: 'old-floor', decidedAt: undefined, player: 'Old Floor' }),
        decision({ opportunityId: 'week-floor', decidedAt: new Date(NOW - 1000).toISOString(), player: 'Week Floor' }),
      ],
      inventory: [],
      now: NOW,
    });
    expect(week.pnl.unsold.map((row) => row.player)).toEqual(['This Week', 'Week Floor']);
    expect(week.copy).toMatch(/Show profit and loss this week: Bought 2 cards/);
    expect(week.copy).toMatch(/Not a settlement and not a live tape/);
    expect(weekPnl({ notes: [], inventory: [], now: NOW }).copy).toMatch(/off the week/);
  });

  it('says when the only movement is a sale that is still held', () => {
    const week = weekPnl({
      notes: [note({ id: 's', result: 'sold', offerUsd: 20, player: 'Wait', cardId: 'wait', savedAt: new Date(NOW).toISOString() })],
      inventory: [card({ id: 'wait', status: 'active' })],
      now: NOW,
    });
    expect(week.copy).toMatch(/No demo buy this week/);
    expect(week.copy).toMatch(/1 sale is still held/);
    expect(week.copy).toMatch(/Sold inventory: none/);
    const many = showPnl({
      notes: [
        note({ id: 'c1', player: 'C1' }),
        note({ id: 'c2', player: 'C2' }),
      ],
      inventory: [
        card({ id: floorBuyId('c1'), status: 'consignment', player: 'C1' }),
        card({ id: floorBuyId('c2'), status: 'consignment', player: 'C2' }),
      ],
      decisions: [
        decision({ opportunityId: 'p1', call: 'sell', cardId: 'p1', tablePriceUsd: 5, player: 'P1' }),
        decision({ opportunityId: 'p2', call: 'sell', cardId: 'p2', tablePriceUsd: 5, player: 'P2' }),
      ],
    });
    expect(many.copy).toMatch(/2 are on consignment/);
    expect(many.unrecorded).toBe(2);
    expect(many.copy).toMatch(/2 sales are still held and 2 are on consignment/);
  });

  it('counts three aside clauses and a buy with no show id', () => {
    const pnl = showPnl({
      notes: [
        note({ id: 'held-sale', result: 'sold', cardId: 'missing', player: 'Missing', offerUsd: 8 }),
        note({ id: 'other-sale', result: 'sold', cardId: 'other', player: 'Other', offerUsd: 8 }),
        note({ id: 'park', result: 'sold', cardId: 'park', player: 'Park', offerUsd: 8 }),
      ],
      decisions: [decision({ opportunityId: '', showId: '', player: 'Loose', tablePriceUsd: 9 })],
      inventory: [
        card({ id: 'other', status: 'sold', salePrice: 8, notes: 'elsewhere', player: 'Other' }),
        card({ id: 'park', status: 'consignment', player: 'Park' }),
      ],
    });
    expect(pnl.unsold.map((row) => row.player)).toEqual(['Loose']);
    expect(pnl.copy).toMatch(/1 sale is still held, 1 is not the sale recorded, and 1 is on consignment/);
    const extra = showPnl({
      notes: [1, 2, 3].map((index) => note({
        id: `o${index}`,
        result: 'sold',
        cardId: `o${index}`,
        player: `O${index}`,
        offerUsd: 5,
      })),
      inventory: [1, 2, 3].map((index) => card({
        id: `o${index}`,
        player: `O${index}`,
        status: 'sold',
        salePrice: 5,
        notes: 'not this note',
      })),
    });
    expect(extra.copy).toMatch(/3 are not the sale recorded/);
  });

  it('breaks name ties, ignores a blank floor price, and defaults the week clock', () => {
    const pnl = showPnl({
      notes: [
        note({ id: 'tie-b', player: 'Tie', offerUsd: 4 }),
        note({ id: 'tie-a', player: 'Tie', offerUsd: 6 }),
        note({ id: 'twin-b', result: 'sold', player: 'Twin', cardId: 'twin-b', offerUsd: 12 }),
        note({ id: 'twin-a', result: 'sold', player: 'Twin', cardId: 'twin-a', offerUsd: 12 }),
      ],
      decisions: [
        decision({ opportunityId: 'free', call: 'sell', cardId: 'free', tablePriceUsd: null, player: 'Free' }),
        decision({ opportunityId: 'blank-note', call: 'sell', cardId: 'blank-note', tablePriceUsd: 15, player: 'Blank' }),
      ],
      inventory: [
        card({ id: 'twin-a', player: 'Twin', status: 'sold', purchasePrice: 4, salePrice: 12, notes: exitMarker('twin-a') }),
        card({ id: 'twin-b', player: 'Twin', status: 'sold', purchasePrice: 4, salePrice: 12, notes: exitMarker('twin-b') }),
        card({ id: 'blank-note', player: 'Blank', status: 'sold', purchasePrice: 5, salePrice: 15 }),
      ],
    });
    expect(pnl.unsold.map((row) => row.id)).toEqual([floorBuyId('tie-a'), floorBuyId('tie-b')]);
    expect(pnl.sold.map((row) => row.id)).toEqual(['twin-a', 'twin-b']);
    expect(pnl.unrecorded).toBe(1);
    expect(pnlRowCopy({ id: 'x', side: 'unsold', player: 'X', paidUsd: null, costUsd: null, takenUsd: null, feeUsd: null, realizedUsd: null })).toMatch(/paid \$0/);
    const live = weekPnl({
      notes: [note({ id: 'live', player: 'Live', savedAt: new Date().toISOString(), offerUsd: 3 })],
      inventory: [],
    });
    expect(live.copy).toMatch(/Show profit and loss this week: Bought 1 card for \$3/);
  });

  it('keeps a recorded sale when a newer note for the same card is unmatched', () => {
    const pnl = showPnl({
      notes: [
        note({ id: 'newer', result: 'sold', offerUsd: 70, player: 'Judge', cardId: 'judge' }),
        note({ id: 'older', result: 'sold', offerUsd: 80, player: 'Judge', cardId: 'judge' }),
      ],
      inventory: [card({
        id: 'judge',
        player: 'Aaron Judge',
        status: 'sold',
        purchasePrice: 40,
        salePrice: 80,
        notes: `${exitMarker('older')} sold.`,
      })],
    });
    expect(pnl.sold).toHaveLength(1);
    expect(pnl.sold[0]).toMatchObject({ takenUsd: 80, feeUsd: 3.2, realizedUsd: 36.8 });
    expect(pnl.unrecorded).toBe(0);
    expect(pnl.otherSale).toBe(0);
  });

  it('ages a filed buy from the book and a recorded sale from both dates', () => {
    const booked = floorBuyId('booked');
    const pnl = showPnl({
      now: NOW,
      notes: [
        note({ id: 'fresh', player: 'Fresh', savedAt: '2026-10-30T00:00:00.000Z', offerUsd: 10 }),
        note({ id: 'booked', player: 'Booked', savedAt: '2026-10-30T00:00:00.000Z', offerUsd: 12 }),
        note({ id: 'bad-book', player: 'Fallback', savedAt: '2026-10-30T00:00:00.000Z', offerUsd: 8 }),
        note({ id: 'bare', player: 'Bare', savedAt: undefined, offerUsd: 9 }),
        note({ id: 'sold-short', result: 'sold', player: 'Short', cardId: 'short', offerUsd: 20 }),
        note({ id: 'sold-long', result: 'sold', player: 'Long', cardId: 'long', offerUsd: 30 }),
        note({ id: 'sold-flip', result: 'sold', player: 'Flip', cardId: 'flip', offerUsd: 20 }),
        note({ id: 'sold-nodate', result: 'sold', player: 'No Date', cardId: 'nodate', offerUsd: 15, savedAt: '2026-10-30T00:00:00.000Z' }),
      ],
      showId: 'nyc',
      decisions: [
        decision({
          opportunityId: 'near',
          player: 'Near',
          tablePriceUsd: 7,
          decidedAt: new Date(NOW - 330 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        decision({
          opportunityId: 'park-floor',
          showId: 'nyc',
          player: 'Park Floor',
          call: 'buy',
          tablePriceUsd: 4,
        }),
      ],
      inventory: [
        card({ id: booked, player: 'Booked', purchaseDate: '2024-01-01', purchasePrice: 12 }),
        card({ id: floorBuyId('bad-book'), player: 'Fallback', purchaseDate: 'not-a-date', purchasePrice: 8 }),
        card({
          id: 'short',
          player: 'Short',
          status: 'sold',
          purchasePrice: 10,
          salePrice: 20,
          purchaseDate: '2026-10-01',
          saleDate: '2026-10-20',
          notes: exitMarker('sold-short'),
        }),
        card({
          id: 'long',
          player: 'Long',
          status: 'sold',
          purchasePrice: 10,
          salePrice: 30,
          purchaseDate: '2024-01-01',
          saleDate: '2026-10-30',
          notes: exitMarker('sold-long'),
        }),
        card({
          id: 'flip',
          player: 'Flip',
          status: 'sold',
          purchasePrice: 10,
          salePrice: 20,
          purchaseDate: '2026-10-30',
          saleDate: '2026-01-01',
          notes: exitMarker('sold-flip'),
        }),
        card({
          id: 'nodate',
          player: 'No Date',
          status: 'sold',
          purchasePrice: 10,
          salePrice: 15,
          notes: exitMarker('sold-nodate'),
        }),
        card({
          id: collectionDraftId('nyc', 'park-floor'),
          player: 'Park Floor',
          status: 'consignment',
        }),
      ],
    });
    const fresh = pnl.unsold.find((item) => item.player === 'Fresh');
    const bookedRow = pnl.unsold.find((item) => item.player === 'Booked');
    const fallback = pnl.unsold.find((item) => item.player === 'Fallback');
    const bare = pnl.unsold.find((item) => item.player === 'Bare');
    const near = pnl.unsold.find((item) => item.player === 'Near');
    expect(fresh).toMatchObject({ treatment: 'short-term', acquiredAt: '2026-10-30' });
    expect(bookedRow).toMatchObject({ treatment: 'long-term', acquiredAt: '2024-01-01' });
    expect(fallback).toMatchObject({ treatment: 'short-term', acquiredAt: '2026-10-30' });
    expect(bare).toMatchObject({ treatment: null, acquiredAt: null });
    expect(near?.treatment).toBe('short-term');
    expect(near?.daysToLongTerm).toBeLessThanOrEqual(45);
    expect(pnl.sold.find((item) => item.player === 'Short')).toMatchObject({
      treatment: 'short-term',
      daysHeld: 19,
      soldAt: '2026-10-20',
    });
    expect(pnl.sold.find((item) => item.player === 'Long')?.treatment).toBe('long-term');
    expect(pnl.sold.find((item) => item.player === 'Flip')?.treatment).toBeNull();
    expect(pnl.sold.find((item) => item.player === 'No Date')).toMatchObject({ treatment: null, soldAt: null });
    expect(pnl.copy).toMatch(/Inventory age:/);
    expect(pnl.copy).toMatch(/inside 45 days of long-term/);
    expect(pnl.copy).toMatch(/long-term/);
    expect(pnl.copy).toMatch(/unsold card has no date/);
    expect(pnl.copy).toMatch(/Recorded holding:/);
    expect(pnl.copy).toMatch(/no holding dates/);
    expect(pnlRowCopy(fresh as PnlRow)).toMatch(/unsold · held/);
    expect(pnlRowCopy(pnl.sold.find((item) => item.player === 'Long') as PnlRow)).toMatch(/long-term/);
    expect(pnlRowCopy(pnl.sold.find((item) => item.player === 'Short') as PnlRow)).toMatch(/short-term/);
    expect(pnl.consigned).toBe(1);
    expect(pnl.unsold.map((item) => item.player)).not.toContain('Park Floor');
  });

  it('does not give one floor sale to a second show', () => {
    const book = [card({
      id: 'sale',
      player: 'Walk Sale',
      status: 'sold',
      purchasePrice: 40,
      salePrice: 80,
      notes: `Show recap 2026-10-30: sold at $80. ${floorSaleMarker('nyc', 'floor-sell')}`,
    })];
    const recorded = showPnl({
      showId: 'nyc',
      notes: [],
      decisions: [decision({
        opportunityId: 'floor-sell',
        showId: 'nyc',
        call: 'sell',
        player: 'Walk Sale',
        cardId: 'sale',
        tablePriceUsd: 80,
      })],
      inventory: book,
    });
    const otherShow = showPnl({
      showId: 'bos',
      notes: [],
      decisions: [decision({
        opportunityId: 'other-sell',
        showId: 'bos',
        call: 'sell',
        player: 'Walk Sale',
        cardId: 'sale',
        tablePriceUsd: 80,
      })],
      inventory: book,
    });
    const generic = showPnl({
      showId: 'nyc',
      notes: [],
      decisions: [decision({
        opportunityId: 'floor-sell',
        showId: 'nyc',
        call: 'sell',
        player: 'Walk Sale',
        cardId: 'sale',
        tablePriceUsd: 80,
      })],
      inventory: [card({
        id: 'sale',
        player: 'Walk Sale',
        status: 'sold',
        purchasePrice: 40,
        salePrice: 80,
        notes: 'Show recap 2026-10-30: sold at $80.',
      })],
    });
    expect(recorded.sold).toHaveLength(1);
    expect(recorded.sold[0]).toMatchObject({ takenUsd: 80, feeUsd: 3.2 });
    expect(otherShow.sold).toHaveLength(0);
    expect(otherShow.unrecorded).toBe(1);
    expect(generic.sold).toHaveLength(0);
    expect(generic.unrecorded).toBe(1);
  });
});
