// @ts-nocheck
// Card Climate Risk Mapper — Service Layer
// Climate-aware storage risk assessment for sports card collections

// ---- Types ----

export type ClimateZone =
  | 'tropical'
  | 'arid'
  | 'temperate'
  | 'continental'
  | 'polar'
  | 'mediterranean'
  | 'subtropical'
  | 'oceanic';

export type RiskFactor =
  | 'humidity'
  | 'flood'
  | 'wildfire'
  | 'temperature'
  | 'tornado'
  | 'hurricane';

export type MaterialType =
  | 'vintage-cardboard'
  | 'modern-chrome'
  | 'acetate'
  | 'patch-cards'
  | 'refractor'
  | 'canvas-texture'
  | 'metal-frame'
  | 'silk-finish';

export type VaultTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'unrated';

export type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high' | 'critical';

export type Region =
  | 'northeast'
  | 'southeast'
  | 'midwest'
  | 'southwest'
  | 'west'
  | 'pacific-northwest'
  | 'mountain'
  | 'gulf-coast';

export interface StorageRisk {
  overallScore: number; // 0–100, higher = more risk
  level: RiskLevel;
  factors: {
    factor: RiskFactor;
    score: number;
    weight: number;
    description: string;
  }[];
  estimatedAnnualDamagePercent: number;
  insurancePremiumMultiplier: number;
}

export interface ZipCodeProfile {
  zip: string;
  city: string;
  state: string;
  region: Region;
  climateZone: ClimateZone;
  latitude: number;
  longitude: number;
  avgHumidity: number;
  avgTempF: number;
  annualRainfallInches: number;
  riskScores: Record<RiskFactor, number>; // 0–100
  overallRisk: number;
  riskLevel: RiskLevel;
  elevation: number;
  floodZone: boolean;
  wildfireZone: boolean;
}

export interface RelocationRecommendation {
  fromZip: string;
  toZip: string;
  fromCity: string;
  toCity: string;
  riskReduction: number;
  costSavingsPercent: number;
  distanceMiles: number;
  reasoning: string;
  overallRiskBefore: number;
  overallRiskAfter: number;
}

export interface MaterialVulnerability {
  material: MaterialType;
  displayName: string;
  humidityTolerance: number; // 0–100, higher = more tolerant
  heatTolerance: number;
  floodSurvivability: number;
  fireSurvivability: number;
  windDamageTolerance: number;
  uvResistance: number;
  overallDurability: number;
  optimalTempRange: [number, number];
  optimalHumidityRange: [number, number];
  degradationRatePerYear: number; // percent per year under non-optimal conditions
  replacementCostMultiplier: number;
  notes: string;
}

export interface ClimateProjection {
  zip: string;
  city: string;
  years: number;
  projections: {
    year: number;
    avgTempF: number;
    avgHumidity: number;
    floodRisk: number;
    wildfireRisk: number;
    overallRisk: number;
    seaLevelRiseInches: number;
    extremeHeatDays: number;
  }[];
  summary: string;
  recommendedAction: string;
}

export interface DamageModel {
  material: MaterialType;
  zip: string;
  yearsProjected: number;
  projectedDamage: {
    year: number;
    conditionLoss: number; // percent condition degradation
    valueLoss: number;     // percent value depreciation from climate
    cumulativeLoss: number;
  }[];
  totalValueAtRisk: number;
  mitigationSavings: number;
}

export interface VaultRating {
  id: string;
  name: string;
  location: string;
  zip: string;
  tier: VaultTier;
  climateScore: number; // 0–100, higher = better
  humidityControl: boolean;
  temperatureControl: boolean;
  floodProtection: boolean;
  fireProtection: boolean;
  backupPower: boolean;
  insuranceCoverage: number;
  monthlyCostPer100Cards: number;
  capacityUtilization: number;
  customerRating: number;
  certifications: string[];
}

export interface SeasonalRiskProfile {
  zip: string;
  city: string;
  monthly: {
    month: string;
    humidity: number;
    avgTempF: number;
    precipitationInches: number;
    tornadoRisk: number;
    hurricaneRisk: number;
    floodRisk: number;
    wildfireRisk: number;
    overallRisk: number;
  }[];
}

export interface StorageOptimization {
  currentZip: string;
  currentRisk: number;
  recommendations: {
    category: string;
    action: string;
    impact: number; // risk reduction 0–100
    cost: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
  projectedRiskAfter: number;
  estimatedSavingsPercent: number;
}

export interface LocationComparison {
  zip1: ZipCodeProfile;
  zip2: ZipCodeProfile;
  riskDifference: number;
  betterLocation: string;
  factorComparison: {
    factor: RiskFactor;
    zip1Score: number;
    zip2Score: number;
    difference: number;
    winner: string;
  }[];
  recommendation: string;
}

// ---- Helpers ----

function riskLevel(score: number): RiskLevel {
  if (score < 20) return 'low';
  if (score < 40) return 'moderate';
  if (score < 60) return 'elevated';
  if (score < 80) return 'high';
  return 'critical';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- Mock Data: Zip Code Profiles (30+) ----

const zipCodeProfiles: ZipCodeProfile[] = [
  { zip: '10001', city: 'New York', state: 'NY', region: 'northeast', climateZone: 'continental', latitude: 40.75, longitude: -73.99, avgHumidity: 63, avgTempF: 55, annualRainfallInches: 49, riskScores: { humidity: 55, flood: 62, wildfire: 5, temperature: 35, tornado: 8, hurricane: 38 }, overallRisk: 42, riskLevel: 'elevated', elevation: 33, floodZone: true, wildfireZone: false },
  { zip: '33101', city: 'Miami', state: 'FL', region: 'southeast', climateZone: 'tropical', latitude: 25.77, longitude: -80.19, avgHumidity: 76, avgTempF: 77, annualRainfallInches: 62, riskScores: { humidity: 88, flood: 82, wildfire: 8, temperature: 72, tornado: 22, hurricane: 92 }, overallRisk: 78, riskLevel: 'high', elevation: 6, floodZone: true, wildfireZone: false },
  { zip: '90210', city: 'Beverly Hills', state: 'CA', region: 'west', climateZone: 'mediterranean', latitude: 34.09, longitude: -118.41, avgHumidity: 42, avgTempF: 63, annualRainfallInches: 15, riskScores: { humidity: 18, flood: 12, wildfire: 78, temperature: 55, tornado: 3, hurricane: 2 }, overallRisk: 38, riskLevel: 'moderate', elevation: 262, floodZone: false, wildfireZone: true },
  { zip: '85001', city: 'Phoenix', state: 'AZ', region: 'southwest', climateZone: 'arid', latitude: 33.45, longitude: -112.07, avgHumidity: 23, avgTempF: 75, annualRainfallInches: 8, riskScores: { humidity: 8, flood: 18, wildfire: 42, temperature: 92, tornado: 6, hurricane: 1 }, overallRisk: 35, riskLevel: 'moderate', elevation: 1086, floodZone: false, wildfireZone: true },
  { zip: '77001', city: 'Houston', state: 'TX', region: 'gulf-coast', climateZone: 'subtropical', latitude: 29.76, longitude: -95.36, avgHumidity: 75, avgTempF: 70, annualRainfallInches: 50, riskScores: { humidity: 82, flood: 88, wildfire: 6, temperature: 62, tornado: 35, hurricane: 78 }, overallRisk: 72, riskLevel: 'high', elevation: 43, floodZone: true, wildfireZone: false },
  { zip: '60601', city: 'Chicago', state: 'IL', region: 'midwest', climateZone: 'continental', latitude: 41.88, longitude: -87.63, avgHumidity: 65, avgTempF: 50, annualRainfallInches: 36, riskScores: { humidity: 52, flood: 38, wildfire: 3, temperature: 45, tornado: 42, hurricane: 2 }, overallRisk: 35, riskLevel: 'moderate', elevation: 594, floodZone: false, wildfireZone: false },
  { zip: '80202', city: 'Denver', state: 'CO', region: 'mountain', climateZone: 'continental', latitude: 39.74, longitude: -104.99, avgHumidity: 35, avgTempF: 50, annualRainfallInches: 15, riskScores: { humidity: 15, flood: 18, wildfire: 52, temperature: 38, tornado: 28, hurricane: 0 }, overallRisk: 25, riskLevel: 'moderate', elevation: 5280, floodZone: false, wildfireZone: true },
  { zip: '98101', city: 'Seattle', state: 'WA', region: 'pacific-northwest', climateZone: 'oceanic', latitude: 47.61, longitude: -122.33, avgHumidity: 73, avgTempF: 52, annualRainfallInches: 37, riskScores: { humidity: 68, flood: 32, wildfire: 28, temperature: 15, tornado: 3, hurricane: 0 }, overallRisk: 28, riskLevel: 'moderate', elevation: 175, floodZone: false, wildfireZone: false },
  { zip: '30301', city: 'Atlanta', state: 'GA', region: 'southeast', climateZone: 'subtropical', latitude: 33.75, longitude: -84.39, avgHumidity: 67, avgTempF: 62, annualRainfallInches: 50, riskScores: { humidity: 62, flood: 42, wildfire: 15, temperature: 48, tornado: 38, hurricane: 25 }, overallRisk: 42, riskLevel: 'elevated', elevation: 1050, floodZone: false, wildfireZone: false },
  { zip: '02101', city: 'Boston', state: 'MA', region: 'northeast', climateZone: 'continental', latitude: 42.36, longitude: -71.06, avgHumidity: 64, avgTempF: 51, annualRainfallInches: 44, riskScores: { humidity: 58, flood: 52, wildfire: 4, temperature: 38, tornado: 5, hurricane: 32 }, overallRisk: 38, riskLevel: 'moderate', elevation: 20, floodZone: true, wildfireZone: false },
  { zip: '70112', city: 'New Orleans', state: 'LA', region: 'gulf-coast', climateZone: 'subtropical', latitude: 29.95, longitude: -90.07, avgHumidity: 78, avgTempF: 69, annualRainfallInches: 64, riskScores: { humidity: 90, flood: 95, wildfire: 3, temperature: 58, tornado: 28, hurricane: 88 }, overallRisk: 82, riskLevel: 'critical', elevation: -2, floodZone: true, wildfireZone: false },
  { zip: '94102', city: 'San Francisco', state: 'CA', region: 'west', climateZone: 'mediterranean', latitude: 37.78, longitude: -122.42, avgHumidity: 72, avgTempF: 57, annualRainfallInches: 20, riskScores: { humidity: 58, flood: 22, wildfire: 35, temperature: 12, tornado: 1, hurricane: 0 }, overallRisk: 22, riskLevel: 'moderate', elevation: 52, floodZone: false, wildfireZone: false },
  { zip: '73301', city: 'Austin', state: 'TX', region: 'southwest', climateZone: 'subtropical', latitude: 30.27, longitude: -97.74, avgHumidity: 62, avgTempF: 68, annualRainfallInches: 34, riskScores: { humidity: 55, flood: 52, wildfire: 32, temperature: 65, tornado: 32, hurricane: 18 }, overallRisk: 45, riskLevel: 'elevated', elevation: 489, floodZone: true, wildfireZone: true },
  { zip: '48201', city: 'Detroit', state: 'MI', region: 'midwest', climateZone: 'continental', latitude: 42.33, longitude: -83.05, avgHumidity: 66, avgTempF: 49, annualRainfallInches: 34, riskScores: { humidity: 55, flood: 35, wildfire: 2, temperature: 42, tornado: 25, hurricane: 1 }, overallRisk: 30, riskLevel: 'moderate', elevation: 600, floodZone: false, wildfireZone: false },
  { zip: '89101', city: 'Las Vegas', state: 'NV', region: 'southwest', climateZone: 'arid', latitude: 36.17, longitude: -115.14, avgHumidity: 18, avgTempF: 68, annualRainfallInches: 4, riskScores: { humidity: 5, flood: 12, wildfire: 25, temperature: 88, tornado: 3, hurricane: 0 }, overallRisk: 22, riskLevel: 'moderate', elevation: 2001, floodZone: false, wildfireZone: false },
  { zip: '37201', city: 'Nashville', state: 'TN', region: 'southeast', climateZone: 'subtropical', latitude: 36.17, longitude: -86.78, avgHumidity: 66, avgTempF: 59, annualRainfallInches: 47, riskScores: { humidity: 58, flood: 55, wildfire: 8, temperature: 45, tornado: 48, hurricane: 12 }, overallRisk: 42, riskLevel: 'elevated', elevation: 597, floodZone: true, wildfireZone: false },
  { zip: '55401', city: 'Minneapolis', state: 'MN', region: 'midwest', climateZone: 'continental', latitude: 44.98, longitude: -93.27, avgHumidity: 63, avgTempF: 45, annualRainfallInches: 31, riskScores: { humidity: 50, flood: 32, wildfire: 5, temperature: 52, tornado: 38, hurricane: 0 }, overallRisk: 32, riskLevel: 'moderate', elevation: 830, floodZone: false, wildfireZone: false },
  { zip: '28201', city: 'Charlotte', state: 'NC', region: 'southeast', climateZone: 'subtropical', latitude: 35.23, longitude: -80.84, avgHumidity: 64, avgTempF: 60, annualRainfallInches: 43, riskScores: { humidity: 55, flood: 38, wildfire: 12, temperature: 42, tornado: 22, hurricane: 28 }, overallRisk: 35, riskLevel: 'moderate', elevation: 751, floodZone: false, wildfireZone: false },
  { zip: '97201', city: 'Portland', state: 'OR', region: 'pacific-northwest', climateZone: 'oceanic', latitude: 45.52, longitude: -122.67, avgHumidity: 75, avgTempF: 53, annualRainfallInches: 43, riskScores: { humidity: 70, flood: 28, wildfire: 38, temperature: 18, tornado: 2, hurricane: 0 }, overallRisk: 28, riskLevel: 'moderate', elevation: 50, floodZone: false, wildfireZone: true },
  { zip: '32801', city: 'Orlando', state: 'FL', region: 'southeast', climateZone: 'subtropical', latitude: 28.54, longitude: -81.38, avgHumidity: 74, avgTempF: 73, annualRainfallInches: 50, riskScores: { humidity: 78, flood: 55, wildfire: 18, temperature: 62, tornado: 15, hurricane: 72 }, overallRisk: 58, riskLevel: 'elevated', elevation: 82, floodZone: true, wildfireZone: false },
  { zip: '15201', city: 'Pittsburgh', state: 'PA', region: 'northeast', climateZone: 'continental', latitude: 40.44, longitude: -80.00, avgHumidity: 65, avgTempF: 51, annualRainfallInches: 38, riskScores: { humidity: 52, flood: 42, wildfire: 3, temperature: 35, tornado: 12, hurricane: 5 }, overallRisk: 28, riskLevel: 'moderate', elevation: 1223, floodZone: false, wildfireZone: false },
  { zip: '84101', city: 'Salt Lake City', state: 'UT', region: 'mountain', climateZone: 'arid', latitude: 40.76, longitude: -111.89, avgHumidity: 38, avgTempF: 52, annualRainfallInches: 16, riskScores: { humidity: 18, flood: 15, wildfire: 45, temperature: 42, tornado: 5, hurricane: 0 }, overallRisk: 22, riskLevel: 'moderate', elevation: 4226, floodZone: false, wildfireZone: true },
  { zip: '46201', city: 'Indianapolis', state: 'IN', region: 'midwest', climateZone: 'continental', latitude: 39.77, longitude: -86.16, avgHumidity: 66, avgTempF: 52, annualRainfallInches: 42, riskScores: { humidity: 55, flood: 35, wildfire: 3, temperature: 40, tornado: 48, hurricane: 2 }, overallRisk: 35, riskLevel: 'moderate', elevation: 715, floodZone: false, wildfireZone: false },
  { zip: '63101', city: 'St. Louis', state: 'MO', region: 'midwest', climateZone: 'continental', latitude: 38.63, longitude: -90.20, avgHumidity: 67, avgTempF: 56, annualRainfallInches: 41, riskScores: { humidity: 58, flood: 52, wildfire: 4, temperature: 48, tornado: 55, hurricane: 3 }, overallRisk: 42, riskLevel: 'elevated', elevation: 466, floodZone: true, wildfireZone: false },
  { zip: '78201', city: 'San Antonio', state: 'TX', region: 'southwest', climateZone: 'subtropical', latitude: 29.42, longitude: -98.49, avgHumidity: 60, avgTempF: 70, annualRainfallInches: 32, riskScores: { humidity: 50, flood: 48, wildfire: 25, temperature: 68, tornado: 22, hurricane: 15 }, overallRisk: 40, riskLevel: 'elevated', elevation: 650, floodZone: true, wildfireZone: false },
  { zip: '99501', city: 'Anchorage', state: 'AK', region: 'pacific-northwest', climateZone: 'polar', latitude: 61.22, longitude: -149.90, avgHumidity: 68, avgTempF: 37, annualRainfallInches: 16, riskScores: { humidity: 45, flood: 18, wildfire: 15, temperature: 72, tornado: 0, hurricane: 0 }, overallRisk: 25, riskLevel: 'moderate', elevation: 102, floodZone: false, wildfireZone: false },
  { zip: '96801', city: 'Honolulu', state: 'HI', region: 'west', climateZone: 'tropical', latitude: 21.31, longitude: -157.86, avgHumidity: 73, avgTempF: 77, annualRainfallInches: 18, riskScores: { humidity: 72, flood: 28, wildfire: 8, temperature: 42, tornado: 0, hurricane: 55 }, overallRisk: 38, riskLevel: 'moderate', elevation: 18, floodZone: false, wildfireZone: false },
  { zip: '43201', city: 'Columbus', state: 'OH', region: 'midwest', climateZone: 'continental', latitude: 39.96, longitude: -82.99, avgHumidity: 66, avgTempF: 52, annualRainfallInches: 39, riskScores: { humidity: 55, flood: 32, wildfire: 2, temperature: 38, tornado: 35, hurricane: 2 }, overallRisk: 30, riskLevel: 'moderate', elevation: 902, floodZone: false, wildfireZone: false },
  { zip: '29401', city: 'Charleston', state: 'SC', region: 'southeast', climateZone: 'subtropical', latitude: 32.78, longitude: -79.93, avgHumidity: 72, avgTempF: 65, annualRainfallInches: 51, riskScores: { humidity: 75, flood: 72, wildfire: 10, temperature: 52, tornado: 18, hurricane: 68 }, overallRisk: 58, riskLevel: 'elevated', elevation: 20, floodZone: true, wildfireZone: false },
  { zip: '87501', city: 'Santa Fe', state: 'NM', region: 'mountain', climateZone: 'arid', latitude: 35.69, longitude: -105.94, avgHumidity: 28, avgTempF: 50, annualRainfallInches: 14, riskScores: { humidity: 8, flood: 10, wildfire: 55, temperature: 42, tornado: 5, hurricane: 0 }, overallRisk: 20, riskLevel: 'moderate', elevation: 7199, floodZone: false, wildfireZone: true },
  { zip: '19101', city: 'Philadelphia', state: 'PA', region: 'northeast', climateZone: 'continental', latitude: 39.95, longitude: -75.16, avgHumidity: 64, avgTempF: 55, annualRainfallInches: 42, riskScores: { humidity: 55, flood: 48, wildfire: 3, temperature: 38, tornado: 8, hurricane: 22 }, overallRisk: 35, riskLevel: 'moderate', elevation: 39, floodZone: true, wildfireZone: false },
  { zip: '33401', city: 'West Palm Beach', state: 'FL', region: 'southeast', climateZone: 'tropical', latitude: 26.72, longitude: -80.05, avgHumidity: 75, avgTempF: 76, annualRainfallInches: 60, riskScores: { humidity: 85, flood: 78, wildfire: 5, temperature: 68, tornado: 18, hurricane: 90 }, overallRisk: 75, riskLevel: 'high', elevation: 21, floodZone: true, wildfireZone: false },
  { zip: '35201', city: 'Birmingham', state: 'AL', region: 'southeast', climateZone: 'subtropical', latitude: 33.52, longitude: -86.81, avgHumidity: 68, avgTempF: 63, annualRainfallInches: 53, riskScores: { humidity: 62, flood: 45, wildfire: 10, temperature: 50, tornado: 62, hurricane: 18 }, overallRisk: 45, riskLevel: 'elevated', elevation: 644, floodZone: false, wildfireZone: false },
];

// ---- Mock Data: Material Vulnerabilities (8+) ----

const materialVulnerabilities: MaterialVulnerability[] = [
  {
    material: 'vintage-cardboard',
    displayName: 'Vintage Cardboard (Pre-1980)',
    humidityTolerance: 15,
    heatTolerance: 25,
    floodSurvivability: 5,
    fireSurvivability: 3,
    windDamageTolerance: 30,
    uvResistance: 20,
    overallDurability: 16,
    optimalTempRange: [62, 72],
    optimalHumidityRange: [35, 45],
    degradationRatePerYear: 2.8,
    replacementCostMultiplier: 5.2,
    notes: 'Extremely sensitive to moisture. Acid-free storage mandatory. Foxing and browning accelerate in humid conditions.',
  },
  {
    material: 'modern-chrome',
    displayName: 'Modern Chrome/Glossy',
    humidityTolerance: 55,
    heatTolerance: 60,
    floodSurvivability: 25,
    fireSurvivability: 8,
    windDamageTolerance: 65,
    uvResistance: 45,
    overallDurability: 43,
    optimalTempRange: [60, 78],
    optimalHumidityRange: [30, 55],
    degradationRatePerYear: 0.8,
    replacementCostMultiplier: 1.0,
    notes: 'Relatively durable but chrome finish can delaminate under prolonged heat exposure.',
  },
  {
    material: 'acetate',
    displayName: 'Acetate / Transparent',
    humidityTolerance: 30,
    heatTolerance: 20,
    floodSurvivability: 15,
    fireSurvivability: 5,
    windDamageTolerance: 40,
    uvResistance: 15,
    overallDurability: 21,
    optimalTempRange: [60, 70],
    optimalHumidityRange: [30, 45],
    degradationRatePerYear: 2.2,
    replacementCostMultiplier: 3.8,
    notes: 'Vinegar syndrome risk in unstable storage. Warping and clouding in heat. Store in cool, dark environments.',
  },
  {
    material: 'patch-cards',
    displayName: 'Game-Used Patch / Relic',
    humidityTolerance: 20,
    heatTolerance: 30,
    floodSurvivability: 8,
    fireSurvivability: 5,
    windDamageTolerance: 35,
    uvResistance: 25,
    overallDurability: 20,
    optimalTempRange: [60, 72],
    optimalHumidityRange: [35, 50],
    degradationRatePerYear: 2.5,
    replacementCostMultiplier: 4.5,
    notes: 'Embedded fabric degrades with moisture. Mold risk is significant. Jersey swatches can discolor or rot.',
  },
  {
    material: 'refractor',
    displayName: 'Refractor / Prizm',
    humidityTolerance: 50,
    heatTolerance: 45,
    floodSurvivability: 20,
    fireSurvivability: 7,
    windDamageTolerance: 55,
    uvResistance: 52,
    overallDurability: 38,
    optimalTempRange: [58, 76],
    optimalHumidityRange: [30, 55],
    degradationRatePerYear: 1.0,
    replacementCostMultiplier: 2.2,
    notes: 'Refractor coating can degrade under UV. Generally robust but scratches more easily when warped from heat.',
  },
  {
    material: 'canvas-texture',
    displayName: 'Canvas / Textured Surface',
    humidityTolerance: 25,
    heatTolerance: 35,
    floodSurvivability: 10,
    fireSurvivability: 6,
    windDamageTolerance: 45,
    uvResistance: 30,
    overallDurability: 25,
    optimalTempRange: [60, 74],
    optimalHumidityRange: [35, 50],
    degradationRatePerYear: 1.8,
    replacementCostMultiplier: 2.0,
    notes: 'Textured surface traps moisture. Susceptible to mold growth in corners. Canvas can warp and buckle.',
  },
  {
    material: 'metal-frame',
    displayName: 'Metal Frame / Encased',
    humidityTolerance: 70,
    heatTolerance: 75,
    floodSurvivability: 60,
    fireSurvivability: 55,
    windDamageTolerance: 85,
    uvResistance: 65,
    overallDurability: 68,
    optimalTempRange: [40, 90],
    optimalHumidityRange: [20, 65],
    degradationRatePerYear: 0.3,
    replacementCostMultiplier: 3.0,
    notes: 'Highly durable but metal can corrode in salt air or extreme humidity. Interior card still vulnerable if seal fails.',
  },
  {
    material: 'silk-finish',
    displayName: 'Silk / Linen Finish',
    humidityTolerance: 22,
    heatTolerance: 32,
    floodSurvivability: 8,
    fireSurvivability: 4,
    windDamageTolerance: 38,
    uvResistance: 28,
    overallDurability: 22,
    optimalTempRange: [62, 72],
    optimalHumidityRange: [35, 48],
    degradationRatePerYear: 2.0,
    replacementCostMultiplier: 2.8,
    notes: 'Delicate surface absorbs moisture readily. Staining is common in sub-optimal conditions. Handle with gloves only.',
  },
];

// ---- Mock Data: Vault Ratings ----

const vaultRatings: VaultRating[] = [
  { id: 'v1', name: 'Iron Mountain Sports Vault', location: 'Boyers, PA', zip: '16020', tier: 'platinum', climateScore: 98, humidityControl: true, temperatureControl: true, floodProtection: true, fireProtection: true, backupPower: true, insuranceCoverage: 5000000, monthlyCostPer100Cards: 89, capacityUtilization: 72, customerRating: 4.9, certifications: ['ISO 27001', 'SOC 2', 'NFPA 232'] },
  { id: 'v2', name: 'PWCC Vault', location: 'Portland, OR', zip: '97201', tier: 'platinum', climateScore: 95, humidityControl: true, temperatureControl: true, floodProtection: true, fireProtection: true, backupPower: true, insuranceCoverage: 10000000, monthlyCostPer100Cards: 95, capacityUtilization: 85, customerRating: 4.8, certifications: ['SOC 2', 'Lloyds Insured'] },
  { id: 'v3', name: 'PSA Vault Services', location: 'Santa Ana, CA', zip: '92701', tier: 'gold', climateScore: 88, humidityControl: true, temperatureControl: true, floodProtection: true, fireProtection: true, backupPower: true, insuranceCoverage: 2000000, monthlyCostPer100Cards: 65, capacityUtilization: 90, customerRating: 4.5, certifications: ['SOC 2'] },
  { id: 'v4', name: 'Goldin Secure Storage', location: 'Runnemede, NJ', zip: '08078', tier: 'gold', climateScore: 85, humidityControl: true, temperatureControl: true, floodProtection: false, fireProtection: true, backupPower: true, insuranceCoverage: 3000000, monthlyCostPer100Cards: 72, capacityUtilization: 78, customerRating: 4.6, certifications: ['SOC 2', 'ADA Certified'] },
  { id: 'v5', name: 'Collectors Vault Denver', location: 'Denver, CO', zip: '80202', tier: 'gold', climateScore: 90, humidityControl: true, temperatureControl: true, floodProtection: true, fireProtection: true, backupPower: false, insuranceCoverage: 1000000, monthlyCostPer100Cards: 55, capacityUtilization: 62, customerRating: 4.4, certifications: ['NFPA 232'] },
  { id: 'v6', name: 'Heritage Vault Dallas', location: 'Dallas, TX', zip: '75201', tier: 'silver', climateScore: 78, humidityControl: true, temperatureControl: true, floodProtection: false, fireProtection: true, backupPower: true, insuranceCoverage: 1500000, monthlyCostPer100Cards: 48, capacityUtilization: 55, customerRating: 4.3, certifications: ['SOC 2'] },
  { id: 'v7', name: 'SafeKeep Atlanta', location: 'Atlanta, GA', zip: '30301', tier: 'silver', climateScore: 72, humidityControl: true, temperatureControl: true, floodProtection: false, fireProtection: true, backupPower: false, insuranceCoverage: 500000, monthlyCostPer100Cards: 38, capacityUtilization: 48, customerRating: 4.1, certifications: [] },
  { id: 'v8', name: 'CardGuard Phoenix', location: 'Phoenix, AZ', zip: '85001', tier: 'bronze', climateScore: 65, humidityControl: false, temperatureControl: true, floodProtection: false, fireProtection: true, backupPower: false, insuranceCoverage: 250000, monthlyCostPer100Cards: 25, capacityUtilization: 35, customerRating: 3.8, certifications: [] },
];

// ---- Service Functions ----

export function getZipCodeRisk(zip: string): ZipCodeProfile | null {
  return zipCodeProfiles.find(p => p.zip === zip) ?? null;
}

export function getAllZipProfiles(): ZipCodeProfile[] {
  return zipCodeProfiles;
}

export function getClimateProjection(zip: string, years: number): ClimateProjection | null {
  const profile = zipCodeProfiles.find(p => p.zip === zip);
  if (!profile) return null;

  const projections = [];
  const currentYear = 2026;
  for (let i = 0; i <= years; i++) {
    const yearOffset = i;
    const tempIncrease = yearOffset * 0.35;
    const humidityShift = yearOffset * 0.2;
    projections.push({
      year: currentYear + i,
      avgTempF: Math.round((profile.avgTempF + tempIncrease) * 10) / 10,
      avgHumidity: Math.min(95, Math.round((profile.avgHumidity + humidityShift) * 10) / 10),
      floodRisk: Math.min(100, Math.round(profile.riskScores.flood + yearOffset * 1.8)),
      wildfireRisk: Math.min(100, Math.round(profile.riskScores.wildfire + yearOffset * 1.5)),
      overallRisk: Math.min(100, Math.round(profile.overallRisk + yearOffset * 1.2)),
      seaLevelRiseInches: Math.round(yearOffset * 0.13 * 10) / 10,
      extremeHeatDays: Math.round(12 + yearOffset * 2.5),
    });
  }

  const endRisk = projections[projections.length - 1].overallRisk;
  const riskChange = endRisk - profile.overallRisk;

  return {
    zip,
    city: profile.city,
    years,
    projections,
    summary: `${profile.city} is projected to see a ${riskChange}-point increase in overall climate risk over the next ${years} years, driven primarily by rising temperatures and shifting precipitation patterns.`,
    recommendedAction: endRisk > 70
      ? 'Strongly consider relocating high-value cards to a climate-controlled vault in a lower-risk zone.'
      : endRisk > 50
        ? 'Invest in enhanced home storage with humidity and temperature controls.'
        : 'Current storage conditions should remain adequate with standard precautions.',
  };
}

export function getMaterialVulnerability(material: MaterialType): MaterialVulnerability | null {
  return materialVulnerabilities.find(m => m.material === material) ?? null;
}

export function getAllMaterialVulnerabilities(): MaterialVulnerability[] {
  return materialVulnerabilities;
}

export function getRelocationRecommendations(): RelocationRecommendation[] {
  const highRiskZips = zipCodeProfiles.filter(p => p.overallRisk >= 55);
  const lowRiskZips = zipCodeProfiles.filter(p => p.overallRisk <= 30).sort((a, b) => a.overallRisk - b.overallRisk);

  return highRiskZips.slice(0, 6).map((from) => {
    const to = lowRiskZips[Math.floor(Math.random() * Math.min(3, lowRiskZips.length))];
    const reduction = from.overallRisk - to.overallRisk;
    return {
      fromZip: from.zip,
      toZip: to.zip,
      fromCity: `${from.city}, ${from.state}`,
      toCity: `${to.city}, ${to.state}`,
      riskReduction: reduction,
      costSavingsPercent: Math.round(reduction * 0.6),
      distanceMiles: Math.round(Math.abs(from.latitude - to.latitude) * 69 + Math.abs(from.longitude - to.longitude) * 55),
      reasoning: `Moving from ${from.city} (risk ${from.overallRisk}) to ${to.city} (risk ${to.overallRisk}) eliminates exposure to ${from.floodZone ? 'flood zones' : from.wildfireZone ? 'wildfire zones' : 'severe weather patterns'}.`,
      overallRiskBefore: from.overallRisk,
      overallRiskAfter: to.overallRisk,
    };
  });
}

export function getVaultRatings(): VaultRating[] {
  return vaultRatings;
}

export function getSeasonalRisk(zip: string): SeasonalRiskProfile | null {
  const profile = zipCodeProfiles.find(p => p.zip === zip);
  if (!profile) return null;

  const baseHumidity = profile.avgHumidity;
  const baseTemp = profile.avgTempF;

  // Seasonal variation curves
  const tempVariation = [
    -18, -14, -5, 5, 14, 20, 24, 22, 14, 4, -6, -15
  ];
  const humidityVariation = [
    -5, -3, 2, 5, 8, 12, 15, 14, 8, 2, -2, -4
  ];

  const monthly = MONTHS.map((month, i) => {
    const temp = Math.round(baseTemp + tempVariation[i]);
    const humidity = Math.max(10, Math.min(98, Math.round(baseHumidity + humidityVariation[i])));
    const isHurricaneSeason = i >= 5 && i <= 10;
    const isTornadoSeason = i >= 2 && i <= 6;
    const isWildfireSeason = i >= 5 && i <= 9;

    return {
      month,
      humidity,
      avgTempF: temp,
      precipitationInches: Math.round((profile.annualRainfallInches / 12) * (1 + (humidityVariation[i] / 20)) * 10) / 10,
      tornadoRisk: Math.round(profile.riskScores.tornado * (isTornadoSeason ? 1.6 : 0.3)),
      hurricaneRisk: Math.round(profile.riskScores.hurricane * (isHurricaneSeason ? 1.8 : 0.05)),
      floodRisk: Math.round(Math.min(100, profile.riskScores.flood * (1 + humidityVariation[i] / 40))),
      wildfireRisk: Math.round(profile.riskScores.wildfire * (isWildfireSeason ? 1.5 : 0.4)),
      overallRisk: Math.min(100, Math.round(profile.overallRisk * (1 + (humidityVariation[i] + Math.abs(tempVariation[i])) / 80))),
    };
  });

  return { zip, city: profile.city, monthly };
}

export function getDamageProjection(material: MaterialType = 'vintage-cardboard', zip: string = '33101', yearsProjected: number = 10): DamageModel {
  const profile = zipCodeProfiles.find(p => p.zip === zip) ?? zipCodeProfiles[0];
  const mat = materialVulnerabilities.find(m => m.material === material) ?? materialVulnerabilities[0];

  const riskMultiplier = profile.overallRisk / 50; // normalized around 1.0
  const baseRate = mat.degradationRatePerYear * riskMultiplier;

  const projectedDamage = [];
  let cumulative = 0;
  for (let y = 1; y <= yearsProjected; y++) {
    const yearLoss = baseRate * (1 + y * 0.05); // accelerating degradation
    cumulative += yearLoss;
    projectedDamage.push({
      year: y,
      conditionLoss: Math.round(yearLoss * 10) / 10,
      valueLoss: Math.round(yearLoss * mat.replacementCostMultiplier * 10) / 10,
      cumulativeLoss: Math.round(cumulative * 10) / 10,
    });
  }

  return {
    material,
    zip,
    yearsProjected,
    projectedDamage,
    totalValueAtRisk: Math.round(cumulative * mat.replacementCostMultiplier * 100) / 100,
    mitigationSavings: Math.round(cumulative * mat.replacementCostMultiplier * 0.65 * 100) / 100,
  };
}

export function getTopRiskZones(): ZipCodeProfile[] {
  return [...zipCodeProfiles].sort((a, b) => b.overallRisk - a.overallRisk).slice(0, 10);
}

export function getStorageOptimization(zip: string = '33101'): StorageOptimization {
  const profile = zipCodeProfiles.find(p => p.zip === zip) ?? zipCodeProfiles[1];
  const currentRisk = profile.overallRisk;

  const recommendations = [
    { category: 'Humidity Control', action: 'Install a dehumidifier maintaining 35-45% relative humidity', impact: Math.min(30, Math.round(profile.riskScores.humidity * 0.4)), cost: '$150-$400', priority: profile.riskScores.humidity > 60 ? 'critical' as const : 'high' as const },
    { category: 'Temperature Regulation', action: 'Use climate-controlled storage room at 65-72F', impact: Math.min(25, Math.round(profile.riskScores.temperature * 0.35)), cost: '$50-$200/mo', priority: profile.riskScores.temperature > 60 ? 'critical' as const : 'medium' as const },
    { category: 'Flood Mitigation', action: 'Elevate storage above ground level; use waterproof containers', impact: Math.min(35, Math.round(profile.riskScores.flood * 0.45)), cost: '$200-$800', priority: profile.floodZone ? 'critical' as const : 'low' as const },
    { category: 'Fire Protection', action: 'Install fire-rated safe or suppression system for high-value cards', impact: Math.min(20, Math.round(profile.riskScores.wildfire * 0.3)), cost: '$500-$3,000', priority: profile.wildfireZone ? 'critical' as const : 'low' as const },
    { category: 'UV Protection', action: 'Use UV-filtering sleeves and store away from direct sunlight', impact: 12, cost: '$30-$80', priority: 'medium' as const },
    { category: 'Archival Supplies', action: 'Switch to acid-free penny sleeves and top-loaders', impact: 8, cost: '$20-$50', priority: 'high' as const },
    { category: 'Insurance', action: 'Obtain specialized collectibles insurance covering climate events', impact: 0, cost: '$15-$60/mo', priority: 'high' as const },
    { category: 'Vault Transfer', action: 'Move high-value items ($500+) to certified vault storage', impact: Math.min(40, Math.round(currentRisk * 0.5)), cost: '$50-$100/mo', priority: currentRisk > 50 ? 'critical' as const : 'medium' as const },
  ];

  const totalImpact = recommendations.reduce((sum, r) => sum + r.impact, 0);
  const projectedRisk = Math.max(5, currentRisk - Math.min(totalImpact, currentRisk * 0.7));

  return {
    currentZip: profile.zip,
    currentRisk,
    recommendations: recommendations.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return order[a.priority] - order[b.priority];
    }),
    projectedRiskAfter: Math.round(projectedRisk),
    estimatedSavingsPercent: Math.round(((currentRisk - projectedRisk) / currentRisk) * 100),
  };
}

export function compareLocations(zip1: string, zip2: string): LocationComparison | null {
  const p1 = zipCodeProfiles.find(p => p.zip === zip1);
  const p2 = zipCodeProfiles.find(p => p.zip === zip2);
  if (!p1 || !p2) return null;

  const factors: RiskFactor[] = ['humidity', 'flood', 'wildfire', 'temperature', 'tornado', 'hurricane'];

  const factorComparison = factors.map(factor => ({
    factor,
    zip1Score: p1.riskScores[factor],
    zip2Score: p2.riskScores[factor],
    difference: p1.riskScores[factor] - p2.riskScores[factor],
    winner: p1.riskScores[factor] <= p2.riskScores[factor] ? `${p1.city}, ${p1.state}` : `${p2.city}, ${p2.state}`,
  }));

  const better = p1.overallRisk <= p2.overallRisk ? p1 : p2;
  const worse = p1.overallRisk <= p2.overallRisk ? p2 : p1;

  return {
    zip1: p1,
    zip2: p2,
    riskDifference: Math.abs(p1.overallRisk - p2.overallRisk),
    betterLocation: `${better.city}, ${better.state}`,
    factorComparison,
    recommendation: `${better.city} is the safer storage location with an overall risk score ${Math.abs(p1.overallRisk - p2.overallRisk)} points lower than ${worse.city}. Key advantages include ${factorComparison.filter(f => f.winner === `${better.city}, ${better.state}`).map(f => `lower ${f.factor} risk`).slice(0, 3).join(', ')}.`,
  };
}

export function getRiskByRegion(): { region: Region; avgRisk: number; count: number; topRisk: RiskFactor }[] {
  const regions: Region[] = ['northeast', 'southeast', 'midwest', 'southwest', 'west', 'pacific-northwest', 'mountain', 'gulf-coast'];
  return regions.map(region => {
    const profiles = zipCodeProfiles.filter(p => p.region === region);
    const avgRisk = Math.round(profiles.reduce((s, p) => s + p.overallRisk, 0) / (profiles.length || 1));
    const factors: RiskFactor[] = ['humidity', 'flood', 'wildfire', 'temperature', 'tornado', 'hurricane'];
    const avgFactors = factors.map(f => ({
      factor: f,
      avg: profiles.reduce((s, p) => s + p.riskScores[f], 0) / (profiles.length || 1),
    }));
    const topRisk = avgFactors.sort((a, b) => b.avg - a.avg)[0].factor;
    return { region, avgRisk, count: profiles.length, topRisk };
  });
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#22c55e',
  moderate: '#eab308',
  elevated: '#f97316',
  high: '#ef4444',
  critical: '#dc2626',
};

export { riskLevel };
