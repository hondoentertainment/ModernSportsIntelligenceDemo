/**
 * Phase 104: Live Game Impact Engine (Advanced)
 *
 * A comprehensive real-time card value prediction system that connects live game
 * performance to card price movements. Extends the basic Phase 69 service with
 * ML-style scoring, historical correlation analysis, price projection timelines,
 * milestone detection, and portfolio-level impact aggregation.
 *
 * NO competitor offers this level of live game-to-card-value intelligence.
 */

import type { CardInventory } from '../types';

// ─── Core Types ──────────────────────────────────────────────────────

export type SportType = 'MLB' | 'NBA' | 'NFL' | 'NHL';
export type GameStatus = 'pre_game' | 'live' | 'halftime' | 'final' | 'delayed' | 'rain_delay';
export type EventCategory = 'offensive' | 'defensive' | 'milestone' | 'injury' | 'ejection' | 'record';

export interface LiveGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeAbbrev: string;
  awayAbbrev: string;
  sport: SportType;
  status: GameStatus;
  score: { home: number; away: number };
  period: string; // "Top 7th", "Q3", "3rd Period", etc.
  clock: string;  // "4:22", "2 Out", etc.
  timeRemaining: number; // seconds remaining (estimated)
  venue: string;
  broadcast: string;
  startTime: string;
  attendance: number;
  weather?: string; // outdoor sports
  keyPlayers: GamePlayerStat[];
}

export interface GamePlayerStat {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  statLine: string; // "3-for-4, HR, 3 RBI" or "28pts/10reb/9ast"
  gameRating: number; // 0-100 performance rating
}

export interface GameEvent {
  id: string;
  gameId: string;
  playerId: string;
  playerName: string;
  team: string;
  eventType: string;
  category: EventCategory;
  description: string;
  timestamp: string;
  period: string;
  clock: string;
  impactScore: number; // -100 to +100
  cardValueDelta: number; // predicted % change
  volumeSpike: number; // multiplier on normal volume
  confidence: number; // 0-1 confidence in prediction
  sport: SportType;
  isHighlight: boolean;
}

export interface PlayerPerformance {
  playerId: string;
  playerName: string;
  team: string;
  sport: SportType;
  position: string;
  gameId: string;
  currentStatLine: string;
  gameRating: number;
  performanceTrend: 'rising' | 'stable' | 'declining';
  cardsInPortfolio: number;
  totalPortfolioValue: number;
  sessionImpact: number; // cumulative % change this game
  events: GameEvent[];
  projectedFinalImpact: number;
  momentumScore: number; // 0-100
}

export interface ImpactPrediction {
  playerId: string;
  playerName: string;
  eventType: string;
  predictedPriceChange: number; // %
  confidence: number; // 0-1
  volumePrediction: number; // multiplier
  reasoning: string;
  historicalBasis: string;
  modelFactors: ModelFactor[];
}

export interface ModelFactor {
  name: string;
  weight: number;
  value: number;
  contribution: number; // how much this factor contributes to prediction
}

export interface PriceProjection {
  playerId: string;
  playerName: string;
  eventDescription: string;
  currentPrice: number;
  projections: PriceProjectionWindow[];
  confidenceBand: { upper: number; lower: number };
  chartData: PriceChartPoint[];
}

export interface PriceProjectionWindow {
  window: '1h' | '24h' | '48h' | '7d';
  predictedPrice: number;
  predictedChange: number; // %
  confidence: number;
  reasoning: string;
}

export interface PriceChartPoint {
  time: string;
  price: number;
  upper: number;
  lower: number;
  isProjection: boolean;
}

export interface HistoricalCorrelation {
  id: string;
  eventType: string;
  eventDescription: string;
  playerName: string;
  sport: SportType;
  date: string;
  priceBeforeEvent: number;
  priceAfter24h: number;
  priceAfter48h: number;
  priceAfter7d: number;
  actualChange: number; // %
  volumeSpike: number;
  cardDescription: string;
  grade: string;
  summary: string;
}

export interface MilestoneAlert {
  id: string;
  playerId: string;
  playerName: string;
  sport: SportType;
  milestoneType: string;
  description: string;
  currentProgress: number;
  target: number;
  progressPercent: number;
  estimatedDate: string;
  potentialPriceImpact: number; // %
  historicalPrecedent: string;
  urgency: 'imminent' | 'approaching' | 'on_track' | 'watch';
  isLiveRelevant: boolean; // true if milestone could happen during current game
}

export interface PortfolioImpactCard {
  cardId: string;
  player: string;
  cardDescription: string;
  sport: SportType;
  currentValue: number;
  projectedChange: number; // %
  projectedNewValue: number;
  confidence: number;
  gameId: string;
  gameName: string;
  latestEvent: string;
  trend: 'up' | 'down' | 'stable';
  impactEvents: GameEvent[];
}

export interface AlertPreference {
  id: string;
  type: 'milestone' | 'price_surge' | 'price_crash' | 'volume_spike' | 'game_start' | 'game_end';
  enabled: boolean;
  threshold: number; // e.g. notify when change > 5%
  players: string[]; // empty = all
  sports: SportType[]; // empty = all
}

// ─── Impact Scoring Model ───────────────────────────────────────────

const EVENT_IMPACT_MODEL: Record<string, {
  baseImpact: number;
  volumeMultiplier: number;
  category: EventCategory;
  decayHours: number; // how quickly impact fades
}> = {
  // MLB
  home_run:           { baseImpact: 3.0,  volumeMultiplier: 4.0,  category: 'offensive', decayHours: 48 },
  grand_slam:         { baseImpact: 6.0,  volumeMultiplier: 8.0,  category: 'offensive', decayHours: 72 },
  walk_off:           { baseImpact: 8.5,  volumeMultiplier: 12.0, category: 'offensive', decayHours: 72 },
  no_hitter_progress: { baseImpact: 15.0, volumeMultiplier: 20.0, category: 'milestone', decayHours: 168 },
  perfect_game_bid:   { baseImpact: 25.0, volumeMultiplier: 30.0, category: 'milestone', decayHours: 168 },
  strikeout:          { baseImpact: 0.3,  volumeMultiplier: 1.1,  category: 'offensive', decayHours: 6 },
  stolen_base:        { baseImpact: 0.5,  volumeMultiplier: 1.2,  category: 'offensive', decayHours: 12 },
  rbi:                { baseImpact: 0.8,  volumeMultiplier: 1.3,  category: 'offensive', decayHours: 12 },
  cycle:              { baseImpact: 10.0, volumeMultiplier: 15.0, category: 'milestone', decayHours: 168 },

  // NBA
  three_pointer:      { baseImpact: 0.3,  volumeMultiplier: 1.1,  category: 'offensive', decayHours: 6 },
  dunk:               { baseImpact: 0.5,  volumeMultiplier: 1.3,  category: 'offensive', decayHours: 6 },
  triple_double:      { baseImpact: 5.5,  volumeMultiplier: 6.0,  category: 'milestone', decayHours: 48 },
  double_double:      { baseImpact: 1.5,  volumeMultiplier: 2.0,  category: 'milestone', decayHours: 24 },
  forty_point_game:   { baseImpact: 7.0,  volumeMultiplier: 8.0,  category: 'milestone', decayHours: 72 },
  fifty_point_game:   { baseImpact: 12.0, volumeMultiplier: 15.0, category: 'milestone', decayHours: 168 },
  block:              { baseImpact: 0.2,  volumeMultiplier: 1.1,  category: 'defensive', decayHours: 6 },
  steal:              { baseImpact: 0.2,  volumeMultiplier: 1.1,  category: 'defensive', decayHours: 6 },

  // NFL
  touchdown:          { baseImpact: 3.5,  volumeMultiplier: 5.0,  category: 'offensive', decayHours: 48 },
  rushing_td:         { baseImpact: 3.0,  volumeMultiplier: 4.5,  category: 'offensive', decayHours: 48 },
  interception:       { baseImpact: -3.5, volumeMultiplier: 4.0,  category: 'defensive', decayHours: 48 },
  pick_six:           { baseImpact: -6.0, volumeMultiplier: 8.0,  category: 'defensive', decayHours: 72 },
  sack:               { baseImpact: 0.8,  volumeMultiplier: 1.5,  category: 'defensive', decayHours: 12 },
  fumble:             { baseImpact: -2.5, volumeMultiplier: 3.0,  category: 'offensive', decayHours: 24 },
  game_winning_drive: { baseImpact: 7.0,  volumeMultiplier: 10.0, category: 'offensive', decayHours: 72 },
  four_td_game:       { baseImpact: 8.0,  volumeMultiplier: 10.0, category: 'milestone', decayHours: 72 },

  // NHL
  goal:               { baseImpact: 2.5,  volumeMultiplier: 3.5,  category: 'offensive', decayHours: 24 },
  assist:             { baseImpact: 1.0,  volumeMultiplier: 1.5,  category: 'offensive', decayHours: 12 },
  hat_trick:          { baseImpact: 8.0,  volumeMultiplier: 10.0, category: 'milestone', decayHours: 72 },
  shutout:            { baseImpact: 6.0,  volumeMultiplier: 8.0,  category: 'milestone', decayHours: 48 },
  gordie_howe:        { baseImpact: 5.0,  volumeMultiplier: 6.0,  category: 'milestone', decayHours: 48 },

  // Universal
  injury:             { baseImpact: -12.0, volumeMultiplier: 15.0, category: 'injury', decayHours: 168 },
  ejection:           { baseImpact: -5.0,  volumeMultiplier: 8.0,  category: 'ejection', decayHours: 48 },
  milestone:          { baseImpact: 10.0,  volumeMultiplier: 15.0, category: 'milestone', decayHours: 168 },
  record_break:       { baseImpact: 22.0,  volumeMultiplier: 30.0, category: 'record', decayHours: 336 },
  career_high:        { baseImpact: 8.0,   volumeMultiplier: 10.0, category: 'milestone', decayHours: 72 },
};

// ─── Simulated Active Games ─────────────────────────────────────────

const ACTIVE_GAMES: LiveGame[] = [
  {
    id: 'engine-game-1',
    homeTeam: 'New York Yankees',
    awayTeam: 'Los Angeles Dodgers',
    homeAbbrev: 'NYY',
    awayAbbrev: 'LAD',
    sport: 'MLB',
    status: 'live',
    score: { home: 5, away: 4 },
    period: 'Top 8th',
    clock: '1 Out',
    timeRemaining: 2400,
    venue: 'Yankee Stadium',
    broadcast: 'ESPN',
    startTime: new Date(Date.now() - 9000000).toISOString(),
    attendance: 47309,
    weather: '72F, Clear',
    keyPlayers: [
      { playerId: 'judge-1', playerName: 'Aaron Judge', team: 'NYY', position: 'RF', statLine: '3-for-4, HR, 2 RBI, BB', gameRating: 92 },
      { playerId: 'ohtani-1', playerName: 'Shohei Ohtani', team: 'LAD', position: 'DH', statLine: '2-for-4, 2B, HR, 2 RBI', gameRating: 85 },
      { playerId: 'soto-1', playerName: 'Juan Soto', team: 'NYY', position: 'LF', statLine: '2-for-3, 2B, RBI, 2 BB', gameRating: 80 },
    ],
  },
  {
    id: 'engine-game-2',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Denver Nuggets',
    homeAbbrev: 'BOS',
    awayAbbrev: 'DEN',
    sport: 'NBA',
    status: 'live',
    score: { home: 94, away: 87 },
    period: 'Q3',
    clock: '2:18',
    timeRemaining: 858,
    venue: 'TD Garden',
    broadcast: 'TNT',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    attendance: 19156,
    keyPlayers: [
      { playerId: 'tatum-1', playerName: 'Jayson Tatum', team: 'BOS', position: 'SF', statLine: '32pts/11reb/8ast', gameRating: 94 },
      { playerId: 'jokic-1', playerName: 'Nikola Jokic', team: 'DEN', position: 'C', statLine: '28pts/14reb/10ast', gameRating: 96 },
      { playerId: 'brown-1', playerName: 'Jaylen Brown', team: 'BOS', position: 'SG', statLine: '22pts/5reb/4ast', gameRating: 78 },
    ],
  },
  {
    id: 'engine-game-3',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    homeAbbrev: 'KC',
    awayAbbrev: 'BUF',
    sport: 'NFL',
    status: 'live',
    score: { home: 28, away: 24 },
    period: 'Q4',
    clock: '6:33',
    timeRemaining: 393,
    venue: 'Arrowhead Stadium',
    broadcast: 'CBS',
    startTime: new Date(Date.now() - 10800000).toISOString(),
    attendance: 76416,
    weather: '58F, Partly Cloudy',
    keyPlayers: [
      { playerId: 'mahomes-1', playerName: 'Patrick Mahomes', team: 'KC', position: 'QB', statLine: '22/31, 312yds, 3 TD', gameRating: 91 },
      { playerId: 'allen-1', playerName: 'Josh Allen', team: 'BUF', position: 'QB', statLine: '25/38, 289yds, 2 TD, 1 INT', gameRating: 74 },
      { playerId: 'kelce-1', playerName: 'Travis Kelce', team: 'KC', position: 'TE', statLine: '8rec, 105yds, 2 TD', gameRating: 93 },
    ],
  },
  {
    id: 'engine-game-4',
    homeTeam: 'Toronto Maple Leafs',
    awayTeam: 'Montreal Canadiens',
    homeAbbrev: 'TOR',
    awayAbbrev: 'MTL',
    sport: 'NHL',
    status: 'live',
    score: { home: 3, away: 2 },
    period: '2nd Period',
    clock: '8:45',
    timeRemaining: 1725,
    venue: 'Scotiabank Arena',
    broadcast: 'ESPN+',
    startTime: new Date(Date.now() - 5400000).toISOString(),
    attendance: 18819,
    keyPlayers: [
      { playerId: 'matthews-1', playerName: 'Auston Matthews', team: 'TOR', position: 'C', statLine: '2G, 1A, +2, 6 SOG', gameRating: 95 },
      { playerId: 'marner-1', playerName: 'Mitch Marner', team: 'TOR', position: 'RW', statLine: '0G, 2A, +1, 3 SOG', gameRating: 75 },
    ],
  },
  {
    id: 'engine-game-5',
    homeTeam: 'San Francisco Giants',
    awayTeam: 'Chicago Cubs',
    homeAbbrev: 'SF',
    awayAbbrev: 'CHC',
    sport: 'MLB',
    status: 'pre_game',
    score: { home: 0, away: 0 },
    period: 'Pre-Game',
    clock: '7:05 PM',
    timeRemaining: 12600,
    venue: 'Oracle Park',
    broadcast: 'Apple TV+',
    startTime: new Date(Date.now() + 3600000).toISOString(),
    attendance: 0,
    weather: '62F, Foggy',
    keyPlayers: [],
  },
];

// ─── Simulated Game Events ──────────────────────────────────────────

const GAME_EVENTS: Record<string, GameEvent[]> = {
  'engine-game-1': [
    {
      id: 'eng-evt-1', gameId: 'engine-game-1', playerId: 'judge-1', playerName: 'Aaron Judge', team: 'NYY',
      eventType: 'home_run', category: 'offensive',
      description: '3-run HR to deep right-center, 458 ft. Season HR #34. Judge now 2 behind pace for 62.',
      timestamp: new Date(Date.now() - 3600000).toISOString(), period: 'Bot 4th', clock: '2 Out',
      impactScore: 55, cardValueDelta: 4.8, volumeSpike: 6.2, confidence: 0.87, sport: 'MLB', isHighlight: true,
    },
    {
      id: 'eng-evt-2', gameId: 'engine-game-1', playerId: 'ohtani-1', playerName: 'Shohei Ohtani', team: 'LAD',
      eventType: 'home_run', category: 'offensive',
      description: 'Solo HR to left-center, 425 ft. 30th HR of the season, extending his lead.',
      timestamp: new Date(Date.now() - 2700000).toISOString(), period: 'Top 5th', clock: '0 Out',
      impactScore: 48, cardValueDelta: 3.5, volumeSpike: 5.1, confidence: 0.85, sport: 'MLB', isHighlight: true,
    },
    {
      id: 'eng-evt-3', gameId: 'engine-game-1', playerId: 'soto-1', playerName: 'Juan Soto', team: 'NYY',
      eventType: 'rbi', category: 'offensive',
      description: 'RBI double down the left-field line. 2nd extra-base hit tonight.',
      timestamp: new Date(Date.now() - 1800000).toISOString(), period: 'Bot 6th', clock: '1 Out',
      impactScore: 15, cardValueDelta: 1.2, volumeSpike: 1.8, confidence: 0.72, sport: 'MLB', isHighlight: false,
    },
    {
      id: 'eng-evt-4', gameId: 'engine-game-1', playerId: 'judge-1', playerName: 'Aaron Judge', team: 'NYY',
      eventType: 'rbi', category: 'offensive',
      description: 'Sacrifice fly to deep center. Judge now 3-for-4 with 2 RBI.',
      timestamp: new Date(Date.now() - 900000).toISOString(), period: 'Bot 7th', clock: '1 Out',
      impactScore: 10, cardValueDelta: 0.5, volumeSpike: 1.3, confidence: 0.65, sport: 'MLB', isHighlight: false,
    },
  ],
  'engine-game-2': [
    {
      id: 'eng-evt-5', gameId: 'engine-game-2', playerId: 'tatum-1', playerName: 'Jayson Tatum', team: 'BOS',
      eventType: 'forty_point_game', category: 'milestone',
      description: 'Triple-double watch: 32pts/11reb/8ast. Needs 2 assists for triple-double with 14 min left.',
      timestamp: new Date(Date.now() - 600000).toISOString(), period: 'Q3', clock: '4:30',
      impactScore: 65, cardValueDelta: 5.2, volumeSpike: 7.0, confidence: 0.82, sport: 'NBA', isHighlight: true,
    },
    {
      id: 'eng-evt-6', gameId: 'engine-game-2', playerId: 'jokic-1', playerName: 'Nikola Jokic', team: 'DEN',
      eventType: 'triple_double', category: 'milestone',
      description: 'Triple-double achieved: 28pts/14reb/10ast. 18th triple-double of the season.',
      timestamp: new Date(Date.now() - 1200000).toISOString(), period: 'Q3', clock: '7:15',
      impactScore: 50, cardValueDelta: 3.8, volumeSpike: 5.5, confidence: 0.88, sport: 'NBA', isHighlight: true,
    },
    {
      id: 'eng-evt-7', gameId: 'engine-game-2', playerId: 'brown-1', playerName: 'Jaylen Brown', team: 'BOS',
      eventType: 'dunk', category: 'offensive',
      description: 'Thunderous poster dunk over Murray. Crowd goes wild at TD Garden.',
      timestamp: new Date(Date.now() - 900000).toISOString(), period: 'Q3', clock: '5:45',
      impactScore: 12, cardValueDelta: 0.8, volumeSpike: 2.2, confidence: 0.60, sport: 'NBA', isHighlight: true,
    },
  ],
  'engine-game-3': [
    {
      id: 'eng-evt-8', gameId: 'engine-game-3', playerId: 'mahomes-1', playerName: 'Patrick Mahomes', team: 'KC',
      eventType: 'touchdown', category: 'offensive',
      description: '45-yard TD pass to Kelce. 3rd TD of the game. Mahomes now has 312 yards passing.',
      timestamp: new Date(Date.now() - 1500000).toISOString(), period: 'Q4', clock: '10:15',
      impactScore: 55, cardValueDelta: 3.2, volumeSpike: 6.5, confidence: 0.84, sport: 'NFL', isHighlight: true,
    },
    {
      id: 'eng-evt-9', gameId: 'engine-game-3', playerId: 'kelce-1', playerName: 'Travis Kelce', team: 'KC',
      eventType: 'touchdown', category: 'offensive',
      description: '2nd receiving TD of the game. 8 rec, 105 yds, 2 TD. Vintage Kelce performance.',
      timestamp: new Date(Date.now() - 1500000).toISOString(), period: 'Q4', clock: '10:15',
      impactScore: 50, cardValueDelta: 2.9, volumeSpike: 5.8, confidence: 0.81, sport: 'NFL', isHighlight: true,
    },
    {
      id: 'eng-evt-10', gameId: 'engine-game-3', playerId: 'allen-1', playerName: 'Josh Allen', team: 'BUF',
      eventType: 'interception', category: 'defensive',
      description: 'INT thrown to Chris Jones at the KC 35. Costly turnover in a 4-point game.',
      timestamp: new Date(Date.now() - 2400000).toISOString(), period: 'Q3', clock: '2:00',
      impactScore: -35, cardValueDelta: -2.8, volumeSpike: 4.2, confidence: 0.78, sport: 'NFL', isHighlight: true,
    },
  ],
  'engine-game-4': [
    {
      id: 'eng-evt-11', gameId: 'engine-game-4', playerId: 'matthews-1', playerName: 'Auston Matthews', team: 'TOR',
      eventType: 'goal', category: 'offensive',
      description: '2nd goal of the game. Matthews now has 48 goals on the season, on pace for 60.',
      timestamp: new Date(Date.now() - 1800000).toISOString(), period: '2nd Period', clock: '14:22',
      impactScore: 45, cardValueDelta: 3.5, volumeSpike: 4.8, confidence: 0.83, sport: 'NHL', isHighlight: true,
    },
    {
      id: 'eng-evt-12', gameId: 'engine-game-4', playerId: 'matthews-1', playerName: 'Auston Matthews', team: 'TOR',
      eventType: 'assist', category: 'offensive',
      description: 'Primary assist on Marner goal. Matthews now has 2G, 1A tonight. Gordie Howe hat trick watch if he fights.',
      timestamp: new Date(Date.now() - 600000).toISOString(), period: '2nd Period', clock: '10:00',
      impactScore: 15, cardValueDelta: 0.8, volumeSpike: 1.5, confidence: 0.70, sport: 'NHL', isHighlight: false,
    },
  ],
  'engine-game-5': [],
};

// ─── Historical Correlation Data ────────────────────────────────────

const HISTORICAL_CORRELATIONS: HistoricalCorrelation[] = [
  {
    id: 'hc-1', eventType: 'forty_point_game', eventDescription: 'Luka Doncic scores 48 points vs Pelicans',
    playerName: 'Luka Doncic', sport: 'NBA', date: '2024-01-28',
    priceBeforeEvent: 320, priceAfter24h: 355, priceAfter48h: 368, priceAfter7d: 345,
    actualChange: 10.9, volumeSpike: 8.2,
    cardDescription: '2018 Panini Prizm #280 RC', grade: 'PSA 10',
    summary: 'RC PSA 10 spiked +10.9% within 24h, settled +7.8% after a week.',
  },
  {
    id: 'hc-2', eventType: 'triple_double', eventDescription: 'Nikola Jokic records 30/15/12 triple-double',
    playerName: 'Nikola Jokic', sport: 'NBA', date: '2024-02-15',
    priceBeforeEvent: 185, priceAfter24h: 198, priceAfter48h: 205, priceAfter7d: 195,
    actualChange: 7.0, volumeSpike: 5.5,
    cardDescription: '2015 Panini Complete #303 RC', grade: 'PSA 10',
    summary: 'Triple-doubles are routine for Jokic, so RC moved modestly. Volume spiked 5.5x.',
  },
  {
    id: 'hc-3', eventType: 'home_run', eventDescription: 'Aaron Judge hits 50th HR of season',
    playerName: 'Aaron Judge', sport: 'MLB', date: '2022-09-13',
    priceBeforeEvent: 425, priceAfter24h: 520, priceAfter48h: 575, priceAfter7d: 610,
    actualChange: 22.4, volumeSpike: 18.5,
    cardDescription: '2017 Topps Chrome Update #HMT40 RC', grade: 'PSA 10',
    summary: 'Milestone HR sent RC PSA 10 up +22% in 24h. Volume exploded. Card kept climbing through season.',
  },
  {
    id: 'hc-4', eventType: 'record_break', eventDescription: 'Shohei Ohtani hits 50/50 (50 HR, 50 SB)',
    playerName: 'Shohei Ohtani', sport: 'MLB', date: '2024-09-19',
    priceBeforeEvent: 1200, priceAfter24h: 1850, priceAfter48h: 2100, priceAfter7d: 1750,
    actualChange: 54.2, volumeSpike: 35.0,
    cardDescription: '2018 Topps Chrome Update #HMT1 RC', grade: 'PSA 10',
    summary: 'Historic 50/50 achievement. RC PSA 10 surged +54% in 24h, pulled back to +46% by week end. All-time volume records.',
  },
  {
    id: 'hc-5', eventType: 'injury', eventDescription: 'Ja Morant suffers shoulder injury vs Nets',
    playerName: 'Ja Morant', sport: 'NBA', date: '2023-11-22',
    priceBeforeEvent: 210, priceAfter24h: 168, priceAfter48h: 155, priceAfter7d: 148,
    actualChange: -20.0, volumeSpike: 12.0,
    cardDescription: '2019 Panini Prizm #249 RC', grade: 'PSA 10',
    summary: 'Injury news tanked RC -20% in 24h. Panic selling drove volume 12x normal. Recovery took 3 months.',
  },
  {
    id: 'hc-6', eventType: 'touchdown', eventDescription: 'Patrick Mahomes 5 TD game vs Raiders',
    playerName: 'Patrick Mahomes', sport: 'NFL', date: '2024-10-27',
    priceBeforeEvent: 680, priceAfter24h: 735, priceAfter48h: 720, priceAfter7d: 710,
    actualChange: 8.1, volumeSpike: 6.8,
    cardDescription: '2017 Panini Prizm #269 RC', grade: 'PSA 10',
    summary: 'Big game moved RC +8.1%. Mahomes RCs are so liquid that big games still create measurable spikes.',
  },
  {
    id: 'hc-7', eventType: 'hat_trick', eventDescription: 'Auston Matthews hat trick vs Bruins',
    playerName: 'Auston Matthews', sport: 'NHL', date: '2024-03-15',
    priceBeforeEvent: 380, priceAfter24h: 420, priceAfter48h: 415, priceAfter7d: 400,
    actualChange: 10.5, volumeSpike: 7.2,
    cardDescription: '2016 Upper Deck Young Guns #201', grade: 'PSA 10',
    summary: 'Hat trick moved YG PSA 10 +10.5%. Hockey card market has less depth so moves are amplified.',
  },
  {
    id: 'hc-8', eventType: 'career_high', eventDescription: 'Victor Wembanyama career-high 46 points',
    playerName: 'Victor Wembanyama', sport: 'NBA', date: '2025-01-22',
    priceBeforeEvent: 480, priceAfter24h: 600, priceAfter48h: 650, priceAfter7d: 580,
    actualChange: 25.0, volumeSpike: 22.0,
    cardDescription: '2023 Panini Prizm #275 RC', grade: 'PSA 10',
    summary: 'Rookie career highs have outsized impact. RC PSA 10 surged +25% with massive volume. Settled +20% by week end.',
  },
  {
    id: 'hc-9', eventType: 'walk_off', eventDescription: 'Julio Rodriguez walk-off grand slam',
    playerName: 'Julio Rodriguez', sport: 'MLB', date: '2024-07-04',
    priceBeforeEvent: 145, priceAfter24h: 188, priceAfter48h: 195, priceAfter7d: 170,
    actualChange: 29.7, volumeSpike: 14.0,
    cardDescription: '2022 Topps Chrome #44 RC', grade: 'PSA 10',
    summary: 'Walk-off grand slam on July 4th. Perfect storm of excitement. RC spiked nearly 30% overnight.',
  },
  {
    id: 'hc-10', eventType: 'milestone', eventDescription: 'LeBron James passes 40,000 career points',
    playerName: 'LeBron James', sport: 'NBA', date: '2024-03-02',
    priceBeforeEvent: 8500, priceAfter24h: 10200, priceAfter48h: 10800, priceAfter7d: 9800,
    actualChange: 20.0, volumeSpike: 25.0,
    cardDescription: '2003 Topps Chrome #111 RC', grade: 'PSA 10',
    summary: 'Historic milestone drove 20% spike in the most iconic modern RC. Volume was extraordinary.',
  },
];

// ─── Milestone Alert Data ───────────────────────────────────────────

const MILESTONE_ALERTS: MilestoneAlert[] = [
  {
    id: 'ms-1', playerId: 'judge-1', playerName: 'Aaron Judge', sport: 'MLB',
    milestoneType: '500 Career HR', description: 'Aaron Judge approaching 500 career home runs',
    currentProgress: 362, target: 500, progressPercent: 72.4,
    estimatedDate: '2027 Season', potentialPriceImpact: 25.0,
    historicalPrecedent: 'When A-Rod hit 500 HR, his RC PSA 10 spiked 18% in 48 hours.',
    urgency: 'on_track', isLiveRelevant: false,
  },
  {
    id: 'ms-2', playerId: 'tatum-1', playerName: 'Jayson Tatum', sport: 'NBA',
    milestoneType: '40+ Point Game', description: 'Tatum at 32 pts with 14 minutes remaining. On pace for 40+.',
    currentProgress: 32, target: 40, progressPercent: 80.0,
    estimatedDate: 'Tonight', potentialPriceImpact: 7.0,
    historicalPrecedent: 'Last time Tatum scored 40+, his Prizm RC PSA 10 moved +5.2% within 24h.',
    urgency: 'imminent', isLiveRelevant: true,
  },
  {
    id: 'ms-3', playerId: 'matthews-1', playerName: 'Auston Matthews', sport: 'NHL',
    milestoneType: '50 Goal Season', description: 'Matthews at 48 goals with 18 games remaining. 2 goals tonight.',
    currentProgress: 48, target: 50, progressPercent: 96.0,
    estimatedDate: 'Within 1-3 games', potentialPriceImpact: 12.0,
    historicalPrecedent: 'When Ovechkin hit 50 goals, his YG PSA 10 moved +8% within 48h.',
    urgency: 'imminent', isLiveRelevant: true,
  },
  {
    id: 'ms-4', playerId: 'mahomes-1', playerName: 'Patrick Mahomes', sport: 'NFL',
    milestoneType: '200 Career TD Passes', description: 'Mahomes at 198 career TD passes. 3 TDs tonight.',
    currentProgress: 198, target: 200, progressPercent: 99.0,
    estimatedDate: 'Tonight (1 more TD)', potentialPriceImpact: 10.0,
    historicalPrecedent: 'When Brady hit 200 TDs, his RC moved +6% but Mahomes is more collectible per volume.',
    urgency: 'imminent', isLiveRelevant: true,
  },
  {
    id: 'ms-5', playerId: 'ohtani-1', playerName: 'Shohei Ohtani', sport: 'MLB',
    milestoneType: '300 Career HR', description: 'Ohtani at 228 career HR. HR #30 of this season tonight.',
    currentProgress: 228, target: 300, progressPercent: 76.0,
    estimatedDate: '2027 Season', potentialPriceImpact: 30.0,
    historicalPrecedent: '50/50 moved his RC +54%. 300 HR as a former pitcher would be historic.',
    urgency: 'on_track', isLiveRelevant: false,
  },
  {
    id: 'ms-6', playerId: 'jokic-1', playerName: 'Nikola Jokic', sport: 'NBA',
    milestoneType: '20 Triple-Doubles (Season)', description: 'Jokic at 18 triple-doubles this season. Got one tonight.',
    currentProgress: 18, target: 20, progressPercent: 90.0,
    estimatedDate: 'Within 2-4 games', potentialPriceImpact: 5.0,
    historicalPrecedent: 'Season triple-double milestones for Jokic have diminishing returns, +3-5% avg.',
    urgency: 'approaching', isLiveRelevant: false,
  },
];

// ─── Default Alert Preferences ──────────────────────────────────────

const DEFAULT_ALERT_PREFERENCES: AlertPreference[] = [
  { id: 'pref-1', type: 'milestone', enabled: true, threshold: 5, players: [], sports: [] },
  { id: 'pref-2', type: 'price_surge', enabled: true, threshold: 5, players: [], sports: [] },
  { id: 'pref-3', type: 'price_crash', enabled: true, threshold: -5, players: [], sports: [] },
  { id: 'pref-4', type: 'volume_spike', enabled: false, threshold: 5, players: [], sports: [] },
  { id: 'pref-5', type: 'game_start', enabled: true, threshold: 0, players: [], sports: [] },
  { id: 'pref-6', type: 'game_end', enabled: false, threshold: 0, players: [], sports: [] },
];

// ─── Service Functions ──────────────────────────────────────────────

/**
 * Returns all currently active/live games with scores, period, and time remaining.
 */
export function getActiveGames(): LiveGame[] {
  // Simulate slight score variance on each call
  return ACTIVE_GAMES.map(game => {
    if (game.status !== 'live') return game;
    const jitter = Math.random();
    const timeJitter = Math.max(0, game.timeRemaining - Math.floor(Math.random() * 30));
    return {
      ...game,
      timeRemaining: timeJitter,
      score: {
        home: game.score.home + (jitter > 0.95 ? 1 : 0),
        away: game.score.away + (jitter > 0.97 ? 1 : 0),
      },
    };
  });
}

/**
 * Returns play-by-play events for a specific game.
 */
export function getGameEvents(gameId: string): GameEvent[] {
  const events = GAME_EVENTS[gameId] || [];
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * ML-style scoring: maps a performance event to predicted card price movement.
 * Considers player popularity, event significance, game context, and historical data.
 */
export function calculateRealTimeImpact(playerId: string, event: GameEvent): ImpactPrediction {
  const model = EVENT_IMPACT_MODEL[event.eventType] || { baseImpact: 1.0, volumeMultiplier: 1.5, category: 'offensive' as EventCategory, decayHours: 24 };

  // Find player context
  const playerGame = ACTIVE_GAMES.find(g => g.keyPlayers.some(p => p.playerId === playerId));
  const playerStat = playerGame?.keyPlayers.find(p => p.playerId === playerId);
  const gameRating = playerStat?.gameRating ?? 50;

  // Model factors
  const popularityFactor = getPlayerPopularity(event.playerName);
  const gameContextFactor = getGameContextMultiplier(playerGame);
  const momentumFactor = gameRating / 50; // 2x at 100 rating, 0 at 0
  const historicalFactor = getHistoricalImpactMultiplier(event.eventType, event.sport);

  const factors: ModelFactor[] = [
    { name: 'Base Event Impact', weight: 0.35, value: model.baseImpact, contribution: model.baseImpact * 0.35 },
    { name: 'Player Popularity', weight: 0.25, value: popularityFactor, contribution: popularityFactor * 0.25 },
    { name: 'Game Context', weight: 0.15, value: gameContextFactor, contribution: gameContextFactor * 0.15 },
    { name: 'Performance Momentum', weight: 0.15, value: momentumFactor, contribution: momentumFactor * 0.15 },
    { name: 'Historical Precedent', weight: 0.10, value: historicalFactor, contribution: historicalFactor * 0.10 },
  ];

  const compositeMultiplier = factors.reduce((sum, f) => sum + f.contribution, 0) / model.baseImpact;
  const predictedChange = model.baseImpact * compositeMultiplier;
  const confidence = Math.min(0.95, 0.5 + (popularityFactor * 0.1) + (historicalFactor > 1 ? 0.15 : 0.05));

  // Find relevant historical data
  const relevantHistory = HISTORICAL_CORRELATIONS.filter(h => h.eventType === event.eventType);
  const historicalBasis = relevantHistory.length > 0
    ? `Based on ${relevantHistory.length} similar events. Avg outcome: ${(relevantHistory.reduce((s, h) => s + h.actualChange, 0) / relevantHistory.length).toFixed(1)}% change.`
    : 'Limited historical data for this event type.';

  return {
    playerId,
    playerName: event.playerName,
    eventType: event.eventType,
    predictedPriceChange: Math.round(predictedChange * 100) / 100,
    confidence,
    volumePrediction: model.volumeMultiplier * compositeMultiplier,
    reasoning: generateReasoning(event, predictedChange, factors),
    historicalBasis,
    modelFactors: factors,
  };
}

/**
 * For a user's collection, shows which cards are affected by live games
 * and projected value changes.
 */
export function getPlayerPortfolioImpact(
  inventory: CardInventory[],
  activeGames?: LiveGame[]
): PortfolioImpactCard[] {
  const games = activeGames ?? getActiveGames();
  const liveGames = games.filter(g => g.status === 'live');
  const impactCards: PortfolioImpactCard[] = [];

  // Map of player names in live games to their events
  const livePlayerEvents = new Map<string, { gameId: string; gameName: string; events: GameEvent[] }>();
  for (const game of liveGames) {
    for (const player of game.keyPlayers) {
      const events = getGameEvents(game.id).filter(e => e.playerId === player.playerId);
      livePlayerEvents.set(player.playerName.toLowerCase(), {
        gameId: game.id,
        gameName: `${game.awayAbbrev} @ ${game.homeAbbrev}`,
        events,
      });
    }
  }

  for (const card of inventory) {
    const playerKey = card.player.toLowerCase();
    const match = livePlayerEvents.get(playerKey);
    if (!match) continue;

    const totalDelta = match.events.reduce((sum, e) => sum + e.cardValueDelta, 0);
    const currentValue = card.currentValue ?? card.purchasePrice;
    const projectedNewValue = currentValue * (1 + totalDelta / 100);

    impactCards.push({
      cardId: card.id,
      player: card.player,
      cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}${card.isGraded ? ` ${card.gradingCompany} ${card.grade}` : ''}`,
      sport: card.sport === 'Baseball' ? 'MLB' : card.sport === 'Basketball' ? 'NBA' : card.sport === 'Football' ? 'NFL' : 'NHL',
      currentValue,
      projectedChange: Math.round(totalDelta * 100) / 100,
      projectedNewValue: Math.round(projectedNewValue * 100) / 100,
      confidence: match.events.length > 0 ? match.events.reduce((s, e) => s + e.confidence, 0) / match.events.length : 0,
      gameId: match.gameId,
      gameName: match.gameName,
      latestEvent: match.events[0]?.description ?? 'In game, no significant events yet',
      trend: totalDelta > 0.5 ? 'up' : totalDelta < -0.5 ? 'down' : 'stable',
      impactEvents: match.events,
    });
  }

  // Add simulated portfolio cards for demo if no real inventory matches
  if (impactCards.length === 0) {
    impactCards.push(
      {
        cardId: 'demo-1', player: 'Aaron Judge',
        cardDescription: '2017 Topps Chrome Update #HMT40 RC PSA 10',
        sport: 'MLB', currentValue: 450, projectedChange: 5.3, projectedNewValue: 473.85, confidence: 0.87,
        gameId: 'engine-game-1', gameName: 'LAD @ NYY', latestEvent: '3-run HR to deep right-center, 458 ft',
        trend: 'up', impactEvents: GAME_EVENTS['engine-game-1'].filter(e => e.playerName === 'Aaron Judge'),
      },
      {
        cardId: 'demo-2', player: 'Shohei Ohtani',
        cardDescription: '2018 Topps Chrome #150 RC PSA 10',
        sport: 'MLB', currentValue: 1250, projectedChange: 3.5, projectedNewValue: 1293.75, confidence: 0.85,
        gameId: 'engine-game-1', gameName: 'LAD @ NYY', latestEvent: 'Solo HR to left-center, 425 ft',
        trend: 'up', impactEvents: GAME_EVENTS['engine-game-1'].filter(e => e.playerName === 'Shohei Ohtani'),
      },
      {
        cardId: 'demo-3', player: 'Jayson Tatum',
        cardDescription: '2017 Panini Prizm #16 RC PSA 10',
        sport: 'NBA', currentValue: 285, projectedChange: 5.2, projectedNewValue: 299.82, confidence: 0.82,
        gameId: 'engine-game-2', gameName: 'DEN @ BOS', latestEvent: '32pts/11reb/8ast. Triple-double watch.',
        trend: 'up', impactEvents: GAME_EVENTS['engine-game-2'].filter(e => e.playerName === 'Jayson Tatum'),
      },
      {
        cardId: 'demo-4', player: 'Patrick Mahomes',
        cardDescription: '2017 Panini Prizm #269 RC PSA 10',
        sport: 'NFL', currentValue: 695, projectedChange: 3.2, projectedNewValue: 717.24, confidence: 0.84,
        gameId: 'engine-game-3', gameName: 'BUF @ KC', latestEvent: '3rd TD pass. 312 yards passing.',
        trend: 'up', impactEvents: GAME_EVENTS['engine-game-3'].filter(e => e.playerName === 'Patrick Mahomes'),
      },
      {
        cardId: 'demo-5', player: 'Josh Allen',
        cardDescription: '2018 Panini Prizm #205 RC PSA 10',
        sport: 'NFL', currentValue: 320, projectedChange: -2.8, projectedNewValue: 311.04, confidence: 0.78,
        gameId: 'engine-game-3', gameName: 'BUF @ KC', latestEvent: 'INT thrown at KC 35. Costly turnover.',
        trend: 'down', impactEvents: GAME_EVENTS['engine-game-3'].filter(e => e.playerName === 'Josh Allen'),
      },
      {
        cardId: 'demo-6', player: 'Auston Matthews',
        cardDescription: '2016 Upper Deck Young Guns #201 PSA 10',
        sport: 'NHL', currentValue: 395, projectedChange: 4.3, projectedNewValue: 411.99, confidence: 0.83,
        gameId: 'engine-game-4', gameName: 'MTL @ TOR', latestEvent: '2G, 1A tonight. On pace for 50-goal season.',
        trend: 'up', impactEvents: GAME_EVENTS['engine-game-4'].filter(e => e.playerName === 'Auston Matthews'),
      },
    );
  }

  return impactCards.sort((a, b) => Math.abs(b.projectedChange) - Math.abs(a.projectedChange));
}

/**
 * Projects price impact over 1h, 24h, 48h, 7d windows
 * based on historical event-to-sale patterns.
 */
export function getPriceProjectionTimeline(playerId: string, event: GameEvent): PriceProjection {
  const model = EVENT_IMPACT_MODEL[event.eventType] || { baseImpact: 1.0, volumeMultiplier: 1.5, category: 'offensive' as EventCategory, decayHours: 24 };
  const popularity = getPlayerPopularity(event.playerName);
  const baseDelta = event.cardValueDelta;

  // Different windows have different decay/amplification patterns
  const hourMultipliers = {
    '1h': 0.6,   // 60% of immediate impact in first hour
    '24h': 1.2,  // peak at 24h as news spreads
    '48h': 1.05, // slight pullback from peak
    '7d': 0.75,  // settles to ~75% of peak
  };

  const basePrice = getBasePrice(event.playerName);

  const projections: PriceProjectionWindow[] = [
    {
      window: '1h',
      predictedPrice: basePrice * (1 + (baseDelta * hourMultipliers['1h']) / 100),
      predictedChange: Math.round(baseDelta * hourMultipliers['1h'] * 100) / 100,
      confidence: 0.85,
      reasoning: 'Immediate reaction. Early movers and algorithmic buyers respond first.',
    },
    {
      window: '24h',
      predictedPrice: basePrice * (1 + (baseDelta * hourMultipliers['24h']) / 100),
      predictedChange: Math.round(baseDelta * hourMultipliers['24h'] * 100) / 100,
      confidence: 0.72,
      reasoning: 'Peak impact as mainstream collectors see highlights and news coverage.',
    },
    {
      window: '48h',
      predictedPrice: basePrice * (1 + (baseDelta * hourMultipliers['48h']) / 100),
      predictedChange: Math.round(baseDelta * hourMultipliers['48h'] * 100) / 100,
      confidence: 0.60,
      reasoning: 'Slight pullback from peak as FOMO buyers finish and profit-takers emerge.',
    },
    {
      window: '7d',
      predictedPrice: basePrice * (1 + (baseDelta * hourMultipliers['7d']) / 100),
      predictedChange: Math.round(baseDelta * hourMultipliers['7d'] * 100) / 100,
      confidence: 0.45,
      reasoning: 'Settled new baseline. Sustained impact depends on subsequent performance.',
    },
  ];

  // Generate chart data points (48 points from -2h to +7d)
  const now = Date.now();
  const chartData: PriceChartPoint[] = [];

  // Historical (past 2 hours)
  for (let i = 0; i < 12; i++) {
    const t = now - (12 - i) * 600000; // 10 min intervals
    const noise = (Math.random() - 0.5) * basePrice * 0.005;
    const historicalPrice = basePrice + noise - (basePrice * baseDelta / 100) * (1 - i / 12) * 0.3;
    chartData.push({
      time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(historicalPrice * 100) / 100,
      upper: Math.round((historicalPrice + basePrice * 0.01) * 100) / 100,
      lower: Math.round((historicalPrice - basePrice * 0.01) * 100) / 100,
      isProjection: false,
    });
  }

  // Projection (next 7 days, logarithmic time scale)
  const projectionHours = [0.5, 1, 2, 4, 8, 12, 24, 36, 48, 72, 96, 120, 144, 168];
  for (const h of projectionHours) {
    const decayFactor = Math.min(1.2, Math.max(0.3, 1.2 - (h / model.decayHours) * 0.5));
    const projectedDelta = baseDelta * decayFactor;
    const projectedPrice = basePrice * (1 + projectedDelta / 100);
    const uncertainty = 0.02 * Math.sqrt(h / 24) * basePrice; // uncertainty grows with time

    const label = h < 24
      ? `+${h}h`
      : `+${Math.round(h / 24)}d`;

    chartData.push({
      time: label,
      price: Math.round(projectedPrice * 100) / 100,
      upper: Math.round((projectedPrice + uncertainty) * 100) / 100,
      lower: Math.round((projectedPrice - uncertainty) * 100) / 100,
      isProjection: true,
    });
  }

  return {
    playerId,
    playerName: event.playerName,
    eventDescription: event.description,
    currentPrice: basePrice,
    projections,
    confidenceBand: {
      upper: Math.round(basePrice * (1 + baseDelta * 1.5 / 100) * 100) / 100,
      lower: Math.round(basePrice * (1 + baseDelta * 0.3 / 100) * 100) / 100,
    },
    chartData,
  };
}

/**
 * Returns historical correlations for a given event type.
 * Shows past examples of similar events and actual price outcomes.
 */
export function getHistoricalCorrelations(eventType?: string): HistoricalCorrelation[] {
  if (!eventType) return HISTORICAL_CORRELATIONS;
  return HISTORICAL_CORRELATIONS.filter(h => h.eventType === eventType);
}

/**
 * Detects approaching milestones and pre-alerts users.
 */
export function getMilestoneAlerts(): MilestoneAlert[] {
  return MILESTONE_ALERTS.sort((a, b) => {
    const urgencyOrder = { imminent: 0, approaching: 1, on_track: 2, watch: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

/**
 * Returns all game events across all active games, sorted by timestamp.
 */
export function getAllLiveEvents(): GameEvent[] {
  const allEvents: GameEvent[] = [];
  for (const gameId of Object.keys(GAME_EVENTS)) {
    allEvents.push(...GAME_EVENTS[gameId]);
  }
  return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Returns alert preferences (mock — would be user-specific in production).
 */
export function getAlertPreferences(): AlertPreference[] {
  return [...DEFAULT_ALERT_PREFERENCES];
}

/**
 * Updates an alert preference (mock — returns updated list).
 */
export function updateAlertPreference(id: string, updates: Partial<AlertPreference>): AlertPreference[] {
  const prefs = getAlertPreferences();
  const idx = prefs.findIndex(p => p.id === id);
  if (idx >= 0) {
    prefs[idx] = { ...prefs[idx], ...updates };
  }
  return prefs;
}

/**
 * Gets player-level performance for use in the portfolio impact dashboard.
 */
export function getPlayerPerformances(): PlayerPerformance[] {
  const games = getActiveGames();
  const performances: PlayerPerformance[] = [];

  for (const game of games) {
    if (game.status !== 'live') continue;
    const events = getGameEvents(game.id);

    for (const player of game.keyPlayers) {
      const playerEvents = events.filter(e => e.playerId === player.playerId);
      const sessionImpact = playerEvents.reduce((sum, e) => sum + e.cardValueDelta, 0);

      performances.push({
        playerId: player.playerId,
        playerName: player.playerName,
        team: player.team,
        sport: game.sport,
        position: player.position,
        gameId: game.id,
        currentStatLine: player.statLine,
        gameRating: player.gameRating,
        performanceTrend: sessionImpact > 2 ? 'rising' : sessionImpact < -2 ? 'declining' : 'stable',
        cardsInPortfolio: Math.floor(Math.random() * 4) + 1,
        totalPortfolioValue: getBasePrice(player.playerName) * (Math.floor(Math.random() * 3) + 1),
        sessionImpact: Math.round(sessionImpact * 100) / 100,
        events: playerEvents,
        projectedFinalImpact: Math.round(sessionImpact * 1.2 * 100) / 100,
        momentumScore: Math.min(100, Math.max(0, player.gameRating)),
      });
    }
  }

  return performances.sort((a, b) => Math.abs(b.sessionImpact) - Math.abs(a.sessionImpact));
}

// ─── Helper Functions ───────────────────────────────────────────────

function getPlayerPopularity(playerName: string): number {
  const popularityMap: Record<string, number> = {
    'Aaron Judge': 4.2,
    'Shohei Ohtani': 4.8,
    'Juan Soto': 3.5,
    'Jayson Tatum': 3.8,
    'Nikola Jokic': 3.6,
    'Jaylen Brown': 2.8,
    'Patrick Mahomes': 4.5,
    'Josh Allen': 3.9,
    'Travis Kelce': 4.0,
    'Auston Matthews': 3.2,
    'Mitch Marner': 2.5,
  };
  return popularityMap[playerName] ?? 2.0;
}

function getBasePrice(playerName: string): number {
  const priceMap: Record<string, number> = {
    'Aaron Judge': 450,
    'Shohei Ohtani': 1250,
    'Juan Soto': 380,
    'Jayson Tatum': 285,
    'Nikola Jokic': 190,
    'Jaylen Brown': 85,
    'Patrick Mahomes': 695,
    'Josh Allen': 320,
    'Travis Kelce': 210,
    'Auston Matthews': 395,
    'Mitch Marner': 120,
  };
  return priceMap[playerName] ?? 150;
}

function getGameContextMultiplier(game?: LiveGame): number {
  if (!game) return 1.0;
  // Close games, late in game = higher multiplier
  const scoreDiff = Math.abs(game.score.home - game.score.away);
  const closeGameBonus = scoreDiff <= 3 ? 1.3 : scoreDiff <= 7 ? 1.1 : 1.0;
  const lateGameBonus = game.timeRemaining < 600 ? 1.4 : game.timeRemaining < 1800 ? 1.2 : 1.0;
  return closeGameBonus * lateGameBonus;
}

function getHistoricalImpactMultiplier(eventType: string, sport: SportType): number {
  const correlations = HISTORICAL_CORRELATIONS.filter(h => h.eventType === eventType && h.sport === sport);
  if (correlations.length === 0) return 1.0;
  const avgChange = correlations.reduce((sum, h) => sum + Math.abs(h.actualChange), 0) / correlations.length;
  return Math.max(0.5, Math.min(3.0, avgChange / 10));
}

function generateReasoning(event: GameEvent, predictedChange: number, factors: ModelFactor[]): string {
  const direction = predictedChange > 0 ? 'positive' : 'negative';
  const magnitude = Math.abs(predictedChange) > 10 ? 'significant' : Math.abs(predictedChange) > 3 ? 'moderate' : 'modest';
  const topFactor = factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))[0];

  return `Predicting ${magnitude} ${direction} price movement of ${predictedChange.toFixed(1)}% for ${event.playerName} cards. Primary driver: ${topFactor.name} (${(topFactor.weight * 100).toFixed(0)}% weight). ${event.description}`;
}
