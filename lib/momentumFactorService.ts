// ---- Types ----

export interface MomentumFactor {
  id: string;
  name: string;
  description: string;
  currentWeight: number;
  avgContribution: number;
  volatility: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  color: string;
}

export interface FactorWeight {
  factorId: string;
  factorName: string;
  month: string;
  weight: number;
  contribution: number;
}

export interface FactorDecomposition {
  cardId: string;
  cardName: string;
  player: string;
  sport: string;
  totalMomentum: number;
  factors: { factorId: string; factorName: string; contribution: number; weight: number }[];
}

export interface MomentumHistory {
  month: string;
  totalMomentum: number;
  scarcity: number;
  narrative: number;
  performance: number;
  seasonality: number;
  gradeInflation: number;
  marketSentiment: number;
  crossSport: number;
  rookieHype: number;
}

// ---- Mock Data ----

const mockFactors: MomentumFactor[] = [
  { id: 'mf-1', name: 'Scarcity', description: 'Population report changes and print run scarcity dynamics', currentWeight: 0.22, avgContribution: 3.8, volatility: 8.4, trend: 'increasing', color: '#f59e0b' },
  { id: 'mf-2', name: 'Narrative', description: 'Media coverage, social buzz, and storyline momentum', currentWeight: 0.18, avgContribution: 2.9, volatility: 15.2, trend: 'stable', color: '#8b5cf6' },
  { id: 'mf-3', name: 'Performance', description: 'On-field/court athletic performance and statistics', currentWeight: 0.20, avgContribution: 3.4, volatility: 12.1, trend: 'increasing', color: '#22c55e' },
  { id: 'mf-4', name: 'Seasonality', description: 'Calendar-driven demand cycles (playoffs, off-season, draft)', currentWeight: 0.12, avgContribution: 1.8, volatility: 6.5, trend: 'decreasing', color: '#06b6d4' },
  { id: 'mf-5', name: 'Grade Inflation', description: 'PSA/BGS population shifts affecting relative scarcity', currentWeight: 0.08, avgContribution: 1.2, volatility: 4.8, trend: 'stable', color: '#ec4899' },
  { id: 'mf-6', name: 'Market Sentiment', description: 'Overall collector confidence and buying activity levels', currentWeight: 0.10, avgContribution: 1.6, volatility: 11.3, trend: 'increasing', color: '#3b82f6' },
  { id: 'mf-7', name: 'Cross-Sport Spillover', description: 'Momentum transfer between sports categories', currentWeight: 0.05, avgContribution: 0.7, volatility: 7.9, trend: 'stable', color: '#f97316' },
  { id: 'mf-8', name: 'Rookie Hype Cycle', description: 'New player entry excitement and prospect fever dynamics', currentWeight: 0.05, avgContribution: 0.9, volatility: 18.4, trend: 'decreasing', color: '#ef4444' },
];

const mockDecompositions: FactorDecomposition[] = [
  {
    cardId: 'fd-1', cardName: '2024 Topps Chrome Auto', player: 'Paul Skenes', sport: 'Baseball', totalMomentum: 28.4,
    factors: [
      { factorId: 'mf-3', factorName: 'Performance', contribution: 8.2, weight: 0.29 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: 6.8, weight: 0.24 },
      { factorId: 'mf-8', factorName: 'Rookie Hype Cycle', contribution: 5.4, weight: 0.19 },
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: 4.1, weight: 0.14 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: 2.3, weight: 0.08 },
      { factorId: 'mf-4', factorName: 'Seasonality', contribution: 1.6, weight: 0.06 },
    ],
  },
  {
    cardId: 'fd-2', cardName: '2023 Prizm Silver', player: 'Victor Wembanyama', sport: 'Basketball', totalMomentum: 22.1,
    factors: [
      { factorId: 'mf-3', factorName: 'Performance', contribution: 7.4, weight: 0.33 },
      { factorId: 'mf-4', factorName: 'Seasonality', contribution: 4.8, weight: 0.22 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: 4.2, weight: 0.19 },
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: 3.1, weight: 0.14 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: 1.8, weight: 0.08 },
      { factorId: 'mf-5', factorName: 'Grade Inflation', contribution: 0.8, weight: 0.04 },
    ],
  },
  {
    cardId: 'fd-3', cardName: '2023 Prizm Base', player: 'Caleb Williams', sport: 'Football', totalMomentum: 18.7,
    factors: [
      { factorId: 'mf-8', factorName: 'Rookie Hype Cycle', contribution: 6.2, weight: 0.33 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: 4.5, weight: 0.24 },
      { factorId: 'mf-3', factorName: 'Performance', contribution: 3.8, weight: 0.20 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: 2.4, weight: 0.13 },
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: 1.2, weight: 0.06 },
      { factorId: 'mf-7', factorName: 'Cross-Sport Spillover', contribution: 0.6, weight: 0.03 },
    ],
  },
  {
    cardId: 'fd-4', cardName: '2020 Prizm Silver', player: 'Justin Herbert', sport: 'Football', totalMomentum: -12.5,
    factors: [
      { factorId: 'mf-3', factorName: 'Performance', contribution: -4.8, weight: 0.38 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: -3.2, weight: 0.26 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: -2.1, weight: 0.17 },
      { factorId: 'mf-4', factorName: 'Seasonality', contribution: -1.4, weight: 0.11 },
      { factorId: 'mf-5', factorName: 'Grade Inflation', contribution: -0.6, weight: 0.05 },
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: -0.4, weight: 0.03 },
    ],
  },
  {
    cardId: 'fd-5', cardName: '2018 Prizm Silver', player: 'Luka Doncic', sport: 'Basketball', totalMomentum: 15.3,
    factors: [
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: 5.8, weight: 0.38 },
      { factorId: 'mf-3', factorName: 'Performance', contribution: 4.2, weight: 0.27 },
      { factorId: 'mf-4', factorName: 'Seasonality', contribution: 2.8, weight: 0.18 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: 1.5, weight: 0.10 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: 0.8, weight: 0.05 },
      { factorId: 'mf-7', factorName: 'Cross-Sport Spillover', contribution: 0.2, weight: 0.01 },
    ],
  },
  {
    cardId: 'fd-6', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', sport: 'Baseball', totalMomentum: 24.8,
    factors: [
      { factorId: 'mf-8', factorName: 'Rookie Hype Cycle', contribution: 7.8, weight: 0.31 },
      { factorId: 'mf-3', factorName: 'Performance', contribution: 5.6, weight: 0.23 },
      { factorId: 'mf-1', factorName: 'Scarcity', contribution: 4.8, weight: 0.19 },
      { factorId: 'mf-2', factorName: 'Narrative', contribution: 3.4, weight: 0.14 },
      { factorId: 'mf-6', factorName: 'Market Sentiment', contribution: 2.1, weight: 0.08 },
      { factorId: 'mf-4', factorName: 'Seasonality', contribution: 1.1, weight: 0.04 },
    ],
  },
];

const mockMomentumHistory: MomentumHistory[] = [
  { month: '2025-05', totalMomentum: 8.4, scarcity: 2.1, narrative: 1.8, performance: 2.4, seasonality: 0.8, gradeInflation: 0.3, marketSentiment: 0.6, crossSport: 0.2, rookieHype: 0.2 },
  { month: '2025-06', totalMomentum: -3.2, scarcity: 0.8, narrative: -1.4, performance: -1.8, seasonality: -0.4, gradeInflation: -0.1, marketSentiment: -0.8, crossSport: 0.1, rookieHype: 0.4 },
  { month: '2025-07', totalMomentum: -5.8, scarcity: -0.4, narrative: -2.1, performance: -1.6, seasonality: -0.8, gradeInflation: -0.2, marketSentiment: -1.2, crossSport: 0.1, rookieHype: 0.4 },
  { month: '2025-08', totalMomentum: 2.1, scarcity: 1.2, narrative: 0.4, performance: 0.8, seasonality: -0.6, gradeInflation: 0.1, marketSentiment: -0.2, crossSport: 0.2, rookieHype: 0.2 },
  { month: '2025-09', totalMomentum: 6.5, scarcity: 1.8, narrative: 1.2, performance: 2.1, seasonality: 0.4, gradeInflation: 0.2, marketSentiment: 0.4, crossSport: 0.1, rookieHype: 0.3 },
  { month: '2025-10', totalMomentum: 10.2, scarcity: 2.4, narrative: 2.8, performance: 2.6, seasonality: 1.2, gradeInflation: 0.1, marketSentiment: 0.5, crossSport: 0.3, rookieHype: 0.3 },
  { month: '2025-11', totalMomentum: 12.8, scarcity: 2.8, narrative: 3.2, performance: 3.1, seasonality: 1.6, gradeInflation: 0.4, marketSentiment: 0.8, crossSport: 0.4, rookieHype: 0.5 },
  { month: '2025-12', totalMomentum: 9.4, scarcity: 2.2, narrative: 1.8, performance: 2.4, seasonality: 1.4, gradeInflation: 0.3, marketSentiment: 0.6, crossSport: 0.3, rookieHype: 0.4 },
  { month: '2026-01', totalMomentum: 14.6, scarcity: 3.1, narrative: 2.4, performance: 3.8, seasonality: 2.1, gradeInflation: 0.5, marketSentiment: 1.2, crossSport: 0.6, rookieHype: 0.9 },
  { month: '2026-02', totalMomentum: 16.2, scarcity: 3.4, narrative: 3.1, performance: 4.2, seasonality: 1.8, gradeInflation: 0.6, marketSentiment: 1.4, crossSport: 0.8, rookieHype: 0.9 },
  { month: '2026-03', totalMomentum: 13.8, scarcity: 3.0, narrative: 2.6, performance: 3.5, seasonality: 1.5, gradeInflation: 0.4, marketSentiment: 1.1, crossSport: 0.7, rookieHype: 1.0 },
  { month: '2026-04', totalMomentum: 15.4, scarcity: 3.3, narrative: 2.8, performance: 3.9, seasonality: 1.9, gradeInflation: 0.5, marketSentiment: 1.3, crossSport: 0.8, rookieHype: 0.9 },
];

const mockWeightHistory: FactorWeight[] = [];
mockFactors.forEach(f => {
  mockMomentumHistory.forEach(h => {
    const key = f.name.toLowerCase().replace(/[\s-]/g, '') as string;
    const val = (h as Record<string, number | string>)[
      key === 'scarcity' ? 'scarcity' :
      key === 'narrative' ? 'narrative' :
      key === 'performance' ? 'performance' :
      key === 'seasonality' ? 'seasonality' :
      key === 'gradeinflation' ? 'gradeInflation' :
      key === 'marketsentiment' ? 'marketSentiment' :
      key === 'crosssportspillover' ? 'crossSport' :
      'rookieHype'
    ] as number;
    mockWeightHistory.push({
      factorId: f.id,
      factorName: f.name,
      month: h.month,
      weight: f.currentWeight + (Math.random() - 0.5) * 0.04,
      contribution: val,
    });
  });
});

// ---- Getter Functions ----

export function getMomentumFactors(): MomentumFactor[] {
  return mockFactors;
}

export function getFactorDecompositions(): FactorDecomposition[] {
  return mockDecompositions;
}

export function getMomentumHistory(): MomentumHistory[] {
  return mockMomentumHistory;
}

export function getFactorWeightHistory(): FactorWeight[] {
  return mockWeightHistory;
}

export function getFactorById(id: string): MomentumFactor | undefined {
  return mockFactors.find(f => f.id === id);
}
