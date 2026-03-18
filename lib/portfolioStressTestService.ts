import { store } from './dal/syncStore';

// ---- Types ----

export type ScenarioType =
  | 'player_injury'
  | 'retirement'
  | 'scandal'
  | 'market_crash'
  | 'grading_scandal'
  | 'regulation'
  | 'recession'
  | 'hype_cycle';

export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'catastrophic';

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  severity: SeverityLevel;
  affectedSports: string[];
  affectedCategories: string[];
  priceImpact: number; // percent
  recoveryTime: string;
  historicalPrecedent?: string;
}

export interface MostAffectedCard {
  cardName: string;
  player: string;
  currentValue: number;
  projectedValue: number;
  impactPercent: number;
}

export interface RecoveryProjectionPoint {
  month: number;
  value: number;
}

export interface StressTestResult {
  scenarioId: string;
  scenarioName: string;
  portfolioValueBefore: number;
  portfolioValueAfter: number;
  impactAmount: number;
  impactPercent: number;
  mostAffectedCards: MostAffectedCard[];
  recoveryProjection: RecoveryProjectionPoint[];
  riskScore: number; // 1-100
}

export interface Vulnerability {
  area: string;
  severity: string;
  description: string;
}

export interface PortfolioResilience {
  overallScore: number; // 1-100
  vulnerabilities: Vulnerability[];
  strengths: string[];
  recommendations: string[];
}

export interface StressTestStats {
  totalTestsRun: number;
  avgImpact: number;
  worstScenario: string;
  bestResilience: string;
  lastTestDate: string;
}

export interface HistoricalCrash {
  id: string;
  name: string;
  year: number;
  description: string;
  impactPercent: number;
  recoveryMonths: number;
  affectedMarkets: string[];
}

// ---- Constants ----

const STORAGE_PREFIX = 'msi_stress_test';
const RESULTS_KEY = `${STORAGE_PREFIX}_results`;
const STATS_KEY = `${STORAGE_PREFIX}_stats`;

// ---- Mock Scenarios ----

const SCENARIOS: StressScenario[] = [
  {
    id: 'sc-001',
    name: 'Star Player ACL Tear',
    description: 'A top-tier player suffers a season-ending ACL injury, causing immediate decline in card values.',
    type: 'player_injury',
    severity: 'severe',
    affectedSports: ['Basketball', 'Football'],
    affectedCategories: ['Rookies', 'Autographs', 'Parallels'],
    priceImpact: -35,
    recoveryTime: '12-18 months',
    historicalPrecedent: 'Zion Williamson 2021 foot injury',
  },
  {
    id: 'sc-002',
    name: 'Legend Retirement Announcement',
    description: 'An all-time great announces retirement, triggering a short-term price spike followed by gradual decline.',
    type: 'retirement',
    severity: 'moderate',
    affectedSports: ['Baseball', 'Basketball'],
    affectedCategories: ['Vintage', 'Rookies', 'Autographs'],
    priceImpact: 15,
    recoveryTime: '6-12 months',
    historicalPrecedent: 'Tom Brady retirement 2023',
  },
  {
    id: 'sc-003',
    name: 'Performance-Enhancing Drug Scandal',
    description: 'A major star is caught using PEDs, devastating card values across their entire catalog.',
    type: 'scandal',
    severity: 'catastrophic',
    affectedSports: ['Baseball', 'Football', 'Basketball'],
    affectedCategories: ['Rookies', 'Autographs', 'Game-Used'],
    priceImpact: -65,
    recoveryTime: '3-5 years',
    historicalPrecedent: 'A-Rod steroid scandal 2009',
  },
  {
    id: 'sc-004',
    name: 'Sports Card Market Crash',
    description: 'Overall market sentiment collapses due to oversupply and speculation unwinding.',
    type: 'market_crash',
    severity: 'catastrophic',
    affectedSports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    affectedCategories: ['Modern', 'Parallels', 'Inserts', 'Base'],
    priceImpact: -50,
    recoveryTime: '2-4 years',
    historicalPrecedent: 'Junk Wax Era crash 1990s',
  },
  {
    id: 'sc-005',
    name: 'PSA Grading Backlog Crisis',
    description: 'Major grading company faces months-long delays and quality concerns, impacting graded card premiums.',
    type: 'grading_scandal',
    severity: 'moderate',
    affectedSports: ['Baseball', 'Basketball', 'Football'],
    affectedCategories: ['Graded', 'Rookies', 'Vintage'],
    priceImpact: -20,
    recoveryTime: '6-12 months',
    historicalPrecedent: 'PSA submission halt 2021',
  },
  {
    id: 'sc-006',
    name: 'New Trading Card Regulations',
    description: 'Government introduces regulations treating sports cards as securities, adding compliance burdens.',
    type: 'regulation',
    severity: 'severe',
    affectedSports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    affectedCategories: ['Fractional', 'Investment-Grade', 'High-Value'],
    priceImpact: -30,
    recoveryTime: '1-2 years',
  },
  {
    id: 'sc-007',
    name: 'Economic Recession',
    description: 'Broad economic downturn reduces discretionary spending on collectibles.',
    type: 'recession',
    severity: 'severe',
    affectedSports: ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'],
    affectedCategories: ['Modern', 'Ultra-Premium', 'Boxes', 'Cases'],
    priceImpact: -40,
    recoveryTime: '2-3 years',
    historicalPrecedent: '2008 Financial Crisis',
  },
  {
    id: 'sc-008',
    name: 'Viral TikTok Hype Cycle',
    description: 'Social media drives a massive speculative bubble in a specific player or product, followed by crash.',
    type: 'hype_cycle',
    severity: 'moderate',
    affectedSports: ['Basketball', 'Football'],
    affectedCategories: ['Rookies', 'Hobby Boxes', 'Retail'],
    priceImpact: -25,
    recoveryTime: '3-6 months',
    historicalPrecedent: 'LaMelo Ball hype cycle 2021',
  },
  {
    id: 'sc-009',
    name: 'Counterfeit Card Ring Exposed',
    description: 'A major counterfeiting operation is uncovered, shaking buyer confidence across the market.',
    type: 'grading_scandal',
    severity: 'severe',
    affectedSports: ['Baseball', 'Basketball'],
    affectedCategories: ['Vintage', 'Autographs', 'High-Value'],
    priceImpact: -30,
    recoveryTime: '12-24 months',
    historicalPrecedent: 'Trimming scandal 2020',
  },
  {
    id: 'sc-010',
    name: 'Rookie Bust Season',
    description: 'Highly touted rookie class underperforms dramatically, collapsing first-year card values.',
    type: 'player_injury',
    severity: 'moderate',
    affectedSports: ['Football', 'Basketball'],
    affectedCategories: ['Rookies', 'Parallels', 'Autographs'],
    priceImpact: -28,
    recoveryTime: '6-12 months',
  },
  {
    id: 'sc-011',
    name: 'League Lockout',
    description: 'A major professional league enters a prolonged labor dispute, halting all games.',
    type: 'market_crash',
    severity: 'moderate',
    affectedSports: ['Basketball', 'Hockey'],
    affectedCategories: ['Modern', 'Rookies', 'Base'],
    priceImpact: -22,
    recoveryTime: '3-9 months',
    historicalPrecedent: 'NHL lockout 2012-13',
  },
  {
    id: 'sc-012',
    name: 'NFT Crossover Collapse',
    description: 'Digital collectibles market crashes, dragging down hybrid physical-digital card values.',
    type: 'hype_cycle',
    severity: 'mild',
    affectedSports: ['Basketball', 'Football', 'Soccer'],
    affectedCategories: ['Digital', 'NFT-Linked', 'Modern'],
    priceImpact: -15,
    recoveryTime: '3-6 months',
    historicalPrecedent: 'NBA Top Shot decline 2022',
  },
  {
    id: 'sc-013',
    name: 'Minor Player Trade Rumor',
    description: 'Unconfirmed trade rumors cause slight fluctuation in mid-tier player card values.',
    type: 'player_injury',
    severity: 'mild',
    affectedSports: ['Baseball'],
    affectedCategories: ['Base', 'Inserts'],
    priceImpact: -5,
    recoveryTime: '1-2 months',
  },
];

// ---- Historical Crashes ----

const HISTORICAL_CRASHES: HistoricalCrash[] = [
  {
    id: 'hc-001',
    name: 'Junk Wax Era Collapse',
    year: 1993,
    description: 'Massive overproduction of cards in the late 80s and early 90s caused values to plummet.',
    impactPercent: -80,
    recoveryMonths: 120,
    affectedMarkets: ['Baseball', 'Basketball', 'Football'],
  },
  {
    id: 'hc-002',
    name: '2008 Financial Crisis',
    year: 2008,
    description: 'Global recession reduced discretionary spending on collectibles across all categories.',
    impactPercent: -45,
    recoveryMonths: 48,
    affectedMarkets: ['Baseball', 'Basketball', 'Football', 'Hockey'],
  },
  {
    id: 'hc-003',
    name: 'COVID-19 Initial Crash',
    year: 2020,
    description: 'Pandemic uncertainty caused brief market panic before stimulus-fueled boom.',
    impactPercent: -30,
    recoveryMonths: 3,
    affectedMarkets: ['Baseball', 'Basketball', 'Football', 'Soccer'],
  },
  {
    id: 'hc-004',
    name: 'Post-COVID Correction',
    year: 2022,
    description: 'Pandemic-era speculation unwound as interest rates rose and demand normalized.',
    impactPercent: -40,
    recoveryMonths: 24,
    affectedMarkets: ['Basketball', 'Football', 'Soccer'],
  },
  {
    id: 'hc-005',
    name: 'Steroid Era Fallout',
    year: 2005,
    description: 'Congressional hearings on PEDs decimated values of implicated players cards.',
    impactPercent: -60,
    recoveryMonths: 60,
    affectedMarkets: ['Baseball'],
  },
];

// ---- Mock Portfolio Cards ----

const MOCK_PORTFOLIO_CARDS = [
  { cardName: '2020 Prizm Silver', player: 'Justin Herbert', currentValue: 850 },
  { cardName: '2018 Optic Rated Rookie', player: 'Luka Doncic', currentValue: 2400 },
  { cardName: '2011 Topps Update', player: 'Mike Trout', currentValue: 4500 },
  { cardName: '2019 Mosaic', player: 'Ja Morant', currentValue: 320 },
  { cardName: '2020 Select Club Level', player: 'Joe Burrow', currentValue: 600 },
  { cardName: '2003 Topps Chrome', player: 'LeBron James', currentValue: 12000 },
  { cardName: '1986 Fleer', player: 'Michael Jordan', currentValue: 35000 },
  { cardName: '2018 Panini National Treasures', player: 'Saquon Barkley', currentValue: 750 },
  { cardName: '2021 Bowman Chrome', player: 'Jackson Holliday', currentValue: 280 },
  { cardName: '2022 Topps Chrome', player: 'Julio Rodriguez', currentValue: 420 },
];

const TOTAL_PORTFOLIO_VALUE = MOCK_PORTFOLIO_CARDS.reduce((sum, c) => sum + c.currentValue, 0);

// ---- Helper Functions ----

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export function getSeverityColor(sev: SeverityLevel): string {
  switch (sev) {
    case 'mild':
      return 'text-green-400';
    case 'moderate':
      return 'text-yellow-400';
    case 'severe':
      return 'text-orange-400';
    case 'catastrophic':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function getSeverityLabel(sev: SeverityLevel): string {
  switch (sev) {
    case 'mild':
      return 'Mild';
    case 'moderate':
      return 'Moderate';
    case 'severe':
      return 'Severe';
    case 'catastrophic':
      return 'Catastrophic';
    default:
      return 'Unknown';
  }
}

export function getScenarioIcon(type: ScenarioType): string {
  switch (type) {
    case 'player_injury':
      return 'HeartPulse';
    case 'retirement':
      return 'UserMinus';
    case 'scandal':
      return 'AlertTriangle';
    case 'market_crash':
      return 'TrendingDown';
    case 'grading_scandal':
      return 'ShieldAlert';
    case 'regulation':
      return 'Scale';
    case 'recession':
      return 'DollarSign';
    case 'hype_cycle':
      return 'Flame';
    default:
      return 'HelpCircle';
  }
}

export function getRiskColor(score: number): string {
  if (score <= 25) return 'text-green-400';
  if (score <= 50) return 'text-yellow-400';
  if (score <= 75) return 'text-orange-400';
  return 'text-red-400';
}

// ---- Storage Helpers ----

function loadResults(): StressTestResult[] {
  return store.get<StressTestResult[]>(RESULTS_KEY, []);
}

function saveResults(results: StressTestResult[]): void {
  store.set(RESULTS_KEY, results);
}

function loadStats(): StressTestStats {
  return store.get<StressTestStats>(STATS_KEY, getDefaultStats());
}

function saveStats(stats: StressTestStats): void {
  store.set(STATS_KEY, stats);
}

function getDefaultStats(): StressTestStats {
  return {
    totalTestsRun: 0,
    avgImpact: 0,
    worstScenario: 'N/A',
    bestResilience: 'N/A',
    lastTestDate: '',
  };
}

// ---- Core Functions ----

export function getScenarios(): StressScenario[] {
  return [...SCENARIOS];
}

export function getScenarioById(id: string): StressScenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function runStressTest(scenarioId: string): StressTestResult {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }

  const portfolioValueBefore = TOTAL_PORTFOLIO_VALUE;
  const impactMultiplier = scenario.priceImpact / 100;

  // Calculate per-card impact with variation
  const mostAffectedCards: MostAffectedCard[] = MOCK_PORTFOLIO_CARDS.map((card, idx) => {
    // Different cards are affected differently based on their value and position
    const varianceFactor = 0.6 + ((idx * 0.73 + 0.11) % 1) * 0.8; // deterministic pseudo-random 0.6-1.4
    const cardImpactPercent = impactMultiplier * varianceFactor * 100;
    const projectedValue = Math.max(0, card.currentValue * (1 + impactMultiplier * varianceFactor));
    return {
      cardName: card.cardName,
      player: card.player,
      currentValue: card.currentValue,
      projectedValue: Math.round(projectedValue),
      impactPercent: Math.round(cardImpactPercent * 10) / 10,
    };
  }).sort((a, b) => a.impactPercent - b.impactPercent); // most negative first

  const portfolioValueAfter = mostAffectedCards.reduce((sum, c) => sum + c.projectedValue, 0);
  const impactAmount = portfolioValueAfter - portfolioValueBefore;
  const impactPercent = (impactAmount / portfolioValueBefore) * 100;

  // Build recovery projection
  const recoveryProjection = buildRecoveryProjection(portfolioValueAfter, portfolioValueBefore, scenario.severity);

  // Compute risk score based on severity and impact
  const severityWeights: Record<SeverityLevel, number> = {
    mild: 15,
    moderate: 40,
    severe: 65,
    catastrophic: 90,
  };
  const baseRisk = severityWeights[scenario.severity];
  const impactAdjustment = Math.min(10, Math.abs(impactPercent) / 5);
  const riskScore = Math.min(100, Math.max(1, Math.round(baseRisk + impactAdjustment)));

  const result: StressTestResult = {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    portfolioValueBefore,
    portfolioValueAfter,
    impactAmount: Math.round(impactAmount),
    impactPercent: Math.round(impactPercent * 10) / 10,
    mostAffectedCards,
    recoveryProjection,
    riskScore,
  };

  // Persist result
  const existingResults = loadResults();
  const filteredResults = existingResults.filter((r) => r.scenarioId !== scenarioId);
  filteredResults.push(result);
  saveResults(filteredResults);

  // Update stats
  updateStats(filteredResults);

  return result;
}

function buildRecoveryProjection(
  startValue: number,
  targetValue: number,
  severity: SeverityLevel
): RecoveryProjectionPoint[] {
  const monthCounts: Record<SeverityLevel, number> = {
    mild: 6,
    moderate: 12,
    severe: 18,
    catastrophic: 24,
  };
  const months = monthCounts[severity];
  const points: RecoveryProjectionPoint[] = [{ month: 0, value: Math.round(startValue) }];

  for (let m = 1; m <= months; m++) {
    const progress = m / months;
    // Ease-in curve for recovery
    const easedProgress = 1 - Math.pow(1 - progress, 2);
    const value = startValue + (targetValue - startValue) * easedProgress;
    points.push({ month: m, value: Math.round(value) });
  }

  return points;
}

function updateStats(results: StressTestResult[]): void {
  if (results.length === 0) return;

  const impacts = results.map((r) => Math.abs(r.impactPercent));
  const avgImpact = impacts.reduce((s, v) => s + v, 0) / impacts.length;

  const worstResult = results.reduce((w, r) =>
    r.impactPercent < w.impactPercent ? r : w
  );
  const bestResult = results.reduce((b, r) =>
    r.riskScore < b.riskScore ? r : b
  );

  const stats: StressTestStats = {
    totalTestsRun: results.length,
    avgImpact: Math.round(avgImpact * 10) / 10,
    worstScenario: worstResult.scenarioName,
    bestResilience: bestResult.scenarioName,
    lastTestDate: new Date().toISOString(),
  };

  saveStats(stats);
}

export function getStressTestResults(): StressTestResult[] {
  return loadResults();
}

export function getResilienceScore(): number {
  const results = loadResults();
  if (results.length === 0) return 50; // default neutral score

  const avgRisk = results.reduce((s, r) => s + r.riskScore, 0) / results.length;
  // Resilience is inverse of risk
  return Math.round(Math.max(1, Math.min(100, 100 - avgRisk)));
}

export function getPortfolioResilience(): PortfolioResilience {
  const results = loadResults();
  const overallScore = getResilienceScore();

  const vulnerabilities: Vulnerability[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (results.length === 0) {
    vulnerabilities.push({
      area: 'Untested Portfolio',
      severity: 'moderate',
      description: 'No stress tests have been run. Portfolio risk profile is unknown.',
    });
    recommendations.push('Run stress tests across multiple scenarios to understand your risk exposure.');
    recommendations.push('Start with market crash and recession scenarios for a baseline assessment.');
    return { overallScore, vulnerabilities, strengths, recommendations };
  }

  // Analyze results to find vulnerabilities
  const severeResults = results.filter((r) => r.riskScore >= 70);
  const mildResults = results.filter((r) => r.riskScore <= 30);

  if (severeResults.length > 0) {
    for (const sr of severeResults) {
      vulnerabilities.push({
        area: sr.scenarioName,
        severity: sr.riskScore >= 85 ? 'critical' : 'high',
        description: `Portfolio could lose ${formatPercent(sr.impactPercent)} (${formatCurrency(Math.abs(sr.impactAmount))}) under this scenario.`,
      });
    }
  }

  // Check concentration risk
  const highValueCards = MOCK_PORTFOLIO_CARDS.filter(
    (c) => c.currentValue > TOTAL_PORTFOLIO_VALUE * 0.2
  );
  if (highValueCards.length > 0) {
    vulnerabilities.push({
      area: 'Concentration Risk',
      severity: 'high',
      description: `${highValueCards.length} card(s) represent over 20% of portfolio value each.`,
    });
    recommendations.push('Diversify holdings to reduce single-card concentration risk.');
  }

  // Strengths
  if (mildResults.length > 0) {
    strengths.push(`Portfolio shows resilience against ${mildResults.length} tested scenario(s).`);
  }
  if (overallScore >= 60) {
    strengths.push('Overall resilience score is above average.');
  }
  if (results.length >= 5) {
    strengths.push('Comprehensive testing coverage across multiple scenarios.');
  }
  // Ensure at least one strength
  if (strengths.length === 0) {
    strengths.push('Portfolio has been stress-tested, providing awareness of potential risks.');
  }

  // Recommendations
  if (results.length < 5) {
    recommendations.push('Run additional stress tests to improve coverage.');
  }
  recommendations.push('Consider hedging strategies for high-impact scenarios.');
  recommendations.push('Review portfolio allocation quarterly to maintain diversification.');

  return { overallScore, vulnerabilities, strengths, recommendations };
}

export function getStressTestStats(): StressTestStats {
  return loadStats();
}

export function getHistoricalCrashes(): HistoricalCrash[] {
  return [...HISTORICAL_CRASHES];
}

export function getRecoveryProjection(scenarioId: string): RecoveryProjectionPoint[] {
  const results = loadResults();
  const result = results.find((r) => r.scenarioId === scenarioId);
  if (result) {
    return result.recoveryProjection;
  }

  // If no result exists, generate a default projection based on scenario
  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) return [];

  const impactValue = TOTAL_PORTFOLIO_VALUE * (1 + scenario.priceImpact / 100);
  return buildRecoveryProjection(impactValue, TOTAL_PORTFOLIO_VALUE, scenario.severity);
}

export function getMostVulnerableCards(): MostAffectedCard[] {
  const results = loadResults();
  if (results.length === 0) return [];

  // Aggregate impact across all tested scenarios
  const cardImpacts: Record<string, { total: number; count: number; card: MostAffectedCard }> = {};

  for (const result of results) {
    for (const card of result.mostAffectedCards) {
      const key = card.cardName;
      if (!cardImpacts[key]) {
        cardImpacts[key] = { total: 0, count: 0, card };
      }
      cardImpacts[key].total += card.impactPercent;
      cardImpacts[key].count += 1;
    }
  }

  return Object.values(cardImpacts)
    .map((entry) => ({
      ...entry.card,
      impactPercent: Math.round((entry.total / entry.count) * 10) / 10,
    }))
    .sort((a, b) => a.impactPercent - b.impactPercent); // most negative first
}

export function getCustomScenario(params: {
  name: string;
  type: ScenarioType;
  severity: SeverityLevel;
  priceImpact: number;
  affectedSports?: string[];
  description?: string;
}): StressScenario {
  return {
    id: `custom-${Date.now()}`,
    name: params.name,
    description: params.description || `Custom stress scenario: ${params.name}`,
    type: params.type,
    severity: params.severity,
    affectedSports: params.affectedSports || ['Baseball', 'Basketball', 'Football'],
    affectedCategories: ['All'],
    priceImpact: params.priceImpact,
    recoveryTime: params.severity === 'catastrophic' ? '2+ years' :
                  params.severity === 'severe' ? '1-2 years' :
                  params.severity === 'moderate' ? '6-12 months' : '1-6 months',
  };
}
