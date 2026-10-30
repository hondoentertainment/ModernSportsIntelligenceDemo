import { describe, expect, it } from 'vitest';
import type { Sport } from '../../types';
import { makeCard } from '../helpers';
import {
  askCallCopy,
  askVersusMedian,
  floorWeek,
  gapHunts,
  holeAlreadyWatched,
  holeClaimed,
  holeTarget,
  pullCopy,
} from '../../lib/collector/floorPack';
import type { DemoChecklist } from '../../lib/collection/portfolioSetGaps';

const SHOW = { sports: ['Baseball', 'Basketball'] as Sport[], focusPlayers: ['Juan Soto'] };

function list(cards: DemoChecklist['cards']): DemoChecklist[] {
  return [{
    id: 'mini',
    year: 2024,
    manufacturer: 'Topps',
    set: 'Series 1',
    sport: 'Baseball',
    cards,
  }];
}

describe('floor pack', () => {
  it('hunts started-set holes the show covers and skips a claimed card', () => {
    const inventory = [
      makeCard({ year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '1', player: 'Aaron Judge' }),
    ];
    const hunts = gapHunts({ show: SHOW, inventory });
    expect(hunts.map((hole) => hole.player)).toEqual(['Juan Soto', 'Pete Alonso', 'Paul Skenes']);
    expect(hunts[0]).toMatchObject({ focused: true, estimateUsd: 4, setLabel: '2024 Topps Series 1' });
    expect(hunts[1].focused).toBe(false);

    const claimed = gapHunts({
      show: SHOW,
      inventory,
      claimed: [{ player: 'Juan Soto', detail: '2024 Topps Series 1 #15' }],
    });
    expect(claimed.map((hole) => hole.player)).toEqual(['Pete Alonso', 'Paul Skenes']);
    expect(gapHunts({ show: { sports: ['Football'] }, inventory })).toEqual([]);
    expect(gapHunts({ show: SHOW, inventory, limit: 1 })).toHaveLength(1);
    expect(gapHunts({ show: SHOW, inventory, limit: 0 })).toEqual([]);
    expect(gapHunts({
      show: { sports: ['Baseball'] },
      inventory: [makeCard({ year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '1', player: 'Aaron Judge' })],
      checklists: list([
        { number: '1', player: 'Aaron Judge', estimateUsd: 4 },
        { number: '10', player: 'Same', estimateUsd: 5 },
        { number: '2', player: 'Same', estimateUsd: 5 },
      ]),
    }).map((hole) => hole.number)).toEqual(['10', '2']);
  });

  it('does not treat a set name as a card number', () => {
    expect(holeClaimed(
      { player: 'Aaron Judge', detail: '2024 Topps Series 1' },
      { player: 'Pete Alonso', number: '1', setLabel: '2024 Topps Series 1' },
    )).toBe(false);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: '2024 Topps Series 1' },
      { player: 'Juan Soto', number: '15', setLabel: '2024 Topps Series 1' },
    )).toBe(true);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: 'other #15' },
      { player: 'Juan Soto', number: '15', setLabel: '' },
    )).toBe(true);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: 'other' },
      { player: 'juan soto', number: '1+', setLabel: '' },
    )).toBe(false);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: 'card #1+' },
      { player: 'Juan Soto', number: '1+', setLabel: '' },
    )).toBe(true);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: 'card #150' },
      { player: 'Juan Soto', number: '15', setLabel: '' },
    )).toBe(false);
    expect(holeClaimed(
      { player: 'Juan Soto', detail: 'card #15' },
      { player: 'Juan Soto', number: '   ', setLabel: '' },
    )).toBe(false);
    expect(holeClaimed(
      { detail: '2024 Topps Series 1' },
      { number: '15', setLabel: '2024 Topps Series 1' },
    )).toBe(true);
  });

  it('drafts a watchlist hole and skips one already active', () => {
    const hole = gapHunts({
      show: SHOW,
      inventory: [makeCard({ year: 2024, manufacturer: 'Topps', set: 'Series 1', sport: 'Baseball', cardNumber: '1', player: 'Aaron Judge' })],
    })[0];
    expect(holeTarget(hole)).toMatchObject({
      player: 'Juan Soto',
      cardDescription: '2024 Topps Series 1 #15',
      priority: 'Medium',
      targetPrice: 4,
      league: 'MLB',
      notes: 'Demo checklist hole. Not a live listing.',
    });
    expect(holeTarget({ ...hole, estimateUsd: 25, sport: 'Basketball' }).priority).toBe('High');
    expect(holeTarget({ ...hole, sport: 'Basketball' }).league).toBe('NBA');
    expect(holeTarget({ ...hole, sport: 'Football' }).league).toBe('NFL');
    expect(holeTarget({ ...hole, sport: 'Hockey' }).league).toBe('Other');
    expect(holeTarget({ ...hole, sport: 'Soccer' }).league).toBe('Other');
    const draft = holeTarget(hole);
    expect(holeAlreadyWatched([{ status: 'active', player: draft.player, cardDescription: draft.cardDescription }], hole)).toBe(true);
    expect(holeAlreadyWatched([{ status: 'acquired', player: draft.player, cardDescription: draft.cardDescription }], hole)).toBe(false);
    expect(holeAlreadyWatched([{ player: 'Someone', cardDescription: 'else' }], hole)).toBe(false);
  });

  it('compares a typed ask with the median inside a 5% band', () => {
    expect(askVersusMedian(Number.NaN, 100).call).toBe('no mark');
    expect(askVersusMedian(-1, 100).call).toBe('no mark');
    expect(askVersusMedian(90, null).call).toBe('no mark');
    expect(askVersusMedian(90, 0).call).toBe('no mark');
    expect(askVersusMedian(90, Number.NaN).call).toBe('no mark');
    expect(askVersusMedian(95, 100)).toEqual({ call: 'at', gapPct: -5 });
    expect(askVersusMedian(105, 100)).toEqual({ call: 'at', gapPct: 5 });
    expect(askVersusMedian(80, 100).call).toBe('under');
    expect(askVersusMedian(120, 100)).toEqual({ call: 'over', gapPct: 20 });
    expect(askCallCopy({ call: 'no mark', gapPct: null, basis: 'none', medianUsd: null })).toMatch(/no median/i);
    expect(askCallCopy({ call: 'at', gapPct: 0, basis: 'none', medianUsd: 10 })).toMatch(/no median/i);
    expect(askCallCopy({ call: 'at', gapPct: 0, basis: 'comps', medianUsd: null })).toMatch(/no median/i);
    expect(askCallCopy({ call: 'at', gapPct: 1, basis: 'comps', medianUsd: 20 })).toMatch(/sold comps/);
    expect(askCallCopy({ call: 'at', gapPct: 1, basis: 'demo', medianUsd: 20 })).toMatch(/demo sales/);
    expect(askCallCopy({ call: 'under', gapPct: -12.5, basis: 'demo', medianUsd: 40 })).toMatch(/under the demo sales median \(\$40\) by 12.5%/);
    expect(askCallCopy({ call: 'over', gapPct: null, basis: 'comps', medianUsd: 10 })).toMatch(/by 0%/);
    expect(askCallCopy({ call: 'under', gapPct: -12.5, basis: 'comps', medianUsd: 40 })).toMatch(/not a live tape/i);
  });

  it('names a saved place and counts dated floor notes from this week', () => {
    expect(pullCopy('binder')).toBe('Pull from Binder');
    expect(pullCopy('box')).toBe('Pull from Box');
    expect(pullCopy('slab')).toBe('Pull from Slab case');
    expect(pullCopy(undefined)).toBe('No saved place');
    expect(pullCopy('vault')).toBe('No saved place');

    const now = Date.parse('2026-10-15T12:00:00Z');
    const week = floorWeek([
      { result: 'bought', askUsd: 10, offerUsd: 8, savedAt: '2026-10-14T00:00:00Z' },
      { result: 'bought', askUsd: 5, offerUsd: 0, savedAt: '2026-10-15T00:00:00Z' },
      { result: 'bought', askUsd: 0, offerUsd: 0, savedAt: '2026-10-15T00:00:00Z' },
      { result: 'bought', askUsd: 4, offerUsd: -1, savedAt: '2026-10-15T00:00:00Z' },
      { result: 'passed', askUsd: 20, offerUsd: 15, savedAt: '2026-10-09T12:00:00Z' },
      { result: 'open', askUsd: 1, offerUsd: 1, savedAt: '2026-10-10T12:00:00Z' },
      { result: 'open', askUsd: 1, offerUsd: 1, savedAt: '2026-10-08T11:59:59Z' },
      { result: 'bought', askUsd: 99, offerUsd: 99, savedAt: '2026-10-16T00:00:00Z' },
      { result: 'bought', askUsd: 99, offerUsd: 99 },
      { result: 'later', askUsd: 9, offerUsd: 9, savedAt: 'not-a-date' },
      { result: 'later', askUsd: 9, offerUsd: 9, savedAt: '2026-10-14T00:00:00Z' },
    ], now);
    expect(week).toEqual({ bought: 4, passed: 1, open: 1, sold: 0, typedSpendUsd: 17 });
    expect(floorWeek([
      { result: 'sold', askUsd: 50, offerUsd: 40, savedAt: '2026-10-14T00:00:00Z' },
      { result: 'sold', askUsd: 50, offerUsd: 40, savedAt: '2026-10-01T00:00:00Z' },
    ], now)).toEqual({ bought: 0, passed: 0, open: 0, sold: 1, typedSpendUsd: 0 });
    expect(floorWeek([], now)).toEqual({ bought: 0, passed: 0, open: 0, sold: 0, typedSpendUsd: 0 });
  });
});
