// @ts-nocheck
import { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

// ---- Types ----

export interface GradeProbability {
  grade: string;
  numericGrade: number;
  probability: number; // 0-1
  cumulativeProbability: number; // 0-1
}

export interface GradeCompanyRecommendation {
  company: 'PSA' | 'BGS' | 'SGC';
  expectedValue: number;
  fee: number;
  netGain: number;
  turnaroundDays: number;
  recommended: boolean;
  reason: string;
}

export interface SubmissionROI {
  cardId: string;
  player: string;
  cardDescription: string;
  rawValue: number;
  expectedGradedValue: number;
  gradingFee: number;
  shippingFee: number;
  totalCost: number;
  expectedProfit: number;
  expectedROI: number; // percentage
  recommendSubmit: boolean;
  bestCompany: 'PSA' | 'BGS' | 'SGC';
  predictedGrade: string;
  confidence: number; // 0-1
}

export interface BulkSubmissionBatch {
  cards: SubmissionROI[];
  totalFees: number;
  totalExpectedProfit: number;
  averageROI: number;
  batchDiscount: number; // percentage savings on bulk
  netCostAfterDiscount: number;
  recommendedCompany: 'PSA' | 'BGS' | 'SGC';
}

export interface SubmissionRecord {
  id: string;
  cardId: string;
  player: string;
  cardDescription: string;
  company: 'PSA' | 'BGS' | 'SGC';
  submittedDate: string;
  returnedDate: string;
  fee: number;
  predictedGrade: string;
  actualGrade: string;
  preSubmitValue: number;
  postGradeValue: number;
  roi: number; // percentage
  accurate: boolean; // prediction within 0.5
}

export interface SubmissionCostTracker {
  totalFeesSpent: number;
  totalCardsSubmitted: number;
  averageGradeReceived: number;
  averageFeePerCard: number;
  totalValueGained: number;
  cumulativeROI: number; // percentage
  accuracyRate: number; // percentage of predictions within 0.5 of actual
  byCompany: {
    company: string;
    count: number;
    totalFees: number;
    avgGrade: number;
    roi: number;
  }[];
}

export interface CalibrationPoint {
  predictedGrade: number;
  actualGrade: number;
  cardId: string;
  player: string;
  date: string;
}

export interface GradePredictPrefs {
  defaultTab?: string;
  selectedCardId?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// ---- Constants ----

const STORAGE_KEY_HISTORY = 'msi_grade_predict_history';
const STORAGE_KEY_PREFS = 'msi_grade_predict_prefs';
const STORAGE_KEY_QUEUE = 'msi_grade_predict_queue';

const GRADING_FEES: Record<string, number> = {
  PSA: 30,
  BGS: 35,
  SGC: 22,
};

const SHIPPING_FEE = 12;

const TURNAROUND_DAYS: Record<string, number> = {
  PSA: 45,
  BGS: 30,
  SGC: 20,
};

const GRADE_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '8.5', '9', '9.5', '10'];

const GRADE_PREMIUM_MULTIPLIERS: Record<string, Record<string, number>> = {
  PSA: {
    '1': 0.6, '2': 0.7, '3': 0.8, '4': 0.9, '5': 1.1,
    '6': 1.3, '7': 1.6, '8': 2.0, '8.5': 2.8, '9': 4.0,
    '9.5': 7.0, '10': 12.0,
  },
  BGS: {
    '1': 0.5, '2': 0.6, '3': 0.7, '4': 0.85, '5': 1.0,
    '6': 1.2, '7': 1.5, '8': 1.8, '8.5': 2.4, '9': 3.5,
    '9.5': 6.5, '10': 16.0,
  },
  SGC: {
    '1': 0.5, '2': 0.6, '3': 0.7, '4': 0.8, '5': 1.0,
    '6': 1.15, '7': 1.4, '8': 1.7, '8.5': 2.2, '9': 3.0,
    '9.5': 5.0, '10': 8.5,
  },
};

// Condition-to-expected-grade mapping weights
const CONDITION_GRADE_MAP: Record<string, number> = {
  'Gem Mint': 9.8,
  'gem mint': 9.8,
  'Mint': 9.3,
  'mint': 9.3,
  'Near Mint-Mint': 8.8,
  'NM-MT': 8.8,
  'nm-mt': 8.8,
  'Near Mint': 8.2,
  'NM': 8.2,
  'nm': 8.2,
  'Excellent-Mint': 7.5,
  'EX-MT': 7.5,
  'Excellent': 7.0,
  'EX': 7.0,
  'Very Good': 5.5,
  'VG': 5.5,
  'Good': 4.0,
  'Fair': 2.5,
  'Poor': 1.5,
};

// ---- Helpers ----

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

function getCardSeed(card: CardInventory): number {
  let hash = 0;
  const str = card.id + card.player + card.year + card.manufacturer;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getExpectedGradeCenter(card: CardInventory): number {
  // Use condition string to estimate expected grade
  const condition = card.condition || '';
  for (const [key, grade] of Object.entries(CONDITION_GRADE_MAP)) {
    if (condition.toLowerCase().includes(key.toLowerCase())) {
      return grade;
    }
  }

  // Fallback: use card age and purchase price as heuristics
  const seed = getCardSeed(card);
  const yearFactor = card.year >= 2015 ? 0.4 : card.year >= 2000 ? 0.2 : 0;
  const priceFactor = card.purchasePrice > 200 ? 0.3 : card.purchasePrice > 50 ? 0.15 : 0;
  const base = 7.5 + yearFactor + priceFactor + seededRandom(seed, 999) * 0.8;
  return Math.min(9.8, Math.max(5.0, base));
}

function getCardBaseRawValue(card: CardInventory): number {
  if (card.isGraded && card.grade && card.gradingCompany) {
    const gradeStr = card.grade;
    const company = card.gradingCompany as string;
    const mult = GRADE_PREMIUM_MULTIPLIERS[company]?.[gradeStr] ?? 2.0;
    return (card.currentValue ?? card.purchasePrice) / mult;
  }
  return card.currentValue ?? card.purchasePrice;
}

// ---- Grade Prediction Engine ----

export function predictGradeDistribution(card: CardInventory): GradeProbability[] {
  const seed = getCardSeed(card);
  const center = getExpectedGradeCenter(card);

  // Spread is narrower for newer, higher-value cards (more predictable)
  const ageFactor = card.year >= 2010 ? 1.0 : card.year >= 1990 ? 1.3 : 1.8;
  const spread = 1.2 * ageFactor;

  // Manufacturer quality factor: Topps/Panini tend to be more consistent
  const mfgBonus = ['Topps', 'Panini', 'Upper Deck'].includes(card.manufacturer) ? 0.2 : 0;
  const adjustedCenter = Math.min(10, center + mfgBonus);

  // Autographed cards tend to grade slightly lower (handling risk)
  const autoAdjust = card.isAutographed ? -0.3 : 0;
  const finalCenter = Math.max(1, adjustedCenter + autoAdjust);

  // Generate bell-curve probabilities
  const rawProbs = GRADE_VALUES.map((grade, i) => {
    const gradeNum = parseFloat(grade);
    const distance = gradeNum - finalCenter;
    const baseProbability = Math.exp(-(distance * distance) / (2 * spread * spread));

    // 10s are inherently rarer
    const rarityPenalty = gradeNum >= 10 ? 0.35 : gradeNum >= 9.5 ? 0.55 : 1.0;

    // Card-specific variation
    const variation = 0.85 + seededRandom(seed, 500 + i) * 0.3;

    return {
      grade,
      numericGrade: gradeNum,
      rawProb: baseProbability * rarityPenalty * variation,
    };
  });

  // Normalize to sum to 1
  const totalProb = rawProbs.reduce((sum, p) => sum + p.rawProb, 0);
  let cumulative = 0;

  return rawProbs.map((p) => {
    const probability = Math.round((p.rawProb / totalProb) * 1000) / 1000;
    cumulative += probability;
    return {
      grade: p.grade,
      numericGrade: p.numericGrade,
      probability,
      cumulativeProbability: Math.min(1, Math.round(cumulative * 1000) / 1000),
    };
  });
}

export function getPredictedGrade(card: CardInventory): { grade: string; confidence: number } {
  const distribution = predictGradeDistribution(card);
  let maxProb = 0;
  let bestGrade = '8';

  for (const entry of distribution) {
    if (entry.probability > maxProb) {
      maxProb = entry.probability;
      bestGrade = entry.grade;
    }
  }

  return { grade: bestGrade, confidence: Math.round(maxProb * 100) / 100 };
}

// ---- Grading Company Recommender ----

export function getCompanyRecommendations(card: CardInventory): GradeCompanyRecommendation[] {
  const rawValue = getCardBaseRawValue(card);
  const prediction = getPredictedGrade(card);
  const predictedGrade = prediction.grade;
  const seed = getCardSeed(card);

  const companies: ('PSA' | 'BGS' | 'SGC')[] = ['PSA', 'BGS', 'SGC'];

  const recommendations = companies.map((company, i) => {
    const fee = GRADING_FEES[company];
    const multiplier = GRADE_PREMIUM_MULTIPLIERS[company]?.[predictedGrade] ?? 2.0;
    const variation = 0.9 + seededRandom(seed, 600 + i) * 0.2;
    const expectedValue = Math.round(rawValue * multiplier * variation * 100) / 100;
    const netGain = Math.round((expectedValue - rawValue - fee - SHIPPING_FEE) * 100) / 100;
    const turnaroundDays = TURNAROUND_DAYS[company];

    return {
      company,
      expectedValue,
      fee,
      netGain,
      turnaroundDays,
      recommended: false,
      reason: '',
    };
  });

  // Determine the best
  const best = recommendations.reduce((a, b) => (b.netGain > a.netGain ? b : a));
  best.recommended = true;
  best.reason = 'Highest expected net gain';

  // Add reasons for non-best
  for (const rec of recommendations) {
    if (rec.recommended) continue;
    if (rec.company === 'SGC') {
      rec.reason = rec.netGain > 0
        ? 'Fastest turnaround, lower premium'
        : 'Lowest fees but lower premiums';
    } else if (rec.company === 'BGS') {
      rec.reason = parseFloat(predictedGrade) >= 9.5
        ? 'BGS 10 Black Label commands top premium'
        : 'Moderate premium, faster than PSA';
    } else {
      rec.reason = 'Highest market recognition';
    }
  }

  return recommendations;
}

// ---- Submission ROI Calculator ----

export function calculateSubmissionROI(card: CardInventory): SubmissionROI {
  const rawValue = getCardBaseRawValue(card);
  const prediction = getPredictedGrade(card);
  const recommendations = getCompanyRecommendations(card);
  const best = recommendations.find((r) => r.recommended) ?? recommendations[0];

  const gradingFee = best.fee;
  const shippingFee = SHIPPING_FEE;
  const totalCost = gradingFee + shippingFee;
  const expectedGradedValue = best.expectedValue;
  const expectedProfit = Math.round((expectedGradedValue - rawValue - totalCost) * 100) / 100;
  const expectedROI = rawValue > 0
    ? Math.round((expectedProfit / (rawValue + totalCost)) * 100 * 100) / 100
    : 0;

  return {
    cardId: card.id,
    player: card.player,
    cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
    rawValue,
    expectedGradedValue,
    gradingFee,
    shippingFee,
    totalCost,
    expectedProfit,
    expectedROI,
    recommendSubmit: expectedROI > 0,
    bestCompany: best.company,
    predictedGrade: prediction.grade,
    confidence: prediction.confidence,
  };
}

// ---- Bulk Submission Optimizer ----

export function optimizeBulkSubmission(cards: CardInventory[], maxBatchSize: number = 20): BulkSubmissionBatch {
  // Only consider ungraded active cards
  const ungradedCards = cards.filter((c) => !c.isGraded && c.status !== 'sold');

  // Calculate ROI for each
  const allROIs = ungradedCards.map((card) => calculateSubmissionROI(card));

  // Sort by expected ROI descending
  allROIs.sort((a, b) => b.expectedROI - a.expectedROI);

  // Take only profitable cards up to batch size
  const profitable = allROIs.filter((r) => r.recommendSubmit);
  const batch = profitable.slice(0, maxBatchSize);

  // Bulk discount: 5+ cards = 10%, 10+ = 15%, 20+ = 20%
  const batchDiscount = batch.length >= 20 ? 20 : batch.length >= 10 ? 15 : batch.length >= 5 ? 10 : 0;

  const totalFees = batch.reduce((sum, r) => sum + r.totalCost, 0);
  const discountedFees = Math.round(totalFees * (1 - batchDiscount / 100) * 100) / 100;
  const totalExpectedProfit = batch.reduce((sum, r) => sum + r.expectedProfit, 0)
    + (totalFees - discountedFees); // add fee savings to profit

  const averageROI = batch.length > 0
    ? Math.round((batch.reduce((sum, r) => sum + r.expectedROI, 0) / batch.length) * 100) / 100
    : 0;

  // Determine most common recommended company
  const companyCounts: Record<string, number> = {};
  batch.forEach((r) => {
    companyCounts[r.bestCompany] = (companyCounts[r.bestCompany] || 0) + 1;
  });
  const recommendedCompany = (Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'PSA') as 'PSA' | 'BGS' | 'SGC';

  return {
    cards: batch,
    totalFees: Math.round(totalFees * 100) / 100,
    totalExpectedProfit: Math.round(totalExpectedProfit * 100) / 100,
    averageROI,
    batchDiscount,
    netCostAfterDiscount: discountedFees,
    recommendedCompany,
  };
}

// ---- Submission History (simulated + persisted) ----

function generateSimulatedHistory(cards: CardInventory[]): SubmissionRecord[] {
  const gradedCards = cards.filter(
    (c) => c.isGraded && c.grade && c.gradingCompany && c.status !== 'sold'
  );

  return gradedCards.slice(0, 15).map((card, i) => {
    const seed = getCardSeed(card);
    const actualGrade = card.grade!;
    const actualNum = parseFloat(actualGrade);
    const predictedNum = actualNum + (seededRandom(seed, 700 + i) - 0.5) * 1.2;
    const clampedPredicted = Math.max(1, Math.min(10, Math.round(predictedNum * 2) / 2));
    const predictedGrade = clampedPredicted % 1 === 0
      ? String(clampedPredicted)
      : clampedPredicted.toFixed(1);

    const rawValue = getCardBaseRawValue(card);
    const company = card.gradingCompany as 'PSA' | 'BGS' | 'SGC';
    const fee = GRADING_FEES[company] ?? 30;
    const postValue = card.currentValue ?? card.purchasePrice;
    const roi = rawValue > 0
      ? Math.round(((postValue - rawValue - fee - SHIPPING_FEE) / (rawValue + fee + SHIPPING_FEE)) * 100 * 100) / 100
      : 0;

    const daysAgo = 30 + Math.floor(seededRandom(seed, 800 + i) * 300);
    const submitDate = new Date();
    submitDate.setDate(submitDate.getDate() - daysAgo);
    const returnDate = new Date(submitDate);
    returnDate.setDate(returnDate.getDate() + (TURNAROUND_DAYS[company] ?? 30));

    return {
      id: `sub_${card.id}_${i}`,
      cardId: card.id,
      player: card.player,
      cardDescription: `${card.year} ${card.manufacturer} ${card.set} #${card.cardNumber}`,
      company,
      submittedDate: submitDate.toISOString(),
      returnedDate: returnDate.toISOString(),
      fee,
      predictedGrade,
      actualGrade,
      preSubmitValue: Math.round(rawValue * 100) / 100,
      postGradeValue: Math.round(postValue * 100) / 100,
      roi,
      accurate: Math.abs(parseFloat(predictedGrade) - actualNum) <= 0.5,
    };
  });
}

export function getSubmissionHistory(cards: CardInventory[]): SubmissionRecord[] {
  const parsed = store.get<SubmissionRecord[]>(STORAGE_KEY_HISTORY, []);
  if (parsed.length > 0) return parsed;

  // Generate and persist simulated history
  const history = generateSimulatedHistory(cards);
  saveSubmissionHistory(history);
  return history;
}

export function saveSubmissionHistory(history: SubmissionRecord[]): void {
  store.set(STORAGE_KEY_HISTORY, history);
}

// ---- Submission Cost Tracker ----

export function getSubmissionCostTracker(cards: CardInventory[]): SubmissionCostTracker {
  const history = getSubmissionHistory(cards);

  if (history.length === 0) {
    return {
      totalFeesSpent: 0,
      totalCardsSubmitted: 0,
      averageGradeReceived: 0,
      averageFeePerCard: 0,
      totalValueGained: 0,
      cumulativeROI: 0,
      accuracyRate: 0,
      byCompany: [],
    };
  }

  const totalFees = history.reduce((sum, r) => sum + r.fee + SHIPPING_FEE, 0);
  const totalGrades = history.reduce((sum, r) => sum + parseFloat(r.actualGrade), 0);
  const totalValueGained = history.reduce(
    (sum, r) => sum + (r.postGradeValue - r.preSubmitValue - r.fee - SHIPPING_FEE),
    0
  );
  const totalInvested = history.reduce((sum, r) => sum + r.preSubmitValue + r.fee + SHIPPING_FEE, 0);
  const accurateCount = history.filter((r) => r.accurate).length;

  // By company breakdown
  const companyMap: Record<string, { count: number; fees: number; grades: number; valueGained: number; invested: number }> = {};
  history.forEach((r) => {
    if (!companyMap[r.company]) {
      companyMap[r.company] = { count: 0, fees: 0, grades: 0, valueGained: 0, invested: 0 };
    }
    const entry = companyMap[r.company];
    entry.count += 1;
    entry.fees += r.fee + SHIPPING_FEE;
    entry.grades += parseFloat(r.actualGrade);
    entry.valueGained += r.postGradeValue - r.preSubmitValue - r.fee - SHIPPING_FEE;
    entry.invested += r.preSubmitValue + r.fee + SHIPPING_FEE;
  });

  const byCompany = Object.entries(companyMap).map(([company, data]) => ({
    company,
    count: data.count,
    totalFees: Math.round(data.fees * 100) / 100,
    avgGrade: Math.round((data.grades / data.count) * 100) / 100,
    roi: data.invested > 0
      ? Math.round((data.valueGained / data.invested) * 100 * 100) / 100
      : 0,
  }));

  return {
    totalFeesSpent: Math.round(totalFees * 100) / 100,
    totalCardsSubmitted: history.length,
    averageGradeReceived: Math.round((totalGrades / history.length) * 100) / 100,
    averageFeePerCard: Math.round((totalFees / history.length) * 100) / 100,
    totalValueGained: Math.round(totalValueGained * 100) / 100,
    cumulativeROI: totalInvested > 0
      ? Math.round((totalValueGained / totalInvested) * 100 * 100) / 100
      : 0,
    accuracyRate: Math.round((accurateCount / history.length) * 100 * 100) / 100,
    byCompany,
  };
}

// ---- Historical Accuracy / Calibration ----

export function getCalibrationData(cards: CardInventory[]): CalibrationPoint[] {
  const history = getSubmissionHistory(cards);
  return history.map((r) => ({
    predictedGrade: parseFloat(r.predictedGrade),
    actualGrade: parseFloat(r.actualGrade),
    cardId: r.cardId,
    player: r.player,
    date: r.returnedDate,
  }));
}

// ---- Submission Queue ----

export function getSubmissionQueue(): string[] {
  return store.get<string[]>(STORAGE_KEY_QUEUE, []);
}

export function addToSubmissionQueue(cardId: string): string[] {
  const queue = getSubmissionQueue();
  if (!queue.includes(cardId)) {
    queue.push(cardId);
    store.set(STORAGE_KEY_QUEUE, queue);
  }
  return queue;
}

export function removeFromSubmissionQueue(cardId: string): string[] {
  const queue = getSubmissionQueue().filter((id) => id !== cardId);
  store.set(STORAGE_KEY_QUEUE, queue);
  return queue;
}

export function clearSubmissionQueue(): void {
  store.remove(STORAGE_KEY_QUEUE);
}

// ---- Widget Summary ----

export interface GradePredictWidgetSummary {
  topRecommendations: SubmissionROI[];
  averagePredictedROI: number;
  queueCount: number;
  totalPotentialProfit: number;
  modelAccuracy: number;
}

export function getWidgetSummary(cards: CardInventory[]): GradePredictWidgetSummary {
  const ungradedCards = cards.filter((c) => !c.isGraded && c.status !== 'sold');
  const allROIs = ungradedCards.map((card) => calculateSubmissionROI(card));
  const profitable = allROIs.filter((r) => r.recommendSubmit).sort((a, b) => b.expectedROI - a.expectedROI);

  const queue = getSubmissionQueue();
  const tracker = getSubmissionCostTracker(cards);

  const avgROI = profitable.length > 0
    ? Math.round((profitable.reduce((sum, r) => sum + r.expectedROI, 0) / profitable.length) * 100) / 100
    : 0;

  const totalProfit = profitable.reduce((sum, r) => sum + r.expectedProfit, 0);

  return {
    topRecommendations: profitable.slice(0, 3),
    averagePredictedROI: avgROI,
    queueCount: queue.length,
    totalPotentialProfit: Math.round(totalProfit * 100) / 100,
    modelAccuracy: tracker.accuracyRate,
  };
}

// ---- Preferences ----

export function loadGradePredictPrefs(): GradePredictPrefs {
  return store.get<GradePredictPrefs>(STORAGE_KEY_PREFS, {});
}

export function saveGradePredictPrefs(prefs: Partial<GradePredictPrefs>): void {
  const existing = loadGradePredictPrefs();
  store.set(STORAGE_KEY_PREFS, { ...existing, ...prefs });
}
