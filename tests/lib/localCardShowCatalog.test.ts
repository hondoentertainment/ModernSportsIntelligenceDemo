import { describe, expect, it } from 'vitest';
import {
  LOCAL_CARD_SHOW_CATALOG,
  LOCAL_CARD_SHOW_SOURCE,
  distanceMiles,
  listResolvedLocalCardShows,
  resolveLocalCardShow,
} from '../../lib/shows/localCardShowCatalog';

describe('localCardShowCatalog', () => {
  it('lists unique seeded shows with venues, cities, and dates', () => {
    const ids = LOCAL_CARD_SHOW_CATALOG.map((show) => show.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(LOCAL_CARD_SHOW_CATALOG.length).toBeGreaterThanOrEqual(12);
    for (const show of LOCAL_CARD_SHOW_CATALOG) {
      expect(show.venue.length).toBeGreaterThan(0);
      expect(show.city.length).toBeGreaterThan(0);
      expect(show.state.length).toBe(2);
      expect(show.month).toBeGreaterThanOrEqual(1);
      expect(show.day).toBeGreaterThanOrEqual(1);
    }
  });

  it('rolls a finished show to next year and keeps a future date this year', () => {
    const now = new Date(Date.UTC(2026, 9, 12));
    const national = LOCAL_CARD_SHOW_CATALOG.find((show) => show.id === 'nscc-atlantic-city');
    const nyc = LOCAL_CARD_SHOW_CATALOG.find((show) => show.id === 'nyc-monthly');
    expect(national && nyc).toBeTruthy();
    const rolled = resolveLocalCardShow(national!, now);
    const upcoming = resolveLocalCardShow(nyc!, now);
    expect(rolled.startDate).toBe('2027-07-22');
    expect(rolled.status).toBe('upcoming');
    expect(rolled.source).toBe(LOCAL_CARD_SHOW_SOURCE);
    expect(upcoming.startDate).toBe('2026-10-18');
    expect(upcoming.daysUntilStart).toBe(6);
    expect(upcoming.endDate).toBe('2026-10-18');
  });

  it('marks a show in progress on its open day', () => {
    const nyc = LOCAL_CARD_SHOW_CATALOG.find((show) => show.id === 'nyc-monthly')!;
    const resolved = resolveLocalCardShow(nyc, new Date(Date.UTC(2026, 9, 18, 18)));
    expect(resolved.status).toBe('in-progress');
    expect(resolved.daysUntilStart).toBe(0);
  });

  it('sorts the calendar by days until open', () => {
    const rows = listResolvedLocalCardShows(new Date(Date.UTC(2026, 9, 12)));
    const days = rows.map((row) => row.daysUntilStart);
    expect(days).toEqual([...days].sort((a, b) => a - b));
    expect(rows[0].id).toBe('nyc-monthly');
  });

  it('measures nearby vs cross-country distance', () => {
    const nyc = { lat: 40.7571, lng: -74.0023 };
    const near = distanceMiles(nyc, { lat: 40.75, lng: -73.99 });
    const dallas = distanceMiles(nyc, { lat: 32.774, lng: -96.801 });
    expect(near).toBeLessThan(5);
    expect(dallas).toBeGreaterThan(1000);
  });
});
