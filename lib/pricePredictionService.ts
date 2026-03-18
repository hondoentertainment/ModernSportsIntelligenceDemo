import { store } from './dal/syncStore';

// Phase 146: AI Price Prediction & Fair Offer Generator
// Machine learning-powered price forecasting with fair market offer ranges and valuation reports

// ---- Types ----

export type PredictionTimeframe = '7d' | '30d' | '60d' | '90d' | '180d' | '1y';

export type ConfidenceLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

export interface PricePrediction {
  id: string;
  cardName: string;
  sport: string;
  year: number;
  set: string;
  grade: string;
  currentPrice: number;
  predictions: Record<PredictionTimeframe, { price: number; change: number; changePercent: number }>;
  confidence: ConfidenceLevel;
  trending: 'up' | 'down' | 'stable';
  lastUpdated: string;
  popCount: number;
  totalGraded: number;
}

export interface FairOffer {
  id: string;
  predictionId: string;
  cardName: string;
  currentPrice: number;
  buyLow: number;
  buyFair: number;
  sellFair: number;
  sellHigh: number;
  confidence: ConfidenceLevel;
  reasoning: string;
  generatedAt: string;
}

export interface MarketEvidence {
  id: string;
  predictionId: string;
  source: string;
  saleDate: string;
  price: number;
  platform: string;
  condition: string;
  notes: string;
}

export interface ModelAccuracy {
  thirtyDay: number;
  sixtyDay: number;
  ninetyDay: number;
  oneEighty: number;
  oneYear: number;
  totalPredictions: number;
  lastCalibrated: string;
}

export interface PriceHistory {
  id: string;
  predictionId: string;
  date: string;
  price: number;
  volume: number;
  source: string;
}

export interface ComparableSale {
  id: string;
  predictionId: string;
  cardName: string;
  saleDate: string;
  price: number;
  platform: string;
  grade: string;
  notes: string;
}

export interface ValuationReport {
  id: string;
  predictionId: string;
  cardName: string;
  generatedAt: string;
  currentValue: number;
  fairMarketValue: number;
  insuranceValue: number;
  liquidationValue: number;
  factors: PredictionFactor[];
  comparables: ComparableSale[];
  summary: string;
}

export interface PredictionFactor {
  id: string;
  name: string;
  category: 'seasonPerformance' | 'injuryRisk' | 'freeAgency' | 'cardPopulation' | 'marketMomentum' | 'socialSentiment';
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export interface AlertThreshold {
  id: string;
  predictionId: string;
  cardName: string;
  type: 'price_above' | 'price_below' | 'change_percent';
  value: number;
  active: boolean;
  triggered: boolean;
  createdAt: string;
}

export interface BatchPrediction {
  id: string;
  name: string;
  predictionIds: string[];
  totalCurrentValue: number;
  totalPredictedValue: Record<PredictionTimeframe, number>;
  createdAt: string;
}

// ---- Storage Helpers ----

const STORAGE_KEY = 'msi_price_prediction';

function loadData<T>(key: string): T | null {
  return store.get<T | null>(`${STORAGE_KEY}_${key}`, null);
}

function saveData<T>(key: string, data: T): void {
  store.set(`${STORAGE_KEY}_${key}`, data);
}

// ---- Helpers ----

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getConfidenceConfig(confidence: ConfidenceLevel): { label: string; text: string; bg: string; border: string } {
  switch (confidence) {
    case 'very_low': return { label: 'Very Low', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'low': return { label: 'Low', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'moderate': return { label: 'Moderate', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 'high': return { label: 'High', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'very_high': return { label: 'Very High', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
  }
}

// ---- Model Accuracy ----

const MOCK_MODEL_ACCURACY: ModelAccuracy = {
  thirtyDay: 85,
  sixtyDay: 81,
  ninetyDay: 78,
  oneEighty: 72,
  oneYear: 65,
  totalPredictions: 12847,
  lastCalibrated: '2026-03-14T18:00:00Z',
};

// ---- Mock Data: 42 Price Predictions ----

const MOCK_PREDICTIONS: PricePrediction[] = [
  // 1
  { id: 'pp-1', cardName: '2023 Topps Chrome Victor Wembanyama PSA 10', sport: 'Basketball', year: 2023, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 2850, predictions: { '7d': { price: 2920, change: 70, changePercent: 2.5 }, '30d': { price: 3100, change: 250, changePercent: 8.8 }, '60d': { price: 3400, change: 550, changePercent: 19.3 }, '90d': { price: 3800, change: 950, changePercent: 33.3 }, '180d': { price: 4500, change: 1650, changePercent: 57.9 }, '1y': { price: 5800, change: 2950, changePercent: 103.5 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 312, totalGraded: 1845 },
  // 2
  { id: 'pp-2', cardName: '2003 Topps Chrome LeBron James PSA 10', sport: 'Basketball', year: 2003, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 45000, predictions: { '7d': { price: 45500, change: 500, changePercent: 1.1 }, '30d': { price: 47000, change: 2000, changePercent: 4.4 }, '60d': { price: 49500, change: 4500, changePercent: 10.0 }, '90d': { price: 52000, change: 7000, changePercent: 15.6 }, '180d': { price: 58000, change: 13000, changePercent: 28.9 }, '1y': { price: 68000, change: 23000, changePercent: 51.1 } }, confidence: 'very_high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 218, totalGraded: 4120 },
  // 3
  { id: 'pp-3', cardName: '2018 Topps Chrome Shohei Ohtani PSA 10', sport: 'Baseball', year: 2018, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 1200, predictions: { '7d': { price: 1220, change: 20, changePercent: 1.7 }, '30d': { price: 1300, change: 100, changePercent: 8.3 }, '60d': { price: 1450, change: 250, changePercent: 20.8 }, '90d': { price: 1600, change: 400, changePercent: 33.3 }, '180d': { price: 1850, change: 650, changePercent: 54.2 }, '1y': { price: 2200, change: 1000, changePercent: 83.3 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1450, totalGraded: 8920 },
  // 4
  { id: 'pp-4', cardName: '2020 Prizm Lamelo Ball PSA 10', sport: 'Basketball', year: 2020, set: 'Prizm', grade: 'PSA 10', currentPrice: 850, predictions: { '7d': { price: 860, change: 10, changePercent: 1.2 }, '30d': { price: 900, change: 50, changePercent: 5.9 }, '60d': { price: 975, change: 125, changePercent: 14.7 }, '90d': { price: 1050, change: 200, changePercent: 23.5 }, '180d': { price: 1200, change: 350, changePercent: 41.2 }, '1y': { price: 1500, change: 650, changePercent: 76.5 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2100, totalGraded: 12500 },
  // 5
  { id: 'pp-5', cardName: '2023 Bowman Chrome 1st Ethan Salas', sport: 'Baseball', year: 2023, set: 'Bowman Chrome 1st', grade: 'Raw', currentPrice: 180, predictions: { '7d': { price: 185, change: 5, changePercent: 2.8 }, '30d': { price: 210, change: 30, changePercent: 16.7 }, '60d': { price: 250, change: 70, changePercent: 38.9 }, '90d': { price: 300, change: 120, changePercent: 66.7 }, '180d': { price: 400, change: 220, changePercent: 122.2 }, '1y': { price: 550, change: 370, changePercent: 205.6 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 0, totalGraded: 0 },
  // 6
  { id: 'pp-6', cardName: '2018 Panini Prizm Luka Doncic PSA 10', sport: 'Basketball', year: 2018, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 3200, predictions: { '7d': { price: 3250, change: 50, changePercent: 1.6 }, '30d': { price: 3400, change: 200, changePercent: 6.3 }, '60d': { price: 3650, change: 450, changePercent: 14.1 }, '90d': { price: 3900, change: 700, changePercent: 21.9 }, '180d': { price: 4400, change: 1200, changePercent: 37.5 }, '1y': { price: 5200, change: 2000, changePercent: 62.5 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 890, totalGraded: 5200 },
  // 7
  { id: 'pp-7', cardName: '2011 Topps Update Mike Trout PSA 10', sport: 'Baseball', year: 2011, set: 'Topps Update', grade: 'PSA 10', currentPrice: 28000, predictions: { '7d': { price: 27800, change: -200, changePercent: -0.7 }, '30d': { price: 27000, change: -1000, changePercent: -3.6 }, '60d': { price: 26500, change: -1500, changePercent: -5.4 }, '90d': { price: 26000, change: -2000, changePercent: -7.1 }, '180d': { price: 25000, change: -3000, changePercent: -10.7 }, '1y': { price: 24000, change: -4000, changePercent: -14.3 } }, confidence: 'high', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3100, totalGraded: 18500 },
  // 8
  { id: 'pp-8', cardName: '2019 Panini Prizm Zion Williamson PSA 10', sport: 'Basketball', year: 2019, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 420, predictions: { '7d': { price: 415, change: -5, changePercent: -1.2 }, '30d': { price: 400, change: -20, changePercent: -4.8 }, '60d': { price: 380, change: -40, changePercent: -9.5 }, '90d': { price: 360, change: -60, changePercent: -14.3 }, '180d': { price: 330, change: -90, changePercent: -21.4 }, '1y': { price: 300, change: -120, changePercent: -28.6 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 4500, totalGraded: 22000 },
  // 9
  { id: 'pp-9', cardName: '2001 Bowman Chrome Albert Pujols PSA 10', sport: 'Baseball', year: 2001, set: 'Bowman Chrome', grade: 'PSA 10', currentPrice: 4800, predictions: { '7d': { price: 4800, change: 0, changePercent: 0.0 }, '30d': { price: 4850, change: 50, changePercent: 1.0 }, '60d': { price: 4900, change: 100, changePercent: 2.1 }, '90d': { price: 5000, change: 200, changePercent: 4.2 }, '180d': { price: 5200, change: 400, changePercent: 8.3 }, '1y': { price: 5500, change: 700, changePercent: 14.6 } }, confidence: 'high', trending: 'stable', lastUpdated: '2026-03-15T08:00:00Z', popCount: 145, totalGraded: 2800 },
  // 10
  { id: 'pp-10', cardName: '2020 Panini Prizm Justin Herbert PSA 10', sport: 'Football', year: 2020, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 680, predictions: { '7d': { price: 690, change: 10, changePercent: 1.5 }, '30d': { price: 720, change: 40, changePercent: 5.9 }, '60d': { price: 780, change: 100, changePercent: 14.7 }, '90d': { price: 850, change: 170, changePercent: 25.0 }, '180d': { price: 950, change: 270, changePercent: 39.7 }, '1y': { price: 1100, change: 420, changePercent: 61.8 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3200, totalGraded: 15800 },
  // 11
  { id: 'pp-11', cardName: '2015 Topps Chrome Kris Bryant PSA 10', sport: 'Baseball', year: 2015, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 120, predictions: { '7d': { price: 118, change: -2, changePercent: -1.7 }, '30d': { price: 115, change: -5, changePercent: -4.2 }, '60d': { price: 110, change: -10, changePercent: -8.3 }, '90d': { price: 105, change: -15, changePercent: -12.5 }, '180d': { price: 100, change: -20, changePercent: -16.7 }, '1y': { price: 90, change: -30, changePercent: -25.0 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 5800, totalGraded: 28000 },
  // 12
  { id: 'pp-12', cardName: '2017 Panini Prizm Patrick Mahomes PSA 10', sport: 'Football', year: 2017, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 12500, predictions: { '7d': { price: 12600, change: 100, changePercent: 0.8 }, '30d': { price: 13000, change: 500, changePercent: 4.0 }, '60d': { price: 13800, change: 1300, changePercent: 10.4 }, '90d': { price: 14500, change: 2000, changePercent: 16.0 }, '180d': { price: 16000, change: 3500, changePercent: 28.0 }, '1y': { price: 18500, change: 6000, changePercent: 48.0 } }, confidence: 'very_high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 520, totalGraded: 3800 },
  // 13
  { id: 'pp-13', cardName: '2019 Topps Chrome Fernando Tatis Jr PSA 10', sport: 'Baseball', year: 2019, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 280, predictions: { '7d': { price: 275, change: -5, changePercent: -1.8 }, '30d': { price: 260, change: -20, changePercent: -7.1 }, '60d': { price: 245, change: -35, changePercent: -12.5 }, '90d': { price: 230, change: -50, changePercent: -17.9 }, '180d': { price: 210, change: -70, changePercent: -25.0 }, '1y': { price: 190, change: -90, changePercent: -32.1 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 4200, totalGraded: 21000 },
  // 14
  { id: 'pp-14', cardName: '2022 Topps Chrome Julio Rodriguez PSA 10', sport: 'Baseball', year: 2022, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 380, predictions: { '7d': { price: 385, change: 5, changePercent: 1.3 }, '30d': { price: 410, change: 30, changePercent: 7.9 }, '60d': { price: 450, change: 70, changePercent: 18.4 }, '90d': { price: 500, change: 120, changePercent: 31.6 }, '180d': { price: 580, change: 200, changePercent: 52.6 }, '1y': { price: 700, change: 320, changePercent: 84.2 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1800, totalGraded: 9500 },
  // 15
  { id: 'pp-15', cardName: '2020 Panini Prizm Joe Burrow PSA 10', sport: 'Football', year: 2020, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 520, predictions: { '7d': { price: 525, change: 5, changePercent: 1.0 }, '30d': { price: 550, change: 30, changePercent: 5.8 }, '60d': { price: 600, change: 80, changePercent: 15.4 }, '90d': { price: 650, change: 130, changePercent: 25.0 }, '180d': { price: 750, change: 230, changePercent: 44.2 }, '1y': { price: 900, change: 380, changePercent: 73.1 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2800, totalGraded: 14200 },
  // 16
  { id: 'pp-16', cardName: '2022 Panini Prizm Paolo Banchero PSA 10', sport: 'Basketball', year: 2022, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 250, predictions: { '7d': { price: 248, change: -2, changePercent: -0.8 }, '30d': { price: 240, change: -10, changePercent: -4.0 }, '60d': { price: 230, change: -20, changePercent: -8.0 }, '90d': { price: 225, change: -25, changePercent: -10.0 }, '180d': { price: 220, change: -30, changePercent: -12.0 }, '1y': { price: 210, change: -40, changePercent: -16.0 } }, confidence: 'low', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3200, totalGraded: 16000 },
  // 17
  { id: 'pp-17', cardName: '2005 Topps Chrome Aaron Rodgers PSA 10', sport: 'Football', year: 2005, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 3800, predictions: { '7d': { price: 3780, change: -20, changePercent: -0.5 }, '30d': { price: 3700, change: -100, changePercent: -2.6 }, '60d': { price: 3600, change: -200, changePercent: -5.3 }, '90d': { price: 3500, change: -300, changePercent: -7.9 }, '180d': { price: 3300, change: -500, changePercent: -13.2 }, '1y': { price: 3000, change: -800, changePercent: -21.1 } }, confidence: 'high', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 280, totalGraded: 2100 },
  // 18
  { id: 'pp-18', cardName: '2019 Bowman Chrome Wander Franco PSA 10', sport: 'Baseball', year: 2019, set: 'Bowman Chrome', grade: 'PSA 10', currentPrice: 150, predictions: { '7d': { price: 148, change: -2, changePercent: -1.3 }, '30d': { price: 140, change: -10, changePercent: -6.7 }, '60d': { price: 130, change: -20, changePercent: -13.3 }, '90d': { price: 120, change: -30, changePercent: -20.0 }, '180d': { price: 100, change: -50, changePercent: -33.3 }, '1y': { price: 80, change: -70, changePercent: -46.7 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2400, totalGraded: 12800 },
  // 19
  { id: 'pp-19', cardName: '2023 Panini Prizm Chet Holmgren PSA 10', sport: 'Basketball', year: 2023, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 180, predictions: { '7d': { price: 182, change: 2, changePercent: 1.1 }, '30d': { price: 195, change: 15, changePercent: 8.3 }, '60d': { price: 210, change: 30, changePercent: 16.7 }, '90d': { price: 230, change: 50, changePercent: 27.8 }, '180d': { price: 270, change: 90, changePercent: 50.0 }, '1y': { price: 320, change: 140, changePercent: 77.8 } }, confidence: 'low', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1900, totalGraded: 10500 },
  // 20
  { id: 'pp-20', cardName: '2014 Topps Chrome Mookie Betts PSA 10', sport: 'Baseball', year: 2014, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 950, predictions: { '7d': { price: 960, change: 10, changePercent: 1.1 }, '30d': { price: 1000, change: 50, changePercent: 5.3 }, '60d': { price: 1080, change: 130, changePercent: 13.7 }, '90d': { price: 1150, change: 200, changePercent: 21.1 }, '180d': { price: 1300, change: 350, changePercent: 36.8 }, '1y': { price: 1500, change: 550, changePercent: 57.9 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1200, totalGraded: 7400 },
  // 21
  { id: 'pp-21', cardName: '2021 Panini Prizm Trevor Lawrence PSA 10', sport: 'Football', year: 2021, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 220, predictions: { '7d': { price: 218, change: -2, changePercent: -0.9 }, '30d': { price: 210, change: -10, changePercent: -4.5 }, '60d': { price: 200, change: -20, changePercent: -9.1 }, '90d': { price: 195, change: -25, changePercent: -11.4 }, '180d': { price: 185, change: -35, changePercent: -15.9 }, '1y': { price: 170, change: -50, changePercent: -22.7 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3800, totalGraded: 18500 },
  // 22
  { id: 'pp-22', cardName: '2015 Panini Prizm Nikola Jokic PSA 10', sport: 'Basketball', year: 2015, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 5500, predictions: { '7d': { price: 5550, change: 50, changePercent: 0.9 }, '30d': { price: 5800, change: 300, changePercent: 5.5 }, '60d': { price: 6200, change: 700, changePercent: 12.7 }, '90d': { price: 6600, change: 1100, changePercent: 20.0 }, '180d': { price: 7500, change: 2000, changePercent: 36.4 }, '1y': { price: 9000, change: 3500, changePercent: 63.6 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 620, totalGraded: 3900 },
  // 23
  { id: 'pp-23', cardName: '2024 Topps Chrome Paul Skenes PSA 10', sport: 'Baseball', year: 2024, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 320, predictions: { '7d': { price: 330, change: 10, changePercent: 3.1 }, '30d': { price: 370, change: 50, changePercent: 15.6 }, '60d': { price: 420, change: 100, changePercent: 31.3 }, '90d': { price: 480, change: 160, changePercent: 50.0 }, '180d': { price: 580, change: 260, changePercent: 81.3 }, '1y': { price: 750, change: 430, changePercent: 134.4 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 800, totalGraded: 4200 },
  // 24
  { id: 'pp-24', cardName: '2020 Topps Chrome Kyle Lewis PSA 10', sport: 'Baseball', year: 2020, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 35, predictions: { '7d': { price: 34, change: -1, changePercent: -2.9 }, '30d': { price: 32, change: -3, changePercent: -8.6 }, '60d': { price: 30, change: -5, changePercent: -14.3 }, '90d': { price: 28, change: -7, changePercent: -20.0 }, '180d': { price: 25, change: -10, changePercent: -28.6 }, '1y': { price: 20, change: -15, changePercent: -42.9 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 6200, totalGraded: 32000 },
  // 25
  { id: 'pp-25', cardName: '2018 Topps Chrome Juan Soto PSA 10', sport: 'Baseball', year: 2018, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 750, predictions: { '7d': { price: 760, change: 10, changePercent: 1.3 }, '30d': { price: 800, change: 50, changePercent: 6.7 }, '60d': { price: 870, change: 120, changePercent: 16.0 }, '90d': { price: 950, change: 200, changePercent: 26.7 }, '180d': { price: 1100, change: 350, changePercent: 46.7 }, '1y': { price: 1350, change: 600, changePercent: 80.0 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1600, totalGraded: 9200 },
  // 26
  { id: 'pp-26', cardName: '2023 Panini Prizm Caleb Williams PSA 10', sport: 'Football', year: 2023, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 450, predictions: { '7d': { price: 460, change: 10, changePercent: 2.2 }, '30d': { price: 500, change: 50, changePercent: 11.1 }, '60d': { price: 560, change: 110, changePercent: 24.4 }, '90d': { price: 620, change: 170, changePercent: 37.8 }, '180d': { price: 720, change: 270, changePercent: 60.0 }, '1y': { price: 900, change: 450, changePercent: 100.0 } }, confidence: 'low', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1500, totalGraded: 8200 },
  // 27
  { id: 'pp-27', cardName: '2016 Panini Prizm Ben Simmons PSA 10', sport: 'Basketball', year: 2016, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 95, predictions: { '7d': { price: 93, change: -2, changePercent: -2.1 }, '30d': { price: 88, change: -7, changePercent: -7.4 }, '60d': { price: 82, change: -13, changePercent: -13.7 }, '90d': { price: 75, change: -20, changePercent: -21.1 }, '180d': { price: 65, change: -30, changePercent: -31.6 }, '1y': { price: 50, change: -45, changePercent: -47.4 } }, confidence: 'high', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 4800, totalGraded: 24000 },
  // 28
  { id: 'pp-28', cardName: '2021 Topps Chrome Bobby Witt Jr PSA 10', sport: 'Baseball', year: 2021, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 280, predictions: { '7d': { price: 285, change: 5, changePercent: 1.8 }, '30d': { price: 310, change: 30, changePercent: 10.7 }, '60d': { price: 340, change: 60, changePercent: 21.4 }, '90d': { price: 380, change: 100, changePercent: 35.7 }, '180d': { price: 450, change: 170, changePercent: 60.7 }, '1y': { price: 550, change: 270, changePercent: 96.4 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2200, totalGraded: 11500 },
  // 29
  { id: 'pp-29', cardName: '2019 Panini Prizm Ja Morant PSA 10', sport: 'Basketball', year: 2019, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 380, predictions: { '7d': { price: 375, change: -5, changePercent: -1.3 }, '30d': { price: 360, change: -20, changePercent: -5.3 }, '60d': { price: 340, change: -40, changePercent: -10.5 }, '90d': { price: 320, change: -60, changePercent: -15.8 }, '180d': { price: 290, change: -90, changePercent: -23.7 }, '1y': { price: 260, change: -120, changePercent: -31.6 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3100, totalGraded: 15800 },
  // 30
  { id: 'pp-30', cardName: '2023 Topps Chrome Corbin Carroll PSA 10', sport: 'Baseball', year: 2023, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 160, predictions: { '7d': { price: 158, change: -2, changePercent: -1.3 }, '30d': { price: 150, change: -10, changePercent: -6.3 }, '60d': { price: 145, change: -15, changePercent: -9.4 }, '90d': { price: 140, change: -20, changePercent: -12.5 }, '180d': { price: 135, change: -25, changePercent: -15.6 }, '1y': { price: 130, change: -30, changePercent: -18.8 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2600, totalGraded: 13800 },
  // 31
  { id: 'pp-31', cardName: '2012 Panini Prizm Jimmy Butler PSA 10', sport: 'Basketball', year: 2012, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 1800, predictions: { '7d': { price: 1810, change: 10, changePercent: 0.6 }, '30d': { price: 1850, change: 50, changePercent: 2.8 }, '60d': { price: 1900, change: 100, changePercent: 5.6 }, '90d': { price: 1950, change: 150, changePercent: 8.3 }, '180d': { price: 2050, change: 250, changePercent: 13.9 }, '1y': { price: 2200, change: 400, changePercent: 22.2 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 420, totalGraded: 2800 },
  // 32
  { id: 'pp-32', cardName: '2021 Panini Prizm Mac Jones PSA 10', sport: 'Football', year: 2021, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 45, predictions: { '7d': { price: 44, change: -1, changePercent: -2.2 }, '30d': { price: 40, change: -5, changePercent: -11.1 }, '60d': { price: 36, change: -9, changePercent: -20.0 }, '90d': { price: 32, change: -13, changePercent: -28.9 }, '180d': { price: 28, change: -17, changePercent: -37.8 }, '1y': { price: 22, change: -23, changePercent: -51.1 } }, confidence: 'high', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 5100, totalGraded: 26000 },
  // 33
  { id: 'pp-33', cardName: '2019 Topps Chrome Yordan Alvarez PSA 10', sport: 'Baseball', year: 2019, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 480, predictions: { '7d': { price: 485, change: 5, changePercent: 1.0 }, '30d': { price: 510, change: 30, changePercent: 6.3 }, '60d': { price: 550, change: 70, changePercent: 14.6 }, '90d': { price: 600, change: 120, changePercent: 25.0 }, '180d': { price: 680, change: 200, changePercent: 41.7 }, '1y': { price: 800, change: 320, changePercent: 66.7 } }, confidence: 'high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1900, totalGraded: 10200 },
  // 34
  { id: 'pp-34', cardName: '2023 Upper Deck Connor Bedard Young Guns PSA 10', sport: 'Hockey', year: 2023, set: 'Upper Deck Young Guns', grade: 'PSA 10', currentPrice: 650, predictions: { '7d': { price: 660, change: 10, changePercent: 1.5 }, '30d': { price: 710, change: 60, changePercent: 9.2 }, '60d': { price: 780, change: 130, changePercent: 20.0 }, '90d': { price: 860, change: 210, changePercent: 32.3 }, '180d': { price: 1000, change: 350, changePercent: 53.8 }, '1y': { price: 1250, change: 600, changePercent: 92.3 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 480, totalGraded: 3100 },
  // 35
  { id: 'pp-35', cardName: '2004 Topps Chrome Ben Roethlisberger PSA 10', sport: 'Football', year: 2004, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 350, predictions: { '7d': { price: 348, change: -2, changePercent: -0.6 }, '30d': { price: 340, change: -10, changePercent: -2.9 }, '60d': { price: 330, change: -20, changePercent: -5.7 }, '90d': { price: 320, change: -30, changePercent: -8.6 }, '180d': { price: 310, change: -40, changePercent: -11.4 }, '1y': { price: 290, change: -60, changePercent: -17.1 } }, confidence: 'high', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 380, totalGraded: 2500 },
  // 36
  { id: 'pp-36', cardName: '2022 Panini Prizm Sauce Gardner PSA 10', sport: 'Football', year: 2022, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 75, predictions: { '7d': { price: 76, change: 1, changePercent: 1.3 }, '30d': { price: 80, change: 5, changePercent: 6.7 }, '60d': { price: 85, change: 10, changePercent: 13.3 }, '90d': { price: 90, change: 15, changePercent: 20.0 }, '180d': { price: 100, change: 25, changePercent: 33.3 }, '1y': { price: 115, change: 40, changePercent: 53.3 } }, confidence: 'low', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2900, totalGraded: 14500 },
  // 37
  { id: 'pp-37', cardName: '2013 Panini Prizm Giannis Antetokounmpo PSA 10', sport: 'Basketball', year: 2013, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 22000, predictions: { '7d': { price: 22200, change: 200, changePercent: 0.9 }, '30d': { price: 23000, change: 1000, changePercent: 4.5 }, '60d': { price: 24500, change: 2500, changePercent: 11.4 }, '90d': { price: 26000, change: 4000, changePercent: 18.2 }, '180d': { price: 29000, change: 7000, changePercent: 31.8 }, '1y': { price: 34000, change: 12000, changePercent: 54.5 } }, confidence: 'very_high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 180, totalGraded: 1600 },
  // 38
  { id: 'pp-38', cardName: '2021 Topps Chrome Spencer Strider PSA 10', sport: 'Baseball', year: 2021, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 110, predictions: { '7d': { price: 108, change: -2, changePercent: -1.8 }, '30d': { price: 100, change: -10, changePercent: -9.1 }, '60d': { price: 90, change: -20, changePercent: -18.2 }, '90d': { price: 85, change: -25, changePercent: -22.7 }, '180d': { price: 75, change: -35, changePercent: -31.8 }, '1y': { price: 65, change: -45, changePercent: -40.9 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3400, totalGraded: 17500 },
  // 39
  { id: 'pp-39', cardName: '2023 Panini Prizm Jayden Daniels PSA 10', sport: 'Football', year: 2023, set: 'Panini Prizm', grade: 'PSA 10', currentPrice: 380, predictions: { '7d': { price: 390, change: 10, changePercent: 2.6 }, '30d': { price: 430, change: 50, changePercent: 13.2 }, '60d': { price: 480, change: 100, changePercent: 26.3 }, '90d': { price: 540, change: 160, changePercent: 42.1 }, '180d': { price: 640, change: 260, changePercent: 68.4 }, '1y': { price: 800, change: 420, changePercent: 110.5 } }, confidence: 'low', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 1200, totalGraded: 6800 },
  // 40
  { id: 'pp-40', cardName: '2020 Topps Chrome Luis Robert PSA 10', sport: 'Baseball', year: 2020, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 200, predictions: { '7d': { price: 198, change: -2, changePercent: -1.0 }, '30d': { price: 190, change: -10, changePercent: -5.0 }, '60d': { price: 180, change: -20, changePercent: -10.0 }, '90d': { price: 175, change: -25, changePercent: -12.5 }, '180d': { price: 165, change: -35, changePercent: -17.5 }, '1y': { price: 150, change: -50, changePercent: -25.0 } }, confidence: 'moderate', trending: 'down', lastUpdated: '2026-03-15T08:00:00Z', popCount: 3600, totalGraded: 18200 },
  // 41
  { id: 'pp-41', cardName: '2015 Upper Deck Connor McDavid Young Guns PSA 10', sport: 'Hockey', year: 2015, set: 'Upper Deck Young Guns', grade: 'PSA 10', currentPrice: 8500, predictions: { '7d': { price: 8550, change: 50, changePercent: 0.6 }, '30d': { price: 8800, change: 300, changePercent: 3.5 }, '60d': { price: 9200, change: 700, changePercent: 8.2 }, '90d': { price: 9600, change: 1100, changePercent: 12.9 }, '180d': { price: 10500, change: 2000, changePercent: 23.5 }, '1y': { price: 12000, change: 3500, changePercent: 41.2 } }, confidence: 'very_high', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 220, totalGraded: 1800 },
  // 42
  { id: 'pp-42', cardName: '2022 Topps Chrome Adley Rutschman PSA 10', sport: 'Baseball', year: 2022, set: 'Topps Chrome', grade: 'PSA 10', currentPrice: 140, predictions: { '7d': { price: 142, change: 2, changePercent: 1.4 }, '30d': { price: 150, change: 10, changePercent: 7.1 }, '60d': { price: 160, change: 20, changePercent: 14.3 }, '90d': { price: 175, change: 35, changePercent: 25.0 }, '180d': { price: 200, change: 60, changePercent: 42.9 }, '1y': { price: 240, change: 100, changePercent: 71.4 } }, confidence: 'moderate', trending: 'up', lastUpdated: '2026-03-15T08:00:00Z', popCount: 2100, totalGraded: 11200 },
];

// ---- Mock Data: Comparable Sales (30+ per card) ----

function generateComparableSales(prediction: PricePrediction): ComparableSale[] {
  const platforms = ['eBay', 'PWCC', 'Heritage Auctions', 'MySlabs', 'Goldin', 'COMC', 'Whatnot'];
  const sales: ComparableSale[] = [];
  const basePrice = prediction.currentPrice;

  for (let i = 0; i < 32; i++) {
    const daysAgo = Math.floor(Math.random() * 180) + 1;
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - daysAgo);
    const variance = (Math.random() * 0.3 - 0.15);
    const salePrice = Math.round(basePrice * (1 + variance) * 100) / 100;
    const platform = platforms[i % platforms.length];

    sales.push({
      id: `cs-${prediction.id}-${i + 1}`,
      predictionId: prediction.id,
      cardName: prediction.cardName,
      saleDate: saleDate.toISOString(),
      price: salePrice,
      platform,
      grade: prediction.grade,
      notes: i % 5 === 0 ? 'Best Offer accepted' : i % 7 === 0 ? 'Auction ending' : 'Buy It Now',
    });
  }

  return sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
}

// ---- Mock Data: Fair Offers (20) ----

const MOCK_FAIR_OFFERS: FairOffer[] = [
  { id: 'fo-1', predictionId: 'pp-1', cardName: '2023 Topps Chrome Victor Wembanyama PSA 10', currentPrice: 2850, buyLow: 2400, buyFair: 2700, sellFair: 3000, sellHigh: 3300, confidence: 'high', reasoning: 'Strong rookie demand with rising trajectory. Population relatively low for modern card. Fair to buy slightly below market.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-2', predictionId: 'pp-2', cardName: '2003 Topps Chrome LeBron James PSA 10', currentPrice: 45000, buyLow: 39000, buyFair: 43000, sellFair: 47000, sellHigh: 52000, confidence: 'very_high', reasoning: 'Blue-chip investment card. Low pop count relative to demand ensures stability. Strong floor with significant upside.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-3', predictionId: 'pp-3', cardName: '2018 Topps Chrome Shohei Ohtani PSA 10', currentPrice: 1200, buyLow: 1000, buyFair: 1150, sellFair: 1300, sellHigh: 1450, confidence: 'high', reasoning: 'Unique two-way talent drives sustained demand. High pop but demand consistently outpaces supply.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-4', predictionId: 'pp-4', cardName: '2020 Prizm Lamelo Ball PSA 10', currentPrice: 850, buyLow: 700, buyFair: 800, sellFair: 900, sellHigh: 1000, confidence: 'moderate', reasoning: 'All-Star caliber player with highlight-reel appeal. High pop count tempers upside slightly.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-5', predictionId: 'pp-5', cardName: '2023 Bowman Chrome 1st Ethan Salas', currentPrice: 180, buyLow: 140, buyFair: 170, sellFair: 200, sellHigh: 240, confidence: 'moderate', reasoning: 'Top prospect with significant upside but unproven at MLB level. High risk/high reward profile.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-6', predictionId: 'pp-6', cardName: '2018 Panini Prizm Luka Doncic PSA 10', currentPrice: 3200, buyLow: 2750, buyFair: 3050, sellFair: 3400, sellHigh: 3700, confidence: 'high', reasoning: 'Generational talent with MVP-caliber stats. International appeal adds global demand floor.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-7', predictionId: 'pp-7', cardName: '2011 Topps Update Mike Trout PSA 10', currentPrice: 28000, buyLow: 24000, buyFair: 26500, sellFair: 29000, sellHigh: 31000, confidence: 'high', reasoning: 'Iconic card but injury concerns create downward pressure. Still a cornerstone modern card.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-8', predictionId: 'pp-12', cardName: '2017 Panini Prizm Patrick Mahomes PSA 10', currentPrice: 12500, buyLow: 10800, buyFair: 12000, sellFair: 13200, sellHigh: 14500, confidence: 'very_high', reasoning: 'Multiple Super Bowl winner with GOAT trajectory. Low pop and high demand create strong price floor.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-9', predictionId: 'pp-22', cardName: '2015 Panini Prizm Nikola Jokic PSA 10', currentPrice: 5500, buyLow: 4700, buyFair: 5200, sellFair: 5800, sellHigh: 6400, confidence: 'high', reasoning: 'Back-to-back MVP with historic stats. Undervalued relative to peers due to market perception.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-10', predictionId: 'pp-37', cardName: '2013 Panini Prizm Giannis Antetokounmpo PSA 10', currentPrice: 22000, buyLow: 19000, buyFair: 21000, sellFair: 23500, sellHigh: 26000, confidence: 'very_high', reasoning: 'Champion and MVP with extreme scarcity. One of the most sought-after modern basketball cards.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-11', predictionId: 'pp-10', cardName: '2020 Panini Prizm Justin Herbert PSA 10', currentPrice: 680, buyLow: 570, buyFair: 650, sellFair: 720, sellHigh: 800, confidence: 'moderate', reasoning: 'Elite arm talent with playoff potential. High pop moderates price but demand is consistent.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-12', predictionId: 'pp-14', cardName: '2022 Topps Chrome Julio Rodriguez PSA 10', currentPrice: 380, buyLow: 320, buyFair: 360, sellFair: 410, sellHigh: 450, confidence: 'high', reasoning: 'Five-tool player entering prime years. Long-term deal signals franchise commitment.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-13', predictionId: 'pp-15', cardName: '2020 Panini Prizm Joe Burrow PSA 10', currentPrice: 520, buyLow: 440, buyFair: 500, sellFair: 560, sellHigh: 620, confidence: 'moderate', reasoning: 'Proven playoff performer with Super Bowl appearance. Injury history creates buying opportunities.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-14', predictionId: 'pp-25', cardName: '2018 Topps Chrome Juan Soto PSA 10', currentPrice: 750, buyLow: 630, buyFair: 720, sellFair: 800, sellHigh: 880, confidence: 'high', reasoning: 'Elite plate discipline and power combination. Big market move could accelerate price growth.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-15', predictionId: 'pp-34', cardName: '2023 Upper Deck Connor Bedard Young Guns PSA 10', currentPrice: 650, buyLow: 540, buyFair: 620, sellFair: 700, sellHigh: 780, confidence: 'moderate', reasoning: 'Generational hockey talent. Low graded population supports premium pricing.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-16', predictionId: 'pp-41', cardName: '2015 Upper Deck Connor McDavid Young Guns PSA 10', currentPrice: 8500, buyLow: 7200, buyFair: 8100, sellFair: 9000, sellHigh: 9800, confidence: 'very_high', reasoning: 'Best hockey player of his generation. Extremely limited high-grade supply makes this a cornerstone card.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-17', predictionId: 'pp-23', cardName: '2024 Topps Chrome Paul Skenes PSA 10', currentPrice: 320, buyLow: 260, buyFair: 300, sellFair: 350, sellHigh: 400, confidence: 'moderate', reasoning: 'Dominant debut season with Cy Young potential. Prospect hype may cool but talent is elite.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-18', predictionId: 'pp-28', cardName: '2021 Topps Chrome Bobby Witt Jr PSA 10', currentPrice: 280, buyLow: 230, buyFair: 265, sellFair: 300, sellHigh: 340, confidence: 'moderate', reasoning: 'Five-tool talent entering prime. Breakout season potential could drive significant price increase.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-19', predictionId: 'pp-33', cardName: '2019 Topps Chrome Yordan Alvarez PSA 10', currentPrice: 480, buyLow: 400, buyFair: 460, sellFair: 510, sellHigh: 560, confidence: 'high', reasoning: 'Elite power hitter with consistent production. World Series pedigree adds premium.', generatedAt: '2026-03-15T08:00:00Z' },
  { id: 'fo-20', predictionId: 'pp-20', cardName: '2014 Topps Chrome Mookie Betts PSA 10', currentPrice: 950, buyLow: 800, buyFair: 900, sellFair: 1020, sellHigh: 1100, confidence: 'high', reasoning: 'MVP and World Series champion with multiple teams. Broad collector appeal supports pricing.', generatedAt: '2026-03-15T08:00:00Z' },
];

// ---- Mock Data: Prediction Factors ----

const MOCK_PREDICTION_FACTORS: PredictionFactor[] = [
  { id: 'pf-1', name: 'Season Performance', category: 'seasonPerformance', impact: 8.5, direction: 'positive', description: 'Player is exceeding statistical projections this season', weight: 0.25 },
  { id: 'pf-2', name: 'Injury Risk Assessment', category: 'injuryRisk', impact: -3.2, direction: 'negative', description: 'Minor injury concerns based on workload and history', weight: 0.15 },
  { id: 'pf-3', name: 'Free Agency Impact', category: 'freeAgency', impact: 5.0, direction: 'positive', description: 'Upcoming free agency could drive bidding war and media attention', weight: 0.12 },
  { id: 'pf-4', name: 'Card Population Growth', category: 'cardPopulation', impact: -2.1, direction: 'negative', description: 'Increasing submissions to grading companies diluting scarcity', weight: 0.18 },
  { id: 'pf-5', name: 'Market Momentum Index', category: 'marketMomentum', impact: 6.8, direction: 'positive', description: 'Strong buying pressure with increasing average sale prices', weight: 0.20 },
  { id: 'pf-6', name: 'Social Sentiment Score', category: 'socialSentiment', impact: 4.2, direction: 'positive', description: 'Positive sentiment trending on collector forums and social media', weight: 0.10 },
  { id: 'pf-7', name: 'Playoff Performance Boost', category: 'seasonPerformance', impact: 12.0, direction: 'positive', description: 'Exceptional playoff run driving demand spike', weight: 0.25 },
  { id: 'pf-8', name: 'Chronic Injury Concerns', category: 'injuryRisk', impact: -8.5, direction: 'negative', description: 'Recurring injuries limiting playing time and career outlook', weight: 0.15 },
  { id: 'pf-9', name: 'Contract Extension Signed', category: 'freeAgency', impact: 3.5, direction: 'positive', description: 'Long-term deal provides stability and reduces uncertainty', weight: 0.12 },
  { id: 'pf-10', name: 'Low Population Report', category: 'cardPopulation', impact: 7.5, direction: 'positive', description: 'Very limited PSA 10 population creates scarcity premium', weight: 0.18 },
  { id: 'pf-11', name: 'Bearish Market Trend', category: 'marketMomentum', impact: -5.5, direction: 'negative', description: 'Overall sports card market showing declining volume and prices', weight: 0.20 },
  { id: 'pf-12', name: 'Viral Moment', category: 'socialSentiment', impact: 9.0, direction: 'positive', description: 'Recent viral highlight driving non-collector interest', weight: 0.10 },
  { id: 'pf-13', name: 'Rookie of the Year Watch', category: 'seasonPerformance', impact: 10.5, direction: 'positive', description: 'Leading ROY candidate driving first-year card demand', weight: 0.25 },
  { id: 'pf-14', name: 'Season-Ending Surgery', category: 'injuryRisk', impact: -15.0, direction: 'negative', description: 'Major surgery ending current season with uncertain recovery', weight: 0.15 },
  { id: 'pf-15', name: 'Trade Rumors', category: 'freeAgency', impact: 2.0, direction: 'neutral', description: 'Active trade rumors creating uncertainty but also interest', weight: 0.12 },
  { id: 'pf-16', name: 'Mass Grading Submissions', category: 'cardPopulation', impact: -6.0, direction: 'negative', description: 'Bulk submissions flooding market with graded copies', weight: 0.18 },
  { id: 'pf-17', name: 'Record-Breaking Auction', category: 'marketMomentum', impact: 11.0, direction: 'positive', description: 'Recent record sale setting new price benchmark for comparable cards', weight: 0.20 },
  { id: 'pf-18', name: 'Negative Press Coverage', category: 'socialSentiment', impact: -7.0, direction: 'negative', description: 'Off-field controversy dampening collector sentiment', weight: 0.10 },
];

// ---- Mock Data: Alert Thresholds ----

const MOCK_ALERT_THRESHOLDS: AlertThreshold[] = [
  { id: 'at-1', predictionId: 'pp-1', cardName: '2023 Topps Chrome Victor Wembanyama PSA 10', type: 'price_above', value: 3200, active: true, triggered: false, createdAt: '2026-03-10T12:00:00Z' },
  { id: 'at-2', predictionId: 'pp-1', cardName: '2023 Topps Chrome Victor Wembanyama PSA 10', type: 'price_below', value: 2500, active: true, triggered: false, createdAt: '2026-03-10T12:00:00Z' },
  { id: 'at-3', predictionId: 'pp-2', cardName: '2003 Topps Chrome LeBron James PSA 10', type: 'price_above', value: 50000, active: true, triggered: false, createdAt: '2026-03-08T09:00:00Z' },
  { id: 'at-4', predictionId: 'pp-12', cardName: '2017 Panini Prizm Patrick Mahomes PSA 10', type: 'change_percent', value: 15, active: true, triggered: false, createdAt: '2026-03-12T14:00:00Z' },
  { id: 'at-5', predictionId: 'pp-3', cardName: '2018 Topps Chrome Shohei Ohtani PSA 10', type: 'price_below', value: 1000, active: true, triggered: false, createdAt: '2026-03-11T10:00:00Z' },
  { id: 'at-6', predictionId: 'pp-7', cardName: '2011 Topps Update Mike Trout PSA 10', type: 'price_below', value: 25000, active: true, triggered: false, createdAt: '2026-03-09T08:00:00Z' },
  { id: 'at-7', predictionId: 'pp-37', cardName: '2013 Panini Prizm Giannis Antetokounmpo PSA 10', type: 'price_above', value: 25000, active: true, triggered: false, createdAt: '2026-03-13T16:00:00Z' },
  { id: 'at-8', predictionId: 'pp-6', cardName: '2018 Panini Prizm Luka Doncic PSA 10', type: 'change_percent', value: 10, active: true, triggered: false, createdAt: '2026-03-14T11:00:00Z' },
];

// ---- Exported Functions ----

export function getPricePredictions(): PricePrediction[] {
  const saved = loadData<PricePrediction[]>('predictions');
  return saved ?? MOCK_PREDICTIONS;
}

export function getPredictionDetails(id: string): PricePrediction | null {
  const predictions = getPricePredictions();
  return predictions.find((p) => p.id === id) ?? null;
}

export function generateFairOffer(predictionId: string): FairOffer | null {
  const existing = MOCK_FAIR_OFFERS.find((fo) => fo.predictionId === predictionId);
  if (existing) return existing;

  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return null;

  const price = prediction.currentPrice;
  return {
    id: `fo-gen-${predictionId}`,
    predictionId,
    cardName: prediction.cardName,
    currentPrice: price,
    buyLow: Math.round(price * 0.82),
    buyFair: Math.round(price * 0.94),
    sellFair: Math.round(price * 1.06),
    sellHigh: Math.round(price * 1.18),
    confidence: prediction.confidence,
    reasoning: `AI-generated fair offer based on ${prediction.popCount} graded copies and recent comparable sales data.`,
    generatedAt: new Date().toISOString(),
  };
}

export function getMarketEvidence(predictionId: string): MarketEvidence[] {
  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return [];

  const platforms = ['eBay', 'PWCC', 'Heritage Auctions', 'Goldin', 'MySlabs', 'COMC'];
  const evidence: MarketEvidence[] = [];

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const variance = (Math.random() * 0.2 - 0.1);

    evidence.push({
      id: `me-${predictionId}-${i + 1}`,
      predictionId,
      source: platforms[i % platforms.length],
      saleDate: date.toISOString(),
      price: Math.round(prediction.currentPrice * (1 + variance) * 100) / 100,
      platform: platforms[i % platforms.length],
      condition: prediction.grade,
      notes: i % 3 === 0 ? 'Auction sale' : 'Fixed price',
    });
  }

  return evidence.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
}

export function getModelAccuracy(): ModelAccuracy {
  return MOCK_MODEL_ACCURACY;
}

export function getPriceHistory(predictionId: string): PriceHistory[] {
  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return [];

  const history: PriceHistory[] = [];
  let price = prediction.currentPrice;
  const trend = prediction.trending === 'up' ? -0.008 : prediction.trending === 'down' ? 0.008 : 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dailyVariance = (Math.random() * 0.04 - 0.02);
    price = price * (1 + trend + dailyVariance);

    if (i % 3 === 0) {
      history.push({
        id: `ph-${predictionId}-${i}`,
        predictionId,
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 20) + 1,
        source: 'aggregated',
      });
    }
  }

  return history;
}

export function getComparableSales(predictionId: string): ComparableSale[] {
  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return [];
  return generateComparableSales(prediction);
}

export function getValuationReport(predictionId: string): ValuationReport | null {
  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return null;

  const comparables = generateComparableSales(prediction);
  const avgPrice = comparables.reduce((sum, c) => sum + c.price, 0) / comparables.length;

  return {
    id: `vr-${predictionId}`,
    predictionId,
    cardName: prediction.cardName,
    generatedAt: new Date().toISOString(),
    currentValue: prediction.currentPrice,
    fairMarketValue: Math.round(avgPrice),
    insuranceValue: Math.round(prediction.currentPrice * 1.3),
    liquidationValue: Math.round(prediction.currentPrice * 0.7),
    factors: MOCK_PREDICTION_FACTORS.slice(0, 6),
    comparables: comparables.slice(0, 10),
    summary: `Based on ${comparables.length} comparable sales across multiple platforms, the fair market value of ${prediction.cardName} is estimated at ${formatCurrency(Math.round(avgPrice))}. The card is currently ${prediction.trending === 'up' ? 'trending upward' : prediction.trending === 'down' ? 'trending downward' : 'stable'} with ${prediction.confidence} confidence.`,
  };
}

export function getPredictionFactors(predictionId?: string): PredictionFactor[] {
  if (!predictionId) return MOCK_PREDICTION_FACTORS;

  const prediction = getPredictionDetails(predictionId);
  if (!prediction) return [];

  if (prediction.trending === 'up') {
    return MOCK_PREDICTION_FACTORS.filter((f) => f.direction === 'positive' || f.direction === 'neutral').slice(0, 6);
  } else if (prediction.trending === 'down') {
    return MOCK_PREDICTION_FACTORS.filter((f) => f.direction === 'negative' || f.direction === 'neutral').slice(0, 6);
  }
  return MOCK_PREDICTION_FACTORS.slice(0, 6);
}

export function setBatchPredictions(name: string, predictionIds: string[]): BatchPrediction {
  const predictions = getPricePredictions().filter((p) => predictionIds.includes(p.id));
  const totalCurrent = predictions.reduce((sum, p) => sum + p.currentPrice, 0);

  const timeframes: PredictionTimeframe[] = ['7d', '30d', '60d', '90d', '180d', '1y'];
  const totalPredicted: Record<PredictionTimeframe, number> = {} as Record<PredictionTimeframe, number>;
  for (const tf of timeframes) {
    totalPredicted[tf] = predictions.reduce((sum, p) => sum + p.predictions[tf].price, 0);
  }

  const batch: BatchPrediction = {
    id: `bp-${Date.now()}`,
    name,
    predictionIds,
    totalCurrentValue: totalCurrent,
    totalPredictedValue: totalPredicted,
    createdAt: new Date().toISOString(),
  };

  const saved = loadData<BatchPrediction[]>('batches') ?? [];
  saved.push(batch);
  saveData('batches', saved);

  return batch;
}

export function getAlertThresholds(): AlertThreshold[] {
  const saved = loadData<AlertThreshold[]>('alerts');
  return saved ?? MOCK_ALERT_THRESHOLDS;
}

export function getTopMovers(): { gainers: PricePrediction[]; losers: PricePrediction[] } {
  const predictions = getPricePredictions();
  const sorted = [...predictions].sort((a, b) => b.predictions['30d'].changePercent - a.predictions['30d'].changePercent);

  return {
    gainers: sorted.slice(0, 10),
    losers: sorted.slice(-10).reverse(),
  };
}

export function getTrendAnalysis(sport?: string): { sport: string; avgChange30d: number; avgChange90d: number; totalCards: number; trending: 'up' | 'down' | 'stable' }[] {
  const predictions = getPricePredictions();
  const sports = sport ? [sport] : [...new Set(predictions.map((p) => p.sport))];

  return sports.map((s) => {
    const sportCards = predictions.filter((p) => p.sport === s);
    const avg30d = sportCards.reduce((sum, p) => sum + p.predictions['30d'].changePercent, 0) / sportCards.length;
    const avg90d = sportCards.reduce((sum, p) => sum + p.predictions['90d'].changePercent, 0) / sportCards.length;

    return {
      sport: s,
      avgChange30d: Math.round(avg30d * 10) / 10,
      avgChange90d: Math.round(avg90d * 10) / 10,
      totalCards: sportCards.length,
      trending: avg30d > 3 ? 'up' as const : avg30d < -3 ? 'down' as const : 'stable' as const,
    };
  });
}
