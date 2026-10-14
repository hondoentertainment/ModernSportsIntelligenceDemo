import { describe, expect, it } from 'vitest';
import { decodeWantShare, encodeWantShare, readActiveWants, wantItemsFromTargets, wantShareHref } from '../../lib/watchlist/wantShare';
import { store } from '../../lib/dal/syncStore';

describe('wantShare', () => {
  it('round-trips a read-only list and skips inactive rows', () => {
    const items = wantItemsFromTargets([
      { player: 'José Ramírez', cardDescription: '2024 Prizm', targetPrice: 40.4, status: 'active' },
      { player: 'Sold', cardDescription: '2020 Topps', targetPrice: 10, status: 'acquired' },
    ]);
    expect(items).toEqual([{ player: 'José Ramírez 2024 Prizm', year: 2024, maxUsd: 40 }]);
    const token = encodeWantShare(items);
    expect(decodeWantShare(token)).toEqual(items);
    expect(wantShareHref('https://msi.example/#/alerts', token)).toBe(`https://msi.example/#/alerts?want=${encodeURIComponent(token)}`);
    expect(decodeWantShare('not a token')).toBeNull();
    expect(decodeWantShare('')).toBeNull();
  });

  it('reads active targets from the book', () => {
    store.set('cardx_targets', [{ player: 'Jayson Tatum', cardDescription: '2024 Prizm', targetPrice: 200, status: 'active' }]);
    expect(readActiveWants()).toEqual([{ player: 'Jayson Tatum 2024 Prizm', year: 2024, maxUsd: 200 }]);
  });
});
