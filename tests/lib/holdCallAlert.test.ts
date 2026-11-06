import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import { floorBuyId } from '../../lib/collector/showClose';
import {
  HOLD_CALL_ALERT_NOTE,
  holdCallAlertCopy,
  holdCallAlertHref,
  holdCallAlerts,
  loadHoldCallAlerts,
} from '../../lib/collector/holdCallAlert';
import { collectionDraftId } from '../../lib/shows/showTripLoop';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';
import { SHOW_TRIP_DECISIONS_KEY } from '../../lib/shows/showTripLoop';
import type { PnlBookCard, PnlDecision, PnlNote } from '../../lib/collector/showPnl';
import { buildCollectorAlertDigest } from '../../lib/alerts/collectorAlertDigest';
import type { HaggleNote } from '../../lib/shows/showHaggleLog';
import type { CardInventory } from '../../types';

const NOW = Date.parse('2026-10-31T12:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;

function note(overrides: Partial<PnlNote> = {}): PnlNote {
  return {
    id: 'n1',
    result: 'bought',
    askUsd: 30,
    offerUsd: 20,
    player: 'Near',
    savedAt: new Date(NOW - 330 * DAY).toISOString(),
    ...overrides,
  };
}

function card(overrides: Partial<PnlBookCard> = {}): PnlBookCard {
  return {
    id: floorBuyId('n1'),
    player: 'Near',
    status: 'active',
    purchasePrice: 20,
    currentValue: 80,
    purchaseDate: new Date(NOW - 330 * DAY).toISOString(),
    ...overrides,
  };
}

describe('hold-call alerts', () => {
  beforeEach(() => {
    store.remove(HAGGLE_KEY);
    store.remove(SHOW_TRIP_DECISIONS_KEY);
    store.remove('cardx_inventory');
  });

  it('keeps the disclosure off a tax determination', () => {
    expect(HOLD_CALL_ALERT_NOTE).toMatch(/not a tax determination and not a live tape/i);
    expect(HOLD_CALL_ALERT_NOTE).toMatch(/missing mark/i);
    expect(HOLD_CALL_ALERT_NOTE).toMatch(/not filed/i);
    expect(HOLD_CALL_ALERT_NOTE).toMatch(/more than 45 days/i);
    expect(holdCallAlertHref('floor:near buy')).toBe('/audit-dossier?cardId=floor%3Anear%20buy');
  });

  it('names the call and the days that still matter', () => {
    expect(holdCallAlertCopy({ player: '  Near  ', call: 'hold', daysToLongTerm: 1 })).toEqual({
      title: 'Near · hold',
      detail: 'Entered the hold window. 1 day to long-term. Still ahead after the ~4% card-show fee. Not a tax determination.',
    });
    expect(holdCallAlertCopy({ player: 'Near', call: 'hold', daysToLongTerm: 25 }).detail).toMatch(/25 days to long-term/);
    expect(holdCallAlertCopy({ player: 'Near', call: 'hold', daysToLongTerm: 0 }).detail).toMatch(/inside 45 days of long-term/);
    expect(holdCallAlertCopy({ player: 'Near', call: 'hold', daysToLongTerm: null }).detail).toMatch(/inside 45 days of long-term/);
    expect(holdCallAlertCopy({ player: '', call: 'clear', daysToLongTerm: 0 })).toEqual({
      title: 'Unsold card · clear',
      detail: 'Crossed into long-term and is clear. Still ahead after the ~4% card-show fee. Not a tax determination.',
    });
    expect(holdCallAlertCopy({ player: 'Cheap', call: 'under', daysToLongTerm: 0 }).detail).toBe(
      'The mark no longer clears the ~4% card-show fee. Not a tax determination.',
    );
    expect(holdCallAlertCopy({ player: 'Cheap', call: 'under', daysToLongTerm: 12 }).detail).toMatch(
      /The mark no longer clears the ~4% card-show fee\. 12 days to long-term\. Not a tax determination\./,
    );
    expect(holdCallAlertCopy({ player: 'Cheap', call: 'under', daysToLongTerm: 1 }).detail).toMatch(/1 day to long-term/);
  });

  it('alerts hold, clear, and under, and leaves the same cards off as the hold call', () => {
    const nearAt = new Date(NOW - 330 * DAY).toISOString();
    const nearId = floorBuyId('near-buy');
    const clearId = floorBuyId('clear-buy');
    const underId = floorBuyId('under-buy');
    const soonId = floorBuyId('soon-buy');
    const farId = floorBuyId('far-buy');
    const bareId = floorBuyId('bare-buy');
    const looseId = floorBuyId('loose');
    const alerts = holdCallAlerts({
      now: NOW,
      notes: [
        note({ id: 'near-buy', player: 'Near', savedAt: nearAt }),
        note({ id: 'soon-buy', player: 'Soon', offerUsd: 15, savedAt: nearAt }),
        note({ id: 'clear-buy', player: 'Booked', offerUsd: 12, savedAt: '2024-06-01T00:00:00.000Z' }),
        note({ id: 'under-buy', player: 'Insured', offerUsd: 50, savedAt: '2024-06-01T00:00:00.000Z' }),
        note({ id: 'short-under', player: 'Fading', offerUsd: 90, savedAt: nearAt }),
        note({ id: 'far-buy', player: 'Far', offerUsd: 10, savedAt: '2026-10-01T00:00:00.000Z' }),
        note({ id: 'bare-buy', player: 'Bare', offerUsd: 8, savedAt: '2024-06-01T00:00:00.000Z' }),
        note({ id: 'loose', player: 'Loose', offerUsd: 9, savedAt: nearAt }),
        note({ id: 'sold-row', result: 'sold', player: 'Short', cardId: 'short', offerUsd: 40 }),
      ],
      inventory: [
        card({ id: nearId, player: 'Near', purchaseDate: nearAt, currentValue: 80 }),
        card({ id: soonId, player: 'Soon', purchasePrice: 15, purchaseDate: new Date(NOW - 350 * DAY).toISOString(), currentValue: 80 }),
        card({ id: clearId, player: 'Booked', purchasePrice: 12, currentValue: 80, purchaseDate: '2024-01-01' }),
        card({ id: underId, player: 'Insured', purchasePrice: 50, insuranceFees: 10, currentValue: 62, purchaseDate: '2024-01-01' }),
        card({ id: floorBuyId('short-under'), player: 'Fading', purchasePrice: 90, currentValue: 40, purchaseDate: nearAt }),
        card({ id: farId, player: 'Far', purchasePrice: 10, currentValue: 100, purchaseDate: '2026-10-01' }),
        card({ id: bareId, player: 'Bare', purchasePrice: 8, purchaseDate: '2024-01-01', currentValue: undefined }),
        card({ id: 'short', player: 'Short', status: 'sold', purchasePrice: 10, salePrice: 40, currentValue: 40 }),
        card({ id: 'box', player: 'Boxed', status: 'consignment', purchasePrice: 10, currentValue: 80, purchaseDate: '2024-01-01' }),
      ],
    });
    expect(alerts.map((row) => row.player)).toEqual(['Soon', 'Near', 'Booked', 'Fading', 'Insured']);
    expect(alerts.map((row) => row.call)).toEqual(['hold', 'hold', 'clear', 'under', 'under']);
    const soon = alerts[0];
    const near = alerts[1];
    expect(soon.daysToLongTerm).toBeLessThan(near.daysToLongTerm ?? 0);
    expect(soon.detail).toContain(`${soon.daysToLongTerm} days to long-term`);
    expect(near.title).toBe('Near · hold');
    expect(near.href).toBe(holdCallAlertHref(nearId));
    expect(alerts[2].detail).toMatch(/Crossed into long-term and is clear/);
    expect(alerts[2].detail).not.toMatch(/days to long-term/);
    expect(alerts.find((row) => row.player === 'Fading')?.detail).toMatch(/days to long-term/);
    expect(alerts.find((row) => row.player === 'Insured')?.detail).not.toMatch(/days to long-term/);
    expect(alerts.some((row) => row.player === 'Far' || row.player === 'Bare' || row.player === 'Loose' || row.player === 'Short')).toBe(false);
    const twins = holdCallAlerts({
      now: NOW,
      notes: [
        note({ id: 'twin-b', player: 'Twin', offerUsd: 40, savedAt: '2024-06-01T00:00:00.000Z' }),
        note({ id: 'twin-a', player: 'Twin', offerUsd: 40, savedAt: '2024-06-01T00:00:00.000Z' }),
      ],
      inventory: [
        card({ id: floorBuyId('twin-b'), player: 'Twin', purchasePrice: 40, currentValue: 10, purchaseDate: '2024-01-01' }),
        card({ id: floorBuyId('twin-a'), player: 'Twin', purchasePrice: 40, currentValue: 10, purchaseDate: '2024-01-01' }),
      ],
    });
    expect(twins.map((row) => row.cardId)).toEqual([floorBuyId('twin-a'), floorBuyId('twin-b')]);
    expect(looseId).toBe('floor:loose');
    expect(holdCallAlerts({ notes: [], inventory: [], now: NOW })).toEqual([]);
    expect(holdCallAlerts({
      notes: [note({ id: 'bad', player: 'Nope' })],
      inventory: [{ id: 1 } as unknown as PnlBookCard, card({ id: 'other', player: 'Other', currentValue: undefined })],
      now: NOW,
    })).toEqual([]);
  });

  it('alerts a filed floor buy and reads the book on this browser', () => {
    const showId = 'nyc';
    const opportunityId = 'opp-hold';
    const cardId = collectionDraftId(showId, opportunityId);
    const boughtAt = new Date(NOW - 340 * DAY).toISOString();
    const decision: PnlDecision = {
      opportunityId,
      showId,
      player: 'Floor',
      call: 'buy',
      tablePriceUsd: 18,
      cardId: null,
      decidedAt: boughtAt,
    };
    const rows = holdCallAlerts({
      notes: [],
      decisions: [decision],
      inventory: [card({ id: cardId, player: 'Floor', purchasePrice: 18, purchaseDate: boughtAt, currentValue: 70 })],
      now: NOW,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ call: 'hold', cardId, player: 'Floor' });

    store.set(HAGGLE_KEY, [note({ id: 'near-buy', player: 'Near', savedAt: boughtAt })]);
    store.set('cardx_inventory', [card({
      id: floorBuyId('near-buy'),
      player: 'Near',
      purchaseDate: boughtAt,
      currentValue: 80,
    })]);
    const loaded = loadHoldCallAlerts(undefined, NOW);
    expect(loaded.map((row) => row.player)).toEqual(['Near']);
    expect(loadHoldCallAlerts(null, NOW)).toEqual([]);
    expect(loadHoldCallAlerts([null, { id: 'x' }], NOW)).toEqual([]);
    expect(loadHoldCallAlerts([
      card({ id: floorBuyId('near-buy'), player: 'Near', purchaseDate: boughtAt, currentValue: undefined }),
    ], NOW)).toEqual([]);

    const haggle = (overrides: Partial<HaggleNote>): HaggleNote => ({
      id: 'near-buy',
      showId: 'nyc',
      dealer: 'Ada',
      table: '1',
      askUsd: 20,
      offerUsd: 20,
      result: 'bought',
      note: '',
      player: 'Near',
      savedAt: boughtAt,
      ...overrides,
    });
    const filed = (overrides: Partial<CardInventory>): CardInventory => ({
      id: floorBuyId('near-buy'),
      player: 'Near',
      year: 2024,
      manufacturer: 'Topps',
      cardNumber: '1',
      set: 'Chrome',
      sport: 'Baseball',
      league: 'MLB',
      isAutographed: false,
      condition: 'Raw',
      isGraded: false,
      purchasePrice: 20,
      purchaseDate: boughtAt,
      currentValue: 80,
      taxBasis: 20,
      status: 'active',
      ...overrides,
    });
    const digest = buildCollectorAlertDigest({
      targets: [],
      shows: [],
      prefs: { enabled: false, home: null, radiusMiles: 25, leadDays: 3 },
      notes: [haggle({ id: 'near-buy', player: 'Near', savedAt: boughtAt })],
      decisions: [decision],
      inventory: [
        filed({ id: floorBuyId('near-buy'), player: 'Near' }),
        filed({ id: cardId, player: 'Floor', purchasePrice: 18, currentValue: 70 }),
      ],
      now: NOW,
    });
    expect(digest.holds.map((row) => row.player)).toEqual(['Floor', 'Near']);
  });
});
