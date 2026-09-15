/**
 * MLB catalyst / PvP wire adapters.
 *
 * Seeded fallback stays default. Live path is structured for when the owner
 * later sets sports keys / VITE_FF_REAL_SPORTS — this module never flips that
 * flag and never claims a live tape while it is off.
 */
import type { CardInventory } from '../../types';
import { getFeatureFlags, type FeatureFlags } from '../featureFlags';
import {
  CatalystEngine,
  type CatalystScenario,
} from '../utils/catalystEngine';
import {
  SEEDED_LEAGUE_PVP_DISCLOSURE,
  buildPerformanceVsPriceSeries,
  type PerformanceVsPricePoint,
} from '../analytics/performanceVsPrice';
import type { PlayerPerformance } from '../utils/statsService';

export const MLB_WIRE_SEEDED_DISCLOSURE =
  'Seeded MLB catalyst / PvP fallback — not a live sports wire. Live path stays behind owner sports keys / VITE_FF_REAL_SPORTS.';

export const MLB_WIRE_ARMED_DISCLOSURE =
  'Owner sports flag is on. Live MLB Stats path is attempted; seeded fallback is used on failure. Not Market Movers parity.';

export type MlbWireSource = 'seeded' | 'live_mlb' | 'live_armed_fallback';

export interface MlbWireStatus {
  armed: boolean;
  source: MlbWireSource;
  disclosure: string;
  degradedReason: string | null;
}

export interface MlbCatalystFeed {
  scenarios: CatalystScenario[];
  status: MlbWireStatus;
}

export interface MlbPvpFeed {
  points: PerformanceVsPricePoint[];
  status: MlbWireStatus;
}

export interface MlbLiveCatalystRow {
  player: string;
  catalyst: CatalystScenario['catalyst'];
  headline: string;
  triggerWindow?: string;
}

export type MlbLiveCatalystFetcher = (players: string[]) => Promise<MlbLiveCatalystRow[]>;

function sportsFlagOn(flags: FeatureFlags = getFeatureFlags()): boolean {
  return flags.USE_REAL_SPORTS === true;
}

export function mlbWireStatus(
  flags: FeatureFlags = getFeatureFlags(),
  extras: { liveOk?: boolean; error?: string | null } = {},
): MlbWireStatus {
  const armed = sportsFlagOn(flags);
  if (!armed) {
    return {
      armed: false,
      source: 'seeded',
      disclosure: MLB_WIRE_SEEDED_DISCLOSURE,
      degradedReason: null,
    };
  }
  if (extras.liveOk) {
    return {
      armed: true,
      source: 'live_mlb',
      disclosure: MLB_WIRE_ARMED_DISCLOSURE,
      degradedReason: null,
    };
  }
  return {
    armed: true,
    source: 'live_armed_fallback',
    disclosure: MLB_WIRE_ARMED_DISCLOSURE,
    degradedReason: extras.error || 'Live MLB fetch unavailable — seeded fallback in use.',
  };
}

export function resolveMlbCatalystsSync(
  inventory: CardInventory[],
  flags: FeatureFlags = getFeatureFlags(),
): MlbCatalystFeed {
  return {
    scenarios: CatalystEngine.generateScenarios(inventory),
    status: mlbWireStatus(flags),
  };
}

function mapLiveRowToScenario(row: MlbLiveCatalystRow, card: CardInventory): CatalystScenario {
  return {
    id: `${card.id}-live-${row.catalyst}`,
    assetId: card.id,
    assetName: `${card.year} ${card.player} ${card.set}`.trim(),
    catalyst: row.catalyst,
    headline: row.headline,
    triggerWindow: row.triggerWindow || 'Next reporting window',
    confidence: 0.7,
    expectedMovePct: 5,
    downsidePct: 8,
    suggestedAction: row.catalyst === 'injury' ? 'Monitor' : 'Hold',
    bias: row.catalyst === 'injury' ? 'defensive' : 'neutral',
    source: 'live_mlb_wire',
    disclosure: MLB_WIRE_ARMED_DISCLOSURE,
  };
}

export async function resolveMlbCatalysts(
  inventory: CardInventory[],
  options: {
    flags?: FeatureFlags;
    fetchLive?: MlbLiveCatalystFetcher;
  } = {},
): Promise<MlbCatalystFeed> {
  const flags = options.flags ?? getFeatureFlags();
  const seeded = resolveMlbCatalystsSync(inventory, flags);
  if (!sportsFlagOn(flags) || !options.fetchLive) {
    return seeded;
  }

  try {
    const players = inventory.filter((card) => card.status !== 'sold').map((card) => card.player);
    const rows = await options.fetchLive(players);
    if (!Array.isArray(rows) || rows.length === 0) {
      return { ...seeded, status: mlbWireStatus(flags, { error: 'Live MLB catalyst feed empty.' }) };
    }
    const scenarios: CatalystScenario[] = [];
    for (const card of inventory) {
      if (card.status === 'sold') continue;
      const match = rows.find((row) => row.player.trim().toLowerCase() === card.player.trim().toLowerCase());
      if (match) scenarios.push(mapLiveRowToScenario(match, card));
    }
    if (scenarios.length === 0) {
      return { ...seeded, status: mlbWireStatus(flags, { error: 'Live MLB rows did not bind to holdings.' }) };
    }
    return {
      scenarios,
      status: mlbWireStatus(flags, { liveOk: true }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Live MLB catalyst fetch failed.';
    return { ...seeded, status: mlbWireStatus(flags, { error: message }) };
  }
}

export function resolveMlbPvpSync(
  cards: CardInventory[],
  performances: Array<PlayerPerformance | null | undefined>,
  flags: FeatureFlags = getFeatureFlags(),
): MlbPvpFeed {
  return {
    points: buildPerformanceVsPriceSeries(cards, performances),
    status: {
      ...mlbWireStatus(flags),
      disclosure: sportsFlagOn(flags)
        ? MLB_WIRE_ARMED_DISCLOSURE
        : `${SEEDED_LEAGUE_PVP_DISCLOSURE} ${MLB_WIRE_SEEDED_DISCLOSURE}`,
    },
  };
}
