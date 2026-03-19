// Psychographic Demand Modeler — Phase 227
// Buyer demographic cohort modeling and demand prediction by persona

export interface BuyerCohort {
  id: string;
  name: string;
  ageRange: string;
  generation: string;
  estimatedSize: number;
  avgSpend: number;
  growthRate: number;
  topCategories: string[];
  buyingMotivation: string;
  priceElasticity: 'inelastic' | 'moderate' | 'elastic';
  digitalAdoption: number;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  color: string;
}

export interface DemandForecast {
  id: string;
  player: string;
  cardType: string;
  currentDemandIndex: number;
  forecastedDemand6m: number;
  forecastedDemand1y: number;
  primaryCohorts: string[];
  cohortShifts: { cohort: string; direction: 'growing' | 'declining' | 'stable'; magnitude: number }[];
  catalysts: string[];
}

export interface NostalgiaWave {
  id: string;
  era: string;
  yearRange: string;
  peakCohort: string;
  currentIntensity: number;
  projectedPeak: string;
  affectedPlayers: string[];
  priceImpact: number;
}

export interface CohortMigration {
  fromCohort: string;
  toCohort: string;
  volume: number;
  trigger: string;
  timeline: string;
}

const MOCK_COHORTS: BuyerCohort[] = [
  { id: 'c-1', name: 'Gen Z Speculators', ageRange: '18-28', generation: 'Gen Z', estimatedSize: 2800000, avgSpend: 285, growthRate: 24.5, topCategories: ['NBA rookies', 'Prizm parallels', 'WNBA', 'digital'], buyingMotivation: 'Investment returns and social media clout', priceElasticity: 'elastic', digitalAdoption: 97, riskTolerance: 'aggressive', color: '#818cf8' },
  { id: 'c-2', name: 'Millennial Collectors', ageRange: '29-44', generation: 'Millennial', estimatedSize: 4200000, avgSpend: 620, growthRate: 8.2, topCategories: ['90s nostalgia', 'NFL', 'graded rookies', 'autos'], buyingMotivation: 'Nostalgia meets portfolio diversification', priceElasticity: 'moderate', digitalAdoption: 89, riskTolerance: 'moderate', color: '#34d399' },
  { id: 'c-3', name: 'Gen X Power Buyers', ageRange: '45-59', generation: 'Gen X', estimatedSize: 1800000, avgSpend: 1450, growthRate: 3.1, topCategories: ['80s vintage', 'HOF autos', 'high-grade PSA 10s', 'complete sets'], buyingMotivation: 'Collection completion and wealth preservation', priceElasticity: 'inelastic', digitalAdoption: 72, riskTolerance: 'conservative', color: '#f59e0b' },
  { id: 'c-4', name: 'Boomer Vintage Elite', ageRange: '60-78', generation: 'Boomer', estimatedSize: 920000, avgSpend: 2800, growthRate: -4.8, topCategories: ['pre-war', '50s-60s vintage', 'Mantle/Mays/Aaron', 'raw vintage'], buyingMotivation: 'Legacy and passion for the golden era', priceElasticity: 'inelastic', digitalAdoption: 41, riskTolerance: 'conservative', color: '#f87171' },
  { id: 'c-5', name: 'Female Collectors', ageRange: '22-45', generation: 'Cross-Gen', estimatedSize: 1400000, avgSpend: 380, growthRate: 42.1, topCategories: ['WNBA', 'Olympic athletes', 'aesthetic parallels', 'community sets'], buyingMotivation: 'Representation, community, and emerging markets', priceElasticity: 'moderate', digitalAdoption: 91, riskTolerance: 'moderate', color: '#f472b6' },
  { id: 'c-6', name: 'Institutional Investors', ageRange: '35-65', generation: 'Cross-Gen', estimatedSize: 12000, avgSpend: 85000, growthRate: 15.7, topCategories: ['trophy cards', 'PSA 10 rookies', 'sealed wax', 'index funds'], buyingMotivation: 'Alternative asset allocation and alpha generation', priceElasticity: 'inelastic', digitalAdoption: 95, riskTolerance: 'aggressive', color: '#06b6d4' },
];

const MOCK_FORECASTS: DemandForecast[] = [
  { id: 'df-1', player: 'Victor Wembanyama', cardType: 'Prizm RC', currentDemandIndex: 94, forecastedDemand6m: 98, forecastedDemand1y: 91, primaryCohorts: ['Gen Z Speculators', 'Institutional Investors'], cohortShifts: [{ cohort: 'Gen Z Speculators', direction: 'growing', magnitude: 15 }, { cohort: 'Millennial Collectors', direction: 'growing', magnitude: 8 }], catalysts: ['NBA Playoffs performance', 'International media coverage', 'Shoe deal announcement'] },
  { id: 'df-2', player: 'Caitlin Clark', cardType: 'WNBA Prizm RC', currentDemandIndex: 88, forecastedDemand6m: 95, forecastedDemand1y: 92, primaryCohorts: ['Female Collectors', 'Gen Z Speculators'], cohortShifts: [{ cohort: 'Female Collectors', direction: 'growing', magnitude: 28 }, { cohort: 'Gen Z Speculators', direction: 'growing', magnitude: 12 }], catalysts: ['WNBA season start', 'Olympic selection', 'Crossover mainstream appeal'] },
  { id: 'df-3', player: 'Ken Griffey Jr', cardType: '1989 Upper Deck RC', currentDemandIndex: 72, forecastedDemand6m: 78, forecastedDemand1y: 84, primaryCohorts: ['Millennial Collectors', 'Gen X Power Buyers'], cohortShifts: [{ cohort: 'Millennial Collectors', direction: 'growing', magnitude: 18 }, { cohort: 'Gen X Power Buyers', direction: 'stable', magnitude: 2 }], catalysts: ['Millennial peak nostalgia wave (age 38-42)', '30th anniversary celebrations', 'Documentary release'] },
  { id: 'df-4', player: 'Mickey Mantle', cardType: '1952 Topps', currentDemandIndex: 86, forecastedDemand6m: 82, forecastedDemand1y: 76, primaryCohorts: ['Boomer Vintage Elite', 'Institutional Investors'], cohortShifts: [{ cohort: 'Boomer Vintage Elite', direction: 'declining', magnitude: -8 }, { cohort: 'Institutional Investors', direction: 'growing', magnitude: 5 }], catalysts: ['Estate liquidations increasing supply', 'Institutional floor-setting at auction', 'Generational wealth transfer events'] },
];

const MOCK_NOSTALGIA_WAVES: NostalgiaWave[] = [
  { id: 'nw-1', era: '1990s Junk Wax Renaissance', yearRange: '1987-1994', peakCohort: 'Millennial Collectors', currentIntensity: 72, projectedPeak: '2027-Q3', affectedPlayers: ['Ken Griffey Jr', 'Frank Thomas', 'Chipper Jones', 'Derek Jeter'], priceImpact: 35 },
  { id: 'nw-2', era: '2000s Chrome Era Nostalgia', yearRange: '2001-2010', peakCohort: 'Gen Z Speculators', currentIntensity: 48, projectedPeak: '2029-Q1', affectedPlayers: ['LeBron James', 'Tom Brady', 'Albert Pujols', 'Mike Trout'], priceImpact: 22 },
  { id: 'nw-3', era: '1980s Rookie Boom Echo', yearRange: '1980-1989', peakCohort: 'Gen X Power Buyers', currentIntensity: 85, projectedPeak: '2026-Q4', affectedPlayers: ['Michael Jordan', 'Cal Ripken Jr', 'Roger Clemens', 'Don Mattingly'], priceImpact: 42 },
  { id: 'nw-4', era: 'Golden Age Revival', yearRange: '1950-1969', peakCohort: 'Boomer Vintage Elite', currentIntensity: 61, projectedPeak: '2026-Q2', affectedPlayers: ['Mickey Mantle', 'Willie Mays', 'Hank Aaron', 'Sandy Koufax'], priceImpact: 28 },
];

export function getCohorts(): BuyerCohort[] { return [...MOCK_COHORTS]; }
export function getForecasts(): DemandForecast[] { return [...MOCK_FORECASTS]; }
export function getNostalgiaWaves(): NostalgiaWave[] { return [...MOCK_NOSTALGIA_WAVES]; }
export function getFastestGrowingCohort(): BuyerCohort { return MOCK_COHORTS.reduce((a, b) => a.growthRate > b.growthRate ? a : b); }

export default { getCohorts, getForecasts, getNostalgiaWaves, getFastestGrowingCohort };
