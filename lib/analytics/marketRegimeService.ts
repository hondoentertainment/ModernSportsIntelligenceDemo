// @ts-nocheck
// ---- Types ----

export type MarketRegime =
  | 'bull'
  | 'bear'
  | 'accumulation'
  | 'distribution'
  | 'bubble'
  | 'crash'
  | 'recovery'
  | 'sideways';

export type OptimalAction = 'accumulate' | 'hold' | 'trim' | 'sell' | 'hedge';

export interface RegimeIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  description: string;
  trend: 'rising' | 'falling' | 'flat';
  historicalAvg: number;
}

export interface HiddenMarkovState {
  regime: MarketRegime;
  probability: number;
  steadyStateProbability: number;
  expectedDuration: number; // months
  volatility: number;
  returnProfile: number; // expected monthly return %
}

export interface TransitionMatrix {
  from: MarketRegime;
  to: MarketRegime;
  probability: number;
  avgTransitionTime: number; // months
  historicalCount: number;
}

export interface RegimeSignal {
  id: string;
  name: string;
  category: 'momentum' | 'volume' | 'breadth' | 'sentiment' | 'structural';
  value: number;
  threshold: number;
  direction: 'above' | 'below';
  triggered: boolean;
  strength: number; // 0-100
  lastTriggered: string;
}

export interface RegimeStrategy {
  regime: MarketRegime;
  label: string;
  description: string;
  primaryAction: OptimalAction;
  secondaryAction: OptimalAction;
  allocationShift: string;
  riskLevel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  expectedReturn: string;
  holdingPeriod: string;
  keyRules: string[];
  avoidActions: string[];
  color: string;
}

export interface VolumeProfile {
  month: string;
  totalVolume: number;
  avgDailyVolume: number;
  volumeZScore: number;
  buyVolume: number;
  sellVolume: number;
  netFlow: number;
  dominantSide: 'buyers' | 'sellers' | 'balanced';
}

export interface BreadthIndicator {
  name: string;
  value: number;
  interpretation: string;
  regime_signal: MarketRegime | null;
  percentile: number;
  color: string;
}

export interface RegimeHistory {
  month: string;
  regime: MarketRegime;
  confidence: number;
  indexValue: number;
  monthlyReturn: number;
  volatility: number;
  volumeIndex: number;
  isTransition: boolean;
  transitionFrom?: MarketRegime;
}

export interface RegimeConfidence {
  currentRegime: MarketRegime;
  confidence: number;
  secondaryRegime: MarketRegime;
  secondaryConfidence: number;
  modelAgreement: number; // % of models that agree
  signalsAligned: number;
  signalsTotal: number;
  lastRegimeChange: string;
  daysSinceChange: number;
  regimeDuration: number; // months in current regime
  stabilityScore: number;
}

export interface RegimePrediction {
  regime: MarketRegime;
  probability: number;
  timeframe: string;
  confidence: number;
  keyDrivers: string[];
}

export interface RegimeComparison {
  regime: MarketRegime;
  avgReturn: number;
  avgVolatility: number;
  avgDuration: number;
  frequency: number;
  bestPerformer: string;
  worstPerformer: string;
  sharpeRatio: number;
}

// ---- Constants ----

const ALL_REGIMES: MarketRegime[] = [
  'bull', 'bear', 'accumulation', 'distribution',
  'bubble', 'crash', 'recovery', 'sideways',
];

const REGIME_COLORS: Record<MarketRegime, string> = {
  bull: '#22c55e',
  bear: '#ef4444',
  accumulation: '#3b82f6',
  distribution: '#f59e0b',
  bubble: '#a855f7',
  crash: '#dc2626',
  recovery: '#06b6d4',
  sideways: '#6b7280',
};

const REGIME_LABELS: Record<MarketRegime, string> = {
  bull: 'Bull Market',
  bear: 'Bear Market',
  accumulation: 'Accumulation',
  distribution: 'Distribution',
  bubble: 'Bubble',
  crash: 'Crash',
  recovery: 'Recovery',
  sideways: 'Sideways',
};

// ---- Deterministic seed helpers ----

function dateSeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

// ---- Regime History (60 months) ----

function generateRegimeHistory(): RegimeHistory[] {
  const history: RegimeHistory[] = [];
  const startDate = new Date(2021, 2, 1); // March 2021

  const regimeScript: { regime: MarketRegime; months: number }[] = [
    { regime: 'bull', months: 6 },
    { regime: 'distribution', months: 3 },
    { regime: 'bubble', months: 4 },
    { regime: 'crash', months: 2 },
    { regime: 'bear', months: 5 },
    { regime: 'accumulation', months: 4 },
    { regime: 'recovery', months: 5 },
    { regime: 'bull', months: 8 },
    { regime: 'sideways', months: 6 },
    { regime: 'distribution', months: 3 },
    { regime: 'bear', months: 4 },
    { regime: 'accumulation', months: 3 },
    { regime: 'recovery', months: 4 },
    { regime: 'bull', months: 3 },
  ];

  const returnProfiles: Record<MarketRegime, { base: number; vol: number }> = {
    bull: { base: 3.2, vol: 4.5 },
    bear: { base: -4.1, vol: 7.2 },
    accumulation: { base: 0.8, vol: 3.0 },
    distribution: { base: -0.5, vol: 5.5 },
    bubble: { base: 8.5, vol: 12.0 },
    crash: { base: -12.0, vol: 18.0 },
    recovery: { base: 4.5, vol: 6.0 },
    sideways: { base: 0.3, vol: 2.8 },
  };

  let indexValue = 1000;
  let monthIndex = 0;
  let prevRegime: MarketRegime | undefined;

  for (const segment of regimeScript) {
    for (let i = 0; i < segment.months && monthIndex < 60; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + monthIndex);
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM

      const profile = returnProfiles[segment.regime];
      const seed = dateSeed() + monthIndex * 31;
      const noise = (seededRandom(seed) - 0.5) * profile.vol;
      const monthlyReturn = profile.base + noise;
      indexValue = Math.max(200, indexValue * (1 + monthlyReturn / 100));

      const isTransition = i === 0 && prevRegime !== undefined && prevRegime !== segment.regime;

      const confidenceBase = segment.regime === 'sideways' ? 62 : segment.regime === 'crash' ? 91 : 75;
      const confidence = Math.min(98, Math.max(55, confidenceBase + (seededRandom(seed + 1) - 0.5) * 20));

      const volumeSeed = seededRandom(seed + 2);
      const volumeBase = segment.regime === 'crash' ? 180 : segment.regime === 'bubble' ? 160 : segment.regime === 'bear' ? 130 : 100;
      const volumeIndex = Math.round(volumeBase + (volumeSeed - 0.5) * 40);

      history.push({
        month: monthStr,
        regime: segment.regime,
        confidence: Math.round(confidence),
        indexValue: Math.round(indexValue * 100) / 100,
        monthlyReturn: Math.round(monthlyReturn * 100) / 100,
        volatility: Math.round((Math.abs(noise) + profile.vol * 0.3) * 100) / 100,
        volumeIndex,
        isTransition,
        ...(isTransition ? { transitionFrom: prevRegime } : {}),
      });

      monthIndex++;
    }
    prevRegime = segment.regime;
  }

  return history;
}

// ---- Hidden Markov States ----

function getHiddenMarkovStates(): HiddenMarkovState[] {
  return [
    { regime: 'bull', probability: 0.24, steadyStateProbability: 0.22, expectedDuration: 7.2, volatility: 4.5, returnProfile: 3.2 },
    { regime: 'bear', probability: 0.08, steadyStateProbability: 0.12, expectedDuration: 4.8, volatility: 7.2, returnProfile: -4.1 },
    { regime: 'accumulation', probability: 0.15, steadyStateProbability: 0.14, expectedDuration: 3.5, volatility: 3.0, returnProfile: 0.8 },
    { regime: 'distribution', probability: 0.10, steadyStateProbability: 0.11, expectedDuration: 3.0, volatility: 5.5, returnProfile: -0.5 },
    { regime: 'bubble', probability: 0.05, steadyStateProbability: 0.06, expectedDuration: 3.8, volatility: 12.0, returnProfile: 8.5 },
    { regime: 'crash', probability: 0.03, steadyStateProbability: 0.04, expectedDuration: 2.1, volatility: 18.0, returnProfile: -12.0 },
    { regime: 'recovery', probability: 0.18, steadyStateProbability: 0.15, expectedDuration: 4.5, volatility: 6.0, returnProfile: 4.5 },
    { regime: 'sideways', probability: 0.17, steadyStateProbability: 0.16, expectedDuration: 5.5, volatility: 2.8, returnProfile: 0.3 },
  ];
}

// ---- Transition Matrix ----

function buildTransitionMatrix(): TransitionMatrix[] {
  const probs: Record<MarketRegime, Partial<Record<MarketRegime, number>>> = {
    bull:         { bull: 0.55, distribution: 0.18, bubble: 0.10, sideways: 0.12, bear: 0.05 },
    bear:         { bear: 0.45, accumulation: 0.28, crash: 0.10, sideways: 0.12, recovery: 0.05 },
    accumulation: { accumulation: 0.40, recovery: 0.30, bull: 0.15, sideways: 0.15 },
    distribution: { distribution: 0.35, bear: 0.30, crash: 0.10, sideways: 0.15, bull: 0.10 },
    bubble:       { bubble: 0.30, crash: 0.25, distribution: 0.20, bull: 0.15, bear: 0.10 },
    crash:        { crash: 0.15, bear: 0.35, accumulation: 0.25, recovery: 0.15, sideways: 0.10 },
    recovery:     { recovery: 0.40, bull: 0.35, sideways: 0.15, accumulation: 0.10 },
    sideways:     { sideways: 0.45, bull: 0.18, bear: 0.12, accumulation: 0.13, distribution: 0.12 },
  };

  const avgTimes: Record<string, number> = {};
  ALL_REGIMES.forEach(f => ALL_REGIMES.forEach(t => {
    const seed = f.length * 37 + t.length * 19;
    avgTimes[`${f}-${t}`] = f === t ? 0 : Math.round((1.5 + seededRandom(seed) * 4) * 10) / 10;
  }));

  const matrix: TransitionMatrix[] = [];
  for (const from of ALL_REGIMES) {
    for (const to of ALL_REGIMES) {
      const p = probs[from]?.[to] ?? 0;
      if (p > 0) {
        const seed = from.length * 53 + to.length * 71;
        matrix.push({
          from,
          to,
          probability: p,
          avgTransitionTime: from === to ? 0 : avgTimes[`${from}-${to}`],
          historicalCount: from === to ? 0 : Math.floor(2 + seededRandom(seed) * 8),
        });
      }
    }
  }
  return matrix;
}

// ---- Regime Strategies ----

function buildRegimeStrategies(): RegimeStrategy[] {
  return [
    {
      regime: 'bull',
      label: 'Bull Market',
      description: 'Sustained upward trend with expanding volumes and broad-based gains across card categories.',
      primaryAction: 'hold',
      secondaryAction: 'accumulate',
      allocationShift: 'Increase equity-grade cards to 70% of portfolio; reduce cash reserves to 15%',
      riskLevel: 'moderate',
      expectedReturn: '+3-5% monthly',
      holdingPeriod: '6-12 months',
      keyRules: [
        'Ride winners — do not take profits too early',
        'Add on pullbacks of 5-8%',
        'Focus on high-grade rookies of active players',
        'Increase position sizes by 20%',
      ],
      avoidActions: ['Panic selling on minor dips', 'Over-concentrating in single players', 'Ignoring rising valuations'],
      color: REGIME_COLORS.bull,
    },
    {
      regime: 'bear',
      label: 'Bear Market',
      description: 'Persistent downtrend with declining volumes and widespread losses; preservation of capital is priority.',
      primaryAction: 'hedge',
      secondaryAction: 'trim',
      allocationShift: 'Reduce exposure to 40%; raise cash to 40%; hold 20% in graded vintage',
      riskLevel: 'high',
      expectedReturn: '-2-5% monthly',
      holdingPeriod: 'Minimize new positions',
      keyRules: [
        'Raise cash aggressively on rallies',
        'Focus on defensive vintage cards with stable demand',
        'Reduce position sizes by 40%',
        'Set strict stop-losses at -10%',
      ],
      avoidActions: ['Buying dips too early', 'Averaging down on speculative cards', 'Holding illiquid positions'],
      color: REGIME_COLORS.bear,
    },
    {
      regime: 'accumulation',
      label: 'Accumulation Phase',
      description: 'Smart money quietly building positions after a decline; prices stabilize with improving breadth.',
      primaryAction: 'accumulate',
      secondaryAction: 'hold',
      allocationShift: 'Gradually deploy cash into high-conviction targets; 50% invested, 30% staged, 20% cash',
      riskLevel: 'low',
      expectedReturn: '+0.5-2% monthly',
      holdingPeriod: '12-24 months',
      keyRules: [
        'Build positions in tranches of 25% each',
        'Focus on undervalued graded cards with strong fundamentals',
        'Track insider and institutional buying signals',
        'Patience — accumulation phases can last months',
      ],
      avoidActions: ['Going all-in too quickly', 'Chasing momentum names', 'Ignoring market breadth signals'],
      color: REGIME_COLORS.accumulation,
    },
    {
      regime: 'distribution',
      label: 'Distribution Phase',
      description: 'Smart money offloading positions into retail demand; prices at highs but breadth is narrowing.',
      primaryAction: 'trim',
      secondaryAction: 'hedge',
      allocationShift: 'Reduce to 45% invested; raise cash to 35%; keep 20% in defensive positions',
      riskLevel: 'high',
      expectedReturn: '-0.5-1% monthly',
      holdingPeriod: 'Reduce exposure over 2-3 months',
      keyRules: [
        'Sell into strength — do not wait for breakdowns',
        'Take profits on positions up >30%',
        'Tighten stop-losses to -5%',
        'Shift to high-grade vintage for stability',
      ],
      avoidActions: ['Adding new speculative positions', 'Ignoring narrowing breadth', 'FOMO buying on headline pumps'],
      color: REGIME_COLORS.distribution,
    },
    {
      regime: 'bubble',
      label: 'Bubble Territory',
      description: 'Parabolic price action driven by speculation and FOMO; extreme valuations disconnected from fundamentals.',
      primaryAction: 'trim',
      secondaryAction: 'sell',
      allocationShift: 'Maximum 30% invested; 50% cash; 20% in hedges or inverse positions',
      riskLevel: 'very_high',
      expectedReturn: '+5-15% monthly (unsustainable)',
      holdingPeriod: 'Trade only — no new long-term positions',
      keyRules: [
        'Scale out aggressively — sell 10% of winners each week',
        'Never add new positions at parabolic highs',
        'Set trailing stops at -15%',
        'Keep a "crash fund" of 30% in cash',
      ],
      avoidActions: ['Believing this time is different', 'Leverage or margin buying', 'Holding illiquid positions', 'Following social media hype'],
      color: REGIME_COLORS.bubble,
    },
    {
      regime: 'crash',
      label: 'Market Crash',
      description: 'Rapid, severe decline with panic selling, liquidity evaporation, and extreme fear.',
      primaryAction: 'sell',
      secondaryAction: 'hedge',
      allocationShift: 'Emergency mode: 20% invested (only blue-chips), 70% cash, 10% opportunistic',
      riskLevel: 'very_high',
      expectedReturn: '-8-15% monthly',
      holdingPeriod: 'Survival mode — protect capital',
      keyRules: [
        'Preserve capital above all else',
        'Sell non-core holdings immediately',
        'Maintain a wish list for bottom-fishing later',
        'Do not try to catch the falling knife',
      ],
      avoidActions: ['Panic buying at perceived bottoms', 'Averaging down during cascading selloffs', 'Holding leveraged positions'],
      color: REGIME_COLORS.crash,
    },
    {
      regime: 'recovery',
      label: 'Recovery Phase',
      description: 'Market turning higher from lows; improving breadth, rising volume, and returning confidence.',
      primaryAction: 'accumulate',
      secondaryAction: 'hold',
      allocationShift: 'Ramp to 60% invested; 25% staged for adds; 15% cash',
      riskLevel: 'moderate',
      expectedReturn: '+3-6% monthly',
      holdingPeriod: '6-18 months',
      keyRules: [
        'Buy quality cards that have been oversold',
        'Add to positions as strength confirms',
        'Focus on rookies with upcoming season catalysts',
        'Increase allocation every 2 weeks if trend holds',
      ],
      avoidActions: ['Waiting for the "perfect" bottom', 'Only buying former high-flyers', 'Under-investing due to residual fear'],
      color: REGIME_COLORS.recovery,
    },
    {
      regime: 'sideways',
      label: 'Sideways / Range-Bound',
      description: 'Market trading in a defined range with low conviction; ideal for selective, value-focused approach.',
      primaryAction: 'hold',
      secondaryAction: 'accumulate',
      allocationShift: 'Maintain 50% invested; 25% in range-trade positions; 25% cash',
      riskLevel: 'low',
      expectedReturn: '+0-1% monthly',
      holdingPeriod: '3-6 months per trade',
      keyRules: [
        'Buy near range support, sell near range resistance',
        'Focus on cards with upcoming catalysts (awards, milestones)',
        'Reduce position sizes — no strong directional edge',
        'Use the time to research and build watchlists',
      ],
      avoidActions: ['Forcing trades in a directionless market', 'Over-trading due to boredom', 'Large position bets on breakout guesses'],
      color: REGIME_COLORS.sideways,
    },
  ];
}

// ---- Regime Signals ----

function buildRegimeSignals(): RegimeSignal[] {
  const seed = dateSeed();
  return [
    {
      id: 'sig-1',
      name: 'Price Momentum (20-week)',
      category: 'momentum',
      value: 62 + seededRandom(seed + 100) * 15,
      threshold: 60,
      direction: 'above',
      triggered: true,
      strength: 72,
      lastTriggered: '2026-03-12',
    },
    {
      id: 'sig-2',
      name: 'Volume Trend (50-day MA)',
      category: 'volume',
      value: Math.round(1450 + seededRandom(seed + 101) * 200),
      threshold: 1400,
      direction: 'above',
      triggered: true,
      strength: 65,
      lastTriggered: '2026-03-10',
    },
    {
      id: 'sig-3',
      name: 'Advance-Decline Ratio',
      category: 'breadth',
      value: Math.round((1.15 + seededRandom(seed + 102) * 0.5) * 100) / 100,
      threshold: 1.0,
      direction: 'above',
      triggered: true,
      strength: 78,
      lastTriggered: '2026-03-14',
    },
    {
      id: 'sig-4',
      name: 'Sentiment Index',
      category: 'sentiment',
      value: Math.round(55 + seededRandom(seed + 103) * 20),
      threshold: 70,
      direction: 'below',
      triggered: true,
      strength: 58,
      lastTriggered: '2026-03-08',
    },
    {
      id: 'sig-5',
      name: 'New Highs vs New Lows',
      category: 'breadth',
      value: Math.round(2.5 + seededRandom(seed + 104) * 2),
      threshold: 2.0,
      direction: 'above',
      triggered: true,
      strength: 81,
      lastTriggered: '2026-03-13',
    },
    {
      id: 'sig-6',
      name: 'Volatility Index (VIX-equivalent)',
      category: 'structural',
      value: Math.round((18 + seededRandom(seed + 105) * 8) * 10) / 10,
      threshold: 25,
      direction: 'below',
      triggered: true,
      strength: 69,
      lastTriggered: '2026-03-11',
    },
    {
      id: 'sig-7',
      name: 'Cross-Category Correlation',
      category: 'structural',
      value: Math.round((0.4 + seededRandom(seed + 106) * 0.3) * 100) / 100,
      threshold: 0.65,
      direction: 'below',
      triggered: true,
      strength: 55,
      lastTriggered: '2026-03-07',
    },
    {
      id: 'sig-8',
      name: 'Smart Money Flow Index',
      category: 'volume',
      value: Math.round(62 + seededRandom(seed + 107) * 18),
      threshold: 55,
      direction: 'above',
      triggered: true,
      strength: 74,
      lastTriggered: '2026-03-14',
    },
    {
      id: 'sig-9',
      name: 'Retail Participation Rate',
      category: 'sentiment',
      value: Math.round(42 + seededRandom(seed + 108) * 15),
      threshold: 60,
      direction: 'below',
      triggered: true,
      strength: 63,
      lastTriggered: '2026-03-09',
    },
    {
      id: 'sig-10',
      name: 'Breakout Breadth (% above 50-day)',
      category: 'momentum',
      value: Math.round(58 + seededRandom(seed + 109) * 15),
      threshold: 50,
      direction: 'above',
      triggered: true,
      strength: 70,
      lastTriggered: '2026-03-12',
    },
  ];
}

// ---- Volume & Breadth ----

function buildVolumeProfiles(): VolumeProfile[] {
  const profiles: VolumeProfile[] = [];
  const startDate = new Date(2025, 2, 1);

  for (let i = 0; i < 12; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    const monthStr = d.toISOString().slice(0, 7);
    const seed = dateSeed() + i * 47;

    const totalVolume = Math.round(12000 + seededRandom(seed) * 8000);
    const buyRatio = 0.4 + seededRandom(seed + 1) * 0.2;
    const buyVolume = Math.round(totalVolume * buyRatio);
    const sellVolume = totalVolume - buyVolume;

    profiles.push({
      month: monthStr,
      totalVolume,
      avgDailyVolume: Math.round(totalVolume / 22),
      volumeZScore: Math.round((seededRandom(seed + 2) - 0.5) * 4 * 100) / 100,
      buyVolume,
      sellVolume,
      netFlow: buyVolume - sellVolume,
      dominantSide: buyRatio > 0.52 ? 'buyers' : buyRatio < 0.48 ? 'sellers' : 'balanced',
    });
  }
  return profiles;
}

function buildBreadthIndicators(): BreadthIndicator[] {
  const seed = dateSeed();
  return [
    { name: 'Advance-Decline Line', value: Math.round(1250 + seededRandom(seed + 200) * 500), interpretation: 'Healthy breadth; broad participation', regime_signal: 'bull', percentile: 72, color: '#22c55e' },
    { name: '% Above 50-day MA', value: Math.round(58 + seededRandom(seed + 201) * 15), interpretation: 'Majority of cards in uptrend', regime_signal: 'bull', percentile: 65, color: '#3b82f6' },
    { name: '% Above 200-day MA', value: Math.round(52 + seededRandom(seed + 202) * 12), interpretation: 'Long-term trends intact', regime_signal: 'recovery', percentile: 58, color: '#06b6d4' },
    { name: 'McClellan Oscillator', value: Math.round((seededRandom(seed + 203) - 0.3) * 80), interpretation: 'Moderate positive momentum', regime_signal: 'bull', percentile: 61, color: '#8b5cf6' },
    { name: 'New High / New Low Ratio', value: Math.round((1.5 + seededRandom(seed + 204) * 2) * 100) / 100, interpretation: 'More new highs than lows', regime_signal: 'bull', percentile: 68, color: '#22c55e' },
    { name: 'Buying Pressure Index', value: Math.round(55 + seededRandom(seed + 205) * 20), interpretation: 'Net buying pressure positive', regime_signal: 'accumulation', percentile: 60, color: '#3b82f6' },
    { name: 'Sector Rotation Score', value: Math.round(40 + seededRandom(seed + 206) * 30), interpretation: 'Moderate rotation activity', regime_signal: null, percentile: 52, color: '#f59e0b' },
    { name: 'Liquidity Breadth', value: Math.round(62 + seededRandom(seed + 207) * 18), interpretation: 'Adequate market liquidity', regime_signal: 'bull', percentile: 64, color: '#06b6d4' },
  ];
}

// ---- Regime Indicators ----

function buildRegimeIndicators(): RegimeIndicator[] {
  const seed = dateSeed();
  return [
    { name: 'Trend Strength', value: Math.round(68 + seededRandom(seed + 300) * 12), signal: 'bullish', weight: 0.20, description: 'Composite measure of directional price movement across all card categories', trend: 'rising', historicalAvg: 55 },
    { name: 'Volume Momentum', value: Math.round(62 + seededRandom(seed + 301) * 10), signal: 'bullish', weight: 0.15, description: 'Rate of change of trading volume relative to 90-day average', trend: 'rising', historicalAvg: 50 },
    { name: 'Market Breadth', value: Math.round(58 + seededRandom(seed + 302) * 14), signal: 'bullish', weight: 0.15, description: 'Percentage of card categories participating in current trend', trend: 'flat', historicalAvg: 52 },
    { name: 'Sentiment Composite', value: Math.round(55 + seededRandom(seed + 303) * 12), signal: 'neutral', weight: 0.12, description: 'Weighted blend of forum sentiment, search trends, and social media activity', trend: 'rising', historicalAvg: 50 },
    { name: 'Volatility Regime', value: Math.round(35 + seededRandom(seed + 304) * 15), signal: 'bullish', weight: 0.10, description: 'Current volatility percentile relative to 2-year range (lower = calmer)', trend: 'falling', historicalAvg: 48 },
    { name: 'Flow Imbalance', value: Math.round(58 + seededRandom(seed + 305) * 10), signal: 'bullish', weight: 0.10, description: 'Net buying vs selling pressure across major platforms', trend: 'rising', historicalAvg: 50 },
    { name: 'Structural Health', value: Math.round(65 + seededRandom(seed + 306) * 10), signal: 'bullish', weight: 0.10, description: 'Assessment of market microstructure: spread tightness, depth, and order flow toxicity', trend: 'flat', historicalAvg: 58 },
    { name: 'Macro Alignment', value: Math.round(52 + seededRandom(seed + 307) * 15), signal: 'neutral', weight: 0.08, description: 'How well macro conditions (consumer spending, interest rates) support card market growth', trend: 'flat', historicalAvg: 50 },
  ];
}

// ---- Public API ----

let _historyCache: RegimeHistory[] | null = null;

function getHistoryCache(): RegimeHistory[] {
  if (!_historyCache) {
    _historyCache = generateRegimeHistory();
  }
  return _historyCache;
}

export function getCurrentRegime(): {
  regime: MarketRegime;
  label: string;
  color: string;
  confidence: number;
  indexValue: number;
  monthlyReturn: number;
  volatility: number;
  description: string;
} {
  const history = getHistoryCache();
  const latest = history[history.length - 1];
  const strategy = buildRegimeStrategies().find(s => s.regime === latest.regime)!;
  return {
    regime: latest.regime,
    label: REGIME_LABELS[latest.regime],
    color: REGIME_COLORS[latest.regime],
    confidence: latest.confidence,
    indexValue: latest.indexValue,
    monthlyReturn: latest.monthlyReturn,
    volatility: latest.volatility,
    description: strategy.description,
  };
}

export function getRegimeHistory(): RegimeHistory[] {
  return getHistoryCache();
}

export function getTransitionProbabilities(): TransitionMatrix[] {
  return buildTransitionMatrix();
}

export function getRegimeStrategy(regime: MarketRegime): RegimeStrategy {
  return buildRegimeStrategies().find(s => s.regime === regime)!;
}

export function getAllRegimeStrategies(): RegimeStrategy[] {
  return buildRegimeStrategies();
}

export function getRegimeIndicators(): RegimeIndicator[] {
  return buildRegimeIndicators();
}

export function getVolumeBreadth(): { volumeProfiles: VolumeProfile[]; breadthIndicators: BreadthIndicator[] } {
  return {
    volumeProfiles: buildVolumeProfiles(),
    breadthIndicators: buildBreadthIndicators(),
  };
}

export function getRegimeConfidence(): RegimeConfidence {
  const history = getHistoryCache();
  const latest = history[history.length - 1];
  const signals = buildRegimeSignals();
  const alignedCount = signals.filter(s => s.triggered).length;

  // Find last transition
  let lastTransitionIdx = history.length - 1;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].isTransition) {
      lastTransitionIdx = i;
      break;
    }
  }

  const regimeDuration = history.length - lastTransitionIdx;

  // Find secondary regime
  const hmm = getHiddenMarkovStates();
  const sorted = hmm.filter(h => h.regime !== latest.regime).sort((a, b) => b.probability - a.probability);
  const secondary = sorted[0];

  return {
    currentRegime: latest.regime,
    confidence: latest.confidence,
    secondaryRegime: secondary.regime,
    secondaryConfidence: Math.round(secondary.probability * 100),
    modelAgreement: Math.round(75 + seededRandom(dateSeed() + 400) * 15),
    signalsAligned: alignedCount,
    signalsTotal: signals.length,
    lastRegimeChange: history[lastTransitionIdx].month,
    daysSinceChange: regimeDuration * 30,
    regimeDuration,
    stabilityScore: Math.round(65 + seededRandom(dateSeed() + 401) * 20),
  };
}

export function getRegimeSignals(): RegimeSignal[] {
  return buildRegimeSignals();
}

export function predictNextRegime(): RegimePrediction[] {
  const current = getCurrentRegime();
  const matrix = buildTransitionMatrix().filter(t => t.from === current.regime && t.to !== current.regime);
  const sorted = matrix.sort((a, b) => b.probability - a.probability);

  const drivers: Record<MarketRegime, string[]> = {
    bull: ['Improving earnings reports', 'Rising collector confidence', 'Expanding market breadth'],
    bear: ['Declining demand indicators', 'Rising inventory levels', 'Negative sentiment shift'],
    accumulation: ['Price stabilization at support', 'Insider buying patterns', 'Declining volatility'],
    distribution: ['Narrowing breadth at highs', 'Rising selling volume', 'Retail FOMO indicators'],
    bubble: ['Parabolic price action', 'Extreme social media hype', 'Record new entrants'],
    crash: ['Liquidity evaporation', 'Cascading margin calls', 'Panic selling indicators'],
    recovery: ['Breadth improvement off lows', 'Value buyer accumulation', 'Sentiment bottoming'],
    sideways: ['Range-bound price action', 'Neutral flow balance', 'Low conviction indicators'],
  };

  return sorted.slice(0, 4).map((t, i) => ({
    regime: t.to,
    probability: t.probability,
    timeframe: i === 0 ? '1-3 months' : i === 1 ? '3-6 months' : '6-12 months',
    confidence: Math.round(Math.max(35, 80 - i * 15 + seededRandom(dateSeed() + 500 + i) * 10)),
    keyDrivers: drivers[t.to] || ['Market momentum shift', 'Volume pattern change'],
  }));
}

export function getOptimalActions(): { regime: MarketRegime; action: OptimalAction; rationale: string; urgency: 'immediate' | 'soon' | 'watch' }[] {
  const current = getCurrentRegime();
  const strategy = getRegimeStrategy(current.regime);

  const actionMap: { action: OptimalAction; rationale: string; urgency: 'immediate' | 'soon' | 'watch' }[] = [
    { action: strategy.primaryAction, rationale: `Primary strategy for ${current.label}: ${strategy.keyRules[0]}`, urgency: 'immediate' },
    { action: strategy.secondaryAction, rationale: `Secondary approach: ${strategy.keyRules[1]}`, urgency: 'soon' },
  ];

  const predictions = predictNextRegime();
  if (predictions.length > 0) {
    const nextStrategy = getRegimeStrategy(predictions[0].regime);
    actionMap.push({
      action: nextStrategy.primaryAction,
      rationale: `Prepare for potential ${REGIME_LABELS[predictions[0].regime]} (${Math.round(predictions[0].probability * 100)}% probability): ${nextStrategy.keyRules[0]}`,
      urgency: 'watch',
    });
  }

  return actionMap.map(a => ({ regime: current.regime, ...a }));
}

export function getRegimeComparison(): RegimeComparison[] {
  const history = getHistoryCache();

  return ALL_REGIMES.map(regime => {
    const months = history.filter(h => h.regime === regime);
    if (months.length === 0) {
      return {
        regime,
        avgReturn: 0,
        avgVolatility: 0,
        avgDuration: 0,
        frequency: 0,
        bestPerformer: 'N/A',
        worstPerformer: 'N/A',
        sharpeRatio: 0,
      };
    }

    const avgReturn = Math.round(months.reduce((s, m) => s + m.monthlyReturn, 0) / months.length * 100) / 100;
    const avgVol = Math.round(months.reduce((s, m) => s + m.volatility, 0) / months.length * 100) / 100;

    // Count contiguous segments
    let segments = 0;
    for (let i = 0; i < history.length; i++) {
      if (history[i].regime === regime && (i === 0 || history[i - 1].regime !== regime)) segments++;
    }

    const bestPerformers = ['Rookies', 'Vintage', 'Graded Gems', 'Parallels', 'Autos'];
    const worstPerformers = ['Base Cards', 'Inserts', 'Relics', 'Serial-Numbered', 'Prospects'];
    const seed = regime.length * 41;

    return {
      regime,
      avgReturn,
      avgVolatility: avgVol,
      avgDuration: Math.round(months.length / Math.max(1, segments) * 10) / 10,
      frequency: segments,
      bestPerformer: pick(bestPerformers, seed),
      worstPerformer: pick(worstPerformers, seed + 7),
      sharpeRatio: avgVol > 0 ? Math.round((avgReturn / avgVol) * 100) / 100 : 0,
    };
  });
}

export { REGIME_COLORS, REGIME_LABELS, ALL_REGIMES };
