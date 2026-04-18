// ---- Types ----

export interface KellyResult {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  currentPrice: number;
  winProbability: number;
  winReturn: number;
  lossProbability: number;
  lossReturn: number;
  fullKelly: number;
  halfKelly: number;
  quarterKelly: number;
  recommendedFraction: number;
  optimalPositionSize: number;
  edge: number;
  kellyRating: 'strong' | 'moderate' | 'weak' | 'negative';
}

export interface EdgeEstimate {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  estimatedEdge: number;
  edgeSource: string;
  confidence: number;
  historicalHitRate: number;
  avgWinSize: number;
  avgLossSize: number;
  sampleSize: number;
}

export interface PositionSize {
  portfolioValue: number;
  cardName: string;
  player: string;
  fullKellyDollars: number;
  halfKellyDollars: number;
  quarterKellyDollars: number;
  recommendedDollars: number;
  maxUnitsAtPrice: number;
  riskOfRuin: number;
}

export interface KellyHistory {
  month: string;
  avgKellyFraction: number;
  avgEdge: number;
  portfolioReturn: number;
  kellyReturn: number;
  overbet: number;
  underbet: number;
  optimalBets: number;
}

// ---- Mock Data ----

const portfolioValue = 85000;

const mockKellyResults: KellyResult[] = [
  { id: 'kr-1', cardName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', sport: 'Baseball', currentPrice: 1580, winProbability: 0.62, winReturn: 0.35, lossProbability: 0.38, lossReturn: -0.18, fullKelly: 0.248, halfKelly: 0.124, quarterKelly: 0.062, recommendedFraction: 0.124, optimalPositionSize: 10540, edge: 0.149, kellyRating: 'strong' },
  { id: 'kr-2', cardName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', currentPrice: 11400, winProbability: 0.58, winReturn: 0.28, lossProbability: 0.42, lossReturn: -0.22, fullKelly: 0.158, halfKelly: 0.079, quarterKelly: 0.040, recommendedFraction: 0.079, optimalPositionSize: 6715, edge: 0.070, kellyRating: 'moderate' },
  { id: 'kr-3', cardName: '2020 Prizm Base PSA 10', player: 'Justin Herbert', sport: 'Football', currentPrice: 85, winProbability: 0.68, winReturn: 0.42, lossProbability: 0.32, lossReturn: -0.15, fullKelly: 0.362, halfKelly: 0.181, quarterKelly: 0.090, recommendedFraction: 0.181, optimalPositionSize: 15385, edge: 0.238, kellyRating: 'strong' },
  { id: 'kr-4', cardName: '2023 Bowman Chrome 1st Auto PSA 10', player: 'Jackson Holliday', sport: 'Baseball', currentPrice: 2850, winProbability: 0.55, winReturn: 0.32, lossProbability: 0.45, lossReturn: -0.25, fullKelly: 0.098, halfKelly: 0.049, quarterKelly: 0.025, recommendedFraction: 0.049, optimalPositionSize: 4165, edge: 0.064, kellyRating: 'moderate' },
  { id: 'kr-5', cardName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', sport: 'Football', currentPrice: 165, winProbability: 0.60, winReturn: 0.38, lossProbability: 0.40, lossReturn: -0.20, fullKelly: 0.184, halfKelly: 0.092, quarterKelly: 0.046, recommendedFraction: 0.092, optimalPositionSize: 7820, edge: 0.148, kellyRating: 'strong' },
  { id: 'kr-6', cardName: '2018 Prizm Silver BGS 9.5', player: 'Luka Doncic', sport: 'Basketball', currentPrice: 12500, winProbability: 0.54, winReturn: 0.22, lossProbability: 0.46, lossReturn: -0.12, fullKelly: 0.128, halfKelly: 0.064, quarterKelly: 0.032, recommendedFraction: 0.064, optimalPositionSize: 5440, edge: 0.063, kellyRating: 'moderate' },
  { id: 'kr-7', cardName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', currentPrice: 320, winProbability: 0.65, winReturn: 0.36, lossProbability: 0.35, lossReturn: -0.14, fullKelly: 0.312, halfKelly: 0.156, quarterKelly: 0.078, recommendedFraction: 0.156, optimalPositionSize: 13260, edge: 0.185, kellyRating: 'strong' },
  { id: 'kr-8', cardName: '2023 Select Concourse PSA 10', player: 'CJ Stroud', sport: 'Football', currentPrice: 245, winProbability: 0.52, winReturn: 0.30, lossProbability: 0.48, lossReturn: -0.28, fullKelly: 0.028, halfKelly: 0.014, quarterKelly: 0.007, recommendedFraction: 0.014, optimalPositionSize: 1190, edge: 0.022, kellyRating: 'weak' },
  { id: 'kr-9', cardName: '2020 Select Concourse PSA 10', player: 'Joe Burrow', sport: 'Football', currentPrice: 195, winProbability: 0.61, winReturn: 0.34, lossProbability: 0.39, lossReturn: -0.16, fullKelly: 0.214, halfKelly: 0.107, quarterKelly: 0.054, recommendedFraction: 0.107, optimalPositionSize: 9095, edge: 0.145, kellyRating: 'strong' },
  { id: 'kr-10', cardName: '2021 Topps Chrome Refractor PSA 10', player: 'Wander Franco', sport: 'Baseball', currentPrice: 42, winProbability: 0.70, winReturn: 0.52, lossProbability: 0.30, lossReturn: -0.10, fullKelly: 0.498, halfKelly: 0.249, quarterKelly: 0.125, recommendedFraction: 0.249, optimalPositionSize: 21165, edge: 0.334, kellyRating: 'strong' },
  { id: 'kr-11', cardName: '2019 Mosaic Base PSA 10', player: 'Ja Morant', sport: 'Basketball', currentPrice: 72, winProbability: 0.63, winReturn: 0.41, lossProbability: 0.37, lossReturn: -0.18, fullKelly: 0.258, halfKelly: 0.129, quarterKelly: 0.065, recommendedFraction: 0.129, optimalPositionSize: 10965, edge: 0.192, kellyRating: 'strong' },
  { id: 'kr-12', cardName: '2024 Topps 1st Edition Auto PSA 10', player: 'Paul Skenes', sport: 'Baseball', currentPrice: 1450, winProbability: 0.56, winReturn: 0.30, lossProbability: 0.44, lossReturn: -0.24, fullKelly: 0.084, halfKelly: 0.042, quarterKelly: 0.021, recommendedFraction: 0.042, optimalPositionSize: 3570, edge: 0.062, kellyRating: 'moderate' },
  { id: 'kr-13', cardName: '2022 Prizm Silver PSA 10', player: 'Paolo Banchero', sport: 'Basketball', currentPrice: 95, winProbability: 0.64, winReturn: 0.37, lossProbability: 0.36, lossReturn: -0.15, fullKelly: 0.278, halfKelly: 0.139, quarterKelly: 0.070, recommendedFraction: 0.139, optimalPositionSize: 11815, edge: 0.183, kellyRating: 'strong' },
  { id: 'kr-14', cardName: '2023 Topps Chrome Auto PSA 10', player: 'Corbin Carroll', sport: 'Baseball', currentPrice: 680, winProbability: 0.51, winReturn: 0.25, lossProbability: 0.49, lossReturn: -0.22, fullKelly: 0.018, halfKelly: 0.009, quarterKelly: 0.005, recommendedFraction: 0.009, optimalPositionSize: 765, edge: 0.020, kellyRating: 'weak' },
  { id: 'kr-15', cardName: '2021 Donruss Rated Rookie PSA 10', player: 'Trevor Lawrence', sport: 'Football', currentPrice: 28, winProbability: 0.66, winReturn: 0.39, lossProbability: 0.34, lossReturn: -0.12, fullKelly: 0.342, halfKelly: 0.171, quarterKelly: 0.086, recommendedFraction: 0.171, optimalPositionSize: 14535, edge: 0.216, kellyRating: 'strong' },
];

const mockEdgeEstimates: EdgeEstimate[] = [
  { id: 'ee-1', cardName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', sport: 'Baseball', estimatedEdge: 0.149, edgeSource: 'Mean reversion from recent underpricing', confidence: 0.78, historicalHitRate: 0.62, avgWinSize: 0.35, avgLossSize: 0.18, sampleSize: 24 },
  { id: 'ee-2', cardName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', estimatedEdge: 0.070, edgeSource: 'Playoff momentum and generational talent premium', confidence: 0.72, historicalHitRate: 0.58, avgWinSize: 0.28, avgLossSize: 0.22, sampleSize: 18 },
  { id: 'ee-3', cardName: '2020 Prizm Base PSA 10', player: 'Justin Herbert', sport: 'Football', estimatedEdge: 0.238, edgeSource: 'Deep undervaluation post-injury - recovery priced in', confidence: 0.82, historicalHitRate: 0.68, avgWinSize: 0.42, avgLossSize: 0.15, sampleSize: 31 },
  { id: 'ee-4', cardName: '2021 Topps Chrome Refractor PSA 10', player: 'Wander Franco', sport: 'Baseball', estimatedEdge: 0.334, edgeSource: 'Extreme overreaction to off-field events - talent fundamentals intact', confidence: 0.65, historicalHitRate: 0.70, avgWinSize: 0.52, avgLossSize: 0.10, sampleSize: 15 },
  { id: 'ee-5', cardName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', estimatedEdge: 0.185, edgeSource: 'Injury recovery discount excessive given age and upside', confidence: 0.76, historicalHitRate: 0.65, avgWinSize: 0.36, avgLossSize: 0.14, sampleSize: 28 },
];

const mockKellyHistory: KellyHistory[] = [
  { month: '2025-05', avgKellyFraction: 0.18, avgEdge: 0.12, portfolioReturn: 4.2, kellyReturn: 5.8, overbet: 3, underbet: 5, optimalBets: 7 },
  { month: '2025-06', avgKellyFraction: 0.14, avgEdge: 0.08, portfolioReturn: -2.1, kellyReturn: -1.4, overbet: 4, underbet: 4, optimalBets: 6 },
  { month: '2025-07', avgKellyFraction: 0.12, avgEdge: 0.06, portfolioReturn: -3.8, kellyReturn: -2.2, overbet: 5, underbet: 3, optimalBets: 5 },
  { month: '2025-08', avgKellyFraction: 0.16, avgEdge: 0.10, portfolioReturn: 1.5, kellyReturn: 3.1, overbet: 3, underbet: 5, optimalBets: 7 },
  { month: '2025-09', avgKellyFraction: 0.19, avgEdge: 0.13, portfolioReturn: 5.8, kellyReturn: 7.2, overbet: 2, underbet: 4, optimalBets: 8 },
  { month: '2025-10', avgKellyFraction: 0.21, avgEdge: 0.15, portfolioReturn: 7.4, kellyReturn: 9.1, overbet: 2, underbet: 3, optimalBets: 9 },
  { month: '2025-11', avgKellyFraction: 0.22, avgEdge: 0.16, portfolioReturn: 8.2, kellyReturn: 10.4, overbet: 1, underbet: 4, optimalBets: 10 },
  { month: '2025-12', avgKellyFraction: 0.20, avgEdge: 0.14, portfolioReturn: 6.8, kellyReturn: 8.5, overbet: 2, underbet: 3, optimalBets: 9 },
  { month: '2026-01', avgKellyFraction: 0.23, avgEdge: 0.17, portfolioReturn: 9.4, kellyReturn: 11.8, overbet: 1, underbet: 3, optimalBets: 11 },
  { month: '2026-02', avgKellyFraction: 0.22, avgEdge: 0.16, portfolioReturn: 8.8, kellyReturn: 10.9, overbet: 2, underbet: 2, optimalBets: 10 },
  { month: '2026-03', avgKellyFraction: 0.21, avgEdge: 0.15, portfolioReturn: 7.6, kellyReturn: 9.8, overbet: 2, underbet: 3, optimalBets: 9 },
  { month: '2026-04', avgKellyFraction: 0.24, avgEdge: 0.18, portfolioReturn: 8.1, kellyReturn: 11.2, overbet: 1, underbet: 2, optimalBets: 12 },
];

// ---- Getter Functions ----

export function getKellyResults(): KellyResult[] {
  return mockKellyResults;
}

export function getEdgeEstimates(): EdgeEstimate[] {
  return mockEdgeEstimates;
}

export function getPositionSizes(): PositionSize[] {
  return mockKellyResults.map(kr => ({
    portfolioValue,
    cardName: kr.cardName,
    player: kr.player,
    fullKellyDollars: Math.round(portfolioValue * kr.fullKelly),
    halfKellyDollars: Math.round(portfolioValue * kr.halfKelly),
    quarterKellyDollars: Math.round(portfolioValue * kr.quarterKelly),
    recommendedDollars: kr.optimalPositionSize,
    maxUnitsAtPrice: Math.floor(kr.optimalPositionSize / kr.currentPrice),
    riskOfRuin: Math.round(Math.pow(kr.lossProbability / kr.winProbability, 3) * 10000) / 100,
  }));
}

export function getKellyHistory(): KellyHistory[] {
  return mockKellyHistory;
}

export function getPortfolioValue(): number {
  return portfolioValue;
}

export function getStrongBets(): KellyResult[] {
  return mockKellyResults.filter(kr => kr.kellyRating === 'strong');
}
