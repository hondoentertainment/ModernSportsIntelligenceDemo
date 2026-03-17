// Phase 240 — Collector Burnout Index Service

export interface BurnoutSignal {
  id: string;
  metric: string;
  currentValue: number;
  threshold: number;
  trend: 'rising' | 'falling' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface BurnoutProfile {
  overallScore: number;
  riskLevel: string;
  signals: BurnoutSignal[];
  recommendations: string[];
}

const burnoutSignals: BurnoutSignal[] = [
  {
    id: 'bs-001',
    metric: 'Daily Listing Checks',
    currentValue: 47,
    threshold: 30,
    trend: 'rising',
    severity: 'high',
  },
  {
    id: 'bs-002',
    metric: 'Impulse Purchases (7-day)',
    currentValue: 12,
    threshold: 5,
    trend: 'rising',
    severity: 'critical',
  },
  {
    id: 'bs-003',
    metric: 'Sleep Disruption Score',
    currentValue: 6.2,
    threshold: 7.0,
    trend: 'falling',
    severity: 'medium',
  },
  {
    id: 'bs-004',
    metric: 'Collection Organization Rate',
    currentValue: 34,
    threshold: 70,
    trend: 'falling',
    severity: 'high',
  },
  {
    id: 'bs-005',
    metric: 'Social Engagement (forums/groups)',
    currentValue: 85,
    threshold: 60,
    trend: 'stable',
    severity: 'low',
  },
  {
    id: 'bs-006',
    metric: 'Regret-to-Purchase Ratio',
    currentValue: 0.42,
    threshold: 0.25,
    trend: 'rising',
    severity: 'high',
  },
];

const burnoutProfile: BurnoutProfile = {
  overallScore: 68,
  riskLevel: 'Elevated',
  signals: burnoutSignals,
  recommendations: [
    'Set a weekly spending cap of $150 and use the built-in budget tracker to enforce it.',
    'Take a 48-hour break from marketplace browsing — uninstall apps temporarily if needed.',
    'Focus on organizing your existing collection before acquiring new cards.',
    'Schedule one "no-buy" week per month to reset your purchase impulse baseline.',
  ],
};

export function getBurnoutSignals(): BurnoutSignal[] {
  return burnoutSignals;
}

export function getBurnoutProfile(): BurnoutProfile {
  return burnoutProfile;
}

export function getBurnoutStats() {
  const totalSignals = burnoutSignals.length;
  const criticalSignals = burnoutSignals.filter((s) => s.severity === 'critical').length;
  const highSignals = burnoutSignals.filter((s) => s.severity === 'high').length;
  const risingTrends = burnoutSignals.filter((s) => s.trend === 'rising').length;

  return {
    totalSignals,
    criticalSignals,
    highSignals,
    risingTrends,
    overallScore: burnoutProfile.overallScore,
    riskLevel: burnoutProfile.riskLevel,
    recommendationCount: burnoutProfile.recommendations.length,
  };
}

const collectorBurnoutIndexService = {
  getBurnoutSignals,
  getBurnoutProfile,
  getBurnoutStats,
};

export default collectorBurnoutIndexService;
