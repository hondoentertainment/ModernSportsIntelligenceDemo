// Phase 135: Card Condition Aging & Storage Degradation Model
// Comprehensive condition projection, storage analysis, and preservation scoring system

// ---- Types ----

export type CaseType = 'penny_sleeve' | 'top_loader' | 'one_touch' | 'slab' | 'raw';

export type UVExposure = 'none' | 'low' | 'moderate' | 'high';

export type DegradationFactor = 'yellowing' | 'corner_wear' | 'surface_scratching' | 'edge_wear' | 'wax_staining';

export type CardEra = 'pre_war' | 'vintage_50s_60s' | 'junk_wax' | 'modern' | 'ultra_modern';

export interface StorageCondition {
  temperature_f: number;
  humidity_pct: number;
  uv_exposure: UVExposure;
  case_type: CaseType;
}

export interface AgingProjection {
  years: number;
  current_grade: number;
  projected_grade: number;
  value_current: number;
  value_projected: number;
  degradation_rate: number;
}

export interface PreservationScore {
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  factors: { name: string; impact: number; status: 'optimal' | 'acceptable' | 'warning' | 'critical' }[];
}

export interface StorageRecommendation {
  id: string;
  cardId: string;
  cardName: string;
  currentSetup: string;
  recommendedSetup: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  valueSaved10yr: number;
}

export interface EnvironmentalRisk {
  id: string;
  factor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedCards: number;
  mitigation: string;
  estimatedImpact: number;
}

export interface CardAgingProfile {
  id: string;
  name: string;
  year: number;
  era: CardEra;
  currentGrade: number;
  currentValue: number;
  caseType: CaseType;
  storageEnvironment: string;
  material: string;
  degradationFactors: DegradationFactor[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastInspected: string;
}

export interface StorageSetup {
  id: string;
  name: string;
  description: string;
  condition: StorageCondition;
  monthlyCost: number;
  protectionLevel: number; // 0-100
  cardCount: number;
}

export interface InsuranceTrigger {
  id: string;
  cardId: string;
  cardName: string;
  triggerType: 'grade_drop' | 'value_threshold' | 'environmental' | 'time_based';
  description: string;
  currentValue: number;
  triggerValue: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface AgingTimeline {
  year: number;
  grade: number;
  value: number;
  keyEvent: string | null;
}

export interface StorageComparison {
  method: string;
  protectionMultiplier: number;
  costPerMonth: number;
  projectedGrade10yr: number;
  projectedValue10yr: number;
  valuePreserved: number;
}

export interface CollectionHealthReport {
  overallScore: number;
  totalCards: number;
  cardsAtRisk: number;
  projectedLoss10yr: number;
  optimalStoragePct: number;
  recommendations: number;
  insuranceTriggers: number;
}

// ---- Constants ----

const STORAGE_KEY = 'msi_condition_aging';

const CASE_PROTECTION: Record<CaseType, number> = {
  slab: 0.95,
  one_touch: 0.85,
  top_loader: 0.70,
  penny_sleeve: 0.50,
  raw: 0.30,
};

const UV_DAMAGE_MULTIPLIER: Record<UVExposure, number> = {
  none: 1.0,
  low: 1.15,
  moderate: 1.45,
  high: 2.0,
};

const ERA_BASE_DEGRADATION: Record<CardEra, number> = {
  pre_war: 0.08,
  vintage_50s_60s: 0.06,
  junk_wax: 0.04,
  modern: 0.03,
  ultra_modern: 0.025,
};

const ERA_LABELS: Record<CardEra, string> = {
  pre_war: 'Pre-War (pre-1945)',
  vintage_50s_60s: 'Vintage (1950s-1960s)',
  junk_wax: 'Junk Wax (1986-1993)',
  modern: 'Modern (1994-2015)',
  ultra_modern: 'Ultra-Modern (2016+)',
};

const CASE_LABELS: Record<CaseType, string> = {
  penny_sleeve: 'Penny Sleeve',
  top_loader: 'Top Loader',
  one_touch: 'One-Touch Magnetic',
  slab: 'Professional Slab (PSA/BGS)',
  raw: 'Raw / No Protection',
};

const DEGRADATION_LABELS: Record<DegradationFactor, string> = {
  yellowing: 'Surface Yellowing',
  corner_wear: 'Corner Wear',
  surface_scratching: 'Surface Scratching',
  edge_wear: 'Edge Wear',
  wax_staining: 'Wax Staining',
};

// ---- localStorage helpers ----

function loadData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

// ---- Mock Card Aging Profiles ----

const CARD_AGING_PROFILES: CardAgingProfile[] = [
  {
    id: 'ca_001', name: '1933 Goudey Babe Ruth #53', year: 1933, era: 'pre_war',
    currentGrade: 4.0, currentValue: 185000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Cardboard / Gum card stock', degradationFactors: ['yellowing', 'corner_wear', 'edge_wear'],
    riskLevel: 'low', lastInspected: '2025-12-01',
  },
  {
    id: 'ca_002', name: '1952 Topps Mickey Mantle #311', year: 1952, era: 'vintage_50s_60s',
    currentGrade: 5.5, currentValue: 245000, caseType: 'slab', storageEnvironment: 'safe_deposit',
    material: 'Thick cardboard stock', degradationFactors: ['yellowing', 'corner_wear'],
    riskLevel: 'low', lastInspected: '2025-11-15',
  },
  {
    id: 'ca_003', name: '1955 Topps Roberto Clemente RC #164', year: 1955, era: 'vintage_50s_60s',
    currentGrade: 6.0, currentValue: 78000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Standard Topps cardboard', degradationFactors: ['yellowing', 'edge_wear'],
    riskLevel: 'low', lastInspected: '2025-10-20',
  },
  {
    id: 'ca_004', name: '1969 Topps Reggie Jackson RC #260', year: 1969, era: 'vintage_50s_60s',
    currentGrade: 7.0, currentValue: 12500, caseType: 'one_touch', storageEnvironment: 'display_case',
    material: 'Standard Topps cardboard', degradationFactors: ['yellowing', 'surface_scratching'],
    riskLevel: 'medium', lastInspected: '2025-09-10',
  },
  {
    id: 'ca_005', name: '1986 Fleer Michael Jordan RC #57', year: 1986, era: 'junk_wax',
    currentGrade: 8.5, currentValue: 32000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Thin junk wax cardboard', degradationFactors: ['yellowing', 'wax_staining'],
    riskLevel: 'low', lastInspected: '2026-01-05',
  },
  {
    id: 'ca_006', name: '1987 Topps Barry Bonds RC #320', year: 1987, era: 'junk_wax',
    currentGrade: 9.0, currentValue: 85, caseType: 'penny_sleeve', storageEnvironment: 'closet',
    material: 'Thin junk wax cardboard', degradationFactors: ['yellowing', 'corner_wear', 'wax_staining'],
    riskLevel: 'medium', lastInspected: '2024-06-01',
  },
  {
    id: 'ca_007', name: '1989 Upper Deck Ken Griffey Jr RC #1', year: 1989, era: 'junk_wax',
    currentGrade: 9.5, currentValue: 4200, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'UV-coated stock', degradationFactors: ['surface_scratching'],
    riskLevel: 'low', lastInspected: '2026-02-01',
  },
  {
    id: 'ca_008', name: '1993 SP Foil Derek Jeter RC #279', year: 1993, era: 'junk_wax',
    currentGrade: 8.0, currentValue: 18500, caseType: 'one_touch', storageEnvironment: 'closet',
    material: 'Foil / premium stock', degradationFactors: ['surface_scratching', 'edge_wear'],
    riskLevel: 'medium', lastInspected: '2025-08-15',
  },
  {
    id: 'ca_009', name: '2001 Bowman Chrome Albert Pujols Auto', year: 2001, era: 'modern',
    currentGrade: 9.0, currentValue: 28000, caseType: 'slab', storageEnvironment: 'safe_deposit',
    material: 'Chrome coated stock', degradationFactors: ['yellowing'],
    riskLevel: 'low', lastInspected: '2025-12-20',
  },
  {
    id: 'ca_010', name: '2009 Bowman Chrome Mike Trout Auto RC', year: 2009, era: 'modern',
    currentGrade: 9.5, currentValue: 165000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Chrome coated stock', degradationFactors: [],
    riskLevel: 'low', lastInspected: '2026-02-15',
  },
  {
    id: 'ca_011', name: '2011 Topps Update Mike Trout RC #US175', year: 2011, era: 'modern',
    currentGrade: 10.0, currentValue: 320000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Standard Topps modern stock', degradationFactors: [],
    riskLevel: 'low', lastInspected: '2026-03-01',
  },
  {
    id: 'ca_012', name: '2018 Topps Chrome Shohei Ohtani RC Auto', year: 2018, era: 'ultra_modern',
    currentGrade: 9.5, currentValue: 42000, caseType: 'slab', storageEnvironment: 'climate_vault',
    material: 'Chrome coated stock', degradationFactors: [],
    riskLevel: 'low', lastInspected: '2026-01-10',
  },
  {
    id: 'ca_013', name: '2022 Bowman Chrome Elly De La Cruz 1st Auto', year: 2022, era: 'ultra_modern',
    currentGrade: 9.5, currentValue: 3800, caseType: 'one_touch', storageEnvironment: 'closet',
    material: 'Chrome coated stock', degradationFactors: ['surface_scratching'],
    riskLevel: 'medium', lastInspected: '2025-11-01',
  },
  {
    id: 'ca_014', name: '2023 Bowman 1st Chrome Jackson Holliday Auto', year: 2023, era: 'ultra_modern',
    currentGrade: 10.0, currentValue: 2200, caseType: 'top_loader', storageEnvironment: 'closet',
    material: 'Chrome coated stock', degradationFactors: ['corner_wear'],
    riskLevel: 'medium', lastInspected: '2025-07-20',
  },
  {
    id: 'ca_015', name: '2024 Topps Chrome Paul Skenes RC Auto /25', year: 2024, era: 'ultra_modern',
    currentGrade: 9.5, currentValue: 5600, caseType: 'one_touch', storageEnvironment: 'display_case',
    material: 'Chrome coated stock', degradationFactors: ['surface_scratching'],
    riskLevel: 'medium', lastInspected: '2026-02-28',
  },
  {
    id: 'ca_016', name: '1971 Topps Nolan Ryan #513', year: 1971, era: 'vintage_50s_60s',
    currentGrade: 6.5, currentValue: 8500, caseType: 'top_loader', storageEnvironment: 'garage',
    material: 'Standard Topps cardboard', degradationFactors: ['yellowing', 'corner_wear', 'edge_wear'],
    riskLevel: 'high', lastInspected: '2024-03-01',
  },
  {
    id: 'ca_017', name: '1975 Topps George Brett RC #228', year: 1975, era: 'vintage_50s_60s',
    currentGrade: 7.0, currentValue: 4200, caseType: 'penny_sleeve', storageEnvironment: 'basement',
    material: 'Standard Topps cardboard', degradationFactors: ['yellowing', 'corner_wear', 'edge_wear', 'wax_staining'],
    riskLevel: 'critical', lastInspected: '2023-12-15',
  },
  {
    id: 'ca_018', name: '1990 Leaf Frank Thomas RC #300', year: 1990, era: 'junk_wax',
    currentGrade: 9.0, currentValue: 450, caseType: 'raw', storageEnvironment: 'garage',
    material: 'Standard Leaf stock', degradationFactors: ['yellowing', 'corner_wear', 'surface_scratching', 'edge_wear'],
    riskLevel: 'critical', lastInspected: '2024-01-01',
  },
  {
    id: 'ca_019', name: '2024 Bowman 1st Chrome Jac Caglianone Auto', year: 2024, era: 'ultra_modern',
    currentGrade: 9.5, currentValue: 480, caseType: 'penny_sleeve', storageEnvironment: 'closet',
    material: 'Chrome coated stock', degradationFactors: ['corner_wear', 'surface_scratching'],
    riskLevel: 'high', lastInspected: '2025-10-15',
  },
  {
    id: 'ca_020', name: '2024 National Treasures Caleb Williams RPA /99', year: 2024, era: 'ultra_modern',
    currentGrade: 9.0, currentValue: 12000, caseType: 'top_loader', storageEnvironment: 'closet',
    material: 'Thick premium patch card', degradationFactors: ['corner_wear', 'edge_wear'],
    riskLevel: 'high', lastInspected: '2026-01-20',
  },
];

// ---- Storage Environments ----

const STORAGE_ENVIRONMENTS: StorageSetup[] = [
  {
    id: 'env_001', name: 'Climate Controlled Vault',
    description: 'Professional-grade vault with 68F temp, 45% humidity, zero UV, HEPA filtration',
    condition: { temperature_f: 68, humidity_pct: 45, uv_exposure: 'none', case_type: 'slab' },
    monthlyCost: 125, protectionLevel: 98, cardCount: 8,
  },
  {
    id: 'env_002', name: 'Bedroom Closet',
    description: 'Interior closet with stable temperature, low light, moderate humidity control',
    condition: { temperature_f: 72, humidity_pct: 55, uv_exposure: 'low', case_type: 'top_loader' },
    monthlyCost: 0, protectionLevel: 62, cardCount: 6,
  },
  {
    id: 'env_003', name: 'Garage Storage',
    description: 'Uninsulated garage with temperature swings, variable humidity, some light exposure',
    condition: { temperature_f: 82, humidity_pct: 68, uv_exposure: 'moderate', case_type: 'penny_sleeve' },
    monthlyCost: 0, protectionLevel: 22, cardCount: 2,
  },
  {
    id: 'env_004', name: 'Display Case',
    description: 'Glass display case in living room with ambient lighting and room temperature',
    condition: { temperature_f: 73, humidity_pct: 50, uv_exposure: 'moderate', case_type: 'one_touch' },
    monthlyCost: 5, protectionLevel: 55, cardCount: 2,
  },
  {
    id: 'env_005', name: 'Safe Deposit Box',
    description: 'Bank vault with controlled environment, zero UV, very stable conditions',
    condition: { temperature_f: 70, humidity_pct: 40, uv_exposure: 'none', case_type: 'slab' },
    monthlyCost: 45, protectionLevel: 95, cardCount: 2,
  },
  {
    id: 'env_006', name: 'Basement Storage',
    description: 'Below-grade storage, high humidity risk, temperature swings, potential water damage',
    condition: { temperature_f: 65, humidity_pct: 75, uv_exposure: 'none', case_type: 'penny_sleeve' },
    monthlyCost: 0, protectionLevel: 18, cardCount: 1,
  },
];

// ---- Degradation Curve Data by Era ----

const _ERA_DEGRADATION_CURVES: Record<CardEra, { years: number; gradeDropOptimal: number; gradeDropPoor: number }[]> = {
  pre_war: [
    { years: 5, gradeDropOptimal: 0.1, gradeDropPoor: 0.8 },
    { years: 10, gradeDropOptimal: 0.2, gradeDropPoor: 1.5 },
    { years: 20, gradeDropOptimal: 0.4, gradeDropPoor: 2.8 },
    { years: 50, gradeDropOptimal: 0.8, gradeDropPoor: 4.5 },
  ],
  vintage_50s_60s: [
    { years: 5, gradeDropOptimal: 0.05, gradeDropPoor: 0.6 },
    { years: 10, gradeDropOptimal: 0.15, gradeDropPoor: 1.2 },
    { years: 20, gradeDropOptimal: 0.3, gradeDropPoor: 2.5 },
    { years: 50, gradeDropOptimal: 0.7, gradeDropPoor: 4.0 },
  ],
  junk_wax: [
    { years: 5, gradeDropOptimal: 0.03, gradeDropPoor: 0.5 },
    { years: 10, gradeDropOptimal: 0.1, gradeDropPoor: 1.0 },
    { years: 20, gradeDropOptimal: 0.2, gradeDropPoor: 2.0 },
    { years: 50, gradeDropOptimal: 0.5, gradeDropPoor: 3.5 },
  ],
  modern: [
    { years: 5, gradeDropOptimal: 0.02, gradeDropPoor: 0.4 },
    { years: 10, gradeDropOptimal: 0.05, gradeDropPoor: 0.8 },
    { years: 20, gradeDropOptimal: 0.15, gradeDropPoor: 1.6 },
    { years: 50, gradeDropOptimal: 0.35, gradeDropPoor: 3.0 },
  ],
  ultra_modern: [
    { years: 5, gradeDropOptimal: 0.01, gradeDropPoor: 0.35 },
    { years: 10, gradeDropOptimal: 0.03, gradeDropPoor: 0.7 },
    { years: 20, gradeDropOptimal: 0.1, gradeDropPoor: 1.4 },
    { years: 50, gradeDropOptimal: 0.25, gradeDropPoor: 2.5 },
  ],
};

// ---- Internal Helpers ----

function getEnvironmentByName(name: string): StorageSetup | undefined {
  return STORAGE_ENVIRONMENTS.find(e =>
    e.name.toLowerCase().replace(/\s+/g, '_').includes(name.toLowerCase().replace(/\s+/g, '_')) ||
    name.toLowerCase().includes(e.name.toLowerCase().split(' ')[0].toLowerCase())
  );
}

function calculateDegradationMultiplier(condition: StorageCondition): number {
  let multiplier = 1.0;

  // Temperature factor: optimal is 65-70F
  if (condition.temperature_f > 75) multiplier *= 1 + (condition.temperature_f - 75) * 0.03;
  if (condition.temperature_f > 85) multiplier *= 1.2;
  if (condition.temperature_f < 55) multiplier *= 1.1;

  // Humidity factor: optimal is 40-50%
  if (condition.humidity_pct > 60) multiplier *= 1 + (condition.humidity_pct - 60) * 0.025;
  if (condition.humidity_pct > 75) multiplier *= 1.3;
  if (condition.humidity_pct < 30) multiplier *= 1.05;

  // UV factor
  multiplier *= UV_DAMAGE_MULTIPLIER[condition.uv_exposure];

  // Case protection (inverted: higher protection = lower degradation)
  const caseProtection = CASE_PROTECTION[condition.case_type];
  multiplier *= (1 - caseProtection * 0.6);

  return Math.max(0.15, multiplier);
}

function gradeToValueMultiplier(grade: number, baseValue: number, era: CardEra): number {
  // Value drops exponentially with grade loss for high-value cards
  const gradeRatio = grade / 10;
  const eraFactor = era === 'pre_war' || era === 'vintage_50s_60s' ? 0.7 : 0.85;
  return Math.pow(gradeRatio, 2 + (1 - eraFactor));
}

// ---- Public API ----

export function getEraLabel(era: CardEra): string {
  return ERA_LABELS[era];
}

export function getCaseLabel(caseType: CaseType): string {
  return CASE_LABELS[caseType];
}

export function getDegradationLabel(factor: DegradationFactor): string {
  return DEGRADATION_LABELS[factor];
}

export function getCaseProtection(caseType: CaseType): number {
  return CASE_PROTECTION[caseType];
}

export function getAllCards(): CardAgingProfile[] {
  return CARD_AGING_PROFILES;
}

export function getStorageEnvironments(): StorageSetup[] {
  return STORAGE_ENVIRONMENTS;
}

export function projectAging(card: CardAgingProfile, storage: StorageCondition, years: number): AgingProjection {
  const cached = loadData<AgingProjection>(`aging_${card.id}_${years}`);
  if (cached) return cached;

  const baseDegradation = ERA_BASE_DEGRADATION[card.era];
  const envMultiplier = calculateDegradationMultiplier(storage);
  const annualDegradation = baseDegradation * envMultiplier;
  const totalDegradation = annualDegradation * years;

  const projectedGrade = Math.max(1.0, Math.round((card.currentGrade - totalDegradation) * 10) / 10);
  const currentValueMult = gradeToValueMultiplier(card.currentGrade, card.currentValue, card.era);
  const projectedValueMult = gradeToValueMultiplier(projectedGrade, card.currentValue, card.era);
  const valueRatio = projectedValueMult / currentValueMult;
  const projectedValue = Math.round(card.currentValue * valueRatio);

  const result: AgingProjection = {
    years,
    current_grade: card.currentGrade,
    projected_grade: projectedGrade,
    value_current: card.currentValue,
    value_projected: projectedValue,
    degradation_rate: Math.round(annualDegradation * 1000) / 1000,
  };

  saveData(`aging_${card.id}_${years}`, result);
  return result;
}

export function getPreservationScore(storageSetup: StorageSetup): PreservationScore {
  const { condition } = storageSetup;
  let score = 100;
  const factors: PreservationScore['factors'] = [];

  // Temperature assessment
  const tempDelta = Math.abs(condition.temperature_f - 68);
  const tempImpact = Math.min(30, tempDelta * 2);
  score -= tempImpact;
  factors.push({
    name: 'Temperature',
    impact: tempImpact,
    status: tempDelta <= 3 ? 'optimal' : tempDelta <= 8 ? 'acceptable' : tempDelta <= 15 ? 'warning' : 'critical',
  });

  // Humidity assessment
  const humDelta = Math.abs(condition.humidity_pct - 45);
  const humImpact = Math.min(25, humDelta * 1.5);
  score -= humImpact;
  factors.push({
    name: 'Humidity',
    impact: humImpact,
    status: humDelta <= 5 ? 'optimal' : humDelta <= 12 ? 'acceptable' : humDelta <= 25 ? 'warning' : 'critical',
  });

  // UV assessment
  const uvImpact = condition.uv_exposure === 'none' ? 0 : condition.uv_exposure === 'low' ? 8 : condition.uv_exposure === 'moderate' ? 18 : 30;
  score -= uvImpact;
  factors.push({
    name: 'UV Exposure',
    impact: uvImpact,
    status: condition.uv_exposure === 'none' ? 'optimal' : condition.uv_exposure === 'low' ? 'acceptable' : condition.uv_exposure === 'moderate' ? 'warning' : 'critical',
  });

  // Case protection
  const caseScore = CASE_PROTECTION[condition.case_type] * 100;
  const caseImpact = Math.round((100 - caseScore) * 0.15);
  score -= caseImpact;
  factors.push({
    name: 'Case Protection',
    impact: caseImpact,
    status: caseScore >= 90 ? 'optimal' : caseScore >= 70 ? 'acceptable' : caseScore >= 50 ? 'warning' : 'critical',
  });

  score = Math.max(0, Math.round(score));
  const grade: PreservationScore['grade'] =
    score >= 95 ? 'A+' : score >= 85 ? 'A' : score >= 75 ? 'B+' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

  return { score, grade, factors };
}

export function getStorageRecommendations(collection?: CardAgingProfile[]): StorageRecommendation[] {
  const cards = collection ?? CARD_AGING_PROFILES;
  const recs: StorageRecommendation[] = [];

  cards.forEach(card => {
    if (card.riskLevel === 'critical' || card.riskLevel === 'high') {
      const bestCase: CaseType = card.currentValue > 5000 ? 'slab' : card.currentValue > 500 ? 'one_touch' : 'top_loader';
      if (CASE_PROTECTION[card.caseType] < CASE_PROTECTION[bestCase]) {
        const env = getEnvironmentByName(card.storageEnvironment);
        const valueLoss = card.currentValue * 0.15;
        recs.push({
          id: `rec_${card.id}`,
          cardId: card.id,
          cardName: card.name,
          currentSetup: `${CASE_LABELS[card.caseType]} in ${env?.name ?? card.storageEnvironment}`,
          recommendedSetup: `${CASE_LABELS[bestCase]} in Climate Controlled Vault`,
          reason: `Card valued at $${card.currentValue.toLocaleString()} is at ${card.riskLevel} risk. Current protection level is insufficient for this asset class.`,
          urgency: card.riskLevel as 'high' | 'critical',
          estimatedCost: bestCase === 'slab' ? 35 : bestCase === 'one_touch' ? 8 : 2,
          valueSaved10yr: Math.round(valueLoss),
        });
      }
    }

    // UV warning for display case cards
    if (card.storageEnvironment === 'display_case' && card.currentValue > 1000) {
      recs.push({
        id: `rec_uv_${card.id}`,
        cardId: card.id,
        cardName: card.name,
        currentSetup: `Display Case with moderate UV`,
        recommendedSetup: `UV-filtered display case or vault storage`,
        reason: `Chrome and foil cards yellow significantly under UV exposure. Projected 5-year damage for this card is notable.`,
        urgency: 'medium',
        estimatedCost: 45,
        valueSaved10yr: Math.round(card.currentValue * 0.08),
      });
    }
  });

  return recs.sort((a, b) => {
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function getDegradationFactors(card: CardAgingProfile): { factor: DegradationFactor; label: string; severity: number; description: string }[] {
  return card.degradationFactors.map(f => {
    let severity: number;
    let description: string;
    switch (f) {
      case 'yellowing':
        severity = card.era === 'pre_war' || card.era === 'vintage_50s_60s' ? 75 : card.era === 'junk_wax' ? 60 : 30;
        description = 'Paper and coating breakdown causes discoloration over time, accelerated by UV and heat';
        break;
      case 'corner_wear':
        severity = card.caseType === 'raw' ? 85 : card.caseType === 'penny_sleeve' ? 65 : 25;
        description = 'Physical impact and gravity cause corner rounding and fraying, especially without rigid protection';
        break;
      case 'surface_scratching':
        severity = card.caseType === 'raw' ? 80 : card.caseType === 'penny_sleeve' ? 55 : 20;
        description = 'Contact with other surfaces creates micro-scratches visible under bright light';
        break;
      case 'edge_wear':
        severity = card.caseType === 'raw' ? 70 : card.caseType === 'penny_sleeve' ? 50 : 15;
        description = 'Edge chipping and whitening from friction and handling over time';
        break;
      case 'wax_staining':
        severity = card.era === 'junk_wax' ? 55 : card.era === 'vintage_50s_60s' ? 45 : 15;
        description = 'Residual wax from original packaging permanently bonds to card surface';
        break;
    }
    return { factor: f, label: DEGRADATION_LABELS[f], severity, description };
  });
}

export function getEnvironmentalRisks(setup?: StorageSetup[]): EnvironmentalRisk[] {
  const environments = setup ?? STORAGE_ENVIRONMENTS;
  const risks: EnvironmentalRisk[] = [];

  environments.forEach(env => {
    if (env.condition.humidity_pct > 65) {
      risks.push({
        id: `risk_hum_${env.id}`,
        factor: 'High Humidity',
        severity: env.condition.humidity_pct > 75 ? 'critical' : 'high',
        description: `${env.name} has ${env.condition.humidity_pct}% humidity. Optimal range is 40-50%. High humidity accelerates yellowing, promotes mold, and weakens cardboard fibers.`,
        affectedCards: env.cardCount,
        mitigation: 'Add silica gel desiccant packs, install dehumidifier, or relocate cards to controlled environment',
        estimatedImpact: env.cardCount * 500,
      });
    }

    if (env.condition.temperature_f > 78) {
      risks.push({
        id: `risk_temp_${env.id}`,
        factor: 'Excessive Temperature',
        severity: env.condition.temperature_f > 85 ? 'critical' : 'high',
        description: `${env.name} averages ${env.condition.temperature_f}F. Optimal is 65-70F. Heat accelerates chemical breakdown and warping.`,
        affectedCards: env.cardCount,
        mitigation: 'Move cards to air-conditioned space or climate-controlled vault storage',
        estimatedImpact: env.cardCount * 350,
      });
    }

    if (env.condition.uv_exposure === 'moderate' || env.condition.uv_exposure === 'high') {
      risks.push({
        id: `risk_uv_${env.id}`,
        factor: 'UV Light Damage',
        severity: env.condition.uv_exposure === 'high' ? 'critical' : 'high',
        description: `${env.name} has ${env.condition.uv_exposure} UV exposure. UV light causes irreversible fading and yellowing, especially on chrome and foil surfaces.`,
        affectedCards: env.cardCount,
        mitigation: 'Install UV-filtering glass, use museum-grade frames, or store in opaque containers',
        estimatedImpact: env.cardCount * 600,
      });
    }
  });

  return risks.sort((a, b) => {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}

export function getAgingTimeline(card: CardAgingProfile, storage: StorageCondition): AgingTimeline[] {
  const timeline: AgingTimeline[] = [];
  const baseDegradation = ERA_BASE_DEGRADATION[card.era];
  const envMultiplier = calculateDegradationMultiplier(storage);
  const annualDeg = baseDegradation * envMultiplier;

  const yearPoints = [0, 1, 2, 3, 5, 10, 15, 20, 30, 50];
  yearPoints.forEach(yr => {
    const gradeDrop = annualDeg * yr;
    const grade = Math.max(1.0, Math.round((card.currentGrade - gradeDrop) * 10) / 10);
    const currentMult = gradeToValueMultiplier(card.currentGrade, card.currentValue, card.era);
    const projMult = gradeToValueMultiplier(grade, card.currentValue, card.era);
    const value = Math.round(card.currentValue * (projMult / currentMult));

    let keyEvent: string | null = null;
    if (yr === 0) keyEvent = 'Current condition';
    else if (grade <= card.currentGrade - 0.5 && grade > card.currentGrade - 0.6) keyEvent = 'Half-grade loss threshold';
    else if (grade <= card.currentGrade - 1.0 && grade > card.currentGrade - 1.1) keyEvent = 'Full grade loss - significant value impact';
    else if (yr === 50) keyEvent = 'Long-term projection endpoint';

    timeline.push({ year: yr, grade, value, keyEvent });
  });

  return timeline;
}

export function compareStorageMethods(card: CardAgingProfile): StorageComparison[] {
  const methods: { name: string; condition: StorageCondition; cost: number }[] = [
    { name: 'Climate Vault + Slab', condition: { temperature_f: 68, humidity_pct: 45, uv_exposure: 'none', case_type: 'slab' }, cost: 125 },
    { name: 'Safe Deposit + Slab', condition: { temperature_f: 70, humidity_pct: 40, uv_exposure: 'none', case_type: 'slab' }, cost: 45 },
    { name: 'Closet + One-Touch', condition: { temperature_f: 72, humidity_pct: 55, uv_exposure: 'low', case_type: 'one_touch' }, cost: 0 },
    { name: 'Closet + Top Loader', condition: { temperature_f: 72, humidity_pct: 55, uv_exposure: 'low', case_type: 'top_loader' }, cost: 0 },
    { name: 'Display Case + One-Touch', condition: { temperature_f: 73, humidity_pct: 50, uv_exposure: 'moderate', case_type: 'one_touch' }, cost: 5 },
    { name: 'Garage + Penny Sleeve', condition: { temperature_f: 82, humidity_pct: 68, uv_exposure: 'moderate', case_type: 'penny_sleeve' }, cost: 0 },
    { name: 'Basement + Raw', condition: { temperature_f: 65, humidity_pct: 75, uv_exposure: 'none', case_type: 'raw' }, cost: 0 },
  ];

  return methods.map(m => {
    const proj = projectAging(card, m.condition, 10);
    return {
      method: m.name,
      protectionMultiplier: Math.round(CASE_PROTECTION[m.condition.case_type] * 100),
      costPerMonth: m.cost,
      projectedGrade10yr: proj.projected_grade,
      projectedValue10yr: proj.value_projected,
      valuePreserved: Math.round((proj.value_projected / card.currentValue) * 100),
    };
  }).sort((a, b) => b.valuePreserved - a.valuePreserved);
}

export function getInsuranceTriggers(collection?: CardAgingProfile[]): InsuranceTrigger[] {
  const cards = collection ?? CARD_AGING_PROFILES;
  const triggers: InsuranceTrigger[] = [];

  cards.forEach(card => {
    // Grade drop triggers for high-value cards
    if (card.currentValue > 10000 && card.riskLevel !== 'low') {
      const env = getEnvironmentByName(card.storageEnvironment);
      const condition = env?.condition ?? STORAGE_ENVIRONMENTS[1].condition;
      const proj5yr = projectAging(card, condition, 5);
      if (proj5yr.projected_grade < card.currentGrade - 0.5) {
        triggers.push({
          id: `ins_grade_${card.id}`,
          cardId: card.id,
          cardName: card.name,
          triggerType: 'grade_drop',
          description: `Projected to lose ${(card.currentGrade - proj5yr.projected_grade).toFixed(1)} grades in 5 years under current storage`,
          currentValue: card.currentValue,
          triggerValue: proj5yr.value_projected,
          urgency: card.currentGrade - proj5yr.projected_grade >= 1.0 ? 'critical' : 'high',
          recommendation: 'Upgrade storage immediately or insure at current value',
        });
      }
    }

    // Value threshold triggers
    if (card.currentValue > 50000) {
      triggers.push({
        id: `ins_val_${card.id}`,
        cardId: card.id,
        cardName: card.name,
        triggerType: 'value_threshold',
        description: `High-value asset exceeds $50K threshold. Ensure insurance coverage matches current market value.`,
        currentValue: card.currentValue,
        triggerValue: 50000,
        urgency: card.currentValue > 200000 ? 'critical' : 'high',
        recommendation: 'Review insurance policy annually and after significant market moves',
      });
    }

    // Environmental triggers
    if (card.storageEnvironment === 'garage' || card.storageEnvironment === 'basement') {
      triggers.push({
        id: `ins_env_${card.id}`,
        cardId: card.id,
        cardName: card.name,
        triggerType: 'environmental',
        description: `Card stored in ${card.storageEnvironment} - high risk of water damage, temperature extremes, and pest exposure`,
        currentValue: card.currentValue,
        triggerValue: Math.round(card.currentValue * 0.5),
        urgency: card.currentValue > 5000 ? 'critical' : 'high',
        recommendation: 'Relocate immediately to climate-controlled storage',
      });
    }

    // Time-based inspection triggers
    const lastInspected = new Date(card.lastInspected);
    const monthsSinceInspection = Math.round((Date.now() - lastInspected.getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsSinceInspection > 12 && card.currentValue > 1000) {
      triggers.push({
        id: `ins_time_${card.id}`,
        cardId: card.id,
        cardName: card.name,
        triggerType: 'time_based',
        description: `Last inspected ${monthsSinceInspection} months ago. Annual inspection recommended for cards over $1,000.`,
        currentValue: card.currentValue,
        triggerValue: card.currentValue,
        urgency: monthsSinceInspection > 24 ? 'high' : 'medium',
        recommendation: 'Schedule physical inspection to verify condition matches recorded grade',
      });
    }
  });

  return triggers.sort((a, b) => {
    const urgOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return urgOrder[a.urgency] - urgOrder[b.urgency];
  });
}

export function getOptimalStorage(card: CardAgingProfile): StorageSetup {
  if (card.currentValue > 10000) return STORAGE_ENVIRONMENTS[0]; // Climate vault
  if (card.currentValue > 5000) return STORAGE_ENVIRONMENTS[4]; // Safe deposit
  if (card.currentValue > 500) return STORAGE_ENVIRONMENTS[1]; // Closet
  return STORAGE_ENVIRONMENTS[1]; // Closet for everything else
}

export function getCollectionHealthReport(): CollectionHealthReport {
  const cached = loadData<CollectionHealthReport>('health_report');
  if (cached) return cached;

  const cards = CARD_AGING_PROFILES;
  const atRisk = cards.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical');
  const optimalCount = cards.filter(c => c.riskLevel === 'low').length;
  const recs = getStorageRecommendations();
  const triggers = getInsuranceTriggers();

  // Calculate projected 10-year loss
  let totalCurrentValue = 0;
  let totalProjectedValue = 0;
  cards.forEach(card => {
    const env = STORAGE_ENVIRONMENTS.find(e =>
      e.name.toLowerCase().replace(/\s+/g, '_').includes(card.storageEnvironment.replace('_', ' ').toLowerCase()) ||
      card.storageEnvironment.includes(e.name.toLowerCase().split(' ')[0])
    ) ?? STORAGE_ENVIRONMENTS[1];
    const proj = projectAging(card, env.condition, 10);
    totalCurrentValue += card.currentValue;
    totalProjectedValue += proj.value_projected;
  });

  const scores = STORAGE_ENVIRONMENTS.map(e => getPreservationScore(e));
  const avgScore = Math.round(scores.reduce((s, p) => s + p.score, 0) / scores.length);

  const report: CollectionHealthReport = {
    overallScore: avgScore,
    totalCards: cards.length,
    cardsAtRisk: atRisk.length,
    projectedLoss10yr: totalCurrentValue - totalProjectedValue,
    optimalStoragePct: Math.round((optimalCount / cards.length) * 100),
    recommendations: recs.length,
    insuranceTriggers: triggers.length,
  };

  saveData('health_report', report);
  return report;
}

export function getValueAtRisk(years: number): { year: number; optimal: number; current: number; poor: number }[] {
  const cards = CARD_AGING_PROFILES;
  const yearPoints = [0, 1, 2, 5, 10, 15, 20, 30, 50].filter(y => y <= years);
  if (!yearPoints.includes(years)) yearPoints.push(years);

  return yearPoints.map(yr => {
    let optimalTotal = 0;
    let currentTotal = 0;
    let poorTotal = 0;

    cards.forEach(card => {
      const optimalCondition: StorageCondition = { temperature_f: 68, humidity_pct: 45, uv_exposure: 'none', case_type: 'slab' };
      const poorCondition: StorageCondition = { temperature_f: 82, humidity_pct: 70, uv_exposure: 'moderate', case_type: 'raw' };

      const env = STORAGE_ENVIRONMENTS.find(e =>
        e.name.toLowerCase().includes(card.storageEnvironment.split('_')[0])
      ) ?? STORAGE_ENVIRONMENTS[1];

      const optProj = projectAging(card, optimalCondition, yr);
      const curProj = projectAging(card, env.condition, yr);
      const poorProj = projectAging(card, poorCondition, yr);

      optimalTotal += optProj.value_projected;
      currentTotal += curProj.value_projected;
      poorTotal += poorProj.value_projected;
    });

    return {
      year: yr,
      optimal: Math.round(optimalTotal),
      current: Math.round(currentTotal),
      poor: Math.round(poorTotal),
    };
  });
}

export function getDegradationHistory(): { month: string; avgGrade: number; cardsInspected: number; issuesFound: number }[] {
  return [
    { month: '2025-04', avgGrade: 8.45, cardsInspected: 4, issuesFound: 1 },
    { month: '2025-05', avgGrade: 8.44, cardsInspected: 3, issuesFound: 0 },
    { month: '2025-06', avgGrade: 8.42, cardsInspected: 5, issuesFound: 2 },
    { month: '2025-07', avgGrade: 8.41, cardsInspected: 2, issuesFound: 0 },
    { month: '2025-08', avgGrade: 8.40, cardsInspected: 4, issuesFound: 1 },
    { month: '2025-09', avgGrade: 8.39, cardsInspected: 3, issuesFound: 1 },
    { month: '2025-10', avgGrade: 8.38, cardsInspected: 6, issuesFound: 2 },
    { month: '2025-11', avgGrade: 8.37, cardsInspected: 4, issuesFound: 1 },
    { month: '2025-12', avgGrade: 8.36, cardsInspected: 5, issuesFound: 0 },
    { month: '2026-01', avgGrade: 8.35, cardsInspected: 4, issuesFound: 1 },
    { month: '2026-02', avgGrade: 8.35, cardsInspected: 6, issuesFound: 2 },
    { month: '2026-03', avgGrade: 8.34, cardsInspected: 3, issuesFound: 1 },
  ];
}
