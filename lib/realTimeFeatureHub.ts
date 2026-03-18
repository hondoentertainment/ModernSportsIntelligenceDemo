// ---- Real-Time Feature Hub ----
// Bridges the existing WebSocket notification pipeline to the 20 advanced
// feature channels used throughout the sports-card intelligence platform.
//
// Design mirrors the patterns found in realTimeNotificationService.ts:
//   - Singleton manager accessed via getFeatureHub()
//   - Channel-based pub/sub with optional filters
//   - Built-in simulation mode for demos and development

import { logger } from './logger';
import {
  getNotificationManager,
  WebSocketConnectionState,
} from './realTimeNotificationService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeatureDataType =
  | 'price-update'
  | 'risk-alert'
  | 'arbitrage-signal'
  | 'injury-update'
  | 'market-depth'
  | 'entropy-change'
  | 'bot-trade'
  | 'contagion-event'
  | 'yield-update'
  | 'genome-scan';

export type EventPriority = 'critical' | 'high' | 'normal' | 'low';

export interface FeatureChannel {
  id: string;
  featureName: string;
  dataType: FeatureDataType;
  subscriberCount: number;
  lastUpdate: string | null;
}

export interface RealTimeEvent<T = unknown> {
  channel: string;
  timestamp: string;
  data: T;
  priority: EventPriority;
  source: string;
}

export interface SubscriptionHandle {
  id: string;
  channel: string;
  callback: (event: RealTimeEvent) => void;
  filter?: (event: RealTimeEvent) => boolean;
}

// ---------------------------------------------------------------------------
// Channel definitions
// ---------------------------------------------------------------------------

export type FeatureChannelName =
  | 'injury-oracle'
  | 'market-maker-arena'
  | 'temporal-arbitrage'
  | 'chaos-entropy'
  | 'contagion-alerts'
  | 'yield-updates'
  | 'liquidity-changes'
  | 'genome-scans'
  | 'price-feeds'
  | 'pipeline-alerts';

interface ChannelSpec {
  featureName: string;
  dataType: FeatureDataType;
}

const CHANNEL_SPECS: Record<FeatureChannelName, ChannelSpec> = {
  'injury-oracle':       { featureName: 'Injury Oracle',          dataType: 'injury-update' },
  'market-maker-arena':  { featureName: 'Market Maker Arena',     dataType: 'bot-trade' },
  'temporal-arbitrage':  { featureName: 'Temporal Arbitrage',     dataType: 'arbitrage-signal' },
  'chaos-entropy':       { featureName: 'Chaos & Entropy',        dataType: 'entropy-change' },
  'contagion-alerts':    { featureName: 'Contagion Mapper',       dataType: 'contagion-event' },
  'yield-updates':       { featureName: 'Yield Farming',          dataType: 'yield-update' },
  'liquidity-changes':   { featureName: 'Liquidity Depth',        dataType: 'market-depth' },
  'genome-scans':        { featureName: 'Card Genome Scanner',    dataType: 'genome-scan' },
  'price-feeds':         { featureName: 'Cross-Asset Price Feed', dataType: 'price-update' },
  'pipeline-alerts':     { featureName: 'Prospect Pipeline',      dataType: 'risk-alert' },
};

const ALL_CHANNEL_NAMES = Object.keys(CHANNEL_SPECS) as FeatureChannelName[];

export { CHANNEL_SPECS, ALL_CHANNEL_NAMES };

// ---------------------------------------------------------------------------
// Mock-data helpers (mirrors the style in realTimeNotificationService.ts)
// ---------------------------------------------------------------------------

const PLAYER_NAMES = [
  'Shohei Ohtani', 'Victor Wembanyama', 'Patrick Mahomes', 'Connor McDavid',
  'Luka Doncic', 'Mike Trout', 'Jayson Tatum', 'Jude Bellingham',
  'Caitlin Clark', 'Lamar Jackson', 'Lionel Messi', 'Anthony Edwards',
  'Juan Soto', 'Connor Bedard', 'CJ Stroud', 'Tyrese Haliburton',
];

const CARD_SETS = [
  '2023 Topps Chrome', '2023 Panini Prizm', '2022 Bowman Chrome',
  '2024 Select', '2023 Optic', '2024 Topps Series 1',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

let _seqId = 0;
function nextId(prefix: string): string {
  _seqId += 1;
  return `${prefix}_${Date.now()}_${_seqId}`;
}

// ---------------------------------------------------------------------------
// Per-channel event generators
// ---------------------------------------------------------------------------

type EventGenerator = () => RealTimeEvent;

function generateInjuryOracle(): RealTimeEvent {
  const player = pick(PLAYER_NAMES);
  const riskDelta = randBetween(-15, 25);
  const injuryTypes = ['hamstring strain', 'shoulder soreness', 'ankle sprain', 'concussion protocol', 'day-to-day illness'];
  const isNewReport = Math.random() > 0.5;
  return {
    channel: 'injury-oracle',
    timestamp: new Date().toISOString(),
    priority: Math.abs(riskDelta) > 15 ? 'critical' : Math.abs(riskDelta) > 8 ? 'high' : 'normal',
    source: 'injury-intel-service',
    data: {
      player,
      riskScoreDelta: riskDelta,
      newRiskScore: randBetween(10, 95),
      injuryType: isNewReport ? pick(injuryTypes) : null,
      isNewReport,
      estimatedGamesOut: isNewReport ? Math.floor(Math.random() * 20) + 1 : 0,
      cardImpactPct: randBetween(-12, -1),
    },
  };
}

function generateMarketMakerArena(): RealTimeEvent {
  const botNames = ['AlphaBot', 'SpreadHawk', 'DepthChaser', 'MomentumV2', 'ScalpKing'];
  const bot = pick(botNames);
  const side = pick(['buy', 'sell'] as const);
  const player = pick(PLAYER_NAMES);
  return {
    channel: 'market-maker-arena',
    timestamp: new Date().toISOString(),
    priority: 'normal',
    source: 'market-maker-service',
    data: {
      botName: bot,
      action: side,
      player,
      card: pick(CARD_SETS),
      price: randBetween(50, 3000),
      quantity: Math.floor(Math.random() * 5) + 1,
      pnlDelta: randBetween(-120, 350),
      cumulativePnl: randBetween(-500, 5000),
      orderBookDepth: Math.floor(Math.random() * 50) + 5,
    },
  };
}

function generateTemporalArbitrage(): RealTimeEvent {
  const player = pick(PLAYER_NAMES);
  const spreadPct = randBetween(2, 18);
  const isExpiring = Math.random() > 0.7;
  return {
    channel: 'temporal-arbitrage',
    timestamp: new Date().toISOString(),
    priority: spreadPct > 12 ? 'high' : isExpiring ? 'critical' : 'normal',
    source: 'temporal-arbitrage-service',
    data: {
      player,
      card: pick(CARD_SETS),
      platformA: pick(['eBay', 'COMC', 'MySlabs']),
      platformB: pick(['StockX', 'Alt', 'Goldin']),
      priceA: randBetween(80, 2000),
      priceB: randBetween(80, 2000),
      spreadPct,
      isExpiring,
      expiresInSeconds: isExpiring ? Math.floor(Math.random() * 120) + 10 : null,
      confidence: randBetween(0.6, 0.99),
    },
  };
}

function generateChaosEntropy(): RealTimeEvent {
  const sectors = ['Basketball Rookies', 'Baseball Vintage', 'Football QBs', 'Soccer International', 'Hockey Prospects'];
  const sector = pick(sectors);
  const entropy = randBetween(0, 1);
  const isButterfly = entropy > 0.85;
  return {
    channel: 'chaos-entropy',
    timestamp: new Date().toISOString(),
    priority: isButterfly ? 'critical' : entropy > 0.6 ? 'high' : 'normal',
    source: 'chaos-theory-service',
    data: {
      sector,
      entropyLevel: entropy,
      previousEntropy: randBetween(0, 1),
      isButterflyEvent: isButterfly,
      butterflyTrigger: isButterfly ? pick(['viral social post', 'unexpected trade', 'injury news', 'regulatory change']) : null,
      affectedCards: Math.floor(Math.random() * 200) + 10,
      projectedVolatility: randBetween(0.05, 0.45),
    },
  };
}

function generateContagionAlerts(): RealTimeEvent {
  const sourcePlayer = pick(PLAYER_NAMES);
  const affectedPlayers = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => pick(PLAYER_NAMES));
  const severity = randBetween(0, 1);
  return {
    channel: 'contagion-alerts',
    timestamp: new Date().toISOString(),
    priority: severity > 0.8 ? 'critical' : severity > 0.5 ? 'high' : 'normal',
    source: 'contagion-mapper-service',
    data: {
      sourcePlayer,
      affectedPlayers,
      contagionType: pick(['price', 'sentiment', 'volume', 'correlation-break']),
      severity,
      spreadSpeed: pick(['instant', 'fast', 'gradual']),
      estimatedImpactPct: randBetween(-20, -1),
      mitigationAvailable: Math.random() > 0.5,
    },
  };
}

function generateYieldUpdates(): RealTimeEvent {
  const vaultNames = ['Blue-Chip Vault', 'Rookie Yield Pool', 'Grail Index Fund', 'Vintage Income'];
  const vault = pick(vaultNames);
  const isDistribution = Math.random() > 0.6;
  return {
    channel: 'yield-updates',
    timestamp: new Date().toISOString(),
    priority: isDistribution ? 'high' : 'low',
    source: 'yield-farming-service',
    data: {
      vaultName: vault,
      currentApy: randBetween(3, 28),
      previousApy: randBetween(3, 28),
      apyDelta: randBetween(-5, 5),
      isDistribution,
      distributionAmount: isDistribution ? randBetween(10, 500) : 0,
      tvl: randBetween(50000, 2000000),
      participantCount: Math.floor(Math.random() * 500) + 20,
    },
  };
}

function generateLiquidityChanges(): RealTimeEvent {
  const player = pick(PLAYER_NAMES);
  const liquidityScore = randBetween(0, 100);
  const isCrisis = liquidityScore < 15;
  return {
    channel: 'liquidity-changes',
    timestamp: new Date().toISOString(),
    priority: isCrisis ? 'critical' : liquidityScore < 30 ? 'high' : 'normal',
    source: 'liquidity-depth-service',
    data: {
      player,
      card: pick(CARD_SETS),
      liquidityScore,
      previousScore: randBetween(0, 100),
      isCrisis,
      bidAskSpread: randBetween(0.5, 25),
      depth: Math.floor(Math.random() * 50) + 1,
      avgDailyVolume: Math.floor(Math.random() * 100) + 1,
    },
  };
}

function generateGenomeScans(): RealTimeEvent {
  const player = pick(PLAYER_NAMES);
  const rarityTraits = ['low pop', 'color match', 'SSP', 'photo variation', 'error card', '1/1'];
  const traitCount = Math.floor(Math.random() * 3) + 1;
  const traits = Array.from({ length: traitCount }, () => pick(rarityTraits));
  return {
    channel: 'genome-scans',
    timestamp: new Date().toISOString(),
    priority: traits.includes('1/1') || traits.includes('error card') ? 'high' : 'normal',
    source: 'card-genome-service',
    data: {
      player,
      card: pick(CARD_SETS),
      genomeId: nextId('genome'),
      rarityTraits: [...new Set(traits)],
      overallRarityScore: randBetween(40, 99),
      marketPremiumPct: randBetween(5, 80),
      comparableCount: Math.floor(Math.random() * 200) + 1,
      scanConfidence: randBetween(0.75, 0.99),
    },
  };
}

function generatePriceFeeds(): RealTimeEvent {
  const player = pick(PLAYER_NAMES);
  const card = pick(CARD_SETS);
  const price = randBetween(20, 5000);
  const changePct = randBetween(-8, 8);
  return {
    channel: 'price-feeds',
    timestamp: new Date().toISOString(),
    priority: Math.abs(changePct) > 5 ? 'high' : 'low',
    source: 'cross-asset-price-engine',
    data: {
      player,
      card,
      currentPrice: price,
      changePct,
      changeAbs: Math.round(price * (changePct / 100) * 100) / 100,
      volume24h: Math.floor(Math.random() * 500) + 1,
      high24h: price * (1 + Math.abs(randBetween(0.01, 0.08))),
      low24h: price * (1 - Math.abs(randBetween(0.01, 0.08))),
      platform: pick(['eBay', 'StockX', 'COMC', 'Alt', 'Goldin']),
    },
  };
}

function generatePipelineAlerts(): RealTimeEvent {
  const prospects = ['Roki Sasaki', 'Ethan Salas', 'Roman Anthony', 'Jared Jones', 'Junior Caminero', 'Jackson Holliday'];
  const prospect = pick(prospects);
  const isBreaking = Math.random() > 0.7;
  return {
    channel: 'pipeline-alerts',
    timestamp: new Date().toISOString(),
    priority: isBreaking ? 'critical' : 'normal',
    source: 'prospect-pipeline-service',
    data: {
      prospect,
      newsType: pick(['call-up', 'stat-line', 'draft-stock-change', 'trade-rumor', 'injury', 'promotion']),
      headline: isBreaking
        ? `BREAKING: ${prospect} called up to majors`
        : `${prospect} draft stock ${pick(['rising', 'falling', 'holding steady'])}`,
      draftStockDelta: randBetween(-10, 15),
      cardImpactPct: randBetween(-5, 25),
      isBreaking,
      relatedCards: Math.floor(Math.random() * 20) + 1,
    },
  };
}

const EVENT_GENERATORS: Record<FeatureChannelName, EventGenerator> = {
  'injury-oracle': generateInjuryOracle,
  'market-maker-arena': generateMarketMakerArena,
  'temporal-arbitrage': generateTemporalArbitrage,
  'chaos-entropy': generateChaosEntropy,
  'contagion-alerts': generateContagionAlerts,
  'yield-updates': generateYieldUpdates,
  'liquidity-changes': generateLiquidityChanges,
  'genome-scans': generateGenomeScans,
  'price-feeds': generatePriceFeeds,
  'pipeline-alerts': generatePipelineAlerts,
};

// Relative weights control how often each channel fires during simulation.
const CHANNEL_WEIGHTS: Record<FeatureChannelName, number> = {
  'price-feeds': 5,
  'market-maker-arena': 4,
  'temporal-arbitrage': 3,
  'injury-oracle': 2,
  'chaos-entropy': 2,
  'contagion-alerts': 1,
  'yield-updates': 2,
  'liquidity-changes': 2,
  'genome-scans': 1,
  'pipeline-alerts': 2,
};

// ---------------------------------------------------------------------------
// RealTimeFeatureHub class
// ---------------------------------------------------------------------------

export class RealTimeFeatureHub {
  private subscriptions: Map<string, SubscriptionHandle> = new Map();
  private channelSubscribers: Map<string, Set<string>> = new Map();
  private globalSubscribers: Set<string> = new Set();
  private channelLastUpdate: Map<string, string> = new Map();

  private simulationTimers: ReturnType<typeof setTimeout>[] = [];
  private isSimulating = false;

  private stateCallbacks: Set<(connected: boolean) => void> = new Set();

  // ---- Public API ----

  /**
   * Subscribe to events on a specific channel (or '*' for all channels).
   * Returns a SubscriptionHandle that can be passed to `unsubscribe()`.
   */
  subscribe(
    channel: FeatureChannelName | '*',
    callback: (event: RealTimeEvent) => void,
    filter?: (event: RealTimeEvent) => boolean,
  ): SubscriptionHandle {
    const handle: SubscriptionHandle = {
      id: nextId('sub'),
      channel,
      callback,
      filter,
    };

    this.subscriptions.set(handle.id, handle);

    if (channel === '*') {
      this.globalSubscribers.add(handle.id);
    } else {
      if (!this.channelSubscribers.has(channel)) {
        this.channelSubscribers.set(channel, new Set());
      }
      this.channelSubscribers.get(channel)!.add(handle.id);
    }

    return handle;
  }

  /**
   * Remove a subscription created by `subscribe()`.
   */
  unsubscribe(handle: SubscriptionHandle): void {
    this.subscriptions.delete(handle.id);

    if (handle.channel === '*') {
      this.globalSubscribers.delete(handle.id);
    } else {
      this.channelSubscribers.get(handle.channel)?.delete(handle.id);
    }
  }

  /**
   * Returns the current status of every feature channel including subscriber
   * count and last update time.
   */
  getChannelStatus(): FeatureChannel[] {
    return ALL_CHANNEL_NAMES.map((name) => {
      const spec = CHANNEL_SPECS[name];
      const subs = this.channelSubscribers.get(name)?.size ?? 0;
      return {
        id: name,
        featureName: spec.featureName,
        dataType: spec.dataType,
        subscriberCount: subs,
        lastUpdate: this.channelLastUpdate.get(name) ?? null,
      };
    });
  }

  /**
   * Inject a synthetic event into a channel. Useful for demos, testing,
   * and development.
   */
  simulateEvent(channel: FeatureChannelName, data: unknown): RealTimeEvent {
    const event: RealTimeEvent = {
      channel,
      timestamp: new Date().toISOString(),
      data,
      priority: 'normal',
      source: 'manual-simulation',
    };
    this._dispatch(event);
    return event;
  }

  /**
   * Begin automatic event simulation. Events are generated at randomised
   * intervals (800ms–4s) across all channels weighted by typical activity
   * levels. The upstream WebSocket manager is also connected so that the
   * existing notification pipeline stays in sync.
   */
  startSimulation(): void {
    if (this.isSimulating) return;
    this.isSimulating = true;

    // Also wire into the existing notification manager so legacy
    // subscribers continue to work.
    const notifManager = getNotificationManager();
    notifManager.connect();

    this._notifyConnectionState(true);
    this._scheduleNext();
  }

  /**
   * Halt automatic simulation and disconnect the upstream notification
   * manager.
   */
  stopSimulation(): void {
    if (!this.isSimulating) return;
    this.isSimulating = false;

    for (const timer of this.simulationTimers) {
      clearTimeout(timer);
    }
    this.simulationTimers = [];

    const notifManager = getNotificationManager();
    notifManager.disconnect();

    this._notifyConnectionState(false);
  }

  /**
   * Returns true when the simulation loop is running.
   */
  getIsSimulating(): boolean {
    return this.isSimulating;
  }

  /**
   * Returns the connection state derived from the upstream notification
   * manager, mapped to a simplified three-state model.
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    const upstream = getNotificationManager().getConnectionState();
    return mapConnectionState(upstream);
  }

  /**
   * Register a callback for connection-state changes.
   * Returns an unsubscribe function.
   */
  onConnectionChange(cb: (connected: boolean) => void): () => void {
    this.stateCallbacks.add(cb);
    return () => {
      this.stateCallbacks.delete(cb);
    };
  }

  // ---- Private helpers ----

  private _dispatch(event: RealTimeEvent): void {
    this.channelLastUpdate.set(event.channel, event.timestamp);

    // Channel-specific subscribers
    const channelSubs = this.channelSubscribers.get(event.channel);
    if (channelSubs) {
      for (const subId of channelSubs) {
        this._deliver(subId, event);
      }
    }

    // Global subscribers
    for (const subId of this.globalSubscribers) {
      this._deliver(subId, event);
    }
  }

  private _deliver(subId: string, event: RealTimeEvent): void {
    const handle = this.subscriptions.get(subId);
    if (!handle) return;

    // Apply optional filter — skip delivery when the filter rejects.
    if (handle.filter && !handle.filter(event)) return;

    try {
      handle.callback(event);
    } catch (err) {
      // Defensive: never let a subscriber error break the dispatch loop.
      logger.error(`[FeatureHub] Subscriber ${subId} threw:`, err);
    }
  }

  private _scheduleNext(): void {
    if (!this.isSimulating) return;

    const delay = 800 + Math.random() * 3200; // 0.8s – 4s
    const timer = setTimeout(() => {
      if (!this.isSimulating) return;

      const channel = this._pickWeightedChannel();
      const generator = EVENT_GENERATORS[channel];
      const event = generator();
      this._dispatch(event);

      // Remove this timer from tracking and schedule the next one.
      this.simulationTimers = this.simulationTimers.filter((t) => t !== timer);
      this._scheduleNext();
    }, delay);

    this.simulationTimers.push(timer);
  }

  private _pickWeightedChannel(): FeatureChannelName {
    const pool: FeatureChannelName[] = [];
    for (const ch of ALL_CHANNEL_NAMES) {
      const w = CHANNEL_WEIGHTS[ch] ?? 1;
      for (let i = 0; i < w; i++) pool.push(ch);
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private _notifyConnectionState(connected: boolean): void {
    for (const cb of this.stateCallbacks) {
      try {
        cb(connected);
      } catch {
        // swallow
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function mapConnectionState(state: WebSocketConnectionState): 'connected' | 'connecting' | 'disconnected' {
  switch (state) {
    case 'connected':
      return 'connected';
    case 'connecting':
    case 'reconnecting':
      return 'connecting';
    default:
      return 'disconnected';
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _hubInstance: RealTimeFeatureHub | null = null;

export function getFeatureHub(): RealTimeFeatureHub {
  if (!_hubInstance) {
    _hubInstance = new RealTimeFeatureHub();
  }
  return _hubInstance;
}

export default getFeatureHub;
