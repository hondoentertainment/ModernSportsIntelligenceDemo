// Herd Immunity Dashboard Service
// Score portfolio resistance to herd-driven market bubbles

export interface HerdSignal {
  id: string;
  signalName: string;
  category: string;
  herdIntensity: number;
  affectedCards: number;
  priceInflation: number;
  source: string;
  detectedDate: string;
  status: 'active' | 'building' | 'peaked' | 'declining';
  description: string;
}

export interface BubbleExposure {
  id: string;
  cardName: string;
  sport: string;
  currentPrice: number;
  estimatedFairValue: number;
  bubblePremium: number;
  herdDrivenPct: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  relatedSignal: string;
}

export interface ImmunityScore {
  category: string;
  score: number;
  maxScore: number;
  trend: 'improving' | 'declining' | 'stable';
  description: string;
}

export interface HerdHistory {
  month: string;
  immunityScore: number;
  herdExposure: number;
  bubbleEvents: number;
  portfolioAtRisk: number;
  correctCalls: number;
}

const herdSignals: HerdSignal[] = [
  { id: 'hs-1', signalName: 'QB Rookie Mania 2024', category: 'Football', herdIntensity: 88, affectedCards: 45, priceInflation: 42, source: 'Social Media + YouTube', detectedDate: '2026-04-15', status: 'active', description: 'Mass buying of 2024 QB rookies driven by influencer hype cycles' },
  { id: 'hs-2', signalName: 'Wembanyama Frenzy', category: 'Basketball', herdIntensity: 92, affectedCards: 32, priceInflation: 55, source: 'Global Media Coverage', detectedDate: '2026-04-10', status: 'building', description: 'International media driving unprecedented demand for Wembanyama cards' },
  { id: 'hs-3', signalName: 'Prospect Lottery Rush', category: 'Baseball', herdIntensity: 71, affectedCards: 28, priceInflation: 35, source: 'Hobby Forums', detectedDate: '2026-04-12', status: 'active', description: 'Speculative buying of top Bowman Chrome prospects before MLB debuts' },
  { id: 'hs-4', signalName: 'Vintage Baseball FOMO', category: 'Baseball', herdIntensity: 65, affectedCards: 15, priceInflation: 22, source: 'Auction House Results', detectedDate: '2026-04-08', status: 'peaked', description: 'Record auction results driving panic buying of vintage baseball cards' },
  { id: 'hs-5', signalName: 'Graded Card Premium Spiral', category: 'Cross-Sport', herdIntensity: 78, affectedCards: 120, priceInflation: 38, source: 'PSA Population Reports', detectedDate: '2026-04-14', status: 'active', description: 'PSA 10 premiums expanding beyond rational levels due to herd behavior' },
  { id: 'hs-6', signalName: 'WNBA Breakout Wave', category: 'Basketball', herdIntensity: 85, affectedCards: 22, priceInflation: 68, source: 'Cultural Trend', detectedDate: '2026-04-16', status: 'building', description: 'Caitlin Clark effect driving massive speculation in WNBA cards' },
  { id: 'hs-7', signalName: 'Parallel Chasing Epidemic', category: 'Cross-Sport', herdIntensity: 74, affectedCards: 85, priceInflation: 48, source: 'Case Break Community', detectedDate: '2026-04-11', status: 'active', description: 'Low-numbered parallels commanding irrational premiums from herd demand' },
  { id: 'hs-8', signalName: 'International Soccer Surge', category: 'Soccer', herdIntensity: 69, affectedCards: 38, priceInflation: 30, source: 'Global Expansion', detectedDate: '2026-04-09', status: 'declining', description: 'European collectors entering market driving soccer card bubble' },
  { id: 'hs-9', signalName: 'Nostalgia Premium Wave', category: 'Vintage', herdIntensity: 58, affectedCards: 42, priceInflation: 18, source: 'Gen-X Buyers', detectedDate: '2026-04-05', status: 'peaked', description: 'Generational nostalgia pushing 1980s-90s cards above fair value' },
  { id: 'hs-10', signalName: 'AI Grading Arbitrage Rush', category: 'Cross-Sport', herdIntensity: 62, affectedCards: 55, priceInflation: 15, source: 'Tech Community', detectedDate: '2026-04-07', status: 'declining', description: 'Mass submissions to AI grading services creating temporary bottleneck' },
  { id: 'hs-11', signalName: 'Playoff Momentum Chase', category: 'Basketball', herdIntensity: 80, affectedCards: 35, priceInflation: 40, source: 'ESPN Coverage', detectedDate: '2026-04-17', status: 'active', description: 'NBA playoff coverage fueling short-term buying frenzies for star cards' },
  { id: 'hs-12', signalName: 'Draft Class Speculation', category: 'Football', herdIntensity: 76, affectedCards: 50, priceInflation: 32, source: 'NFL Draft Media', detectedDate: '2026-04-13', status: 'building', description: 'Pre-draft hype driving speculative buying of projected top picks' },
];

const bubbleExposures: BubbleExposure[] = [
  { id: 'be-1', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', currentPrice: 175, estimatedFairValue: 105, bubblePremium: 66.7, herdDrivenPct: 55, riskLevel: 'high', relatedSignal: 'QB Rookie Mania 2024' },
  { id: 'be-2', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', sport: 'Basketball', currentPrice: 520, estimatedFairValue: 310, bubblePremium: 67.7, herdDrivenPct: 62, riskLevel: 'high', relatedSignal: 'Wembanyama Frenzy' },
  { id: 'be-3', cardName: '2024 Prizm Caitlin Clark RC PSA 10', sport: 'Basketball', currentPrice: 850, estimatedFairValue: 280, bubblePremium: 203.6, herdDrivenPct: 78, riskLevel: 'extreme', relatedSignal: 'WNBA Breakout Wave' },
  { id: 'be-4', cardName: '2023 Bowman Chrome Holliday 1st Auto', sport: 'Baseball', currentPrice: 380, estimatedFairValue: 240, bubblePremium: 58.3, herdDrivenPct: 45, riskLevel: 'moderate', relatedSignal: 'Prospect Lottery Rush' },
  { id: 'be-5', cardName: '2024 Select CJ Stroud RC Die-Cut /49', sport: 'Football', currentPrice: 1200, estimatedFairValue: 820, bubblePremium: 46.3, herdDrivenPct: 38, riskLevel: 'moderate', relatedSignal: 'Parallel Chasing Epidemic' },
  { id: 'be-6', cardName: '2024 Topps Chrome Skenes RC Auto PSA 10', sport: 'Baseball', currentPrice: 480, estimatedFairValue: 350, bubblePremium: 37.1, herdDrivenPct: 42, riskLevel: 'moderate', relatedSignal: 'Prospect Lottery Rush' },
];

const immunityScores: ImmunityScore[] = [
  { category: 'Diversification', score: 72, maxScore: 100, trend: 'improving', description: 'Portfolio spread across multiple sports and eras reduces herd risk' },
  { category: 'Contrarian Holdings', score: 45, maxScore: 100, trend: 'stable', description: 'Proportion of holdings that go against current herd trends' },
  { category: 'Fundamental Analysis', score: 68, maxScore: 100, trend: 'improving', description: 'Decisions based on data vs herd following' },
  { category: 'Timing Independence', score: 55, maxScore: 100, trend: 'declining', description: 'Ability to buy/sell based on value rather than crowd timing' },
  { category: 'Information Quality', score: 62, maxScore: 100, trend: 'improving', description: 'Quality and diversity of information sources used' },
  { category: 'Emotional Resistance', score: 48, maxScore: 100, trend: 'stable', description: 'Resistance to emotional contagion from market excitement' },
];

const herdHistoryData: HerdHistory[] = [
  { month: 'Nov 2024', immunityScore: 52, herdExposure: 38, bubbleEvents: 3, portfolioAtRisk: 8500, correctCalls: 2 },
  { month: 'Dec 2024', immunityScore: 50, herdExposure: 42, bubbleEvents: 4, portfolioAtRisk: 9200, correctCalls: 2 },
  { month: 'Jan 2025', immunityScore: 48, herdExposure: 45, bubbleEvents: 5, portfolioAtRisk: 11000, correctCalls: 3 },
  { month: 'Feb 2025', immunityScore: 51, herdExposure: 40, bubbleEvents: 3, portfolioAtRisk: 9800, correctCalls: 2 },
  { month: 'Mar 2025', immunityScore: 53, herdExposure: 37, bubbleEvents: 2, portfolioAtRisk: 8200, correctCalls: 2 },
  { month: 'Apr 2025', immunityScore: 55, herdExposure: 35, bubbleEvents: 3, portfolioAtRisk: 7800, correctCalls: 3 },
  { month: 'May 2025', immunityScore: 54, herdExposure: 38, bubbleEvents: 4, portfolioAtRisk: 8900, correctCalls: 2 },
  { month: 'Jun 2025', immunityScore: 56, herdExposure: 34, bubbleEvents: 2, portfolioAtRisk: 7200, correctCalls: 2 },
  { month: 'Jul 2025', immunityScore: 58, herdExposure: 32, bubbleEvents: 3, portfolioAtRisk: 6800, correctCalls: 3 },
  { month: 'Aug 2025', immunityScore: 57, herdExposure: 35, bubbleEvents: 4, portfolioAtRisk: 7500, correctCalls: 2 },
  { month: 'Sep 2025', immunityScore: 59, herdExposure: 31, bubbleEvents: 2, portfolioAtRisk: 6400, correctCalls: 2 },
  { month: 'Oct 2025', immunityScore: 60, herdExposure: 30, bubbleEvents: 3, portfolioAtRisk: 6100, correctCalls: 3 },
  { month: 'Nov 2025', immunityScore: 58, herdExposure: 33, bubbleEvents: 4, portfolioAtRisk: 7000, correctCalls: 2 },
  { month: 'Dec 2025', immunityScore: 61, herdExposure: 29, bubbleEvents: 3, portfolioAtRisk: 5800, correctCalls: 3 },
  { month: 'Jan 2026', immunityScore: 60, herdExposure: 31, bubbleEvents: 5, portfolioAtRisk: 6500, correctCalls: 3 },
  { month: 'Feb 2026', immunityScore: 62, herdExposure: 28, bubbleEvents: 3, portfolioAtRisk: 5400, correctCalls: 3 },
  { month: 'Mar 2026', immunityScore: 63, herdExposure: 26, bubbleEvents: 4, portfolioAtRisk: 5100, correctCalls: 4 },
  { month: 'Apr 2026', immunityScore: 58, herdExposure: 32, bubbleEvents: 6, portfolioAtRisk: 6800, correctCalls: 3 },
];

export function getHerdSignals(): HerdSignal[] {
  return herdSignals;
}

export function getBubbleExposures(): BubbleExposure[] {
  return bubbleExposures;
}

export function getImmunityScores(): ImmunityScore[] {
  return immunityScores;
}

export function getHerdHistory(): HerdHistory[] {
  return herdHistoryData;
}

export function getHerdStats() {
  const activeSignals = herdSignals.filter(s => s.status === 'active' || s.status === 'building').length;
  const overallImmunity = Math.round(immunityScores.reduce((s, i) => s + i.score, 0) / immunityScores.length);
  const totalAtRisk = bubbleExposures.reduce((s, b) => s + (b.currentPrice - b.estimatedFairValue), 0);
  const extremeExposures = bubbleExposures.filter(b => b.riskLevel === 'extreme' || b.riskLevel === 'high').length;
  return { activeSignals, overallImmunity, totalAtRisk, extremeExposures };
}
