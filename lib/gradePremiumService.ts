import { CardInventory } from '../types';
import { store } from './dal/syncStore';

// ---- Types ----

export interface GradePremium {
  grade: string;
  grader: string;
  multiplier: number;
  estimatedValue: number;
  premiumOverRaw: number; // percentage
}

export interface CrossGraderComparison {
  grade: string;
  psaValue: number;
  bgsValue: number;
  sgcValue: number;
  bestGrader: 'PSA' | 'BGS' | 'SGC';
  bestValue: number;
}

export interface CrossoverOpportunity {
  cardId: string;
  player: string;
  cardDescription: string;
  currentGrader: string;
  currentGrade: string;
  targetGrader: string;
  targetGrade: string;
  currentValue: number;
  targetValue: number;
  crossoverFee: number;
  successRate: number; // 0-1
  expectedProfit: number;
  expectedROI: number; // percentage
}

export interface GradeDistribution {
  grade: string;
  population: number;
  percentage: number;
}

export interface CrossoverROI {
  cost: number;
  successRate: number;
  expectedValueGain: number;
  netROI: number; // percentage
}

export interface PortfolioGradeAnalysis {
  averageGrade: number;
  gemRate: number; // percentage of cards graded 9.5+
  totalCards: number;
  gradedCards: number;
  ungradedCards: number;
  gradeDistribution: { grade: string; count: number }[];
  graderDistribution: { grader: string; count: number }[];
  totalCrossoverOpportunities: number;
  upgradeValuePotential: number;
  topCrossoverOpportunities: CrossoverOpportunity[];
}

// ---- Constants ----

const PREFS_KEY = 'msi_grade_premium_prefs';

const GRADE_MULTIPLIERS: Record<string, number> = {
  'Raw': 1,
  'PSA 1': 0.8,
  'PSA 2': 0.9,
  'PSA 3': 1.0,
  'PSA 4': 1.1,
  'PSA 5': 1.3,
  'PSA 6': 1.5,
  'PSA 7': 1.8,
  'PSA 8': 2.0,
  'PSA 9': 4.0,
  'PSA 10': 10.0,
  'BGS 8': 1.8,
  'BGS 8.5': 2.2,
  'BGS 9': 3.5,
  'BGS 9.5': 6.0,
  'BGS 10': 15.0,
  'SGC 8': 1.6,
  'SGC 8.5': 1.9,
  'SGC 9': 3.2,
  'SGC 9.5': 5.0,
  'SGC 10': 8.0,
};

const CROSSOVER_FEE = 30;

// ---- Helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function getCardBaseValue(card: CardInventory): number {
  // Base value for raw = purchase price adjusted down if graded
  if (card.isGraded && card.grade && card.gradingCompany) {
    const key = `${card.gradingCompany} ${card.grade}`;
    const mult = GRADE_MULTIPLIERS[key] ?? 2.0;
    return (card.currentValue ?? card.purchasePrice) / mult;
  }
  return card.currentValue ?? card.purchasePrice;
}

function getCardSeed(card: CardInventory): number {
  let hash = 0;
  const str = card.id + card.player + card.year;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ---- Public API ----

export function getGradePremiumTable(card: CardInventory): GradePremium[] {
  const baseValue = getCardBaseValue(card);
  const seed = getCardSeed(card);

  const grades = [
    { grade: 'Raw', grader: 'None' },
    { grade: 'PSA 8', grader: 'PSA' },
    { grade: 'PSA 9', grader: 'PSA' },
    { grade: 'PSA 10', grader: 'PSA' },
    { grade: 'BGS 9', grader: 'BGS' },
    { grade: 'BGS 9.5', grader: 'BGS' },
    { grade: 'BGS 10', grader: 'BGS' },
    { grade: 'SGC 9', grader: 'SGC' },
    { grade: 'SGC 10', grader: 'SGC' },
  ];

  return grades.map((g, i) => {
    const key = g.grade === 'Raw' ? 'Raw' : g.grade;
    const baseMult = GRADE_MULTIPLIERS[key] ?? 1;
    // Add slight card-specific variation (+/- 10%)
    const variation = 1 + (seededRandom(seed, i * 3) - 0.5) * 0.2;
    const multiplier = Math.round(baseMult * variation * 100) / 100;
    const estimatedValue = Math.round(baseValue * multiplier * 100) / 100;
    const premiumOverRaw = Math.round((multiplier - 1) * 100 * 100) / 100;

    return {
      grade: g.grade,
      grader: g.grader,
      multiplier,
      estimatedValue,
      premiumOverRaw,
    };
  });
}

export function getCrossGraderComparison(card: CardInventory): CrossGraderComparison[] {
  const baseValue = getCardBaseValue(card);
  const seed = getCardSeed(card);

  const gradeLevels = ['8', '8.5', '9', '9.5', '10'];

  return gradeLevels.map((grade, i) => {
    const psaKey = `PSA ${grade}`;
    const bgsKey = `BGS ${grade}`;
    const sgcKey = `SGC ${grade}`;

    const psaMult = GRADE_MULTIPLIERS[psaKey] ?? (1 + parseFloat(grade) * 0.5);
    const bgsMult = GRADE_MULTIPLIERS[bgsKey] ?? psaMult * 0.9;
    const sgcMult = GRADE_MULTIPLIERS[sgcKey] ?? psaMult * 0.75;

    // Card-specific variation
    const v1 = 1 + (seededRandom(seed, 100 + i) - 0.5) * 0.15;
    const v2 = 1 + (seededRandom(seed, 200 + i) - 0.5) * 0.15;
    const v3 = 1 + (seededRandom(seed, 300 + i) - 0.5) * 0.15;

    const psaValue = Math.round(baseValue * psaMult * v1 * 100) / 100;
    const bgsValue = Math.round(baseValue * bgsMult * v2 * 100) / 100;
    const sgcValue = Math.round(baseValue * sgcMult * v3 * 100) / 100;

    const values: [number, 'PSA' | 'BGS' | 'SGC'][] = [
      [psaValue, 'PSA'],
      [bgsValue, 'BGS'],
      [sgcValue, 'SGC'],
    ];
    const best = values.reduce((a, b) => (b[0] > a[0] ? b : a));

    return {
      grade,
      psaValue,
      bgsValue,
      sgcValue,
      bestGrader: best[1],
      bestValue: best[0],
    };
  });
}

export function findCrossoverOpportunities(cards: CardInventory[]): CrossoverOpportunity[] {
  const opportunities: CrossoverOpportunity[] = [];

  const gradedCards = cards.filter(
    (c) => c.isGraded && c.grade && c.gradingCompany && c.status !== 'sold'
  );

  for (const card of gradedCards) {
    const seed = getCardSeed(card);
    const baseValue = getCardBaseValue(card);
    const gradeNum = parseFloat(card.grade!);
    if (isNaN(gradeNum)) continue;

    const currentValue = card.currentValue ?? card.purchasePrice;

    // BGS 9.5 -> PSA 10 crossover opportunity
    if (card.gradingCompany === 'BGS' && gradeNum >= 9.5) {
      const successRate = 0.6 + seededRandom(seed, 50) * 0.2; // 60-80%
      const targetValue = Math.round(baseValue * (GRADE_MULTIPLIERS['PSA 10'] ?? 10) * 100) / 100;
      const expectedProfit = Math.round(
        (targetValue - currentValue) * successRate - CROSSOVER_FEE
      );

      if (expectedProfit > 0) {
        opportunities.push({
          cardId: card.id,
          player: card.player,
          cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
          currentGrader: 'BGS',
          currentGrade: card.grade!,
          targetGrader: 'PSA',
          targetGrade: '10',
          currentValue,
          targetValue,
          crossoverFee: CROSSOVER_FEE,
          successRate: Math.round(successRate * 100) / 100,
          expectedProfit,
          expectedROI: Math.round((expectedProfit / (currentValue + CROSSOVER_FEE)) * 100 * 100) / 100,
        });
      }
    }

    // SGC -> PSA crossover opportunity (same grade level)
    if (card.gradingCompany === 'SGC' && gradeNum >= 9) {
      const psaGrade = gradeNum >= 10 ? '10' : gradeNum >= 9.5 ? '10' : '9';
      const psaKey = `PSA ${psaGrade}`;
      const successRate = psaGrade === '10' ? 0.6 + seededRandom(seed, 60) * 0.15 : 0.7 + seededRandom(seed, 61) * 0.1;
      const targetValue = Math.round(baseValue * (GRADE_MULTIPLIERS[psaKey] ?? 4) * 100) / 100;
      const expectedProfit = Math.round(
        (targetValue - currentValue) * successRate - CROSSOVER_FEE
      );

      if (expectedProfit > 0) {
        opportunities.push({
          cardId: card.id,
          player: card.player,
          cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
          currentGrader: 'SGC',
          currentGrade: card.grade!,
          targetGrader: 'PSA',
          targetGrade: psaGrade,
          currentValue,
          targetValue,
          crossoverFee: CROSSOVER_FEE,
          successRate: Math.round(successRate * 100) / 100,
          expectedProfit,
          expectedROI: Math.round((expectedProfit / (currentValue + CROSSOVER_FEE)) * 100 * 100) / 100,
        });
      }
    }

    // BGS 9 -> PSA 9 (PSA commands higher premium at same grade)
    if (card.gradingCompany === 'BGS' && gradeNum >= 9 && gradeNum < 9.5) {
      const successRate = 0.7 + seededRandom(seed, 70) * 0.1;
      const targetValue = Math.round(baseValue * (GRADE_MULTIPLIERS['PSA 9'] ?? 4) * 100) / 100;
      const expectedProfit = Math.round(
        (targetValue - currentValue) * successRate - CROSSOVER_FEE
      );

      if (expectedProfit > 0) {
        opportunities.push({
          cardId: card.id,
          player: card.player,
          cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
          currentGrader: 'BGS',
          currentGrade: card.grade!,
          targetGrader: 'PSA',
          targetGrade: '9',
          currentValue,
          targetValue,
          crossoverFee: CROSSOVER_FEE,
          successRate: Math.round(successRate * 100) / 100,
          expectedProfit,
          expectedROI: Math.round((expectedProfit / (currentValue + CROSSOVER_FEE)) * 100 * 100) / 100,
        });
      }
    }
  }

  // Sort by expected ROI descending
  return opportunities.sort((a, b) => b.expectedROI - a.expectedROI);
}

export function getCrossoverROI(
  card: CardInventory,
  _fromGrader: string,
  toGrader: string
): CrossoverROI {
  const baseValue = getCardBaseValue(card);
  const seed = getCardSeed(card);
  const gradeNum = parseFloat(card.grade ?? '0');
  const currentValue = card.currentValue ?? card.purchasePrice;

  // Determine target grade & value
  let targetGrade = '10';
  if (gradeNum < 9.5) targetGrade = String(gradeNum);
  const targetKey = `${toGrader} ${targetGrade}`;
  const targetMult = GRADE_MULTIPLIERS[targetKey] ?? 4;
  const targetValue = Math.round(baseValue * targetMult * 100) / 100;

  const successRate = 0.6 + seededRandom(seed, 80) * 0.2;
  const cost = CROSSOVER_FEE;
  const expectedValueGain = Math.round((targetValue - currentValue) * successRate * 100) / 100;
  const netROI = Math.round(((expectedValueGain - cost) / (currentValue + cost)) * 100 * 100) / 100;

  return {
    cost,
    successRate: Math.round(successRate * 100) / 100,
    expectedValueGain,
    netROI,
  };
}

export function getGradeDistribution(card: CardInventory): GradeDistribution[] {
  const seed = getCardSeed(card);

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '8.5', '9', '9.5', '10'];

  // Generate bell-curve-ish population centered around 8-9
  const rawPops = grades.map((grade, i) => {
    const gradeNum = parseFloat(grade);
    // Peak around 8, with steep dropoff at 10
    const center = 8;
    const spread = 2.5;
    const basePop = Math.exp(-Math.pow(gradeNum - center, 2) / (2 * spread * spread));
    // 10s are rarer
    const rarityFactor = gradeNum >= 10 ? 0.05 : gradeNum >= 9.5 ? 0.15 : 1;
    const variation = 0.7 + seededRandom(seed, 400 + i) * 0.6;
    return Math.max(1, Math.round(basePop * rarityFactor * variation * 5000));
  });

  const totalPop = rawPops.reduce((a, b) => a + b, 0);

  return grades.map((grade, i) => ({
    grade,
    population: rawPops[i],
    percentage: Math.round((rawPops[i] / totalPop) * 100 * 100) / 100,
  }));
}

export function getPortfolioGradeAnalysis(cards: CardInventory[]): PortfolioGradeAnalysis {
  const activeCards = cards.filter((c) => c.status !== 'sold');
  const gradedCards = activeCards.filter((c) => c.isGraded && c.grade);
  const ungradedCards = activeCards.filter((c) => !c.isGraded);

  // Average grade
  let averageGrade = 0;
  if (gradedCards.length > 0) {
    const grades = gradedCards.map((c) => {
      const g = parseFloat(c.grade!);
      return isNaN(g) ? 7 : g;
    });
    averageGrade = Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100;
  }

  // Gem rate: percentage of cards graded 9.5 or higher
  const gemCards = gradedCards.filter((c) => {
    const g = parseFloat(c.grade!);
    return !isNaN(g) && g >= 9.5;
  });
  const gemRate = gradedCards.length > 0
    ? Math.round((gemCards.length / gradedCards.length) * 100 * 100) / 100
    : 0;

  // Grade distribution
  const gradeCounts: Record<string, number> = {};
  gradedCards.forEach((c) => {
    const g = c.grade ?? 'Unknown';
    gradeCounts[g] = (gradeCounts[g] || 0) + 1;
  });
  const gradeDistribution = Object.entries(gradeCounts)
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => parseFloat(a.grade) - parseFloat(b.grade));

  // Grader distribution
  const graderCounts: Record<string, number> = {};
  gradedCards.forEach((c) => {
    const grader = c.gradingCompany ?? 'Unknown';
    graderCounts[grader] = (graderCounts[grader] || 0) + 1;
  });
  const graderDistribution = Object.entries(graderCounts)
    .map(([grader, count]) => ({ grader, count }))
    .sort((a, b) => b.count - a.count);

  // Crossover opportunities
  const crossoverOpps = findCrossoverOpportunities(activeCards);
  const upgradeValuePotential = crossoverOpps.reduce(
    (sum, opp) => sum + opp.expectedProfit,
    0
  );

  return {
    averageGrade,
    gemRate,
    totalCards: activeCards.length,
    gradedCards: gradedCards.length,
    ungradedCards: ungradedCards.length,
    gradeDistribution,
    graderDistribution,
    totalCrossoverOpportunities: crossoverOpps.length,
    upgradeValuePotential: Math.round(upgradeValuePotential * 100) / 100,
    topCrossoverOpportunities: crossoverOpps.slice(0, 5),
  };
}

// ---- Preferences ----

export interface GradePremiumPrefs {
  defaultTab?: string;
  selectedCardId?: string;
}

export function loadGradePremiumPrefs(): GradePremiumPrefs {
  return store.get<GradePremiumPrefs>(PREFS_KEY, {});
}

export function saveGradePremiumPrefs(prefs: GradePremiumPrefs): void {
  store.set(PREFS_KEY, prefs);
}
