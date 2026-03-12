import { CardInventory } from '../types';
import { LiquidityService } from './liquidityService';
import { CorrelationService } from './CorrelationService';

export interface SimulationTrade {
  type: 'sell' | 'buy';
  card: CardInventory;
  price: number;             // Simulated sell or buy price
}

export interface SimulationResult {
  currentNAV: number;
  simulatedNAV: number;
  navDelta: number;
  navDeltaPercent: number;
  currentCostBasis: number;
  simulatedCostBasis: number;
  currentROI: number;
  simulatedROI: number;
  currentDiversification: number;
  simulatedDiversification: number;
  currentAvgLiquidity: number;
  simulatedAvgLiquidity: number;
  leagueExposure: { league: string; current: number; simulated: number }[];
  warnings: string[];
}

/**
 * Phase 26: What-If Portfolio Simulator.
 * Simulates the impact of buying/selling cards before executing trades.
 */
export function simulatePortfolio(
  inventory: CardInventory[],
  trades: SimulationTrade[]
): SimulationResult {
  const active = inventory.filter(c => c.status !== 'sold');

  // Current state
  const currentNAV = active.reduce((s, c) => s + (c.currentValue || 0), 0);
  const currentCost = active.reduce((s, c) => s + c.purchasePrice + (c.gradingFees || 0) + (c.shippingFees || 0), 0);
  const currentROI = currentCost > 0 ? ((currentNAV - currentCost) / currentCost) * 100 : 0;
  const currentDiversification = CorrelationService.calculateDiversificationScore(active);
  const currentAvgLiquidity = active.length > 0
    ? active.reduce((s, c) => s + LiquidityService.calculateLiquidityScore(c), 0) / active.length
    : 0;

  // Apply trades to create simulated inventory
  let simulated = [...active];
  const warnings: string[] = [];

  for (const trade of trades) {
    if (trade.type === 'sell') {
      const idx = simulated.findIndex(c => c.id === trade.card.id);
      if (idx >= 0) {
        simulated.splice(idx, 1);
      } else {
        warnings.push(`Card "${trade.card.player}" not found in portfolio for simulated sale.`);
      }
    } else {
      // Buy: add card with the simulated purchase price
      simulated.push({
        ...trade.card,
        id: `sim-${crypto.randomUUID()}`,
        purchasePrice: trade.price,
        currentValue: trade.price,
        status: 'active'
      });
    }
  }

  // Simulated state
  const simNAV = simulated.reduce((s, c) => s + (c.currentValue || 0), 0);
  const simCost = simulated.reduce((s, c) => s + c.purchasePrice + (c.gradingFees || 0) + (c.shippingFees || 0), 0);
  const simROI = simCost > 0 ? ((simNAV - simCost) / simCost) * 100 : 0;
  const simDiversification = CorrelationService.calculateDiversificationScore(simulated);
  const simAvgLiquidity = simulated.length > 0
    ? simulated.reduce((s, c) => s + LiquidityService.calculateLiquidityScore(c), 0) / simulated.length
    : 0;

  // League exposure comparison
  const leagues = new Set<string>();
  [...active, ...simulated].forEach(c => leagues.add(c.league));

  const leagueExposure = [...leagues].map(league => {
    const currentVal = active.filter(c => c.league === league).reduce((s, c) => s + (c.currentValue || 0), 0);
    const simVal = simulated.filter(c => c.league === league).reduce((s, c) => s + (c.currentValue || 0), 0);
    return {
      league,
      current: currentNAV > 0 ? (currentVal / currentNAV) * 100 : 0,
      simulated: simNAV > 0 ? (simVal / simNAV) * 100 : 0
    };
  }).sort((a, b) => b.current - a.current);

  // Generate warnings
  if (simulated.length === 0) {
    warnings.push('Simulated portfolio is empty.');
  }
  const maxExposure = leagueExposure.reduce((max, l) => Math.max(max, l.simulated), 0);
  if (maxExposure > 60) {
    warnings.push(`High concentration risk: ${leagueExposure.find(l => l.simulated === maxExposure)?.league} exceeds 60% of portfolio.`);
  }
  if (simDiversification < currentDiversification - 10) {
    warnings.push('Trade reduces portfolio diversification significantly.');
  }

  return {
    currentNAV,
    simulatedNAV: simNAV,
    navDelta: simNAV - currentNAV,
    navDeltaPercent: currentNAV > 0 ? ((simNAV - currentNAV) / currentNAV) * 100 : 0,
    currentCostBasis: currentCost,
    simulatedCostBasis: simCost,
    currentROI,
    simulatedROI: simROI,
    currentDiversification,
    simulatedDiversification: simDiversification,
    currentAvgLiquidity: Math.round(currentAvgLiquidity),
    simulatedAvgLiquidity: Math.round(simAvgLiquidity),
    leagueExposure,
    warnings
  };
}
