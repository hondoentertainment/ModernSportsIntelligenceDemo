// Sunk Cost Liberation Engine Service
// Identify holdings kept due to sunk cost fallacy

export interface SunkCostCard {
  id: string;
  cardName: string;
  sport: string;
  purchasePrice: number;
  currentValue: number;
  loss: number;
  lossPercent: number;
  holdDuration: string;
  rationalScore: number;
  emotionalScore: number;
  recommendation: 'sell' | 'hold' | 'monitor';
  reasonForHolding: string;
  liberationUrgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface LiberationOpportunity {
  id: string;
  cardName: string;
  currentValue: number;
  projectedValue6m: number;
  opportunityCost: number;
  alternativeInvestment: string;
  alternativeReturn: number;
  netBenefit: number;
}

export interface SunkCostPattern {
  pattern: string;
  frequency: number;
  avgLoss: number;
  description: string;
  mitigation: string;
}

export interface SunkCostSummary {
  totalTrapped: number;
  totalCurrentValue: number;
  totalLoss: number;
  avgHoldDuration: string;
  liberationPotential: number;
  month: string;
}

const sunkCostCards: SunkCostCard[] = [
  { id: 'sc-1', cardName: '2020 Prizm Tua Tagovailoa RC PSA 10', sport: 'Football', purchasePrice: 425, currentValue: 48, loss: 377, lossPercent: 88.7, holdDuration: '5.2 years', rationalScore: 12, emotionalScore: 75, recommendation: 'sell', reasonForHolding: 'Paid too much to sell now', liberationUrgency: 'critical' },
  { id: 'sc-2', cardName: '2021 Prizm Trevor Lawrence RC PSA 10', sport: 'Football', purchasePrice: 380, currentValue: 125, loss: 255, lossPercent: 67.1, holdDuration: '4.8 years', rationalScore: 28, emotionalScore: 68, recommendation: 'sell', reasonForHolding: 'Hoping for a comeback season', liberationUrgency: 'high' },
  { id: 'sc-3', cardName: '2019 Prizm Zion Williamson RC PSA 10', sport: 'Basketball', purchasePrice: 2800, currentValue: 750, loss: 2050, lossPercent: 73.2, holdDuration: '6.1 years', rationalScore: 22, emotionalScore: 82, recommendation: 'sell', reasonForHolding: 'He was the number 1 pick - value must return', liberationUrgency: 'critical' },
  { id: 'sc-4', cardName: '2021 Topps Chrome Wander Franco RC Auto', sport: 'Baseball', purchasePrice: 520, currentValue: 65, loss: 455, lossPercent: 87.5, holdDuration: '4.5 years', rationalScore: 8, emotionalScore: 55, recommendation: 'sell', reasonForHolding: 'Already lost so much, might as well hold', liberationUrgency: 'critical' },
  { id: 'sc-5', cardName: '2020 Mosaic Joe Burrow RC PSA 10', sport: 'Football', purchasePrice: 650, currentValue: 295, loss: 355, lossPercent: 54.6, holdDuration: '5.8 years', rationalScore: 45, emotionalScore: 60, recommendation: 'monitor', reasonForHolding: 'Super Bowl window still open', liberationUrgency: 'medium' },
  { id: 'sc-6', cardName: '2021 Bowman Chrome Jasson Dominguez 1st', sport: 'Baseball', purchasePrice: 340, currentValue: 120, loss: 220, lossPercent: 64.7, holdDuration: '4.3 years', rationalScore: 35, emotionalScore: 72, recommendation: 'monitor', reasonForHolding: 'Young prospect with upside remaining', liberationUrgency: 'medium' },
  { id: 'sc-7', cardName: '2020 Panini Prizm LaMelo Ball RC PSA 10', sport: 'Basketball', purchasePrice: 1200, currentValue: 480, loss: 720, lossPercent: 60.0, holdDuration: '5.5 years', rationalScore: 38, emotionalScore: 65, recommendation: 'monitor', reasonForHolding: 'All-Star potential justifies waiting', liberationUrgency: 'medium' },
  { id: 'sc-8', cardName: '2021 Panini Prizm Mac Jones RC PSA 10', sport: 'Football', purchasePrice: 290, currentValue: 28, loss: 262, lossPercent: 90.3, holdDuration: '4.6 years', rationalScore: 5, emotionalScore: 42, recommendation: 'sell', reasonForHolding: 'Embarrassed to realize the loss', liberationUrgency: 'critical' },
  { id: 'sc-9', cardName: '2020 Select Justin Herbert RC PSA 10', sport: 'Football', purchasePrice: 850, currentValue: 340, loss: 510, lossPercent: 60.0, holdDuration: '5.4 years', rationalScore: 42, emotionalScore: 58, recommendation: 'hold', reasonForHolding: 'Elite QB with upside', liberationUrgency: 'low' },
  { id: 'sc-10', cardName: '2022 Topps Chrome Bobby Witt Jr. RC Auto', sport: 'Baseball', purchasePrice: 280, currentValue: 185, loss: 95, lossPercent: 33.9, holdDuration: '3.8 years', rationalScore: 55, emotionalScore: 48, recommendation: 'hold', reasonForHolding: 'Still developing, positive trajectory', liberationUrgency: 'low' },
  { id: 'sc-11', cardName: '2021 Prizm Cade Cunningham RC PSA 10', sport: 'Basketball', purchasePrice: 450, currentValue: 85, loss: 365, lossPercent: 81.1, holdDuration: '4.4 years', rationalScore: 15, emotionalScore: 70, recommendation: 'sell', reasonForHolding: 'Number 1 pick narrative still compelling', liberationUrgency: 'high' },
  { id: 'sc-12', cardName: '2021 Bowman Chrome Marcelo Mayer 1st', sport: 'Baseball', purchasePrice: 195, currentValue: 140, loss: 55, lossPercent: 28.2, holdDuration: '4.2 years', rationalScore: 52, emotionalScore: 45, recommendation: 'hold', reasonForHolding: 'Approaching MLB debut', liberationUrgency: 'low' },
  { id: 'sc-13', cardName: '2020 Prizm Anthony Edwards RC PSA 10', sport: 'Basketball', purchasePrice: 580, currentValue: 385, loss: 195, lossPercent: 33.6, holdDuration: '5.3 years', rationalScore: 62, emotionalScore: 40, recommendation: 'hold', reasonForHolding: 'Legitimate star trajectory', liberationUrgency: 'low' },
  { id: 'sc-14', cardName: '2022 Panini National Treasures Paolo Banchero', sport: 'Basketball', purchasePrice: 1800, currentValue: 620, loss: 1180, lossPercent: 65.6, holdDuration: '3.5 years', rationalScore: 30, emotionalScore: 75, recommendation: 'sell', reasonForHolding: 'Paid a fortune - cannot accept the loss', liberationUrgency: 'high' },
];

const liberationOpportunities: LiberationOpportunity[] = [
  { id: 'lo-1', cardName: '2020 Prizm Tua Tagovailoa RC PSA 10', currentValue: 48, projectedValue6m: 35, opportunityCost: 48, alternativeInvestment: '2024 Topps Chrome Skenes RC PSA 10', alternativeReturn: 35, netBenefit: 64 },
  { id: 'lo-2', cardName: '2021 Prizm Mac Jones RC PSA 10', currentValue: 28, projectedValue6m: 18, opportunityCost: 28, alternativeInvestment: '2024 Bowman Chrome Top Prospect Lot', alternativeReturn: 40, netBenefit: 39 },
  { id: 'lo-3', cardName: '2021 Topps Chrome Wander Franco RC Auto', currentValue: 65, projectedValue6m: 40, opportunityCost: 65, alternativeInvestment: '2024 Select Caleb Williams RC', alternativeReturn: 28, netBenefit: 83 },
  { id: 'lo-4', cardName: '2019 Prizm Zion Williamson RC PSA 10', currentValue: 750, projectedValue6m: 580, opportunityCost: 750, alternativeInvestment: '2024 Prizm Wembanyama RC PSA 10', alternativeReturn: 22, netBenefit: 915 },
  { id: 'lo-5', cardName: '2021 Prizm Cade Cunningham RC PSA 10', currentValue: 85, projectedValue6m: 55, opportunityCost: 85, alternativeInvestment: '2024 Topps Heritage Pack Lot', alternativeReturn: 32, netBenefit: 112 },
];

const sunkCostPatterns: SunkCostPattern[] = [
  { pattern: 'Anchored to Purchase Price', frequency: 45, avgLoss: 520, description: 'Refusing to sell because the current price is below what was paid', mitigation: 'Focus on future value projection, not historical cost' },
  { pattern: 'Emotional Attachment', frequency: 32, avgLoss: 380, description: 'Personal connection to player or set creates irrational holding', mitigation: 'Separate collecting for fun from investment portfolio' },
  { pattern: 'Doubling Down', frequency: 18, avgLoss: 890, description: 'Buying more of a declining card to lower average cost', mitigation: 'Treat each purchase as an independent decision' },
  { pattern: 'Social Proof Dependency', frequency: 28, avgLoss: 445, description: 'Holding because community members are also holding', mitigation: 'Evaluate independently using data, not group sentiment' },
  { pattern: 'Prospect Hope Cycle', frequency: 38, avgLoss: 310, description: 'Holding underperforming prospect cards waiting for breakout', mitigation: 'Set time-based exit rules before purchasing' },
];

const sunkCostSummary: SunkCostSummary[] = [
  { totalTrapped: 8200, totalCurrentValue: 3100, totalLoss: 5100, avgHoldDuration: '4.8 years', liberationPotential: 2400, month: 'Nov 2025' },
  { totalTrapped: 7800, totalCurrentValue: 2900, totalLoss: 4900, avgHoldDuration: '4.9 years', liberationPotential: 2200, month: 'Dec 2025' },
  { totalTrapped: 7500, totalCurrentValue: 2800, totalLoss: 4700, avgHoldDuration: '5.0 years', liberationPotential: 2100, month: 'Jan 2026' },
  { totalTrapped: 7200, totalCurrentValue: 2700, totalLoss: 4500, avgHoldDuration: '5.1 years', liberationPotential: 1900, month: 'Feb 2026' },
  { totalTrapped: 6900, totalCurrentValue: 2600, totalLoss: 4300, avgHoldDuration: '5.0 years', liberationPotential: 1800, month: 'Mar 2026' },
  { totalTrapped: 6600, totalCurrentValue: 2500, totalLoss: 4100, avgHoldDuration: '4.9 years', liberationPotential: 1700, month: 'Apr 2026' },
];

export function getSunkCostCards(): SunkCostCard[] {
  return sunkCostCards;
}

export function getLiberationOpportunities(): LiberationOpportunity[] {
  return liberationOpportunities;
}

export function getSunkCostPatterns(): SunkCostPattern[] {
  return sunkCostPatterns;
}

export function getSunkCostSummaryData(): SunkCostSummary[] {
  return sunkCostSummary;
}

export function getSunkCostStats() {
  const totalCards = sunkCostCards.length;
  const criticalCards = sunkCostCards.filter(c => c.liberationUrgency === 'critical').length;
  const totalLoss = sunkCostCards.reduce((s, c) => s + c.loss, 0);
  const avgRational = Math.round(sunkCostCards.reduce((s, c) => s + c.rationalScore, 0) / totalCards);
  return { totalFlagged: totalCards, criticalCards, totalLoss, avgRationalScore: avgRational };
}
