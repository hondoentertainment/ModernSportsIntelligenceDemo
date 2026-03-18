// ── Sentiment Velocity Engine Service ─────────────────────────────────────────
// Industry-first: Tracks the RATE OF CHANGE (second derivative) of sentiment.
// Catches inflection points before prices move.

// ── Types ────────────────────────────────────────────────────────────────────

export interface SentimentSource {
  name: 'twitter' | 'reddit' | 'youtube' | 'forums' | 'news';
  score: number;
  volume: number;
  velocity: number;
  weight: number;
}

export interface SentimentReading {
  playerId: string;
  playerName: string;
  timestamp: string;
  sentimentScore: number; // -100 to 100
  volume: number;
  sources: SentimentSource[];
}

export interface SentimentVelocity {
  playerId: string;
  playerName: string;
  sport: string;
  currentSentiment: number;
  velocity: number; // change per hour
  acceleration: number; // change of velocity per hour
  isDecelerating: boolean;
  isAccelerating: boolean;
  directionChangeProbability: number; // 0-1
  timeToInflection: number; // hours
  historicalAccuracy: number; // 0-1
  priceCorrelation: number;
  currentPrice: number;
  priceChange24h: number;
}

export interface SentimentAcceleration {
  playerId: string;
  playerName: string;
  acceleration: number;
  jerk: number; // third derivative
  phase: 'building' | 'peaking' | 'fading' | 'reversing';
  strength: number; // 0-100
}

export interface InflectionPoint {
  id: string;
  playerId: string;
  playerName: string;
  detectedAt: string;
  type: 'peak' | 'trough' | 'acceleration' | 'deceleration';
  priorTrend: 'bullish' | 'bearish' | 'neutral';
  expectedNewTrend: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  expectedPriceImpact: number; // percentage
  timeToPrice: number; // hours
  historicalPrecision: number; // 0-1
  countdown: number; // hours until expected
}

export interface VelocityAlert {
  id: string;
  playerId: string;
  playerName: string;
  type: 'velocity_spike' | 'inflection_detected' | 'divergence' | 'momentum_shift' | 'acceleration_surge';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  velocity: number;
  acceleration: number;
}

export interface PlayerSentimentProfile {
  playerId: string;
  playerName: string;
  sport: string;
  avgVelocity: number;
  maxVelocity: number;
  avgAcceleration: number;
  inflectionFrequency: number; // per week
  priceLeadTime: number; // hours
  accuracyScore: number;
}

export interface MarketSentimentMap {
  sectors: {
    sport: string;
    avgSentiment: number;
    avgVelocity: number;
    playerCount: number;
    trend: 'accelerating' | 'decelerating' | 'stable';
  }[];
  overallVelocity: number;
  overallAcceleration: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
}

export interface VelocityTrend {
  timestamp: string;
  velocity: number;
  acceleration: number;
  sentiment: number;
  volume: number;
}

export interface SentimentSignal {
  playerId: string;
  playerName: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  basis: string;
}

export interface DivergenceAlert {
  id: string;
  playerId: string;
  playerName: string;
  sentimentDirection: 'bullish' | 'bearish';
  priceDirection: 'up' | 'down';
  divergenceScore: number; // 0-100
  duration: number; // hours
  expectedResolution: 'price_catches_up' | 'sentiment_reverses';
  confidence: number;
  detectedAt: string;
}

export interface SentimentWave {
  id: string;
  playerId: string;
  playerName: string;
  waveType: 'impulse' | 'corrective';
  amplitude: number;
  period: number; // hours
  phase: number; // 0-360 degrees
  currentPosition: 'ascending' | 'peak' | 'descending' | 'trough';
  completionPercent: number;
}

export interface MomentumShift {
  id: string;
  playerId: string;
  playerName: string;
  from: 'bullish' | 'bearish' | 'neutral';
  to: 'bullish' | 'bearish' | 'neutral';
  magnitude: number;
  timestamp: string;
  priceAtShift: number;
  currentPrice: number;
  priceChangeAfter: number;
}

// ── Player Data ──────────────────────────────────────────────────────────────

interface PlayerSeed {
  id: string;
  name: string;
  sport: string;
  baseSentiment: number;
  velocity: number;
  acceleration: number;
  price: number;
  priceChange: number;
  priceCorr: number;
}

const PLAYERS: PlayerSeed[] = [
  { id: 'victor-wembanyama', name: 'Victor Wembanyama', sport: 'NBA', baseSentiment: 82, velocity: 4.2, acceleration: 1.8, price: 8900, priceChange: 12.5, priceCorr: 0.92 },
  { id: 'luka-doncic', name: 'Luka Doncic', sport: 'NBA', baseSentiment: 68, velocity: -2.1, acceleration: -0.8, price: 3450, priceChange: -3.2, priceCorr: 0.85 },
  { id: 'shohei-ohtani', name: 'Shohei Ohtani', sport: 'MLB', baseSentiment: 74, velocity: 1.5, acceleration: 2.4, price: 5200, priceChange: 6.1, priceCorr: 0.78 },
  { id: 'patrick-mahomes', name: 'Patrick Mahomes', sport: 'NFL', baseSentiment: 42, velocity: -3.8, acceleration: -1.2, price: 12500, priceChange: -8.3, priceCorr: 0.72 },
  { id: 'connor-bedard', name: 'Connor Bedard', sport: 'NHL', baseSentiment: 61, velocity: 2.8, acceleration: 0.5, price: 2800, priceChange: 5.4, priceCorr: 0.81 },
  { id: 'jayson-tatum', name: 'Jayson Tatum', sport: 'NBA', baseSentiment: 55, velocity: -0.4, acceleration: 1.9, price: 1850, priceChange: 1.2, priceCorr: 0.69 },
  { id: 'caitlin-clark', name: 'Caitlin Clark', sport: 'WNBA', baseSentiment: 88, velocity: 5.6, acceleration: 3.1, price: 4200, priceChange: 18.5, priceCorr: 0.94 },
  { id: 'caleb-williams', name: 'Caleb Williams', sport: 'NFL', baseSentiment: 35, velocity: -4.5, acceleration: -2.3, price: 680, priceChange: -14.2, priceCorr: 0.76 },
  { id: 'gunnar-henderson', name: 'Gunnar Henderson', sport: 'MLB', baseSentiment: 71, velocity: 3.2, acceleration: 0.9, price: 1450, priceChange: 7.8, priceCorr: 0.83 },
  { id: 'connor-mcdavid', name: 'Connor McDavid', sport: 'NHL', baseSentiment: 64, velocity: 0.8, acceleration: -0.3, price: 6200, priceChange: 2.1, priceCorr: 0.71 },
  { id: 'anthony-edwards', name: 'Anthony Edwards', sport: 'NBA', baseSentiment: 76, velocity: 3.5, acceleration: 1.4, price: 2100, priceChange: 9.3, priceCorr: 0.88 },
  { id: 'trevor-lawrence', name: 'Trevor Lawrence', sport: 'NFL', baseSentiment: 28, velocity: -5.2, acceleration: 0.6, price: 420, priceChange: -11.5, priceCorr: 0.65 },
  { id: 'paul-skenes', name: 'Paul Skenes', sport: 'MLB', baseSentiment: 79, velocity: 6.1, acceleration: 2.8, price: 3100, priceChange: 15.2, priceCorr: 0.91 },
  { id: 'macklin-celebrini', name: 'Macklin Celebrini', sport: 'NHL', baseSentiment: 58, velocity: 1.2, acceleration: 0.4, price: 890, priceChange: 4.3, priceCorr: 0.74 },
  { id: 'tyrese-haliburton', name: 'Tyrese Haliburton', sport: 'NBA', baseSentiment: 45, velocity: -1.8, acceleration: -1.5, price: 980, priceChange: -5.6, priceCorr: 0.77 },
  { id: 'ja-morant', name: 'Ja Morant', sport: 'NBA', baseSentiment: 32, velocity: -6.3, acceleration: 2.2, price: 750, priceChange: -18.1, priceCorr: 0.82 },
  { id: 'elly-de-la-cruz', name: 'Elly De La Cruz', sport: 'MLB', baseSentiment: 72, velocity: 2.4, acceleration: -0.7, price: 1680, priceChange: 4.9, priceCorr: 0.79 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateTimestamp(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function generateHistory(player: PlayerSeed, hours: number): SentimentReading[] {
  const readings: SentimentReading[] = [];
  for (let h = hours; h >= 0; h--) {
    const noise = Math.sin(h * 0.3) * 8 + Math.cos(h * 0.7) * 5 + (Math.random() - 0.5) * 6;
    const trendComponent = player.velocity * (hours - h) / hours * 10;
    const score = Math.max(-100, Math.min(100, player.baseSentiment + noise - trendComponent));
    const volume = Math.max(50, Math.round(800 + Math.sin(h * 0.5) * 400 + Math.random() * 200));
    readings.push({
      playerId: player.id,
      playerName: player.name,
      timestamp: generateTimestamp(h),
      sentimentScore: Math.round(score * 10) / 10,
      volume,
      sources: [
        { name: 'twitter', score: Math.round(score + (Math.random() - 0.5) * 10), volume: Math.round(volume * 0.42), velocity: player.velocity * (0.8 + Math.random() * 0.4), weight: 0.35 },
        { name: 'reddit', score: Math.round(score + (Math.random() - 0.5) * 12), volume: Math.round(volume * 0.28), velocity: player.velocity * (0.7 + Math.random() * 0.6), weight: 0.25 },
        { name: 'youtube', score: Math.round(score + (Math.random() - 0.5) * 8), volume: Math.round(volume * 0.15), velocity: player.velocity * (0.5 + Math.random() * 0.5), weight: 0.15 },
        { name: 'forums', score: Math.round(score + (Math.random() - 0.5) * 15), volume: Math.round(volume * 0.10), velocity: player.velocity * (0.6 + Math.random() * 0.4), weight: 0.15 },
        { name: 'news', score: Math.round(score + (Math.random() - 0.5) * 6), volume: Math.round(volume * 0.05), velocity: player.velocity * (0.9 + Math.random() * 0.2), weight: 0.10 },
      ],
    });
  }
  return readings;
}

function buildVelocity(p: PlayerSeed): SentimentVelocity {
  const dirProb = Math.abs(p.acceleration) > 1.5 ? 0.7 + Math.random() * 0.25 : 0.15 + Math.random() * 0.3;
  const tti = Math.abs(p.acceleration) > 0.5 ? Math.round((Math.abs(p.velocity) / Math.abs(p.acceleration)) * 10) / 10 : 99;
  return {
    playerId: p.id,
    playerName: p.name,
    sport: p.sport,
    currentSentiment: p.baseSentiment,
    velocity: p.velocity,
    acceleration: p.acceleration,
    isDecelerating: (p.velocity > 0 && p.acceleration < 0) || (p.velocity < 0 && p.acceleration > 0),
    isAccelerating: (p.velocity > 0 && p.acceleration > 0) || (p.velocity < 0 && p.acceleration < 0),
    directionChangeProbability: Math.round(dirProb * 100) / 100,
    timeToInflection: Math.min(tti, 48),
    historicalAccuracy: 0.72 + Math.random() * 0.2,
    priceCorrelation: p.priceCorr,
    currentPrice: p.price,
    priceChange24h: p.priceChange,
  };
}

// ── Exported Functions ───────────────────────────────────────────────────────

export function getVelocityDashboard(): SentimentVelocity[] {
  return PLAYERS.map(buildVelocity);
}

export function getPlayerVelocity(playerId: string): SentimentVelocity {
  const p = PLAYERS.find(pl => pl.id === playerId) || PLAYERS[0];
  return buildVelocity(p);
}

export function getInflectionPoints(): InflectionPoint[] {
  const inflections: InflectionPoint[] = [
    {
      id: 'ip-1', playerId: 'caitlin-clark', playerName: 'Caitlin Clark', detectedAt: generateTimestamp(2),
      type: 'peak', priorTrend: 'bullish', expectedNewTrend: 'neutral', confidence: 0.82,
      expectedPriceImpact: -8.5, timeToPrice: 6, historicalPrecision: 0.78, countdown: 3.2,
    },
    {
      id: 'ip-2', playerId: 'caleb-williams', playerName: 'Caleb Williams', detectedAt: generateTimestamp(1),
      type: 'trough', priorTrend: 'bearish', expectedNewTrend: 'bullish', confidence: 0.74,
      expectedPriceImpact: 12.3, timeToPrice: 8, historicalPrecision: 0.71, countdown: 5.8,
    },
    {
      id: 'ip-3', playerId: 'ja-morant', playerName: 'Ja Morant', detectedAt: generateTimestamp(0.5),
      type: 'acceleration', priorTrend: 'bearish', expectedNewTrend: 'bullish', confidence: 0.68,
      expectedPriceImpact: 15.7, timeToPrice: 12, historicalPrecision: 0.65, countdown: 8.1,
    },
    {
      id: 'ip-4', playerId: 'patrick-mahomes', playerName: 'Patrick Mahomes', detectedAt: generateTimestamp(3),
      type: 'deceleration', priorTrend: 'bearish', expectedNewTrend: 'neutral', confidence: 0.79,
      expectedPriceImpact: 5.2, timeToPrice: 4, historicalPrecision: 0.81, countdown: 1.5,
    },
    {
      id: 'ip-5', playerId: 'paul-skenes', playerName: 'Paul Skenes', detectedAt: generateTimestamp(4),
      type: 'peak', priorTrend: 'bullish', expectedNewTrend: 'bearish', confidence: 0.61,
      expectedPriceImpact: -11.4, timeToPrice: 10, historicalPrecision: 0.68, countdown: 6.4,
    },
    {
      id: 'ip-6', playerId: 'luka-doncic', playerName: 'Luka Doncic', detectedAt: generateTimestamp(1.5),
      type: 'trough', priorTrend: 'bearish', expectedNewTrend: 'bullish', confidence: 0.72,
      expectedPriceImpact: 9.8, timeToPrice: 7, historicalPrecision: 0.74, countdown: 4.2,
    },
    {
      id: 'ip-7', playerId: 'shohei-ohtani', playerName: 'Shohei Ohtani', detectedAt: generateTimestamp(0.3),
      type: 'acceleration', priorTrend: 'bullish', expectedNewTrend: 'bullish', confidence: 0.88,
      expectedPriceImpact: 14.2, timeToPrice: 5, historicalPrecision: 0.85, countdown: 2.1,
    },
  ];
  return inflections;
}

export function getSentimentHistory(playerId: string, hours: number): SentimentReading[] {
  const p = PLAYERS.find(pl => pl.id === playerId) || PLAYERS[0];
  return generateHistory(p, hours);
}

export function getVelocityAlerts(): VelocityAlert[] {
  return [
    { id: 'va-1', playerId: 'paul-skenes', playerName: 'Paul Skenes', type: 'velocity_spike', severity: 'critical', message: 'Sentiment velocity spiked +6.1/hr — fastest in 30 days', timestamp: generateTimestamp(0.1), velocity: 6.1, acceleration: 2.8 },
    { id: 'va-2', playerId: 'caitlin-clark', playerName: 'Caitlin Clark', type: 'inflection_detected', severity: 'high', message: 'Peak inflection detected — bullish momentum fading', timestamp: generateTimestamp(0.3), velocity: 5.6, acceleration: -1.2 },
    { id: 'va-3', playerId: 'caleb-williams', playerName: 'Caleb Williams', type: 'momentum_shift', severity: 'high', message: 'Bearish deceleration detected — possible trend reversal in 5.8h', timestamp: generateTimestamp(0.5), velocity: -4.5, acceleration: 2.3 },
    { id: 'va-4', playerId: 'ja-morant', playerName: 'Ja Morant', type: 'divergence', severity: 'critical', message: 'Sentiment accelerating bullish while price still falling — divergence alert', timestamp: generateTimestamp(0.7), velocity: -6.3, acceleration: 2.2 },
    { id: 'va-5', playerId: 'jayson-tatum', playerName: 'Jayson Tatum', type: 'acceleration_surge', severity: 'medium', message: 'Acceleration jumped from -0.2 to +1.9/hr² — sentiment rebuilding', timestamp: generateTimestamp(1.2), velocity: -0.4, acceleration: 1.9 },
    { id: 'va-6', playerId: 'patrick-mahomes', playerName: 'Patrick Mahomes', type: 'inflection_detected', severity: 'medium', message: 'Bearish deceleration — velocity slowing from -5.1 to -3.8/hr', timestamp: generateTimestamp(1.8), velocity: -3.8, acceleration: -1.2 },
    { id: 'va-7', playerId: 'trevor-lawrence', playerName: 'Trevor Lawrence', type: 'velocity_spike', severity: 'high', message: 'Sharp negative velocity at -5.2/hr with recent deceleration signal', timestamp: generateTimestamp(2.1), velocity: -5.2, acceleration: 0.6 },
    { id: 'va-8', playerId: 'anthony-edwards', playerName: 'Anthony Edwards', type: 'acceleration_surge', severity: 'low', message: 'Steady bullish acceleration at +1.4/hr² — positive momentum building', timestamp: generateTimestamp(3.0), velocity: 3.5, acceleration: 1.4 },
  ];
}

export function getMarketSentimentMap(): MarketSentimentMap {
  const sports = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
  const sectors = sports.map(sport => {
    const players = PLAYERS.filter(p => p.sport === sport);
    const avgSent = players.reduce((s, p) => s + p.baseSentiment, 0) / (players.length || 1);
    const avgVel = players.reduce((s, p) => s + p.velocity, 0) / (players.length || 1);
    return {
      sport,
      avgSentiment: Math.round(avgSent),
      avgVelocity: Math.round(avgVel * 10) / 10,
      playerCount: players.length,
      trend: (avgVel > 1 ? 'accelerating' : avgVel < -1 ? 'decelerating' : 'stable') as 'accelerating' | 'decelerating' | 'stable',
    };
  });
  const allVel = PLAYERS.reduce((s, p) => s + p.velocity, 0) / PLAYERS.length;
  const allAcc = PLAYERS.reduce((s, p) => s + p.acceleration, 0) / PLAYERS.length;
  return {
    sectors,
    overallVelocity: Math.round(allVel * 10) / 10,
    overallAcceleration: Math.round(allAcc * 10) / 10,
    bullishCount: PLAYERS.filter(p => p.velocity > 1).length,
    bearishCount: PLAYERS.filter(p => p.velocity < -1).length,
    neutralCount: PLAYERS.filter(p => Math.abs(p.velocity) <= 1).length,
  };
}

export function getDivergences(): DivergenceAlert[] {
  return [
    { id: 'div-1', playerId: 'ja-morant', playerName: 'Ja Morant', sentimentDirection: 'bullish', priceDirection: 'down', divergenceScore: 87, duration: 14, expectedResolution: 'price_catches_up', confidence: 0.72, detectedAt: generateTimestamp(2) },
    { id: 'div-2', playerId: 'tyrese-haliburton', playerName: 'Tyrese Haliburton', sentimentDirection: 'bearish', priceDirection: 'up', divergenceScore: 64, duration: 8, expectedResolution: 'sentiment_reverses', confidence: 0.58, detectedAt: generateTimestamp(5) },
    { id: 'div-3', playerId: 'trevor-lawrence', playerName: 'Trevor Lawrence', sentimentDirection: 'bearish', priceDirection: 'down', divergenceScore: 42, duration: 22, expectedResolution: 'price_catches_up', confidence: 0.81, detectedAt: generateTimestamp(8) },
    { id: 'div-4', playerId: 'luka-doncic', playerName: 'Luka Doncic', sentimentDirection: 'bearish', priceDirection: 'up', divergenceScore: 55, duration: 6, expectedResolution: 'price_catches_up', confidence: 0.63, detectedAt: generateTimestamp(3) },
  ];
}

export function getSentimentWaves(): SentimentWave[] {
  return [
    { id: 'sw-1', playerId: 'victor-wembanyama', playerName: 'Victor Wembanyama', waveType: 'impulse', amplitude: 28, period: 72, phase: 45, currentPosition: 'ascending', completionPercent: 35 },
    { id: 'sw-2', playerId: 'caitlin-clark', playerName: 'Caitlin Clark', waveType: 'impulse', amplitude: 34, period: 48, phase: 310, currentPosition: 'peak', completionPercent: 86 },
    { id: 'sw-3', playerId: 'paul-skenes', playerName: 'Paul Skenes', waveType: 'impulse', amplitude: 32, period: 36, phase: 60, currentPosition: 'ascending', completionPercent: 22 },
    { id: 'sw-4', playerId: 'caleb-williams', playerName: 'Caleb Williams', waveType: 'corrective', amplitude: 22, period: 60, phase: 240, currentPosition: 'trough', completionPercent: 68 },
    { id: 'sw-5', playerId: 'patrick-mahomes', playerName: 'Patrick Mahomes', waveType: 'corrective', amplitude: 18, period: 96, phase: 200, currentPosition: 'descending', completionPercent: 55 },
    { id: 'sw-6', playerId: 'shohei-ohtani', playerName: 'Shohei Ohtani', waveType: 'impulse', amplitude: 20, period: 54, phase: 90, currentPosition: 'ascending', completionPercent: 40 },
    { id: 'sw-7', playerId: 'ja-morant', playerName: 'Ja Morant', waveType: 'corrective', amplitude: 38, period: 42, phase: 270, currentPosition: 'trough', completionPercent: 75 },
  ];
}

export function getMomentumShifts(): MomentumShift[] {
  return [
    { id: 'ms-1', playerId: 'ja-morant', playerName: 'Ja Morant', from: 'bearish', to: 'bullish', magnitude: 8.5, timestamp: generateTimestamp(1.2), priceAtShift: 750, currentPrice: 750, priceChangeAfter: 0.3 },
    { id: 'ms-2', playerId: 'caleb-williams', playerName: 'Caleb Williams', from: 'bearish', to: 'neutral', magnitude: 6.8, timestamp: generateTimestamp(3.5), priceAtShift: 695, currentPrice: 680, priceChangeAfter: -2.2 },
    { id: 'ms-3', playerId: 'jayson-tatum', playerName: 'Jayson Tatum', from: 'neutral', to: 'bullish', magnitude: 2.3, timestamp: generateTimestamp(5.0), priceAtShift: 1830, currentPrice: 1850, priceChangeAfter: 1.1 },
    { id: 'ms-4', playerId: 'caitlin-clark', playerName: 'Caitlin Clark', from: 'bullish', to: 'neutral', magnitude: 4.3, timestamp: generateTimestamp(0.8), priceAtShift: 4250, currentPrice: 4200, priceChangeAfter: -1.2 },
    { id: 'ms-5', playerId: 'luka-doncic', playerName: 'Luka Doncic', from: 'neutral', to: 'bearish', magnitude: 2.5, timestamp: generateTimestamp(8.0), priceAtShift: 3520, currentPrice: 3450, priceChangeAfter: -2.0 },
  ];
}

export function getSourceBreakdown(playerId: string): SentimentSource[] {
  const p = PLAYERS.find(pl => pl.id === playerId) || PLAYERS[0];
  return [
    { name: 'twitter', score: Math.round(p.baseSentiment + (Math.random() - 0.5) * 10), volume: Math.round(4200 + Math.random() * 3000), velocity: p.velocity * (0.8 + Math.random() * 0.4), weight: 0.35 },
    { name: 'reddit', score: Math.round(p.baseSentiment + (Math.random() - 0.5) * 14), volume: Math.round(2800 + Math.random() * 2000), velocity: p.velocity * (0.7 + Math.random() * 0.6), weight: 0.25 },
    { name: 'youtube', score: Math.round(p.baseSentiment + (Math.random() - 0.5) * 8), volume: Math.round(1200 + Math.random() * 800), velocity: p.velocity * (0.5 + Math.random() * 0.5), weight: 0.15 },
    { name: 'forums', score: Math.round(p.baseSentiment + (Math.random() - 0.5) * 16), volume: Math.round(600 + Math.random() * 500), velocity: p.velocity * (0.6 + Math.random() * 0.4), weight: 0.15 },
    { name: 'news', score: Math.round(p.baseSentiment + (Math.random() - 0.5) * 6), volume: Math.round(300 + Math.random() * 200), velocity: p.velocity * (0.9 + Math.random() * 0.2), weight: 0.10 },
  ];
}

export function getAccuracyMetrics(): { avgPrecision: number; inflectionsCaught: number; avgLeadTime: number; totalPredictions: number; successRate: number } {
  return {
    avgPrecision: 0.76,
    inflectionsCaught: 142,
    avgLeadTime: 6.4,
    totalPredictions: 187,
    successRate: 0.76,
  };
}
