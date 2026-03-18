// ─── Predictive Print Run Decoder Service ────────────────────────────────────
// Reverse-engineers actual print run numbers from population reports, sales
// velocity, submission rates, and statistical modelling — solving one of the
// biggest mysteries in the sports-card hobby.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DataPoint {
  source: string;
  metric: string;
  value: number;
  weight: number;
  description: string;
}

export interface PopulationData {
  totalGraded: number;
  gradeDistribution: { grade: string; count: number; percent: number }[];
  submissionTimeline: { month: string; submissions: number }[];
  avgGrade: number;
  medianGrade: number;
}

export interface PrintRunEstimate {
  cardId: string;
  cardName: string;
  player: string;
  year: number;
  set: string;
  parallel: string;
  officialPrintRun: number | null;
  estimatedPrintRun: { low: number; median: number; high: number };
  confidence: number;
  methodology: string;
  dataPoints: DataPoint[];
  survivalRate: number;
  gradedPercent: number;
  populationData: PopulationData;
}

export interface PrintRunComparison {
  cards: { cardId: string; name: string; estimatedRun: number; officialRun: number | null }[];
  setTotal: number;
  parallelMultipliers: { parallel: string; multiplier: number }[];
}

export interface ScarcityScore {
  cardId: string;
  absoluteScarcity: number;
  relativeScarcity: number;
  functionalScarcity: number;
  populationAdjusted: number;
  explanation: string;
}

export interface SupplyDemandProjection {
  cardId: string;
  currentSupply: number;
  projectedSubmissions12M: number;
  estimatedUngraded: number;
  demandIndicators: { metric: string; value: number; trend: 'up' | 'down' | 'stable' }[];
  equilibriumPrice: number;
}

export interface SetAnalysis {
  setName: string;
  year: number;
  manufacturer: string;
  baseRunEstimate: number;
  parallelRuns: { parallel: string; multiplier: number; estimatedRun: number }[];
  totalCardsEstimate: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gradeDistribution(
  total: number,
  shape: 'normal' | 'top-heavy' | 'modern',
): PopulationData['gradeDistribution'] {
  const pcts: Record<string, Record<string, number>> = {
    normal:      { '10': 0.04, '9.5': 0.11, '9': 0.28, '8.5': 0.19, '8': 0.14, '7': 0.09, '6': 0.06, '5': 0.04, '<5': 0.05 },
    'top-heavy': { '10': 0.12, '9.5': 0.22, '9': 0.30, '8.5': 0.14, '8': 0.09, '7': 0.05, '6': 0.04, '5': 0.02, '<5': 0.02 },
    modern:      { '10': 0.18, '9.5': 0.26, '9': 0.28, '8.5': 0.12, '8': 0.07, '7': 0.04, '6': 0.02, '5': 0.02, '<5': 0.01 },
  };
  const p = pcts[shape];
  return Object.entries(p).map(([grade, pct]) => ({
    grade,
    count: Math.round(total * pct),
    percent: +(pct * 100).toFixed(1),
  }));
}

function timeline(months: number, peakMonth: number, total: number): PopulationData['submissionTimeline'] {
  const raw: number[] = [];
  for (let i = 0; i < months; i++) {
    const dist = Math.abs(i - peakMonth);
    raw.push(Math.max(1, Math.round(total / months * Math.exp(-dist * 0.15))));
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  const scale = total / sum;
  const labels = [
    'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
    'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
    'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
    'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025',
  ];
  return labels.slice(0, months).map((month, i) => ({
    month,
    submissions: Math.round(raw[i] * scale),
  }));
}

function avgFromDist(dist: PopulationData['gradeDistribution']): number {
  let sum = 0;
  let cnt = 0;
  for (const d of dist) {
    const g = d.grade === '<5' ? 3 : parseFloat(d.grade);
    sum += g * d.count;
    cnt += d.count;
  }
  return cnt > 0 ? +(sum / cnt).toFixed(2) : 0;
}

function medianFromDist(dist: PopulationData['gradeDistribution']): number {
  const sorted = [...dist].sort((a, b) => {
    const ga = a.grade === '<5' ? 3 : parseFloat(a.grade);
    const gb = b.grade === '<5' ? 3 : parseFloat(b.grade);
    return ga - gb;
  });
  const total = sorted.reduce((s, d) => s + d.count, 0);
  let acc = 0;
  for (const d of sorted) {
    acc += d.count;
    if (acc >= total / 2) return d.grade === '<5' ? 3 : parseFloat(d.grade);
  }
  return 9;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

interface CardSeed {
  id: string;
  name: string;
  player: string;
  year: number;
  set: string;
  parallel: string;
  official: number | null;
  estLow: number;
  estMed: number;
  estHigh: number;
  confidence: number;
  methodology: string;
  totalGraded: number;
  survivalRate: number;
  gradedPercent: number;
  shape: 'normal' | 'top-heavy' | 'modern';
  peakMonth: number;
  sport: string;
}

const CARD_SEEDS: CardSeed[] = [
  // ── Basketball ──────────────────────────────────────────────────────────
  { id: 'prd-001', name: '2023 Prizm Victor Wembanyama RC Silver', player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 2800, estMed: 3400, estHigh: 4200, confidence: 82, methodology: 'Capture-Recapture + Submission Rate Extrapolation', totalGraded: 1247, survivalRate: 0.94, gradedPercent: 36.7, shape: 'modern', peakMonth: 5, sport: 'basketball' },
  { id: 'prd-002', name: '2018 Prizm Luka Doncic RC Base', player: 'Luka Doncic', year: 2018, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 18500, estMed: 22000, estHigh: 27000, confidence: 76, methodology: 'Population Growth Curve + Historical Pattern', totalGraded: 9841, survivalRate: 0.97, gradedPercent: 44.7, shape: 'top-heavy', peakMonth: 8, sport: 'basketball' },
  { id: 'prd-003', name: '2018 Prizm Luka Doncic RC Silver', player: 'Luka Doncic', year: 2018, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 3200, estMed: 4100, estHigh: 5400, confidence: 79, methodology: 'Capture-Recapture + Sales Velocity', totalGraded: 1823, survivalRate: 0.96, gradedPercent: 44.4, shape: 'top-heavy', peakMonth: 7, sport: 'basketball' },
  { id: 'prd-004', name: '2019 Prizm Ja Morant RC Base', player: 'Ja Morant', year: 2019, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 21000, estMed: 25500, estHigh: 31000, confidence: 73, methodology: 'Submission Rate Extrapolation + Manufacturer Pattern', totalGraded: 8932, survivalRate: 0.96, gradedPercent: 35.0, shape: 'modern', peakMonth: 6, sport: 'basketball' },
  { id: 'prd-005', name: '2020 Prizm LaMelo Ball RC Silver', player: 'LaMelo Ball', year: 2020, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 3000, estMed: 3800, estHigh: 4800, confidence: 80, methodology: 'Capture-Recapture + Population Growth Curve', totalGraded: 1589, survivalRate: 0.95, gradedPercent: 41.8, shape: 'modern', peakMonth: 4, sport: 'basketball' },
  { id: 'prd-006', name: '2003 Topps Chrome LeBron James RC', player: 'LeBron James', year: 2003, set: 'Topps Chrome', parallel: 'Base', official: null, estLow: 11000, estMed: 14500, estHigh: 19000, confidence: 68, methodology: 'Serial Number Gap + Historical Submission Pattern', totalGraded: 5127, survivalRate: 0.82, gradedPercent: 35.4, shape: 'normal', peakMonth: 10, sport: 'basketball' },
  { id: 'prd-007', name: '2003 Topps Chrome LeBron James RC Refractor', player: 'LeBron James', year: 2003, set: 'Topps Chrome', parallel: 'Refractor', official: 999, estLow: 920, estMed: 999, estHigh: 1010, confidence: 97, methodology: 'Official Print Run Confirmed', totalGraded: 614, survivalRate: 0.88, gradedPercent: 61.5, shape: 'normal', peakMonth: 12, sport: 'basketball' },
  // ── Football ────────────────────────────────────────────────────────────
  { id: 'prd-008', name: '2020 Prizm Justin Herbert RC Base', player: 'Justin Herbert', year: 2020, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 24000, estMed: 29000, estHigh: 35000, confidence: 71, methodology: 'Submission Rate + Manufacturer Pattern', totalGraded: 7420, survivalRate: 0.97, gradedPercent: 25.6, shape: 'modern', peakMonth: 5, sport: 'football' },
  { id: 'prd-009', name: '2020 Prizm Justin Herbert RC Silver', player: 'Justin Herbert', year: 2020, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 4200, estMed: 5200, estHigh: 6500, confidence: 77, methodology: 'Capture-Recapture + Sales Velocity Analysis', totalGraded: 2105, survivalRate: 0.96, gradedPercent: 40.5, shape: 'modern', peakMonth: 4, sport: 'football' },
  { id: 'prd-010', name: '2017 Prizm Patrick Mahomes II RC Base', player: 'Patrick Mahomes II', year: 2017, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 16000, estMed: 20000, estHigh: 25000, confidence: 74, methodology: 'Population Growth Curve + Serial Number Gap', totalGraded: 8912, survivalRate: 0.95, gradedPercent: 44.6, shape: 'top-heavy', peakMonth: 9, sport: 'football' },
  { id: 'prd-011', name: '2017 Prizm Patrick Mahomes II RC Silver', player: 'Patrick Mahomes II', year: 2017, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 2800, estMed: 3500, estHigh: 4500, confidence: 81, methodology: 'Capture-Recapture Modeling', totalGraded: 1642, survivalRate: 0.95, gradedPercent: 46.9, shape: 'top-heavy', peakMonth: 10, sport: 'football' },
  { id: 'prd-012', name: '2024 Prizm Caleb Williams RC Base', player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 28000, estMed: 34000, estHigh: 42000, confidence: 64, methodology: 'Manufacturer Pattern + Early Submission Velocity', totalGraded: 3210, survivalRate: 0.98, gradedPercent: 9.4, shape: 'modern', peakMonth: 2, sport: 'football' },
  { id: 'prd-013', name: '2024 Prizm Caleb Williams RC Silver', player: 'Caleb Williams', year: 2024, set: 'Panini Prizm', parallel: 'Silver', official: null, estLow: 4500, estMed: 5800, estHigh: 7500, confidence: 59, methodology: 'Early Submission Velocity + Historical Parallel Ratio', totalGraded: 487, survivalRate: 0.98, gradedPercent: 8.4, shape: 'modern', peakMonth: 1, sport: 'football' },
  // ── Baseball ────────────────────────────────────────────────────────────
  { id: 'prd-014', name: '2022 Topps Chrome Julio Rodriguez RC', player: 'Julio Rodriguez', year: 2022, set: 'Topps Chrome', parallel: 'Base', official: null, estLow: 32000, estMed: 39000, estHigh: 48000, confidence: 72, methodology: 'Submission Rate Extrapolation + Pop Growth', totalGraded: 11240, survivalRate: 0.97, gradedPercent: 28.8, shape: 'modern', peakMonth: 6, sport: 'baseball' },
  { id: 'prd-015', name: '2022 Topps Chrome Julio Rodriguez RC Refractor', player: 'Julio Rodriguez', year: 2022, set: 'Topps Chrome', parallel: 'Refractor', official: null, estLow: 5500, estMed: 7000, estHigh: 9000, confidence: 75, methodology: 'Capture-Recapture + Parallel Ratio Analysis', totalGraded: 2814, survivalRate: 0.97, gradedPercent: 40.2, shape: 'modern', peakMonth: 5, sport: 'baseball' },
  { id: 'prd-016', name: '2011 Topps Update Mike Trout RC', player: 'Mike Trout', year: 2011, set: 'Topps Update', parallel: 'Base', official: null, estLow: 48000, estMed: 58000, estHigh: 72000, confidence: 65, methodology: 'Population Growth Curve + Historical Pattern', totalGraded: 15230, survivalRate: 0.91, gradedPercent: 26.3, shape: 'normal', peakMonth: 14, sport: 'baseball' },
  { id: 'prd-017', name: '2024 Bowman Chrome Paul Skenes 1st', player: 'Paul Skenes', year: 2024, set: 'Bowman Chrome', parallel: 'Base', official: null, estLow: 20000, estMed: 26000, estHigh: 33000, confidence: 61, methodology: 'Early Velocity + Manufacturer Pattern', totalGraded: 2180, survivalRate: 0.98, gradedPercent: 8.4, shape: 'modern', peakMonth: 2, sport: 'baseball' },
  { id: 'prd-018', name: '2024 Bowman Chrome Paul Skenes 1st Refractor', player: 'Paul Skenes', year: 2024, set: 'Bowman Chrome', parallel: 'Refractor', official: null, estLow: 3500, estMed: 4600, estHigh: 6000, confidence: 58, methodology: 'Parallel Ratio + Early Submission Velocity', totalGraded: 340, survivalRate: 0.98, gradedPercent: 7.4, shape: 'modern', peakMonth: 1, sport: 'baseball' },
  { id: 'prd-019', name: '1993 SP Derek Jeter RC', player: 'Derek Jeter', year: 1993, set: 'Upper Deck SP', parallel: 'Base', official: null, estLow: 95000, estMed: 118000, estHigh: 145000, confidence: 62, methodology: 'Historical Pattern + Survival Rate Modeling', totalGraded: 12480, survivalRate: 0.72, gradedPercent: 10.6, shape: 'normal', peakMonth: 16, sport: 'baseball' },
  // ── Hockey ──────────────────────────────────────────────────────────────
  { id: 'prd-020', name: '2023 Upper Deck Connor Bedard YG RC', player: 'Connor Bedard', year: 2023, set: 'Upper Deck Series 1', parallel: 'Young Guns', official: null, estLow: 14000, estMed: 18000, estHigh: 23000, confidence: 70, methodology: 'Submission Rate + UD Historical Print Pattern', totalGraded: 4820, survivalRate: 0.96, gradedPercent: 26.8, shape: 'modern', peakMonth: 4, sport: 'hockey' },
  { id: 'prd-021', name: '2015 Upper Deck Connor McDavid YG RC', player: 'Connor McDavid', year: 2015, set: 'Upper Deck Series 1', parallel: 'Young Guns', official: null, estLow: 18000, estMed: 23000, estHigh: 29000, confidence: 72, methodology: 'Pop Growth Curve + Serial Number Gap', totalGraded: 7410, survivalRate: 0.94, gradedPercent: 32.2, shape: 'top-heavy', peakMonth: 10, sport: 'hockey' },
  // ── Soccer ──────────────────────────────────────────────────────────────
  { id: 'prd-022', name: '2018 Topps Chrome UCL Lamine Yamal', player: 'Lamine Yamal', year: 2023, set: 'Topps Chrome UCL', parallel: 'Base', official: null, estLow: 8000, estMed: 10500, estHigh: 14000, confidence: 66, methodology: 'Submission Velocity + International Market Adjustment', totalGraded: 1920, survivalRate: 0.96, gradedPercent: 18.3, shape: 'modern', peakMonth: 3, sport: 'soccer' },
  // ── Numbered parallels (known print runs) ───────────────────────────────
  { id: 'prd-023', name: '2023 Prizm Wembanyama RC Gold /10', player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', parallel: 'Gold /10', official: 10, estLow: 10, estMed: 10, estHigh: 10, confidence: 99, methodology: 'Official Numbered Print Run', totalGraded: 7, survivalRate: 0.99, gradedPercent: 70, shape: 'top-heavy', peakMonth: 3, sport: 'basketball' },
  { id: 'prd-024', name: '2023 Prizm Wembanyama RC Green /75', player: 'Victor Wembanyama', year: 2023, set: 'Panini Prizm', parallel: 'Green /75', official: 75, estLow: 73, estMed: 75, estHigh: 77, confidence: 98, methodology: 'Official Numbered Print Run', totalGraded: 42, survivalRate: 0.99, gradedPercent: 56, shape: 'modern', peakMonth: 4, sport: 'basketball' },
  { id: 'prd-025', name: '2020 Prizm Joe Burrow RC Neon Green', player: 'Joe Burrow', year: 2020, set: 'Panini Prizm', parallel: 'Neon Green', official: null, estLow: 1800, estMed: 2300, estHigh: 3000, confidence: 78, methodology: 'Capture-Recapture + Parallel Ratio', totalGraded: 874, survivalRate: 0.96, gradedPercent: 38.0, shape: 'modern', peakMonth: 5, sport: 'football' },
  { id: 'prd-026', name: '2023 Topps Chrome Elly De La Cruz RC', player: 'Elly De La Cruz', year: 2023, set: 'Topps Chrome', parallel: 'Base', official: null, estLow: 28000, estMed: 35000, estHigh: 43000, confidence: 69, methodology: 'Submission Rate + Chrome Historical Pattern', totalGraded: 5610, survivalRate: 0.97, gradedPercent: 16.0, shape: 'modern', peakMonth: 4, sport: 'baseball' },
  { id: 'prd-027', name: '2023 Topps Chrome Elly De La Cruz RC Refractor', player: 'Elly De La Cruz', year: 2023, set: 'Topps Chrome', parallel: 'Refractor', official: null, estLow: 4800, estMed: 6200, estHigh: 8000, confidence: 73, methodology: 'Parallel Ratio + Pop Growth Curve', totalGraded: 1240, survivalRate: 0.97, gradedPercent: 20.0, shape: 'modern', peakMonth: 3, sport: 'baseball' },
  { id: 'prd-028', name: '2019 Prizm Zion Williamson RC Base', player: 'Zion Williamson', year: 2019, set: 'Panini Prizm', parallel: 'Base', official: null, estLow: 22000, estMed: 27000, estHigh: 33000, confidence: 75, methodology: 'Population Growth + Sales Velocity', totalGraded: 10520, survivalRate: 0.96, gradedPercent: 39.0, shape: 'top-heavy', peakMonth: 7, sport: 'basketball' },
];

function buildEstimate(seed: CardSeed): PrintRunEstimate {
  const dist = gradeDistribution(seed.totalGraded, seed.shape);
  const tl = timeline(24, seed.peakMonth, seed.totalGraded);
  const avg = avgFromDist(dist);
  const med = medianFromDist(dist);

  const dataPoints: DataPoint[] = [
    { source: 'PSA Population Report', metric: 'Total Graded', value: seed.totalGraded, weight: 0.35, description: `${seed.totalGraded.toLocaleString()} copies graded across all services` },
    { source: 'Capture-Recapture Model', metric: 'Estimated Total', value: seed.estMed, weight: 0.25, description: `Lincoln-Petersen estimator from resale re-appearances` },
    { source: 'eBay Sales Velocity', metric: 'Monthly Sales', value: Math.round(seed.totalGraded * 0.012), weight: 0.15, description: `${Math.round(seed.totalGraded * 0.012)} sales/month across major platforms` },
    { source: 'Submission Rate Model', metric: 'Grading %', value: seed.gradedPercent, weight: 0.15, description: `Estimated ${seed.gradedPercent}% of total population has been graded` },
    { source: 'Manufacturer Pattern DB', metric: 'Historical Ratio', value: seed.estMed / seed.totalGraded, weight: 0.10, description: `Print-to-graded ratio of ${(seed.estMed / seed.totalGraded).toFixed(1)}x matches ${seed.set} historical pattern` },
  ];

  return {
    cardId: seed.id,
    cardName: seed.name,
    player: seed.player,
    year: seed.year,
    set: seed.set,
    parallel: seed.parallel,
    officialPrintRun: seed.official,
    estimatedPrintRun: { low: seed.estLow, median: seed.estMed, high: seed.estHigh },
    confidence: seed.confidence,
    methodology: seed.methodology,
    dataPoints,
    survivalRate: seed.survivalRate,
    gradedPercent: seed.gradedPercent,
    populationData: {
      totalGraded: seed.totalGraded,
      gradeDistribution: dist,
      submissionTimeline: tl,
      avgGrade: avg,
      medianGrade: med,
    },
  };
}

const ESTIMATES: PrintRunEstimate[] = CARD_SEEDS.map(buildEstimate);

// ─── Scarcity Scores ─────────────────────────────────────────────────────────

function buildScarcity(seed: CardSeed): ScarcityScore {
  const median = seed.estMed;
  const absolute = Math.min(100, Math.round(100 * Math.exp(-median / 8000)));
  const allMedians = CARD_SEEDS.map(s => s.estMed);
  const rank = allMedians.filter(m => m < median).length;
  const relative = Math.round((1 - rank / allMedians.length) * 100);
  const functional = Math.min(100, Math.round(absolute * (1 + (1 - seed.gradedPercent / 100) * 0.5)));
  const popAdj = Math.min(100, Math.round(absolute * (2 - seed.survivalRate)));

  const explParts: string[] = [];
  if (absolute > 70) explParts.push('Extremely rare in absolute terms.');
  else if (absolute > 40) explParts.push('Moderately scarce total production.');
  else explParts.push('Widely produced card.');
  if (seed.gradedPercent < 20) explParts.push('Very low grading rate suggests large ungraded pool.');
  if (seed.survivalRate < 0.85) explParts.push('Significant attrition reduces surviving supply.');

  return {
    cardId: seed.id,
    absoluteScarcity: absolute,
    relativeScarcity: relative,
    functionalScarcity: functional,
    populationAdjusted: popAdj,
    explanation: explParts.join(' '),
  };
}

const SCARCITY_MAP: Record<string, ScarcityScore> = {};
for (const s of CARD_SEEDS) SCARCITY_MAP[s.id] = buildScarcity(s);

// ─── Supply / Demand Projections ─────────────────────────────────────────────

function buildProjection(seed: CardSeed): SupplyDemandProjection {
  const recentMonthlyRate = seed.totalGraded / 24;
  const projected12M = Math.round(recentMonthlyRate * 12 * 0.85);
  const estUngraded = Math.round(seed.estMed * (1 - seed.gradedPercent / 100));
  const monthlyVelocity = Math.round(seed.totalGraded * 0.012);

  const demandIndicators: SupplyDemandProjection['demandIndicators'] = [
    { metric: 'Monthly eBay Sales', value: monthlyVelocity, trend: seed.year >= 2023 ? 'up' : 'stable' },
    { metric: 'Google Trend Index', value: Math.min(100, Math.round(50 + seed.confidence * 0.4 + (2025 - seed.year) * -2)), trend: seed.year >= 2023 ? 'up' : 'down' },
    { metric: 'Instagram Mentions/wk', value: Math.round(monthlyVelocity * 2.3), trend: 'stable' },
    { metric: 'Active Listings', value: Math.round(seed.totalGraded * 0.06), trend: seed.year >= 2023 ? 'up' : 'down' },
    { metric: 'Collector Watchlist Adds/mo', value: Math.round(monthlyVelocity * 4.7), trend: seed.year >= 2023 ? 'up' : 'stable' },
  ];

  const basePrice = seed.estMed < 1000 ? 2400 : seed.estMed < 5000 ? 680 : seed.estMed < 20000 ? 180 : seed.estMed < 40000 ? 55 : 22;
  const equilibrium = Math.round(basePrice * (1 + (100 - seed.confidence) / 200));

  return {
    cardId: seed.id,
    currentSupply: seed.totalGraded,
    projectedSubmissions12M: projected12M,
    estimatedUngraded: estUngraded,
    demandIndicators,
    equilibriumPrice: equilibrium,
  };
}

const PROJECTION_MAP: Record<string, SupplyDemandProjection> = {};
for (const s of CARD_SEEDS) PROJECTION_MAP[s.id] = buildProjection(s);

// ─── Set Analyses ────────────────────────────────────────────────────────────

const SET_ANALYSES: SetAnalysis[] = [
  {
    setName: 'Panini Prizm Basketball',
    year: 2023,
    manufacturer: 'Panini',
    baseRunEstimate: 35000,
    parallelRuns: [
      { parallel: 'Base', multiplier: 1.0, estimatedRun: 35000 },
      { parallel: 'Silver', multiplier: 0.10, estimatedRun: 3500 },
      { parallel: 'Red White Blue', multiplier: 0.06, estimatedRun: 2100 },
      { parallel: 'Neon Green', multiplier: 0.065, estimatedRun: 2275 },
      { parallel: 'Blue /199', multiplier: 0.0057, estimatedRun: 199 },
      { parallel: 'Green /75', multiplier: 0.0021, estimatedRun: 75 },
      { parallel: 'Gold /10', multiplier: 0.00029, estimatedRun: 10 },
      { parallel: 'Black 1/1', multiplier: 0.000029, estimatedRun: 1 },
    ],
    totalCardsEstimate: 1_575_000,
  },
  {
    setName: 'Panini Prizm Football',
    year: 2020,
    manufacturer: 'Panini',
    baseRunEstimate: 30000,
    parallelRuns: [
      { parallel: 'Base', multiplier: 1.0, estimatedRun: 30000 },
      { parallel: 'Silver', multiplier: 0.17, estimatedRun: 5100 },
      { parallel: 'Red White Blue', multiplier: 0.08, estimatedRun: 2400 },
      { parallel: 'Neon Green', multiplier: 0.077, estimatedRun: 2310 },
      { parallel: 'Blue /199', multiplier: 0.0066, estimatedRun: 199 },
      { parallel: 'Green /75', multiplier: 0.0025, estimatedRun: 75 },
      { parallel: 'Gold /10', multiplier: 0.00033, estimatedRun: 10 },
      { parallel: 'Black 1/1', multiplier: 0.000033, estimatedRun: 1 },
    ],
    totalCardsEstimate: 1_500_000,
  },
  {
    setName: 'Topps Chrome Baseball',
    year: 2022,
    manufacturer: 'Topps',
    baseRunEstimate: 40000,
    parallelRuns: [
      { parallel: 'Base', multiplier: 1.0, estimatedRun: 40000 },
      { parallel: 'Refractor', multiplier: 0.175, estimatedRun: 7000 },
      { parallel: 'Pink Refractor', multiplier: 0.10, estimatedRun: 4000 },
      { parallel: 'Sepia Refractor', multiplier: 0.075, estimatedRun: 3000 },
      { parallel: 'Green /99', multiplier: 0.0025, estimatedRun: 99 },
      { parallel: 'Gold /50', multiplier: 0.00125, estimatedRun: 50 },
      { parallel: 'Red /5', multiplier: 0.000125, estimatedRun: 5 },
      { parallel: 'Superfractor 1/1', multiplier: 0.000025, estimatedRun: 1 },
    ],
    totalCardsEstimate: 2_200_000,
  },
  {
    setName: 'Upper Deck Series 1 Hockey',
    year: 2023,
    manufacturer: 'Upper Deck',
    baseRunEstimate: 25000,
    parallelRuns: [
      { parallel: 'Young Guns', multiplier: 0.72, estimatedRun: 18000 },
      { parallel: 'Young Guns Exclusives /100', multiplier: 0.004, estimatedRun: 100 },
      { parallel: 'Young Guns High Gloss /10', multiplier: 0.0004, estimatedRun: 10 },
      { parallel: 'Clear Cut YG', multiplier: 0.04, estimatedRun: 1000 },
      { parallel: 'Base', multiplier: 1.0, estimatedRun: 25000 },
    ],
    totalCardsEstimate: 1_100_000,
  },
  {
    setName: 'Bowman Chrome Baseball',
    year: 2024,
    manufacturer: 'Topps',
    baseRunEstimate: 28000,
    parallelRuns: [
      { parallel: 'Base', multiplier: 1.0, estimatedRun: 28000 },
      { parallel: 'Refractor', multiplier: 0.164, estimatedRun: 4600 },
      { parallel: 'Green Refractor /99', multiplier: 0.0035, estimatedRun: 99 },
      { parallel: 'Blue Refractor /150', multiplier: 0.0054, estimatedRun: 150 },
      { parallel: 'Gold Refractor /50', multiplier: 0.0018, estimatedRun: 50 },
      { parallel: 'Orange Refractor /25', multiplier: 0.00089, estimatedRun: 25 },
      { parallel: 'Red Refractor /5', multiplier: 0.000179, estimatedRun: 5 },
      { parallel: 'Superfractor 1/1', multiplier: 0.0000357, estimatedRun: 1 },
    ],
    totalCardsEstimate: 980_000,
  },
];

// ─── Public API ──────────────────────────────────────────────────────────────

export function getPrintRunEstimate(cardId: string): PrintRunEstimate | undefined {
  return ESTIMATES.find(e => e.cardId === cardId);
}

export function getAllPrintRunEstimates(): PrintRunEstimate[] {
  return ESTIMATES;
}

export function getPopulationData(cardId: string): PopulationData | undefined {
  return ESTIMATES.find(e => e.cardId === cardId)?.populationData;
}

export function getScarcityScore(cardId: string): ScarcityScore | undefined {
  return SCARCITY_MAP[cardId];
}

export function getAllScarcityScores(): ScarcityScore[] {
  return Object.values(SCARCITY_MAP);
}

export function getSetAnalysis(setName: string, year?: number): SetAnalysis | undefined {
  return SET_ANALYSES.find(
    sa => sa.setName.toLowerCase().includes(setName.toLowerCase()) && (!year || sa.year === year),
  );
}

export function getAllSetAnalyses(): SetAnalysis[] {
  return SET_ANALYSES;
}

export function comparePrintRuns(cardIds: string[]): PrintRunComparison {
  const cards = cardIds
    .map(id => ESTIMATES.find(e => e.cardId === id))
    .filter((e): e is PrintRunEstimate => !!e)
    .map(e => ({
      cardId: e.cardId,
      name: e.cardName,
      estimatedRun: e.estimatedPrintRun.median,
      officialRun: e.officialPrintRun,
    }));

  const setTotal = cards.reduce((s, c) => s + c.estimatedRun, 0);

  const parallelMultipliers: PrintRunComparison['parallelMultipliers'] = [
    { parallel: 'Base', multiplier: 1.0 },
    { parallel: 'Silver / Refractor', multiplier: 0.15 },
    { parallel: 'Numbered /199', multiplier: 0.006 },
    { parallel: 'Numbered /75', multiplier: 0.002 },
    { parallel: 'Numbered /10', multiplier: 0.0003 },
    { parallel: '1/1', multiplier: 0.00003 },
  ];

  return { cards, setTotal, parallelMultipliers };
}

export function getSupplyDemandProjection(cardId: string): SupplyDemandProjection | undefined {
  return PROJECTION_MAP[cardId];
}

export function getMostUndercountedCards(sport?: string): PrintRunEstimate[] {
  const filtered = sport
    ? ESTIMATES.filter((_, i) => CARD_SEEDS[i].sport === sport)
    : ESTIMATES;

  return [...filtered]
    .filter(e => e.officialPrintRun === null)
    .sort((a, b) => {
      const ratioA = a.estimatedPrintRun.high / a.estimatedPrintRun.low;
      const ratioB = b.estimatedPrintRun.high / b.estimatedPrintRun.low;
      return ratioB - ratioA;
    })
    .slice(0, 10);
}

export function getSubmissionTrend(cardId: string): PopulationData['submissionTimeline'] {
  return ESTIMATES.find(e => e.cardId === cardId)?.populationData.submissionTimeline ?? [];
}

export function getCardsBySport(sport: string): PrintRunEstimate[] {
  return ESTIMATES.filter((_, i) => CARD_SEEDS[i].sport === sport);
}
