import { describe, expect, it } from 'vitest';
import {
  MLB_WIRE_ARMED_DISCLOSURE,
  MLB_WIRE_SEEDED_DISCLOSURE,
  mlbWireStatus,
  resolveMlbCatalysts,
  resolveMlbCatalystsSync,
  resolveMlbPvpSync,
} from '../../lib/integrations/mlbLiveWire';
import { makeCard } from '../helpers';
import type { FeatureFlags } from '../../lib/featureFlags';

const OFF: FeatureFlags = {
  USE_REAL_EBAY: false,
  USE_REAL_PSA: false,
  USE_REAL_BGS: false,
  USE_REAL_SPORTS: false,
  USE_REAL_COMC: false,
  USE_REAL_GEMINI: false,
};

const ON: FeatureFlags = { ...OFF, USE_REAL_SPORTS: true };

describe('mlbLiveWire', () => {
  it('keeps seeded fallback as the default and never claims live tape', () => {
    const feed = resolveMlbCatalystsSync(
      [makeCard({ id: 'sho', player: 'Shohei Ohtani', currentValue: 3400 })],
      OFF,
    );
    expect(feed.status.armed).toBe(false);
    expect(feed.status.source).toBe('seeded');
    expect(feed.status.disclosure).toBe(MLB_WIRE_SEEDED_DISCLOSURE);
    expect(feed.scenarios.some((row) => row.catalyst === 'injury')).toBe(true);
    expect(mlbWireStatus(ON).disclosure).toBe(MLB_WIRE_ARMED_DISCLOSURE);
  });

  it('uses the live fetcher when armed and falls back on empty, unbound, or thrown results', async () => {
    const inventory = [makeCard({ id: 'sho', player: 'Shohei Ohtani', currentValue: 3400 })];
    const live = await resolveMlbCatalysts(inventory, {
      flags: ON,
      fetchLive: async () => [
        { player: 'Shohei Ohtani', catalyst: 'injury', headline: 'Live IL note' },
      ],
    });
    expect(live.status.source).toBe('live_mlb');
    expect(live.scenarios[0]?.source).toBe('live_mlb_wire');

    const empty = await resolveMlbCatalysts(inventory, { flags: ON, fetchLive: async () => [] });
    expect(empty.status.source).toBe('live_armed_fallback');

    const unbound = await resolveMlbCatalysts(inventory, {
      flags: ON,
      fetchLive: async () => [{ player: 'Nobody', catalyst: 'transaction', headline: 'Nope' }],
    });
    expect(unbound.status.degradedReason).toMatch(/did not bind/i);

    const failed = await resolveMlbCatalysts(inventory, {
      flags: ON,
      fetchLive: async () => {
        throw new Error('sports key missing');
      },
    });
    expect(failed.status.degradedReason).toMatch(/sports key missing/);

    const seededPath = await resolveMlbCatalysts(inventory, { flags: OFF, fetchLive: async () => [] });
    expect(seededPath.status.source).toBe('seeded');

    const withSold = await resolveMlbCatalysts(
      [...inventory, makeCard({ id: 'sold', player: 'Shohei Ohtani', status: 'sold' })],
      {
        flags: ON,
        fetchLive: async () => [
          { player: 'Shohei Ohtani', catalyst: 'injury', headline: 'Live IL note' },
        ],
      },
    );
    expect(withSold.scenarios.every((row) => row.assetId !== 'sold')).toBe(true);

    const thrownNonError = await resolveMlbCatalysts(inventory, {
      flags: ON,
      fetchLive: async () => {
        throw 'nope';
      },
    });
    expect(thrownNonError.status.degradedReason).toMatch(/failed/i);
  });

  it('labels PvP as seeded unless the sports flag is on', () => {
    const pvp = resolveMlbPvpSync([makeCard({ player: 'Mike Trout', league: 'MLB', sport: 'Baseball' })], [], OFF);
    expect(pvp.status.source).toBe('seeded');
    expect(pvp.status.disclosure).toMatch(/not a live sports wire/i);
    expect(resolveMlbPvpSync([], [], ON).status.disclosure).toBe(MLB_WIRE_ARMED_DISCLOSURE);
  });

  it('defaults to feature flags and maps non-injury live rows', async () => {
    expect(mlbWireStatus().armed).toBe(false);
    const seeded = await resolveMlbCatalysts([makeCard({ player: 'Juan Soto' })]);
    expect(seeded.status.source).toBe('seeded');
    const liveHold = await resolveMlbCatalysts([makeCard({ id: 'soto', player: 'Juan Soto' })], {
      flags: ON,
      fetchLive: async () => [
        { player: 'Juan Soto', catalyst: 'award_race', headline: 'Live award' },
      ],
    });
    expect(liveHold.scenarios[0]?.suggestedAction).toBe('Hold');
    expect(liveHold.scenarios[0]?.triggerWindow).toBe('Next reporting window');
    const notArray = await resolveMlbCatalysts([makeCard({ player: 'Juan Soto' })], {
      flags: ON,
      fetchLive: async () => ({ nope: true } as never),
    });
    expect(notArray.status.degradedReason).toMatch(/empty/i);
    const armedNoFetcher = await resolveMlbCatalysts([makeCard({ player: 'Juan Soto' })], { flags: ON });
    expect(armedNoFetcher.status.source).toBe('live_armed_fallback');
  });
});
