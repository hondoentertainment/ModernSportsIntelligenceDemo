// Mental Health Safeguards Service

// ---- Types ----

export interface SpendingCircuitBreaker {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly';
  limit: number;
  current: number;
  remaining: number;
  status: 'safe' | 'warning' | 'triggered';
  triggeredAt?: string;
}

export interface AddictionSignal {
  signal: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  recommendation: string;
}

export interface SessionPattern {
  hour: number; // 0-23
  sessionCount: number;
  purchaseCount: number;
  avgSpend: number;
}

export interface CoolingOffPeriod {
  id: string;
  triggerReason: string;
  startedAt: string;
  duration: string;
  status: 'active' | 'completed' | 'skipped';
  cardsConsideredDuring: number;
}

export interface WellnessScore {
  overall: number; // 0-100
  financial: number;
  behavioral: number;
  emotional: number;
  trend: string;
}

export interface SpendingVelocity {
  period: string;
  transactions: number;
  amount: number;
  vsAverage: number;
}

export interface WellnessTip {
  id: string;
  message: string;
  category: 'mindset' | 'financial' | 'behavioral';
}

// ---- Mock Data ----

const CIRCUIT_BREAKERS: SpendingCircuitBreaker[] = [
  {
    id: 'cb-001',
    name: 'Daily Spending Cap',
    type: 'daily',
    limit: 500,
    current: 420,
    remaining: 80,
    status: 'warning',
    triggeredAt: undefined,
  },
  {
    id: 'cb-002',
    name: 'Weekly Purchase Limit',
    type: 'weekly',
    limit: 1500,
    current: 1580,
    remaining: 0,
    status: 'triggered',
    triggeredAt: '2026-03-17T14:32:00',
  },
  {
    id: 'cb-003',
    name: 'Monthly Budget',
    type: 'monthly',
    limit: 5000,
    current: 3240,
    remaining: 1760,
    status: 'safe',
    triggeredAt: undefined,
  },
  {
    id: 'cb-004',
    name: 'Single Card Limit',
    type: 'daily',
    limit: 2000,
    current: 0,
    remaining: 2000,
    status: 'safe',
    triggeredAt: undefined,
  },
];

const ADDICTION_SIGNALS: AddictionSignal[] = [
  {
    signal: 'Late-Night Purchase Spike',
    severity: 'high',
    description: '7 of your last 10 purchases occurred between 11 PM – 3 AM, a 340% above your baseline.',
    detectedAt: '2026-03-18T08:00:00',
    recommendation: 'Enable a 10 PM spending curfew for 30 days to reset your purchasing rhythm.',
  },
  {
    signal: 'Purchase Velocity Surge',
    severity: 'critical',
    description: 'You completed 14 transactions this week vs. your 4-transaction weekly average — 250% above normal.',
    detectedAt: '2026-03-17T22:15:00',
    recommendation: 'Activate a 72-hour cooling-off period immediately and review your wish list instead of buying.',
  },
  {
    signal: 'Debt-to-Collection Ratio Alert',
    severity: 'high',
    description: 'Estimated card credit balance ($3,200) now exceeds 18% of current collection value. Target is under 5%.',
    detectedAt: '2026-03-16T10:30:00',
    recommendation: 'Pause all new purchases until ratio drops below 10%. Consider selling duplicate holdings.',
  },
  {
    signal: 'Auction Monitoring Obsession',
    severity: 'medium',
    description: 'You logged 22 app sessions yesterday, with average session under 3 minutes — a compulsive checking pattern.',
    detectedAt: '2026-03-17T23:45:00',
    recommendation: 'Reduce app opens to 3 times per day. Use daily digest notifications instead of real-time alerts.',
  },
  {
    signal: 'Impulse Bid Rate',
    severity: 'medium',
    description: '68% of your bids in the last 14 days were placed with under 5 minutes of consideration.',
    detectedAt: '2026-03-15T09:00:00',
    recommendation: 'Enable the 15-minute bid reflection timer before any bid can be submitted.',
  },
  {
    signal: 'FOMO-Driven Purchases',
    severity: 'low',
    description: '4 of your last 6 purchases were triggered by social media posts or Discord alerts, not your watchlist.',
    detectedAt: '2026-03-14T14:20:00',
    recommendation: 'Mute card trading Discord servers for one week and focus only on pre-approved watchlist targets.',
  },
];

const SESSION_PATTERNS: SessionPattern[] = [
  { hour: 0, sessionCount: 3, purchaseCount: 2, avgSpend: 340 },
  { hour: 1, sessionCount: 4, purchaseCount: 3, avgSpend: 520 },
  { hour: 2, sessionCount: 2, purchaseCount: 2, avgSpend: 280 },
  { hour: 3, sessionCount: 1, purchaseCount: 1, avgSpend: 195 },
  { hour: 4, sessionCount: 0, purchaseCount: 0, avgSpend: 0 },
  { hour: 5, sessionCount: 0, purchaseCount: 0, avgSpend: 0 },
  { hour: 6, sessionCount: 1, purchaseCount: 0, avgSpend: 0 },
  { hour: 7, sessionCount: 2, purchaseCount: 1, avgSpend: 85 },
  { hour: 8, sessionCount: 3, purchaseCount: 1, avgSpend: 120 },
  { hour: 9, sessionCount: 4, purchaseCount: 2, avgSpend: 210 },
  { hour: 10, sessionCount: 3, purchaseCount: 1, avgSpend: 145 },
  { hour: 11, sessionCount: 2, purchaseCount: 1, avgSpend: 90 },
  { hour: 12, sessionCount: 3, purchaseCount: 2, avgSpend: 175 },
  { hour: 13, sessionCount: 2, purchaseCount: 0, avgSpend: 0 },
  { hour: 14, sessionCount: 3, purchaseCount: 1, avgSpend: 110 },
  { hour: 15, sessionCount: 2, purchaseCount: 1, avgSpend: 95 },
  { hour: 16, sessionCount: 1, purchaseCount: 0, avgSpend: 0 },
  { hour: 17, sessionCount: 2, purchaseCount: 1, avgSpend: 130 },
  { hour: 18, sessionCount: 4, purchaseCount: 2, avgSpend: 240 },
  { hour: 19, sessionCount: 5, purchaseCount: 3, avgSpend: 310 },
  { hour: 20, sessionCount: 6, purchaseCount: 3, avgSpend: 395 },
  { hour: 21, sessionCount: 7, purchaseCount: 4, avgSpend: 460 },
  { hour: 22, sessionCount: 8, purchaseCount: 5, avgSpend: 580 },
  { hour: 23, sessionCount: 6, purchaseCount: 4, avgSpend: 490 },
];

const COOLING_OFF_PERIODS: CoolingOffPeriod[] = [
  {
    id: 'cop-001',
    triggerReason: 'Weekly spend limit exceeded',
    startedAt: '2026-03-17T14:32:00',
    duration: '48 hours',
    status: 'active',
    cardsConsideredDuring: 12,
  },
  {
    id: 'cop-002',
    triggerReason: 'Manual — self-requested pause',
    startedAt: '2026-02-28T09:00:00',
    duration: '72 hours',
    status: 'completed',
    cardsConsideredDuring: 8,
  },
  {
    id: 'cop-003',
    triggerReason: 'Late-night purchase spike detected',
    startedAt: '2026-02-14T03:15:00',
    duration: '24 hours',
    status: 'skipped',
    cardsConsideredDuring: 3,
  },
  {
    id: 'cop-004',
    triggerReason: 'Debt-to-collection ratio alert',
    startedAt: '2026-01-20T11:00:00',
    duration: '7 days',
    status: 'completed',
    cardsConsideredDuring: 24,
  },
  {
    id: 'cop-005',
    triggerReason: 'Velocity surge — 3x weekly average',
    startedAt: '2025-12-31T22:00:00',
    duration: '48 hours',
    status: 'completed',
    cardsConsideredDuring: 7,
  },
];

const WELLNESS_SCORE: WellnessScore = {
  overall: 38,
  financial: 45,
  behavioral: 28,
  emotional: 42,
  trend: 'declining',
};

const SPENDING_VELOCITY: SpendingVelocity[] = [
  { period: '6 Weeks Ago', transactions: 3, amount: 420, vsAverage: -32 },
  { period: '5 Weeks Ago', transactions: 4, amount: 610, vsAverage: -2 },
  { period: '4 Weeks Ago', transactions: 5, amount: 890, vsAverage: 42 },
  { period: '3 Weeks Ago', transactions: 4, amount: 720, vsAverage: 15 },
  { period: '2 Weeks Ago', transactions: 8, amount: 1840, vsAverage: 194 },
  { period: 'Last Week', transactions: 14, amount: 3220, vsAverage: 414 },
  { period: 'Avg Week', transactions: 4, amount: 625, vsAverage: 0 },
];

const WELLNESS_TIPS: WellnessTip[] = [
  {
    id: 'wt-001',
    message: 'Your collection is an investment, not an escape. Build it with intention, not impulse.',
    category: 'mindset',
  },
  {
    id: 'wt-002',
    message: 'The best card you own is the one you bought with clear eyes and a full plan — not at 2 AM.',
    category: 'behavioral',
  },
  {
    id: 'wt-003',
    message: 'A 24-hour wait on any card over $200 protects your portfolio from emotion-driven overpaying.',
    category: 'financial',
  },
  {
    id: 'wt-004',
    message: 'Scarcity is a sales tactic. True value does not evaporate in 10 minutes.',
    category: 'mindset',
  },
  {
    id: 'wt-005',
    message: 'Track how you feel before every purchase. Stressed? Tired? Excited? Emotion predicts regret.',
    category: 'behavioral',
  },
];

// ---- Exported Functions ----

export function getCircuitBreakers(): SpendingCircuitBreaker[] {
  return CIRCUIT_BREAKERS;
}

export function getAddictionSignals(): AddictionSignal[] {
  return ADDICTION_SIGNALS;
}

export function getSessionPatterns(): SessionPattern[] {
  return SESSION_PATTERNS;
}

export function getCoolingOffPeriods(): CoolingOffPeriod[] {
  return COOLING_OFF_PERIODS;
}

export function getWellnessScore(): WellnessScore {
  return WELLNESS_SCORE;
}

export function getSpendingVelocity(): SpendingVelocity[] {
  return SPENDING_VELOCITY;
}

export function getWellnessTips(): WellnessTip[] {
  return WELLNESS_TIPS;
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}
