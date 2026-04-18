// Market Maker Incentive Analyzer Service — Phase 13
// Analyze dealer spread incentives and market-making behavior

export interface IncentiveProfile {
  id: string;
  dealerName: string;
  category: string;
  avgBuySpread: number;
  avgSellSpread: number;
  netSpread: number;
  inventoryTurnover: number;
  marketDepth: number;
  incentiveType: 'volume-based' | 'spread-based' | 'inventory-based' | 'hybrid';
  profitMargin: number;
  riskScore: number;
  activeListings: number;
  monthlyVolume: number;
}

export interface SpreadAnalysis {
  id: string;
  category: string;
  bidAskSpread: number;
  effectiveSpread: number;
  realizedSpread: number;
  priceImpact: number;
  depth: number;
  resilience: number;
  makerCount: number;
  trend: 'tightening' | 'widening' | 'stable';
}

export interface MakerBehavior {
  id: string;
  dealerName: string;
  behavior: string;
  frequency: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  detectedAt: string;
  confidence: number;
}

export interface IncentiveHistory {
  month: string;
  avgSpread: number;
  avgTurnover: number;
  activeMakers: number;
  totalVolume: number;
  avgProfitMargin: number;
  marketEfficiency: number;
}

const MOCK_PROFILES: IncentiveProfile[] = [
  { id: 'ip-1', dealerName: 'CardKingCollectors', category: 'Modern Basketball', avgBuySpread: -8.5, avgSellSpread: 12.2, netSpread: 20.7, inventoryTurnover: 4.2, marketDepth: 85, incentiveType: 'volume-based', profitMargin: 14.5, riskScore: 22, activeListings: 2450, monthlyVolume: 185000 },
  { id: 'ip-2', dealerName: 'PremiumSlabsCo', category: 'Graded Premium', avgBuySpread: -12.0, avgSellSpread: 18.5, netSpread: 30.5, inventoryTurnover: 2.8, marketDepth: 62, incentiveType: 'spread-based', profitMargin: 22.1, riskScore: 45, activeListings: 890, monthlyVolume: 142000 },
  { id: 'ip-3', dealerName: 'VintageVaultDeals', category: 'Vintage Baseball', avgBuySpread: -15.0, avgSellSpread: 22.0, netSpread: 37.0, inventoryTurnover: 1.5, marketDepth: 45, incentiveType: 'inventory-based', profitMargin: 28.5, riskScore: 58, activeListings: 340, monthlyVolume: 95000 },
  { id: 'ip-4', dealerName: 'EliteCardGroup', category: 'Multi-Sport', avgBuySpread: -6.2, avgSellSpread: 9.8, netSpread: 16.0, inventoryTurnover: 5.8, marketDepth: 92, incentiveType: 'volume-based', profitMargin: 11.2, riskScore: 15, activeListings: 5200, monthlyVolume: 328000 },
  { id: 'ip-5', dealerName: 'MidwestCardShop', category: 'Football Modern', avgBuySpread: -9.8, avgSellSpread: 14.5, netSpread: 24.3, inventoryTurnover: 3.5, marketDepth: 72, incentiveType: 'hybrid', profitMargin: 17.8, riskScore: 32, activeListings: 1680, monthlyVolume: 112000 },
  { id: 'ip-6', dealerName: 'TopDeckTrading', category: 'Basketball Prizm', avgBuySpread: -7.5, avgSellSpread: 11.0, netSpread: 18.5, inventoryTurnover: 4.8, marketDepth: 78, incentiveType: 'volume-based', profitMargin: 13.2, riskScore: 25, activeListings: 2100, monthlyVolume: 165000 },
  { id: 'ip-7', dealerName: 'SouthernCardsLLC', category: 'Baseball All', avgBuySpread: -10.5, avgSellSpread: 15.8, netSpread: 26.3, inventoryTurnover: 3.2, marketDepth: 68, incentiveType: 'hybrid', profitMargin: 19.5, riskScore: 38, activeListings: 3400, monthlyVolume: 198000 },
  { id: 'ip-8', dealerName: 'CoastToCoastCards', category: 'Soccer International', avgBuySpread: -11.2, avgSellSpread: 16.5, netSpread: 27.7, inventoryTurnover: 2.2, marketDepth: 42, incentiveType: 'spread-based', profitMargin: 20.8, riskScore: 52, activeListings: 780, monthlyVolume: 62000 },
  { id: 'ip-9', dealerName: 'ProspectPipeline', category: 'Baseball Prospects', avgBuySpread: -5.8, avgSellSpread: 8.5, netSpread: 14.3, inventoryTurnover: 6.5, marketDepth: 88, incentiveType: 'volume-based', profitMargin: 9.8, riskScore: 42, activeListings: 4800, monthlyVolume: 245000 },
  { id: 'ip-10', dealerName: 'VaultedGrails', category: 'Ultra-Premium', avgBuySpread: -18.0, avgSellSpread: 25.0, netSpread: 43.0, inventoryTurnover: 0.8, marketDepth: 28, incentiveType: 'inventory-based', profitMargin: 32.5, riskScore: 68, activeListings: 85, monthlyVolume: 420000 },
  { id: 'ip-11', dealerName: 'QuickFlipDeals', category: 'Modern Football', avgBuySpread: -4.2, avgSellSpread: 6.8, netSpread: 11.0, inventoryTurnover: 8.2, marketDepth: 95, incentiveType: 'volume-based', profitMargin: 7.5, riskScore: 18, activeListings: 6200, monthlyVolume: 285000 },
  { id: 'ip-12', dealerName: 'HeritageDealerNet', category: 'Vintage Multi-Sport', avgBuySpread: -14.5, avgSellSpread: 20.0, netSpread: 34.5, inventoryTurnover: 1.8, marketDepth: 52, incentiveType: 'inventory-based', profitMargin: 26.2, riskScore: 48, activeListings: 520, monthlyVolume: 155000 },
];

const MOCK_SPREADS: SpreadAnalysis[] = [
  { id: 'sa-1', category: 'Modern Basketball', bidAskSpread: 18.5, effectiveSpread: 15.2, realizedSpread: 12.8, priceImpact: 2.4, depth: 82, resilience: 78, makerCount: 45, trend: 'tightening' },
  { id: 'sa-2', category: 'Vintage Baseball', bidAskSpread: 32.0, effectiveSpread: 28.5, realizedSpread: 25.2, priceImpact: 3.3, depth: 38, resilience: 45, makerCount: 12, trend: 'stable' },
  { id: 'sa-3', category: 'Football Prizm', bidAskSpread: 22.4, effectiveSpread: 18.8, realizedSpread: 15.5, priceImpact: 3.3, depth: 72, resilience: 68, makerCount: 32, trend: 'tightening' },
  { id: 'sa-4', category: 'Ultra-Premium', bidAskSpread: 38.0, effectiveSpread: 34.2, realizedSpread: 30.5, priceImpact: 3.7, depth: 22, resilience: 35, makerCount: 6, trend: 'widening' },
  { id: 'sa-5', category: 'Baseball Prospects', bidAskSpread: 15.2, effectiveSpread: 12.5, realizedSpread: 10.8, priceImpact: 1.7, depth: 88, resilience: 85, makerCount: 58, trend: 'tightening' },
  { id: 'sa-6', category: 'Soccer Cards', bidAskSpread: 28.5, effectiveSpread: 24.8, realizedSpread: 21.2, priceImpact: 3.6, depth: 42, resilience: 48, makerCount: 15, trend: 'widening' },
  { id: 'sa-7', category: 'Low-Value Singles', bidAskSpread: 45.0, effectiveSpread: 38.5, realizedSpread: 32.0, priceImpact: 6.5, depth: 95, resilience: 92, makerCount: 120, trend: 'stable' },
  { id: 'sa-8', category: 'Graded Modern', bidAskSpread: 20.2, effectiveSpread: 16.8, realizedSpread: 14.2, priceImpact: 2.6, depth: 75, resilience: 72, makerCount: 38, trend: 'tightening' },
];

const MOCK_BEHAVIORS: MakerBehavior[] = [
  { id: 'mb-1', dealerName: 'EliteCardGroup', behavior: 'Consistent bid support', frequency: 'Daily', impact: 'positive', description: 'Maintains standing buy orders within 6% of market price across 200+ SKUs', detectedAt: '2026-04-18', confidence: 95 },
  { id: 'mb-2', dealerName: 'VaultedGrails', behavior: 'Wide spread positioning', frequency: 'Weekly', impact: 'negative', description: 'Posts buy prices 18% below market and sell prices 25% above on ultra-premium cards', detectedAt: '2026-04-17', confidence: 88 },
  { id: 'mb-3', dealerName: 'QuickFlipDeals', behavior: 'High-frequency repricing', frequency: 'Hourly', impact: 'positive', description: 'Adjusts prices within 2 hours of market moves, providing tight spreads', detectedAt: '2026-04-18', confidence: 92 },
  { id: 'mb-4', dealerName: 'PremiumSlabsCo', behavior: 'Inventory hoarding', frequency: 'Monthly', impact: 'negative', description: 'Accumulates inventory during dips but does not relist for 30+ days', detectedAt: '2026-04-15', confidence: 78 },
  { id: 'mb-5', dealerName: 'ProspectPipeline', behavior: 'Market making at scale', frequency: 'Daily', impact: 'positive', description: 'Acts as primary liquidity provider for baseball prospect cards with consistent 2-way quotes', detectedAt: '2026-04-18', confidence: 94 },
  { id: 'mb-6', dealerName: 'CoastToCoastCards', behavior: 'Selective quote withdrawal', frequency: 'Event-driven', impact: 'negative', description: 'Removes buy orders during high-volatility events, reducing market depth', detectedAt: '2026-04-12', confidence: 82 },
];

const MOCK_INCENTIVE_HISTORY: IncentiveHistory[] = [
  { month: 'Nov 2025', avgSpread: 26.5, avgTurnover: 3.2, activeMakers: 85, totalVolume: 8500000, avgProfitMargin: 18.2, marketEfficiency: 62 },
  { month: 'Dec 2025', avgSpread: 25.8, avgTurnover: 3.5, activeMakers: 88, totalVolume: 9200000, avgProfitMargin: 17.5, marketEfficiency: 64 },
  { month: 'Jan 2026', avgSpread: 24.2, avgTurnover: 3.8, activeMakers: 92, totalVolume: 10500000, avgProfitMargin: 16.8, marketEfficiency: 68 },
  { month: 'Feb 2026', avgSpread: 23.5, avgTurnover: 4.0, activeMakers: 95, totalVolume: 11200000, avgProfitMargin: 16.2, marketEfficiency: 70 },
  { month: 'Mar 2026', avgSpread: 22.8, avgTurnover: 4.2, activeMakers: 98, totalVolume: 12800000, avgProfitMargin: 15.5, marketEfficiency: 72 },
  { month: 'Apr 2026', avgSpread: 22.2, avgTurnover: 4.1, activeMakers: 96, totalVolume: 11500000, avgProfitMargin: 15.8, marketEfficiency: 71 },
];

export function getIncentiveProfiles(): IncentiveProfile[] { return [...MOCK_PROFILES]; }
export function getSpreadAnalysis(): SpreadAnalysis[] { return [...MOCK_SPREADS]; }
export function getMakerBehaviors(): MakerBehavior[] { return [...MOCK_BEHAVIORS]; }
export function getIncentiveHistory(): IncentiveHistory[] { return [...MOCK_INCENTIVE_HISTORY]; }
export function getAvgSpread(): number { return parseFloat((MOCK_SPREADS.reduce((sum, s) => sum + s.bidAskSpread, 0) / MOCK_SPREADS.length).toFixed(1)); }
export function getActiveMakerCount(): number { return MOCK_PROFILES.length; }
export function getAvgProfitMargin(): number { return parseFloat((MOCK_PROFILES.reduce((sum, p) => sum + p.profitMargin, 0) / MOCK_PROFILES.length).toFixed(1)); }
export function getMarketEfficiency(): number { return MOCK_INCENTIVE_HISTORY[MOCK_INCENTIVE_HISTORY.length - 1].marketEfficiency; }
