// @ts-nocheck
// Phase 249 — Narrative Premium Index Service
// Quantifies the premium added to card values by storylines such as championships, records, and milestones

// ---- Types ----

export interface NarrativePremium {
  id: string;
  player: string;
  narrative: string;
  premiumPercent: number;
  duration: string;
  peakDate: string;
  currentStrength: number;
  category: 'championship' | 'record' | 'milestone' | 'controversy' | 'retirement';
}

export interface NarrativeTrend {
  narrative: string;
  trendDirection: 'rising' | 'falling' | 'stable';
  velocity: number;
}

// ---- Mock Data ----

const narrativePremiums: NarrativePremium[] = [
  {
    id: 'np-001',
    player: 'Nikola Jokic',
    narrative: 'Third consecutive MVP award and second championship run',
    premiumPercent: 45,
    duration: '6 months',
    peakDate: '2026-06-15',
    currentStrength: 82,
    category: 'championship',
  },
  {
    id: 'np-002',
    player: 'Aaron Judge',
    narrative: 'Chase for second 60+ HR season and AL record pursuit',
    premiumPercent: 62,
    duration: '4 months',
    peakDate: '2025-09-28',
    currentStrength: 55,
    category: 'record',
  },
  {
    id: 'np-003',
    player: 'LeBron James',
    narrative: 'Final season retirement tour and all-time legacy celebration',
    premiumPercent: 120,
    duration: '12 months',
    peakDate: '2026-04-10',
    currentStrength: 95,
    category: 'retirement',
  },
  {
    id: 'np-004',
    player: 'Patrick Mahomes',
    narrative: 'Fourth Super Bowl appearance in five years — dynasty narrative',
    premiumPercent: 38,
    duration: '3 months',
    peakDate: '2026-02-09',
    currentStrength: 68,
    category: 'championship',
  },
  {
    id: 'np-005',
    player: 'Shohei Ohtani',
    narrative: '50/50 milestone anniversary and first full healthy pitching season with Dodgers',
    premiumPercent: 55,
    duration: '8 months',
    peakDate: '2026-07-20',
    currentStrength: 78,
    category: 'milestone',
  },
  {
    id: 'np-006',
    player: 'Ja Morant',
    narrative: 'Comeback player narrative after suspension and redemption arc',
    premiumPercent: 28,
    duration: '5 months',
    peakDate: '2026-01-15',
    currentStrength: 42,
    category: 'controversy',
  },
];

const narrativeTrends: NarrativeTrend[] = [
  {
    narrative: 'Retirement premium — LeBron final season driving massive demand',
    trendDirection: 'rising',
    velocity: 8.5,
  },
  {
    narrative: 'Championship premium fading post-Super Bowl for Mahomes base cards',
    trendDirection: 'falling',
    velocity: 3.2,
  },
  {
    narrative: 'Record-chase premium holding steady for Judge as season approaches',
    trendDirection: 'stable',
    velocity: 0.8,
  },
  {
    narrative: 'Comeback/controversy premiums declining as Morant narrative normalizes',
    trendDirection: 'falling',
    velocity: 4.1,
  },
];

// ---- Service Functions ----

export function getNarrativePremiums(): NarrativePremium[] {
  return [...narrativePremiums];
}

export function getNarrativeTrends(): NarrativeTrend[] {
  return [...narrativeTrends];
}

export function getNarrativeStats() {
  const totalNarratives = narrativePremiums.length;
  const avgPremium =
    Math.round(narrativePremiums.reduce((sum, n) => sum + n.premiumPercent, 0) / totalNarratives);
  const avgStrength =
    Math.round(narrativePremiums.reduce((sum, n) => sum + n.currentStrength, 0) / totalNarratives);
  const strongestNarrative = narrativePremiums.reduce(
    (best, n) => (n.premiumPercent > best.premiumPercent ? n : best),
    narrativePremiums[0]
  );
  const categoryBreakdown = narrativePremiums.reduce<Record<string, number>>((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});
  const risingTrends = narrativeTrends.filter((t) => t.trendDirection === 'rising').length;
  const fallingTrends = narrativeTrends.filter((t) => t.trendDirection === 'falling').length;

  return {
    totalNarratives,
    avgPremium,
    avgStrength,
    strongestNarrative: strongestNarrative.player,
    strongestPremiumPercent: strongestNarrative.premiumPercent,
    categoryBreakdown,
    risingTrends,
    fallingTrends,
  };
}

const narrativePremiumIndexService = {
  getNarrativePremiums,
  getNarrativeTrends,
  getNarrativeStats,
};

export default narrativePremiumIndexService;
