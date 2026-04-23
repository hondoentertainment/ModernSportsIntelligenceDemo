// @ts-nocheck
import { CardInventory } from '../../types';

/** Marketplace fee schedules (percentage of sale price) */
export const MARKETPLACE_FEES: Record<string, { label: string; rate: number; fixed: number }> = {
  ebay: { label: 'eBay', rate: 0.1312, fixed: 0.30 },          // 13.12% + $0.30
  comc: { label: 'COMC', rate: 0.05, fixed: 1.00 },             // 5% + $1 per card
  myslabs: { label: 'MySlabs', rate: 0.09, fixed: 0 },          // 9% flat
  private: { label: 'Private Sale', rate: 0, fixed: 0 },        // No fees
  pwcc: { label: 'PWCC Vault', rate: 0.095, fixed: 0 },         // 9.5%
};

export interface BreakEvenResult {
  costBasis: number;
  breakEvenPrice: number;                // Minimum sale price to break even after fees
  currentProfit: number;                 // Profit at current market value
  currentROI: number;                    // ROI % at current value
  netProceeds: number;                   // Proceeds after selling at current value
  feeAmount: number;                     // Fee amount at current value sale
  scenarios: BreakEvenScenario[];
}

export interface BreakEvenScenario {
  label: string;
  salePrice: number;
  fees: number;
  netProceeds: number;
  profit: number;
  roi: number;
}

/**
 * Calculate the break-even sale price and profit scenarios for a card.
 * Accounts for purchase price, grading fees, shipping, and marketplace seller fees.
 */
export function calculateBreakEven(
  card: CardInventory,
  marketplace: string = 'ebay',
  additionalCosts: number = 0
): BreakEvenResult {
  const fee = MARKETPLACE_FEES[marketplace] || MARKETPLACE_FEES.ebay;

  // Total cost basis
  const costBasis =
    card.purchasePrice +
    (card.gradingFees || 0) +
    (card.shippingFees || 0) +
    additionalCosts;

  // Break-even: salePrice - (salePrice * rate + fixed) = costBasis
  // salePrice * (1 - rate) = costBasis + fixed
  // salePrice = (costBasis + fixed) / (1 - rate)
  const breakEvenPrice = fee.rate < 1
    ? (costBasis + fee.fixed) / (1 - fee.rate)
    : costBasis; // Avoid division by zero for hypothetical 100% fee

  // Current market analysis
  const currentValue = card.currentValue || 0;
  const feeAtCurrent = currentValue * fee.rate + fee.fixed;
  const netProceeds = currentValue - feeAtCurrent;
  const currentProfit = netProceeds - costBasis;
  const currentROI = costBasis > 0 ? (currentProfit / costBasis) * 100 : 0;

  // Generate scenarios at different price points
  const scenarios = generateScenarios(costBasis, currentValue, fee.rate, fee.fixed);

  return {
    costBasis,
    breakEvenPrice: Math.ceil(breakEvenPrice * 100) / 100,
    currentProfit,
    currentROI,
    netProceeds,
    feeAmount: feeAtCurrent,
    scenarios
  };
}

function generateScenarios(
  costBasis: number,
  currentValue: number,
  feeRate: number,
  feeFixed: number
): BreakEvenScenario[] {
  const basePrice = currentValue || costBasis;
  const multipliers = [
    { label: '-20%', mult: 0.8 },
    { label: 'Current', mult: 1.0 },
    { label: '+20%', mult: 1.2 },
    { label: '+50%', mult: 1.5 },
    { label: '2x', mult: 2.0 },
  ];

  return multipliers.map(({ label, mult }) => {
    const salePrice = Math.round(basePrice * mult);
    const fees = salePrice * feeRate + feeFixed;
    const net = salePrice - fees;
    const profit = net - costBasis;
    const roi = costBasis > 0 ? (profit / costBasis) * 100 : 0;

    return {
      label: label === 'Current' ? `Current ($${salePrice.toLocaleString()})` : label,
      salePrice,
      fees: Math.round(fees * 100) / 100,
      netProceeds: Math.round(net * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      roi: Math.round(roi * 10) / 10
    };
  });
}
