// ── Sentiment Volatility Index Service ──────────────────────────────────────────
// Maps social sentiment to volatility surfaces (like options vol surfaces).
// Tracks emotion vectors, regime shifts, and generates buy-fear/sell-euphoria signals.

// ── Types ────────────────────────────────────────────────────────────────────

export type SentimentSourceName = 'reddit' | 'twitter' | 'youtube' | 'discord' | 'forums';

export type VolRegime = 'low' | 'normal' | 'elevated' | 'extreme';

export type SignalType = 'buy-fear' | 'sell-euphoria' | 'hold-neutral' | 'caution-rising' | 'opportunity-dip';

export type SentimentScenario =
  | 'viral_moment'
  | 'injury_scare'
  | 'trade_rumor'
  | 'scandal'
  | 'award_announcement'
  | 'playoff_performance'
  | 'rookie_debut'
  | 'contract_dispute';

export interface SentimentSource {
  name: SentimentSourceName;
  score: number;          // -100 to 100
  volume: number;         // post/mention count
  velocity: number;       // change rate per hour
  weight: number;         // 0-1 influence weight
}

export interface VolatilityDataPoint {
  timestamp: string;
  sviValue: number;       // 0-100 sentiment volatility index
  sentimentScore: number; // -100 to 100
  volume: number;
  priceAtTime: number;
  regime: VolRegime;
  sources: SentimentSource[];
}

export interface SentimentSurface {
  /** Like an options vol surface: maps time horizon (expiry) x sentiment intensity (strike) to implied volatility */
  playerId: string;
  playerName: string;
  strikes: number[];        // sentiment intensity levels (-100 to 100, step 20)
  expiries: string[];       // time horizons: '1h','4h','12h','1d','3d','7d','14d','30d'
  surface: number[][];      // [expiry_idx][strike_idx] -> implied vol 0-100
  currentSpot: number;      // current sentiment score
  atmVol: number;           // at-the-money vol
  skew: number;             // put/call skew equivalent
  term: number;             // term structure slope
}

export interface PlayerSentimentProfile {
  playerId: string;
  playerName: string;
  sport: string;
  team: string;
  position: string;
  currentSVI: number;
  currentSentiment: number;
  regime: VolRegime;
  avgSVI30d: number;
  maxSVI30d: number;
  minSVI30d: number;
  sentimentTrend: 'rising' | 'falling' | 'stable';
  priceCorrelation: number;
  dominantSource: SentimentSourceName;
  activeScenario: SentimentScenario | null;
  scenarioLabel: string;
  cardPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  emotionVector: EmotionVector;
  momentum: number;         // -100 to 100
}

export interface SentimentSignal {
  id: string;
  playerId: string;
  playerName: string;
  sport: string;
  type: SignalType;
  strength: number;         // 0-100
  confidence: number;       // 0-1
  triggerReason: string;
  detectedAt: string;
  sviAtSignal: number;
  sentimentAtSignal: number;
  priceAtSignal: number;
  expectedPriceMove: number; // percentage
  timeHorizon: string;
  isActive: boolean;
}

export interface EmotionVector {
  fear: number;       // 0-100
  greed: number;      // 0-100
  excitement: number; // 0-100
  anxiety: number;    // 0-100
  apathy: number;     // 0-100
  euphoria: number;   // 0-100
  anger: number;      // 0-100
  hope: number;       // 0-100
}

export interface SocialMomentumIndex {
  playerId: string;
  playerName: string;
  sport: string;
  momentum: number;         // -100 to 100
  acceleration: number;     // change of momentum per hour
  volume24h: number;
  volumeChange: number;     // percentage vs prior 24h
  topPlatform: SentimentSourceName;
  trendingHashtags: string[];
  viralScore: number;       // 0-100
  engagementRate: number;   // 0-1
  sentimentMomentum: number; // weighted sentiment velocity
}

export interface VolRegimeHistoryEntry {
  timestamp: string;
  regime: VolRegime;
  sviValue: number;
  trigger: string;
  duration: number; // hours
}

export interface SentimentVsPricePoint {
  timestamp: string;
  sentiment: number;
  price: number;
  svi: number;
  divergence: number; // sentiment - normalized price
}

export interface TopMover {
  playerId: string;
  playerName: string;
  sport: string;
  sviChange: number;
  sentimentChange: number;
  priceChange: number;
  direction: 'up' | 'down';
  trigger: string;
}

// ── Deterministic seed helpers ──────────────────────────────────────────────

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(seed: number, offset: number): number {
  const x = Math.sin(seed + offset * 0.7123 + 0.1) * 10000;
  return x - Math.floor(x);
}

function range(seed: number, offset: number, min: number, max: number): number {
  return min + seeded(seed, offset) * (max - min);
}

function pick<T>(arr: T[], seed: number, offset: number): T {
  return arr[Math.floor(seeded(seed, offset) * arr.length)];
}

// ── Player Database ─────────────────────────────────────────────────────────

interface PlayerDef {
  id: string;
  name: string;
  sport: string;
  team: string;
  position: string;
  basePrice: number;
  volatilityBias: number; // 0-1, higher = more volatile
  scenario: SentimentScenario | null;
}

const PLAYERS: PlayerDef[] = [
  { id: 'sv-001', name: 'Victor Wembanyama', sport: 'Basketball', team: 'SAS', position: 'C', basePrice: 850, volatilityBias: 0.82, scenario: 'rookie_debut' },
  { id: 'sv-002', name: 'Luka Doncic', sport: 'Basketball', team: 'LAL', position: 'PG', basePrice: 620, volatilityBias: 0.65, scenario: 'trade_rumor' },
  { id: 'sv-003', name: 'Shohei Ohtani', sport: 'Baseball', team: 'LAD', position: 'DH/P', basePrice: 1200, volatilityBias: 0.71, scenario: 'award_announcement' },
  { id: 'sv-004', name: 'Patrick Mahomes', sport: 'Football', team: 'KC', position: 'QB', basePrice: 980, volatilityBias: 0.55, scenario: 'playoff_performance' },
  { id: 'sv-005', name: 'Connor McDavid', sport: 'Hockey', team: 'EDM', position: 'C', basePrice: 540, volatilityBias: 0.60, scenario: null },
  { id: 'sv-006', name: 'Jayson Tatum', sport: 'Basketball', team: 'BOS', position: 'SF', basePrice: 380, volatilityBias: 0.50, scenario: 'playoff_performance' },
  { id: 'sv-007', name: 'Juan Soto', sport: 'Baseball', team: 'NYM', position: 'OF', basePrice: 290, volatilityBias: 0.58, scenario: 'contract_dispute' },
  { id: 'sv-008', name: 'Tyreek Hill', sport: 'Football', team: 'MIA', position: 'WR', basePrice: 210, volatilityBias: 0.72, scenario: 'scandal' },
  { id: 'sv-009', name: 'Cale Makar', sport: 'Hockey', team: 'COL', position: 'D', basePrice: 320, volatilityBias: 0.45, scenario: null },
  { id: 'sv-010', name: 'Anthony Edwards', sport: 'Basketball', team: 'MIN', position: 'SG', basePrice: 440, volatilityBias: 0.75, scenario: 'viral_moment' },
  { id: 'sv-011', name: 'Gunnar Henderson', sport: 'Baseball', team: 'BAL', position: 'SS', basePrice: 185, volatilityBias: 0.68, scenario: 'rookie_debut' },
  { id: 'sv-012', name: 'CJ Stroud', sport: 'Football', team: 'HOU', position: 'QB', basePrice: 310, volatilityBias: 0.70, scenario: 'injury_scare' },
  { id: 'sv-013', name: 'Auston Matthews', sport: 'Hockey', team: 'TOR', position: 'C', basePrice: 410, volatilityBias: 0.52, scenario: 'trade_rumor' },
  { id: 'sv-014', name: 'Ja Morant', sport: 'Basketball', team: 'MEM', position: 'PG', basePrice: 260, volatilityBias: 0.88, scenario: 'scandal' },
  { id: 'sv-015', name: 'Bobby Witt Jr', sport: 'Baseball', team: 'KC', position: 'SS', basePrice: 225, volatilityBias: 0.55, scenario: null },
  { id: 'sv-016', name: 'Caleb Williams', sport: 'Football', team: 'CHI', position: 'QB', basePrice: 175, volatilityBias: 0.78, scenario: 'rookie_debut' },
  { id: 'sv-017', name: 'Connor Bedard', sport: 'Hockey', team: 'CHI', position: 'C', basePrice: 390, volatilityBias: 0.80, scenario: 'viral_moment' },
  { id: 'sv-018', name: 'Nikola Jokic', sport: 'Basketball', team: 'DEN', position: 'C', basePrice: 510, volatilityBias: 0.42, scenario: 'award_announcement' },
  { id: 'sv-019', name: 'Mike Trout', sport: 'Baseball', team: 'LAA', position: 'OF', basePrice: 680, volatilityBias: 0.48, scenario: 'injury_scare' },
  { id: 'sv-020', name: 'Travis Kelce', sport: 'Football', team: 'KC', position: 'TE', basePrice: 350, volatilityBias: 0.62, scenario: 'viral_moment' },
  { id: 'sv-021', name: 'Shai Gilgeous-Alexander', sport: 'Basketball', team: 'OKC', position: 'SG', basePrice: 475, volatilityBias: 0.58, scenario: 'playoff_performance' },
  { id: 'sv-022', name: 'Elly De La Cruz', sport: 'Baseball', team: 'CIN', position: 'SS', basePrice: 195, volatilityBias: 0.85, scenario: 'viral_moment' },
];

const SCENARIO_LABELS: Record<SentimentScenario, string> = {
  viral_moment: 'Viral Social Media Moment',
  injury_scare: 'Injury Report Scare',
  trade_rumor: 'Active Trade Rumors',
  scandal: 'Off-Field Controversy',
  award_announcement: 'Award / MVP Buzz',
  playoff_performance: 'Playoff Heroics',
  rookie_debut: 'Electric Rookie Season',
  contract_dispute: 'Contract Holdout / Dispute',
};

const SCENARIO_SENTIMENT_PROFILES: Record<SentimentScenario, { baseSentiment: number; volMult: number; fearBias: number; euphoriaBias: number }> = {
  viral_moment:        { baseSentiment:  55, volMult: 1.6, fearBias: 0.1, euphoriaBias: 0.8 },
  injury_scare:        { baseSentiment: -45, volMult: 1.9, fearBias: 0.9, euphoriaBias: 0.05 },
  trade_rumor:         { baseSentiment:  10, volMult: 1.7, fearBias: 0.4, euphoriaBias: 0.4 },
  scandal:             { baseSentiment: -60, volMult: 2.2, fearBias: 0.85, euphoriaBias: 0.02 },
  award_announcement:  { baseSentiment:  70, volMult: 1.3, fearBias: 0.05, euphoriaBias: 0.9 },
  playoff_performance: { baseSentiment:  50, volMult: 1.5, fearBias: 0.15, euphoriaBias: 0.7 },
  rookie_debut:        { baseSentiment:  40, volMult: 1.8, fearBias: 0.2, euphoriaBias: 0.6 },
  contract_dispute:    { baseSentiment: -25, volMult: 1.4, fearBias: 0.6, euphoriaBias: 0.1 },
};

const SOURCE_NAMES: SentimentSourceName[] = ['reddit', 'twitter', 'youtube', 'discord', 'forums'];

const EXPIRY_LABELS = ['1h', '4h', '12h', '1d', '3d', '7d', '14d', '30d'];
const STRIKE_LEVELS = [-100, -80, -60, -40, -20, 0, 20, 40, 60, 80, 100];

// ── Time series generator ───────────────────────────────────────────────────

function generateTimeSeries(player: PlayerDef): VolatilityDataPoint[] {
  const seed = hashStr(player.id);
  const points: VolatilityDataPoint[] = [];
  const scenarioProfile = player.scenario ? SCENARIO_SENTIMENT_PROFILES[player.scenario] : { baseSentiment: 0, volMult: 1.0, fearBias: 0.3, euphoriaBias: 0.3 };
  const totalHours = 30 * 24; // 30 days

  let sentiment = scenarioProfile.baseSentiment * 0.6;
  let price = player.basePrice;

  for (let h = 0; h < totalHours; h++) {
    const t = h / totalHours;
    const offset = seed + h;

    // Introduce scenario-driven sentiment shocks
    const shockWindow = player.scenario ? (t > 0.6 && t < 0.75) : false;
    const shockMagnitude = shockWindow ? scenarioProfile.baseSentiment * 0.8 : 0;

    // Mean-reverting sentiment with shocks
    const drift = (scenarioProfile.baseSentiment - sentiment) * 0.02;
    const noise = (seeded(seed, offset) - 0.5) * 20 * player.volatilityBias * scenarioProfile.volMult;
    sentiment = Math.max(-100, Math.min(100, sentiment + drift + noise + (shockWindow ? shockMagnitude * 0.05 : 0)));

    // SVI: realized vol of sentiment (rolling window approximation)
    const volBase = Math.abs(noise) * 2 + player.volatilityBias * 30;
    const sviValue = Math.max(0, Math.min(100, volBase + (shockWindow ? 25 : 0) + range(seed, offset + 999, -5, 5)));

    // Price loosely follows sentiment with lag
    const priceDrift = sentiment * 0.001 + (seeded(seed, offset + 500) - 0.5) * player.basePrice * 0.005;
    price = Math.max(player.basePrice * 0.5, Math.min(player.basePrice * 2, price + priceDrift));

    const regime = classifyRegime(sviValue);

    const sources: SentimentSource[] = SOURCE_NAMES.map((name, si) => {
      const srcSeed = seed + h * 5 + si;
      return {
        name,
        score: Math.max(-100, Math.min(100, sentiment + range(seed, srcSeed, -15, 15))),
        volume: Math.round(range(seed, srcSeed + 100, 50, 2000) * (shockWindow ? 3 : 1)),
        velocity: range(seed, srcSeed + 200, -5, 5),
        weight: [0.25, 0.30, 0.15, 0.15, 0.15][si],
      };
    });

    // Only emit every 1 hour
    const ts = new Date();
    ts.setHours(ts.getHours() - (totalHours - h));
    ts.setMinutes(0, 0, 0);

    points.push({
      timestamp: ts.toISOString(),
      sviValue: Math.round(sviValue * 10) / 10,
      sentimentScore: Math.round(sentiment * 10) / 10,
      volume: sources.reduce((s, src) => s + src.volume, 0),
      priceAtTime: Math.round(price * 100) / 100,
      regime,
      sources,
    });
  }

  return points;
}

function classifyRegime(svi: number): VolRegime {
  if (svi < 20) return 'low';
  if (svi < 40) return 'normal';
  if (svi < 65) return 'elevated';
  return 'extreme';
}

// ── Caches ──────────────────────────────────────────────────────────────────

const _timeSeriesCache = new Map<string, VolatilityDataPoint[]>();

function getOrGenerateTimeSeries(player: PlayerDef): VolatilityDataPoint[] {
  if (!_timeSeriesCache.has(player.id)) {
    _timeSeriesCache.set(player.id, generateTimeSeries(player));
  }
  return _timeSeriesCache.get(player.id)!;
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getSentimentSurface(playerId: string): SentimentSurface {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const seed = hashStr(player.id + 'surface');
  const ts = getOrGenerateTimeSeries(player);
  const latest = ts[ts.length - 1];

  const surface: number[][] = EXPIRY_LABELS.map((_, ei) =>
    STRIKE_LEVELS.map((strike, si) => {
      const distFromSpot = Math.abs(strike - latest.sentimentScore);
      const timeFactor = (ei + 1) / EXPIRY_LABELS.length;
      const baseVol = latest.sviValue * (1 + distFromSpot * 0.005);
      const termPremium = timeFactor * 8;
      const skewAdj = strike < latest.sentimentScore ? 3 : -1; // fear premium
      const noise = range(seed, ei * 100 + si, -3, 3);
      return Math.max(5, Math.min(100, Math.round((baseVol + termPremium + skewAdj + noise) * 10) / 10));
    })
  );

  const atmIdx = STRIKE_LEVELS.findIndex(s => Math.abs(s - latest.sentimentScore) <= 10) || 5;
  const atmVol = surface[0][atmIdx];
  const skew = surface[0][0] - surface[0][STRIKE_LEVELS.length - 1]; // OTM put vol - OTM call vol equivalent

  return {
    playerId: player.id,
    playerName: player.name,
    strikes: STRIKE_LEVELS,
    expiries: EXPIRY_LABELS,
    surface,
    currentSpot: Math.round(latest.sentimentScore * 10) / 10,
    atmVol: Math.round(atmVol * 10) / 10,
    skew: Math.round(skew * 10) / 10,
    term: Math.round((surface[EXPIRY_LABELS.length - 1][atmIdx] - surface[0][atmIdx]) * 10) / 10,
  };
}

export function getVolatilityTimeSeries(playerId: string, hours: number = 168): VolatilityDataPoint[] {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const ts = getOrGenerateTimeSeries(player);
  return ts.slice(-hours);
}

export function getPlayerSentimentProfile(playerId: string): PlayerSentimentProfile {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const ts = getOrGenerateTimeSeries(player);
  const latest = ts[ts.length - 1];
  const last30d = ts.slice(-720); // 30 days
  const last24h = ts.slice(-24);
  const last7d = ts.slice(-168);
  const seed = hashStr(player.id + 'profile');

  const sviValues = last30d.map(p => p.sviValue);
  const avgSVI = sviValues.reduce((a, b) => a + b, 0) / sviValues.length;

  const sentimentStart24h = last24h[0]?.sentimentScore ?? 0;
  const sentimentEnd = latest.sentimentScore;
  const trend: 'rising' | 'falling' | 'stable' =
    sentimentEnd - sentimentStart24h > 5 ? 'rising' :
    sentimentEnd - sentimentStart24h < -5 ? 'falling' : 'stable';

  const scenarioProfile = player.scenario ? SCENARIO_SENTIMENT_PROFILES[player.scenario] : null;

  const emotionVector: EmotionVector = {
    fear: Math.round(Math.max(0, Math.min(100, (scenarioProfile?.fearBias ?? 0.3) * 100 + range(seed, 1, -10, 10)))),
    greed: Math.round(Math.max(0, Math.min(100, range(seed, 2, 20, 60)))),
    excitement: Math.round(Math.max(0, Math.min(100, (scenarioProfile?.euphoriaBias ?? 0.3) * 80 + range(seed, 3, -5, 15)))),
    anxiety: Math.round(Math.max(0, Math.min(100, (scenarioProfile?.fearBias ?? 0.3) * 70 + range(seed, 4, -5, 20)))),
    apathy: Math.round(Math.max(0, Math.min(100, range(seed, 5, 5, 30)))),
    euphoria: Math.round(Math.max(0, Math.min(100, (scenarioProfile?.euphoriaBias ?? 0.3) * 90 + range(seed, 6, -5, 10)))),
    anger: Math.round(Math.max(0, Math.min(100, player.scenario === 'scandal' ? range(seed, 7, 50, 85) : range(seed, 7, 5, 25)))),
    hope: Math.round(Math.max(0, Math.min(100, range(seed, 8, 30, 75)))),
  };

  // Dominant source: highest volume in latest reading
  const dominantSource = latest.sources.reduce((best, s) => s.volume > best.volume ? s : best, latest.sources[0]).name;

  const priceStart24h = last24h[0]?.priceAtTime ?? player.basePrice;
  const priceStart7d = last7d[0]?.priceAtTime ?? player.basePrice;

  return {
    playerId: player.id,
    playerName: player.name,
    sport: player.sport,
    team: player.team,
    position: player.position,
    currentSVI: latest.sviValue,
    currentSentiment: latest.sentimentScore,
    regime: latest.regime,
    avgSVI30d: Math.round(avgSVI * 10) / 10,
    maxSVI30d: Math.round(Math.max(...sviValues) * 10) / 10,
    minSVI30d: Math.round(Math.min(...sviValues) * 10) / 10,
    sentimentTrend: trend,
    priceCorrelation: Math.round(range(seed, 20, 0.3, 0.85) * 100) / 100,
    dominantSource,
    activeScenario: player.scenario,
    scenarioLabel: player.scenario ? SCENARIO_LABELS[player.scenario] : 'No Active Scenario',
    cardPrice: Math.round(latest.priceAtTime * 100) / 100,
    priceChange24h: Math.round(((latest.priceAtTime - priceStart24h) / priceStart24h) * 10000) / 100,
    priceChange7d: Math.round(((latest.priceAtTime - priceStart7d) / priceStart7d) * 10000) / 100,
    emotionVector,
    momentum: Math.round(sentimentEnd - sentimentStart24h),
  };
}

export function getSentimentSignals(): SentimentSignal[] {
  const signals: SentimentSignal[] = [];

  PLAYERS.forEach((player, pi) => {
    const ts = getOrGenerateTimeSeries(player);
    const latest = ts[ts.length - 1];
    const seed = hashStr(player.id + 'signals');

    // Generate 1-2 signals per player based on conditions
    const sentiment = latest.sentimentScore;
    const svi = latest.sviValue;

    let type: SignalType;
    let strength: number;
    let reason: string;

    if (sentiment < -40 && svi > 50) {
      type = 'buy-fear';
      strength = Math.min(100, Math.round(Math.abs(sentiment) * 0.8 + svi * 0.3));
      reason = 'Extreme negative sentiment with high volatility — contrarian buy opportunity';
    } else if (sentiment > 60 && svi > 40) {
      type = 'sell-euphoria';
      strength = Math.min(100, Math.round(sentiment * 0.7 + svi * 0.2));
      reason = 'Euphoric sentiment levels — historically precedes mean reversion';
    } else if (sentiment < -20 && svi < 30) {
      type = 'opportunity-dip';
      strength = Math.round(range(seed, 1, 30, 60));
      reason = 'Moderate dip with low volatility — stable entry point';
    } else if (svi > 55) {
      type = 'caution-rising';
      strength = Math.round(range(seed, 2, 40, 70));
      reason = 'Elevated sentiment volatility — increased uncertainty';
    } else {
      type = 'hold-neutral';
      strength = Math.round(range(seed, 3, 20, 40));
      reason = 'Sentiment within normal parameters';
    }

    const detectedAt = new Date();
    detectedAt.setHours(detectedAt.getHours() - Math.floor(range(seed, 4, 0, 48)));

    signals.push({
      id: `sig-${player.id}-${pi}`,
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      type,
      strength,
      confidence: Math.round(range(seed, 5, 0.55, 0.95) * 100) / 100,
      triggerReason: reason,
      detectedAt: detectedAt.toISOString(),
      sviAtSignal: svi,
      sentimentAtSignal: sentiment,
      priceAtSignal: latest.priceAtTime,
      expectedPriceMove: Math.round(range(seed, 6, -15, 20) * 10) / 10,
      timeHorizon: pick(['1-3 days', '3-7 days', '1-2 weeks', '2-4 weeks'], seed, 7),
      isActive: seeded(seed, 8) > 0.2,
    });
  });

  return signals.sort((a, b) => b.strength - a.strength);
}

export function calculateSVI(playerId: string): number {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const ts = getOrGenerateTimeSeries(player);
  return ts[ts.length - 1].sviValue;
}

export function getEmotionHeatMap(): { playerId: string; playerName: string; sport: string; emotions: EmotionVector }[] {
  return PLAYERS.map(player => {
    const profile = getPlayerSentimentProfile(player.id);
    return {
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      emotions: profile.emotionVector,
    };
  });
}

export function getSocialMomentum(): SocialMomentumIndex[] {
  return PLAYERS.map(player => {
    const ts = getOrGenerateTimeSeries(player);
    const latest = ts[ts.length - 1];
    const prior24h = ts[ts.length - 25] ?? ts[0];
    const seed = hashStr(player.id + 'momentum');

    const volume24h = ts.slice(-24).reduce((s, p) => s + p.volume, 0);
    const volumePrior = ts.slice(-48, -24).reduce((s, p) => s + p.volume, 0);

    const hashtags = [
      `#${player.name.split(' ')[1]}`,
      `#${player.sport}Cards`,
      player.scenario ? `#${SCENARIO_LABELS[player.scenario].split(' ')[0]}` : '#CardInvesting',
    ];

    return {
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      momentum: Math.round(latest.sentimentScore - prior24h.sentimentScore),
      acceleration: Math.round(range(seed, 1, -3, 3) * 10) / 10,
      volume24h,
      volumeChange: volumePrior > 0 ? Math.round(((volume24h - volumePrior) / volumePrior) * 100) : 0,
      topPlatform: latest.sources.reduce((best, s) => s.volume > best.volume ? s : best, latest.sources[0]).name,
      trendingHashtags: hashtags,
      viralScore: Math.round(Math.max(0, Math.min(100, range(seed, 2, 10, 90)))),
      engagementRate: Math.round(range(seed, 3, 0.01, 0.12) * 1000) / 1000,
      sentimentMomentum: Math.round((latest.sentimentScore - prior24h.sentimentScore) * range(seed, 4, 0.5, 1.5) * 10) / 10,
    };
  }).sort((a, b) => Math.abs(b.momentum) - Math.abs(a.momentum));
}

export function getVolRegimeHistory(playerId: string): VolRegimeHistoryEntry[] {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const ts = getOrGenerateTimeSeries(player);
  const entries: VolRegimeHistoryEntry[] = [];

  // Sample every 12 hours to build regime history
  let prevRegime: VolRegime | null = null;
  let regimeStart = 0;

  for (let i = 0; i < ts.length; i += 12) {
    const point = ts[i];
    if (point.regime !== prevRegime) {
      if (prevRegime !== null) {
        const triggers: Record<VolRegime, string[]> = {
          low: ['Market calm', 'No news cycle', 'Weekend lull', 'Off-season quiet'],
          normal: ['Standard trading', 'Routine coverage', 'Steady engagement'],
          elevated: ['Breaking news', 'Social spike', 'Game day volatility', 'Rumor mill active'],
          extreme: ['Viral moment', 'Major injury report', 'Trade confirmed', 'Scandal breaking', 'Award announcement'],
        };
        const seed = hashStr(player.id + i.toString());
        entries.push({
          timestamp: ts[regimeStart].timestamp,
          regime: prevRegime,
          sviValue: ts[regimeStart].sviValue,
          trigger: pick(triggers[prevRegime], seed, 0),
          duration: (i - regimeStart),
        });
      }
      prevRegime = point.regime;
      regimeStart = i;
    }
  }

  // Add current regime
  if (prevRegime) {
    entries.push({
      timestamp: ts[regimeStart].timestamp,
      regime: prevRegime,
      sviValue: ts[regimeStart].sviValue,
      trigger: 'Current regime',
      duration: ts.length - regimeStart,
    });
  }

  return entries;
}

export function compareSentimentVsPrice(playerId: string, hours: number = 168): SentimentVsPricePoint[] {
  const player = PLAYERS.find(p => p.id === playerId) ?? PLAYERS[0];
  const ts = getOrGenerateTimeSeries(player);
  const slice = ts.slice(-hours);

  // Normalize price to -100..100 range for comparison
  const prices = slice.map(p => p.priceAtTime);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1;

  return slice.map(p => {
    const normalizedPrice = ((p.priceAtTime - minP) / priceRange) * 200 - 100;
    return {
      timestamp: p.timestamp,
      sentiment: Math.round(p.sentimentScore * 10) / 10,
      price: Math.round(p.priceAtTime * 100) / 100,
      svi: Math.round(p.sviValue * 10) / 10,
      divergence: Math.round((p.sentimentScore - normalizedPrice) * 10) / 10,
    };
  });
}

export function getTopMovers(count: number = 10): TopMover[] {
  return PLAYERS.map(player => {
    const ts = getOrGenerateTimeSeries(player);
    const latest = ts[ts.length - 1];
    const prior = ts[ts.length - 25] ?? ts[0]; // 24h ago
    const seed = hashStr(player.id + 'movers');

    const sviChange = latest.sviValue - prior.sviValue;
    const sentimentChange = latest.sentimentScore - prior.sentimentScore;
    const priceChange = ((latest.priceAtTime - prior.priceAtTime) / prior.priceAtTime) * 100;

    return {
      playerId: player.id,
      playerName: player.name,
      sport: player.sport,
      sviChange: Math.round(sviChange * 10) / 10,
      sentimentChange: Math.round(sentimentChange * 10) / 10,
      priceChange: Math.round(priceChange * 100) / 100,
      direction: sviChange >= 0 ? 'up' as const : 'down' as const,
      trigger: player.scenario ? SCENARIO_LABELS[player.scenario] : 'Market drift',
    };
  })
    .sort((a, b) => Math.abs(b.sviChange) - Math.abs(a.sviChange))
    .slice(0, count);
}

export function getAllPlayerIds(): { id: string; name: string; sport: string }[] {
  return PLAYERS.map(p => ({ id: p.id, name: p.name, sport: p.sport }));
}

export function getAllProfiles(): PlayerSentimentProfile[] {
  return PLAYERS.map(p => getPlayerSentimentProfile(p.id));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
