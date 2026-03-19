// Card Decay Half-Life Predictor Service
// Physics-based degradation modeling for sports card condition prediction.
// Models exponential decay with environmental modifiers (Arrhenius, UV sigmoid, humidity curves).

// ---- Types ----

export type AcidContent = 'low' | 'medium' | 'high';
export type LightExposure = 'none' | 'minimal' | 'moderate' | 'heavy';
export type StorageEnvironment =
  | 'museum-grade'
  | 'climate-controlled'
  | 'standard-indoor'
  | 'garage'
  | 'unknown';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface MaterialComp {
  cardStock: string;
  coating: string;
  inkType: string;
  thickness_mm: number;
  acidContent: AcidContent;
  uvResistance: number; // 0-100
  moistureResistance: number; // 0-100
  oxidationRate: number; // 0-1 normalized annual rate
}

export interface StorageCondition {
  environment: StorageEnvironment;
  temperature_F: number;
  humidity_percent: number;
  lightExposure: LightExposure;
  sleeved: boolean;
  toploadered: boolean;
  casedGrade: string | null;
}

export interface DecayPoint {
  year: number;
  projectedGrade: number;
  confidenceInterval: { low: number; high: number };
  degradationFactors: string[];
}

export interface ValuePoint {
  year: number;
  projectedValue: number;
  inflationAdjusted: number;
}

export interface DecayProfile {
  cardId: string;
  cardName: string;
  player: string;
  year: number;
  manufacturer: string;
  currentGrade: number;
  materialComposition: MaterialComp;
  storageCondition: StorageCondition;
  decayCurve: DecayPoint[];
  halfLife: number; // in years
  projectedGradeAt: {
    years5: number;
    years10: number;
    years25: number;
    years50: number;
  };
  valueTrajectory: ValuePoint[];
  preservationScore: number; // 0-100
}

export interface Recommendation {
  priority: RecommendationPriority;
  action: string;
  impact: number; // years added to half-life
  cost: number;
  description: string;
}

export interface PreservationPlan {
  cardId: string;
  currentScore: number;
  recommendations: Recommendation[];
  projectedHalfLifeExtension: number;
  estimatedCost: number;
  roi: number; // ratio of value preserved per dollar spent
}

export interface MaterialDecayRate {
  material: string;
  baseHalfLifeYears: number;
  accelerators: string[];
  decelerators: string[];
}

export interface StorageScenarioResult {
  condition: StorageCondition;
  label: string;
  halfLife: number;
  decayCurve: DecayPoint[];
  preservationScore: number;
  gradeAt25Years: number;
}

export interface CollectionForecastPoint {
  year: number;
  averageGrade: number;
  totalValue: number;
  inflationAdjustedValue: number;
  cardsAboveMint: number; // grade >= 9
  cardsAboveNearMint: number; // grade >= 7
  cardsBelowAcceptable: number; // grade < 4
}

export interface CollectionDecayForecast {
  cardCount: number;
  averageHalfLife: number;
  weakestCard: { cardId: string; cardName: string; halfLife: number };
  strongestCard: { cardId: string; cardName: string; halfLife: number };
  forecast: CollectionForecastPoint[];
  totalCurrentValue: number;
  projectedValueAt25Years: number;
}

// ---- Material Archetypes ----

const MATERIAL_ARCHETYPES: Record<string, MaterialComp> = {
  preWar: {
    cardStock: 'Uncoated cardboard',
    coating: 'None',
    inkType: 'Lithographic ink',
    thickness_mm: 0.65,
    acidContent: 'high',
    uvResistance: 15,
    moistureResistance: 10,
    oxidationRate: 0.045,
  },
  postWarStandard: {
    cardStock: 'Semi-coated cardboard',
    coating: 'Light gloss varnish',
    inkType: 'Offset lithography',
    thickness_mm: 0.55,
    acidContent: 'medium',
    uvResistance: 30,
    moistureResistance: 25,
    oxidationRate: 0.032,
  },
  vintageTopps: {
    cardStock: 'Gray cardboard core',
    coating: 'Wax coating',
    inkType: 'Offset lithography',
    thickness_mm: 0.50,
    acidContent: 'medium',
    uvResistance: 35,
    moistureResistance: 30,
    oxidationRate: 0.028,
  },
  junkWax: {
    cardStock: 'Bleached cardboard',
    coating: 'UV-coated gloss',
    inkType: 'Four-color offset',
    thickness_mm: 0.48,
    acidContent: 'medium',
    uvResistance: 45,
    moistureResistance: 40,
    oxidationRate: 0.022,
  },
  premiumGloss: {
    cardStock: 'Premium white core',
    coating: 'High-gloss UV laminate',
    inkType: 'Six-color process',
    thickness_mm: 0.52,
    acidContent: 'low',
    uvResistance: 65,
    moistureResistance: 55,
    oxidationRate: 0.015,
  },
  chrome: {
    cardStock: 'Chromium-finish stock',
    coating: 'Chromium reflex coating',
    inkType: 'Gravure + offset hybrid',
    thickness_mm: 0.45,
    acidContent: 'low',
    uvResistance: 72,
    moistureResistance: 68,
    oxidationRate: 0.012,
  },
  refractor: {
    cardStock: 'Chromium-finish stock',
    coating: 'Diffractive foil laminate',
    inkType: 'Holographic + gravure',
    thickness_mm: 0.50,
    acidContent: 'low',
    uvResistance: 78,
    moistureResistance: 72,
    oxidationRate: 0.010,
  },
  patchCard: {
    cardStock: 'Multi-layer composite',
    coating: 'Window acetate + gloss',
    inkType: 'Digital offset hybrid',
    thickness_mm: 1.80,
    acidContent: 'low',
    uvResistance: 55,
    moistureResistance: 35,
    oxidationRate: 0.020,
  },
};

// ---- Decay Science Engine ----

/** Arrhenius-inspired temperature acceleration factor. Reference: 68°F. */
function temperatureAcceleration(temp_F: number): number {
  const tempC = (temp_F - 32) * (5 / 9);
  const refC = 20; // 68°F
  // Simplified Arrhenius: rate doubles roughly every 10°C increase
  const activationFactor = 0.07; // ln(2)/10
  return Math.exp(activationFactor * (tempC - refC));
}

/** Humidity degradation factor. Exponential risk above 60% and below 30%. */
function humidityFactor(humidity: number): number {
  if (humidity >= 40 && humidity <= 55) return 1.0; // ideal range
  if (humidity > 55) {
    // Mold and warping risk escalates
    return 1.0 + 0.0008 * Math.pow(humidity - 55, 2);
  }
  // Low humidity: brittleness risk
  return 1.0 + 0.0003 * Math.pow(40 - humidity, 2);
}

/** UV fading sigmoid — most damage occurs in the moderate-to-heavy transition. */
function uvDegradationFactor(exposure: LightExposure, uvResistance: number): number {
  const exposureMap: Record<LightExposure, number> = {
    none: 0,
    minimal: 0.15,
    moderate: 0.50,
    heavy: 1.0,
  };
  const rawExposure = exposureMap[exposure];
  const resistance = uvResistance / 100;
  // Sigmoid curve: S-shaped damage accrual
  const midpoint = 0.4 + 0.3 * resistance; // higher resistance shifts midpoint right
  const steepness = 8;
  const fadeFactor = 1 / (1 + Math.exp(-steepness * (rawExposure - midpoint)));
  return 1.0 + fadeFactor * (2.5 - 1.5 * resistance);
}

/** Acid migration damage accelerator over time. */
function acidMigrationRate(acidContent: AcidContent, ageYears: number): number {
  const baseRates: Record<AcidContent, number> = { low: 0.002, medium: 0.008, high: 0.018 };
  // Acid damage accelerates with existing degradation (autocatalytic)
  return baseRates[acidContent] * (1 + 0.01 * ageYears);
}

/** Storage protection multiplier — lower is better for the card. */
function storageProtectionFactor(condition: StorageCondition): number {
  let factor = 1.0;
  if (condition.casedGrade) factor *= 0.35; // PSA/BGS slab is excellent protection
  else if (condition.toploadered) factor *= 0.55;
  else if (condition.sleeved) factor *= 0.75;

  const envFactors: Record<StorageEnvironment, number> = {
    'museum-grade': 0.40,
    'climate-controlled': 0.60,
    'standard-indoor': 1.00,
    garage: 1.60,
    unknown: 1.30,
  };
  factor *= envFactors[condition.environment];
  return factor;
}

/** Calculate the effective half-life (in years) for a card. */
export function calculateHalfLife(
  material: MaterialComp,
  storage: StorageCondition
): number {
  // Base half-life from material oxidation rate (years until grade drops by half)
  const baseHalfLife = Math.LN2 / material.oxidationRate;

  // Environmental modifiers
  const tempMod = temperatureAcceleration(storage.temperature_F);
  const humMod = humidityFactor(storage.humidity_percent);
  const uvMod = uvDegradationFactor(storage.lightExposure, material.uvResistance);
  const storageMod = storageProtectionFactor(storage);

  // Combined modifier (multiplicative)
  const combinedAcceleration = tempMod * humMod * uvMod * storageMod;

  const effectiveHalfLife = baseHalfLife / combinedAcceleration;

  // Clamp to reasonable range
  return Math.max(3, Math.min(500, effectiveHalfLife));
}

/** Project grade at a future year using exponential decay model. */
function projectGrade(
  currentGrade: number,
  halfLifeYears: number,
  yearsForward: number,
  material: MaterialComp
): number {
  // Exponential decay: G(t) = G0 * 2^(-t/halfLife)
  const decayBase = currentGrade * Math.pow(2, -yearsForward / halfLifeYears);
  // Acid contribution is additive degradation
  const acidDamage = acidMigrationRate(material.acidContent, yearsForward) * yearsForward * 0.5;
  const projected = decayBase - acidDamage;
  return Math.max(1, Math.min(10, parseFloat(projected.toFixed(2))));
}

/** Compute confidence interval width based on time horizon and material uncertainty. */
function confidenceWidth(yearsForward: number, material: MaterialComp): number {
  const baseUncertainty = 0.15;
  const materialUncertainty =
    (100 - material.uvResistance) / 200 + (100 - material.moistureResistance) / 200;
  return baseUncertainty * Math.sqrt(yearsForward) * (1 + materialUncertainty);
}

/** Get the dominant degradation factors at a given time point. */
function getDegradationFactors(
  yearsForward: number,
  material: MaterialComp,
  storage: StorageCondition
): string[] {
  const factors: string[] = [];
  if (temperatureAcceleration(storage.temperature_F) > 1.3)
    factors.push('Thermal acceleration');
  if (humidityFactor(storage.humidity_percent) > 1.2) {
    if (storage.humidity_percent > 60) factors.push('Moisture/mold risk');
    else factors.push('Low-humidity brittleness');
  }
  if (storage.lightExposure === 'moderate' || storage.lightExposure === 'heavy')
    factors.push('UV color fading');
  if (material.acidContent === 'high' || (material.acidContent === 'medium' && yearsForward > 15))
    factors.push('Acid migration');
  if (material.oxidationRate > 0.025) factors.push('Surface oxidation');
  if (material.thickness_mm > 1.0 && storage.humidity_percent > 50)
    factors.push('Composite delamination');
  if (!storage.sleeved && !storage.toploadered && !storage.casedGrade)
    factors.push('Surface abrasion');
  if (yearsForward > 30 && material.moistureResistance < 40)
    factors.push('Fiber degradation');
  return factors.length > 0 ? factors : ['Baseline aging'];
}

/** Generate full 50-year decay curve. */
function generateDecayCurve(
  currentGrade: number,
  halfLife: number,
  material: MaterialComp,
  storage: StorageCondition
): DecayPoint[] {
  const points: DecayPoint[] = [];
  const years = [0, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50];
  for (const y of years) {
    const grade = projectGrade(currentGrade, halfLife, y, material);
    const ci = confidenceWidth(y, material);
    points.push({
      year: y,
      projectedGrade: grade,
      confidenceInterval: {
        low: Math.max(1, parseFloat((grade - ci).toFixed(2))),
        high: Math.min(10, parseFloat((grade + ci).toFixed(2))),
      },
      degradationFactors: getDegradationFactors(y, material, storage),
    });
  }
  return points;
}

/** Generate value trajectory with inflation adjustment. */
function generateValueTrajectory(
  currentValue: number,
  currentGrade: number,
  halfLife: number,
  material: MaterialComp
): ValuePoint[] {
  const points: ValuePoint[] = [];
  const inflationRate = 0.03;
  const years = [0, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50];
  for (const y of years) {
    const futureGrade = projectGrade(currentGrade, halfLife, y, material);
    // Value scales roughly as grade^2.5 (premium for high grades)
    const gradeRatio = futureGrade / currentGrade;
    const rawValue = currentValue * Math.pow(gradeRatio, 2.5);
    // Vintage premium: older cards appreciate if maintained
    const vintagePremium = 1 + 0.015 * y;
    const projectedValue = parseFloat((rawValue * vintagePremium).toFixed(2));
    const inflationAdj = parseFloat(
      (projectedValue / Math.pow(1 + inflationRate, y)).toFixed(2)
    );
    points.push({ year: y, projectedValue, inflationAdjusted: inflationAdj });
  }
  return points;
}

/** Compute preservation score 0-100 (higher = better preserved environment). */
function computePreservationScore(storage: StorageCondition, material: MaterialComp): number {
  let score = 50; // baseline

  // Storage enclosure
  if (storage.casedGrade) score += 22;
  else if (storage.toploadered) score += 14;
  else if (storage.sleeved) score += 7;
  else score -= 10;

  // Environment
  const envScores: Record<StorageEnvironment, number> = {
    'museum-grade': 25,
    'climate-controlled': 15,
    'standard-indoor': 0,
    garage: -15,
    unknown: -8,
  };
  score += envScores[storage.environment];

  // Temperature penalty
  if (storage.temperature_F > 75) score -= (storage.temperature_F - 75) * 1.5;
  if (storage.temperature_F < 60) score -= (60 - storage.temperature_F) * 0.5;

  // Humidity penalty
  if (storage.humidity_percent > 60) score -= (storage.humidity_percent - 60) * 0.8;
  if (storage.humidity_percent < 35) score -= (35 - storage.humidity_percent) * 0.4;

  // Light penalty
  const lightPenalties: Record<LightExposure, number> = {
    none: 5,
    minimal: 0,
    moderate: -8,
    heavy: -18,
  };
  score += lightPenalties[storage.lightExposure];

  // Material bonus for resistant materials
  score += (material.uvResistance + material.moistureResistance) / 20;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ---- Mock Data ----

interface CardSeed {
  id: string;
  name: string;
  player: string;
  year: number;
  manufacturer: string;
  currentGrade: number;
  currentValue: number;
  archetype: keyof typeof MATERIAL_ARCHETYPES;
  storage: StorageCondition;
}

const CARD_SEEDS: CardSeed[] = [
  {
    id: 'decay-001',
    name: '1952 Topps #311 Mickey Mantle',
    player: 'Mickey Mantle',
    year: 1952,
    manufacturer: 'Topps',
    currentGrade: 6.5,
    currentValue: 385000,
    archetype: 'vintageTopps',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 68,
      humidity_percent: 45,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 6',
    },
  },
  {
    id: 'decay-002',
    name: '1986 Fleer #57 Michael Jordan RC',
    player: 'Michael Jordan',
    year: 1986,
    manufacturer: 'Fleer',
    currentGrade: 9.0,
    currentValue: 42000,
    archetype: 'junkWax',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 70,
      humidity_percent: 48,
      lightExposure: 'minimal',
      sleeved: false,
      toploadered: false,
      casedGrade: 'BGS 9',
    },
  },
  {
    id: 'decay-003',
    name: '2003 Topps Chrome #111 LeBron James RC',
    player: 'LeBron James',
    year: 2003,
    manufacturer: 'Topps',
    currentGrade: 9.5,
    currentValue: 58000,
    archetype: 'chrome',
    storage: {
      environment: 'museum-grade',
      temperature_F: 65,
      humidity_percent: 42,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 10',
    },
  },
  {
    id: 'decay-004',
    name: '1933 Goudey #53 Babe Ruth',
    player: 'Babe Ruth',
    year: 1933,
    manufacturer: 'Goudey',
    currentGrade: 4.0,
    currentValue: 165000,
    archetype: 'preWar',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 68,
      humidity_percent: 44,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'SGC 4',
    },
  },
  {
    id: 'decay-005',
    name: '2018 Panini Prizm #280 Luka Doncic RC',
    player: 'Luka Doncic',
    year: 2018,
    manufacturer: 'Panini',
    currentGrade: 10.0,
    currentValue: 7800,
    archetype: 'refractor',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 70,
      humidity_percent: 50,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 10',
    },
  },
  {
    id: 'decay-006',
    name: '1989 Upper Deck #1 Ken Griffey Jr. RC',
    player: 'Ken Griffey Jr.',
    year: 1989,
    manufacturer: 'Upper Deck',
    currentGrade: 8.5,
    currentValue: 320,
    archetype: 'junkWax',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 73,
      humidity_percent: 55,
      lightExposure: 'minimal',
      sleeved: true,
      toploadered: true,
      casedGrade: null,
    },
  },
  {
    id: 'decay-007',
    name: '2000 Playoff Contenders #144 Tom Brady RC Auto',
    player: 'Tom Brady',
    year: 2000,
    manufacturer: 'Playoff',
    currentGrade: 8.0,
    currentValue: 480000,
    archetype: 'premiumGloss',
    storage: {
      environment: 'museum-grade',
      temperature_F: 65,
      humidity_percent: 42,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'BGS 8',
    },
  },
  {
    id: 'decay-008',
    name: '1979 O-Pee-Chee #18 Wayne Gretzky RC',
    player: 'Wayne Gretzky',
    year: 1979,
    manufacturer: 'O-Pee-Chee',
    currentGrade: 7.0,
    currentValue: 95000,
    archetype: 'postWarStandard',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 69,
      humidity_percent: 47,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 7',
    },
  },
  {
    id: 'decay-009',
    name: '2017 Panini National Treasures #101 Patrick Mahomes RC Patch Auto /99',
    player: 'Patrick Mahomes',
    year: 2017,
    manufacturer: 'Panini',
    currentGrade: 9.0,
    currentValue: 72000,
    archetype: 'patchCard',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 70,
      humidity_percent: 48,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'BGS 9',
    },
  },
  {
    id: 'decay-010',
    name: '1957 Topps #95 Mickey Mantle',
    player: 'Mickey Mantle',
    year: 1957,
    manufacturer: 'Topps',
    currentGrade: 5.0,
    currentValue: 28000,
    archetype: 'vintageTopps',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 74,
      humidity_percent: 58,
      lightExposure: 'moderate',
      sleeved: true,
      toploadered: false,
      casedGrade: null,
    },
  },
  {
    id: 'decay-011',
    name: '2020 Panini Prizm #339 Justin Herbert RC Silver',
    player: 'Justin Herbert',
    year: 2020,
    manufacturer: 'Panini',
    currentGrade: 10.0,
    currentValue: 1200,
    archetype: 'refractor',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 72,
      humidity_percent: 52,
      lightExposure: 'minimal',
      sleeved: true,
      toploadered: true,
      casedGrade: null,
    },
  },
  {
    id: 'decay-012',
    name: '1969 Topps #260 Reggie Jackson RC',
    player: 'Reggie Jackson',
    year: 1969,
    manufacturer: 'Topps',
    currentGrade: 7.5,
    currentValue: 12500,
    archetype: 'vintageTopps',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 72,
      humidity_percent: 55,
      lightExposure: 'minimal',
      sleeved: false,
      toploadered: true,
      casedGrade: null,
    },
  },
  {
    id: 'decay-013',
    name: '2019 Panini Mosaic #209 Zion Williamson RC',
    player: 'Zion Williamson',
    year: 2019,
    manufacturer: 'Panini',
    currentGrade: 9.5,
    currentValue: 850,
    archetype: 'chrome',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 73,
      humidity_percent: 54,
      lightExposure: 'moderate',
      sleeved: true,
      toploadered: false,
      casedGrade: null,
    },
  },
  {
    id: 'decay-014',
    name: '1955 Topps #164 Roberto Clemente RC',
    player: 'Roberto Clemente',
    year: 1955,
    manufacturer: 'Topps',
    currentGrade: 5.5,
    currentValue: 78000,
    archetype: 'vintageTopps',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 68,
      humidity_percent: 45,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 5',
    },
  },
  {
    id: 'decay-015',
    name: '1996 Topps Chrome #138 Kobe Bryant RC Refractor',
    player: 'Kobe Bryant',
    year: 1996,
    manufacturer: 'Topps',
    currentGrade: 9.0,
    currentValue: 185000,
    archetype: 'refractor',
    storage: {
      environment: 'museum-grade',
      temperature_F: 65,
      humidity_percent: 42,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'BGS 9',
    },
  },
  {
    id: 'decay-016',
    name: '1987 Topps #320 Barry Bonds RC',
    player: 'Barry Bonds',
    year: 1987,
    manufacturer: 'Topps',
    currentGrade: 8.0,
    currentValue: 45,
    archetype: 'junkWax',
    storage: {
      environment: 'garage',
      temperature_F: 82,
      humidity_percent: 68,
      lightExposure: 'moderate',
      sleeved: false,
      toploadered: false,
      casedGrade: null,
    },
  },
  {
    id: 'decay-017',
    name: '2022 Topps Chrome #1 Julio Rodriguez RC',
    player: 'Julio Rodriguez',
    year: 2022,
    manufacturer: 'Topps',
    currentGrade: 10.0,
    currentValue: 280,
    archetype: 'chrome',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 72,
      humidity_percent: 50,
      lightExposure: 'minimal',
      sleeved: true,
      toploadered: true,
      casedGrade: null,
    },
  },
  {
    id: 'decay-018',
    name: '1909 T206 Honus Wagner',
    player: 'Honus Wagner',
    year: 1909,
    manufacturer: 'American Tobacco',
    currentGrade: 3.0,
    currentValue: 4200000,
    archetype: 'preWar',
    storage: {
      environment: 'museum-grade',
      temperature_F: 64,
      humidity_percent: 40,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'SGC 3',
    },
  },
  {
    id: 'decay-019',
    name: '2018 Topps Update #US250 Ronald Acuna Jr. RC',
    player: 'Ronald Acuna Jr.',
    year: 2018,
    manufacturer: 'Topps',
    currentGrade: 9.5,
    currentValue: 420,
    archetype: 'premiumGloss',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 74,
      humidity_percent: 56,
      lightExposure: 'minimal',
      sleeved: true,
      toploadered: true,
      casedGrade: null,
    },
  },
  {
    id: 'decay-020',
    name: '2001 SP Authentic #91 Tiger Woods RC Auto /900',
    player: 'Tiger Woods',
    year: 2001,
    manufacturer: 'Upper Deck',
    currentGrade: 8.5,
    currentValue: 24000,
    archetype: 'premiumGloss',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 69,
      humidity_percent: 46,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'BGS 8.5',
    },
  },
  {
    id: 'decay-021',
    name: '2023 Bowman Chrome #1 Elly De La Cruz RC',
    player: 'Elly De La Cruz',
    year: 2023,
    manufacturer: 'Topps',
    currentGrade: 9.5,
    currentValue: 150,
    archetype: 'chrome',
    storage: {
      environment: 'standard-indoor',
      temperature_F: 73,
      humidity_percent: 53,
      lightExposure: 'minimal',
      sleeved: true,
      toploadered: false,
      casedGrade: null,
    },
  },
  {
    id: 'decay-022',
    name: '1951 Bowman #305 Willie Mays RC',
    player: 'Willie Mays',
    year: 1951,
    manufacturer: 'Bowman',
    currentGrade: 4.5,
    currentValue: 125000,
    archetype: 'postWarStandard',
    storage: {
      environment: 'climate-controlled',
      temperature_F: 68,
      humidity_percent: 45,
      lightExposure: 'none',
      sleeved: false,
      toploadered: false,
      casedGrade: 'PSA 4',
    },
  },
];

// Pre-compute decay profiles from seeds
const DECAY_PROFILES: DecayProfile[] = CARD_SEEDS.map((seed) => {
  const material = MATERIAL_ARCHETYPES[seed.archetype];
  const halfLife = calculateHalfLife(material, seed.storage);
  const curve = generateDecayCurve(seed.currentGrade, halfLife, material, seed.storage);
  const valueTrajectory = generateValueTrajectory(
    seed.currentValue,
    seed.currentGrade,
    halfLife,
    material
  );
  const preservationScore = computePreservationScore(seed.storage, material);

  return {
    cardId: seed.id,
    cardName: seed.name,
    player: seed.player,
    year: seed.year,
    manufacturer: seed.manufacturer,
    currentGrade: seed.currentGrade,
    materialComposition: material,
    storageCondition: seed.storage,
    decayCurve: curve,
    halfLife: parseFloat(halfLife.toFixed(1)),
    projectedGradeAt: {
      years5: projectGrade(seed.currentGrade, halfLife, 5, material),
      years10: projectGrade(seed.currentGrade, halfLife, 10, material),
      years25: projectGrade(seed.currentGrade, halfLife, 25, material),
      years50: projectGrade(seed.currentGrade, halfLife, 50, material),
    },
    valueTrajectory,
    preservationScore,
  };
});

// ---- Material Decay Rate Reference ----

const MATERIAL_DECAY_RATES: MaterialDecayRate[] = [
  {
    material: 'Pre-War Cardboard (1900s-1940s)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.045).toFixed(1)),
    accelerators: ['High acid content', 'No protective coating', 'Porous fiber absorbs moisture', 'Lithographic ink fading'],
    decelerators: ['Thicker card stock', 'Low UV exposure in storage'],
  },
  {
    material: 'Post-War Standard (1950s-1970s)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.032).toFixed(1)),
    accelerators: ['Medium acid content', 'Thin varnish wears', 'Gray core yellowing'],
    decelerators: ['Light gloss varnish', 'Better ink adhesion than pre-war'],
  },
  {
    material: 'Vintage Topps (1950s-1980s)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.028).toFixed(1)),
    accelerators: ['Wax coating traps moisture', 'Medium acid core', 'Offset ink migration'],
    decelerators: ['Wax repels surface moisture short-term', 'Consistent stock quality'],
  },
  {
    material: 'Junk Wax Era (1986-1993)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.022).toFixed(1)),
    accelerators: ['UV coating cracks over time', 'Bleached stock yellows', 'Mass production QC variance'],
    decelerators: ['UV-coated gloss surface', 'Modern four-color ink stability'],
  },
  {
    material: 'Premium Gloss (1994-2005)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.015).toFixed(1)),
    accelerators: ['Laminate edge peeling', 'Six-color ink complexity'],
    decelerators: ['Low acid white core', 'High-gloss UV laminate', 'Superior moisture barrier'],
  },
  {
    material: 'Chromium Finish (1996-present)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.012).toFixed(1)),
    accelerators: ['Chrome coating micro-scratches', 'Fingerprint etching on unprotected surfaces'],
    decelerators: ['Chromium reflex coating', 'Low acid content', 'Excellent UV resistance'],
  },
  {
    material: 'Refractor / Holographic (1993-present)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.010).toFixed(1)),
    accelerators: ['Diffractive foil delamination risk', 'Temperature cycling stress on foil layer'],
    decelerators: ['Best UV resistance', 'Foil acts as moisture barrier', 'Very low oxidation rate'],
  },
  {
    material: 'Patch / Relic Card (2000s-present)',
    baseHalfLifeYears: parseFloat((Math.LN2 / 0.020).toFixed(1)),
    accelerators: ['Fabric deterioration', 'Adhesive breakdown', 'Multi-layer delamination', 'Acetate window yellowing'],
    decelerators: ['Thick composite construction', 'Low acid card stock', 'Usually stored in slabs'],
  },
];

// ---- Public API ----

/** Simulate a brief async delay to mimic a service call. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Get the full decay profile for a specific card. */
export async function getDecayProfile(cardId: string): Promise<DecayProfile | null> {
  await delay(150);
  return DECAY_PROFILES.find((p) => p.cardId === cardId) ?? null;
}

/** Get all decay profiles. */
export async function getAllDecayProfiles(): Promise<DecayProfile[]> {
  await delay(200);
  return DECAY_PROFILES;
}

/** Simulate decay for a card under a specific storage condition over N years. */
export async function simulateDecay(
  cardId: string,
  years: number,
  storageCondition: StorageCondition
): Promise<DecayPoint[] | null> {
  await delay(180);
  const seed = CARD_SEEDS.find((s) => s.id === cardId);
  if (!seed) return null;
  const material = MATERIAL_ARCHETYPES[seed.archetype];
  const halfLife = calculateHalfLife(material, storageCondition);
  const points: DecayPoint[] = [];
  const step = Math.max(1, Math.floor(years / 15));
  for (let y = 0; y <= years; y += step) {
    const grade = projectGrade(seed.currentGrade, halfLife, y, material);
    const ci = confidenceWidth(y, material);
    points.push({
      year: y,
      projectedGrade: grade,
      confidenceInterval: {
        low: Math.max(1, parseFloat((grade - ci).toFixed(2))),
        high: Math.min(10, parseFloat((grade + ci).toFixed(2))),
      },
      degradationFactors: getDegradationFactors(y, material, storageCondition),
    });
  }
  return points;
}

/** Get a preservation plan with prioritized recommendations for a card. */
export async function getPreservationPlan(cardId: string): Promise<PreservationPlan | null> {
  await delay(200);
  const profile = DECAY_PROFILES.find((p) => p.cardId === cardId);
  if (!profile) return null;

  const recommendations: Recommendation[] = [];
  const storage = profile.storageCondition;
  const material = profile.materialComposition;

  // Enclosure recommendations
  if (!storage.casedGrade && !storage.toploadered && !storage.sleeved) {
    recommendations.push({
      priority: 'critical',
      action: 'Add penny sleeve + toploader',
      impact: 8,
      cost: 0.5,
      description:
        'Unprotected cards suffer accelerated surface abrasion, dust accumulation, and edge wear. A penny sleeve plus toploader provides immediate mechanical and dust protection.',
    });
  } else if (!storage.casedGrade && !storage.toploadered && storage.sleeved) {
    recommendations.push({
      priority: 'high',
      action: 'Upgrade to toploader or one-touch',
      impact: 5,
      cost: 2,
      description:
        'Penny sleeves alone do not prevent bending or corner damage. A rigid toploader or magnetic one-touch case adds structural protection.',
    });
  }
  if (!storage.casedGrade && profile.valueTrajectory[0]?.projectedValue > 500) {
    recommendations.push({
      priority: 'high',
      action: 'Submit for professional grading and encapsulation',
      impact: 12,
      cost: 30,
      description:
        'Professional grading slabs (PSA, BGS, SGC) provide the highest level of protection: tamper-evident, UV-resistant acrylic, sealed from moisture and contaminants. Essential for high-value cards.',
    });
  }

  // Environment recommendations
  if (storage.environment === 'garage' || storage.environment === 'unknown') {
    recommendations.push({
      priority: 'critical',
      action: 'Relocate to climate-controlled space',
      impact: 15,
      cost: 0,
      description:
        'Garages and uncontrolled environments expose cards to extreme temperature swings, high humidity, and potential pest damage. Move cards to an interior room with stable climate.',
    });
  }
  if (storage.temperature_F > 75) {
    recommendations.push({
      priority: 'high',
      action: 'Reduce storage temperature to 65-72°F',
      impact: 6,
      cost: 150,
      description:
        `Current temperature of ${storage.temperature_F}°F accelerates chemical degradation per the Arrhenius equation. Every 10°F reduction roughly halves the degradation rate.`,
    });
  }
  if (storage.humidity_percent > 60) {
    recommendations.push({
      priority: 'critical',
      action: 'Install dehumidifier or use silica gel packs',
      impact: 10,
      cost: 45,
      description:
        `Humidity at ${storage.humidity_percent}% creates serious mold, warping, and foxing risk. Target 40-50% relative humidity for optimal card preservation.`,
    });
  } else if (storage.humidity_percent < 35) {
    recommendations.push({
      priority: 'medium',
      action: 'Add humidity control to prevent brittleness',
      impact: 3,
      cost: 30,
      description:
        'Very low humidity causes paper fibers to dry out and become brittle, increasing the risk of cracking during handling.',
    });
  }

  // UV recommendations
  if (storage.lightExposure === 'heavy' || storage.lightExposure === 'moderate') {
    recommendations.push({
      priority: storage.lightExposure === 'heavy' ? 'critical' : 'high',
      action: 'Eliminate UV light exposure',
      impact: storage.lightExposure === 'heavy' ? 12 : 7,
      cost: 15,
      description:
        'UV radiation causes irreversible color fading and paper yellowing. Store cards in opaque containers away from windows and fluorescent lights. Use UV-filtering sleeves for display cards.',
    });
  }

  // Material-specific recommendations
  if (material.acidContent === 'high') {
    recommendations.push({
      priority: 'high',
      action: 'Use acid-free storage materials',
      impact: 5,
      cost: 10,
      description:
        'High-acid card stock benefits from acid-free backing boards and sleeves that slow acid migration and neutralize off-gassing.',
    });
  }
  if (material.thickness_mm > 1.0) {
    recommendations.push({
      priority: 'medium',
      action: 'Store patch card flat to prevent delamination',
      impact: 4,
      cost: 0,
      description:
        'Multi-layer patch cards are susceptible to delamination when stored at angles. Keep flat in a rigid case to distribute weight evenly.',
    });
  }

  // General best practice
  recommendations.push({
    priority: 'low',
    action: 'Handle with clean cotton gloves',
    impact: 2,
    cost: 5,
    description:
      'Skin oils contain acids that etch into card surfaces over time, especially on chrome and foil finishes. Cotton or nitrile gloves prevent fingerprint contamination.',
  });

  // Sort by priority
  const priorityOrder: Record<RecommendationPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const totalImpact = recommendations.reduce((sum, r) => sum + r.impact, 0);
  const totalCost = recommendations.reduce((sum, r) => sum + r.cost, 0);

  // ROI: value preserved per dollar spent
  const currentValue = CARD_SEEDS.find((s) => s.id === cardId)?.currentValue ?? 0;
  const valuePreserved = currentValue * (totalImpact / profile.halfLife) * 0.3;
  const roi = totalCost > 0 ? parseFloat((valuePreserved / totalCost).toFixed(2)) : 0;

  return {
    cardId,
    currentScore: profile.preservationScore,
    recommendations,
    projectedHalfLifeExtension: totalImpact,
    estimatedCost: parseFloat(totalCost.toFixed(2)),
    roi,
  };
}

/** Get material decay rates reference data. */
export async function getMaterialDecayRates(): Promise<MaterialDecayRate[]> {
  await delay(100);
  return MATERIAL_DECAY_RATES;
}

/** Compare multiple storage scenarios for a single card. */
export async function compareStorageScenarios(
  cardId: string,
  conditions: { label: string; condition: StorageCondition }[]
): Promise<StorageScenarioResult[] | null> {
  await delay(250);
  const seed = CARD_SEEDS.find((s) => s.id === cardId);
  if (!seed) return null;
  const material = MATERIAL_ARCHETYPES[seed.archetype];

  return conditions.map(({ label, condition }) => {
    const halfLife = calculateHalfLife(material, condition);
    const curve = generateDecayCurve(seed.currentGrade, halfLife, material, condition);
    const score = computePreservationScore(condition, material);
    const gradeAt25 = projectGrade(seed.currentGrade, halfLife, 25, material);
    return {
      condition,
      label,
      halfLife: parseFloat(halfLife.toFixed(1)),
      decayCurve: curve,
      preservationScore: score,
      gradeAt25Years: gradeAt25,
    };
  });
}

/** Get aggregate collection decay forecast. */
export async function getCollectionDecayForecast(
  cardIds: string[]
): Promise<CollectionDecayForecast | null> {
  await delay(300);
  const profiles = DECAY_PROFILES.filter((p) => cardIds.includes(p.cardId));
  if (profiles.length === 0) return null;

  const seeds = CARD_SEEDS.filter((s) => cardIds.includes(s.id));
  const totalCurrentValue = seeds.reduce((sum, s) => sum + s.currentValue, 0);
  const averageHalfLife =
    profiles.reduce((sum, p) => sum + p.halfLife, 0) / profiles.length;

  const sorted = [...profiles].sort((a, b) => a.halfLife - b.halfLife);
  const weakestCard = {
    cardId: sorted[0].cardId,
    cardName: sorted[0].cardName,
    halfLife: sorted[0].halfLife,
  };
  const strongestCard = {
    cardId: sorted[sorted.length - 1].cardId,
    cardName: sorted[sorted.length - 1].cardName,
    halfLife: sorted[sorted.length - 1].halfLife,
  };

  const years = [0, 1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50];
  const inflationRate = 0.03;

  const forecast: CollectionForecastPoint[] = years.map((y) => {
    let totalValue = 0;
    let gradeSum = 0;
    let aboveMint = 0;
    let aboveNearMint = 0;
    let belowAcceptable = 0;

    profiles.forEach((profile, i) => {
      const seed = seeds[i];
      const grade = projectGrade(
        profile.currentGrade,
        profile.halfLife,
        y,
        profile.materialComposition
      );
      gradeSum += grade;
      if (grade >= 9) aboveMint++;
      if (grade >= 7) aboveNearMint++;
      if (grade < 4) belowAcceptable++;

      const gradeRatio = grade / profile.currentGrade;
      const rawValue = (seed?.currentValue ?? 0) * Math.pow(gradeRatio, 2.5);
      const vintagePremium = 1 + 0.015 * y;
      totalValue += rawValue * vintagePremium;
    });

    return {
      year: y,
      averageGrade: parseFloat((gradeSum / profiles.length).toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      inflationAdjustedValue: parseFloat(
        (totalValue / Math.pow(1 + inflationRate, y)).toFixed(2)
      ),
      cardsAboveMint: aboveMint,
      cardsAboveNearMint: aboveNearMint,
      cardsBelowAcceptable: belowAcceptable,
    };
  });

  return {
    cardCount: profiles.length,
    averageHalfLife: parseFloat(averageHalfLife.toFixed(1)),
    weakestCard,
    strongestCard,
    forecast,
    totalCurrentValue,
    projectedValueAt25Years: forecast.find((f) => f.year === 25)?.totalValue ?? 0,
  };
}

/** Get optimal storage recommendation for a card. */
export async function getOptimalStorageRecommendation(
  cardId: string
): Promise<{ optimal: StorageCondition; halfLife: number; preservationScore: number } | null> {
  await delay(150);
  const seed = CARD_SEEDS.find((s) => s.id === cardId);
  if (!seed) return null;

  const optimal: StorageCondition = {
    environment: 'museum-grade',
    temperature_F: 65,
    humidity_percent: 42,
    lightExposure: 'none',
    sleeved: true,
    toploadered: true,
    casedGrade: 'PSA',
  };

  const material = MATERIAL_ARCHETYPES[seed.archetype];
  const halfLife = calculateHalfLife(material, optimal);
  const score = computePreservationScore(optimal, material);

  return {
    optimal,
    halfLife: parseFloat(halfLife.toFixed(1)),
    preservationScore: score,
  };
}
