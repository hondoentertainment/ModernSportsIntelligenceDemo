// ---- Types ----

export type CyclePhase = 'escalation' | 'peak' | 'cooldown' | 'baseline';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'late_night';

export interface DopamineCycle {
  id: string;
  userId: string;
  phase: CyclePhase;
  startDate: string;
  endDate: string | null;
  purchaseCount: number;
  totalSpend: number;
  averageTimeBetweenPurchases: number; // minutes
  peakSpendDay: string;
  intensityScore: number; // 0-100
}

export interface PurchasePattern {
  id: string;
  label: string;
  timeOfDay: TimeOfDay;
  dayOfWeek: string;
  frequency: number; // purchases per week in this slot
  averageSpend: number;
  impulseProbability: number; // 0-1
  description: string;
}

export interface CooldownScore {
  overall: number; // 0-100, higher = healthier
  daysSinceLastPurchase: number;
  breakParticipationRate: number; // % of breaks joined vs browsed
  avgSessionDuration: number; // minutes
  windowShoppingRatio: number; // views-to-purchase ratio
  trend: 'improving' | 'worsening' | 'stable';
  recommendation: string;
}

export interface BehaviorAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  triggeredAt: string;
  suggestion: string;
}

export interface BehaviorStats {
  totalPurchases30d: number;
  totalSpend30d: number;
  avgDailySpend: number;
  spendAcceleration: number; // % change week-over-week
  longestCooldownStreak: number; // days
  mostActiveHour: number;
  impulseRate: number; // % of purchases under 2min browse time
  breakAddiction: number; // 0-100 score
}

// ---- Mock Data ----

const mockCycles: DopamineCycle[] = [
  {
    id: 'dc-001',
    userId: 'user-1',
    phase: 'cooldown',
    startDate: '2026-02-15',
    endDate: '2026-02-22',
    purchaseCount: 14,
    totalSpend: 2340,
    averageTimeBetweenPurchases: 42,
    peakSpendDay: '2026-02-18',
    intensityScore: 78,
  },
  {
    id: 'dc-002',
    userId: 'user-1',
    phase: 'baseline',
    startDate: '2026-02-23',
    endDate: '2026-03-05',
    purchaseCount: 3,
    totalSpend: 285,
    averageTimeBetweenPurchases: 2880,
    peakSpendDay: '2026-02-27',
    intensityScore: 12,
  },
  {
    id: 'dc-003',
    userId: 'user-1',
    phase: 'escalation',
    startDate: '2026-03-06',
    endDate: null,
    purchaseCount: 8,
    totalSpend: 1125,
    averageTimeBetweenPurchases: 95,
    peakSpendDay: '2026-03-14',
    intensityScore: 61,
  },
  {
    id: 'dc-004',
    userId: 'user-1',
    phase: 'peak',
    startDate: '2026-01-10',
    endDate: '2026-01-14',
    purchaseCount: 22,
    totalSpend: 4870,
    averageTimeBetweenPurchases: 18,
    peakSpendDay: '2026-01-12',
    intensityScore: 94,
  },
];

const mockPatterns: PurchasePattern[] = [
  {
    id: 'pp-001',
    label: 'Late-Night Break Chasing',
    timeOfDay: 'late_night',
    dayOfWeek: 'Friday',
    frequency: 3.2,
    averageSpend: 185,
    impulseProbability: 0.82,
    description: 'Purchases spike between 11PM-2AM on Fridays, often coinciding with live break streams. High impulse probability suggests FOMO-driven behavior.',
  },
  {
    id: 'pp-002',
    label: 'Payday Surge',
    timeOfDay: 'afternoon',
    dayOfWeek: 'Thursday',
    frequency: 2.1,
    averageSpend: 320,
    impulseProbability: 0.45,
    description: 'Biweekly spending spikes on Thursday afternoons correlate with typical payroll deposit timing. Spend amounts are higher but more deliberate.',
  },
  {
    id: 'pp-003',
    label: 'Morning Auction Sniping',
    timeOfDay: 'morning',
    dayOfWeek: 'Sunday',
    frequency: 1.8,
    averageSpend: 142,
    impulseProbability: 0.33,
    description: 'Consistent Sunday morning activity targeting ending auctions. Lower impulse rate suggests planned acquisition strategy.',
  },
  {
    id: 'pp-004',
    label: 'Midweek Rip Sessions',
    timeOfDay: 'evening',
    dayOfWeek: 'Wednesday',
    frequency: 2.5,
    averageSpend: 89,
    impulseProbability: 0.71,
    description: 'Wednesday evening break participation with high frequency of low-cost spot purchases. Pattern consistent with dopamine-seeking rip behavior.',
  },
  {
    id: 'pp-005',
    label: 'Post-Loss Revenge Buying',
    timeOfDay: 'evening',
    dayOfWeek: 'Monday',
    frequency: 1.4,
    averageSpend: 267,
    impulseProbability: 0.88,
    description: 'Elevated spending on Monday evenings after weekend sports losses. Emotional spending pattern with highest impulse probability in profile.',
  },
];

const mockCooldownScore: CooldownScore = {
  overall: 54,
  daysSinceLastPurchase: 2,
  breakParticipationRate: 68,
  avgSessionDuration: 34,
  windowShoppingRatio: 4.2,
  trend: 'worsening',
  recommendation: 'Your purchase frequency has increased 40% this week. Consider setting a 48-hour cooling-off rule for purchases over $100.',
};

const mockAlerts: BehaviorAlert[] = [
  {
    id: 'ba-001',
    severity: 'critical',
    title: 'Spending Acceleration Detected',
    description: 'Week-over-week spending has increased 67% with decreasing time between purchases. This pattern preceded your January overconsumption cycle.',
    metric: 'spendAcceleration',
    currentValue: 67,
    threshold: 50,
    triggeredAt: '2026-03-15T22:14:00Z',
    suggestion: 'Activate a voluntary 72-hour purchase cooldown to break the escalation pattern.',
  },
  {
    id: 'ba-002',
    severity: 'warning',
    title: 'Late-Night Purchase Cluster',
    description: '5 of your last 8 purchases occurred between 11PM and 2AM. Nighttime purchases in your history average 31% higher regret rates.',
    metric: 'lateNightPurchaseRate',
    currentValue: 62.5,
    threshold: 40,
    triggeredAt: '2026-03-14T01:33:00Z',
    suggestion: 'Enable the scheduled purchase lock feature for 11PM-7AM to protect against impulsive late-night buying.',
  },
  {
    id: 'ba-003',
    severity: 'warning',
    title: 'Break Participation Exceeding Budget',
    description: 'You have joined 12 breaks this week against a self-set limit of 5. Break spots account for 74% of weekly spend.',
    metric: 'breakParticipationRate',
    currentValue: 12,
    threshold: 5,
    triggeredAt: '2026-03-13T19:45:00Z',
    suggestion: 'Review your break budget allocation. Consider switching to observation-only mode for the remainder of the week.',
  },
  {
    id: 'ba-004',
    severity: 'info',
    title: 'Healthy Cooldown Window Ending',
    description: 'Your 10-day purchase break is your longest in 3 months. Returning to the market now carries moderate re-escalation risk.',
    metric: 'cooldownDays',
    currentValue: 10,
    threshold: 7,
    triggeredAt: '2026-03-06T08:00:00Z',
    suggestion: 'Ease back with a strict single-purchase-per-day rule for the first week.',
  },
];

const mockBehaviorStats: BehaviorStats = {
  totalPurchases30d: 47,
  totalSpend30d: 6245,
  avgDailySpend: 208.17,
  spendAcceleration: 67,
  longestCooldownStreak: 10,
  mostActiveHour: 23,
  impulseRate: 42,
  breakAddiction: 71,
};

// ---- Public API ----

export function getCycles(): DopamineCycle[] {
  return mockCycles;
}

export function getPatterns(): PurchasePattern[] {
  return mockPatterns;
}

export function getCooldownScore(): CooldownScore {
  return mockCooldownScore;
}

export function getAlerts(): BehaviorAlert[] {
  return mockAlerts;
}

export function getBehaviorStats(): BehaviorStats {
  return mockBehaviorStats;
}
