// @ts-nocheck
import { store } from '../dal/syncStore';

// Phase 130: AI Card Restoration & Pressing ROI Simulator
// Pressing service comparison, grade improvement prediction, ROI calculation,
// risk assessment, and bulk pressing planning.

// ── Interfaces ──────────────────────────────────────────────────────────────────

export type CardEra = 'vintage' | 'junk_wax' | 'modern' | 'ultra_modern';
export type CardType = 'base' | 'chrome' | 'foil' | 'refractor' | 'paper' | 'acetate';
export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface PressingService {
  id: string;
  provider: string;
  turnaroundDays: number;
  costPerCard: number;
  bulkDiscount: number;           // percentage discount for 10+ cards (0-1)
  successRate: number;            // overall grade improvement rate (0-1)
  damageRate: number;             // chance of causing damage (0-1)
  specialties: CardType[];
  rating: number;                 // 1-5 stars
  reviewCount: number;
  location: string;
  acceptsWalkins: boolean;
}

export interface CardConditionAssessment {
  id: string;
  player: string;
  cardDescription: string;
  year: number;
  currentGrade: string;
  gradeNumeric: number;
  era: CardEra;
  cardType: CardType;
  estimatedValueBefore: number;
  issues: string[];
  pressingCandidate: boolean;
  candidateScore: number;          // 0-100
}

export interface PressingOutcome {
  gradeBefore: string;
  gradeNumericBefore: number;
  predictedGradeAfter: string;
  gradeNumericAfter: number;
  probability: number;            // 0-1
  valueBefore: number;
  valueAfter: number;
  valueIncrease: number;
}

export interface RestorationRisk {
  riskLevel: RiskLevel;
  riskScore: number;              // 0-100
  factors: { factor: string; severity: RiskLevel; description: string }[];
  damageProbability: number;      // 0-1
  recommendation: string;
}

export interface PressingResult {
  card: CardConditionAssessment;
  service: PressingService;
  outcomes: PressingOutcome[];
  bestOutcome: PressingOutcome;
  expectedROI: number;
  expectedROIPercent: number;
  netExpectedValue: number;
  risk: RestorationRisk;
  breakEvenProbability: number;
}

export interface ServiceComparison {
  service: PressingService;
  expectedROI: number;
  expectedROIPercent: number;
  totalCost: number;
  bestOutcomeProbability: number;
  riskLevel: RiskLevel;
}

export interface BeforeAfterCase {
  id: string;
  player: string;
  cardDescription: string;
  year: number;
  gradeBefore: string;
  gradeAfter: string;
  valueBefore: number;
  valueAfter: number;
  service: string;
  pressingCost: number;
  netProfit: number;
  dateCompleted: string;
}

export interface PressingStats {
  totalCardsAssessed: number;
  eligibleForPressing: number;
  totalPotentialGain: number;
  avgROI: number;
  avgSuccessRate: number;
  bestCandidate: CardConditionAssessment | null;
}

// ── Storage ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'msi_pressing_roi_v1';

interface StoredData {
  assessments: CardConditionAssessment[];
  services: PressingService[];
  cases: BeforeAfterCase[];
  generatedAt: number;
}

function loadData(): StoredData | null {
  try {
    const data = store.get<StoredData | null>(STORAGE_KEY, null);
    if (!data) return null;
    if (Date.now() - data.generatedAt > 4 * 3600 * 1000) return null;
    return data;
  } catch { return null; }
}

function saveData(data: StoredData): void {
  store.set(STORAGE_KEY, data);
}

// ── Deterministic seeding ───────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── Grade improvement probability matrix ────────────────────────────────────────

// Key: "fromGrade-toGrade", value: base probability
const GRADE_IMPROVEMENT_MATRIX: Record<string, number> = {
  '6-7': 0.52,
  '6-8': 0.15,
  '7-8': 0.45,
  '7-9': 0.08,
  '8-9': 0.28,
  '8-10': 0.02,
  '9-10': 0.08,
  '9-9': 0.65,   // no change
  '8-8': 0.50,
  '7-7': 0.40,
  '6-6': 0.30,
};

const GRADE_LABELS: Record<number, string> = {
  6: 'PSA 6',
  7: 'PSA 7',
  8: 'PSA 8',
  9: 'PSA 9',
  10: 'PSA 10',
};

// Value multipliers relative to PSA 8 base
const GRADE_VALUE_MULTIPLIERS: Record<number, number> = {
  6: 0.35,
  7: 0.55,
  8: 1.0,
  9: 2.2,
  10: 5.5,
};

// ── Risk assessment logic ───────────────────────────────────────────────────────

function assessRisk(card: CardConditionAssessment): RestorationRisk {
  const factors: { factor: string; severity: RiskLevel; description: string }[] = [];
  let riskScore = 0;

  // Era risk
  if (card.era === 'vintage') {
    factors.push({ factor: 'Card Age', severity: 'high', description: 'Vintage cards (pre-1980) are more fragile and prone to pressing damage' });
    riskScore += 30;
  } else if (card.era === 'junk_wax') {
    factors.push({ factor: 'Card Age', severity: 'medium', description: 'Junk wax era cards may have underlying print defects that pressing cannot fix' });
    riskScore += 15;
  } else {
    factors.push({ factor: 'Card Age', severity: 'low', description: 'Modern cards generally respond well to pressing' });
    riskScore += 5;
  }

  // Card type risk
  if (card.cardType === 'acetate') {
    factors.push({ factor: 'Material', severity: 'very_high', description: 'Acetate cards can warp or crack under pressing heat' });
    riskScore += 35;
  } else if (card.cardType === 'foil' || card.cardType === 'refractor') {
    factors.push({ factor: 'Material', severity: 'medium', description: 'Foil/refractor surfaces may show pressing marks under certain lighting' });
    riskScore += 15;
  } else if (card.cardType === 'chrome') {
    factors.push({ factor: 'Material', severity: 'low', description: 'Chrome cards press well with proper technique' });
    riskScore += 8;
  } else {
    factors.push({ factor: 'Material', severity: 'low', description: 'Standard paper/cardboard presses safely' });
    riskScore += 5;
  }

  // Grade proximity risk
  if (card.gradeNumeric >= 9) {
    factors.push({ factor: 'Grade Ceiling', severity: 'high', description: 'Already high grade - pressing may not improve and could introduce micro-damage' });
    riskScore += 25;
  } else if (card.gradeNumeric >= 8) {
    factors.push({ factor: 'Grade Ceiling', severity: 'medium', description: 'Moderate improvement potential but diminishing returns near top grades' });
    riskScore += 12;
  } else {
    factors.push({ factor: 'Grade Ceiling', severity: 'low', description: 'Good improvement headroom with pressing' });
    riskScore += 5;
  }

  // Issue-based risk
  if (card.issues.includes('crease')) {
    factors.push({ factor: 'Crease', severity: 'medium', description: 'Light creases may or may not respond to pressing' });
    riskScore += 10;
  }
  if (card.issues.includes('surface_wear')) {
    factors.push({ factor: 'Surface Wear', severity: 'high', description: 'Surface wear cannot be fixed by pressing and limits grade ceiling' });
    riskScore += 20;
  }

  riskScore = Math.min(100, riskScore);
  const damageProbability = riskScore / 400; // max ~25% damage probability
  const riskLevel: RiskLevel = riskScore >= 70 ? 'very_high' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  const recommendations: Record<RiskLevel, string> = {
    low: 'Proceed with pressing - low risk and good improvement potential',
    medium: 'Proceed with caution - select an experienced pressing service',
    high: 'Consider carefully - the risk may outweigh the potential gain',
    very_high: 'Not recommended - high risk of damage with limited upside',
  };

  return {
    riskLevel,
    riskScore,
    factors,
    damageProbability,
    recommendation: recommendations[riskLevel],
  };
}

// ── Mock data generation ────────────────────────────────────────────────────────

const CARD_ASSESSMENT_CONFIGS = [
  { player: 'Patrick Mahomes', desc: '2017 Panini Prizm Silver RC', grade: 'PSA 8', num: 8, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 1400, issues: ['light_bend'] },
  { player: 'Mike Trout', desc: '2011 Topps Update RC #US175', grade: 'PSA 8', num: 8, era: 'modern' as CardEra, type: 'paper' as CardType, baseVal: 2100, issues: ['corner_ding'] },
  { player: 'LeBron James', desc: '2003 Topps Chrome RC #111', grade: 'PSA 7', num: 7, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 5500, issues: ['light_bend', 'corner_ding'] },
  { player: 'Shohei Ohtani', desc: '2018 Topps Chrome Update RC', grade: 'PSA 9', num: 9, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 1200, issues: [] },
  { player: 'Victor Wembanyama', desc: '2023 Panini Prizm Silver RC', grade: 'PSA 9', num: 9, era: 'ultra_modern' as CardEra, type: 'chrome' as CardType, baseVal: 2800, issues: [] },
  { player: 'Mickey Mantle', desc: '1952 Topps #311', grade: 'PSA 6', num: 6, era: 'vintage' as CardEra, type: 'paper' as CardType, baseVal: 35000, issues: ['crease', 'surface_wear'] },
  { player: 'Ken Griffey Jr.', desc: '1989 Upper Deck #1 RC', grade: 'PSA 8', num: 8, era: 'junk_wax' as CardEra, type: 'paper' as CardType, baseVal: 3400, issues: ['light_bend'] },
  { player: 'Luka Doncic', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 8', num: 8, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 2200, issues: ['light_bend'] },
  { player: 'Josh Allen', desc: '2018 Panini Prizm Silver RC', grade: 'PSA 9', num: 9, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 1000, issues: [] },
  { player: 'Derek Jeter', desc: '1993 SP Foil #279 RC', grade: 'PSA 7', num: 7, era: 'modern' as CardEra, type: 'foil' as CardType, baseVal: 1800, issues: ['corner_ding', 'light_bend'] },
  { player: 'Anthony Edwards', desc: '2020 Panini Prizm Silver RC', grade: 'PSA 8', num: 8, era: 'ultra_modern' as CardEra, type: 'chrome' as CardType, baseVal: 350, issues: ['light_bend'] },
  { player: 'Juan Soto', desc: '2019 Topps Chrome RC Auto', grade: 'PSA 8', num: 8, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 600, issues: ['corner_ding'] },
  { player: 'Jayson Tatum', desc: '2017 Panini Prizm Silver RC', grade: 'PSA 7', num: 7, era: 'modern' as CardEra, type: 'chrome' as CardType, baseVal: 280, issues: ['light_bend', 'corner_ding'] },
  { player: 'Connor McDavid', desc: '2015 Upper Deck Young Guns RC', grade: 'PSA 9', num: 9, era: 'modern' as CardEra, type: 'paper' as CardType, baseVal: 1500, issues: [] },
  { player: 'Wayne Gretzky', desc: '1979 O-Pee-Chee #18 RC', grade: 'PSA 6', num: 6, era: 'vintage' as CardEra, type: 'paper' as CardType, baseVal: 18000, issues: ['crease', 'surface_wear'] },
];

const SERVICE_CONFIGS = [
  { provider: 'Cardboard Flats', cost: 18, turnaround: 10, success: 0.72, damage: 0.01, specialties: ['paper', 'chrome'] as CardType[], rating: 4.8, reviews: 2340, location: 'Dallas, TX', walkins: true },
  { provider: 'Press Pass', cost: 25, turnaround: 7, success: 0.78, damage: 0.008, specialties: ['chrome', 'refractor', 'foil'] as CardType[], rating: 4.9, reviews: 1850, location: 'Columbus, OH', walkins: false },
  { provider: 'SCC Grading Prep', cost: 15, turnaround: 21, success: 0.65, damage: 0.015, specialties: ['paper', 'chrome'] as CardType[], rating: 4.5, reviews: 890, location: 'Phoenix, AZ', walkins: true },
  { provider: 'GemRate Pressing', cost: 35, turnaround: 5, success: 0.82, damage: 0.005, specialties: ['chrome', 'refractor', 'foil', 'acetate'] as CardType[], rating: 4.9, reviews: 3200, location: 'Los Angeles, CA', walkins: false },
  { provider: 'The Card Doctor', cost: 22, turnaround: 14, success: 0.70, damage: 0.012, specialties: ['paper', 'chrome', 'foil'] as CardType[], rating: 4.6, reviews: 1100, location: 'Chicago, IL', walkins: true },
  { provider: 'SlabReady Pro', cost: 40, turnaround: 3, success: 0.85, damage: 0.004, specialties: ['chrome', 'refractor', 'paper', 'foil'] as CardType[], rating: 5.0, reviews: 4100, location: 'Miami, FL', walkins: false },
  { provider: 'Budget Press Co', cost: 12, turnaround: 30, success: 0.58, damage: 0.02, specialties: ['paper'] as CardType[], rating: 4.2, reviews: 560, location: 'Denver, CO', walkins: true },
  { provider: 'Elite Card Spa', cost: 55, turnaround: 5, success: 0.88, damage: 0.003, specialties: ['chrome', 'refractor', 'foil', 'acetate', 'paper'] as CardType[], rating: 5.0, reviews: 5200, location: 'New York, NY', walkins: false },
  { provider: 'Midwest Pressing', cost: 20, turnaround: 14, success: 0.68, damage: 0.013, specialties: ['paper', 'chrome'] as CardType[], rating: 4.4, reviews: 720, location: 'Indianapolis, IN', walkins: true },
  { provider: 'Pacific Press Works', cost: 30, turnaround: 10, success: 0.76, damage: 0.007, specialties: ['chrome', 'refractor', 'foil'] as CardType[], rating: 4.7, reviews: 1600, location: 'Seattle, WA', walkins: false },
];

function generateAssessments(seed: number): CardConditionAssessment[] {
  const rand = seededRandom(seed);
  const assessments: CardConditionAssessment[] = [];

  for (let i = 0; i < CARD_ASSESSMENT_CONFIGS.length; i++) {
    const config = CARD_ASSESSMENT_CONFIGS[i];
    const valueVariance = 0.9 + rand() * 0.2;
    const candidateScore = config.num <= 8 ? Math.round(40 + rand() * 55) : Math.round(15 + rand() * 40);

    assessments.push({
      id: `ca-${seed}-${i}`,
      player: config.player,
      cardDescription: config.desc,
      year: parseInt(config.desc.match(/\d{4}/)?.[0] || '2023'),
      currentGrade: config.grade,
      gradeNumeric: config.num,
      era: config.era,
      cardType: config.type,
      estimatedValueBefore: Math.round(config.baseVal * valueVariance),
      issues: config.issues,
      pressingCandidate: candidateScore >= 40,
      candidateScore,
    });
  }

  return assessments;
}

function generateServices(seed: number): PressingService[] {
  const rand = seededRandom(seed + 6666);

  return SERVICE_CONFIGS.map((config, i) => ({
    id: `ps-${seed}-${i}`,
    provider: config.provider,
    turnaroundDays: config.turnaround,
    costPerCard: config.cost,
    bulkDiscount: Math.round((0.05 + rand() * 0.15) * 100) / 100,
    successRate: config.success,
    damageRate: config.damage,
    specialties: config.specialties,
    rating: config.rating,
    reviewCount: config.reviews,
    location: config.location,
    acceptsWalkins: config.walkins,
  }));
}

function generateBeforeAfterCases(seed: number): BeforeAfterCase[] {
  const rand = seededRandom(seed + 9999);
  const now = Date.now();
  const cases: BeforeAfterCase[] = [];

  const caseConfigs = [
    { player: 'Patrick Mahomes', desc: '2017 Prizm Silver RC', year: 2017, before: 'PSA 8', after: 'PSA 9', valBefore: 1400, valAfter: 3100 },
    { player: 'Mike Trout', desc: '2011 Topps Update RC', year: 2011, before: 'PSA 8', after: 'PSA 9', valBefore: 2100, valAfter: 4600 },
    { player: 'LeBron James', desc: '2003 Topps Chrome RC', year: 2003, before: 'PSA 7', after: 'PSA 8', valBefore: 5500, valAfter: 10000 },
    { player: 'Shohei Ohtani', desc: '2018 Topps Chrome RC', year: 2018, before: 'PSA 9', after: 'PSA 10', valBefore: 1200, valAfter: 6600 },
    { player: 'Luka Doncic', desc: '2018 Prizm Silver RC', year: 2018, before: 'PSA 8', after: 'PSA 9', valBefore: 2200, valAfter: 4800 },
    { player: 'Ken Griffey Jr.', desc: '1989 Upper Deck #1', year: 1989, before: 'PSA 8', after: 'PSA 9', valBefore: 3400, valAfter: 7500 },
    { player: 'Derek Jeter', desc: '1993 SP Foil RC', year: 1993, before: 'PSA 7', after: 'PSA 8', valBefore: 1800, valAfter: 3300 },
    { player: 'Josh Allen', desc: '2018 Prizm Silver RC', year: 2018, before: 'PSA 8', after: 'PSA 9', valBefore: 600, valAfter: 1300 },
    { player: 'Anthony Edwards', desc: '2020 Prizm Silver RC', year: 2020, before: 'PSA 8', after: 'PSA 9', valBefore: 350, valAfter: 770 },
    { player: 'Jayson Tatum', desc: '2017 Prizm Silver RC', year: 2017, before: 'PSA 7', after: 'PSA 8', valBefore: 280, valAfter: 510 },
    { player: 'Victor Wembanyama', desc: '2023 Prizm Silver RC', year: 2023, before: 'PSA 9', after: 'PSA 10', valBefore: 2800, valAfter: 15400 },
    { player: 'Juan Soto', desc: '2019 Topps Chrome Auto', year: 2019, before: 'PSA 8', after: 'PSA 9', valBefore: 600, valAfter: 1320 },
    { player: 'Connor McDavid', desc: '2015 UD Young Guns RC', year: 2015, before: 'PSA 9', after: 'PSA 10', valBefore: 1500, valAfter: 8250 },
    { player: 'Caleb Williams', desc: '2024 Prizm RC Auto', year: 2024, before: 'PSA 8', after: 'PSA 9', valBefore: 220, valAfter: 480 },
    { player: 'Caitlin Clark', desc: '2024 Prizm Silver RC', year: 2024, before: 'PSA 8', after: 'PSA 9', valBefore: 180, valAfter: 400 },
    { player: 'LeBron James', desc: '2003 Topps Chrome RC', year: 2003, before: 'PSA 8', after: 'PSA 9', valBefore: 10000, valAfter: 22000 },
    { player: 'Patrick Mahomes', desc: '2017 Prizm Silver RC', year: 2017, before: 'PSA 7', after: 'PSA 8', valBefore: 770, valAfter: 1400 },
    { player: 'Mickey Mantle', desc: '1952 Topps #311', year: 1952, before: 'PSA 6', after: 'PSA 7', valBefore: 35000, valAfter: 55000 },
    { player: 'Mike Trout', desc: '2011 Topps Update RC', year: 2011, before: 'PSA 9', after: 'PSA 10', valBefore: 4600, valAfter: 25300 },
    { player: 'Wayne Gretzky', desc: '1979 OPC #18 RC', year: 1979, before: 'PSA 6', after: 'PSA 7', valBefore: 18000, valAfter: 28000 },
  ];

  const serviceNames = SERVICE_CONFIGS.map(s => s.provider);

  for (let i = 0; i < caseConfigs.length; i++) {
    const config = caseConfigs[i];
    const service = serviceNames[Math.floor(rand() * serviceNames.length)];
    const cost = 15 + Math.floor(rand() * 60);
    const daysAgo = 5 + Math.floor(rand() * 180);

    cases.push({
      id: `bac-${seed}-${i}`,
      player: config.player,
      cardDescription: config.desc,
      year: config.year,
      gradeBefore: config.before,
      gradeAfter: config.after,
      valueBefore: config.valBefore,
      valueAfter: config.valAfter,
      service,
      pressingCost: cost,
      netProfit: config.valAfter - config.valBefore - cost,
      dateCompleted: new Date(now - daysAgo * 86400000).toISOString(),
    });
  }

  return cases.sort((a, b) => b.netProfit - a.netProfit);
}

function ensureData(): StoredData {
  const existing = loadData();
  if (existing) return existing;

  const now = new Date();
  const seed = hashStr(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-pressing`);
  const assessments = generateAssessments(seed);
  const services = generateServices(seed);
  const cases = generateBeforeAfterCases(seed);
  const data: StoredData = { assessments, services, cases, generatedAt: Date.now() };
  saveData(data);
  return data;
}

// ── Outcome prediction ──────────────────────────────────────────────────────────

function predictOutcomesForCard(card: CardConditionAssessment, service: PressingService): PressingOutcome[] {
  const outcomes: PressingOutcome[] = [];
  const grade = card.gradeNumeric;
  const baseVal = card.estimatedValueBefore;

  // Calculate value at PSA 8 equivalent
  const psa8Value = baseVal / (GRADE_VALUE_MULTIPLIERS[grade] || 1);

  for (let targetGrade = grade; targetGrade <= 10; targetGrade++) {
    const key = `${grade}-${targetGrade}`;
    let baseProbability = GRADE_IMPROVEMENT_MATRIX[key];

    if (baseProbability === undefined) {
      // Multi-grade jumps have very low probability
      if (targetGrade - grade >= 3) baseProbability = 0.01;
      else if (targetGrade - grade === 2) baseProbability = 0.05;
      else baseProbability = 0;
    }

    if (baseProbability <= 0) continue;

    // Adjust probability based on service success rate
    const adjustedProbability = Math.min(0.95, baseProbability * (service.successRate / 0.70));
    const valueAfter = Math.round(psa8Value * (GRADE_VALUE_MULTIPLIERS[targetGrade] || 1));

    outcomes.push({
      gradeBefore: card.currentGrade,
      gradeNumericBefore: grade,
      predictedGradeAfter: GRADE_LABELS[targetGrade] || `PSA ${targetGrade}`,
      gradeNumericAfter: targetGrade,
      probability: Math.round(adjustedProbability * 1000) / 1000,
      valueBefore: baseVal,
      valueAfter,
      valueIncrease: valueAfter - baseVal,
    });
  }

  return outcomes.sort((a, b) => b.probability - a.probability);
}

// ── Public API ──────────────────────────────────────────────────────────────────

export function assessCard(cardId: string): CardConditionAssessment | null {
  const data = ensureData();
  return data.assessments.find(a => a.id === cardId) || null;
}

export function getAllAssessments(): CardConditionAssessment[] {
  return ensureData().assessments;
}

export function predictPressingOutcome(card: CardConditionAssessment, service: PressingService): PressingOutcome[] {
  return predictOutcomesForCard(card, service);
}

export function calculatePressingROI(card: CardConditionAssessment, service: PressingService): PressingResult {
  const outcomes = predictOutcomesForCard(card, service);
  const risk = assessRisk(card);

  // Calculate expected value across all outcomes
  let expectedValueIncrease = 0;
  for (const outcome of outcomes) {
    if (outcome.gradeNumericAfter > outcome.gradeNumericBefore) {
      expectedValueIncrease += outcome.valueIncrease * outcome.probability;
    }
  }

  const totalCost = service.costPerCard;
  const expectedROI = Math.round((expectedValueIncrease - totalCost) * 100) / 100;
  const expectedROIPercent = totalCost > 0 ? Math.round((expectedROI / totalCost) * 10000) / 100 : 0;

  // Find best positive outcome
  const positiveOutcomes = outcomes.filter(o => o.gradeNumericAfter > o.gradeNumericBefore);
  const bestOutcome = positiveOutcomes.length > 0
    ? positiveOutcomes.reduce((best, o) => o.valueIncrease > best.valueIncrease ? o : best, positiveOutcomes[0])
    : outcomes[0];

  // Break-even: probability that gain > cost
  const breakEvenProbability = positiveOutcomes
    .filter(o => o.valueIncrease > totalCost)
    .reduce((sum, o) => sum + o.probability, 0);

  return {
    card,
    service,
    outcomes,
    bestOutcome,
    expectedROI,
    expectedROIPercent,
    netExpectedValue: Math.round((card.estimatedValueBefore + expectedValueIncrease - totalCost) * 100) / 100,
    risk,
    breakEvenProbability: Math.round(breakEvenProbability * 1000) / 1000,
  };
}

export function getPressingServices(): PressingService[] {
  return ensureData().services;
}

export function compareServices(card: CardConditionAssessment): ServiceComparison[] {
  const services = ensureData().services;

  return services.map(service => {
    const result = calculatePressingROI(card, service);
    return {
      service,
      expectedROI: result.expectedROI,
      expectedROIPercent: result.expectedROIPercent,
      totalCost: service.costPerCard,
      bestOutcomeProbability: result.bestOutcome.probability,
      riskLevel: result.risk.riskLevel,
    };
  }).sort((a, b) => b.expectedROI - a.expectedROI);
}

export function getBeforeAfterGallery(): BeforeAfterCase[] {
  return ensureData().cases;
}

export function getRiskAssessment(card: CardConditionAssessment): RestorationRisk {
  return assessRisk(card);
}

export function getBulkPressingPlan(cardIds: string[], serviceId: string): {
  cards: CardConditionAssessment[];
  service: PressingService;
  totalCost: number;
  totalExpectedGain: number;
  netExpectedROI: number;
  avgSuccessRate: number;
  estimatedTimelineDays: number;
} {
  const data = ensureData();
  const cards = data.assessments.filter(a => cardIds.includes(a.id));
  const service = data.services.find(s => s.id === serviceId) || data.services[0];

  const bulkCostPerCard = service.costPerCard * (1 - (cards.length >= 10 ? service.bulkDiscount : 0));
  const totalCost = Math.round(bulkCostPerCard * cards.length * 100) / 100;

  let totalExpectedGain = 0;
  for (const card of cards) {
    const result = calculatePressingROI(card, service);
    totalExpectedGain += result.expectedROI + service.costPerCard; // add back cost since we recalculate
  }
  totalExpectedGain = Math.round(totalExpectedGain * 100) / 100;

  return {
    cards,
    service,
    totalCost,
    totalExpectedGain,
    netExpectedROI: Math.round((totalExpectedGain - totalCost) * 100) / 100,
    avgSuccessRate: service.successRate,
    estimatedTimelineDays: service.turnaroundDays + 7, // +7 for shipping
  };
}

export function getPressingHistory(): BeforeAfterCase[] {
  return ensureData().cases;
}

export function getGradeImprovementMatrix(): { fromGrade: number; toGrade: number; probability: number }[] {
  const entries: { fromGrade: number; toGrade: number; probability: number }[] = [];

  for (const [key, probability] of Object.entries(GRADE_IMPROVEMENT_MATRIX)) {
    const [from, to] = key.split('-').map(Number);
    if (to > from) {
      entries.push({ fromGrade: from, toGrade: to, probability });
    }
  }

  return entries.sort((a, b) => a.fromGrade - b.fromGrade || a.toGrade - b.toGrade);
}

export function getPressingStats(): PressingStats {
  const data = ensureData();
  const eligible = data.assessments.filter(a => a.pressingCandidate);
  const services = data.services;
  const bestService = services.reduce((best, s) => s.successRate > best.successRate ? s : best, services[0]);

  let totalPotentialGain = 0;
  let totalROI = 0;

  for (const card of eligible) {
    const result = calculatePressingROI(card, bestService);
    if (result.expectedROI > 0) {
      totalPotentialGain += result.expectedROI;
      totalROI += result.expectedROIPercent;
    }
  }

  const bestCandidate = eligible.length > 0
    ? eligible.reduce((best, a) => a.candidateScore > best.candidateScore ? a : best, eligible[0])
    : null;

  return {
    totalCardsAssessed: data.assessments.length,
    eligibleForPressing: eligible.length,
    totalPotentialGain: Math.round(totalPotentialGain * 100) / 100,
    avgROI: eligible.length > 0 ? Math.round(totalROI / eligible.length * 100) / 100 : 0,
    avgSuccessRate: Math.round(services.reduce((sum, s) => sum + s.successRate, 0) / services.length * 1000) / 1000,
    bestCandidate,
  };
}
