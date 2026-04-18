// Paradox of Choice Optimizer Service
// Reduce decision paralysis in large opportunity sets using smart filtering

export interface ChoiceOverload {
  id: string;
  category: string;
  totalOptions: number;
  avgDecisionTime: string;
  decisionParalysis: number;
  regretRate: number;
  satisfactionScore: number;
  description: string;
}

export interface FilteredOpportunity {
  id: string;
  cardName: string;
  sport: string;
  price: number;
  projectedReturn: number;
  confidenceScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  matchScore: number;
  reason: string;
  category: string;
  rank: number;
  isTopPick: boolean;
}

export interface DecisionQuality {
  month: string;
  filteredDecisions: number;
  unfilteredDecisions: number;
  filteredSuccessRate: number;
  unfilteredSuccessRate: number;
  avgFilteredReturn: number;
  avgUnfilteredReturn: number;
  timeSaved: number;
}

export interface OptimizationResult {
  metric: string;
  before: number;
  after: number;
  improvement: number;
  unit: string;
  description: string;
}

const choiceOverloads: ChoiceOverload[] = [
  { id: 'co-1', category: 'Football Rookies', totalOptions: 485, avgDecisionTime: '4.2 hours', decisionParalysis: 78, regretRate: 45, satisfactionScore: 42, description: 'Hundreds of rookie options across Prizm, Select, Optic, Mosaic creates overwhelming choice' },
  { id: 'co-2', category: 'Baseball Prospects', totalOptions: 620, avgDecisionTime: '5.8 hours', decisionParalysis: 85, regretRate: 52, satisfactionScore: 35, description: 'Bowman Chrome, Draft, and multiple prospect sets create massive option pools' },
  { id: 'co-3', category: 'Basketball Stars', totalOptions: 340, avgDecisionTime: '3.5 hours', decisionParalysis: 65, regretRate: 38, satisfactionScore: 48, description: 'Multiple parallels and products for each star player multiply choices' },
  { id: 'co-4', category: 'Grading Decisions', totalOptions: 180, avgDecisionTime: '2.8 hours', decisionParalysis: 72, regretRate: 42, satisfactionScore: 40, description: 'PSA vs BGS vs SGC vs CGC - which service for which card overwhelms' },
  { id: 'co-5', category: 'Parallel Selection', totalOptions: 890, avgDecisionTime: '6.5 hours', decisionParalysis: 92, regretRate: 58, satisfactionScore: 28, description: 'Base, Silver, Gold, Green, Blue, Red, Black - parallel overload is extreme' },
  { id: 'co-6', category: 'Vintage vs Modern', totalOptions: 250, avgDecisionTime: '3.1 hours', decisionParalysis: 55, regretRate: 32, satisfactionScore: 55, description: 'Allocating budget between vintage stability and modern upside' },
  { id: 'co-7', category: 'Auction vs Fixed Price', totalOptions: 420, avgDecisionTime: '2.2 hours', decisionParalysis: 48, regretRate: 35, satisfactionScore: 52, description: 'When to bid at auction vs buy immediately at fixed price' },
];

const allOpportunities: FilteredOpportunity[] = [
  { id: 'fo-1', cardName: '2024 Topps Chrome Paul Skenes RC Auto PSA 10', sport: 'Baseball', price: 380, projectedReturn: 28, confidenceScore: 82, riskLevel: 'medium', matchScore: 94, reason: 'Elite pitching prospect with Cy Young trajectory and strong demand', category: 'Baseball Prospects', rank: 1, isTopPick: true },
  { id: 'fo-2', cardName: '2024 Prizm Jayden Daniels RC PSA 10', sport: 'Football', price: 155, projectedReturn: 32, confidenceScore: 78, riskLevel: 'medium', matchScore: 91, reason: 'OROY with rushing upside creates dual-threat premium', category: 'Football Rookies', rank: 2, isTopPick: true },
  { id: 'fo-3', cardName: '2023 Prizm Victor Wembanyama RC Silver PSA 10', sport: 'Basketball', price: 1250, projectedReturn: 22, confidenceScore: 75, riskLevel: 'medium', matchScore: 89, reason: 'Generational talent with growing international demand', category: 'Basketball Stars', rank: 3, isTopPick: true },
  { id: 'fo-4', cardName: '2011 Topps Update Mike Trout RC PSA 9', sport: 'Baseball', price: 2800, projectedReturn: 12, confidenceScore: 88, riskLevel: 'low', matchScore: 87, reason: 'Blue-chip vintage modern with proven appreciation history', category: 'Vintage Modern', rank: 4, isTopPick: true },
  { id: 'fo-5', cardName: '2024 Select CJ Stroud RC Concourse PSA 10', sport: 'Football', price: 85, projectedReturn: 35, confidenceScore: 74, riskLevel: 'medium', matchScore: 86, reason: 'Proven NFL star at accessible price point with upside', category: 'Football Rookies', rank: 5, isTopPick: true },
  { id: 'fo-6', cardName: '2024 Topps Chrome Elly De La Cruz Auto', sport: 'Baseball', price: 285, projectedReturn: 25, confidenceScore: 72, riskLevel: 'medium', matchScore: 83, reason: 'Five-tool player with highlight potential driving sustained demand', category: 'Baseball Prospects', rank: 6, isTopPick: false },
  { id: 'fo-7', cardName: '2023 Bowman Chrome Jackson Holliday 1st Auto', sport: 'Baseball', price: 340, projectedReturn: 20, confidenceScore: 68, riskLevel: 'high', matchScore: 80, reason: 'Top prospect approaching established role - high ceiling', category: 'Baseball Prospects', rank: 7, isTopPick: false },
  { id: 'fo-8', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', price: 175, projectedReturn: 18, confidenceScore: 65, riskLevel: 'high', matchScore: 78, reason: 'Number 1 pick with talent but needs to prove NFL consistency', category: 'Football Rookies', rank: 8, isTopPick: false },
  { id: 'fo-9', cardName: '2018 Topps Update Shohei Ohtani RC PSA 10', sport: 'Baseball', price: 680, projectedReturn: 15, confidenceScore: 80, riskLevel: 'low', matchScore: 77, reason: 'Historic two-way player with milestone chases ahead', category: 'Modern Stars', rank: 9, isTopPick: false },
  { id: 'fo-10', cardName: '2023 Prizm Connor Bedard RC PSA 10', sport: 'Hockey', price: 185, projectedReturn: 24, confidenceScore: 70, riskLevel: 'medium', matchScore: 75, reason: 'Generational hockey talent at lower market tier entry', category: 'Hockey', rank: 10, isTopPick: false },
  { id: 'fo-11', cardName: '2024 Donruss Optic Drake Maye RC PSA 10', sport: 'Football', price: 65, projectedReturn: 30, confidenceScore: 58, riskLevel: 'high', matchScore: 72, reason: 'Affordable QB rookie with starter upside', category: 'Football Rookies', rank: 11, isTopPick: false },
  { id: 'fo-12', cardName: '2022 Topps Chrome Julio Rodriguez Auto', sport: 'Baseball', price: 225, projectedReturn: 18, confidenceScore: 72, riskLevel: 'medium', matchScore: 71, reason: 'Young star with long-term contract security', category: 'Modern Stars', rank: 12, isTopPick: false },
  { id: 'fo-13', cardName: '2024 Prizm Caitlin Clark RC', sport: 'Basketball', price: 125, projectedReturn: 15, confidenceScore: 55, riskLevel: 'high', matchScore: 68, reason: 'Cultural icon status but WNBA card market unproven long-term', category: 'Basketball Stars', rank: 13, isTopPick: false },
  { id: 'fo-14', cardName: '1986 Fleer Michael Jordan RC PSA 6', sport: 'Basketball', price: 4500, projectedReturn: 8, confidenceScore: 85, riskLevel: 'low', matchScore: 67, reason: 'Trophy card with consistent demand and liquidity', category: 'Vintage', rank: 14, isTopPick: false },
  { id: 'fo-15', cardName: '2024 Bowman Chrome Travis Bazzana 1st Auto', sport: 'Baseball', price: 95, projectedReturn: 28, confidenceScore: 52, riskLevel: 'high', matchScore: 65, reason: 'First overall pick - lottery ticket with high upside', category: 'Baseball Prospects', rank: 15, isTopPick: false },
  { id: 'fo-16', cardName: '2020 Prizm Justin Jefferson RC PSA 10', sport: 'Football', price: 185, projectedReturn: 14, confidenceScore: 74, riskLevel: 'low', matchScore: 64, reason: 'Elite WR with established floor but limited ceiling', category: 'Modern Stars', rank: 16, isTopPick: false },
  { id: 'fo-17', cardName: '2023 Select Anthony Richardson RC', sport: 'Football', price: 45, projectedReturn: 35, confidenceScore: 48, riskLevel: 'high', matchScore: 62, reason: 'Extremely volatile - high ceiling/low floor proposition', category: 'Football Rookies', rank: 17, isTopPick: false },
  { id: 'fo-18', cardName: '2024 Topps Heritage Shohei Ohtani SP', sport: 'Baseball', price: 55, projectedReturn: 12, confidenceScore: 68, riskLevel: 'low', matchScore: 60, reason: 'Affordable entry to premium player at low risk', category: 'Modern Stars', rank: 18, isTopPick: false },
  { id: 'fo-19', cardName: '2022 Panini Prizm Tyrese Maxey RC PSA 10', sport: 'Basketball', price: 95, projectedReturn: 20, confidenceScore: 62, riskLevel: 'medium', matchScore: 58, reason: 'Emerging star at reasonable price with All-Star potential', category: 'Basketball Stars', rank: 19, isTopPick: false },
  { id: 'fo-20', cardName: '2024 Topps Series 1 Junior Caminero RC', sport: 'Baseball', price: 18, projectedReturn: 40, confidenceScore: 42, riskLevel: 'high', matchScore: 55, reason: 'Ultra-affordable prospect lottery with long development timeline', category: 'Baseball Prospects', rank: 20, isTopPick: false },
  { id: 'fo-21', cardName: '2023 Prizm Lamar Jackson PSA 10', sport: 'Football', price: 120, projectedReturn: 10, confidenceScore: 70, riskLevel: 'low', matchScore: 53, reason: 'MVP caliber but card values plateauing', category: 'Modern Stars', rank: 21, isTopPick: false },
  { id: 'fo-22', cardName: '2024 Bowman Draft JJ Wetherholt 1st', sport: 'Baseball', price: 35, projectedReturn: 32, confidenceScore: 45, riskLevel: 'high', matchScore: 51, reason: 'Top college performer but lengthy development path', category: 'Baseball Prospects', rank: 22, isTopPick: false },
  { id: 'fo-23', cardName: '2020 Select Patrick Mahomes PSA 10', sport: 'Football', price: 280, projectedReturn: 6, confidenceScore: 78, riskLevel: 'low', matchScore: 48, reason: 'Blue chip but fully priced - limited upside remaining', category: 'Modern Stars', rank: 23, isTopPick: false },
  { id: 'fo-24', cardName: '2024 Prizm Marvin Harrison Jr RC', sport: 'Football', price: 75, projectedReturn: 22, confidenceScore: 55, riskLevel: 'high', matchScore: 46, reason: 'Elite prospect but rookie WR regression is common', category: 'Football Rookies', rank: 24, isTopPick: false },
  { id: 'fo-25', cardName: '2023 Topps Chrome Corbin Carroll Auto', sport: 'Baseball', price: 155, projectedReturn: 15, confidenceScore: 60, riskLevel: 'medium', matchScore: 44, reason: 'ROY winner but sophomore slump risk exists', category: 'Modern Stars', rank: 25, isTopPick: false },
];

const decisionQualityData: DecisionQuality[] = [
  { month: 'Nov 2025', filteredDecisions: 5, unfilteredDecisions: 12, filteredSuccessRate: 80, unfilteredSuccessRate: 42, avgFilteredReturn: 22, avgUnfilteredReturn: 8, timeSaved: 18 },
  { month: 'Dec 2025', filteredDecisions: 7, unfilteredDecisions: 15, filteredSuccessRate: 71, unfilteredSuccessRate: 38, avgFilteredReturn: 18, avgUnfilteredReturn: 5, timeSaved: 24 },
  { month: 'Jan 2026', filteredDecisions: 6, unfilteredDecisions: 10, filteredSuccessRate: 83, unfilteredSuccessRate: 45, avgFilteredReturn: 25, avgUnfilteredReturn: 10, timeSaved: 15 },
  { month: 'Feb 2026', filteredDecisions: 4, unfilteredDecisions: 11, filteredSuccessRate: 75, unfilteredSuccessRate: 36, avgFilteredReturn: 20, avgUnfilteredReturn: 6, timeSaved: 20 },
  { month: 'Mar 2026', filteredDecisions: 8, unfilteredDecisions: 14, filteredSuccessRate: 88, unfilteredSuccessRate: 40, avgFilteredReturn: 28, avgUnfilteredReturn: 9, timeSaved: 22 },
  { month: 'Apr 2026', filteredDecisions: 5, unfilteredDecisions: 8, filteredSuccessRate: 80, unfilteredSuccessRate: 44, avgFilteredReturn: 24, avgUnfilteredReturn: 11, timeSaved: 12 },
];

const optimizationResults: OptimizationResult[] = [
  { metric: 'Decision Time', before: 4.2, after: 1.1, improvement: 73.8, unit: 'hours', description: 'Time spent analyzing opportunities before purchasing' },
  { metric: 'Options Evaluated', before: 25, after: 5, improvement: 80.0, unit: 'cards', description: 'Number of options considered per purchase decision' },
  { metric: 'Success Rate', before: 41, after: 79, improvement: 92.7, unit: '%', description: 'Percentage of purchases that yielded positive returns' },
  { metric: 'Regret Rate', before: 48, after: 18, improvement: 62.5, unit: '%', description: 'How often you wish you had chosen differently' },
  { metric: 'Satisfaction Score', before: 38, after: 78, improvement: 105.3, unit: 'pts', description: 'Overall satisfaction with purchase decisions' },
  { metric: 'Average Return', before: 8, after: 23, improvement: 187.5, unit: '%', description: 'Average return on card investments' },
];

export function getChoiceOverloads(): ChoiceOverload[] {
  return choiceOverloads;
}

export function getFilteredOpportunities(): FilteredOpportunity[] {
  return allOpportunities;
}

export function getTopPicks(): FilteredOpportunity[] {
  return allOpportunities.filter(o => o.isTopPick);
}

export function getDecisionQuality(): DecisionQuality[] {
  return decisionQualityData;
}

export function getOptimizationResults(): OptimizationResult[] {
  return optimizationResults;
}

export function getParadoxStats() {
  const topPicks = allOpportunities.filter(o => o.isTopPick).length;
  const totalOptions = allOpportunities.length;
  const avgConfidence = Math.round(allOpportunities.filter(o => o.isTopPick).reduce((s, o) => s + o.confidenceScore, 0) / topPicks);
  const latestQuality = decisionQualityData[decisionQualityData.length - 1];
  return { topPicks, totalOptions, avgTopConfidence: avgConfidence, successRate: latestQuality.filteredSuccessRate, reductionPct: Math.round(((totalOptions - topPicks) / totalOptions) * 100) };
}
