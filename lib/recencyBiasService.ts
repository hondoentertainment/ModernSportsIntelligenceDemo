// Recency Bias Corrector Service
// Weight older data appropriately against recent trend overweighting

export interface RecencyBias {
  id: string;
  cardName: string;
  sport: string;
  recentTrendValue: number;
  historicalAvgValue: number;
  correctedValue: number;
  recencyWeight: number;
  historicalWeight: number;
  biasAmount: number;
  biasDirection: 'overvalued' | 'undervalued';
  recentPeriod: string;
  historicalPeriod: string;
}

export interface CorrectedForecast {
  cardName: string;
  naiveForecast: number;
  correctedForecast: number;
  forecastDifference: number;
  confidenceLevel: number;
  timeframe: string;
}

export interface TimeWeighting {
  period: string;
  naiveWeight: number;
  correctedWeight: number;
  dataPoints: number;
  description: string;
}

export interface BiasCorrection {
  month: string;
  avgRecencyBias: number;
  correctionsApplied: number;
  accuracyImprovement: number;
  overvaluedCards: number;
  undervaluedCards: number;
}

const recencyBiases: RecencyBias[] = [
  { id: 'rb-1', cardName: '2024 Topps Chrome Paul Skenes RC Auto', sport: 'Baseball', recentTrendValue: 480, historicalAvgValue: 320, correctedValue: 375, recencyWeight: 0.72, historicalWeight: 0.28, biasAmount: 105, biasDirection: 'overvalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 12 months' },
  { id: 'rb-2', cardName: '2020 Prizm Justin Herbert RC PSA 10', sport: 'Football', recentTrendValue: 290, historicalAvgValue: 420, correctedValue: 365, recencyWeight: 0.68, historicalWeight: 0.32, biasAmount: 75, biasDirection: 'undervalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 18 months' },
  { id: 'rb-3', cardName: '2024 Prizm Caitlin Clark RC PSA 10', sport: 'Basketball', recentTrendValue: 850, historicalAvgValue: 380, correctedValue: 560, recencyWeight: 0.80, historicalWeight: 0.20, biasAmount: 290, biasDirection: 'overvalued', recentPeriod: 'Last 14 days', historicalPeriod: 'Last 6 months' },
  { id: 'rb-4', cardName: '2018 Topps Update Shohei Ohtani RC PSA 10', sport: 'Baseball', recentTrendValue: 620, historicalAvgValue: 750, correctedValue: 698, recencyWeight: 0.60, historicalWeight: 0.40, biasAmount: 78, biasDirection: 'undervalued', recentPeriod: 'Last 60 days', historicalPeriod: 'Last 24 months' },
  { id: 'rb-5', cardName: '2023 Prizm Victor Wembanyama RC PSA 10', sport: 'Basketball', recentTrendValue: 520, historicalAvgValue: 410, correctedValue: 455, recencyWeight: 0.65, historicalWeight: 0.35, biasAmount: 65, biasDirection: 'overvalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 8 months' },
  { id: 'rb-6', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', recentTrendValue: 175, historicalAvgValue: 210, correctedValue: 196, recencyWeight: 0.62, historicalWeight: 0.38, biasAmount: 21, biasDirection: 'undervalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 10 months' },
  { id: 'rb-7', cardName: '2022 Topps Chrome Julio Rodriguez Auto', sport: 'Baseball', recentTrendValue: 225, historicalAvgValue: 280, correctedValue: 259, recencyWeight: 0.58, historicalWeight: 0.42, biasAmount: 34, biasDirection: 'undervalued', recentPeriod: 'Last 45 days', historicalPeriod: 'Last 18 months' },
  { id: 'rb-8', cardName: '2023 Select CJ Stroud RC Tie-Dye /25', sport: 'Football', recentTrendValue: 2100, historicalAvgValue: 1650, correctedValue: 1830, recencyWeight: 0.70, historicalWeight: 0.30, biasAmount: 270, biasDirection: 'overvalued', recentPeriod: 'Last 21 days', historicalPeriod: 'Last 12 months' },
  { id: 'rb-9', cardName: '2024 Topps Chrome Elly De La Cruz Auto', sport: 'Baseball', recentTrendValue: 310, historicalAvgValue: 245, correctedValue: 271, recencyWeight: 0.64, historicalWeight: 0.36, biasAmount: 39, biasDirection: 'overvalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 10 months' },
  { id: 'rb-10', cardName: '2018 Prizm Luka Doncic RC PSA 10', sport: 'Basketball', recentTrendValue: 4200, historicalAvgValue: 5100, correctedValue: 4740, recencyWeight: 0.55, historicalWeight: 0.45, biasAmount: 540, biasDirection: 'undervalued', recentPeriod: 'Last 60 days', historicalPeriod: 'Last 24 months' },
  { id: 'rb-11', cardName: '2023 Bowman Chrome Holliday 1st Auto', sport: 'Baseball', recentTrendValue: 380, historicalAvgValue: 290, correctedValue: 326, recencyWeight: 0.66, historicalWeight: 0.34, biasAmount: 54, biasDirection: 'overvalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 12 months' },
  { id: 'rb-12', cardName: '2024 Donruss Optic Jayden Daniels RC', sport: 'Football', recentTrendValue: 155, historicalAvgValue: 135, correctedValue: 143, recencyWeight: 0.60, historicalWeight: 0.40, biasAmount: 12, biasDirection: 'overvalued', recentPeriod: 'Last 30 days', historicalPeriod: 'Last 8 months' },
];

const correctedForecasts: CorrectedForecast[] = [
  { cardName: '2024 Topps Chrome Paul Skenes RC Auto', naiveForecast: 550, correctedForecast: 395, forecastDifference: -155, confidenceLevel: 72, timeframe: '6 months' },
  { cardName: '2024 Prizm Caitlin Clark RC PSA 10', naiveForecast: 1100, correctedForecast: 480, forecastDifference: -620, confidenceLevel: 65, timeframe: '6 months' },
  { cardName: '2023 Prizm Victor Wembanyama RC PSA 10', naiveForecast: 620, correctedForecast: 470, forecastDifference: -150, confidenceLevel: 70, timeframe: '6 months' },
  { cardName: '2020 Prizm Justin Herbert RC PSA 10', naiveForecast: 250, correctedForecast: 355, forecastDifference: 105, confidenceLevel: 68, timeframe: '6 months' },
  { cardName: '2018 Prizm Luka Doncic RC PSA 10', naiveForecast: 3800, correctedForecast: 4600, forecastDifference: 800, confidenceLevel: 74, timeframe: '6 months' },
  { cardName: '2024 Prizm Caleb Williams RC PSA 10', naiveForecast: 155, correctedForecast: 195, forecastDifference: 40, confidenceLevel: 62, timeframe: '6 months' },
];

const timeWeightings: TimeWeighting[] = [
  { period: 'Last 7 days', naiveWeight: 0.35, correctedWeight: 0.10, dataPoints: 8, description: 'Most recent sales heavily overweighted by naive models' },
  { period: 'Last 30 days', naiveWeight: 0.30, correctedWeight: 0.20, dataPoints: 24, description: 'Recent month data still overweighted but less extreme' },
  { period: 'Last 90 days', naiveWeight: 0.20, correctedWeight: 0.25, dataPoints: 65, description: 'Quarterly data underweighted despite high relevance' },
  { period: 'Last 6 months', naiveWeight: 0.10, correctedWeight: 0.25, dataPoints: 110, description: 'Half-year trends contain critical seasonal patterns' },
  { period: 'Last 12 months', naiveWeight: 0.04, correctedWeight: 0.15, dataPoints: 185, description: 'Annual data provides full cycle perspective' },
  { period: 'Last 24 months', naiveWeight: 0.01, correctedWeight: 0.05, dataPoints: 320, description: 'Two-year data captures market regime changes' },
];

const biasCorrections: BiasCorrection[] = [
  { month: 'Nov 2025', avgRecencyBias: 42, correctionsApplied: 8, accuracyImprovement: 18, overvaluedCards: 5, undervaluedCards: 3 },
  { month: 'Dec 2025', avgRecencyBias: 45, correctionsApplied: 10, accuracyImprovement: 22, overvaluedCards: 6, undervaluedCards: 4 },
  { month: 'Jan 2026', avgRecencyBias: 38, correctionsApplied: 9, accuracyImprovement: 20, overvaluedCards: 5, undervaluedCards: 4 },
  { month: 'Feb 2026', avgRecencyBias: 35, correctionsApplied: 11, accuracyImprovement: 25, overvaluedCards: 6, undervaluedCards: 5 },
  { month: 'Mar 2026', avgRecencyBias: 32, correctionsApplied: 12, accuracyImprovement: 28, overvaluedCards: 7, undervaluedCards: 5 },
  { month: 'Apr 2026', avgRecencyBias: 30, correctionsApplied: 12, accuracyImprovement: 30, overvaluedCards: 7, undervaluedCards: 5 },
];

export function getRecencyBiases(): RecencyBias[] {
  return recencyBiases;
}

export function getCorrectedForecasts(): CorrectedForecast[] {
  return correctedForecasts;
}

export function getTimeWeightings(): TimeWeighting[] {
  return timeWeightings;
}

export function getBiasCorrections(): BiasCorrection[] {
  return biasCorrections;
}

export function getRecencyBiasStats() {
  const overvalued = recencyBiases.filter(b => b.biasDirection === 'overvalued').length;
  const undervalued = recencyBiases.filter(b => b.biasDirection === 'undervalued').length;
  const avgBias = Math.round(recencyBiases.reduce((s, b) => s + b.biasAmount, 0) / recencyBiases.length);
  const latestCorrection = biasCorrections[biasCorrections.length - 1];
  return { overvaluedCards: overvalued, undervaluedCards: undervalued, avgBiasAmount: avgBias, accuracyGain: latestCorrection.accuracyImprovement };
}
