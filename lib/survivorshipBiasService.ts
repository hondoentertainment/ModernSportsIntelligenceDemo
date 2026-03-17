// ─────────────────────────────────────────────────────────────
// Survivorship Bias Corrector – Service Layer
// Shows the FULL distribution of cards including failures,
// not just the survivors that dominate visible marketplaces
// ─────────────────────────────────────────────────────────────

export type CardOutcome =
  | 'moonshot'
  | 'solid-gainer'
  | 'flat'
  | 'slow-decline'
  | 'crash'
  | 'delisted';

export interface SurvivorshipAnalysis {
  id: string;
  setName: string;
  year: number;
  totalCardsInSet: number;
  cardsStillTracked: number;
  survivalRate: number; // percentage
  outcomeDistribution: { outcome: CardOutcome; count: number; percentage: number }[];
  medianReturn: number; // percentage
  meanReturn: number; // percentage
  adjustedMedianReturn: number; // percentage including delisted/crashed
  biasGap: number; // percentage — difference between visible and true median
  topSurvivors: { name: string; return: number }[];
  notableCasualties: { name: string; peakValue: number; currentValue: number; decline: number }[];
}

export interface BiasAlert {
  id: string;
  cardName: string;
  visibleComps: number;
  hiddenComps: number;
  visibleMedian: number; // dollars
  trueMedian: number; // dollars
  overvaluationRisk: number; // percentage
  message: string;
}

export interface SurvivorshipStats {
  setsAnalyzed: number;
  avgBiasGap: number; // percentage
  worstBiasSet: { name: string; gap: number };
  totalHiddenCards: number;
  totalVisibleCards: number;
  correctedValuations: number;
}

// ── Mock Survivorship Analyses ───────────────────────────────

const MOCK_SURVIVORSHIP_ANALYSES: SurvivorshipAnalysis[] = [
  {
    id: 'sa-001',
    setName: '2018 Panini Prizm Football',
    year: 2018,
    totalCardsInSet: 400,
    cardsStillTracked: 142,
    survivalRate: 35.5,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 8, percentage: 2 },
      { outcome: 'solid-gainer', count: 34, percentage: 8.5 },
      { outcome: 'flat', count: 100, percentage: 25 },
      { outcome: 'slow-decline', count: 138, percentage: 34.5 },
      { outcome: 'crash', count: 82, percentage: 20.5 },
      { outcome: 'delisted', count: 38, percentage: 9.5 },
    ],
    medianReturn: 42,
    meanReturn: 68,
    adjustedMedianReturn: -12,
    biasGap: 54,
    topSurvivors: [
      { name: 'Josh Allen Prizm Silver RC PSA 10', return: 1840 },
      { name: 'Lamar Jackson Prizm Base RC PSA 10', return: 620 },
      { name: 'Saquon Barkley Prizm Silver RC PSA 10', return: 180 },
    ],
    notableCasualties: [
      { name: 'Baker Mayfield Prizm Silver RC PSA 10', peakValue: 450, currentValue: 65, decline: 85.6 },
      { name: 'Sam Darnold Prizm Base RC PSA 10', peakValue: 180, currentValue: 12, decline: 93.3 },
      { name: 'Josh Rosen Prizm Silver RC PSA 10', peakValue: 320, currentValue: 8, decline: 97.5 },
    ],
  },
  {
    id: 'sa-002',
    setName: '2020 Bowman Chrome Baseball',
    year: 2020,
    totalCardsInSet: 350,
    cardsStillTracked: 98,
    survivalRate: 28.0,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 5, percentage: 1.4 },
      { outcome: 'solid-gainer', count: 18, percentage: 5.1 },
      { outcome: 'flat', count: 75, percentage: 21.4 },
      { outcome: 'slow-decline', count: 142, percentage: 40.6 },
      { outcome: 'crash', count: 78, percentage: 22.3 },
      { outcome: 'delisted', count: 32, percentage: 9.1 },
    ],
    medianReturn: 35,
    meanReturn: 52,
    adjustedMedianReturn: -22,
    biasGap: 57,
    topSurvivors: [
      { name: 'Jasson Dominguez 1st Bowman Chrome Auto PSA 10', return: 420 },
      { name: 'Robert Hassell III 1st Bowman Chrome Refractor PSA 10', return: 280 },
    ],
    notableCasualties: [
      { name: 'Austin Martin 1st Bowman Chrome Auto PSA 10', peakValue: 380, currentValue: 45, decline: 88.2 },
      { name: 'Heston Kjerstad 1st Bowman Chrome Auto PSA 10', peakValue: 220, currentValue: 30, decline: 86.4 },
    ],
  },
  {
    id: 'sa-003',
    setName: '2019 Donruss Optic Basketball',
    year: 2019,
    totalCardsInSet: 200,
    cardsStillTracked: 85,
    survivalRate: 42.5,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 12, percentage: 6 },
      { outcome: 'solid-gainer', count: 28, percentage: 14 },
      { outcome: 'flat', count: 52, percentage: 26 },
      { outcome: 'slow-decline', count: 64, percentage: 32 },
      { outcome: 'crash', count: 30, percentage: 15 },
      { outcome: 'delisted', count: 14, percentage: 7 },
    ],
    medianReturn: 78,
    meanReturn: 145,
    adjustedMedianReturn: 8,
    biasGap: 70,
    topSurvivors: [
      { name: 'Zion Williamson Optic Holo RC PSA 10', return: 320 },
      { name: 'Ja Morant Optic Holo RC PSA 10', return: 580 },
      { name: 'Tyler Herro Optic Base RC PSA 10', return: 140 },
    ],
    notableCasualties: [
      { name: 'RJ Barrett Optic Holo RC PSA 10', peakValue: 280, currentValue: 55, decline: 80.4 },
      { name: 'De\'Andre Hunter Optic Base RC PSA 10', peakValue: 120, currentValue: 10, decline: 91.7 },
      { name: 'Cam Reddish Optic Holo RC PSA 10', peakValue: 195, currentValue: 18, decline: 90.8 },
    ],
  },
  {
    id: 'sa-004',
    setName: '2022 Topps Chrome Baseball',
    year: 2022,
    totalCardsInSet: 300,
    cardsStillTracked: 165,
    survivalRate: 55.0,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 6, percentage: 2 },
      { outcome: 'solid-gainer', count: 24, percentage: 8 },
      { outcome: 'flat', count: 120, percentage: 40 },
      { outcome: 'slow-decline', count: 96, percentage: 32 },
      { outcome: 'crash', count: 39, percentage: 13 },
      { outcome: 'delisted', count: 15, percentage: 5 },
    ],
    medianReturn: 18,
    meanReturn: 32,
    adjustedMedianReturn: -5,
    biasGap: 23,
    topSurvivors: [
      { name: 'Julio Rodriguez Chrome Refractor RC PSA 10', return: 380 },
      { name: 'Michael Harris II Chrome Auto RC PSA 10', return: 210 },
    ],
    notableCasualties: [
      { name: 'Bobby Witt Jr. Chrome Base RC PSA 10', peakValue: 150, currentValue: 85, decline: 43.3 },
      { name: 'Spencer Torkelson Chrome Auto RC PSA 10', peakValue: 260, currentValue: 40, decline: 84.6 },
    ],
  },
  {
    id: 'sa-005',
    setName: '2017 Panini Select Football',
    year: 2017,
    totalCardsInSet: 250,
    cardsStillTracked: 68,
    survivalRate: 27.2,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 5, percentage: 2 },
      { outcome: 'solid-gainer', count: 13, percentage: 5.2 },
      { outcome: 'flat', count: 55, percentage: 22 },
      { outcome: 'slow-decline', count: 92, percentage: 36.8 },
      { outcome: 'crash', count: 60, percentage: 24 },
      { outcome: 'delisted', count: 25, percentage: 10 },
    ],
    medianReturn: 52,
    meanReturn: 88,
    adjustedMedianReturn: -18,
    biasGap: 70,
    topSurvivors: [
      { name: 'Patrick Mahomes Select Prizm RC PSA 10', return: 4200 },
      { name: 'Deshaun Watson Select Silver RC PSA 10', return: 120 },
    ],
    notableCasualties: [
      { name: 'Mitchell Trubisky Select Prizm RC PSA 10', peakValue: 520, currentValue: 22, decline: 95.8 },
      { name: 'DeShone Kizer Select Base RC PSA 10', peakValue: 85, currentValue: 3, decline: 96.5 },
      { name: 'Davis Webb Select Prizm RC PSA 10', peakValue: 110, currentValue: 5, decline: 95.5 },
    ],
  },
  {
    id: 'sa-006',
    setName: '2021 Donruss Football',
    year: 2021,
    totalCardsInSet: 400,
    cardsStillTracked: 180,
    survivalRate: 45.0,
    outcomeDistribution: [
      { outcome: 'moonshot', count: 4, percentage: 1 },
      { outcome: 'solid-gainer', count: 20, percentage: 5 },
      { outcome: 'flat', count: 136, percentage: 34 },
      { outcome: 'slow-decline', count: 148, percentage: 37 },
      { outcome: 'crash', count: 68, percentage: 17 },
      { outcome: 'delisted', count: 24, percentage: 6 },
    ],
    medianReturn: 22,
    meanReturn: 38,
    adjustedMedianReturn: -8,
    biasGap: 30,
    topSurvivors: [
      { name: 'Micah Parsons Donruss Rated Rookie PSA 10', return: 340 },
      { name: 'Ja\'Marr Chase Donruss Rated Rookie PSA 10', return: 280 },
      { name: 'Kyle Pitts Donruss Rated Rookie PSA 10', return: 60 },
    ],
    notableCasualties: [
      { name: 'Trevor Lawrence Donruss Rated Rookie PSA 10', peakValue: 380, currentValue: 95, decline: 75.0 },
      { name: 'Zach Wilson Donruss Rated Rookie PSA 10', peakValue: 210, currentValue: 12, decline: 94.3 },
      { name: 'Trey Lance Donruss Rated Rookie PSA 10', peakValue: 175, currentValue: 15, decline: 91.4 },
    ],
  },
];

// ── Mock Bias Alerts ─────────────────────────────────────────

const MOCK_BIAS_ALERTS: BiasAlert[] = [
  {
    id: 'ba-001',
    cardName: '2020 Justin Herbert Prizm Silver PSA 10',
    visibleComps: 28,
    hiddenComps: 14,
    visibleMedian: 2400,
    trueMedian: 1850,
    overvaluationRisk: 29.7,
    message: 'Marketplace comps exclude 14 sales from delisted sellers and expired listings that sold below $1,500. True median is 23% lower than visible.',
  },
  {
    id: 'ba-002',
    cardName: '2019 Zion Williamson Prizm Silver PSA 10',
    visibleComps: 45,
    hiddenComps: 22,
    visibleMedian: 3200,
    trueMedian: 2650,
    overvaluationRisk: 20.8,
    message: 'High-volume card with significant survivorship bias — 22 low-price comps from distressed sellers not surfacing in standard search results.',
  },
  {
    id: 'ba-003',
    cardName: '2023 Victor Wembanyama Prizm Base PSA 10',
    visibleComps: 62,
    hiddenComps: 8,
    visibleMedian: 4200,
    trueMedian: 3900,
    overvaluationRisk: 7.7,
    message: 'Minimal bias — high-liquidity card with mostly accurate visible comps. 8 hidden comps from off-platform sales have minor downward effect.',
  },
  {
    id: 'ba-004',
    cardName: '2018 Lamar Jackson Prizm Silver PSA 10',
    visibleComps: 15,
    hiddenComps: 11,
    visibleMedian: 1100,
    trueMedian: 780,
    overvaluationRisk: 41.0,
    message: 'Critical survivorship bias. Nearly half of all comps are hidden — card is likely 41% overvalued based on visible data alone.',
  },
  {
    id: 'ba-005',
    cardName: '2021 Trevor Lawrence Prizm Silver PSA 10',
    visibleComps: 20,
    hiddenComps: 18,
    visibleMedian: 420,
    trueMedian: 285,
    overvaluationRisk: 47.4,
    message: 'Severe survivorship bias. Nearly equal hidden and visible comps. The crash-phase sales are systematically excluded from comp aggregators.',
  },
];

// ── Utility Helpers ──────────────────────────────────────────

export function getOutcomeColor(outcome: CardOutcome): string {
  const colors: Record<CardOutcome, string> = {
    moonshot: 'text-emerald-400',
    'solid-gainer': 'text-green-400',
    flat: 'text-gray-400',
    'slow-decline': 'text-amber-400',
    crash: 'text-red-400',
    delisted: 'text-red-600',
  };
  return colors[outcome];
}

export function getOutcomeLabel(outcome: CardOutcome): string {
  const labels: Record<CardOutcome, string> = {
    moonshot: 'Moonshot (200%+)',
    'solid-gainer': 'Solid Gainer (30-200%)',
    flat: 'Flat (-10% to +30%)',
    'slow-decline': 'Slow Decline (-10% to -50%)',
    crash: 'Crash (-50%+)',
    delisted: 'Delisted / Untraceable',
  };
  return labels[outcome];
}

export function getBiasGapSeverity(gap: number): { label: string; color: string; bg: string } {
  if (gap >= 50) return { label: 'Severe Bias', color: 'text-red-400', bg: 'bg-red-500/20' };
  if (gap >= 30) return { label: 'Significant Bias', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  if (gap >= 15) return { label: 'Moderate Bias', color: 'text-amber-400', bg: 'bg-amber-500/20' };
  return { label: 'Low Bias', color: 'text-green-400', bg: 'bg-green-500/20' };
}

// ── Public API Functions ─────────────────────────────────────

export function getSurvivorshipAnalyses(): SurvivorshipAnalysis[] {
  return MOCK_SURVIVORSHIP_ANALYSES;
}

export function getBiasAlerts(): BiasAlert[] {
  return MOCK_BIAS_ALERTS;
}

export function getSurvivorshipStats(): SurvivorshipStats {
  const analyses = MOCK_SURVIVORSHIP_ANALYSES;

  const avgGap = analyses.reduce((sum, a) => sum + a.biasGap, 0) / analyses.length;
  const worstSet = [...analyses].sort((a, b) => b.biasGap - a.biasGap)[0];

  const totalVisible = analyses.reduce((sum, a) => sum + a.cardsStillTracked, 0);
  const totalAll = analyses.reduce((sum, a) => sum + a.totalCardsInSet, 0);

  return {
    setsAnalyzed: analyses.length,
    avgBiasGap: Math.round(avgGap * 10) / 10,
    worstBiasSet: { name: worstSet.setName, gap: worstSet.biasGap },
    totalHiddenCards: totalAll - totalVisible,
    totalVisibleCards: totalVisible,
    correctedValuations: MOCK_BIAS_ALERTS.length,
  };
}
