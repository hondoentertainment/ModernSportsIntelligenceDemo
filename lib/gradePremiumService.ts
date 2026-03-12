import { CardInventory } from '../types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type GradingCompany = 'PSA' | 'BGS' | 'SGC' | 'CSG' | 'HGA';

export interface GradePriceEntry {
  grade: string;
  company: GradingCompany;
  estimatedValue: number;
  populationCount: number;
  premiumOverRaw: number; // multiplier
}

export interface GradePremiumTable {
  cardId: string;
  player: string;
  baseRawValue: number;
  entries: GradePriceEntry[];
}

export interface CrossGraderComparison {
  grade: string; // e.g. "10"
  psa: { label: string; value: number; pop: number };
  bgs: { label: string; value: number; pop: number };
  sgc: { label: string; value: number; pop: number };
  valueDiffPsaVsBgs: number;
  valueDiffPsaVsSgc: number;
}

export interface ArbitrageOpportunity {
  cardId: string;
  player: string;
  fromCompany: GradingCompany;
  fromGrade: string;
  toCompany: GradingCompany;
  toGrade: string;
  currentValue: number;
  targetValue: number;
  estimatedCost: number;
  netProfit: number;
  roi: number;
  confidence: number; // 0-100
}

export interface CrossoverROI {
  cardId: string;
  player: string;
  sourceCompany: GradingCompany;
  sourceGrade: string;
  targetCompany: GradingCompany;
  targetGrade: string;
  currentValue: number;
  projectedValue: number;
  crossoverFee: number;
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  expectedGain: number;
  roi: number;
  successProbability: number;
  recommendation: 'Strong Buy' | 'Consider' | 'Hold' | 'Not Recommended';
}

export interface GradeDistributionEntry {
  grade: string;
  count: number;
  totalValue: number;
  avgValue: number;
}

export interface PortfolioGradeAnalysis {
  totalGraded: number;
  totalRaw: number;
  averageGrade: number;
  gemRate: number; // percentage of 9.5+ / 10
  gradeDistribution: GradeDistributionEntry[];
  upgradeOpportunityCount: number;
  totalUpgradeValue: number;
  companyBreakdown: { company: string; count: number; avgGrade: number }[];
}

export interface GradePremiumPreferences {
  preferredCompany: GradingCompany;
  showArbitrageAlerts: boolean;
  minimumArbitrageROI: number;
  trackedCrossovers: TrackedCrossover[];
}

export interface TrackedCrossover {
  id: string;
  cardId: string;
  player: string;
  fromCompany: GradingCompany;
  fromGrade: string;
  toCompany: GradingCompany;
  toGrade: string;
  estimatedROI: number;
  status: 'planned' | 'submitted' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  actualResult?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LS_PREFERENCES_KEY = 'msi_grade_premium_prefs';
const LS_CROSSOVERS_KEY = 'msi_grade_crossover_tracking';

const GRADE_MULTIPLIERS: Record<string, number> = {
  '10':   8.5,
  '9.5':  4.2,
  '9':    2.5,
  '8.5':  1.8,
  '8':    1.4,
  '7.5':  1.15,
  '7':    1.0,
  '6.5':  0.85,
  '6':    0.7,
  '5':    0.5,
  '4':    0.35,
  '3':    0.25,
  '2':    0.15,
  '1':    0.08,
};

/** Company-specific multiplier adjustments relative to PSA baseline */
const COMPANY_ADJUSTMENTS: Record<GradingCompany, Record<string, number>> = {
  PSA: { '10': 1.0, '9': 1.0, '8': 1.0, '7': 1.0 },
  BGS: { '10': 1.25, '9.5': 1.15, '9': 0.90, '8.5': 0.85, '8': 0.82 },
  SGC: { '10': 0.72, '9.5': 0.68, '9': 0.65, '8': 0.60 },
  CSG: { '10': 0.55, '9.5': 0.52, '9': 0.50, '8': 0.48 },
  HGA: { '10': 0.48, '9.5': 0.45, '9': 0.42, '8': 0.40 },
};

const CROSSOVER_FEES: Record<GradingCompany, number> = {
  PSA: 30,
  BGS: 25,
  SGC: 20,
  CSG: 18,
  HGA: 15,
};

const SHIPPING_COST = 12;
const INSURANCE_RATE = 0.015; // 1.5% of declared value

const GRADES_ORDERED = ['10', '9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6', '5', '4', '3', '2', '1'];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = (h ^ (h >>> 16)) * 0x45d9f3b;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
  };
}

function parseNumericGrade(grade?: string): number {
  if (!grade) return 0;
  const num = parseFloat(grade.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

function getBaseRawValue(card: CardInventory): number {
  const val = card.currentValue ?? card.purchasePrice;
  // Raw value is the card value without grading premium
  if (card.isGraded && card.grade) {
    const numGrade = parseNumericGrade(card.grade);
    const gradeKey = numGrade >= 9.5 ? '10' : numGrade >= 8.5 ? '9' : numGrade >= 7.5 ? '8' : '7';
    const mult = GRADE_MULTIPLIERS[gradeKey] ?? 1.0;
    return Math.round(val / mult);
  }
  return Math.round(val * 0.85); // raw cards slightly discounted
}

function generatePopulation(seed: string, grade: string): number {
  const rng = seededRandom(seed + grade);
  const gradeNum = parseFloat(grade);
  if (gradeNum >= 10) return Math.floor(rng() * 500) + 10;
  if (gradeNum >= 9.5) return Math.floor(rng() * 1200) + 50;
  if (gradeNum >= 9) return Math.floor(rng() * 3000) + 200;
  if (gradeNum >= 8) return Math.floor(rng() * 5000) + 500;
  return Math.floor(rng() * 2000) + 100;
}

/* ------------------------------------------------------------------ */
/*  Grade Premium Table                                                */
/* ------------------------------------------------------------------ */

export function getGradePremiumTable(card: CardInventory): GradePremiumTable {
  const baseRaw = getBaseRawValue(card);
  const rng = seededRandom(card.id + 'premium');
  const entries: GradePriceEntry[] = [];

  const companies: GradingCompany[] = ['PSA', 'BGS', 'SGC'];
  const keyGrades = ['10', '9.5', '9', '8.5', '8'];

  for (const company of companies) {
    for (const grade of keyGrades) {
      // Skip grades not applicable to certain companies
      if (company === 'PSA' && (grade === '9.5' || grade === '8.5')) continue;

      const baseMult = GRADE_MULTIPLIERS[grade] ?? 1.0;
      const companyAdj = COMPANY_ADJUSTMENTS[company]?.[grade] ?? 0.7;
      const variance = 0.9 + rng() * 0.2;
      const estimatedValue = Math.round(baseRaw * baseMult * companyAdj * variance);
      const pop = generatePopulation(card.id + company, grade);

      entries.push({
        grade: `${company} ${grade}`,
        company,
        estimatedValue: Math.max(estimatedValue, 1),
        populationCount: pop,
        premiumOverRaw: Math.round((estimatedValue / baseRaw) * 100) / 100,
      });
    }
  }

  return {
    cardId: card.id,
    player: card.player,
    baseRawValue: baseRaw,
    entries: entries.sort((a, b) => b.estimatedValue - a.estimatedValue),
  };
}

/* ------------------------------------------------------------------ */
/*  Cross-Grader Comparison                                            */
/* ------------------------------------------------------------------ */

export function getCrossGraderComparison(card: CardInventory): CrossGraderComparison[] {
  const table = getGradePremiumTable(card);
  const grades = ['10', '9', '8'];
  const results: CrossGraderComparison[] = [];

  for (const grade of grades) {
    const psaEntry = table.entries.find(e => e.company === 'PSA' && e.grade === `PSA ${grade}`);
    const bgsGrade = grade === '10' ? '10' : grade === '9' ? '9' : '8';
    const bgsEntry = table.entries.find(e => e.company === 'BGS' && e.grade === `BGS ${bgsGrade}`);
    const sgcEntry = table.entries.find(e => e.company === 'SGC' && e.grade === `SGC ${grade}`);

    if (!psaEntry || !bgsEntry || !sgcEntry) continue;

    const bgsLabel = grade === '10' ? 'BGS 10 Black Label' : `BGS ${bgsGrade}`;
    const sgcLabel = grade === '10' ? 'SGC 10 Pristine' : `SGC ${grade}`;

    results.push({
      grade,
      psa: { label: `PSA ${grade}`, value: psaEntry.estimatedValue, pop: psaEntry.populationCount },
      bgs: { label: bgsLabel, value: bgsEntry.estimatedValue, pop: bgsEntry.populationCount },
      sgc: { label: sgcLabel, value: sgcEntry.estimatedValue, pop: sgcEntry.populationCount },
      valueDiffPsaVsBgs: psaEntry.estimatedValue - bgsEntry.estimatedValue,
      valueDiffPsaVsSgc: psaEntry.estimatedValue - sgcEntry.estimatedValue,
    });
  }

  return results;
}

/* ------------------------------------------------------------------ */
/*  Arbitrage Finder                                                   */
/* ------------------------------------------------------------------ */

export function findArbitrageOpportunities(cards: CardInventory[]): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];

  const gradedCards = cards.filter(c => c.isGraded && c.grade && c.gradingCompany);

  for (const card of gradedCards) {
    const company = card.gradingCompany as GradingCompany;
    const numGrade = parseNumericGrade(card.grade);
    if (numGrade < 8) continue; // Only consider high-grade cards

    const table = getGradePremiumTable(card);
    const currentValue = card.currentValue ?? card.purchasePrice;

    // Check crossover to PSA if not already PSA
    if (company !== 'PSA' && numGrade >= 9) {
      const psaTarget = table.entries.find(e => e.company === 'PSA' && e.grade === `PSA ${Math.floor(numGrade)}`);
      if (psaTarget && psaTarget.estimatedValue > currentValue) {
        const cost = CROSSOVER_FEES.PSA + SHIPPING_COST + (currentValue * INSURANCE_RATE);
        const netProfit = psaTarget.estimatedValue - currentValue - cost;
        const roi = (netProfit / cost) * 100;

        if (roi > 15) {
          const rng = seededRandom(card.id + 'arb');
          opportunities.push({
            cardId: card.id,
            player: card.player,
            fromCompany: company,
            fromGrade: card.grade!,
            toCompany: 'PSA',
            toGrade: `${Math.floor(numGrade)}`,
            currentValue,
            targetValue: psaTarget.estimatedValue,
            estimatedCost: Math.round(cost),
            netProfit: Math.round(netProfit),
            roi: Math.round(roi),
            confidence: Math.floor(55 + rng() * 35),
          });
        }
      }
    }

    // Check BGS crossover for PSA cards with half-grade potential
    if (company === 'PSA' && numGrade >= 9) {
      const bgsTarget = table.entries.find(e => e.company === 'BGS' && e.grade === `BGS ${numGrade >= 10 ? '10' : '9.5'}`);
      if (bgsTarget && bgsTarget.estimatedValue > currentValue * 1.1) {
        const cost = CROSSOVER_FEES.BGS + SHIPPING_COST + (currentValue * INSURANCE_RATE);
        const netProfit = bgsTarget.estimatedValue - currentValue - cost;
        const roi = (netProfit / cost) * 100;

        if (roi > 10) {
          const rng = seededRandom(card.id + 'arb2');
          opportunities.push({
            cardId: card.id,
            player: card.player,
            fromCompany: 'PSA',
            fromGrade: card.grade!,
            toCompany: 'BGS',
            toGrade: numGrade >= 10 ? '10' : '9.5',
            currentValue,
            targetValue: bgsTarget.estimatedValue,
            estimatedCost: Math.round(cost),
            netProfit: Math.round(netProfit),
            roi: Math.round(roi),
            confidence: Math.floor(30 + rng() * 40),
          });
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.roi - a.roi);
}

/* ------------------------------------------------------------------ */
/*  Crossover ROI Calculator                                           */
/* ------------------------------------------------------------------ */

export function calculateCrossoverROI(
  card: CardInventory,
  targetCompany: GradingCompany,
  targetGrade: string,
): CrossoverROI {
  const sourceCompany = (card.gradingCompany ?? 'PSA') as GradingCompany;
  const sourceGrade = card.grade ?? 'Raw';
  const currentValue = card.currentValue ?? card.purchasePrice;

  const table = getGradePremiumTable(card);
  const targetEntry = table.entries.find(
    e => e.company === targetCompany && e.grade === `${targetCompany} ${targetGrade}`
  );

  const projectedValue = targetEntry?.estimatedValue ?? currentValue;
  const crossoverFee = CROSSOVER_FEES[targetCompany] ?? 25;
  const shippingCost = SHIPPING_COST;
  const insuranceCost = Math.round(currentValue * INSURANCE_RATE);
  const totalCost = crossoverFee + shippingCost + insuranceCost;
  const expectedGain = projectedValue - currentValue - totalCost;
  const roi = totalCost > 0 ? Math.round((expectedGain / totalCost) * 100) : 0;

  const rng = seededRandom(card.id + targetCompany + targetGrade);
  const numSource = parseNumericGrade(sourceGrade);
  const numTarget = parseFloat(targetGrade);

  // Success probability based on grade relationship
  let successProbability: number;
  if (numTarget <= numSource) {
    successProbability = Math.floor(65 + rng() * 25);
  } else if (numTarget <= numSource + 0.5) {
    successProbability = Math.floor(30 + rng() * 25);
  } else {
    successProbability = Math.floor(5 + rng() * 20);
  }

  let recommendation: CrossoverROI['recommendation'];
  if (roi > 100 && successProbability > 50) recommendation = 'Strong Buy';
  else if (roi > 30 && successProbability > 40) recommendation = 'Consider';
  else if (roi > 0) recommendation = 'Hold';
  else recommendation = 'Not Recommended';

  return {
    cardId: card.id,
    player: card.player,
    sourceCompany,
    sourceGrade,
    targetCompany,
    targetGrade,
    currentValue,
    projectedValue,
    crossoverFee,
    shippingCost,
    insuranceCost,
    totalCost,
    expectedGain: Math.round(expectedGain),
    roi,
    successProbability,
    recommendation,
  };
}

/* ------------------------------------------------------------------ */
/*  Grade Distribution (for Recharts)                                  */
/* ------------------------------------------------------------------ */

export function getGradeDistribution(cards: CardInventory[]): GradeDistributionEntry[] {
  const graded = cards.filter(c => c.isGraded && c.grade);
  const buckets: Record<string, { count: number; totalValue: number }> = {};

  for (const grade of GRADES_ORDERED) {
    buckets[grade] = { count: 0, totalValue: 0 };
  }

  for (const card of graded) {
    const num = parseNumericGrade(card.grade);
    // Map to nearest standard grade
    let gradeKey = GRADES_ORDERED.find(g => Math.abs(parseFloat(g) - num) < 0.3);
    if (!gradeKey) gradeKey = String(Math.round(num));
    if (!buckets[gradeKey]) buckets[gradeKey] = { count: 0, totalValue: 0 };

    buckets[gradeKey].count += 1;
    buckets[gradeKey].totalValue += card.currentValue ?? card.purchasePrice;
  }

  return GRADES_ORDERED
    .map(grade => ({
      grade,
      count: buckets[grade]?.count ?? 0,
      totalValue: Math.round(buckets[grade]?.totalValue ?? 0),
      avgValue: buckets[grade]?.count
        ? Math.round((buckets[grade].totalValue) / buckets[grade].count)
        : 0,
    }))
    .filter(e => e.count > 0 || ['10', '9.5', '9', '8.5', '8', '7'].includes(e.grade));
}

/* ------------------------------------------------------------------ */
/*  Portfolio Grade Analysis                                           */
/* ------------------------------------------------------------------ */

export function getPortfolioGradeAnalysis(cards: CardInventory[]): PortfolioGradeAnalysis {
  const graded = cards.filter(c => c.isGraded && c.grade);
  const raw = cards.filter(c => !c.isGraded);
  const distribution = getGradeDistribution(cards);

  // Average grade
  let gradeSum = 0;
  for (const card of graded) {
    gradeSum += parseNumericGrade(card.grade);
  }
  const averageGrade = graded.length > 0 ? Math.round((gradeSum / graded.length) * 10) / 10 : 0;

  // Gem rate: PSA 10, BGS 9.5+, SGC 10
  const gemCards = graded.filter(c => {
    const num = parseNumericGrade(c.grade);
    return num >= 9.5;
  });
  const gemRate = graded.length > 0 ? Math.round((gemCards.length / graded.length) * 1000) / 10 : 0;

  // Upgrade opportunities: cards that could benefit from crossover
  const arbitrage = findArbitrageOpportunities(cards);
  const upgradeOpportunityCount = arbitrage.length;
  const totalUpgradeValue = arbitrage.reduce((sum, a) => sum + a.netProfit, 0);

  // Company breakdown
  const companyMap: Record<string, { count: number; gradeSum: number }> = {};
  for (const card of graded) {
    const company = card.gradingCompany ?? 'Unknown';
    if (!companyMap[company]) companyMap[company] = { count: 0, gradeSum: 0 };
    companyMap[company].count += 1;
    companyMap[company].gradeSum += parseNumericGrade(card.grade);
  }

  const companyBreakdown = Object.entries(companyMap).map(([company, data]) => ({
    company,
    count: data.count,
    avgGrade: Math.round((data.gradeSum / data.count) * 10) / 10,
  })).sort((a, b) => b.count - a.count);

  return {
    totalGraded: graded.length,
    totalRaw: raw.length,
    averageGrade,
    gemRate,
    gradeDistribution: distribution,
    upgradeOpportunityCount,
    totalUpgradeValue: Math.round(totalUpgradeValue),
    companyBreakdown,
  };
}

/* ------------------------------------------------------------------ */
/*  Top Crossover Opportunities (for widget)                           */
/* ------------------------------------------------------------------ */

export function getTopCrossoverOpportunities(cards: CardInventory[], limit = 3): ArbitrageOpportunity[] {
  return findArbitrageOpportunities(cards).slice(0, limit);
}

/* ------------------------------------------------------------------ */
/*  Preferences Persistence                                            */
/* ------------------------------------------------------------------ */

export function getGradePremiumPreferences(): GradePremiumPreferences {
  try {
    const stored = localStorage.getItem(LS_PREFERENCES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return {
    preferredCompany: 'PSA',
    showArbitrageAlerts: true,
    minimumArbitrageROI: 20,
    trackedCrossovers: [],
  };
}

export function saveGradePremiumPreferences(prefs: GradePremiumPreferences): void {
  localStorage.setItem(LS_PREFERENCES_KEY, JSON.stringify(prefs));
}

/* ------------------------------------------------------------------ */
/*  Crossover Tracking Persistence                                     */
/* ------------------------------------------------------------------ */

export function getTrackedCrossovers(): TrackedCrossover[] {
  try {
    const stored = localStorage.getItem(LS_CROSSOVERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

export function addTrackedCrossover(crossover: Omit<TrackedCrossover, 'id' | 'createdAt'>): TrackedCrossover {
  const tracked = getTrackedCrossovers();
  const newEntry: TrackedCrossover = {
    ...crossover,
    id: `xover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  tracked.push(newEntry);
  localStorage.setItem(LS_CROSSOVERS_KEY, JSON.stringify(tracked));
  return newEntry;
}

export function updateTrackedCrossover(id: string, updates: Partial<TrackedCrossover>): void {
  const tracked = getTrackedCrossovers();
  const idx = tracked.findIndex(t => t.id === id);
  if (idx !== -1) {
    tracked[idx] = { ...tracked[idx], ...updates };
    localStorage.setItem(LS_CROSSOVERS_KEY, JSON.stringify(tracked));
  }
}

export function removeTrackedCrossover(id: string): void {
  const tracked = getTrackedCrossovers().filter(t => t.id !== id);
  localStorage.setItem(LS_CROSSOVERS_KEY, JSON.stringify(tracked));
}

/* ------------------------------------------------------------------ */
/*  Utility Exports                                                    */
/* ------------------------------------------------------------------ */

export function formatGrade(company: string, grade: string): string {
  if (company === 'BGS' && grade === '10') return 'BGS 10 Black Label';
  if (company === 'SGC' && grade === '10') return 'SGC 10 Pristine';
  if (company === 'BGS' && grade === '9.5') return 'BGS 9.5 Gem Mint';
  if (company === 'PSA' && grade === '10') return 'PSA 10 Gem Mint';
  return `${company} ${grade}`;
}

export function getGradeColor(grade: number): string {
  if (grade >= 10) return '#10b981';
  if (grade >= 9.5) return '#34d399';
  if (grade >= 9) return '#3b82f6';
  if (grade >= 8) return '#8b5cf6';
  if (grade >= 7) return '#f59e0b';
  return '#ef4444';
}

export { GRADES_ORDERED, CROSSOVER_FEES, COMPANY_ADJUSTMENTS };
