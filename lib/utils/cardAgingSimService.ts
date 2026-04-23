// @ts-nocheck
// ---- Types ----

export type UVExposure = 'none' | 'low' | 'moderate' | 'high';
export type AirQuality = 'clean' | 'moderate' | 'poor';
export type StorageType =
  | 'penny_sleeve'
  | 'toploader'
  | 'one_touch'
  | 'magnetic'
  | 'graded_case'
  | 'safe'
  | 'vault'
  | 'shoebox';

export interface StorageCondition {
  temperature: number; // °F
  humidity: number; // %
  uvExposure: UVExposure;
  airQuality: AirQuality;
  storageType: StorageType;
  isClimateControlled: boolean;
}

export interface MaterialFactor {
  id: string;
  name: string;
  category: 'paper' | 'ink' | 'coating' | 'adhesive' | 'foil';
  degradationRate: number; // 0-1 per decade
  sensitivity: { heat: number; humidity: number; uv: number }; // 0-10
  description: string;
  mitigationTips: string[];
}

export interface DegradationFactor {
  id: string;
  name: string;
  icon: string;
  weight: number;
  description: string;
  category: 'environmental' | 'material' | 'handling' | 'storage';
}

export interface DegradationRate {
  gradePointsPerYear: number;
  accelerationFactor: number;
  dominantFactor: string;
  confidence: number;
}

export interface DegradationCurve {
  year: number;
  gradeNumeric: number;
  gradeLabel: string;
  confidence: number;
}

export interface GradeDecayProjection {
  yearsFromNow: number;
  projectedGrade: string;
  gradeNumeric: number;
  confidence: number;
  degradationFactors: string[];
  currentValueImpact: number;
  projectedValue: number;
  valueChangePercent: number;
}

export interface PreservationScore {
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  label: string;
  breakdown: { factor: string; score: number; weight: number }[];
  suggestions: string[];
}

export interface EnvironmentalRisk {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  impact: string;
  mitigation: string;
  icon: string;
}

export interface StorageRecommendation {
  storageType: StorageType;
  label: string;
  monthlyCost: number;
  annualCost: number;
  protectionLevel: number; // 0-100
  gradeRetention25yr: number; // numeric grade retained after 25 years
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface AgingScenario {
  id: string;
  name: string;
  conditions: StorageCondition;
  projections: GradeDecayProjection[];
  preservationScore: number;
  color: string;
}

export interface CardMaterial {
  id: string;
  name: string;
  paperType: string;
  inkType: string;
  coatingType: string;
  hasAdhesive: boolean;
  hasFoil: boolean;
  era: string;
  factors: MaterialFactor[];
}

export interface AgingTimeline {
  cardId: string;
  cardName: string;
  currentGrade: string;
  events: { year: number; event: string; gradeImpact: number }[];
  curve: DegradationCurve[];
}

export interface StorageSetup {
  primary: StorageType;
  secondary?: StorageType;
  climateControl: boolean;
  dehumidifier: boolean;
  uvFiltering: boolean;
  monthlyCost: number;
}

export interface AgingSimulation {
  cardId: string;
  currentGrade: string;
  conditions: StorageCondition;
  projections: GradeDecayProjection[];
  degradationRate: DegradationRate;
  preservationScore: PreservationScore;
  materialFactors: MaterialFactor[];
  recommendations: StorageRecommendation[];
  curve: DegradationCurve[];
}

// ---- Constants ----

const GRADE_MAP: Record<string, number> = {
  'PSA 10': 10,
  'PSA 9': 9,
  'PSA 8': 8,
  'PSA 7': 7,
  'PSA 6': 6,
  'PSA 5': 5,
  'PSA 4': 4,
  'PSA 3': 3,
  'PSA 2': 2,
  'PSA 1': 1,
  'BGS 10': 10,
  'BGS 9.5': 9.5,
  'BGS 9': 9,
  'BGS 8.5': 8.5,
  'BGS 8': 8,
  'SGC 10': 10,
  'SGC 9': 9,
  'SGC 8': 8,
  Gem: 10,
  'Near Mint': 8,
  Excellent: 6,
  Good: 4,
  Fair: 2,
  Raw: 7,
};

const STORAGE_PROTECTION: Record<StorageType, number> = {
  shoebox: 0.1,
  penny_sleeve: 0.3,
  toploader: 0.55,
  one_touch: 0.7,
  magnetic: 0.75,
  graded_case: 0.85,
  safe: 0.9,
  vault: 0.97,
};

const UV_FACTOR: Record<UVExposure, number> = {
  none: 0,
  low: 0.15,
  moderate: 0.4,
  high: 0.8,
};

const AIR_FACTOR: Record<AirQuality, number> = {
  clean: 0,
  moderate: 0.2,
  poor: 0.55,
};

const VALUE_MULTIPLIERS: Record<number, number> = {
  10: 1.0,
  9.5: 0.6,
  9: 0.35,
  8.5: 0.22,
  8: 0.15,
  7: 0.08,
  6: 0.05,
  5: 0.035,
  4: 0.02,
  3: 0.012,
  2: 0.008,
  1: 0.005,
};

function gradeToNumeric(grade: string): number {
  return GRADE_MAP[grade] ?? 7;
}

function numericToGrade(n: number): string {
  if (n >= 9.75) return 'PSA 10';
  if (n >= 9.25) return 'PSA 9.5';
  if (n >= 8.75) return 'PSA 9';
  if (n >= 8.25) return 'PSA 8.5';
  if (n >= 7.75) return 'PSA 8';
  if (n >= 6.75) return 'PSA 7';
  if (n >= 5.75) return 'PSA 6';
  if (n >= 4.75) return 'PSA 5';
  if (n >= 3.75) return 'PSA 4';
  if (n >= 2.75) return 'PSA 3';
  if (n >= 1.75) return 'PSA 2';
  return 'PSA 1';
}

function getValueMultiplier(gradeNumeric: number): number {
  const rounded = Math.round(gradeNumeric * 2) / 2;
  const keys = Object.keys(VALUE_MULTIPLIERS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const k of keys) {
    if (rounded >= k) return VALUE_MULTIPLIERS[k];
  }
  return 0.005;
}

function computeDegradationPerYear(conditions: StorageCondition, material?: CardMaterial): number {
  // Base: PSA 10 in vault loses ~0.005/year (0.05/decade)
  // PSA 10 in shoebox loses ~0.05/year (0.5/decade)
  const storageProtection = STORAGE_PROTECTION[conditions.storageType];
  const baseDegradation = 0.06 * (1 - storageProtection); // per year

  // Temperature: ideal 65-70°F. Each degree above 72 adds degradation
  const tempDelta = Math.max(0, conditions.temperature - 70);
  const tempFactor = 1 + tempDelta * 0.012;

  // Humidity: ideal 35-45%. Deviation adds degradation
  const humidityIdeal = 40;
  const humidityDelta = Math.abs(conditions.humidity - humidityIdeal);
  const humidityFactor = 1 + (humidityDelta / 100) * 0.8;

  // UV
  const uvFactor = 1 + UV_FACTOR[conditions.uvExposure] * 0.6;

  // Air quality
  const airFactor = 1 + AIR_FACTOR[conditions.airQuality] * 0.4;

  // Climate control bonus
  const climateFactor = conditions.isClimateControlled ? 0.7 : 1.0;

  // Material sensitivity multiplier
  let materialMultiplier = 1.0;
  if (material) {
    const avgSensitivity =
      material.factors.reduce((s, f) => s + f.degradationRate, 0) /
      Math.max(material.factors.length, 1);
    materialMultiplier = 0.8 + avgSensitivity * 0.4;
  }

  return (
    baseDegradation *
    tempFactor *
    humidityFactor *
    uvFactor *
    airFactor *
    climateFactor *
    materialMultiplier
  );
}

// ---- Mock Data ----

const MOCK_MATERIALS: CardMaterial[] = [
  {
    id: 'mat-vintage',
    name: 'Vintage Cardboard (Pre-1980)',
    paperType: 'Uncoated gray cardboard',
    inkType: 'Offset lithography',
    coatingType: 'None',
    hasAdhesive: false,
    hasFoil: false,
    era: '1950s-1979',
    factors: [
      {
        id: 'mf-1',
        name: 'Uncoated Paper Stock',
        category: 'paper',
        degradationRate: 0.6,
        sensitivity: { heat: 7, humidity: 9, uv: 8 },
        description: 'Uncoated cardboard absorbs moisture readily and yellows under UV',
        mitigationTips: ['Store in low humidity (<45%)', 'UV-filtered enclosure essential'],
      },
      {
        id: 'mf-2',
        name: 'Offset Ink',
        category: 'ink',
        degradationRate: 0.35,
        sensitivity: { heat: 4, humidity: 3, uv: 7 },
        description: 'Period inks fade under prolonged UV but resist moisture well',
        mitigationTips: ['Minimize light exposure', 'Toploader minimum recommended'],
      },
    ],
  },
  {
    id: 'mat-modern',
    name: 'Modern Chromium Stock (2000+)',
    paperType: 'Chromium-coated card stock',
    inkType: 'Digital/UV-cured ink',
    coatingType: 'Glossy UV coating',
    hasAdhesive: false,
    hasFoil: true,
    era: '2000-present',
    factors: [
      {
        id: 'mf-3',
        name: 'Chromium Card Stock',
        category: 'paper',
        degradationRate: 0.2,
        sensitivity: { heat: 3, humidity: 4, uv: 2 },
        description: 'Durable coated stock resists environmental factors well',
        mitigationTips: ['Standard protection sufficient', 'Avoid extreme temperature swings'],
      },
      {
        id: 'mf-4',
        name: 'UV-Cured Ink',
        category: 'ink',
        degradationRate: 0.1,
        sensitivity: { heat: 2, humidity: 2, uv: 3 },
        description: 'Modern UV-cured inks are highly durable',
        mitigationTips: ['Minimal special care needed'],
      },
      {
        id: 'mf-5',
        name: 'Holographic Foil',
        category: 'foil',
        degradationRate: 0.3,
        sensitivity: { heat: 6, humidity: 5, uv: 4 },
        description: 'Foil layers can delaminate in high humidity or heat',
        mitigationTips: [
          'Climate control recommended',
          'Avoid temperature cycling',
          'One-touch or better storage',
        ],
      },
      {
        id: 'mf-6',
        name: 'Glossy UV Coating',
        category: 'coating',
        degradationRate: 0.15,
        sensitivity: { heat: 3, humidity: 3, uv: 5 },
        description: 'UV coating can crack or yellow with age, especially under light',
        mitigationTips: ['Store away from direct light sources'],
      },
    ],
  },
  {
    id: 'mat-junk',
    name: 'Junk Wax Era (1987-1993)',
    paperType: 'Thin coated cardboard',
    inkType: 'Offset lithography',
    coatingType: 'Light varnish',
    hasAdhesive: false,
    hasFoil: false,
    era: '1987-1993',
    factors: [
      {
        id: 'mf-7',
        name: 'Thin Card Stock',
        category: 'paper',
        degradationRate: 0.4,
        sensitivity: { heat: 5, humidity: 7, uv: 6 },
        description: 'Mass-produced thin stock is prone to warping and edge wear',
        mitigationTips: ['Toploader minimum', 'Climate control helps significantly'],
      },
      {
        id: 'mf-8',
        name: 'Light Varnish Coat',
        category: 'coating',
        degradationRate: 0.25,
        sensitivity: { heat: 4, humidity: 4, uv: 5 },
        description: 'Thin varnish provides minimal long-term UV protection',
        mitigationTips: ['UV-filtered storage recommended'],
      },
    ],
  },
  {
    id: 'mat-premium',
    name: 'Premium Thick Stock (National Treasures, etc.)',
    paperType: 'Heavy coated card stock (35pt+)',
    inkType: 'Digital/UV-cured ink',
    coatingType: 'Multi-layer UV coating',
    hasAdhesive: true,
    hasFoil: true,
    era: '2010-present',
    factors: [
      {
        id: 'mf-9',
        name: 'Heavy Card Stock',
        category: 'paper',
        degradationRate: 0.12,
        sensitivity: { heat: 2, humidity: 3, uv: 2 },
        description: 'Thick premium stock is highly resilient',
        mitigationTips: ['Standard graded case provides excellent protection'],
      },
      {
        id: 'mf-10',
        name: 'Patch/Relic Adhesive',
        category: 'adhesive',
        degradationRate: 0.45,
        sensitivity: { heat: 8, humidity: 7, uv: 3 },
        description: 'Adhesive securing memorabilia patches degrades with heat and humidity',
        mitigationTips: [
          'Climate control essential for patch cards',
          'Never store above 78°F',
          'Keep humidity below 50%',
        ],
      },
      {
        id: 'mf-11',
        name: 'Premium Foil Stamping',
        category: 'foil',
        degradationRate: 0.2,
        sensitivity: { heat: 5, humidity: 4, uv: 3 },
        description: 'High-quality foil resists degradation better than economy versions',
        mitigationTips: ['Graded case or one-touch recommended'],
      },
    ],
  },
];

const STORAGE_RECOMMENDATIONS: StorageRecommendation[] = [
  {
    storageType: 'shoebox',
    label: 'Shoebox / Loose',
    monthlyCost: 0,
    annualCost: 0,
    protectionLevel: 10,
    gradeRetention25yr: 5.2,
    pros: ['Zero cost', 'Easy access'],
    cons: ['No UV protection', 'No moisture barrier', 'Prone to physical damage', 'Dust exposure'],
    bestFor: 'Bulk commons worth <$1',
  },
  {
    storageType: 'penny_sleeve',
    label: 'Penny Sleeve',
    monthlyCost: 0,
    annualCost: 1,
    protectionLevel: 30,
    gradeRetention25yr: 6.8,
    pros: ['Very cheap', 'Prevents surface scratches', 'Easy to organize'],
    cons: ['No rigidity', 'Minimal UV protection', 'Can trap moisture'],
    bestFor: 'Cards worth $1-$20',
  },
  {
    storageType: 'toploader',
    label: 'Toploader + Sleeve',
    monthlyCost: 0,
    annualCost: 3,
    protectionLevel: 55,
    gradeRetention25yr: 7.6,
    pros: ['Rigid protection', 'Affordable', 'Good surface protection'],
    cons: ['Not fully sealed', 'Some UV passes through', 'Cards can shift inside'],
    bestFor: 'Cards worth $20-$100',
  },
  {
    storageType: 'one_touch',
    label: 'One-Touch Magnetic',
    monthlyCost: 0,
    annualCost: 8,
    protectionLevel: 70,
    gradeRetention25yr: 8.2,
    pros: ['Fully sealed', 'UV resistant', 'Display-ready', 'No card movement'],
    cons: ['Higher per-unit cost', 'Takes more storage space'],
    bestFor: 'Cards worth $100-$500',
  },
  {
    storageType: 'magnetic',
    label: 'Premium Magnetic Case',
    monthlyCost: 0,
    annualCost: 15,
    protectionLevel: 75,
    gradeRetention25yr: 8.5,
    pros: ['Excellent seal', 'UV filtering', 'Premium presentation'],
    cons: ['Expensive for bulk', 'Space-consuming'],
    bestFor: 'Cards worth $250-$1000',
  },
  {
    storageType: 'graded_case',
    label: 'Graded Slab (PSA/BGS)',
    monthlyCost: 0,
    annualCost: 0,
    protectionLevel: 85,
    gradeRetention25yr: 9.0,
    pros: ['Professional encapsulation', 'Tamper-evident', 'UV-resistant', 'Authenticated'],
    cons: ['Grading cost $20-150+', 'Cannot remove without breaking case'],
    bestFor: 'Cards worth $500+',
  },
  {
    storageType: 'safe',
    label: 'Fireproof Safe',
    monthlyCost: 2,
    annualCost: 24,
    protectionLevel: 90,
    gradeRetention25yr: 9.3,
    pros: ['Fire protection', 'Complete darkness', 'Theft deterrent', 'Sealed environment'],
    cons: ['No humidity control', 'Limited access', 'One-time purchase cost'],
    bestFor: 'Collection worth $5,000+',
  },
  {
    storageType: 'vault',
    label: 'Climate-Controlled Vault',
    monthlyCost: 25,
    annualCost: 300,
    protectionLevel: 97,
    gradeRetention25yr: 9.7,
    pros: [
      'Museum-grade preservation',
      'Temperature/humidity controlled',
      'UV eliminated',
      'Insurance available',
      'Maximum grade retention',
    ],
    cons: ['Highest cost', 'Remote access', 'Monthly fees'],
    bestFor: 'Individual cards worth $10,000+',
  },
];

// ---- Service Functions ----

export function simulateAging(
  currentGrade: string,
  conditions: StorageCondition,
  material?: CardMaterial
): AgingSimulation {
  const gradeNum = gradeToNumeric(currentGrade);
  const degradationPerYear = computeDegradationPerYear(conditions, material);
  const milestones = [1, 5, 10, 25, 50];
  const baseValue = gradeNum >= 9.5 ? 5000 : gradeNum >= 9 ? 2000 : gradeNum >= 8 ? 800 : 400;

  const projections: GradeDecayProjection[] = milestones.map((y) => {
    // Degradation accelerates slightly over time (compounding effect)
    const totalDeg = degradationPerYear * y * (1 + y * 0.004);
    const projected = Math.max(1, gradeNum - totalDeg);
    const confidence = Math.max(0.4, 1 - y * 0.008);
    const projectedValueMult = getValueMultiplier(projected);
    const currentValueMult = getValueMultiplier(gradeNum);
    const projectedValue = baseValue * (projectedValueMult / currentValueMult);
    const changePercent = ((projectedValue - baseValue) / baseValue) * 100;

    const factors: string[] = [];
    if (conditions.temperature > 75) factors.push('High temperature');
    if (conditions.humidity > 60 || conditions.humidity < 25) factors.push('Humidity out of range');
    if (conditions.uvExposure !== 'none') factors.push('UV exposure');
    if (conditions.airQuality !== 'clean') factors.push('Air quality');
    if (STORAGE_PROTECTION[conditions.storageType] < 0.5) factors.push('Inadequate storage');
    if (factors.length === 0) factors.push('Minimal natural aging');

    return {
      yearsFromNow: y,
      projectedGrade: numericToGrade(projected),
      gradeNumeric: Math.round(projected * 100) / 100,
      confidence,
      degradationFactors: factors,
      currentValueImpact: baseValue,
      projectedValue: Math.round(projectedValue),
      valueChangePercent: Math.round(changePercent * 10) / 10,
    };
  });

  // Build full curve (yearly)
  const curve: DegradationCurve[] = [];
  for (let y = 0; y <= 50; y++) {
    const totalDeg = degradationPerYear * y * (1 + y * 0.004);
    const projected = Math.max(1, gradeNum - totalDeg);
    curve.push({
      year: y,
      gradeNumeric: Math.round(projected * 100) / 100,
      gradeLabel: numericToGrade(projected),
      confidence: Math.max(0.4, 1 - y * 0.008),
    });
  }

  const preservationScore = getPreservationScore(conditions);
  const materialFactors = material?.factors ?? MOCK_MATERIALS[1].factors;

  const dominantFactor = getDominantFactor(conditions);

  return {
    cardId: `sim-${Date.now()}`,
    currentGrade,
    conditions,
    projections,
    degradationRate: {
      gradePointsPerYear: Math.round(degradationPerYear * 1000) / 1000,
      accelerationFactor: 1 + 50 * 0.004,
      dominantFactor,
      confidence: 0.85,
    },
    preservationScore,
    materialFactors,
    recommendations: getTopRecommendations(gradeNum, conditions),
    curve,
  };
}

function getDominantFactor(c: StorageCondition): string {
  const factors: [string, number][] = [
    ['Storage type', 1 - STORAGE_PROTECTION[c.storageType]],
    ['Temperature', Math.max(0, c.temperature - 70) * 0.012],
    ['Humidity', (Math.abs(c.humidity - 40) / 100) * 0.8],
    ['UV exposure', UV_FACTOR[c.uvExposure] * 0.6],
    ['Air quality', AIR_FACTOR[c.airQuality] * 0.4],
  ];
  factors.sort((a, b) => b[1] - a[1]);
  return factors[0][0];
}

function getTopRecommendations(
  gradeNum: number,
  conditions: StorageCondition
): StorageRecommendation[] {
  const currentProtection = STORAGE_PROTECTION[conditions.storageType];
  return STORAGE_RECOMMENDATIONS.filter(
    (r) => STORAGE_PROTECTION[r.storageType] > currentProtection
  ).slice(0, 3);
}

export function getPreservationScore(conditions: StorageCondition): PreservationScore {
  const storageScore = STORAGE_PROTECTION[conditions.storageType] * 100;
  const tempIdeal = 68;
  const tempScore = Math.max(0, 100 - Math.abs(conditions.temperature - tempIdeal) * 2.5);
  const humidityIdeal = 40;
  const humScore = Math.max(0, 100 - Math.abs(conditions.humidity - humidityIdeal) * 2);
  const uvScore = { none: 100, low: 70, moderate: 40, high: 10 }[conditions.uvExposure];
  const airScore = { clean: 100, moderate: 60, poor: 20 }[conditions.airQuality];
  const climateBonus = conditions.isClimateControlled ? 10 : 0;

  const breakdown = [
    { factor: 'Storage Type', score: Math.round(storageScore), weight: 0.3 },
    { factor: 'Temperature', score: Math.round(tempScore), weight: 0.2 },
    { factor: 'Humidity', score: Math.round(humScore), weight: 0.2 },
    { factor: 'UV Exposure', score: Math.round(uvScore), weight: 0.15 },
    { factor: 'Air Quality', score: Math.round(airScore), weight: 0.15 },
  ];

  const weighted =
    breakdown.reduce((sum, b) => sum + b.score * b.weight, 0) + climateBonus;
  const score = Math.min(100, Math.max(0, Math.round(weighted)));

  const grade =
    score >= 95
      ? 'A+'
      : score >= 85
        ? 'A'
        : score >= 75
          ? 'B+'
          : score >= 65
            ? 'B'
            : score >= 50
              ? 'C'
              : score >= 30
                ? 'D'
                : 'F';

  const label =
    score >= 85
      ? 'Excellent Preservation'
      : score >= 65
        ? 'Good Preservation'
        : score >= 45
          ? 'Fair Preservation'
          : 'Poor Preservation';

  const suggestions: string[] = [];
  if (storageScore < 70) suggestions.push('Upgrade storage to toploader or better');
  if (tempScore < 60) suggestions.push('Move to climate-controlled environment (65-70°F)');
  if (humScore < 60) suggestions.push('Add dehumidifier to keep 35-45% RH');
  if (uvScore < 60) suggestions.push('Eliminate UV light exposure');
  if (airScore < 60) suggestions.push('Improve air filtration or seal storage');
  if (!conditions.isClimateControlled) suggestions.push('Consider climate-controlled storage');

  return { score, grade, label, breakdown, suggestions };
}

export function compareStorageScenarios(
  grade: string,
  scenarios: StorageCondition[]
): AgingScenario[] {
  const colors = ['#84cc16', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  return scenarios.map((conditions, i) => {
    const sim = simulateAging(grade, conditions);
    const labels = [
      `${conditions.storageType.replace(/_/g, ' ')}`,
      conditions.isClimateControlled ? 'Climate Ctrl' : '',
    ]
      .filter(Boolean)
      .join(' + ');

    return {
      id: `scenario-${i}`,
      name: labels.charAt(0).toUpperCase() + labels.slice(1),
      conditions,
      projections: sim.projections,
      preservationScore: sim.preservationScore.score,
      color: colors[i % colors.length],
    };
  });
}

// Keep the typo version as an alias since the spec has it
export const compareStoargeScenarios = compareStorageScenarios;

export function getDegradationFactors(): DegradationFactor[] {
  return [
    {
      id: 'df-1',
      name: 'UV Radiation',
      icon: 'sun',
      weight: 0.25,
      description: 'Ultraviolet light causes ink fading, paper yellowing, and surface degradation',
      category: 'environmental',
    },
    {
      id: 'df-2',
      name: 'Humidity',
      icon: 'droplets',
      weight: 0.2,
      description:
        'Excess moisture causes warping, foxing, and mold growth; too little causes brittleness',
      category: 'environmental',
    },
    {
      id: 'df-3',
      name: 'Temperature',
      icon: 'thermometer',
      weight: 0.15,
      description:
        'Heat accelerates chemical decomposition of paper fibers and adhesives',
      category: 'environmental',
    },
    {
      id: 'df-4',
      name: 'Air Pollutants',
      icon: 'wind',
      weight: 0.1,
      description: 'Particulates, ozone, and sulfur dioxide attack card surfaces',
      category: 'environmental',
    },
    {
      id: 'df-5',
      name: 'Physical Contact',
      icon: 'hand',
      weight: 0.1,
      description: 'Oils from skin contact cause staining and surface damage over time',
      category: 'handling',
    },
    {
      id: 'df-6',
      name: 'Paper Acidity',
      icon: 'flask',
      weight: 0.1,
      description: 'Acid content in paper causes self-destruction (acid hydrolysis)',
      category: 'material',
    },
    {
      id: 'df-7',
      name: 'Storage Pressure',
      icon: 'layers',
      weight: 0.05,
      description: 'Stacking pressure causes indentations and corner damage',
      category: 'storage',
    },
    {
      id: 'df-8',
      name: 'Adhesive Migration',
      icon: 'droplet',
      weight: 0.05,
      description:
        'Adhesive in patch/relic cards migrates and stains surrounding paper',
      category: 'material',
    },
  ];
}

export function getOptimalStorage(cardValue: number, grade: string): StorageRecommendation {
  if (cardValue >= 10000) return STORAGE_RECOMMENDATIONS[7]; // vault
  if (cardValue >= 5000) return STORAGE_RECOMMENDATIONS[6]; // safe
  if (cardValue >= 500) return STORAGE_RECOMMENDATIONS[5]; // graded case
  if (cardValue >= 100) return STORAGE_RECOMMENDATIONS[3]; // one-touch
  if (cardValue >= 20) return STORAGE_RECOMMENDATIONS[2]; // toploader
  if (cardValue >= 1) return STORAGE_RECOMMENDATIONS[1]; // penny sleeve
  return STORAGE_RECOMMENDATIONS[0]; // shoebox
}

export function getMaterialAnalysis(cardType: string): MaterialFactor[] {
  const t = cardType.toLowerCase();
  if (t.includes('vintage') || t.includes('pre-1980')) return MOCK_MATERIALS[0].factors;
  if (t.includes('junk') || t.includes('1987') || t.includes('1990')) return MOCK_MATERIALS[2].factors;
  if (t.includes('premium') || t.includes('national') || t.includes('patch'))
    return MOCK_MATERIALS[3].factors;
  return MOCK_MATERIALS[1].factors;
}

export function getAgingTimeline(cardId: string): AgingTimeline {
  const defaultConditions: StorageCondition = {
    temperature: 72,
    humidity: 50,
    uvExposure: 'low',
    airQuality: 'moderate',
    storageType: 'toploader',
    isClimateControlled: false,
  };

  const sim = simulateAging('PSA 10', defaultConditions);

  return {
    cardId,
    cardName: 'Sample Card',
    currentGrade: 'PSA 10',
    events: [
      { year: 0, event: 'Graded PSA 10', gradeImpact: 0 },
      { year: 3, event: 'Minor edge softening from sleeve friction', gradeImpact: -0.1 },
      { year: 8, event: 'Slight yellowing on reverse (UV)', gradeImpact: -0.2 },
      { year: 15, event: 'Corner tip showing micro-wear', gradeImpact: -0.3 },
      { year: 25, event: 'Surface gloss reduction detected', gradeImpact: -0.4 },
      { year: 40, event: 'Paper fiber weakening (acid hydrolysis)', gradeImpact: -0.5 },
    ],
    curve: sim.curve,
  };
}

export function calculateStorageROI(
  cardValue: number,
  storageUpgradeCost: number,
  conditions: StorageCondition
): { roi: number; breakEvenYears: number; valueSaved25yr: number } {
  // Compare current conditions vs optimal
  const currentSim = simulateAging('PSA 10', conditions);
  const optimalConditions: StorageCondition = {
    temperature: 68,
    humidity: 40,
    uvExposure: 'none',
    airQuality: 'clean',
    storageType: 'vault',
    isClimateControlled: true,
  };
  const optimalSim = simulateAging('PSA 10', optimalConditions);

  const current25 = currentSim.projections.find((p) => p.yearsFromNow === 25);
  const optimal25 = optimalSim.projections.find((p) => p.yearsFromNow === 25);

  const currentValue25 = current25
    ? cardValue * (current25.projectedValue / current25.currentValueImpact)
    : cardValue * 0.5;
  const optimalValue25 = optimal25
    ? cardValue * (optimal25.projectedValue / optimal25.currentValueImpact)
    : cardValue * 0.95;

  const valueSaved = optimalValue25 - currentValue25;
  const totalCost = storageUpgradeCost * 25;
  const roi = totalCost > 0 ? ((valueSaved - totalCost) / totalCost) * 100 : 0;

  const yearlyValueSaved = valueSaved / 25;
  const breakEvenYears =
    yearlyValueSaved > 0 ? Math.ceil(storageUpgradeCost / yearlyValueSaved) : 99;

  return {
    roi: Math.round(roi),
    breakEvenYears: Math.min(breakEvenYears, 99),
    valueSaved25yr: Math.round(valueSaved),
  };
}

export function getEnvironmentalRisks(location?: string): EnvironmentalRisk[] {
  return [
    {
      id: 'er-1',
      name: 'Flooding',
      severity: 'critical',
      probability: 0.08,
      impact: 'Total card destruction - water damage is irreversible',
      mitigation: 'Elevate storage off floor, use waterproof containers, store above ground level',
      icon: 'droplets',
    },
    {
      id: 'er-2',
      name: 'Fire',
      severity: 'critical',
      probability: 0.03,
      impact: 'Total collection loss if not protected',
      mitigation: 'Fireproof safe rated 1+ hour, off-site backup vault for top cards',
      icon: 'flame',
    },
    {
      id: 'er-3',
      name: 'Humidity Spike',
      severity: 'high',
      probability: 0.35,
      impact: 'Warping, foxing spots, mold growth, adhesive failure on patch cards',
      mitigation: 'Dehumidifier with hygrometer, silica gel packs in storage containers',
      icon: 'cloud-rain',
    },
    {
      id: 'er-4',
      name: 'Heat Wave',
      severity: 'high',
      probability: 0.25,
      impact: 'Accelerated degradation, adhesive softening, warping',
      mitigation: 'Climate-controlled storage, never store in attics or garages',
      icon: 'thermometer',
    },
    {
      id: 'er-5',
      name: 'Pest Damage',
      severity: 'medium',
      probability: 0.12,
      impact: 'Silverfish and cockroaches consume paper and adhesives',
      mitigation: 'Sealed containers, pest control, avoid damp storage areas',
      icon: 'bug',
    },
    {
      id: 'er-6',
      name: 'UV Degradation',
      severity: 'medium',
      probability: 0.6,
      impact: 'Ink fading, paper yellowing, surface damage over years',
      mitigation: 'UV-filtering sleeves, store in darkness, avoid display near windows',
      icon: 'sun',
    },
    {
      id: 'er-7',
      name: 'Theft',
      severity: 'high',
      probability: 0.05,
      impact: 'Partial or complete collection loss',
      mitigation: 'Home safe, vault storage for high-value, insurance coverage',
      icon: 'shield-alert',
    },
    {
      id: 'er-8',
      name: 'Accidental Damage',
      severity: 'medium',
      probability: 0.2,
      impact: 'Bent corners, surface scratches, liquid spills',
      mitigation: 'Proper handling procedures, rigid enclosures, dedicated storage area',
      icon: 'alert-triangle',
    },
  ];
}

export function batchSimulate(
  cards: { id: string; grade: string; conditions: StorageCondition; material?: CardMaterial }[]
): AgingSimulation[] {
  return cards.map((c) => {
    const sim = simulateAging(c.grade, c.conditions, c.material);
    return { ...sim, cardId: c.id };
  });
}

export function getAllMaterials(): CardMaterial[] {
  return MOCK_MATERIALS;
}

export function getAllStorageRecommendations(): StorageRecommendation[] {
  return STORAGE_RECOMMENDATIONS;
}

export function getStorageTypeLabel(type: StorageType): string {
  const labels: Record<StorageType, string> = {
    shoebox: 'Shoebox / Loose',
    penny_sleeve: 'Penny Sleeve',
    toploader: 'Toploader',
    one_touch: 'One-Touch',
    magnetic: 'Magnetic Case',
    graded_case: 'Graded Slab',
    safe: 'Fireproof Safe',
    vault: 'Climate Vault',
  };
  return labels[type];
}
