// Generational Demand Forecaster — Phase 233
// 10-25 year demographic-driven demand projection modeling

export interface GenerationalForecast {
  id: string;
  player: string;
  cardType: string;
  currentValue: number;
  projections: YearProjection[];
  primaryDrivers: string[];
  riskFactors: string[];
  confidenceBand: 'high' | 'medium' | 'low';
  narrative: string;
}

export interface YearProjection {
  year: number;
  projectedValue: number;
  lowBound: number;
  highBound: number;
  keyEvent: string;
  demandDrivers: { cohort: string; influence: number }[];
}

export interface DemographicShift {
  id: string;
  name: string;
  timeframe: string;
  description: string;
  magnitude: number;
  affectedCategories: string[];
  direction: 'bullish' | 'bearish' | 'mixed';
  probability: number;
}

export interface WealthTransferEvent {
  id: string;
  name: string;
  estimatedValue: number;
  peakYear: number;
  sourceGeneration: string;
  beneficiaryGeneration: string;
  collectibleAllocation: number;
  impactOnCards: string;
}

export interface CulturalCycle {
  id: string;
  cycleName: string;
  currentPhase: 'emergence' | 'growth' | 'peak' | 'decline' | 'dormant' | 'revival';
  periodYears: number;
  nextPeakEstimate: string;
  affectedEras: string[];
  intensityScore: number;
}

const MOCK_FORECASTS: GenerationalForecast[] = [
  { id: 'gf-1', player: 'Mickey Mantle', cardType: '1952 Topps #311 PSA 5', currentValue: 185000, projections: [
    { year: 2028, projectedValue: 195000, lowBound: 170000, highBound: 225000, keyEvent: 'Peak boomer estate liquidation begins', demandDrivers: [{ cohort: 'Boomer', influence: -15 }, { cohort: 'Institutional', influence: 20 }] },
    { year: 2031, projectedValue: 175000, lowBound: 140000, highBound: 210000, keyEvent: 'Major supply wave from estate releases', demandDrivers: [{ cohort: 'Boomer', influence: -30 }, { cohort: 'Institutional', influence: 25 }, { cohort: 'Gen X', influence: 10 }] },
    { year: 2036, projectedValue: 210000, lowBound: 160000, highBound: 280000, keyEvent: 'Supply absorbed; institutional floor established', demandDrivers: [{ cohort: 'Institutional', influence: 35 }, { cohort: 'Gen X', influence: 15 }, { cohort: 'Museum/Cultural', influence: 20 }] },
    { year: 2041, projectedValue: 260000, lowBound: 180000, highBound: 360000, keyEvent: 'Cultural artifact status — 90th anniversary of card', demandDrivers: [{ cohort: 'Institutional', influence: 40 }, { cohort: 'Museum/Cultural', influence: 30 }] },
    { year: 2051, projectedValue: 350000, lowBound: 200000, highBound: 550000, keyEvent: '100th anniversary — peak cultural significance', demandDrivers: [{ cohort: 'Institutional', influence: 45 }, { cohort: 'Museum/Cultural', influence: 35 }] },
  ], primaryDrivers: ['Institutional floor-setting', 'Cultural artifact status', 'Finite supply'], riskFactors: ['Massive estate liquidation wave 2028-2035', 'Generational relevance decline', 'Authentication challenges with age'], confidenceBand: 'medium', narrative: 'The Mantle \'52 Topps will face a critical supply shock as boomer estates liquidate, but institutional and museum demand should establish a floor. Long-term, cultural artifact status protects value.' },
  { id: 'gf-2', player: 'LeBron James', cardType: '2003 Topps Chrome RC PSA 10', currentValue: 42000, projections: [
    { year: 2028, projectedValue: 55000, lowBound: 40000, highBound: 72000, keyEvent: 'LeBron retirement announcement premium', demandDrivers: [{ cohort: 'Millennial', influence: 35 }, { cohort: 'Gen Z', influence: 20 }] },
    { year: 2031, projectedValue: 68000, lowBound: 48000, highBound: 95000, keyEvent: 'HOF induction — peak nostalgia moment', demandDrivers: [{ cohort: 'Millennial', influence: 40 }, { cohort: 'Gen X', influence: 15 }, { cohort: 'Institutional', influence: 20 }] },
    { year: 2036, projectedValue: 85000, lowBound: 55000, highBound: 130000, keyEvent: 'Millennial peak earning years + nostalgia', demandDrivers: [{ cohort: 'Millennial', influence: 45 }, { cohort: 'Institutional', influence: 25 }] },
    { year: 2041, projectedValue: 72000, lowBound: 45000, highBound: 110000, keyEvent: 'Post-peak — generational attention shifts', demandDrivers: [{ cohort: 'Millennial', influence: 30 }, { cohort: 'Institutional', influence: 20 }] },
    { year: 2051, projectedValue: 90000, lowBound: 50000, highBound: 150000, keyEvent: 'Legacy crystallization — GOAT debate settled', demandDrivers: [{ cohort: 'Millennial', influence: 25 }, { cohort: 'Gen Alpha', influence: 15 }, { cohort: 'Institutional', influence: 30 }] },
  ], primaryDrivers: ['GOAT-tier legacy', 'Millennial peak wealth timing', 'Cultural transcendence'], riskFactors: ['Pop count growing (supply risk)', 'Successor players may dilute attention', 'Market saturation at lower grades'], confidenceBand: 'high', narrative: 'LeBron\'s RC trajectory follows the Jordan blueprint: retirement bump, HOF spike, then millennial nostalgia premium. High PSA 10 pop limits upside but GOAT status provides a resilient floor.' },
  { id: 'gf-3', player: 'Caitlin Clark', cardType: '2024 Prizm WNBA RC PSA 10', currentValue: 850, projections: [
    { year: 2028, projectedValue: 1400, lowBound: 600, highBound: 2800, keyEvent: 'WNBA viewership growth + Olympic gold', demandDrivers: [{ cohort: 'Female Collectors', influence: 40 }, { cohort: 'Gen Z', influence: 30 }] },
    { year: 2031, projectedValue: 2200, lowBound: 800, highBound: 4500, keyEvent: 'Female collector cohort hits critical mass', demandDrivers: [{ cohort: 'Female Collectors', influence: 45 }, { cohort: 'Gen Z', influence: 25 }, { cohort: 'Millennial', influence: 15 }] },
    { year: 2036, projectedValue: 3800, lowBound: 1200, highBound: 8000, keyEvent: 'WNBA becomes mainstream investment category', demandDrivers: [{ cohort: 'Female Collectors', influence: 40 }, { cohort: 'Institutional', influence: 20 }, { cohort: 'Gen Alpha', influence: 15 }] },
    { year: 2041, projectedValue: 5500, lowBound: 1500, highBound: 12000, keyEvent: 'Career achievement milestones + retirement', demandDrivers: [{ cohort: 'Female Collectors', influence: 35 }, { cohort: 'Institutional', influence: 25 }, { cohort: 'Nostalgia', influence: 20 }] },
    { year: 2051, projectedValue: 8000, lowBound: 2000, highBound: 18000, keyEvent: 'WNBA GOAT status + generational icon', demandDrivers: [{ cohort: 'Institutional', influence: 30 }, { cohort: 'Cultural Icon', influence: 35 }] },
  ], primaryDrivers: ['Fastest-growing collector cohort (female +42% YoY)', 'Category creation effect', 'Cultural movement tailwind'], riskFactors: ['WNBA market still nascent — liquidity risk', 'Wide confidence bands', 'Performance-dependent trajectory'], confidenceBand: 'low', narrative: 'Caitlin Clark represents a generational bet on the female sports card market. If WNBA collecting reaches critical mass, early positions could see 5-10x returns. High risk, highest upside in the hobby.' },
];

const MOCK_DEMOGRAPHIC_SHIFTS: DemographicShift[] = [
  { id: 'ds-1', name: 'Great Wealth Transfer', timeframe: '2025-2045', description: '$84 trillion transferring from Boomers to Gen X and Millennials — the largest intergenerational wealth transfer in history', magnitude: 95, affectedCategories: ['vintage', 'pre-war', 'estate collections', 'trophy cards'], direction: 'mixed', probability: 98 },
  { id: 'ds-2', name: 'Female Collector Surge', timeframe: '2024-2035', description: 'Women entering card collecting at 42% YoY growth, driven by WNBA, Olympic athletes, and community', magnitude: 78, affectedCategories: ['WNBA', 'Olympic cards', 'aesthetic parallels', 'community sets'], direction: 'bullish', probability: 85 },
  { id: 'ds-3', name: 'Gen Z Peak Earning Cycle', timeframe: '2030-2045', description: 'Gen Z reaching peak earning years will drive demand for cards from their formative years (2015-2025)', magnitude: 82, affectedCategories: ['Prizm', 'Optic', 'modern Chrome', 'NBA/NFL rookies'], direction: 'bullish', probability: 88 },
  { id: 'ds-4', name: 'Boomer Market Exit', timeframe: '2026-2040', description: 'Natural attrition of boomer collectors releasing vintage inventory into the market', magnitude: 72, affectedCategories: ['1950s-1960s vintage', 'pre-war tobacco', 'raw vintage'], direction: 'bearish', probability: 95 },
  { id: 'ds-5', name: 'International Collector Growth', timeframe: '2025-2040', description: 'Asian and European collector base growing 25% annually, diversifying demand beyond US-centric cards', magnitude: 68, affectedCategories: ['Ohtani/Japanese players', 'soccer', 'international prospects', 'MLB global stars'], direction: 'bullish', probability: 78 },
];

const MOCK_WEALTH_TRANSFERS: WealthTransferEvent[] = [
  { id: 'wt-1', name: 'Boomer Estate Liquidation Wave', estimatedValue: 4200000000, peakYear: 2032, sourceGeneration: 'Baby Boomer', beneficiaryGeneration: 'Gen X / Millennial', collectibleAllocation: 8.5, impactOnCards: 'Massive supply influx of vintage cards — prices may dip 15-25% before institutional absorption' },
  { id: 'wt-2', name: 'Millennial Inheritance Investment', estimatedValue: 1800000000, peakYear: 2035, sourceGeneration: 'Baby Boomer (via Gen X)', beneficiaryGeneration: 'Millennial', collectibleAllocation: 12.0, impactOnCards: 'Fresh capital entering modern card market — expect 90s nostalgia boom and chrome-era premium expansion' },
  { id: 'wt-3', name: 'Gen Z Digital-Native Allocation', estimatedValue: 850000000, peakYear: 2038, sourceGeneration: 'Gen X', beneficiaryGeneration: 'Gen Z', collectibleAllocation: 15.0, impactOnCards: 'Digital-first generation may prefer fractional/tokenized card ownership over physical' },
];

const MOCK_CULTURAL_CYCLES: CulturalCycle[] = [
  { id: 'cc-1', cycleName: '20-Year Nostalgia Cycle', currentPhase: 'growth', periodYears: 20, nextPeakEstimate: '2028-2030', affectedEras: ['2005-2010 rookies', 'early Chrome era'], intensityScore: 78 },
  { id: 'cc-2', cycleName: '30-Year Nostalgia Cycle', currentPhase: 'peak', periodYears: 30, nextPeakEstimate: '2026-2027 (current)', affectedEras: ['1993-1997 inserts', '90s refractors', 'junk wax gems'], intensityScore: 85 },
  { id: 'cc-3', cycleName: 'HOF Induction Cycle', currentPhase: 'growth', periodYears: 5, nextPeakEstimate: '2026 class announcement', affectedEras: ['Player-specific cards of inductees'], intensityScore: 72 },
  { id: 'cc-4', cycleName: 'Championship Anniversary Cycle', currentPhase: 'emergence', periodYears: 25, nextPeakEstimate: '2031 (Jordan Last Dance 25th)', affectedEras: ['1990s Bulls dynasty', 'Jordan inserts'], intensityScore: 65 },
];

export function getForecasts(): GenerationalForecast[] { return [...MOCK_FORECASTS]; }
export function getDemographicShifts(): DemographicShift[] { return [...MOCK_DEMOGRAPHIC_SHIFTS]; }
export function getWealthTransfers(): WealthTransferEvent[] { return [...MOCK_WEALTH_TRANSFERS]; }
export function getCulturalCycles(): CulturalCycle[] { return [...MOCK_CULTURAL_CYCLES]; }

export default { getForecasts, getDemographicShifts, getWealthTransfers, getCulturalCycles };
