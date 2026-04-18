// ---- Types ----

export type ReversionDirection = 'above-mean' | 'below-mean';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ReversionCandidate {
  id: string;
  cardName: string;
  player: string;
  sport: string;
  grade: string;
  currentPrice: number;
  historicalMean: number;
  deviationPercent: number;
  deviationScore: number;
  direction: ReversionDirection;
  expectedReversionDays: number;
  expectedReturnPercent: number;
  confidence: number;
  zScore: number;
  lastUpdated: string;
}

export interface MeanDeviationScore {
  category: string;
  avgDeviation: number;
  maxDeviation: number;
  candidateCount: number;
  avgZScore: number;
  avgReversionDays: number;
}

export interface ReversionHistory {
  month: string;
  signalsGenerated: number;
  signalsSuccessful: number;
  avgReturn: number;
  avgDaysToRevert: number;
  successRate: number;
}

export interface ReversionAlert {
  id: string;
  candidateId: string;
  cardName: string;
  player: string;
  severity: AlertSeverity;
  direction: ReversionDirection;
  deviationPercent: number;
  triggeredAt: string;
  message: string;
}

// ---- Mock Data ----

const mockCandidates: ReversionCandidate[] = [
  { id: 'rc-1', cardName: '2023 Bowman Chrome 1st Auto', player: 'Jackson Holliday', sport: 'Baseball', grade: 'PSA 10', currentPrice: 2850, historicalMean: 1950, deviationPercent: 46.2, deviationScore: 92, direction: 'above-mean', expectedReversionDays: 35, expectedReturnPercent: -28.4, confidence: 0.78, zScore: 2.34, lastUpdated: '2026-04-17' },
  { id: 'rc-2', cardName: '2020 Prizm Base', player: 'Justin Herbert', sport: 'Football', grade: 'PSA 10', currentPrice: 85, historicalMean: 145, deviationPercent: -41.4, deviationScore: 88, direction: 'below-mean', expectedReversionDays: 28, expectedReturnPercent: 42.1, confidence: 0.82, zScore: -2.18, lastUpdated: '2026-04-17' },
  { id: 'rc-3', cardName: '2018 Prizm Silver', player: 'Luka Doncic', sport: 'Basketball', grade: 'BGS 9.5', currentPrice: 12500, historicalMean: 9800, deviationPercent: 27.6, deviationScore: 76, direction: 'above-mean', expectedReversionDays: 42, expectedReturnPercent: -18.2, confidence: 0.71, zScore: 1.89, lastUpdated: '2026-04-16' },
  { id: 'rc-4', cardName: '2022 Topps Chrome Auto', player: 'Julio Rodriguez', sport: 'Baseball', grade: 'PSA 10', currentPrice: 320, historicalMean: 485, deviationPercent: -34.0, deviationScore: 84, direction: 'below-mean', expectedReversionDays: 31, expectedReturnPercent: 36.8, confidence: 0.79, zScore: -1.95, lastUpdated: '2026-04-17' },
  { id: 'rc-5', cardName: '2023 Optic Rated Rookie', player: 'Victor Wembanyama', sport: 'Basketball', grade: 'PSA 10', currentPrice: 890, historicalMean: 620, deviationPercent: 43.5, deviationScore: 90, direction: 'above-mean', expectedReversionDays: 38, expectedReturnPercent: -26.1, confidence: 0.75, zScore: 2.27, lastUpdated: '2026-04-17' },
  { id: 'rc-6', cardName: '2019 Topps Chrome Update Auto', player: 'Yordan Alvarez', sport: 'Baseball', grade: 'PSA 10', currentPrice: 410, historicalMean: 580, deviationPercent: -29.3, deviationScore: 78, direction: 'below-mean', expectedReversionDays: 25, expectedReturnPercent: 31.5, confidence: 0.81, zScore: -1.76, lastUpdated: '2026-04-16' },
  { id: 'rc-7', cardName: '2020 Select Concourse', player: 'Joe Burrow', sport: 'Football', grade: 'PSA 10', currentPrice: 195, historicalMean: 135, deviationPercent: 44.4, deviationScore: 91, direction: 'above-mean', expectedReversionDays: 32, expectedReturnPercent: -30.2, confidence: 0.77, zScore: 2.31, lastUpdated: '2026-04-17' },
  { id: 'rc-8', cardName: '2021 Bowman Chrome 1st', player: 'Marcelo Mayer', sport: 'Baseball', grade: 'PSA 10', currentPrice: 48, historicalMean: 82, deviationPercent: -41.5, deviationScore: 87, direction: 'below-mean', expectedReversionDays: 40, expectedReturnPercent: 44.2, confidence: 0.68, zScore: -2.15, lastUpdated: '2026-04-15' },
  { id: 'rc-9', cardName: '2023 Prizm Base', player: 'Caleb Williams', sport: 'Football', grade: 'PSA 10', currentPrice: 165, historicalMean: 110, deviationPercent: 50.0, deviationScore: 95, direction: 'above-mean', expectedReversionDays: 45, expectedReturnPercent: -32.8, confidence: 0.73, zScore: 2.56, lastUpdated: '2026-04-17' },
  { id: 'rc-10', cardName: '2022 Topps Chrome Refractor', player: 'Adley Rutschman', sport: 'Baseball', grade: 'PSA 10', currentPrice: 52, historicalMean: 78, deviationPercent: -33.3, deviationScore: 82, direction: 'below-mean', expectedReversionDays: 22, expectedReturnPercent: 35.1, confidence: 0.84, zScore: -1.91, lastUpdated: '2026-04-16' },
  { id: 'rc-11', cardName: '2019 Mosaic Base', player: 'Ja Morant', sport: 'Basketball', grade: 'PSA 10', currentPrice: 72, historicalMean: 120, deviationPercent: -40.0, deviationScore: 86, direction: 'below-mean', expectedReversionDays: 35, expectedReturnPercent: 41.8, confidence: 0.76, zScore: -2.08, lastUpdated: '2026-04-15' },
  { id: 'rc-12', cardName: '2024 Topps 1st Edition Auto', player: 'Paul Skenes', sport: 'Baseball', grade: 'PSA 10', currentPrice: 1450, historicalMean: 980, deviationPercent: 48.0, deviationScore: 93, direction: 'above-mean', expectedReversionDays: 50, expectedReturnPercent: -29.5, confidence: 0.70, zScore: 2.44, lastUpdated: '2026-04-17' },
  { id: 'rc-13', cardName: '2021 Donruss Rated Rookie', player: 'Trevor Lawrence', sport: 'Football', grade: 'PSA 10', currentPrice: 28, historicalMean: 45, deviationPercent: -37.8, deviationScore: 83, direction: 'below-mean', expectedReversionDays: 30, expectedReturnPercent: 38.9, confidence: 0.80, zScore: -2.01, lastUpdated: '2026-04-16' },
  { id: 'rc-14', cardName: '2023 Topps Chrome Auto', player: 'Corbin Carroll', sport: 'Baseball', grade: 'PSA 10', currentPrice: 680, historicalMean: 520, deviationPercent: 30.8, deviationScore: 79, direction: 'above-mean', expectedReversionDays: 28, expectedReturnPercent: -20.5, confidence: 0.74, zScore: 1.92, lastUpdated: '2026-04-15' },
  { id: 'rc-15', cardName: '2022 Prizm Silver', player: 'Paolo Banchero', sport: 'Basketball', grade: 'PSA 10', currentPrice: 95, historicalMean: 148, deviationPercent: -35.8, deviationScore: 85, direction: 'below-mean', expectedReversionDays: 33, expectedReturnPercent: 37.4, confidence: 0.78, zScore: -1.98, lastUpdated: '2026-04-17' },
  { id: 'rc-16', cardName: '2020 Topps Chrome Sapphire', player: 'Bo Bichette', sport: 'Baseball', grade: 'PSA 10', currentPrice: 185, historicalMean: 260, deviationPercent: -28.8, deviationScore: 77, direction: 'below-mean', expectedReversionDays: 26, expectedReturnPercent: 30.2, confidence: 0.82, zScore: -1.74, lastUpdated: '2026-04-16' },
  { id: 'rc-17', cardName: '2023 Select Concourse', player: 'CJ Stroud', sport: 'Football', grade: 'PSA 10', currentPrice: 245, historicalMean: 165, deviationPercent: 48.5, deviationScore: 94, direction: 'above-mean', expectedReversionDays: 36, expectedReturnPercent: -31.4, confidence: 0.76, zScore: 2.46, lastUpdated: '2026-04-17' },
  { id: 'rc-18', cardName: '2021 Topps Chrome Refractor', player: 'Wander Franco', sport: 'Baseball', grade: 'PSA 10', currentPrice: 42, historicalMean: 95, deviationPercent: -55.8, deviationScore: 98, direction: 'below-mean', expectedReversionDays: 60, expectedReturnPercent: 52.1, confidence: 0.62, zScore: -2.82, lastUpdated: '2026-04-17' },
];

const mockDeviationScores: MeanDeviationScore[] = [
  { category: 'Baseball Rookies', avgDeviation: 32.4, maxDeviation: 55.8, candidateCount: 7, avgZScore: 2.05, avgReversionDays: 34 },
  { category: 'Football Rookies', avgDeviation: 38.1, maxDeviation: 50.0, candidateCount: 5, avgZScore: 2.12, avgReversionDays: 33 },
  { category: 'Basketball Stars', avgDeviation: 35.7, maxDeviation: 43.5, candidateCount: 4, avgZScore: 2.06, avgReversionDays: 36 },
  { category: 'Graded PSA 10', avgDeviation: 36.8, maxDeviation: 55.8, candidateCount: 15, avgZScore: 2.11, avgReversionDays: 34 },
  { category: 'BGS 9.5', avgDeviation: 27.6, maxDeviation: 27.6, candidateCount: 1, avgZScore: 1.89, avgReversionDays: 42 },
  { category: 'Above Mean', avgDeviation: 42.4, maxDeviation: 50.0, candidateCount: 7, avgZScore: 2.33, avgReversionDays: 37 },
  { category: 'Below Mean', avgDeviation: 37.1, maxDeviation: 55.8, candidateCount: 11, avgZScore: -2.05, avgReversionDays: 32 },
];

const mockReversionHistory: ReversionHistory[] = [
  { month: '2024-05', signalsGenerated: 14, signalsSuccessful: 9, avgReturn: 18.4, avgDaysToRevert: 28, successRate: 64.3 },
  { month: '2024-06', signalsGenerated: 11, signalsSuccessful: 8, avgReturn: 22.1, avgDaysToRevert: 25, successRate: 72.7 },
  { month: '2024-07', signalsGenerated: 16, signalsSuccessful: 11, avgReturn: 15.8, avgDaysToRevert: 32, successRate: 68.8 },
  { month: '2024-08', signalsGenerated: 9, signalsSuccessful: 7, avgReturn: 24.5, avgDaysToRevert: 22, successRate: 77.8 },
  { month: '2024-09', signalsGenerated: 12, signalsSuccessful: 9, avgReturn: 19.2, avgDaysToRevert: 27, successRate: 75.0 },
  { month: '2024-10', signalsGenerated: 18, signalsSuccessful: 12, avgReturn: 16.7, avgDaysToRevert: 30, successRate: 66.7 },
  { month: '2024-11', signalsGenerated: 8, signalsSuccessful: 6, avgReturn: 21.3, avgDaysToRevert: 24, successRate: 75.0 },
  { month: '2024-12', signalsGenerated: 10, signalsSuccessful: 7, avgReturn: 17.9, avgDaysToRevert: 29, successRate: 70.0 },
  { month: '2025-01', signalsGenerated: 15, signalsSuccessful: 10, avgReturn: 20.6, avgDaysToRevert: 26, successRate: 66.7 },
  { month: '2025-02', signalsGenerated: 13, signalsSuccessful: 10, avgReturn: 23.4, avgDaysToRevert: 23, successRate: 76.9 },
  { month: '2025-03', signalsGenerated: 11, signalsSuccessful: 8, avgReturn: 18.8, avgDaysToRevert: 28, successRate: 72.7 },
  { month: '2025-04', signalsGenerated: 20, signalsSuccessful: 13, avgReturn: 14.2, avgDaysToRevert: 35, successRate: 65.0 },
];

const mockAlerts: ReversionAlert[] = [
  { id: 'ra-1', candidateId: 'rc-9', cardName: '2023 Prizm Base', player: 'Caleb Williams', severity: 'critical', direction: 'above-mean', deviationPercent: 50.0, triggeredAt: '2026-04-17T14:22:00Z', message: 'Extreme overvaluation detected - 2.56 standard deviations above mean' },
  { id: 'ra-2', candidateId: 'rc-18', cardName: '2021 Topps Chrome Refractor', player: 'Wander Franco', severity: 'critical', direction: 'below-mean', deviationPercent: -55.8, triggeredAt: '2026-04-17T12:15:00Z', message: 'Deep undervaluation - 2.82 standard deviations below mean' },
  { id: 'ra-3', candidateId: 'rc-12', cardName: '2024 Topps 1st Edition Auto', player: 'Paul Skenes', severity: 'high', direction: 'above-mean', deviationPercent: 48.0, triggeredAt: '2026-04-17T10:45:00Z', message: 'Strong overvaluation following recent hype cycle' },
  { id: 'ra-4', candidateId: 'rc-2', cardName: '2020 Prizm Base', player: 'Justin Herbert', severity: 'high', direction: 'below-mean', deviationPercent: -41.4, triggeredAt: '2026-04-17T09:30:00Z', message: 'Significant undervaluation - buying opportunity detected' },
  { id: 'ra-5', candidateId: 'rc-5', cardName: '2023 Optic Rated Rookie', player: 'Victor Wembanyama', severity: 'medium', direction: 'above-mean', deviationPercent: 43.5, triggeredAt: '2026-04-16T16:20:00Z', message: 'Elevated valuation driven by playoff performance narrative' },
];

// ---- Getter Functions ----

export function getReversionCandidates(): ReversionCandidate[] {
  return mockCandidates;
}

export function getDeviationScores(): MeanDeviationScore[] {
  return mockDeviationScores;
}

export function getReversionHistory(): ReversionHistory[] {
  return mockReversionHistory;
}

export function getReversionAlerts(): ReversionAlert[] {
  return mockAlerts;
}

export function getCandidatesByDirection(direction: ReversionDirection): ReversionCandidate[] {
  return mockCandidates.filter(c => c.direction === direction);
}

export function getTopCandidates(count: number = 5): ReversionCandidate[] {
  return [...mockCandidates].sort((a, b) => b.deviationScore - a.deviationScore).slice(0, count);
}
