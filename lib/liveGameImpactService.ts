/**
 * Phase 69: Live Game Impact Engine
 * Real-time card value impact analysis during live games.
 * NO competitor offers live game-to-card-value correlation during active play.
 */

export interface LiveGameEvent {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  eventType: 'home_run' | 'touchdown' | 'three_pointer' | 'strikeout' | 'interception' | 'goal' | 'assist' | 'injury' | 'ejection' | 'milestone' | 'record_break' | 'walk_off' | 'no_hitter_progress' | 'triple_double';
  description: string;
  timestamp: string;
  inning?: number;
  quarter?: number;
  period?: number;
  impactScore: number; // -100 to +100
  cardValueDelta: number; // percentage change
  volumeSpike: number; // multiplier on normal trading volume
  sport: string;
}

export interface LiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: 'MLB' | 'NBA' | 'NFL' | 'NHL';
  status: 'pre_game' | 'live' | 'final' | 'delayed';
  score: { home: number; away: number };
  period: string;
  clock: string;
  impactedCards: number;
  portfolioImpact: number; // total % impact on user portfolio
  events: LiveGameEvent[];
  startTime: string;
  venue: string;
}

export interface PlayerImpactProfile {
  playerId: string;
  playerName: string;
  sport: string;
  team: string;
  cardsOwned: number;
  totalCardValue: number;
  liveImpact: number; // current session % change
  impactHistory: { event: string; delta: number; timestamp: string }[];
  momentumScore: number; // 0-100, rolling game performance
  projectedEndGameImpact: number;
}

export interface ImpactAlert {
  id: string;
  type: 'surge' | 'crash' | 'milestone' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  playerName: string;
  message: string;
  cardValueChange: number;
  timestamp: string;
  actionable: boolean;
  suggestedAction?: string;
}

export interface GameDayPortfolioSnapshot {
  totalImpact: number;
  gamesTracked: number;
  playersImpacted: number;
  biggestMover: { player: string; delta: number };
  alerts: ImpactAlert[];
  timeline: { time: string; portfolioValue: number }[];
}

// Impact multiplier tables based on event significance
const EVENT_IMPACT_MAP: Record<string, { baseImpact: number; volumeMultiplier: number }> = {
  home_run: { baseImpact: 2.5, volumeMultiplier: 3.0 },
  walk_off: { baseImpact: 8.0, volumeMultiplier: 12.0 },
  no_hitter_progress: { baseImpact: 15.0, volumeMultiplier: 20.0 },
  touchdown: { baseImpact: 3.0, volumeMultiplier: 4.0 },
  three_pointer: { baseImpact: 0.5, volumeMultiplier: 1.2 },
  triple_double: { baseImpact: 5.0, volumeMultiplier: 6.0 },
  strikeout: { baseImpact: 0.8, volumeMultiplier: 1.5 },
  interception: { baseImpact: -3.0, volumeMultiplier: 4.0 },
  goal: { baseImpact: 3.5, volumeMultiplier: 5.0 },
  assist: { baseImpact: 1.0, volumeMultiplier: 1.5 },
  injury: { baseImpact: -12.0, volumeMultiplier: 15.0 },
  ejection: { baseImpact: -5.0, volumeMultiplier: 8.0 },
  milestone: { baseImpact: 10.0, volumeMultiplier: 15.0 },
  record_break: { baseImpact: 20.0, volumeMultiplier: 25.0 },
};

// Simulated live games for demo
const SIMULATED_LIVE_GAMES: LiveGame[] = [
  {
    id: 'game-1',
    homeTeam: 'NY Yankees',
    awayTeam: 'LA Dodgers',
    sport: 'MLB',
    status: 'live',
    score: { home: 4, away: 3 },
    period: 'Top 7th',
    clock: '1 Out',
    impactedCards: 12,
    portfolioImpact: 3.2,
    startTime: new Date().toISOString(),
    venue: 'Yankee Stadium',
    events: [
      {
        id: 'evt-1',
        gameId: 'game-1',
        playerId: 'judge-1',
        playerName: 'Aaron Judge',
        eventType: 'home_run',
        description: '3-run HR to right field, 462 ft. Season HR #32.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        inning: 4,
        impactScore: 45,
        cardValueDelta: 4.2,
        volumeSpike: 5.8,
        sport: 'MLB',
      },
      {
        id: 'evt-2',
        gameId: 'game-1',
        playerId: 'ohtani-1',
        playerName: 'Shohei Ohtani',
        eventType: 'strikeout',
        description: 'K looking on 97mph fastball. 3rd K of the game.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        inning: 6,
        impactScore: -8,
        cardValueDelta: -0.3,
        volumeSpike: 1.2,
        sport: 'MLB',
      },
    ],
  },
  {
    id: 'game-2',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Denver Nuggets',
    sport: 'NBA',
    status: 'live',
    score: { home: 88, away: 82 },
    period: 'Q3',
    clock: '4:22',
    impactedCards: 8,
    portfolioImpact: 1.8,
    startTime: new Date().toISOString(),
    venue: 'TD Garden',
    events: [
      {
        id: 'evt-3',
        gameId: 'game-2',
        playerId: 'tatum-1',
        playerName: 'Jayson Tatum',
        eventType: 'triple_double',
        description: 'Triple-double watch: 28pts/10reb/9ast with 16 min remaining.',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        quarter: 3,
        impactScore: 35,
        cardValueDelta: 3.1,
        volumeSpike: 4.5,
        sport: 'NBA',
      },
    ],
  },
  {
    id: 'game-3',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    sport: 'NFL',
    status: 'live',
    score: { home: 21, away: 17 },
    period: 'Q4',
    clock: '8:45',
    impactedCards: 6,
    portfolioImpact: -0.5,
    startTime: new Date().toISOString(),
    venue: 'Arrowhead Stadium',
    events: [
      {
        id: 'evt-4',
        gameId: 'game-3',
        playerId: 'mahomes-1',
        playerName: 'Patrick Mahomes',
        eventType: 'touchdown',
        description: '45-yard TD pass to Kelce. 3rd TD of the game.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        quarter: 4,
        impactScore: 40,
        cardValueDelta: 2.8,
        volumeSpike: 6.2,
        sport: 'NFL',
      },
    ],
  },
];

export function getLiveGames(): LiveGame[] {
  return SIMULATED_LIVE_GAMES.map(game => ({
    ...game,
    events: game.events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  }));
}

export function calculateEventImpact(eventType: string, playerPopularity: number = 50): { impactPercent: number; volumeSpike: number } {
  const base = EVENT_IMPACT_MAP[eventType] || { baseImpact: 1.0, volumeMultiplier: 1.5 };
  const popularityMultiplier = 0.5 + (playerPopularity / 100);
  return {
    impactPercent: base.baseImpact * popularityMultiplier,
    volumeSpike: base.volumeMultiplier * popularityMultiplier,
  };
}

export function getPlayerImpactProfiles(playerNames: string[]): PlayerImpactProfile[] {
  const games = getLiveGames();
  const profiles: PlayerImpactProfile[] = [];

  for (const name of playerNames) {
    const events: LiveGameEvent[] = [];
    for (const game of games) {
      events.push(...game.events.filter(e => e.playerName === name));
    }

    if (events.length > 0) {
      const totalImpact = events.reduce((sum, e) => sum + e.cardValueDelta, 0);
      profiles.push({
        playerId: events[0].playerId,
        playerName: name,
        sport: events[0].sport,
        team: '',
        cardsOwned: Math.floor(Math.random() * 5) + 1,
        totalCardValue: Math.floor(Math.random() * 5000) + 500,
        liveImpact: totalImpact,
        impactHistory: events.map(e => ({
          event: e.description,
          delta: e.cardValueDelta,
          timestamp: e.timestamp,
        })),
        momentumScore: Math.min(100, Math.max(0, 50 + totalImpact * 5)),
        projectedEndGameImpact: totalImpact * 1.3,
      });
    }
  }

  return profiles;
}

export function getGameDaySnapshot(portfolioPlayers: string[]): GameDayPortfolioSnapshot {
  const games = getLiveGames();
  const profiles = getPlayerImpactProfiles(portfolioPlayers);
  const totalImpact = profiles.reduce((sum, p) => sum + p.liveImpact, 0);
  const biggestMover = profiles.length > 0
    ? profiles.reduce((max, p) => Math.abs(p.liveImpact) > Math.abs(max.liveImpact) ? p : max)
    : { playerName: 'N/A', liveImpact: 0 };

  const alerts: ImpactAlert[] = [];
  for (const game of games) {
    for (const event of game.events) {
      if (Math.abs(event.cardValueDelta) > 3) {
        alerts.push({
          id: `alert-${event.id}`,
          type: event.cardValueDelta > 0 ? 'surge' : 'crash',
          severity: Math.abs(event.cardValueDelta) > 10 ? 'critical' : Math.abs(event.cardValueDelta) > 5 ? 'high' : 'medium',
          playerName: event.playerName,
          message: `${event.playerName}: ${event.description}`,
          cardValueChange: event.cardValueDelta,
          timestamp: event.timestamp,
          actionable: Math.abs(event.cardValueDelta) > 5,
          suggestedAction: event.cardValueDelta > 5
            ? 'Consider listing at premium while momentum is hot'
            : event.cardValueDelta < -5
              ? 'Hold — panic selling during live games locks in losses'
              : undefined,
        });
      }
    }
  }

  const now = Date.now();
  const timeline = Array.from({ length: 12 }, (_, i) => ({
    time: new Date(now - (11 - i) * 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    portfolioValue: 10000 + Math.random() * totalImpact * 100 + i * 20,
  }));

  return {
    totalImpact,
    gamesTracked: games.filter(g => g.status === 'live').length,
    playersImpacted: profiles.length,
    biggestMover: { player: biggestMover.playerName, delta: biggestMover.liveImpact },
    alerts,
    timeline,
  };
}

export function getLiveImpactAlerts(): ImpactAlert[] {
  const snapshot = getGameDaySnapshot([]);
  const games = getLiveGames();
  const allAlerts: ImpactAlert[] = [];

  for (const game of games) {
    for (const event of game.events) {
      allAlerts.push({
        id: `alert-${event.id}`,
        type: event.cardValueDelta > 0 ? (event.cardValueDelta > 10 ? 'milestone' : 'surge') : 'crash',
        severity: Math.abs(event.cardValueDelta) > 10 ? 'critical' : Math.abs(event.cardValueDelta) > 5 ? 'high' : 'medium',
        playerName: event.playerName,
        message: `${event.playerName}: ${event.description}`,
        cardValueChange: event.cardValueDelta,
        timestamp: event.timestamp,
        actionable: true,
        suggestedAction: event.cardValueDelta > 5 ? 'Momentum surge — premium listing window open' : 'Monitor closely',
      });
    }
  }

  return allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
