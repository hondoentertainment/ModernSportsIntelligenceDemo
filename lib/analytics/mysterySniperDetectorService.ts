// Phase 248 — Mystery Sniper Detector Service
// Identifies hidden buyers systematically targeting specific cards in the market

// ---- Types ----

export interface SniperPattern {
  type: 'accumulation' | 'bid-sniping' | 'proxy-buying';
  description: string;
  frequency: number;
}

export interface SniperAlert {
  id: string;
  targetPlayer: string;
  targetSet: string;
  pattern: SniperPattern;
  confidence: number;
  estimatedBudget: number;
  activityCount: number;
  firstSeen: string;
  lastSeen: string;
  threat: 'low' | 'medium' | 'high';
}

// ---- Mock Data ----

const sniperAlerts: SniperAlert[] = [
  {
    id: 'sn-001',
    targetPlayer: 'Victor Wembanyama',
    targetSet: '2023 Panini Prizm Silver',
    pattern: {
      type: 'accumulation',
      description: 'Single buyer account acquired 14 PSA 10 copies over 3 weeks at ascending prices',
      frequency: 4.7,
    },
    confidence: 94,
    estimatedBudget: 125000,
    activityCount: 14,
    firstSeen: '2026-02-10',
    lastSeen: '2026-03-05',
    threat: 'high',
  },
  {
    id: 'sn-002',
    targetPlayer: 'Shohei Ohtani',
    targetSet: '2018 Topps Update RC',
    pattern: {
      type: 'bid-sniping',
      description: 'Repeated last-second bids on eBay auctions winning 8 of 11 attempts within 2 seconds of close',
      frequency: 2.8,
    },
    confidence: 87,
    estimatedBudget: 45000,
    activityCount: 11,
    firstSeen: '2026-01-20',
    lastSeen: '2026-03-12',
    threat: 'medium',
  },
  {
    id: 'sn-003',
    targetPlayer: 'Jaylen Brown',
    targetSet: '2016 Panini National Treasures RPA',
    pattern: {
      type: 'proxy-buying',
      description: 'Three separate accounts with linked shipping addresses purchasing all available copies',
      frequency: 1.5,
    },
    confidence: 78,
    estimatedBudget: 82000,
    activityCount: 7,
    firstSeen: '2026-02-25',
    lastSeen: '2026-03-14',
    threat: 'high',
  },
  {
    id: 'sn-004',
    targetPlayer: 'Jasson Dominguez',
    targetSet: '2024 Bowman Chrome 1st Auto',
    pattern: {
      type: 'accumulation',
      description: 'Steady buying of raw copies at market price, appears to be grading for registry set',
      frequency: 3.2,
    },
    confidence: 65,
    estimatedBudget: 18000,
    activityCount: 22,
    firstSeen: '2025-12-01',
    lastSeen: '2026-03-10',
    threat: 'low',
  },
  {
    id: 'sn-005',
    targetPlayer: 'Travis Kelce',
    targetSet: '2013 Topps Chrome Refractor RC',
    pattern: {
      type: 'bid-sniping',
      description: 'Aggressive bidding on all PSA 9 and 10 copies with rapid buy-it-now purchases mixed in',
      frequency: 5.1,
    },
    confidence: 91,
    estimatedBudget: 67000,
    activityCount: 19,
    firstSeen: '2026-01-05',
    lastSeen: '2026-03-15',
    threat: 'high',
  },
];

// ---- Service Functions ----

export function getSniperAlerts(): SniperAlert[] {
  return [...sniperAlerts];
}

export function getSniperStats() {
  const totalAlerts = sniperAlerts.length;
  const highThreat = sniperAlerts.filter((a) => a.threat === 'high').length;
  const mediumThreat = sniperAlerts.filter((a) => a.threat === 'medium').length;
  const lowThreat = sniperAlerts.filter((a) => a.threat === 'low').length;
  const totalEstimatedBudget = sniperAlerts.reduce((sum, a) => sum + a.estimatedBudget, 0);
  const avgConfidence =
    Math.round(sniperAlerts.reduce((sum, a) => sum + a.confidence, 0) / totalAlerts);
  const totalActivity = sniperAlerts.reduce((sum, a) => sum + a.activityCount, 0);
  const patternBreakdown = sniperAlerts.reduce<Record<string, number>>((acc, a) => {
    acc[a.pattern.type] = (acc[a.pattern.type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalAlerts,
    highThreat,
    mediumThreat,
    lowThreat,
    totalEstimatedBudget,
    avgConfidence,
    totalActivity,
    patternBreakdown,
  };
}

const mysterySniperDetectorService = {
  getSniperAlerts,
  getSniperStats,
};

export default mysterySniperDetectorService;
