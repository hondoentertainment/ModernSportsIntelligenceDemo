// @ts-nocheck
import { CardInventory } from '../../types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SubGradeAnalysis {
  surface: number;   // 1-10
  centering: number; // 1-10
  corners: number;   // 1-10
  edges: number;     // 1-10
}

export interface GradeValueProjection {
  grade: string;       // e.g. "PSA 10"
  probability: number; // 0-100
  expectedValue: number;
  gradingCost: number;
  netGain: number;     // expectedValue - rawValue - gradingCost
  roi: number;         // % return vs grading cost
}

export interface GradePrediction {
  cardId: string;
  predictedGrade: string;          // e.g. "PSA 9"
  gradeConfidence: number;         // 0-100
  subGrades: SubGradeAnalysis;
  distribution: GradeValueProjection[];
  gradingCost: number;             // $20-50
  expectedValueGain: number;       // weighted expected gain after grading
  recommendation: 'Grade Now' | 'Hold - Not Worth Grading' | 'Re-examine Condition';
  recommendationReason: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random seeded by string */
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

const CONDITION_BASE_MAP: Record<string, number> = {
  'Mint': 9.2,
  'Near Mint': 8.5,
  'NM': 8.5,
  'NM-MT': 8.8,
  'Excellent': 7.5,
  'EX': 7.5,
  'Very Good': 6.0,
  'VG': 6.0,
  'Good': 4.5,
  'Fair': 3.0,
  'Poor': 1.5,
};

function conditionBase(condition: string): number {
  const upper = condition.trim();
  for (const [key, val] of Object.entries(CONDITION_BASE_MAP)) {
    if (upper.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return 7.0; // default "Ungraded" / unknown
}

/** Cards from older years have more wear risk */
function agePenalty(year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age <= 3) return 0;
  if (age <= 10) return 0.3;
  if (age <= 25) return 0.6;
  if (age <= 50) return 1.0;
  return 1.5;
}

/** Premium manufacturers have better QC */
function manufacturerBonus(manufacturer: string): number {
  const m = manufacturer.toLowerCase();
  if (m.includes('topps chrome') || m.includes('panini prizm') || m.includes('bowman chrome')) return 0.3;
  if (m.includes('topps') || m.includes('panini') || m.includes('bowman')) return 0.15;
  if (m.includes('upper deck') || m.includes('fleer')) return 0.1;
  return 0;
}

const GRADING_COST_BASE = 30;
const GRADING_COST_MIN = 20;
const GRADING_COST_MAX = 50;

/* ------------------------------------------------------------------ */
/*  Value multipliers for graded vs raw                                */
/* ------------------------------------------------------------------ */

const GRADE_VALUE_MULTIPLIERS: Record<string, number> = {
  'PSA 10': 3.5,
  'PSA 9': 1.8,
  'PSA 8': 1.2,
  'PSA 7': 0.95,
  'PSA 6': 0.7,
  'PSA 5': 0.55,
  'PSA 4': 0.4,
  'PSA 3': 0.3,
  'PSA 2': 0.2,
  'PSA 1': 0.1,
};

/* ------------------------------------------------------------------ */
/*  Main prediction function                                           */
/* ------------------------------------------------------------------ */

export function predictGrade(card: CardInventory): GradePrediction {
  const rand = seededRandom(card.id + card.player + card.year);

  // --- Determine base quality score (1-10 float) ---
  let base = conditionBase(card.condition);
  base -= agePenalty(card.year);
  base += manufacturerBonus(card.manufacturer);
  if (card.isAutographed) base -= 0.2; // autos have slightly more variation
  base = Math.max(1, Math.min(10, base));

  // --- Sub-grades (1-10 integer) with slight random variance ---
  const variance = () => (rand() - 0.5) * 1.4;
  const clamp = (v: number) => Math.round(Math.max(1, Math.min(10, v)));

  const subGrades: SubGradeAnalysis = {
    surface: clamp(base + variance()),
    centering: clamp(base + variance() - 0.3),
    corners: clamp(base + variance() - 0.2),
    edges: clamp(base + variance()),
  };

  // --- Build probability distribution ---
  // The predicted numeric grade is the bottleneck of sub-grades
  const minSub = Math.min(subGrades.surface, subGrades.centering, subGrades.corners, subGrades.edges);
  const avgSub = (subGrades.surface + subGrades.centering + subGrades.corners + subGrades.edges) / 4;
  const predictedNumeric = Math.round((minSub * 0.6 + avgSub * 0.4) * 10) / 10;

  // Distribution: bell-curve-ish around predicted grade
  const rawValue = card.currentValue || card.purchasePrice || 50;

  // Grading cost: higher-value cards often use express service
  const gradingCost = Math.min(
    GRADING_COST_MAX,
    Math.max(GRADING_COST_MIN, GRADING_COST_BASE + (rawValue > 500 ? 15 : rawValue > 200 ? 10 : 0))
  );

  let totalProbability = 0;
  const grades = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

  const rawProbs: number[] = grades.map((g) => {
    const distance = Math.abs(predictedNumeric - g);
    return Math.exp(-distance * distance / 1.8);
  });

  const probSum = rawProbs.reduce((a, b) => a + b, 0);

  const distribution: GradeValueProjection[] = [];

  for (let i = 0; i < grades.length; i++) {
    const g = grades[i];
    const label = `PSA ${g}`;
    const probability = Math.round((rawProbs[i] / probSum) * 1000) / 10;
    const expectedValue = Math.round(rawValue * (GRADE_VALUE_MULTIPLIERS[label] || 0.1));
    const netGain = expectedValue - rawValue - gradingCost;
    const roi = gradingCost > 0
      ? Math.round(((expectedValue - rawValue - gradingCost) / gradingCost) * 100)
      : 0;

    distribution.push({ grade: label, probability, expectedValue, gradingCost, netGain, roi });
    totalProbability += probability;
  }

  // Normalize probabilities to 100
  const normFactor = 100 / totalProbability;
  distribution.forEach(d => { d.probability = Math.round(d.probability * normFactor * 10) / 10; });

  // Weighted expected value gain
  const weightedEV = distribution.reduce((sum, d) => sum + (d.expectedValue * d.probability / 100), 0);
  const expectedValueGain = Math.round(weightedEV - rawValue - gradingCost);

  // Predicted grade label
  const predictedGradeInt = Math.min(10, Math.max(1, Math.round(predictedNumeric)));
  const predictedGrade = `PSA ${predictedGradeInt}`;

  // Confidence: higher when sub-grades are consistent
  const subStdDev = Math.sqrt(
    [subGrades.surface, subGrades.centering, subGrades.corners, subGrades.edges]
      .reduce((sum, v) => sum + (v - avgSub) ** 2, 0) / 4
  );
  const gradeConfidence = Math.round(Math.max(40, Math.min(98, 95 - subStdDev * 15)));

  // Recommendation
  let recommendation: GradePrediction['recommendation'];
  let recommendationReason: string;

  if (expectedValueGain > 20 && predictedGradeInt >= 8) {
    recommendation = 'Grade Now';
    recommendationReason = `Expected value gain of $${expectedValueGain.toLocaleString()} with high probability of ${predictedGrade} or better. The grading cost of $${gradingCost} is well justified.`;
  } else if (expectedValueGain < -10 || predictedGradeInt < 6) {
    recommendation = 'Hold - Not Worth Grading';
    recommendationReason = `Grading cost of $${gradingCost} is unlikely to be recovered. Predicted grade of ${predictedGrade} would not significantly increase value.`;
  } else {
    recommendation = 'Re-examine Condition';
    recommendationReason = `Borderline case. Consider getting a closer look at centering and corners before submitting. Small improvements could push grade to PSA ${Math.min(10, predictedGradeInt + 1)}.`;
  }

  return {
    cardId: card.id,
    predictedGrade,
    gradeConfidence,
    subGrades,
    distribution,
    gradingCost,
    expectedValueGain,
    recommendation,
    recommendationReason,
  };
}

/* ------------------------------------------------------------------ */
/*  Portfolio-wide grading opportunity analysis                        */
/* ------------------------------------------------------------------ */

export function analysePortfolioGradingOpportunities(inventory: CardInventory[]): {
  ungradedCount: number;
  gradeNowCount: number;
  totalExpectedUplift: number;
  candidates: (GradePrediction & { card: CardInventory })[];
} {
  const ungraded = inventory.filter(c => !c.isGraded && c.status !== 'sold');
  const predictions = ungraded.map(c => ({ ...predictGrade(c), card: c }));

  const gradeNowCandidates = predictions.filter(p => p.recommendation === 'Grade Now');
  const totalExpectedUplift = gradeNowCandidates.reduce(
    (sum, p) => sum + Math.max(0, p.expectedValueGain),
    0
  );

  // Sort by expected value gain descending (best ROI first)
  const sorted = [...predictions].sort((a, b) => b.expectedValueGain - a.expectedValueGain);

  return {
    ungradedCount: ungraded.length,
    gradeNowCount: gradeNowCandidates.length,
    totalExpectedUplift: Math.round(totalExpectedUplift),
    candidates: sorted,
  };
}
