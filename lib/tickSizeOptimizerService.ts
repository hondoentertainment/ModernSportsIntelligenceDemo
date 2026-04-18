// Tick Size Optimizer Service — Phase 13
// Optimal price increment analysis for card listings

export interface TickAnalysis {
  id: string;
  category: string;
  priceRange: string;
  currentAvgTick: number;
  optimalTick: number;
  improvementPotential: number;
  listingCount: number;
  avgPrice: number;
  priceEfficiency: number;
}

export interface PriceIncrement {
  id: string;
  increment: number;
  frequency: number;
  sellThroughRate: number;
  avgDaysToSell: number;
  priceRange: string;
  category: string;
  performance: 'underperforming' | 'average' | 'optimal' | 'overperforming';
}

export interface OptimalTick {
  id: string;
  category: string;
  priceFloor: number;
  priceCeiling: number;
  recommendedTick: number;
  currentMedianTick: number;
  sellThroughDiff: number;
  revenueImpact: number;
  confidence: number;
}

export interface TickHistory {
  month: string;
  category: string;
  avgTick: number;
  optimalTick: number;
  sellThrough: number;
  avgDaysToSell: number;
  priceEfficiency: number;
}

const MOCK_ANALYSES: TickAnalysis[] = [
  { id: 'ta-1', category: 'Basketball Prizm Silver', priceRange: '$50-$200', currentAvgTick: 5.00, optimalTick: 2.50, improvementPotential: 18.5, listingCount: 4520, avgPrice: 112, priceEfficiency: 72 },
  { id: 'ta-2', category: 'Football RPAs', priceRange: '$500-$5000', currentAvgTick: 50.00, optimalTick: 25.00, improvementPotential: 12.3, listingCount: 890, avgPrice: 2150, priceEfficiency: 78 },
  { id: 'ta-3', category: 'Baseball Vintage', priceRange: '$100-$1000', currentAvgTick: 25.00, optimalTick: 10.00, improvementPotential: 22.1, listingCount: 2340, avgPrice: 425, priceEfficiency: 65 },
  { id: 'ta-4', category: 'Low-Value Singles', priceRange: '$1-$10', currentAvgTick: 1.00, optimalTick: 0.25, improvementPotential: 28.4, listingCount: 45000, avgPrice: 4.50, priceEfficiency: 58 },
  { id: 'ta-5', category: 'Ultra-Premium', priceRange: '$10K+', currentAvgTick: 500.00, optimalTick: 250.00, improvementPotential: 8.7, listingCount: 120, avgPrice: 28500, priceEfficiency: 85 },
  { id: 'ta-6', category: 'Modern Basketball RC', priceRange: '$20-$100', currentAvgTick: 5.00, optimalTick: 1.00, improvementPotential: 24.6, listingCount: 12800, avgPrice: 52, priceEfficiency: 62 },
  { id: 'ta-7', category: 'Football Prizm', priceRange: '$30-$300', currentAvgTick: 10.00, optimalTick: 5.00, improvementPotential: 15.8, listingCount: 6700, avgPrice: 145, priceEfficiency: 74 },
  { id: 'ta-8', category: 'Baseball Prospects', priceRange: '$10-$200', currentAvgTick: 5.00, optimalTick: 2.00, improvementPotential: 20.2, listingCount: 8900, avgPrice: 68, priceEfficiency: 68 },
  { id: 'ta-9', category: 'Soccer Cards', priceRange: '$15-$500', currentAvgTick: 10.00, optimalTick: 5.00, improvementPotential: 14.5, listingCount: 3200, avgPrice: 95, priceEfficiency: 76 },
  { id: 'ta-10', category: 'Graded Modern PSA 10', priceRange: '$50-$500', currentAvgTick: 10.00, optimalTick: 5.00, improvementPotential: 16.2, listingCount: 15400, avgPrice: 185, priceEfficiency: 71 },
];

const MOCK_INCREMENTS: PriceIncrement[] = [
  { id: 'pi-1', increment: 0.25, frequency: 8500, sellThroughRate: 82, avgDaysToSell: 5.2, priceRange: '$1-$10', category: 'Low-Value Singles', performance: 'optimal' },
  { id: 'pi-2', increment: 0.50, frequency: 12000, sellThroughRate: 78, avgDaysToSell: 6.1, priceRange: '$1-$10', category: 'Low-Value Singles', performance: 'average' },
  { id: 'pi-3', increment: 1.00, frequency: 25000, sellThroughRate: 65, avgDaysToSell: 8.5, priceRange: '$1-$10', category: 'Low-Value Singles', performance: 'underperforming' },
  { id: 'pi-4', increment: 2.50, frequency: 6200, sellThroughRate: 85, avgDaysToSell: 4.8, priceRange: '$50-$200', category: 'Basketball Prizm', performance: 'optimal' },
  { id: 'pi-5', increment: 5.00, frequency: 14500, sellThroughRate: 72, avgDaysToSell: 7.2, priceRange: '$50-$200', category: 'Basketball Prizm', performance: 'average' },
  { id: 'pi-6', increment: 10.00, frequency: 8800, sellThroughRate: 58, avgDaysToSell: 12.4, priceRange: '$50-$200', category: 'Basketball Prizm', performance: 'underperforming' },
  { id: 'pi-7', increment: 25.00, frequency: 3200, sellThroughRate: 88, avgDaysToSell: 6.5, priceRange: '$500-$5000', category: 'Football RPAs', performance: 'optimal' },
  { id: 'pi-8', increment: 50.00, frequency: 4800, sellThroughRate: 78, avgDaysToSell: 9.8, priceRange: '$500-$5000', category: 'Football RPAs', performance: 'average' },
  { id: 'pi-9', increment: 100.00, frequency: 2100, sellThroughRate: 62, avgDaysToSell: 15.2, priceRange: '$500-$5000', category: 'Football RPAs', performance: 'underperforming' },
  { id: 'pi-10', increment: 250.00, frequency: 450, sellThroughRate: 91, avgDaysToSell: 8.2, priceRange: '$10K+', category: 'Ultra-Premium', performance: 'optimal' },
];

const MOCK_OPTIMAL_TICKS: OptimalTick[] = [
  { id: 'ot-1', category: 'Low-Value Singles', priceFloor: 1, priceCeiling: 10, recommendedTick: 0.25, currentMedianTick: 1.00, sellThroughDiff: 17, revenueImpact: 8.2, confidence: 92 },
  { id: 'ot-2', category: 'Basketball Prizm', priceFloor: 50, priceCeiling: 200, recommendedTick: 2.50, currentMedianTick: 5.00, sellThroughDiff: 13, revenueImpact: 6.5, confidence: 88 },
  { id: 'ot-3', category: 'Football RPAs', priceFloor: 500, priceCeiling: 5000, recommendedTick: 25.00, currentMedianTick: 50.00, sellThroughDiff: 10, revenueImpact: 4.8, confidence: 85 },
  { id: 'ot-4', category: 'Baseball Vintage', priceFloor: 100, priceCeiling: 1000, recommendedTick: 10.00, currentMedianTick: 25.00, sellThroughDiff: 15, revenueImpact: 7.1, confidence: 82 },
  { id: 'ot-5', category: 'Ultra-Premium', priceFloor: 10000, priceCeiling: 100000, recommendedTick: 250.00, currentMedianTick: 500.00, sellThroughDiff: 6, revenueImpact: 3.2, confidence: 78 },
  { id: 'ot-6', category: 'Modern Basketball RC', priceFloor: 20, priceCeiling: 100, recommendedTick: 1.00, currentMedianTick: 5.00, sellThroughDiff: 20, revenueImpact: 9.8, confidence: 90 },
];

const MOCK_TICK_HISTORY: TickHistory[] = [
  { month: 'Nov 2025', category: 'Basketball Prizm', avgTick: 7.50, optimalTick: 3.00, sellThrough: 68, avgDaysToSell: 9.2, priceEfficiency: 68 },
  { month: 'Dec 2025', category: 'Basketball Prizm', avgTick: 6.80, optimalTick: 2.80, sellThrough: 72, avgDaysToSell: 8.5, priceEfficiency: 70 },
  { month: 'Jan 2026', category: 'Basketball Prizm', avgTick: 6.20, optimalTick: 2.70, sellThrough: 74, avgDaysToSell: 7.8, priceEfficiency: 72 },
  { month: 'Feb 2026', category: 'Basketball Prizm', avgTick: 5.50, optimalTick: 2.60, sellThrough: 76, avgDaysToSell: 7.4, priceEfficiency: 74 },
  { month: 'Mar 2026', category: 'Basketball Prizm', avgTick: 5.20, optimalTick: 2.50, sellThrough: 78, avgDaysToSell: 7.0, priceEfficiency: 75 },
  { month: 'Apr 2026', category: 'Basketball Prizm', avgTick: 5.00, optimalTick: 2.50, sellThrough: 72, avgDaysToSell: 7.2, priceEfficiency: 72 },
];

export function getTickAnalyses(): TickAnalysis[] { return [...MOCK_ANALYSES]; }
export function getPriceIncrements(): PriceIncrement[] { return [...MOCK_INCREMENTS]; }
export function getOptimalTicks(): OptimalTick[] { return [...MOCK_OPTIMAL_TICKS]; }
export function getTickHistory(): TickHistory[] { return [...MOCK_TICK_HISTORY]; }
export function getAvgImprovement(): number { return parseFloat((MOCK_ANALYSES.reduce((sum, a) => sum + a.improvementPotential, 0) / MOCK_ANALYSES.length).toFixed(1)); }
export function getAvgEfficiency(): number { return Math.round(MOCK_ANALYSES.reduce((sum, a) => sum + a.priceEfficiency, 0) / MOCK_ANALYSES.length); }
export function getOptimalTickCount(): number { return MOCK_INCREMENTS.filter(i => i.performance === 'optimal').length; }
export function getTotalListings(): number { return MOCK_ANALYSES.reduce((sum, a) => sum + a.listingCount, 0); }
