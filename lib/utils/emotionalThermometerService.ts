// @ts-nocheck
// Emotional Portfolio Thermometer Service
// Behavioral finance layer analyzing trading patterns with real-time emotional temperature scoring

// ---- Types ----

export type EmotionalState = 'zen' | 'confident' | 'anxious' | 'fomo' | 'panic' | 'euphoria' | 'revenge' | 'tilt';

export type TradingBehaviorType =
  | 'rapid_fire_buying'
  | 'panic_selling'
  | 'chasing_losses'
  | 'fomo_buying'
  | 'revenge_trading'
  | 'overtrading'
  | 'balanced';

export type BiasType =
  | 'recency'
  | 'anchoring'
  | 'loss_aversion'
  | 'endowment'
  | 'confirmation'
  | 'sunk_cost'
  | 'herd_mentality';

export type TradeEmotionTag =
  | 'calm_and_calculated'
  | 'excited'
  | 'nervous'
  | 'impulsive'
  | 'fearful'
  | 'greedy'
  | 'regretful'
  | 'confident'
  | 'desperate'
  | 'relieved';

export interface EmotionTrigger {
  id: string;
  name: string;
  description: string;
  frequency: number;
  avgTemperatureIncrease: number;
  lastTriggered: string;
  category: 'market' | 'social' | 'personal' | 'temporal';
}

export interface EmotionalPattern {
  id: string;
  pattern: string;
  description: string;
  occurrences: number;
  averageImpact: number;
  dayOfWeek?: string;
  timeOfDay?: string;
  associatedState: EmotionalState;
}

export interface ThermometerReading {
  temperature: number; // 0-100
  state: EmotionalState;
  triggers: EmotionTrigger[];
  riskMultiplier: number;
  tradingQuality: number; // 0-100
  timestamp: string;
  trend: 'rising' | 'falling' | 'stable';
  sessionDuration: number; // minutes
}

export interface EmotionalHistory {
  date: string;
  avgTemperature: number;
  peakTemperature: number;
  lowTemperature: number;
  dominantState: EmotionalState;
  tradesExecuted: number;
  tradeQuality: number;
  triggers: string[];
}

export interface TradingBehavior {
  type: TradingBehaviorType;
  frequency: number;
  lastOccurrence: string;
  financialImpact: number;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BehavioralAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'danger';
  timestamp: string;
  acknowledged: boolean;
  relatedBehavior: TradingBehaviorType;
}

export interface CooldownRecommendation {
  shouldCoolDown: boolean;
  minutes: number;
  reason: string;
  currentTemp: number;
  suggestedActivities: string[];
  estimatedTempAfter: number;
}

export interface EmotionalProfile {
  dominantState: EmotionalState;
  averageTemperature: number;
  volatility: number;
  resilience: number; // 0-100 how quickly they recover
  selfAwareness: number; // 0-100
  biasResistance: number; // 0-100
  bestTradingState: EmotionalState;
  worstTradingState: EmotionalState;
  totalTradesAnalyzed: number;
  streakDaysCalm: number;
  personalityType: string;
}

export interface BiasDetection {
  id: string;
  biasType: BiasType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  suggestedCorrection: string;
  detectedAt: string;
  frequency: number;
  financialCost: number;
}

export interface TradingSession {
  id: string;
  startTime: string;
  endTime: string;
  startTemperature: number;
  endTemperature: number;
  peakTemperature: number;
  tradesExecuted: number;
  profitLoss: number;
  emotionalJourney: EmotionalState[];
  overallQuality: number;
  alerts: BehavioralAlert[];
  biasesDetected: BiasType[];
}

export interface EmotionalJournalEntry {
  id: string;
  tradeId: string;
  preTradeFeeling: TradeEmotionTag;
  postTradeFeeling: TradeEmotionTag;
  temperature: number;
  notes: string;
  timestamp: string;
  outcome: 'profit' | 'loss' | 'neutral';
  amount: number;
}

// ---- Helpers ----

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function minutesAgo(n: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}

const STATE_TEMPS: Record<EmotionalState, [number, number]> = {
  zen: [0, 15],
  confident: [15, 30],
  anxious: [35, 55],
  fomo: [50, 70],
  panic: [65, 85],
  euphoria: [55, 75],
  revenge: [70, 90],
  tilt: [85, 100],
};

const STATE_LABELS: Record<EmotionalState, string> = {
  zen: 'Zen - Ice Cold Rational',
  confident: 'Confident - Measured & Focused',
  anxious: 'Anxious - Overthinking',
  fomo: 'FOMO - Fear of Missing Out',
  panic: 'Panic - Fight or Flight',
  euphoria: 'Euphoria - Overconfident',
  revenge: 'Revenge - Chasing Losses',
  tilt: 'Full Tilt - Emotional Overload',
};

export { STATE_LABELS };

// ---- Mock Data ----

const mockTriggers: EmotionTrigger[] = [
  { id: 't1', name: 'Market Flash Crash', description: 'Sudden market drop >5% triggered anxiety', frequency: 3, avgTemperatureIncrease: 28, lastTriggered: hoursAgo(4), category: 'market' },
  { id: 't2', name: 'Social Media Hype', description: 'Viral tweet about a card spiking prices', frequency: 8, avgTemperatureIncrease: 18, lastTriggered: hoursAgo(1), category: 'social' },
  { id: 't3', name: 'Consecutive Losses', description: '3+ trades in a row at a loss', frequency: 5, avgTemperatureIncrease: 35, lastTriggered: daysAgo(1), category: 'personal' },
  { id: 't4', name: 'Late Night Trading', description: 'Trading after 11 PM when judgment declines', frequency: 12, avgTemperatureIncrease: 15, lastTriggered: daysAgo(0), category: 'temporal' },
  { id: 't5', name: 'Auction Bidding War', description: 'Competitive bidding escalation', frequency: 6, avgTemperatureIncrease: 22, lastTriggered: daysAgo(2), category: 'market' },
  { id: 't6', name: 'Portfolio Milestone', description: 'Portfolio crossed significant value threshold', frequency: 2, avgTemperatureIncrease: 12, lastTriggered: daysAgo(5), category: 'personal' },
  { id: 't7', name: 'Breaking News', description: 'Player injury/trade news impacting card values', frequency: 4, avgTemperatureIncrease: 20, lastTriggered: hoursAgo(6), category: 'market' },
  { id: 't8', name: 'Weekend Market Open', description: 'Monday morning market volatility', frequency: 4, avgTemperatureIncrease: 14, lastTriggered: daysAgo(3), category: 'temporal' },
  { id: 't9', name: 'Friend Bragging', description: 'Peer shared large profit on social media', frequency: 7, avgTemperatureIncrease: 20, lastTriggered: daysAgo(1), category: 'social' },
  { id: 't10', name: 'Payday Impulse', description: 'Increased spending right after payday', frequency: 2, avgTemperatureIncrease: 16, lastTriggered: daysAgo(14), category: 'temporal' },
];

const mockBehaviors: TradingBehavior[] = [
  { type: 'rapid_fire_buying', frequency: 4, lastOccurrence: daysAgo(3), financialImpact: -1240, description: 'Made 7 purchases within 20 minutes during market dip', severity: 'high' },
  { type: 'panic_selling', frequency: 3, lastOccurrence: daysAgo(7), financialImpact: -3200, description: 'Sold 4 cards below market value during flash crash', severity: 'critical' },
  { type: 'chasing_losses', frequency: 5, lastOccurrence: daysAgo(1), financialImpact: -890, description: 'Bought higher-risk cards trying to recover previous losses', severity: 'high' },
  { type: 'fomo_buying', frequency: 8, lastOccurrence: daysAgo(0), financialImpact: -2100, description: 'Purchased cards after seeing price spikes on social media', severity: 'high' },
  { type: 'revenge_trading', frequency: 2, lastOccurrence: daysAgo(10), financialImpact: -1800, description: 'Immediately re-entered market after a loss to "get even"', severity: 'critical' },
  { type: 'overtrading', frequency: 6, lastOccurrence: daysAgo(2), financialImpact: -650, description: 'Executed 15+ trades in a single day with diminishing quality', severity: 'medium' },
  { type: 'balanced', frequency: 18, lastOccurrence: daysAgo(0), financialImpact: 4200, description: 'Well-researched trades with proper position sizing', severity: 'low' },
];

const mockBiases: BiasDetection[] = [
  { id: 'b1', biasType: 'recency', severity: 'high', evidence: 'You weighted last week\'s price movement 4x more than 90-day trends in 6 recent decisions', suggestedCorrection: 'Always check 90-day moving average before making a trade. Set a rule to compare 7-day vs 90-day trends.', detectedAt: daysAgo(1), frequency: 12, financialCost: 1450 },
  { id: 'b2', biasType: 'loss_aversion', severity: 'critical', evidence: 'You hold losing positions 3.2x longer than winning ones. Average hold for losers: 47 days vs winners: 15 days.', suggestedCorrection: 'Set automatic stop-loss at 15% below purchase price. Review all positions older than 30 days.', detectedAt: daysAgo(2), frequency: 8, financialCost: 3800 },
  { id: 'b3', biasType: 'anchoring', severity: 'medium', evidence: 'You reference purchase price in 80% of sell decisions instead of current market dynamics', suggestedCorrection: 'Before each sell decision, cover the purchase price and evaluate the card as if you were buying it today.', detectedAt: daysAgo(3), frequency: 6, financialCost: 920 },
  { id: 'b4', biasType: 'herd_mentality', severity: 'high', evidence: 'Your purchase frequency increases 340% within 2 hours of trending social media posts', suggestedCorrection: 'Enable a 4-hour cooling period after seeing viral content. Research independently before acting.', detectedAt: daysAgo(0), frequency: 9, financialCost: 2100 },
  { id: 'b5', biasType: 'sunk_cost', severity: 'medium', evidence: 'You invested additional $2,400 into declining cards "because you\'re already in"', suggestedCorrection: 'Evaluate each additional investment as a new decision. Ask: "Would I buy this card at this price today?"', detectedAt: daysAgo(5), frequency: 4, financialCost: 1600 },
  { id: 'b6', biasType: 'confirmation', severity: 'low', evidence: 'Search history shows you seek bullish opinions 5x more than bearish analysis on your holdings', suggestedCorrection: 'For every bullish article, read one bearish take. Use a devil\'s advocate checklist.', detectedAt: daysAgo(7), frequency: 3, financialCost: 400 },
  { id: 'b7', biasType: 'endowment', severity: 'medium', evidence: 'You value your owned cards ~25% higher than identical cards in the market', suggestedCorrection: 'Check recent comp sales before pricing. Treat your card like one you\'re evaluating to buy.', detectedAt: daysAgo(4), frequency: 5, financialCost: 750 },
];

const mockPatterns: EmotionalPattern[] = [
  { id: 'p1', pattern: 'Monday Panic Seller', description: 'You tend to panic sell on Monday mornings after weekend news accumulates', occurrences: 7, averageImpact: -420, dayOfWeek: 'Monday', timeOfDay: '9-11 AM', associatedState: 'panic' },
  { id: 'p2', pattern: 'Late Night FOMO', description: 'FOMO buying increases 280% after 10 PM, with 73% of those trades underperforming', occurrences: 14, averageImpact: -180, timeOfDay: '10 PM - 1 AM', associatedState: 'fomo' },
  { id: 'p3', pattern: 'Post-Loss Revenge Cycle', description: 'Within 30 minutes of a loss >$200, you make 2.5x more trades at higher risk', occurrences: 5, averageImpact: -650, associatedState: 'revenge' },
  { id: 'p4', pattern: 'Euphoria Overbuying', description: 'After a big win, you increase position sizes by 40% for the next 3 trades', occurrences: 8, averageImpact: -220, associatedState: 'euphoria' },
  { id: 'p5', pattern: 'Wednesday Zen Zone', description: 'Mid-week trades show best quality scores, lowest emotional temperatures', occurrences: 22, averageImpact: 310, dayOfWeek: 'Wednesday', associatedState: 'zen' },
  { id: 'p6', pattern: 'Social Media Cascade', description: 'Checking social media before trading correlates with 2.1x higher temperatures', occurrences: 11, averageImpact: -340, associatedState: 'fomo' },
];

function generateEmotionalHistory(days: number): EmotionalHistory[] {
  const states: EmotionalState[] = ['zen', 'confident', 'anxious', 'fomo', 'panic', 'euphoria', 'revenge', 'tilt'];
  const history: EmotionalHistory[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Simulate realistic pattern: weekends calmer, midweek productive, some spikes
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isMonday = dayOfWeek === 1;
    const isWednesday = dayOfWeek === 3;

    let baseTemp = 30 + Math.random() * 25;
    if (isWeekend) baseTemp -= 10;
    if (isMonday) baseTemp += 12;
    if (isWednesday) baseTemp -= 8;
    // Add some spike days
    if (i === 7) baseTemp = 78; // panic day
    if (i === 14) baseTemp = 82; // tilt day
    if (i === 3) baseTemp = 62; // fomo day
    if (i === 21) baseTemp = 15; // zen day

    baseTemp = Math.max(5, Math.min(95, baseTemp));
    const peak = Math.min(100, baseTemp + 10 + Math.random() * 15);
    const low = Math.max(0, baseTemp - 10 - Math.random() * 15);

    const stateIdx = Math.min(states.length - 1, Math.floor(baseTemp / 13));
    const quality = Math.max(10, 100 - baseTemp + (Math.random() * 20 - 10));

    const triggers: string[] = [];
    if (isMonday) triggers.push('Weekend News Accumulation');
    if (baseTemp > 60) triggers.push('Market Volatility');
    if (baseTemp > 70) triggers.push('Consecutive Losses');
    if (Math.random() > 0.6) triggers.push('Social Media');

    history.push({
      date: d.toISOString().split('T')[0],
      avgTemperature: Math.round(baseTemp),
      peakTemperature: Math.round(peak),
      lowTemperature: Math.round(low),
      dominantState: states[stateIdx],
      tradesExecuted: Math.floor(Math.random() * 8) + 1,
      tradeQuality: Math.round(quality),
      triggers,
    });
  }
  return history;
}

const mockJournalEntries: EmotionalJournalEntry[] = [
  { id: 'j1', tradeId: 'tr-001', preTradeFeeling: 'calm_and_calculated', postTradeFeeling: 'confident', temperature: 22, notes: 'Researched for 2 days before this purchase. Feels solid.', timestamp: daysAgo(1), outcome: 'profit', amount: 450 },
  { id: 'j2', tradeId: 'tr-002', preTradeFeeling: 'nervous', postTradeFeeling: 'regretful', temperature: 58, notes: 'Bought because everyone on Twitter was hyping it. Should have waited.', timestamp: daysAgo(2), outcome: 'loss', amount: -180 },
  { id: 'j3', tradeId: 'tr-003', preTradeFeeling: 'impulsive', postTradeFeeling: 'desperate', temperature: 74, notes: 'Tried to make back yesterday\'s loss. Made it worse.', timestamp: daysAgo(3), outcome: 'loss', amount: -320 },
  { id: 'j4', tradeId: 'tr-004', preTradeFeeling: 'excited', postTradeFeeling: 'relieved', temperature: 45, notes: 'Spotted undervalued card. Bit anxious about the size but it paid off.', timestamp: daysAgo(5), outcome: 'profit', amount: 890 },
  { id: 'j5', tradeId: 'tr-005', preTradeFeeling: 'fearful', postTradeFeeling: 'regretful', temperature: 68, notes: 'Panic sold during the dip. Card recovered 2 hours later.', timestamp: daysAgo(7), outcome: 'loss', amount: -540 },
  { id: 'j6', tradeId: 'tr-006', preTradeFeeling: 'greedy', postTradeFeeling: 'relieved', temperature: 62, notes: 'Held longer than I should have but still exited with profit.', timestamp: daysAgo(8), outcome: 'profit', amount: 220 },
  { id: 'j7', tradeId: 'tr-007', preTradeFeeling: 'calm_and_calculated', postTradeFeeling: 'confident', temperature: 18, notes: 'Perfect execution. Set limit order, walked away. Filled at target.', timestamp: daysAgo(10), outcome: 'profit', amount: 680 },
  { id: 'j8', tradeId: 'tr-008', preTradeFeeling: 'impulsive', postTradeFeeling: 'regretful', temperature: 82, notes: 'Full tilt after bad morning. 4 trades in 10 minutes, all bad.', timestamp: daysAgo(14), outcome: 'loss', amount: -1100 },
];

const mockSession: TradingSession = {
  id: 'sess-today',
  startTime: hoursAgo(3),
  endTime: new Date().toISOString(),
  startTemperature: 28,
  endTemperature: 52,
  peakTemperature: 67,
  tradesExecuted: 5,
  profitLoss: -340,
  emotionalJourney: ['confident', 'confident', 'anxious', 'fomo', 'anxious'],
  overallQuality: 58,
  alerts: [
    { id: 'a1', message: 'Trading frequency increased 3x in last 30 minutes', severity: 'warning', timestamp: minutesAgo(45), acknowledged: false, relatedBehavior: 'rapid_fire_buying' },
    { id: 'a2', message: 'Detected FOMO pattern: purchase followed viral social media post by 8 minutes', severity: 'danger', timestamp: minutesAgo(20), acknowledged: false, relatedBehavior: 'fomo_buying' },
    { id: 'a3', message: 'Temperature rising steadily - consider taking a break', severity: 'warning', timestamp: minutesAgo(10), acknowledged: true, relatedBehavior: 'overtrading' },
  ],
  biasesDetected: ['recency', 'herd_mentality'],
};

// ---- Service Functions ----

export function getCurrentReading(): ThermometerReading {
  return {
    temperature: 52,
    state: 'anxious',
    triggers: mockTriggers.slice(0, 3),
    riskMultiplier: 1.8,
    tradingQuality: 58,
    timestamp: new Date().toISOString(),
    trend: 'rising',
    sessionDuration: 187,
  };
}

export function getEmotionalHistory(days: number): EmotionalHistory[] {
  return generateEmotionalHistory(days);
}

export function analyzeTradingSession(): TradingSession {
  return mockSession;
}

export function detectBiases(): BiasDetection[] {
  return mockBiases;
}

export function getBehavioralPatterns(): TradingBehavior[] {
  return mockBehaviors;
}

export function shouldBlockTrade(tradeValue: number): { block: boolean; reason: string; cooldownMinutes: number } {
  const reading = getCurrentReading();
  if (reading.temperature >= 80) {
    return { block: true, reason: `Emotional temperature at ${reading.temperature}°. You are in a ${reading.state} state. Trading now has historically resulted in ${(reading.riskMultiplier * 100 - 100).toFixed(0)}% higher losses.`, cooldownMinutes: 30 };
  }
  if (reading.temperature >= 65 && tradeValue > 500) {
    return { block: true, reason: `High emotional temperature (${reading.temperature}°) combined with large trade value ($${tradeValue}). Consider reducing position size or waiting.`, cooldownMinutes: 15 };
  }
  if (reading.temperature >= 50) {
    return { block: false, reason: `Elevated temperature (${reading.temperature}°). Proceed with caution and stick to your pre-defined strategy.`, cooldownMinutes: 0 };
  }
  return { block: false, reason: 'Emotional state is within acceptable range. Good to trade.', cooldownMinutes: 0 };
}

export function getCooldownRecommendation(): CooldownRecommendation {
  const reading = getCurrentReading();
  if (reading.temperature >= 60) {
    return {
      shouldCoolDown: true,
      minutes: Math.ceil((reading.temperature - 40) / 2),
      reason: `Your temperature is ${reading.temperature}°. Historical data shows trades made above 60° underperform by 34%.`,
      currentTemp: reading.temperature,
      suggestedActivities: [
        'Step away from screens for 10 minutes',
        'Review your trading journal from best trades',
        'Do a 5-minute breathing exercise',
        'Review your pre-set trading rules',
        'Check your 30-day performance trend',
      ],
      estimatedTempAfter: Math.max(25, reading.temperature - 20),
    };
  }
  return {
    shouldCoolDown: false,
    minutes: 0,
    reason: 'You are in a good emotional state for trading.',
    currentTemp: reading.temperature,
    suggestedActivities: [],
    estimatedTempAfter: reading.temperature,
  };
}

export function getEmotionalProfile(): EmotionalProfile {
  return {
    dominantState: 'confident',
    averageTemperature: 38,
    volatility: 24,
    resilience: 62,
    selfAwareness: 71,
    biasResistance: 45,
    bestTradingState: 'zen',
    worstTradingState: 'revenge',
    totalTradesAnalyzed: 247,
    streakDaysCalm: 3,
    personalityType: 'Analytical Trader with FOMO Tendencies',
  };
}

export function tagTradeEmotion(_tradeId: string, _tag: TradeEmotionTag): void {
  // In production, would persist to database
}

export function getTradeQualityScore(): number {
  return 58;
}

export function getEmotionalTriggers(): EmotionTrigger[] {
  return mockTriggers;
}

export function getEmotionalPatterns(): EmotionalPattern[] {
  return mockPatterns;
}

export function getJournalEntries(): EmotionalJournalEntry[] {
  return mockJournalEntries;
}

export function getStateColor(state: EmotionalState): string {
  const colors: Record<EmotionalState, string> = {
    zen: '#3b82f6',
    confident: '#22c55e',
    anxious: '#eab308',
    fomo: '#f97316',
    panic: '#ef4444',
    euphoria: '#a855f7',
    revenge: '#dc2626',
    tilt: '#991b1b',
  };
  return colors[state];
}

export function getTemperatureColor(temp: number): string {
  if (temp <= 20) return '#3b82f6'; // blue
  if (temp <= 35) return '#22c55e'; // green
  if (temp <= 50) return '#84cc16'; // lime
  if (temp <= 65) return '#eab308'; // yellow
  if (temp <= 80) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function getTemperatureGradient(temp: number): string {
  if (temp <= 20) return 'from-blue-600 to-blue-400';
  if (temp <= 35) return 'from-green-600 to-green-400';
  if (temp <= 50) return 'from-lime-600 to-yellow-400';
  if (temp <= 65) return 'from-yellow-500 to-orange-400';
  if (temp <= 80) return 'from-orange-500 to-red-400';
  return 'from-red-600 to-red-400';
}
