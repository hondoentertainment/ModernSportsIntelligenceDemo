// ─────────────────────────────────────────────────────────────
// Opportunity Cost Phantom Portfolio – Service Layer
// Tracks what would have happened with decisions NOT made —
// the roads not taken in card collecting and trading
// ─────────────────────────────────────────────────────────────

export type MissedReason =
  | 'outbid'
  | 'hesitated'
  | 'insufficient-funds'
  | 'decision-fatigue'
  | 'distracted'
  | 'price-too-high'
  | 'passed-on';

export interface PhantomAcquisition {
  id: string;
  cardName: string;
  viewedDate: string;
  priceAtViewing: number;
  currentPrice: number;
  priceChange: number; // percentage
  action: 'viewed' | 'watchlisted' | 'bid-lost' | 'cart-abandoned' | 'offer-rejected';
  reason: MissedReason;
  wouldHaveGained: number; // positive $ for gains
  wouldHaveLost: number; // negative $ for losses (bullets dodged)
  isBulletDodged: boolean;
}

export interface PhantomPortfolioSummary {
  totalPhantomCards: number;
  totalMissedGains: number; // dollars
  totalBulletsDodged: number;
  totalDodgedLosses: number; // dollars
  regretAdjustedAlpha: number; // percentage
  realPortfolioReturn: number; // percentage
  phantomPortfolioReturn: number; // percentage
  instinctAccuracy: number; // percentage
  biggestMiss: { card: string; gain: number };
  biggestDodge: { card: string; loss: number };
  dominantMissReason: MissedReason;
}

export interface BehavioralPattern {
  pattern: string;
  frequency: number;
  avgCostPerInstance: number; // dollars
  recommendation: string;
}

export interface OpportunityCostStats {
  phantomCardsTracked: number;
  avgDailyMisses: number;
  netPhantomValue: number; // dollars
  realVsPhantomGap: number; // percentage
}

// ── Mock Phantom Acquisitions (15 entries) ───────────────────

const MOCK_PHANTOM_ACQUISITIONS: PhantomAcquisition[] = [
  // --- Regrets (9 cards that would have gained) ---
  {
    id: 'pa-001',
    cardName: '2023 Victor Wembanyama Prizm Silver PSA 10',
    viewedDate: '2025-08-15',
    priceAtViewing: 2800,
    currentPrice: 4500,
    priceChange: 60.7,
    action: 'bid-lost',
    reason: 'outbid',
    wouldHaveGained: 1700,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-002',
    cardName: '2020 Anthony Edwards Prizm Pink Ice PSA 10',
    viewedDate: '2025-06-02',
    priceAtViewing: 4200,
    currentPrice: 6650,
    priceChange: 58.3,
    action: 'cart-abandoned',
    reason: 'hesitated',
    wouldHaveGained: 2450,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-003',
    cardName: '2018 Luka Doncic Prizm Silver PSA 10',
    viewedDate: '2025-01-10',
    priceAtViewing: 6200,
    currentPrice: 9800,
    priceChange: 58.1,
    action: 'offer-rejected',
    reason: 'price-too-high',
    wouldHaveGained: 3600,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-004',
    cardName: '2024 Caitlin Clark Optic Holo PSA 10',
    viewedDate: '2025-09-20',
    priceAtViewing: 210,
    currentPrice: 390,
    priceChange: 85.7,
    action: 'viewed',
    reason: 'passed-on',
    wouldHaveGained: 180,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-005',
    cardName: '2019 Ja Morant Prizm Silver PSA 10',
    viewedDate: '2025-04-08',
    priceAtViewing: 1500,
    currentPrice: 2200,
    priceChange: 46.7,
    action: 'bid-lost',
    reason: 'outbid',
    wouldHaveGained: 700,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-006',
    cardName: '2023 CJ Stroud Prizm Silver PSA 10',
    viewedDate: '2025-11-12',
    priceAtViewing: 1100,
    currentPrice: 1800,
    priceChange: 63.6,
    action: 'watchlisted',
    reason: 'insufficient-funds',
    wouldHaveGained: 700,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-007',
    cardName: '1956 Mickey Mantle Topps #135 PSA 5',
    viewedDate: '2025-03-22',
    priceAtViewing: 14200,
    currentPrice: 18500,
    priceChange: 30.3,
    action: 'offer-rejected',
    reason: 'price-too-high',
    wouldHaveGained: 4300,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-008',
    cardName: '2022 Paolo Banchero Mosaic Silver PSA 10',
    viewedDate: '2025-12-01',
    priceAtViewing: 2100,
    currentPrice: 2800,
    priceChange: 33.3,
    action: 'cart-abandoned',
    reason: 'decision-fatigue',
    wouldHaveGained: 700,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  {
    id: 'pa-009',
    cardName: '2024 Jayden Daniels Prizm Silver PSA 10',
    viewedDate: '2026-01-05',
    priceAtViewing: 280,
    currentPrice: 420,
    priceChange: 50.0,
    action: 'viewed',
    reason: 'distracted',
    wouldHaveGained: 140,
    wouldHaveLost: 0,
    isBulletDodged: false,
  },
  // --- Bullets Dodged (6 cards that would have lost value) ---
  {
    id: 'pa-010',
    cardName: '2021 Trevor Lawrence Prizm Silver PSA 10',
    viewedDate: '2025-05-18',
    priceAtViewing: 680,
    currentPrice: 285,
    priceChange: -58.1,
    action: 'bid-lost',
    reason: 'outbid',
    wouldHaveGained: 0,
    wouldHaveLost: -395,
    isBulletDodged: true,
  },
  {
    id: 'pa-011',
    cardName: '2021 Zach Wilson Donruss Rated Rookie PSA 10',
    viewedDate: '2025-07-30',
    priceAtViewing: 95,
    currentPrice: 12,
    priceChange: -87.4,
    action: 'watchlisted',
    reason: 'hesitated',
    wouldHaveGained: 0,
    wouldHaveLost: -83,
    isBulletDodged: true,
  },
  {
    id: 'pa-012',
    cardName: '2024 Angel Reese Optic Holo PSA 10',
    viewedDate: '2025-10-05',
    priceAtViewing: 1800,
    currentPrice: 1250,
    priceChange: -30.6,
    action: 'cart-abandoned',
    reason: 'price-too-high',
    wouldHaveGained: 0,
    wouldHaveLost: -550,
    isBulletDodged: true,
  },
  {
    id: 'pa-013',
    cardName: '2022 Mac Jones Prizm Silver PSA 10',
    viewedDate: '2025-02-14',
    priceAtViewing: 420,
    currentPrice: 180,
    priceChange: -57.1,
    action: 'viewed',
    reason: 'passed-on',
    wouldHaveGained: 0,
    wouldHaveLost: -240,
    isBulletDodged: true,
  },
  {
    id: 'pa-014',
    cardName: '2021 Trey Lance Donruss Rated Rookie PSA 10',
    viewedDate: '2025-06-22',
    priceAtViewing: 110,
    currentPrice: 15,
    priceChange: -86.4,
    action: 'offer-rejected',
    reason: 'insufficient-funds',
    wouldHaveGained: 0,
    wouldHaveLost: -95,
    isBulletDodged: true,
  },
  {
    id: 'pa-015',
    cardName: '2020 Jordan Love Prizm Silver PSA 10',
    viewedDate: '2025-09-08',
    priceAtViewing: 850,
    currentPrice: 520,
    priceChange: -38.8,
    action: 'bid-lost',
    reason: 'outbid',
    wouldHaveGained: 0,
    wouldHaveLost: -330,
    isBulletDodged: true,
  },
];

// ── Mock Behavioral Patterns (4 patterns) ────────────────────

const MOCK_BEHAVIORAL_PATTERNS: BehavioralPattern[] = [
  {
    pattern: 'Hesitation on sub-$500 cards leads to missed 40%+ gains within 90 days',
    frequency: 12,
    avgCostPerInstance: 185,
    recommendation: 'Set up auto-buy rules for sub-$500 cards that match your target criteria. Remove the hesitation bottleneck with pre-approved spending limits.',
  },
  {
    pattern: 'Cart abandonment spikes during evening sessions (8pm-midnight)',
    frequency: 8,
    avgCostPerInstance: 520,
    recommendation: 'Decision fatigue is causing abandoned carts. Move high-value acquisition decisions to morning sessions when cognitive energy is highest.',
  },
  {
    pattern: 'Consistently outbid on football rookies by $50-$150 — bids set too conservatively',
    frequency: 6,
    avgCostPerInstance: 680,
    recommendation: 'Increase football rookie bid ceilings by 8-12%. Historical data shows your conservative bids miss acquisitions that subsequently gain 45% on average.',
  },
  {
    pattern: 'Passing on vintage cards over $10,000 despite strong thesis — price anchoring bias',
    frequency: 3,
    avgCostPerInstance: 3950,
    recommendation: 'Your instinct on vintage over $10K has been correct 67% of the time. Consider allocating a dedicated vintage fund to overcome price anchoring resistance.',
  },
];

// ── Utility Helpers ──────────────────────────────────────────

export function getReasonLabel(reason: MissedReason): string {
  const labels: Record<MissedReason, string> = {
    outbid: 'Outbid',
    hesitated: 'Hesitated',
    'insufficient-funds': 'Insufficient Funds',
    'decision-fatigue': 'Decision Fatigue',
    distracted: 'Distracted',
    'price-too-high': 'Price Seemed Too High',
    'passed-on': 'Passed On',
  };
  return labels[reason];
}

export function getReasonColor(reason: MissedReason): string {
  const colors: Record<MissedReason, string> = {
    outbid: 'text-blue-400',
    hesitated: 'text-amber-400',
    'insufficient-funds': 'text-gray-400',
    'decision-fatigue': 'text-orange-400',
    distracted: 'text-purple-400',
    'price-too-high': 'text-red-400',
    'passed-on': 'text-cyan-400',
  };
  return colors[reason];
}

export function getActionLabel(action: 'viewed' | 'watchlisted' | 'bid-lost' | 'cart-abandoned' | 'offer-rejected'): string {
  const labels: Record<string, string> = {
    viewed: 'Viewed Only',
    watchlisted: 'Watchlisted',
    'bid-lost': 'Bid Lost',
    'cart-abandoned': 'Cart Abandoned',
    'offer-rejected': 'Offer Rejected',
  };
  return labels[action];
}

// ── Public API Functions ─────────────────────────────────────

export function getPhantomAcquisitions(): PhantomAcquisition[] {
  return MOCK_PHANTOM_ACQUISITIONS;
}

export function getPhantomSummary(): PhantomPortfolioSummary {
  const acquisitions = MOCK_PHANTOM_ACQUISITIONS;

  const regrets = acquisitions.filter(a => !a.isBulletDodged);
  const dodges = acquisitions.filter(a => a.isBulletDodged);

  const totalMissedGains = regrets.reduce((sum, a) => sum + a.wouldHaveGained, 0);
  const totalDodgedLosses = dodges.reduce((sum, a) => sum + Math.abs(a.wouldHaveLost), 0);

  const biggestMiss = [...regrets].sort((a, b) => b.wouldHaveGained - a.wouldHaveGained)[0];
  const biggestDodge = [...dodges].sort((a, b) => Math.abs(b.wouldHaveLost) - Math.abs(a.wouldHaveLost))[0];

  // Calculate dominant miss reason
  const reasonCounts = new Map<MissedReason, number>();
  for (const a of regrets) {
    reasonCounts.set(a.reason, (reasonCounts.get(a.reason) || 0) + 1);
  }
  const dominantReason = [...reasonCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'hesitated';

  // Phantom portfolio return (if you had bought everything)
  const totalPhantomInvestment = acquisitions.reduce((sum, a) => sum + a.priceAtViewing, 0);
  const totalPhantomCurrent = acquisitions.reduce((sum, a) => sum + a.currentPrice, 0);
  const phantomReturn = ((totalPhantomCurrent - totalPhantomInvestment) / totalPhantomInvestment) * 100;

  return {
    totalPhantomCards: acquisitions.length,
    totalMissedGains,
    totalBulletsDodged: dodges.length,
    totalDodgedLosses,
    regretAdjustedAlpha: 8.4,
    realPortfolioReturn: 22.6,
    phantomPortfolioReturn: Math.round(phantomReturn * 10) / 10,
    instinctAccuracy: Math.round((dodges.length / acquisitions.length) * 100),
    biggestMiss: { card: biggestMiss?.cardName ?? '', gain: biggestMiss?.wouldHaveGained ?? 0 },
    biggestDodge: { card: biggestDodge?.cardName ?? '', loss: Math.abs(biggestDodge?.wouldHaveLost ?? 0) },
    dominantMissReason: dominantReason,
  };
}

export function getBehavioralPatterns(): BehavioralPattern[] {
  return MOCK_BEHAVIORAL_PATTERNS;
}

export function getOpportunityCostStats(): OpportunityCostStats {
  const acquisitions = MOCK_PHANTOM_ACQUISITIONS;

  const netGains = acquisitions.filter(a => !a.isBulletDodged).reduce((sum, a) => sum + a.wouldHaveGained, 0);
  const netLosses = acquisitions.filter(a => a.isBulletDodged).reduce((sum, a) => sum + Math.abs(a.wouldHaveLost), 0);

  return {
    phantomCardsTracked: acquisitions.length,
    avgDailyMisses: 2.3,
    netPhantomValue: netGains - netLosses,
    realVsPhantomGap: 14.2,
  };
}
