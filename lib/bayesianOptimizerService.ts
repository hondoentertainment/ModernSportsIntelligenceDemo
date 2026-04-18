// ---- Types ----

export interface PriorDistribution {
  id: string;
  assetName: string;
  player: string;
  sport: string;
  priorMean: number;
  priorStdDev: number;
  distributionType: 'normal' | 'log-normal' | 'student-t';
  confidence: number;
  source: string;
}

export interface PosteriorEstimate {
  id: string;
  assetName: string;
  player: string;
  priorMean: number;
  priorStdDev: number;
  posteriorMean: number;
  posteriorStdDev: number;
  observedReturn: number;
  shrinkageFactor: number;
  updatesApplied: number;
}

export interface AllocationResult {
  id: string;
  assetName: string;
  player: string;
  sport: string;
  priorWeight: number;
  posteriorWeight: number;
  currentValue: number;
  expectedReturn: number;
  risk: number;
  sharpeRatio: number;
}

export interface BayesianUpdate {
  id: string;
  date: string;
  assetName: string;
  player: string;
  eventType: string;
  priorMeanBefore: number;
  priorMeanAfter: number;
  priorStdBefore: number;
  priorStdAfter: number;
  observation: number;
  impact: string;
}

// ---- Mock Data ----

const mockPriors: PriorDistribution[] = [
  { id: 'pd-1', assetName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', priorMean: 8.5, priorStdDev: 4.2, distributionType: 'log-normal', confidence: 0.72, source: 'Historical elite rookie comps' },
  { id: 'pd-2', assetName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', sport: 'Baseball', priorMean: 12.4, priorStdDev: 6.8, distributionType: 'normal', confidence: 0.65, source: 'Ace pitcher historical trajectory' },
  { id: 'pd-3', assetName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', sport: 'Football', priorMean: 6.2, priorStdDev: 5.1, distributionType: 'student-t', confidence: 0.58, source: 'QB rookie card seasonal patterns' },
  { id: 'pd-4', assetName: '2018 Prizm Silver BGS 9.5', player: 'Luka Doncic', sport: 'Basketball', priorMean: 5.8, priorStdDev: 3.4, distributionType: 'normal', confidence: 0.78, source: 'Established superstar blue-chip data' },
  { id: 'pd-5', assetName: '2023 Bowman Chrome 1st Auto PSA 10', player: 'Jackson Holliday', sport: 'Baseball', priorMean: 10.2, priorStdDev: 7.5, distributionType: 'log-normal', confidence: 0.61, source: 'Top prospect call-up momentum' },
  { id: 'pd-6', assetName: '2020 Select Concourse PSA 10', player: 'Joe Burrow', sport: 'Football', priorMean: 7.4, priorStdDev: 4.8, distributionType: 'normal', confidence: 0.70, source: 'Super Bowl QB premium analysis' },
  { id: 'pd-7', assetName: '2023 Select Concourse PSA 10', player: 'CJ Stroud', sport: 'Football', priorMean: 9.1, priorStdDev: 5.6, distributionType: 'student-t', confidence: 0.63, source: 'Emerging QB star trajectory model' },
  { id: 'pd-8', assetName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', priorMean: 4.8, priorStdDev: 3.2, distributionType: 'normal', confidence: 0.74, source: 'Young star outfielder comps' },
];

const mockPosteriors: PosteriorEstimate[] = [
  { id: 'pe-1', assetName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', priorMean: 8.5, priorStdDev: 4.2, posteriorMean: 11.2, posteriorStdDev: 3.1, observedReturn: 14.8, shrinkageFactor: 0.68, updatesApplied: 8 },
  { id: 'pe-2', assetName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', priorMean: 12.4, priorStdDev: 6.8, posteriorMean: 14.8, posteriorStdDev: 4.5, observedReturn: 18.2, shrinkageFactor: 0.72, updatesApplied: 5 },
  { id: 'pe-3', assetName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', priorMean: 6.2, priorStdDev: 5.1, posteriorMean: 8.8, posteriorStdDev: 3.8, observedReturn: 12.4, shrinkageFactor: 0.65, updatesApplied: 6 },
  { id: 'pe-4', assetName: '2018 Prizm Silver BGS 9.5', player: 'Luka Doncic', priorMean: 5.8, priorStdDev: 3.4, posteriorMean: 7.2, posteriorStdDev: 2.6, observedReturn: 9.1, shrinkageFactor: 0.74, updatesApplied: 12 },
  { id: 'pe-5', assetName: '2023 Bowman Chrome 1st Auto PSA 10', player: 'Jackson Holliday', priorMean: 10.2, priorStdDev: 7.5, posteriorMean: 13.5, posteriorStdDev: 5.2, observedReturn: 18.4, shrinkageFactor: 0.62, updatesApplied: 4 },
  { id: 'pe-6', assetName: '2020 Select Concourse PSA 10', player: 'Joe Burrow', priorMean: 7.4, priorStdDev: 4.8, posteriorMean: 9.8, posteriorStdDev: 3.4, observedReturn: 13.2, shrinkageFactor: 0.70, updatesApplied: 7 },
  { id: 'pe-7', assetName: '2023 Select Concourse PSA 10', player: 'CJ Stroud', priorMean: 9.1, priorStdDev: 5.6, posteriorMean: 11.4, posteriorStdDev: 4.1, observedReturn: 14.6, shrinkageFactor: 0.67, updatesApplied: 5 },
  { id: 'pe-8', assetName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', priorMean: 4.8, priorStdDev: 3.2, posteriorMean: 3.2, posteriorStdDev: 2.4, observedReturn: -1.5, shrinkageFactor: 0.76, updatesApplied: 9 },
];

const mockAllocations: AllocationResult[] = [
  { id: 'ar-1', assetName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', sport: 'Basketball', priorWeight: 0.15, posteriorWeight: 0.19, currentValue: 11400, expectedReturn: 11.2, risk: 18.4, sharpeRatio: 0.61 },
  { id: 'ar-2', assetName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', sport: 'Baseball', priorWeight: 0.14, posteriorWeight: 0.17, currentValue: 1580, expectedReturn: 14.8, risk: 22.1, sharpeRatio: 0.67 },
  { id: 'ar-3', assetName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', sport: 'Football', priorWeight: 0.10, posteriorWeight: 0.12, currentValue: 165, expectedReturn: 8.8, risk: 28.2, sharpeRatio: 0.31 },
  { id: 'ar-4', assetName: '2018 Prizm Silver BGS 9.5', player: 'Luka Doncic', sport: 'Basketball', priorWeight: 0.18, posteriorWeight: 0.16, currentValue: 12500, expectedReturn: 7.2, risk: 14.5, sharpeRatio: 0.50 },
  { id: 'ar-5', assetName: '2023 Bowman Chrome 1st Auto PSA 10', player: 'Jackson Holliday', sport: 'Baseball', priorWeight: 0.12, posteriorWeight: 0.14, currentValue: 2850, expectedReturn: 13.5, risk: 24.8, sharpeRatio: 0.54 },
  { id: 'ar-6', assetName: '2020 Select Concourse PSA 10', player: 'Joe Burrow', sport: 'Football', priorWeight: 0.11, posteriorWeight: 0.10, currentValue: 195, expectedReturn: 9.8, risk: 19.2, sharpeRatio: 0.51 },
  { id: 'ar-7', assetName: '2023 Select Concourse PSA 10', player: 'CJ Stroud', sport: 'Football', priorWeight: 0.10, posteriorWeight: 0.08, currentValue: 245, expectedReturn: 11.4, risk: 21.5, sharpeRatio: 0.53 },
  { id: 'ar-8', assetName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', sport: 'Baseball', priorWeight: 0.10, posteriorWeight: 0.04, currentValue: 320, expectedReturn: 3.2, risk: 16.8, sharpeRatio: 0.19 },
];

const mockUpdates: BayesianUpdate[] = [
  { id: 'bu-1', date: '2026-04-17', assetName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', eventType: 'Playoff Performance', priorMeanBefore: 10.8, priorMeanAfter: 11.2, priorStdBefore: 3.3, priorStdAfter: 3.1, observation: 14.2, impact: 'Posterior shifted upward by strong playoff showing' },
  { id: 'bu-2', date: '2026-04-15', assetName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', eventType: 'Season Stats Update', priorMeanBefore: 14.2, priorMeanAfter: 14.8, priorStdBefore: 4.8, priorStdAfter: 4.5, observation: 16.5, impact: 'Dominant pitching stats tightened distribution' },
  { id: 'bu-3', date: '2026-04-12', assetName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', eventType: 'Draft Comp Analysis', priorMeanBefore: 8.2, priorMeanAfter: 8.8, priorStdBefore: 4.1, priorStdAfter: 3.8, observation: 11.8, impact: 'Favorable comp to historical QB trajectories' },
  { id: 'bu-4', date: '2026-04-10', assetName: '2018 Prizm Silver BGS 9.5', player: 'Luka Doncic', eventType: 'Trade Impact', priorMeanBefore: 6.8, priorMeanAfter: 7.2, priorStdBefore: 2.8, priorStdAfter: 2.6, observation: 8.4, impact: 'Championship contender trade boosted outlook' },
  { id: 'bu-5', date: '2026-04-08', assetName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', eventType: 'Injury Report', priorMeanBefore: 4.5, priorMeanAfter: 3.2, priorStdBefore: 2.8, priorStdAfter: 2.4, observation: -2.8, impact: 'Recovery concerns pulled posterior mean down significantly' },
  { id: 'bu-6', date: '2026-04-05', assetName: '2023 Bowman Chrome 1st Auto PSA 10', player: 'Jackson Holliday', eventType: 'Call-up News', priorMeanBefore: 12.8, priorMeanAfter: 13.5, priorStdBefore: 5.5, priorStdAfter: 5.2, observation: 15.8, impact: 'Prospect promotion catalyzed positive update' },
  { id: 'bu-7', date: '2026-04-02', assetName: '2020 Select Concourse PSA 10', player: 'Joe Burrow', eventType: 'Super Bowl Winner', priorMeanBefore: 8.8, priorMeanAfter: 9.8, priorStdBefore: 3.8, priorStdAfter: 3.4, observation: 13.2, impact: 'Championship premium significantly shifted posterior' },
  { id: 'bu-8', date: '2026-03-28', assetName: '2023 Select Concourse PSA 10', player: 'CJ Stroud', eventType: 'Playoff Exit', priorMeanBefore: 11.8, priorMeanAfter: 11.4, priorStdBefore: 4.4, priorStdAfter: 4.1, observation: 9.2, impact: 'Disappointing playoff finish tempered expectations slightly' },
  { id: 'bu-9', date: '2026-03-22', assetName: '2023 Prizm Silver PSA 10', player: 'Victor Wembanyama', eventType: 'All-Star Selection', priorMeanBefore: 10.2, priorMeanAfter: 10.8, priorStdBefore: 3.5, priorStdAfter: 3.3, observation: 12.8, impact: 'Starter selection validated superstar trajectory' },
  { id: 'bu-10', date: '2026-03-18', assetName: '2024 Topps Chrome Auto PSA 10', player: 'Paul Skenes', eventType: 'Population Report', priorMeanBefore: 13.5, priorMeanAfter: 14.2, priorStdBefore: 5.1, priorStdAfter: 4.8, observation: 16.1, impact: 'Low PSA 10 pop count increased scarcity premium' },
  { id: 'bu-11', date: '2026-03-12', assetName: '2023 Prizm Base PSA 10', player: 'Caleb Williams', eventType: 'Offseason Workout', priorMeanBefore: 7.8, priorMeanAfter: 8.2, priorStdBefore: 4.4, priorStdAfter: 4.1, observation: 10.5, impact: 'Positive training camp reports improved outlook' },
  { id: 'bu-12', date: '2026-03-05', assetName: '2022 Topps Chrome Auto PSA 10', player: 'Julio Rodriguez', eventType: 'MRI Results', priorMeanBefore: 5.8, priorMeanAfter: 4.5, priorStdBefore: 3.2, priorStdAfter: 2.8, observation: -4.2, impact: 'Concerning imaging results sharply revised expectations' },
];

// ---- Getter Functions ----

export function getPriorDistributions(): PriorDistribution[] {
  return mockPriors;
}

export function getPosteriorEstimates(): PosteriorEstimate[] {
  return mockPosteriors;
}

export function getAllocationResults(): AllocationResult[] {
  return mockAllocations;
}

export function getBayesianUpdates(): BayesianUpdate[] {
  return mockUpdates;
}

export function getPortfolioSummary() {
  const totalValue = mockAllocations.reduce((s, a) => s + a.currentValue, 0);
  const weightedReturn = mockAllocations.reduce((s, a) => s + a.expectedReturn * a.posteriorWeight, 0);
  const weightedRisk = Math.sqrt(mockAllocations.reduce((s, a) => s + Math.pow(a.risk * a.posteriorWeight, 2), 0));
  return {
    totalValue,
    expectedReturn: Math.round(weightedReturn * 100) / 100,
    portfolioRisk: Math.round(weightedRisk * 100) / 100,
    portfolioSharpe: Math.round((weightedReturn / weightedRisk) * 100) / 100,
    assetCount: mockAllocations.length,
    totalUpdates: mockUpdates.length,
  };
}
