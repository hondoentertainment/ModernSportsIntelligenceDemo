// Order Flow Toxicity Meter Service — Phase 13
// VPIN-style toxic flow detection in card marketplace listings

export interface ToxicityReading {
  id: string;
  category: string;
  sport: string;
  vpinScore: number;
  toxicityLevel: 'low' | 'moderate' | 'high' | 'critical';
  buyPressure: number;
  sellPressure: number;
  informedTraderPct: number;
  timestamp: string;
  listingVolume: number;
  priceVolatility: number;
}

export interface VPINScore {
  id: string;
  category: string;
  currentVPIN: number;
  avgVPIN: number;
  stdDev: number;
  zScore: number;
  percentile: number;
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: string;
}

export interface FlowAnalysis {
  id: string;
  category: string;
  netFlow: number;
  grossVolume: number;
  buyVolume: number;
  sellVolume: number;
  imbalanceRatio: number;
  toxicBuyPct: number;
  toxicSellPct: number;
  period: string;
}

export interface ToxicityHistory {
  date: string;
  overallVPIN: number;
  basketballVPIN: number;
  baseballVPIN: number;
  footballVPIN: number;
  alertsTriggered: number;
  avgImbalance: number;
}

const MOCK_READINGS: ToxicityReading[] = [
  { id: 'tr-1', category: 'Basketball Prizm Silver', sport: 'Basketball', vpinScore: 0.82, toxicityLevel: 'critical', buyPressure: 78, sellPressure: 22, informedTraderPct: 45, timestamp: '2026-04-18T09:00:00Z', listingVolume: 342, priceVolatility: 18.4 },
  { id: 'tr-2', category: 'Football RPAs', sport: 'Football', vpinScore: 0.71, toxicityLevel: 'high', buyPressure: 65, sellPressure: 35, informedTraderPct: 38, timestamp: '2026-04-18T09:00:00Z', listingVolume: 187, priceVolatility: 14.2 },
  { id: 'tr-3', category: 'Baseball Vintage', sport: 'Baseball', vpinScore: 0.34, toxicityLevel: 'low', buyPressure: 48, sellPressure: 52, informedTraderPct: 12, timestamp: '2026-04-18T09:00:00Z', listingVolume: 94, priceVolatility: 3.8 },
  { id: 'tr-4', category: 'Basketball National Treasures', sport: 'Basketball', vpinScore: 0.68, toxicityLevel: 'high', buyPressure: 71, sellPressure: 29, informedTraderPct: 35, timestamp: '2026-04-18T09:00:00Z', listingVolume: 56, priceVolatility: 22.1 },
  { id: 'tr-5', category: 'Football Prizm', sport: 'Football', vpinScore: 0.55, toxicityLevel: 'moderate', buyPressure: 58, sellPressure: 42, informedTraderPct: 24, timestamp: '2026-04-18T09:00:00Z', listingVolume: 428, priceVolatility: 9.7 },
  { id: 'tr-6', category: 'Baseball Bowman Chrome', sport: 'Baseball', vpinScore: 0.62, toxicityLevel: 'high', buyPressure: 63, sellPressure: 37, informedTraderPct: 31, timestamp: '2026-04-18T09:00:00Z', listingVolume: 215, priceVolatility: 12.5 },
  { id: 'tr-7', category: 'Basketball Optic', sport: 'Basketball', vpinScore: 0.48, toxicityLevel: 'moderate', buyPressure: 54, sellPressure: 46, informedTraderPct: 19, timestamp: '2026-04-18T09:00:00Z', listingVolume: 312, priceVolatility: 7.3 },
  { id: 'tr-8', category: 'Soccer Topps Chrome', sport: 'Soccer', vpinScore: 0.73, toxicityLevel: 'high', buyPressure: 69, sellPressure: 31, informedTraderPct: 41, timestamp: '2026-04-18T09:00:00Z', listingVolume: 178, priceVolatility: 16.8 },
  { id: 'tr-9', category: 'Hockey Young Guns', sport: 'Hockey', vpinScore: 0.29, toxicityLevel: 'low', buyPressure: 44, sellPressure: 56, informedTraderPct: 10, timestamp: '2026-04-18T09:00:00Z', listingVolume: 89, priceVolatility: 4.1 },
  { id: 'tr-10', category: 'Baseball Topps Update', sport: 'Baseball', vpinScore: 0.41, toxicityLevel: 'moderate', buyPressure: 52, sellPressure: 48, informedTraderPct: 17, timestamp: '2026-04-18T09:00:00Z', listingVolume: 267, priceVolatility: 6.9 },
  { id: 'tr-11', category: 'Football Mosaic', sport: 'Football', vpinScore: 0.59, toxicityLevel: 'moderate', buyPressure: 61, sellPressure: 39, informedTraderPct: 27, timestamp: '2026-04-18T09:00:00Z', listingVolume: 198, priceVolatility: 11.2 },
  { id: 'tr-12', category: 'Basketball Select', sport: 'Basketball', vpinScore: 0.44, toxicityLevel: 'moderate', buyPressure: 51, sellPressure: 49, informedTraderPct: 16, timestamp: '2026-04-18T09:00:00Z', listingVolume: 156, priceVolatility: 5.8 },
  { id: 'tr-13', category: 'Baseball Panini Prizm', sport: 'Baseball', vpinScore: 0.37, toxicityLevel: 'low', buyPressure: 46, sellPressure: 54, informedTraderPct: 13, timestamp: '2026-04-18T09:00:00Z', listingVolume: 134, priceVolatility: 4.5 },
  { id: 'tr-14', category: 'Football Contenders', sport: 'Football', vpinScore: 0.78, toxicityLevel: 'critical', buyPressure: 74, sellPressure: 26, informedTraderPct: 42, timestamp: '2026-04-18T09:00:00Z', listingVolume: 112, priceVolatility: 21.3 },
  { id: 'tr-15', category: 'Basketball Hoops', sport: 'Basketball', vpinScore: 0.25, toxicityLevel: 'low', buyPressure: 42, sellPressure: 58, informedTraderPct: 8, timestamp: '2026-04-18T09:00:00Z', listingVolume: 445, priceVolatility: 3.2 },
  { id: 'tr-16', category: 'Soccer Panini Prizm World Cup', sport: 'Soccer', vpinScore: 0.66, toxicityLevel: 'high', buyPressure: 67, sellPressure: 33, informedTraderPct: 33, timestamp: '2026-04-18T09:00:00Z', listingVolume: 201, priceVolatility: 13.7 },
  { id: 'tr-17', category: 'Baseball Heritage', sport: 'Baseball', vpinScore: 0.31, toxicityLevel: 'low', buyPressure: 45, sellPressure: 55, informedTraderPct: 11, timestamp: '2026-04-18T09:00:00Z', listingVolume: 78, priceVolatility: 2.9 },
  { id: 'tr-18', category: 'Football Donruss', sport: 'Football', vpinScore: 0.42, toxicityLevel: 'moderate', buyPressure: 53, sellPressure: 47, informedTraderPct: 18, timestamp: '2026-04-18T09:00:00Z', listingVolume: 289, priceVolatility: 6.1 },
  { id: 'tr-19', category: 'Basketball Immaculate', sport: 'Basketball', vpinScore: 0.85, toxicityLevel: 'critical', buyPressure: 81, sellPressure: 19, informedTraderPct: 48, timestamp: '2026-04-18T09:00:00Z', listingVolume: 34, priceVolatility: 28.5 },
  { id: 'tr-20', category: 'Baseball Topps Chrome', sport: 'Baseball', vpinScore: 0.52, toxicityLevel: 'moderate', buyPressure: 56, sellPressure: 44, informedTraderPct: 22, timestamp: '2026-04-18T09:00:00Z', listingVolume: 356, priceVolatility: 8.4 },
];

const MOCK_VPIN_SCORES: VPINScore[] = [
  { id: 'vp-1', category: 'Basketball Prizm Silver', currentVPIN: 0.82, avgVPIN: 0.55, stdDev: 0.12, zScore: 2.25, percentile: 97, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-2', category: 'Football RPAs', currentVPIN: 0.71, avgVPIN: 0.48, stdDev: 0.14, zScore: 1.64, percentile: 89, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-3', category: 'Baseball Vintage', currentVPIN: 0.34, avgVPIN: 0.38, stdDev: 0.08, zScore: -0.50, percentile: 31, trend: 'falling', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-4', category: 'Basketball National Treasures', currentVPIN: 0.68, avgVPIN: 0.52, stdDev: 0.15, zScore: 1.07, percentile: 82, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-5', category: 'Football Prizm', currentVPIN: 0.55, avgVPIN: 0.50, stdDev: 0.10, zScore: 0.50, percentile: 62, trend: 'stable', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-6', category: 'Soccer Topps Chrome', currentVPIN: 0.73, avgVPIN: 0.45, stdDev: 0.13, zScore: 2.15, percentile: 96, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-7', category: 'Basketball Immaculate', currentVPIN: 0.85, avgVPIN: 0.58, stdDev: 0.11, zScore: 2.45, percentile: 99, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
  { id: 'vp-8', category: 'Football Contenders', currentVPIN: 0.78, avgVPIN: 0.51, stdDev: 0.12, zScore: 2.25, percentile: 95, trend: 'rising', lastUpdated: '2026-04-18T09:00:00Z' },
];

const MOCK_FLOW_ANALYSIS: FlowAnalysis[] = [
  { id: 'fa-1', category: 'Basketball Prizm Silver', netFlow: 285000, grossVolume: 892000, buyVolume: 588500, sellVolume: 303500, imbalanceRatio: 0.64, toxicBuyPct: 45, toxicSellPct: 12, period: '24h' },
  { id: 'fa-2', category: 'Football RPAs', netFlow: 142000, grossVolume: 456000, buyVolume: 299000, sellVolume: 157000, imbalanceRatio: 0.57, toxicBuyPct: 38, toxicSellPct: 15, period: '24h' },
  { id: 'fa-3', category: 'Baseball Vintage', netFlow: -18000, grossVolume: 234000, buyVolume: 108000, sellVolume: 126000, imbalanceRatio: 0.44, toxicBuyPct: 8, toxicSellPct: 14, period: '24h' },
  { id: 'fa-4', category: 'Basketball National Treasures', netFlow: 95000, grossVolume: 312000, buyVolume: 203500, sellVolume: 108500, imbalanceRatio: 0.58, toxicBuyPct: 35, toxicSellPct: 10, period: '24h' },
  { id: 'fa-5', category: 'Football Prizm', netFlow: 67000, grossVolume: 645000, buyVolume: 356000, sellVolume: 289000, imbalanceRatio: 0.52, toxicBuyPct: 24, toxicSellPct: 18, period: '24h' },
  { id: 'fa-6', category: 'Soccer Topps Chrome', netFlow: 112000, grossVolume: 278000, buyVolume: 195000, sellVolume: 83000, imbalanceRatio: 0.63, toxicBuyPct: 41, toxicSellPct: 9, period: '24h' },
];

const MOCK_TOXICITY_HISTORY: ToxicityHistory[] = [
  { date: 'Apr 12', overallVPIN: 0.42, basketballVPIN: 0.48, baseballVPIN: 0.35, footballVPIN: 0.44, alertsTriggered: 3, avgImbalance: 0.52 },
  { date: 'Apr 13', overallVPIN: 0.45, basketballVPIN: 0.52, baseballVPIN: 0.33, footballVPIN: 0.49, alertsTriggered: 4, avgImbalance: 0.54 },
  { date: 'Apr 14', overallVPIN: 0.51, basketballVPIN: 0.58, baseballVPIN: 0.36, footballVPIN: 0.55, alertsTriggered: 6, avgImbalance: 0.57 },
  { date: 'Apr 15', overallVPIN: 0.56, basketballVPIN: 0.64, baseballVPIN: 0.38, footballVPIN: 0.60, alertsTriggered: 8, avgImbalance: 0.59 },
  { date: 'Apr 16', overallVPIN: 0.62, basketballVPIN: 0.71, baseballVPIN: 0.37, footballVPIN: 0.65, alertsTriggered: 11, avgImbalance: 0.62 },
  { date: 'Apr 17', overallVPIN: 0.58, basketballVPIN: 0.68, baseballVPIN: 0.35, footballVPIN: 0.62, alertsTriggered: 9, avgImbalance: 0.60 },
  { date: 'Apr 18', overallVPIN: 0.64, basketballVPIN: 0.75, baseballVPIN: 0.39, footballVPIN: 0.67, alertsTriggered: 13, avgImbalance: 0.63 },
];

export function getToxicityReadings(): ToxicityReading[] { return [...MOCK_READINGS]; }
export function getVPINScores(): VPINScore[] { return [...MOCK_VPIN_SCORES]; }
export function getFlowAnalysis(): FlowAnalysis[] { return [...MOCK_FLOW_ANALYSIS]; }
export function getToxicityHistory(): ToxicityHistory[] { return [...MOCK_TOXICITY_HISTORY]; }
export function getCriticalCount(): number { return MOCK_READINGS.filter(r => r.toxicityLevel === 'critical').length; }
export function getHighCount(): number { return MOCK_READINGS.filter(r => r.toxicityLevel === 'high').length; }
export function getAvgVPIN(): number { return parseFloat((MOCK_READINGS.reduce((sum, r) => sum + r.vpinScore, 0) / MOCK_READINGS.length).toFixed(2)); }
export function getMaxVPIN(): number { return Math.max(...MOCK_READINGS.map(r => r.vpinScore)); }
