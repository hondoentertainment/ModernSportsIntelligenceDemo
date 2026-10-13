import { beforeEach, describe, expect, it } from 'vitest';
import type { ShowBuyOpportunity } from '../../lib/shows/showBuyingDesk';
import { store } from '../../lib/dal/syncStore';
import {
  SHOW_TRIP_CASH_KEY,
  SHOW_TRIP_DECISIONS_KEY,
  SHOW_TRIP_LOOP_DISCLOSURE,
  TRAVEL_ESTIMATE_NOTE,
  allowedCalls,
  assessBudget,
  buildCollectionDraft,
  buildSalePatch,
  buildShowRecap,
  buildTripBudget,
  clearFloorDecision,
  collectionDraftId,
  estimateTravel,
  formatTripUsd,
  leagueForSport,
  normalizeFloorDecision,
  parseCashInput,
  readCashBudget,
  readFloorDecisions,
  roundUsd,
  saveCashBudget,
  saveFloorDecision,
  suggestedTablePrice,
  toTripLine,
  versusMark,
  yearFromText,
  type FloorDecision,
  type TripLineItem,
} from '../../lib/shows/showTripLoop';
import { makeCard } from '../helpers';
import type { TargetWatchlist } from '../../types';

function line(overrides: Partial<TripLineItem> = {}): TripLineItem {
  return {
    id: 'opp-1',
    player: 'Mike Trout',
    intent: 'buy',
    askUsd: 80,
    markUsd: 100,
    cardId: null,
    sport: 'Baseball',
    year: 2011,
    setName: 'Update',
    costBasisUsd: null,
    detail: '2011 Topps Update',
    ...overrides,
  };
}

function opportunity(overrides: Partial<ShowBuyOpportunity> = {}): ShowBuyOpportunity {
  return {
    id: 'show-1:collection-gap:mike trout',
    showId: 'show-1',
    kind: 'collection-gap',
    action: 'buy-at-show',
    player: 'Mike Trout',
    detail: '2011 Topps Update',
    why: 'gap',
    tapeLabel: 'Local / demo tape',
    consensusMark: 120,
    askPrice: 90,
    discountPct: null,
    cardId: null,
    targetId: null,
    compsHref: null,
    collectionHref: '/collection',
    showBagHref: '/card-show-mode',
    score: 20,
    ...overrides,
  };
}

function target(overrides: Partial<TargetWatchlist> = {}): TargetWatchlist {
  return {
    id: 't1',
    player: 'Mike Trout',
    cardDescription: '2009 Bowman Chrome',
    priority: 'High',
    targetPrice: 400,
    currentMarketPrice: 350,
    sport: 'Baseball',
    league: 'MLB',
    status: 'active',
    createdAt: '2026-01-01',
    ...overrides,
  };
}

describe('showTripLoop money and travel', () => {
  it('rounds, formats, and parses cash', () => {
    expect(roundUsd(Number.NaN)).toBe(0);
    expect(roundUsd(1.235)).toBe(1.24);
    expect(formatTripUsd(10.1)).toBe('$10.10');
    expect(formatTripUsd(-2)).toBe('-$2.00');
    expect(parseCashInput('  ')).toBeNull();
    expect(parseCashInput('$1,250.50')).toBe(1250.5);
    expect(parseCashInput('-1')).toBeNull();
    expect(parseCashInput('nope')).toBeNull();
    expect(parseCashInput('0')).toBe(0);
  });

  it('estimates travel from disclosed distance bands', () => {
    expect(estimateTravel(null)).toEqual({ usd: 0, label: 'Distance unknown — travel left at $0' });
    expect(estimateTravel(Number.NaN).usd).toBe(0);
    expect(estimateTravel(-1).usd).toBe(0);
    expect(estimateTravel(0).usd).toBe(12);
    expect(estimateTravel(30).usd).toBe(12);
    expect(estimateTravel(30.1).usd).toBe(25);
    expect(estimateTravel(50).usd).toBe(25);
    expect(estimateTravel(50.1).usd).toBe(70);
    expect(estimateTravel(200).usd).toBe(70);
    expect(estimateTravel(200.1)).toEqual({
      usd: 220,
      label: 'Beyond 200 mi — weekend travel stub, not a fare',
    });
    expect(TRAVEL_ESTIMATE_NOTE).toMatch(/not a live fare/i);
  });

  it('reads a year and maps a league', () => {
    expect(yearFromText('')).toBeNull();
    expect(yearFromText('pre-war')).toBeNull();
    expect(yearFromText('1899 tobacco')).toBeNull();
    expect(yearFromText('2099 chrome')).toBe(2099);
    expect(leagueForSport('Baseball')).toBe('MLB');
    expect(leagueForSport('Basketball')).toBe('NBA');
    expect(leagueForSport('Football')).toBe('NFL');
    expect(leagueForSport('Hockey')).toBe('Other');
    expect(leagueForSport('Soccer')).toBe('Other');
    expect(leagueForSport(null)).toBe('Other');
  });
});

describe('showTripLoop budget', () => {
  it('reserves priced buys, credits sells, and skips pack rows', () => {
    const budget = buildTripBudget({
      showId: 'nyc',
      admissionUsd: 5,
      distanceMiles: null,
      items: [
        line(),
        line({ id: 'gap', intent: 'buy', askUsd: null, markUsd: null }),
        line({ id: 'sell', intent: 'sell', askUsd: null, markUsd: 40, player: 'Aaron Judge' }),
        line({ id: 'bare-sell', intent: 'sell', askUsd: null, markUsd: null }),
        line({ id: 'bag', intent: 'pack', askUsd: 10, markUsd: 10 }),
      ],
    });
    expect(budget.buyReserveUsd).toBe(80);
    expect(budget.unpricedBuys).toBe(1);
    expect(budget.sellCreditUsd).toBe(40);
    expect(budget.unpricedSells).toBe(1);
    expect(budget.travelUsd).toBe(0);
    expect(budget.netNeedUsd).toBe(45);
    expect(budget.suggestedCashUsd).toBe(50);
    expect(budget.lines.find((row) => row.id === 'buy-reserve')?.note).toMatch(/1 buy call had no ask/);
    expect(budget.lines.find((row) => row.id === 'sell-credit')?.note).toMatch(/1 sell call had no mark/);
    expect(budget.disclosure).toBe(SHOW_TRIP_LOOP_DISCLOSURE);
  });

  it('uses plural notes, floors bad admission, and lets sell credit cover the door', () => {
    const covered = buildTripBudget({
      showId: 'dal',
      admissionUsd: Number.NaN,
      distanceMiles: 10,
      items: [line({ intent: 'sell', askUsd: 5, markUsd: 100 })],
    });
    expect(covered.admissionUsd).toBe(0);
    expect(covered.travelUsd).toBe(12);
    expect(covered.netNeedUsd).toBe(0);
    expect(covered.suggestedCashUsd).toBe(0);
    expect(covered.lines.find((row) => row.id === 'buy-reserve')?.note).toMatch(/Sum of buy-at-show/);
    expect(covered.lines.find((row) => row.id === 'sell-credit')?.note).toMatch(/Not a locked offer/);

    const padded = buildTripBudget({
      showId: 'chi',
      admissionUsd: -4,
      distanceMiles: 40,
      items: [line({ askUsd: 10.01, markUsd: null })],
    });
    expect(padded.admissionUsd).toBe(0);
    expect(padded.netNeedUsd).toBe(35.01);
    expect(padded.suggestedCashUsd).toBe(40);

    const exact = buildTripBudget({
      showId: 'bos',
      admissionUsd: 0,
      distanceMiles: null,
      items: [line({ askUsd: 10, markUsd: 1 })],
    });
    expect(exact.suggestedCashUsd).toBe(10);
    expect(exact.unpricedBuys).toBe(0);
    expect(exact.lines.find((row) => row.id === 'sell-credit')?.note).toMatch(/Local marks/);
  });

  it('pluralizes unpriced notes and assesses fit', () => {
    const budget = buildTripBudget({
      showId: 'phi',
      admissionUsd: 8,
      distanceMiles: null,
      items: [
        line({ id: 'a', askUsd: null, markUsd: null }),
        line({ id: 'b', askUsd: null, markUsd: null }),
        line({ id: 'c', intent: 'sell', askUsd: null, markUsd: null }),
        line({ id: 'd', intent: 'sell', askUsd: null, markUsd: null }),
      ],
    });
    expect(budget.lines.find((row) => row.id === 'buy-reserve')?.note).toMatch(/2 buy calls/);
    expect(budget.lines.find((row) => row.id === 'sell-credit')?.note).toMatch(/2 sell calls/);
    expect(assessBudget(budget.netNeedUsd, 8)).toMatchObject({ fits: true, surplusUsd: 0, shortfallUsd: 0 });
    expect(assessBudget(85, 90)).toMatchObject({ fits: true, surplusUsd: 5, shortfallUsd: 0 });
    expect(assessBudget(85, 40)).toMatchObject({ fits: false, shortfallUsd: 45, surplusUsd: 0 });
    expect(assessBudget(Number.NaN, -5)).toEqual({ cashUsd: 0, fits: true, shortfallUsd: 0, surplusUsd: 0 });
    expect(assessBudget(-10, 0).fits).toBe(true);
  });
});

describe('showTripLoop floor decisions', () => {
  const item = line();

  it('compares a table price with the local mark and limits calls', () => {
    expect(versusMark(null, 10)).toBe('unknown');
    expect(versusMark(10, null)).toBe('unknown');
    expect(versusMark(Number.NaN, 10)).toBe('unknown');
    expect(versusMark(99.6, 100)).toBe('at');
    expect(versusMark(100.4, 100)).toBe('at');
    expect(versusMark(99.5, 100)).toBe('under');
    expect(versusMark(100.5, 100)).toBe('over');
    expect(allowedCalls(item)).toEqual(['buy', 'pass']);
    expect(allowedCalls(line({ cardId: 'c1' }))).toEqual(['buy', 'sell', 'pass']);
    expect(allowedCalls(line({ intent: 'sell', cardId: 'c1' }))).toEqual(['sell', 'pass']);
    expect(allowedCalls(line({ intent: 'pack' }))).toEqual(['buy', 'pass']);
    expect(allowedCalls(line({ intent: 'pack', cardId: 'c1' }))).toEqual(['buy', 'sell', 'pass']);
    expect(suggestedTablePrice(item, 'buy')).toBe(80);
    expect(suggestedTablePrice(line({ askUsd: null, markUsd: 40 }), 'buy')).toBe(40);
    expect(suggestedTablePrice(line({ intent: 'sell', askUsd: 10, markUsd: 40, costBasisUsd: 20 }), 'sell')).toBe(40);
    expect(suggestedTablePrice(line({ askUsd: 10, markUsd: null, costBasisUsd: 20 }), 'sell')).toBe(20);
    expect(suggestedTablePrice(line({ askUsd: 10, markUsd: null, costBasisUsd: null }), 'sell')).toBe(10);
    expect(suggestedTablePrice(line({ askUsd: null, markUsd: null, costBasisUsd: null }), 'sell')).toBeNull();
  });

  it('rejects a bad call and records buy, pass, and sell', () => {
    expect(normalizeFloorDecision({ item, showId: '  ', call: 'buy', tablePriceUsd: 80 })).toBeNull();
    expect(normalizeFloorDecision({
      item: line({ id: '  ' }),
      showId: 'nyc',
      call: 'buy',
      tablePriceUsd: 80,
    })).toBeNull();
    expect(normalizeFloorDecision({ item, showId: 'nyc', call: 'sell', tablePriceUsd: 80 })).toBeNull();
    expect(normalizeFloorDecision({ item, showId: 'nyc', call: 'buy', tablePriceUsd: -1 })).toBeNull();
    expect(normalizeFloorDecision({ item, showId: 'nyc', call: 'buy', tablePriceUsd: null })).toBeNull();

    const pass = normalizeFloorDecision({
      item: line({ player: '  ' }),
      showId: 'nyc',
      call: 'pass',
      tablePriceUsd: 50,
      now: '2026-10-18T15:00:00.000Z',
    });
    expect(pass).toMatchObject({
      player: 'Unknown player',
      call: 'pass',
      tablePriceUsd: null,
      versusMark: 'unknown',
    });

    const buy = normalizeFloorDecision({
      item,
      showId: ' nyc ',
      call: 'buy',
      tablePriceUsd: 70,
      now: '2026-10-18T15:00:00.000Z',
    });
    expect(buy).toMatchObject({ showId: 'nyc', tablePriceUsd: 70, versusMark: 'under' });

    const at = normalizeFloorDecision({
      item: line({ markUsd: 80 }),
      showId: 'nyc',
      call: 'buy',
      tablePriceUsd: 80,
      now: '2026-10-18T15:00:00.000Z',
    });
    expect(at?.versusMark).toBe('at');

    const sell = normalizeFloorDecision({
      item: line({ intent: 'sell', cardId: 'c1', player: '  ' }),
      showId: 'nyc',
      call: 'sell',
      tablePriceUsd: 140,
      now: '2026-10-18T15:00:00.000Z',
    });
    expect(sell).toMatchObject({ call: 'sell', versusMark: 'over', player: 'Unknown player' });

    const stamped = normalizeFloorDecision({ item, showId: 'nyc', call: 'pass', tablePriceUsd: null });
    expect(stamped?.decidedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('showTripLoop persistence', () => {
  beforeEach(() => {
    store.clear();
  });

  it('keeps only finite cash budgets and replaces a floor call', () => {
    expect(readCashBudget('nyc')).toBeNull();
    store.set(SHOW_TRIP_CASH_KEY, ['nope']);
    expect(readCashBudget('nyc')).toBeNull();
    store.set(SHOW_TRIP_CASH_KEY, { nyc: -3, other: 'bad', ok: 12.5 });
    expect(readCashBudget('nyc')).toBeNull();
    expect(readCashBudget('ok')).toBe(12.5);
    expect(saveCashBudget('  ', 10)).toBeNull();
    expect(saveCashBudget('nyc', -1)).toBeNull();
    expect(saveCashBudget('nyc', 40)).toBe(40);
    expect(readCashBudget('nyc')).toBe(40);
    expect(readCashBudget('ok')).toBe(12.5);

    expect(readFloorDecisions()).toEqual([]);
    store.set(SHOW_TRIP_CASH_KEY, null);
    expect(readCashBudget('nyc')).toBeNull();
    store.set(SHOW_TRIP_DECISIONS_KEY, { bad: true });
    expect(readFloorDecisions('nyc')).toEqual([]);

    const buy = normalizeFloorDecision({
      item: line(),
      showId: 'nyc',
      call: 'buy',
      tablePriceUsd: 70,
      now: '2026-10-18T15:00:00.000Z',
    });
    const pass = normalizeFloorDecision({
      item: line({ id: 'opp-2' }),
      showId: 'dal',
      call: 'pass',
      tablePriceUsd: null,
      now: '2026-10-18T15:00:00.000Z',
    });
    expect(buy && pass).toBeTruthy();
    store.set(SHOW_TRIP_DECISIONS_KEY, [
      null,
      'x',
      [],
      { ...buy, opportunityId: 1 },
      { ...buy, opportunityId: '  ' },
      { ...buy, showId: 1 },
      { ...buy, showId: ' ' },
      { ...buy, player: 1 },
      { ...buy, player: ' ' },
      { ...buy, call: 1 },
      { ...buy, call: 'hold' },
      { ...buy, versusMark: 1 },
      { ...buy, versusMark: 'sideways' },
      { ...buy, decidedAt: 1 },
      { ...buy, decidedAt: ' ' },
      { ...buy, call: 'pass', tablePriceUsd: 10 },
      { ...buy, tablePriceUsd: '10' },
      { ...buy, tablePriceUsd: Number.NaN },
      { ...buy, tablePriceUsd: -1 },
      { nope: true },
      buy,
    ]);
    expect(readFloorDecisions('nyc')).toEqual([buy]);
    expect(saveFloorDecision({ ...buy!, call: 'nope' } as FloorDecision)).toBeNull();

    const replacement = { ...buy!, tablePriceUsd: 60, versusMark: 'under' as const };
    expect(saveFloorDecision(replacement)).toEqual(replacement);
    expect(saveFloorDecision(pass!)).toEqual(pass);
    expect(readFloorDecisions('nyc')).toEqual([replacement]);
    clearFloorDecision('missing', 'missing');
    clearFloorDecision('nyc', 'opp-1');
    expect(readFloorDecisions().map((row) => row.opportunityId)).toEqual(['opp-2']);
  });
});

describe('showTripLoop recap and collection', () => {
  const budget = buildTripBudget({
    showId: 'nyc',
    admissionUsd: 5,
    distanceMiles: null,
    items: [line()],
  });

  function decision(overrides: Partial<FloorDecision> = {}): FloorDecision {
    return {
      opportunityId: 'opp-1',
      showId: 'nyc',
      player: 'Mike Trout',
      call: 'buy',
      tablePriceUsd: 80,
      markUsd: 100,
      cardId: null,
      sport: 'Baseball',
      year: 2011,
      setName: 'Update',
      costBasisUsd: null,
      versusMark: 'under',
      decidedAt: '2026-10-18T15:00:00.000Z',
      ...overrides,
    };
  }

  it('sums paper gain, realized gain, and leftover cash', () => {
    const recap = buildShowRecap({
      budget,
      cashUsd: 100,
      decisions: [
        decision(),
        decision({
          opportunityId: 'opp-2',
          call: 'buy',
          tablePriceUsd: 25,
          markUsd: null,
          versusMark: 'unknown',
        }),
        decision({ opportunityId: 'opp-3', call: 'pass', tablePriceUsd: null, versusMark: 'unknown' }),
        decision({
          opportunityId: 'opp-4',
          call: 'sell',
          tablePriceUsd: 50,
          costBasisUsd: 30,
          cardId: 'c1',
          versusMark: 'over',
        }),
        decision({
          opportunityId: 'opp-5',
          call: 'sell',
          tablePriceUsd: 10,
          costBasisUsd: null,
          cardId: 'c2',
          markUsd: 0,
          versusMark: 'over',
        }),
        decision({ opportunityId: 'other', showId: 'dal' }),
      ],
    });
    expect(recap.buyCount).toBe(2);
    expect(recap.passCount).toBe(1);
    expect(recap.sellCount).toBe(2);
    expect(recap.buySpendUsd).toBe(105);
    expect(recap.paperGainUsd).toBe(20);
    expect(recap.markedBuySpendUsd).toBe(80);
    expect(recap.buysMissingMark).toBe(1);
    expect(recap.sellProceedsUsd).toBe(60);
    expect(recap.realizedGainUsd).toBe(20);
    expect(recap.sellsMissingBasis).toBe(1);
    expect(recap.overheadUsd).toBe(5);
    expect(recap.netCashUsd).toBe(50);
    expect(recap.budgetRemainingUsd).toBe(50);
    expect(recap.paperRoiPct).toBe(25);
    expect(recap.disclosure).toMatch(/not a marketplace fill/i);
  });

  it('leaves paper ROI blank when no marked buy was logged', () => {
    const recap = buildShowRecap({
      budget,
      cashUsd: Number.NaN,
      decisions: [decision({ call: 'pass', tablePriceUsd: null, versusMark: 'unknown' })],
    });
    expect(recap.paperRoiPct).toBeNull();
    expect(recap.cashBudgetUsd).toBe(0);
    expect(recap.budgetRemainingUsd).toBe(-5);

    const unpriced = buildShowRecap({
      budget,
      cashUsd: 0,
      decisions: [decision({ call: 'buy', tablePriceUsd: null, markUsd: 10 })],
    });
    expect(unpriced.buySpendUsd).toBe(0);
    expect(unpriced.paperGainUsd).toBe(10);
  });

  it('builds a collection draft and a sale patch only from complete calls', () => {
    expect(buildCollectionDraft({
      decision: decision({ call: 'pass', tablePriceUsd: null }),
      showName: 'NYC',
      purchaseDate: '2026-10-18',
    })).toBeNull();
    expect(buildCollectionDraft({
      decision: decision({ sport: null }),
      showName: 'NYC',
      purchaseDate: '2026-10-18',
    })).toBeNull();

    const draft = buildCollectionDraft({
      decision: decision({ sport: 'Basketball', year: 1899, setName: '  Prizm  ', markUsd: null }),
      showName: '  ',
      purchaseDate: 'not-a-date',
    });
    expect(draft).toMatchObject({
      id: collectionDraftId('nyc', 'opp-1'),
      player: 'Mike Trout',
      year: 2026,
      set: 'Prizm',
      sport: 'Basketball',
      league: 'NBA',
      purchasePrice: 80,
      purchaseDate: '2026-01-01',
      currentValue: undefined,
      status: 'active',
    });
    expect(draft?.notes).toMatch(/Local card show/);
    expect(draft?.notes).toMatch(/Not a marketplace fill/);

    const football = buildCollectionDraft({
      decision: decision({ sport: 'Football', year: 2020, setName: null }),
      showName: 'Dallas Card Show',
      purchaseDate: '2026-11-08',
    });
    expect(football?.league).toBe('NFL');
    expect(football?.set).toBe('Show floor');
    expect(football?.year).toBe(2020);

    const hockey = buildCollectionDraft({
      decision: decision({ sport: 'Hockey', year: 2100 }),
      showName: 'Chicago',
      purchaseDate: '1899-02-01',
    });
    expect(hockey?.league).toBe('Other');
    expect(hockey?.year).toBe(2026);

    const future = buildCollectionDraft({
      decision: decision({ sport: 'Soccer', year: null }),
      showName: 'Future Show',
      purchaseDate: '2100-01-01',
    });
    expect(future?.year).toBe(2026);
    expect(future?.league).toBe('Other');

    expect(buildSalePatch({
      decision: decision(),
      purchaseDate: '2026-10-18',
    })).toBeNull();
    expect(buildSalePatch({
      decision: decision({ call: 'sell', cardId: null }),
      purchaseDate: '2026-10-18',
    })).toBeNull();

    const sale = buildSalePatch({
      decision: decision({ call: 'sell', cardId: 'c1', tablePriceUsd: 50, costBasisUsd: 0 }),
      purchaseDate: 'bad',
      existingNotes: '  ',
    });
    expect(sale).toMatchObject({
      status: 'sold',
      salePrice: 50,
      saleDate: '2026-01-01',
      realizedGainLoss: 50,
    });
    expect(sale?.notes.startsWith('Show recap')).toBe(true);
    expect(sale?.pricingRationale).toMatch(/Not a live marketplace print/);

    const appended = buildSalePatch({
      decision: decision({ call: 'sell', cardId: 'c1', tablePriceUsd: 40, costBasisUsd: null }),
      purchaseDate: '2026-10-18',
      existingNotes: 'Keep the sleeve.',
    });
    expect(appended?.realizedGainLoss).toBeUndefined();
    expect(appended?.notes).toMatch(/^Keep the sleeve\. Show recap 2026-10-18/);
  });
});

describe('toTripLine', () => {
  it('maps buy, sell, and pack calls onto the book', () => {
    const held = makeCard({
      id: 'c1',
      player: 'Aaron Judge',
      year: 2017,
      set: 'Chrome',
      sport: 'Baseball',
      purchasePrice: 30,
      currentValue: 55,
    });
    const sold = makeCard({ id: 'sold', player: 'Mike Trout', status: 'sold' });
    const gap = toTripLine(opportunity(), [sold], [target()], null);
    expect(gap.intent).toBe('buy');
    expect(gap.year).toBe(2011);
    expect(gap.askUsd).toBe(90);
    expect(gap.markUsd).toBe(120);
    expect(gap.cardId).toBeNull();
    expect(gap.sport).toBe('Baseball');

    const byTarget = toTripLine(
      opportunity({ detail: 'no year here', targetId: 't1', consensusMark: null, askPrice: null }),
      [],
      [target()],
      null,
    );
    expect(byTarget.year).toBe(2009);
    expect(byTarget.markUsd).toBe(400);
    expect(byTarget.sport).toBe('Baseball');

    const byPlayer = toTripLine(
      opportunity({
        player: 'Aaron Judge',
        cardId: null,
        targetId: null,
        consensusMark: null,
        askPrice: 10,
        detail: 'judge',
        kind: 'show-bag',
        action: 'pack-show-bag',
      }),
      [held],
      [],
      'Football',
    );
    expect(byPlayer.intent).toBe('pack');
    expect(byPlayer.cardId).toBe('c1');
    expect(byPlayer.year).toBe(2017);
    expect(byPlayer.markUsd).toBe(55);
    expect(byPlayer.costBasisUsd).toBe(30);
    expect(byPlayer.setName).toBe('Chrome');
    expect(byPlayer.sport).toBe('Baseball');

    const missingCard = toTripLine(
      opportunity({
        cardId: 'missing',
        player: ' ',
        kind: 'lot-negotiate',
        action: 'bring-to-negotiate',
        consensusMark: null,
        askPrice: -5,
        detail: '',
        targetId: null,
      }),
      [held],
      [],
      null,
    );
    expect(missingCard.intent).toBe('sell');
    expect(missingCard.player).toBe('Unknown player');
    expect(missingCard.askUsd).toBeNull();
    expect(missingCard.markUsd).toBeNull();
    expect(missingCard.sport).toBeNull();
    expect(missingCard.year).toBeNull();

    const gift = toTripLine(
      opportunity({
        cardId: 'c1',
        player: 'Someone Else',
        kind: 'sell-into-room',
        action: 'bring-to-negotiate',
        consensusMark: null,
        askPrice: null,
      }),
      [makeCard({ id: 'c1', purchasePrice: -1, currentValue: undefined, set: '  ', sport: 'Hockey' })],
      [],
      'Soccer',
    );
    expect(gift.intent).toBe('sell');
    expect(gift.costBasisUsd).toBeNull();
    expect(gift.markUsd).toBeNull();
    expect(gift.setName).toBeNull();
    expect(gift.sport).toBe('Hockey');

    const namedTarget = toTripLine(
      opportunity({ targetId: null, player: 'Shohei Ohtani', consensusMark: null, askPrice: null, detail: '' }),
      [],
      [target({ id: 't2', player: 'Shohei Ohtani', sport: 'Baseball', cardDescription: 'no year', targetPrice: 15 })],
      null,
    );
    expect(namedTarget.markUsd).toBe(15);
    expect(namedTarget.year).toBeNull();
  });
});
