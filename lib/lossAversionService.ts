// Loss Aversion Profiler Service
// Map personal loss aversion coefficients from trading history

export interface LossAversionProfile {
  userId: string;
  overallCoefficient: number;
  lossWeight: number;
  gainWeight: number;
  holdingPeriodBias: string;
  riskCategory: 'risk-seeking' | 'neutral' | 'mildly-averse' | 'moderately-averse' | 'highly-averse';
  percentile: number;
  lastUpdated: string;
}

export interface TradeDecision {
  id: string;
  cardName: string;
  sport: string;
  action: 'sold' | 'held' | 'bought-more';
  purchasePrice: number;
  decisionPrice: number;
  currentPrice: number;
  profitLoss: number;
  wasRational: boolean;
  lossAversionIndicator: boolean;
  decisionDate: string;
  reason: string;
}

export interface AversionCoefficient {
  category: string;
  coefficient: number;
  sampleTrades: number;
  avgHoldWhenLosing: string;
  avgHoldWhenWinning: string;
  sellWinRate: number;
  sellLossRate: number;
}

export interface AversionPattern {
  month: string;
  coefficient: number;
  tradesAnalyzed: number;
  lossHolds: number;
  gainSells: number;
  rationalDecisions: number;
  costOfAversion: number;
}

const profile: LossAversionProfile = {
  userId: 'user-001',
  overallCoefficient: 2.4,
  lossWeight: 2.4,
  gainWeight: 1.0,
  holdingPeriodBias: 'Holds losers 3.2x longer than winners',
  riskCategory: 'moderately-averse',
  percentile: 68,
  lastUpdated: '2026-04-18',
};

const tradeDecisions: TradeDecision[] = [
  { id: 'td-1', cardName: '2021 Prizm Trevor Lawrence RC PSA 10', sport: 'Football', action: 'held', purchasePrice: 380, decisionPrice: 145, currentPrice: 125, profitLoss: -255, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-11-15', reason: 'Refused to lock in loss despite declining fundamentals' },
  { id: 'td-2', cardName: '2020 Mosaic Joe Burrow RC PSA 10', sport: 'Football', action: 'held', purchasePrice: 650, decisionPrice: 380, currentPrice: 295, profitLoss: -355, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-10-20', reason: 'Held hoping for Super Bowl run to recover investment' },
  { id: 'td-3', cardName: '2022 Topps Chrome Julio Rodriguez Auto', sport: 'Baseball', action: 'sold', purchasePrice: 185, decisionPrice: 215, currentPrice: 240, profitLoss: 30, wasRational: false, lossAversionIndicator: false, decisionDate: '2025-12-08', reason: 'Sold small gain too quickly - fear of it becoming a loss' },
  { id: 'td-4', cardName: '2024 Prizm Caleb Williams RC PSA 10', sport: 'Football', action: 'bought-more', purchasePrice: 195, decisionPrice: 175, currentPrice: 175, profitLoss: -20, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-01-10', reason: 'Averaged down based on fundamental analysis' },
  { id: 'td-5', cardName: '2019 Prizm Zion Williamson RC PSA 10', sport: 'Basketball', action: 'held', purchasePrice: 2800, decisionPrice: 850, currentPrice: 750, profitLoss: -2050, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-09-05', reason: 'Cannot accept magnitude of loss - hoping for miracle recovery' },
  { id: 'td-6', cardName: '2020 Select Justin Herbert RC PSA 10', sport: 'Football', action: 'sold', purchasePrice: 280, decisionPrice: 340, currentPrice: 340, profitLoss: 60, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-02-15', reason: 'Took reasonable profit at target price' },
  { id: 'td-7', cardName: '2023 Topps Chrome Corbin Carroll RC Auto', sport: 'Baseball', action: 'sold', purchasePrice: 120, decisionPrice: 155, currentPrice: 175, profitLoss: 35, wasRational: false, lossAversionIndicator: false, decisionDate: '2025-11-22', reason: 'Sold winner prematurely to lock in gains' },
  { id: 'td-8', cardName: '2021 Topps Chrome Wander Franco RC Auto', sport: 'Baseball', action: 'held', purchasePrice: 520, decisionPrice: 95, currentPrice: 65, profitLoss: -455, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-08-10', reason: 'Refused to sell at 82% loss despite no recovery catalyst' },
  { id: 'td-9', cardName: '2018 Prizm Luka Doncic RC PSA 10', sport: 'Basketball', action: 'held', purchasePrice: 5200, decisionPrice: 4500, currentPrice: 4200, profitLoss: -1000, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-01-28', reason: 'Rational hold - elite player with long-term upside' },
  { id: 'td-10', cardName: '2024 Topps Series 1 Paul Skenes RC', sport: 'Baseball', action: 'sold', purchasePrice: 45, decisionPrice: 85, currentPrice: 95, profitLoss: 40, wasRational: false, lossAversionIndicator: false, decisionDate: '2026-03-05', reason: 'Took quick 89% gain - disposition effect at work' },
  { id: 'td-11', cardName: '2020 Prizm Tua Tagovailoa RC PSA 10', sport: 'Football', action: 'held', purchasePrice: 425, decisionPrice: 65, currentPrice: 48, profitLoss: -377, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-07-20', reason: 'Would rather hold to zero than realize the loss' },
  { id: 'td-12', cardName: '2023 Select CJ Stroud RC', sport: 'Football', action: 'sold', purchasePrice: 85, decisionPrice: 165, currentPrice: 190, profitLoss: 80, wasRational: false, lossAversionIndicator: false, decisionDate: '2025-12-18', reason: 'Sold winner during hot streak - regret followed' },
  { id: 'td-13', cardName: '2021 Prizm Mac Jones RC PSA 10', sport: 'Football', action: 'held', purchasePrice: 290, decisionPrice: 42, currentPrice: 28, profitLoss: -262, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-10-05', reason: 'Embarrassment of recognizing bad purchase prevents selling' },
  { id: 'td-14', cardName: '2022 Bowman Chrome Druw Jones 1st', sport: 'Baseball', action: 'sold', purchasePrice: 95, decisionPrice: 55, currentPrice: 48, profitLoss: -40, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-02-28', reason: 'Cut losses rationally based on declining prospect status' },
  { id: 'td-15', cardName: '2020 Panini Prizm LaMelo Ball RC PSA 10', sport: 'Basketball', action: 'held', purchasePrice: 1200, decisionPrice: 520, currentPrice: 480, profitLoss: -720, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-11-01', reason: 'Anchored to purchase price - cannot accept 60% loss' },
  { id: 'td-16', cardName: '2024 Topps Chrome Elly De La Cruz Auto', sport: 'Baseball', action: 'sold', purchasePrice: 220, decisionPrice: 285, currentPrice: 310, profitLoss: 65, wasRational: false, lossAversionIndicator: false, decisionDate: '2026-03-20', reason: 'Cashed in gain early fearing pullback' },
  { id: 'td-17', cardName: '2023 Prizm Connor Bedard RC PSA 10', sport: 'Hockey', action: 'held', purchasePrice: 280, decisionPrice: 195, currentPrice: 185, profitLoss: -95, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-01-15', reason: 'Held rationally - young generational talent with upside' },
  { id: 'td-18', cardName: '2021 Bowman Chrome Marcelo Mayer 1st', sport: 'Baseball', action: 'held', purchasePrice: 195, decisionPrice: 145, currentPrice: 140, profitLoss: -55, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-02-10', reason: 'Approaching MLB debut - rational hold decision' },
  { id: 'td-19', cardName: '2022 Panini National Treasures Paolo Banchero', sport: 'Basketball', action: 'held', purchasePrice: 1800, decisionPrice: 680, currentPrice: 620, profitLoss: -1180, wasRational: false, lossAversionIndicator: true, decisionDate: '2025-12-01', reason: 'High purchase price creates psychological barrier to selling' },
  { id: 'td-20', cardName: '2024 Donruss Optic Jayden Daniels RC', sport: 'Football', action: 'bought-more', purchasePrice: 125, decisionPrice: 145, currentPrice: 155, profitLoss: 20, wasRational: true, lossAversionIndicator: false, decisionDate: '2026-03-28', reason: 'Added to winning position based on performance data' },
];

const aversionCoefficients: AversionCoefficient[] = [
  { category: 'Football Rookies', coefficient: 2.8, sampleTrades: 42, avgHoldWhenLosing: '14.2 months', avgHoldWhenWinning: '4.1 months', sellWinRate: 68, sellLossRate: 18 },
  { category: 'Basketball Stars', coefficient: 2.5, sampleTrades: 35, avgHoldWhenLosing: '12.8 months', avgHoldWhenWinning: '5.2 months', sellWinRate: 62, sellLossRate: 22 },
  { category: 'Baseball Prospects', coefficient: 2.1, sampleTrades: 28, avgHoldWhenLosing: '10.5 months', avgHoldWhenWinning: '6.8 months', sellWinRate: 55, sellLossRate: 28 },
  { category: 'Vintage Cards', coefficient: 1.6, sampleTrades: 15, avgHoldWhenLosing: '18.0 months', avgHoldWhenWinning: '12.5 months', sellWinRate: 42, sellLossRate: 35 },
  { category: 'Low-Pop Parallels', coefficient: 3.2, sampleTrades: 22, avgHoldWhenLosing: '16.5 months', avgHoldWhenWinning: '3.2 months', sellWinRate: 75, sellLossRate: 12 },
  { category: 'Hockey', coefficient: 1.8, sampleTrades: 12, avgHoldWhenLosing: '9.2 months', avgHoldWhenWinning: '7.5 months', sellWinRate: 48, sellLossRate: 32 },
];

const aversionPatterns: AversionPattern[] = [
  { month: 'Nov 2025', coefficient: 2.7, tradesAnalyzed: 12, lossHolds: 7, gainSells: 4, rationalDecisions: 3, costOfAversion: 1850 },
  { month: 'Dec 2025', coefficient: 2.6, tradesAnalyzed: 15, lossHolds: 8, gainSells: 5, rationalDecisions: 4, costOfAversion: 2100 },
  { month: 'Jan 2026', coefficient: 2.5, tradesAnalyzed: 11, lossHolds: 5, gainSells: 4, rationalDecisions: 4, costOfAversion: 1520 },
  { month: 'Feb 2026', coefficient: 2.4, tradesAnalyzed: 14, lossHolds: 6, gainSells: 5, rationalDecisions: 5, costOfAversion: 1380 },
  { month: 'Mar 2026', coefficient: 2.3, tradesAnalyzed: 13, lossHolds: 5, gainSells: 4, rationalDecisions: 6, costOfAversion: 1200 },
  { month: 'Apr 2026', coefficient: 2.4, tradesAnalyzed: 10, lossHolds: 4, gainSells: 3, rationalDecisions: 5, costOfAversion: 980 },
];

export function getLossAversionProfile(): LossAversionProfile {
  return profile;
}

export function getTradeDecisions(): TradeDecision[] {
  return tradeDecisions;
}

export function getAversionCoefficients(): AversionCoefficient[] {
  return aversionCoefficients;
}

export function getAversionPatterns(): AversionPattern[] {
  return aversionPatterns;
}

export function getLossAversionStats() {
  const totalTrades = tradeDecisions.length;
  const lossAversionTrades = tradeDecisions.filter(t => t.lossAversionIndicator).length;
  const rationalTrades = tradeDecisions.filter(t => t.wasRational).length;
  const totalCost = aversionPatterns.reduce((s, p) => s + p.costOfAversion, 0);
  return {
    coefficient: profile.overallCoefficient,
    lossAversionRate: Math.round((lossAversionTrades / totalTrades) * 100),
    rationalRate: Math.round((rationalTrades / totalTrades) * 100),
    totalCostOfAversion: totalCost,
  };
}
