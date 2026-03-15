import { CardInventory } from '../types';

export interface GradingCandidate {
  card: CardInventory;
  estimatedGradingROI: number;     // Expected % return after grading
  expectedGrade: string;
  expectedValue: number;           // Post-grading expected value
  netGain: number;                 // Expected profit after grading fees
  priority: 'high' | 'medium' | 'low';
}

export interface SubmissionTier {
  company: string;
  tier: string;
  feePerCard: number;
  turnaround: string;
  cards: GradingCandidate[];
  totalFees: number;
  expectedTotalValue: number;
  expectedNetGain: number;
}

export interface BatchPlan {
  candidates: GradingCandidate[];
  tiers: SubmissionTier[];
  totalCards: number;
  totalFees: number;
  expectedTotalGain: number;
  bestCompany: string;
}

// Grade multipliers for raw-to-graded value conversion
const GRADE_EXPECTATIONS: Record<string, { grade: string; probability: number; multiplier: number }[]> = {
  'Mint': [
    { grade: '10', probability: 0.20, multiplier: 3.5 },
    { grade: '9', probability: 0.45, multiplier: 1.6 },
    { grade: '8', probability: 0.25, multiplier: 1.15 },
    { grade: '7', probability: 0.10, multiplier: 0.85 }
  ],
  'Near Mint': [
    { grade: '9', probability: 0.30, multiplier: 1.6 },
    { grade: '8', probability: 0.40, multiplier: 1.15 },
    { grade: '7', probability: 0.20, multiplier: 0.85 },
    { grade: '6', probability: 0.10, multiplier: 0.65 }
  ],
  'Excellent': [
    { grade: '8', probability: 0.25, multiplier: 1.15 },
    { grade: '7', probability: 0.35, multiplier: 0.85 },
    { grade: '6', probability: 0.30, multiplier: 0.65 },
    { grade: '5', probability: 0.10, multiplier: 0.50 }
  ]
};

const SERVICE_TIERS = [
  { company: 'PSA', tier: 'Economy', fee: 22, turnaround: '~45 days' },
  { company: 'PSA', tier: 'Regular', fee: 50, turnaround: '~20 days' },
  { company: 'PSA', tier: 'Express', fee: 150, turnaround: '~10 days' },
  { company: 'BGS', tier: 'Economy', fee: 25, turnaround: '~50 days' },
  { company: 'BGS', tier: 'Regular', fee: 65, turnaround: '~20 days' },
  { company: 'SGC', tier: 'Economy', fee: 18, turnaround: '~45 days' },
  { company: 'SGC', tier: 'Regular', fee: 40, turnaround: '~15 days' },
];

const SHIPPING_PER_CARD = 5; // estimated per-card shipping contribution

/**
 * Phase 27: Grading Submission Batch Planner.
 * Identifies raw cards with highest grading ROI and groups into cost-efficient submissions.
 */
export function planGradingBatch(inventory: CardInventory[]): BatchPlan {
  // Only consider raw (ungraded) active cards
  const rawCards = inventory.filter(c => !c.isGraded && c.status !== 'sold');

  // Score each card for grading potential
  const candidates: GradingCandidate[] = rawCards.map(card => {
    const rawValue = card.currentValue || card.purchasePrice;
    const condition = card.condition || 'Near Mint';
    const expectations = GRADE_EXPECTATIONS[condition] || GRADE_EXPECTATIONS['Near Mint'];

    // Expected value = probability-weighted sum of graded values
    const expectedValue = expectations.reduce(
      (sum, e) => sum + rawValue * e.multiplier * e.probability, 0
    );

    // Most likely grade
    const topGrade = expectations.reduce((best, e) =>
      e.probability > best.probability ? e : best
    );

    // Assume economy PSA fee as baseline
    const estimatedFee = 22 + SHIPPING_PER_CARD;
    const netGain = expectedValue - rawValue - estimatedFee;
    const estimatedGradingROI = rawValue > 0
      ? (netGain / (rawValue + estimatedFee)) * 100
      : 0;

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (estimatedGradingROI > 30) priority = 'high';
    else if (estimatedGradingROI > 10) priority = 'medium';

    return {
      card,
      estimatedGradingROI: Math.round(estimatedGradingROI * 10) / 10,
      expectedGrade: `PSA ${topGrade.grade}`,
      expectedValue: Math.round(expectedValue),
      netGain: Math.round(netGain),
      priority
    };
  })
    .filter(c => c.estimatedGradingROI > 0) // Only show profitable candidates
    .sort((a, b) => b.estimatedGradingROI - a.estimatedGradingROI);

  // Group candidates into optimal service tiers based on value thresholds
  const tiers: SubmissionTier[] = [];

  // High-value cards (>$200 raw value) → Regular tier for faster turnaround
  const highValue = candidates.filter(c => (c.card.currentValue || c.card.purchasePrice) >= 200);
  if (highValue.length > 0) {
    const tier = SERVICE_TIERS.find(t => t.company === 'PSA' && t.tier === 'Regular')!;
    tiers.push(buildTier(tier, highValue));
  }

  // Medium-value cards ($50-$200) → Economy tier
  const midValue = candidates.filter(c => {
    const val = c.card.currentValue || c.card.purchasePrice;
    return val >= 50 && val < 200;
  });
  if (midValue.length > 0) {
    const tier = SERVICE_TIERS.find(t => t.company === 'PSA' && t.tier === 'Economy')!;
    tiers.push(buildTier(tier, midValue));
  }

  // Low-value cards (<$50) → SGC Economy (cheapest)
  const lowValue = candidates.filter(c => (c.card.currentValue || c.card.purchasePrice) < 50);
  if (lowValue.length > 0) {
    const tier = SERVICE_TIERS.find(t => t.company === 'SGC' && t.tier === 'Economy')!;
    tiers.push(buildTier(tier, lowValue));
  }

  const totalFees = tiers.reduce((s, t) => s + t.totalFees, 0);
  const totalGain = tiers.reduce((s, t) => s + t.expectedNetGain, 0);

  // Determine best overall company
  const companyGains = new Map<string, number>();
  candidates.forEach(c => {
    SERVICE_TIERS.forEach(tier => {
      const key = tier.company;
      const gain = c.expectedValue - (c.card.currentValue || c.card.purchasePrice) - tier.fee - SHIPPING_PER_CARD;
      companyGains.set(key, (companyGains.get(key) || 0) + gain);
    });
  });

  let bestCompany = 'PSA';
  let bestGain = -Infinity;
  companyGains.forEach((gain, company) => {
    if (gain > bestGain) { bestGain = gain; bestCompany = company; }
  });

  return {
    candidates,
    tiers,
    totalCards: candidates.length,
    totalFees,
    expectedTotalGain: totalGain,
    bestCompany
  };
}

function buildTier(
  service: { company: string; tier: string; fee: number; turnaround: string },
  cards: GradingCandidate[]
): SubmissionTier {
  const totalFees = cards.length * (service.fee + SHIPPING_PER_CARD);
  const expectedTotalValue = cards.reduce((s, c) => s + c.expectedValue, 0);
  const currentValue = cards.reduce((s, c) => s + (c.card.currentValue || c.card.purchasePrice), 0);

  return {
    company: service.company,
    tier: service.tier,
    feePerCard: service.fee,
    turnaround: service.turnaround,
    cards,
    totalFees,
    expectedTotalValue,
    expectedNetGain: expectedTotalValue - currentValue - totalFees
  };
}
