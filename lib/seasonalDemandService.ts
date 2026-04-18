// ─────────────────────────────────────────────────────────────────────────────
// Seasonal Demand Oscillator Service
// Tracks cyclical demand patterns, phase transitions, forecasts, and anomalies
// across the sports card market calendar year. Provides oscillation data for
// buy/sell timing optimization based on historical seasonal demand curves.
// ─────────────────────────────────────────────────────────────────────────────

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface SeasonalPattern {
  id: string;
  month: string;
  demandIndex: number;
  avgPriceChange: number;
  volumeMultiplier: number;
  topCategory: string;
  peakDrivers: string[];
  historicalAvg: number;
}

export interface DemandPhase {
  id: string;
  name: string;
  startMonth: string;
  endMonth: string;
  intensity: number;
  description: string;
  affectedSegments: string[];
  expectedReturn: number;
  status: 'active' | 'approaching' | 'passed';
}

export interface SeasonalForecast {
  id: string;
  segment: string;
  currentDemand: number;
  forecastDemand: number;
  confidence: number;
  peakMonth: string;
  troughMonth: string;
  cycleLengthMonths: number;
  recommendation: 'accumulate' | 'hold' | 'distribute';
}

export interface SeasonalAnomaly {
  id: string;
  date: string;
  segment: string;
  expectedDemand: number;
  actualDemand: number;
  deviation: number;
  cause: string;
  resolved: boolean;
}

// ── Seasonal Patterns (12 months) ──────────────────────────────────────────

const seasonalPatterns: SeasonalPattern[] = [
  {
    id: 'sp-jan', month: 'January', demandIndex: 42, avgPriceChange: -3.8,
    volumeMultiplier: 0.72, topCategory: 'Basketball',
    peakDrivers: ['NBA mid-season push', 'Post-holiday sell-off', 'Tax season liquidation'],
    historicalAvg: 45,
  },
  {
    id: 'sp-feb', month: 'February', demandIndex: 55, avgPriceChange: 2.1,
    volumeMultiplier: 0.88, topCategory: 'Basketball',
    peakDrivers: ['NBA All-Star Weekend', 'Super Bowl hangover buys', 'Spring Training anticipation'],
    historicalAvg: 52,
  },
  {
    id: 'sp-mar', month: 'March', demandIndex: 63, avgPriceChange: 4.5,
    volumeMultiplier: 1.05, topCategory: 'Baseball',
    peakDrivers: ['Spring Training hype', 'March Madness crossover', 'New product releases'],
    historicalAvg: 60,
  },
  {
    id: 'sp-apr', month: 'April', demandIndex: 78, avgPriceChange: 8.2,
    volumeMultiplier: 1.35, topCategory: 'Baseball',
    peakDrivers: ['Opening Day momentum', 'MLB rookie debuts', 'NBA/NHL playoff push'],
    historicalAvg: 74,
  },
  {
    id: 'sp-may', month: 'May', demandIndex: 72, avgPriceChange: 5.1,
    volumeMultiplier: 1.20, topCategory: 'Baseball',
    peakDrivers: ['Rookie call-ups', 'NBA/NHL playoffs peak', 'Draft speculation begins'],
    historicalAvg: 70,
  },
  {
    id: 'sp-jun', month: 'June', demandIndex: 68, avgPriceChange: 3.4,
    volumeMultiplier: 1.10, topCategory: 'Baseball',
    peakDrivers: ['MLB Draft', 'NBA Finals', 'NHL Finals'],
    historicalAvg: 65,
  },
  {
    id: 'sp-jul', month: 'July', demandIndex: 58, avgPriceChange: -1.2,
    volumeMultiplier: 0.90, topCategory: 'Baseball',
    peakDrivers: ['MLB All-Star break', 'Summer lull begins', 'National Card Day prep'],
    historicalAvg: 55,
  },
  {
    id: 'sp-aug', month: 'August', demandIndex: 52, avgPriceChange: -2.5,
    volumeMultiplier: 0.82, topCategory: 'Football',
    peakDrivers: ['NFL preseason begins', 'Back-to-school slowdown', 'National Sports Card Day'],
    historicalAvg: 50,
  },
  {
    id: 'sp-sep', month: 'September', demandIndex: 82, avgPriceChange: 9.8,
    volumeMultiplier: 1.45, topCategory: 'Football',
    peakDrivers: ['NFL season opener', 'MLB pennant races', 'New product releases'],
    historicalAvg: 78,
  },
  {
    id: 'sp-oct', month: 'October', demandIndex: 88, avgPriceChange: 11.3,
    volumeMultiplier: 1.55, topCategory: 'Football',
    peakDrivers: ['NFL mid-season', 'World Series', 'NBA season tips off'],
    historicalAvg: 85,
  },
  {
    id: 'sp-nov', month: 'November', demandIndex: 75, avgPriceChange: 6.7,
    volumeMultiplier: 1.25, topCategory: 'Football',
    peakDrivers: ['Black Friday deals', 'Holiday gift buying starts', 'NFL surge'],
    historicalAvg: 72,
  },
  {
    id: 'sp-dec', month: 'December', demandIndex: 65, avgPriceChange: 1.9,
    volumeMultiplier: 1.00, topCategory: 'Multi-Sport',
    peakDrivers: ['Holiday gift purchases', 'Year-end portfolio rebalancing', 'Bowl season'],
    historicalAvg: 62,
  },
];

// ── Demand Phases (6 phases) ────────────────────────────────────────────────

const demandPhases: DemandPhase[] = [
  {
    id: 'dp-1', name: 'Opening Day Rush', startMonth: 'March', endMonth: 'April',
    intensity: 9,
    description: 'Baseball card demand surges as Spring Training ends and Opening Day hype peaks. Rookie cards and top prospects see highest volume.',
    affectedSegments: ['MLB Rookies', 'MLB Veterans', 'Prospect Cards'],
    expectedReturn: 12.5, status: 'active',
  },
  {
    id: 'dp-2', name: 'Draft Season Surge', startMonth: 'April', endMonth: 'June',
    intensity: 7,
    description: 'NFL and NBA drafts create speculative buying waves on college prospect cards and pre-draft bowman chromes.',
    affectedSegments: ['NFL Draft Picks', 'NBA Draft Picks', 'Bowman Chrome'],
    expectedReturn: 8.3, status: 'active',
  },
  {
    id: 'dp-3', name: 'Gridiron Frenzy', startMonth: 'September', endMonth: 'November',
    intensity: 10,
    description: 'NFL season kickoff drives peak annual demand. Football cards dominate all platforms with highest premiums of the year.',
    affectedSegments: ['NFL Rookies', 'NFL QBs', 'Prizm Football'],
    expectedReturn: 15.2, status: 'approaching',
  },
  {
    id: 'dp-4', name: 'Playoff Premium', startMonth: 'October', endMonth: 'February',
    intensity: 8,
    description: 'Playoff performers see sharp price increases across all sports. MVP-caliber cards can double in value during deep postseason runs.',
    affectedSegments: ['Playoff Performers', 'MVP Candidates', 'Championship Cards'],
    expectedReturn: 10.8, status: 'approaching',
  },
  {
    id: 'dp-5', name: 'Holiday Gift Cycle', startMonth: 'November', endMonth: 'December',
    intensity: 6,
    description: 'Retail-friendly sealed product and lower-end singles spike as gift buyers enter the market. Volume up, average price per card down.',
    affectedSegments: ['Sealed Product', 'Sub-$50 Singles', 'Retail Boxes'],
    expectedReturn: 4.2, status: 'approaching',
  },
  {
    id: 'dp-6', name: 'Post-Holiday Correction', startMonth: 'January', endMonth: 'February',
    intensity: 4,
    description: 'Market cools as holiday gift cards get listed for sale. Buyers with gift money create a secondary demand floor. Best time to accumulate.',
    affectedSegments: ['All Singles', 'Graded Cards', 'Vintage'],
    expectedReturn: -2.1, status: 'passed',
  },
];

// ── Seasonal Forecasts (8 segments) ─────────────────────────────────────────

const seasonalForecasts: SeasonalForecast[] = [
  { id: 'sf-1', segment: 'MLB Rookies', currentDemand: 74, forecastDemand: 82, confidence: 0.88, peakMonth: 'April', troughMonth: 'August', cycleLengthMonths: 12, recommendation: 'accumulate' },
  { id: 'sf-2', segment: 'NFL Prizm', currentDemand: 45, forecastDemand: 91, confidence: 0.93, peakMonth: 'October', troughMonth: 'June', cycleLengthMonths: 12, recommendation: 'accumulate' },
  { id: 'sf-3', segment: 'NBA Hoops', currentDemand: 62, forecastDemand: 58, confidence: 0.76, peakMonth: 'February', troughMonth: 'July', cycleLengthMonths: 12, recommendation: 'hold' },
  { id: 'sf-4', segment: 'Vintage Pre-War', currentDemand: 70, forecastDemand: 73, confidence: 0.82, peakMonth: 'March', troughMonth: 'December', cycleLengthMonths: 18, recommendation: 'hold' },
  { id: 'sf-5', segment: 'Bowman Chrome', currentDemand: 68, forecastDemand: 85, confidence: 0.90, peakMonth: 'May', troughMonth: 'November', cycleLengthMonths: 12, recommendation: 'accumulate' },
  { id: 'sf-6', segment: 'Sealed Hobby Boxes', currentDemand: 55, forecastDemand: 48, confidence: 0.71, peakMonth: 'December', troughMonth: 'March', cycleLengthMonths: 12, recommendation: 'distribute' },
  { id: 'sf-7', segment: 'Graded PSA 10', currentDemand: 80, forecastDemand: 78, confidence: 0.85, peakMonth: 'October', troughMonth: 'January', cycleLengthMonths: 12, recommendation: 'hold' },
  { id: 'sf-8', segment: 'Soccer International', currentDemand: 60, forecastDemand: 72, confidence: 0.68, peakMonth: 'June', troughMonth: 'September', cycleLengthMonths: 24, recommendation: 'accumulate' },
];

// ── Seasonal Anomalies (6 events) ───────────────────────────────────────────

const seasonalAnomalies: SeasonalAnomaly[] = [
  { id: 'sa-1', date: '2026-02-14', segment: 'NFL Rookies', expectedDemand: 48, actualDemand: 79, deviation: 64.6, cause: 'Super Bowl MVP breakout performance spiked demand two months early', resolved: true },
  { id: 'sa-2', date: '2026-03-22', segment: 'MLB Veterans', expectedDemand: 60, actualDemand: 38, deviation: -36.7, cause: 'Spring training lockout scare suppressed typical Opening Day build-up', resolved: true },
  { id: 'sa-3', date: '2026-01-08', segment: 'NBA Hoops', expectedDemand: 42, actualDemand: 71, deviation: 69.0, cause: 'Viral TikTok trend on retro basketball cards drove unexpected January surge', resolved: false },
  { id: 'sa-4', date: '2025-12-26', segment: 'Sealed Product', expectedDemand: 65, actualDemand: 88, deviation: 35.4, cause: 'Major retailer flash sale on Prizm hobby boxes created panic buying', resolved: true },
  { id: 'sa-5', date: '2026-04-02', segment: 'Bowman Chrome', expectedDemand: 72, actualDemand: 55, deviation: -23.6, cause: 'Delayed product release pushed prospect card demand into later window', resolved: false },
  { id: 'sa-6', date: '2026-03-15', segment: 'Vintage Pre-War', expectedDemand: 58, actualDemand: 82, deviation: 41.4, cause: 'Heritage auction house record sale generated broad vintage demand wave', resolved: true },
];

// ── Getter Functions ────────────────────────────────────────────────────────

export function getSeasonalPatterns(): SeasonalPattern[] {
  return seasonalPatterns;
}

export function getDemandPhases(): DemandPhase[] {
  return demandPhases;
}

export function getSeasonalForecasts(): SeasonalForecast[] {
  return seasonalForecasts;
}

export function getSeasonalAnomalies(): SeasonalAnomaly[] {
  return seasonalAnomalies;
}

export function getSeasonalSummary(): {
  avgDemandIndex: number;
  activePhasesCount: number;
  anomalyCount: number;
  topForecastConfidence: number;
} {
  const avgDemandIndex = Math.round(
    seasonalPatterns.reduce((sum, p) => sum + p.demandIndex, 0) / seasonalPatterns.length
  );
  const activePhasesCount = demandPhases.filter(p => p.status === 'active').length;
  const anomalyCount = seasonalAnomalies.filter(a => !a.resolved).length;
  const topForecastConfidence = Math.max(...seasonalForecasts.map(f => f.confidence));

  return { avgDemandIndex, activePhasesCount, anomalyCount, topForecastConfidence };
}

// ── Aggregate Helpers ───────────────────────────────────────────────────────

export function getPeakDemandMonth(): SeasonalPattern {
  return [...seasonalPatterns].sort((a, b) => b.demandIndex - a.demandIndex)[0];
}

export function getTroughDemandMonth(): SeasonalPattern {
  return [...seasonalPatterns].sort((a, b) => a.demandIndex - b.demandIndex)[0];
}

export function getAccumulateCount(): number {
  return seasonalForecasts.filter(f => f.recommendation === 'accumulate').length;
}

export function getUnresolvedAnomalies(): SeasonalAnomaly[] {
  return seasonalAnomalies.filter(a => !a.resolved);
}

export function getPhasesByStatus(status: DemandPhase['status']): DemandPhase[] {
  return demandPhases.filter(p => p.status === status);
}

export function getAvgExpectedReturn(): number {
  return Math.round(
    (demandPhases.reduce((sum, p) => sum + p.expectedReturn, 0) / demandPhases.length) * 10
  ) / 10;
}
