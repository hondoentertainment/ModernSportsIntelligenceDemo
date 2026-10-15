import { beforeEach, describe, expect, it } from 'vitest';
import type { CardInventory } from '../../types';
import { store } from '../../lib/dal/syncStore';
import {
  compsSnapshot,
  dayLeft,
  filterByPlace,
  readChecked,
  placesSnapshot,
  readPlaces,
  setPlace,
  tradeFairness,
  weeklyRecap,
  writeChecked,
} from '../../lib/collector/deskNext';

function card(overrides: Partial<CardInventory> = {}): CardInventory {
  return {
    id: 'judge',
    player: 'Aaron Judge',
    year: 2024,
    manufacturer: 'Topps',
    cardNumber: '1',
    set: 'Series 1',
    sport: 'Baseball',
    league: 'MLB',
    isAutographed: false,
    condition: 'Near Mint',
    isGraded: false,
    purchasePrice: 40,
    purchaseDate: '2024-01-01',
    currentValue: 100,
    status: 'active',
    ...overrides,
  };
}

describe('deskNext', () => {
  beforeEach(() => {
    store.remove('msi_show_day_v1');
    store.remove('msi_card_place_v1');
  });

  it('keeps an offline show-day check and the budget left', () => {
    expect(dayLeft(200, 80)).toBe(120);
    expect(dayLeft(null, 80)).toBeNull();
    expect(writeChecked('nyc', ['buy-1'])).toEqual(['buy-1']);
    expect(readChecked('nyc')).toEqual(['buy-1']);
    expect(readChecked('other')).toEqual([]);
  });

  it('uses last sold comps, otherwise a stable demo spark', () => {
    const demo = compsSnapshot({ id: 'abc', currentValue: 100 });
    expect(demo.source).toBe('demo');
    expect(demo.points).toHaveLength(6);
    expect(demo.median).toBeGreaterThan(0);
    expect(compsSnapshot({ id: 'abc', currentValue: 100 })).toEqual(demo);
    expect(compsSnapshot({
      id: 'abc',
      currentValue: 100,
      salesData: [
        { price: 10, soldAt: '2024-01-01' },
        { price: 30, soldAt: '2024-03-01' },
        { price: 20, soldAt: '2024-02-01' },
      ],
    })).toEqual({ source: 'comps', points: [10, 20, 30], median: 20 });
    expect(compsSnapshot({ id: 'zero', currentValue: 0 }).source).toBe('none');
  });

  it('calls a two-sided trade fair, ahead, or short', () => {
    const give = [{ id: 'a', player: 'A', usd: 100 }];
    const receive = [{ id: 'b', player: 'B', usd: 100 }];
    expect(tradeFairness(give, receive, 0).call).toBe('fair');
    expect(tradeFairness([{ id: 'a', player: 'A', usd: 40 }], receive, 0).call).toBe('you ahead');
    expect(tradeFairness(give, [{ id: 'b', player: 'B', usd: 40 }], 10).call).toBe('you short');
  });

  it('filters binder, box, and slab locations', () => {
    setPlace('a', 'slab');
    setPlace('b', 'box');
    const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(filterByPlace(cards, readPlaces(), 'slab').map((row) => row.id)).toEqual(['a']);
    expect(filterByPlace(cards, readPlaces(), 'all')).toHaveLength(3);
    setPlace('a', '');
    expect(readPlaces().a).toBeUndefined();
    const first = placesSnapshot();
    expect(first).toEqual({ b: 'box' });
    expect(placesSnapshot()).toBe(first);
    setPlace('a', 'binder');
    const next = placesSnapshot();
    expect(next).not.toBe(first);
    expect(next).toEqual({ a: 'binder', b: 'box' });
  });

  it('recaps the demo week, buys, sells, and movers', () => {
    const now = Date.parse('2026-10-14T00:00:00Z');
    const recap = weeklyRecap([
      card({ purchaseDate: '2026-10-12', purchasePrice: 40, currentValue: 100 }),
      card({ id: 'old', player: 'Old', purchaseDate: '2024-01-01', purchasePrice: 50, currentValue: 80 }),
      card({ id: 'sold', player: 'Sold', status: 'sold', saleDate: '2026-10-13', salePrice: 25, purchaseDate: '2020-01-01' }),
    ], now);
    expect(recap.buyCount).toBe(1);
    expect(recap.buyUsd).toBe(40);
    expect(recap.sellCount).toBe(1);
    expect(recap.sellUsd).toBe(25);
    expect(recap.deltaUsd).not.toBe(0);
    expect(recap.movers[0].player).toBe('Aaron Judge');
  });
});
