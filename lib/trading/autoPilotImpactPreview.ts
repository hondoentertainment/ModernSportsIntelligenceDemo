/**
 * Phase 33 leftover — advisory Auto-Pilot before/after NAV + rough ST/LT tax.
 * Uses existing FiscalService exit helpers. Not live marketplace execution.
 */
import type { AutonomousAction, CardInventory } from '../../types';
import { FiscalService } from '../utils/FiscalService';

export const AUTOPILOT_IMPACT_DISCLOSURE =
  'Advisory simulation only — estimated NAV delta and rough short-term / long-term tax using existing fiscal helpers. Not live marketplace execution or tax advice.';

export interface AutopilotImpactPreview {
  startingValue: number;
  projectedBuySpend: number;
  projectedSellValue: number;
  projectedNetCashDelta: number;
  projectedPostCycleValue: number;
  navDelta: number;
  shortTermTaxDelta: number;
  longTermTaxDelta: number;
  estimatedTotalTax: number;
  matchedSellCount: number;
  unmatchedSellCount: number;
  disclosure: string;
}

function actionable(actions: AutonomousAction[]): AutonomousAction[] {
  return actions.filter((action) => action.policyDecision !== 'blocked');
}

export function matchInventoryCard(
  inventory: CardInventory[],
  assetName: string,
): CardInventory | undefined {
  const needle = assetName.trim().toLowerCase();
  if (!needle) return undefined;
  const exactYearPlayer = inventory.find(
    (card) => `${card.year} ${card.player}`.trim().toLowerCase() === needle,
  );
  if (exactYearPlayer) return exactYearPlayer;
  return inventory.find((card) => {
    const player = card.player.trim().toLowerCase();
    return player.length > 0 && needle.includes(player);
  });
}

export function simulateAutopilotImpact(
  inventory: CardInventory[],
  actions: AutonomousAction[],
): AutopilotImpactPreview {
  const startingValue = inventory.reduce((sum, card) => sum + (card.currentValue || 0), 0);
  const live = actionable(actions);
  const buySpend = live.filter((action) => action.type === 'BUY').reduce((sum, action) => sum + action.amount, 0);
  const sellValue = live.filter((action) => action.type === 'SELL').reduce((sum, action) => sum + action.amount, 0);
  const projectedNetCashDelta = sellValue - buySpend;
  const projectedPostCycleValue = startingValue + projectedNetCashDelta;

  let shortTermTaxDelta = 0;
  let longTermTaxDelta = 0;
  let matchedSellCount = 0;
  let unmatchedSellCount = 0;

  for (const action of live.filter((row) => row.type === 'SELL')) {
    const card = matchInventoryCard(inventory, action.assetName);
    if (!card) {
      unmatchedSellCount += 1;
      continue;
    }
    matchedSellCount += 1;
    const exit = FiscalService.simulateExit(card, action.amount);
    if (exit.taxTreatment === 'Long Term') {
      longTermTaxDelta += exit.estimatedTax;
    } else {
      shortTermTaxDelta += exit.estimatedTax;
    }
  }

  return {
    startingValue,
    projectedBuySpend: buySpend,
    projectedSellValue: sellValue,
    projectedNetCashDelta,
    projectedPostCycleValue,
    navDelta: projectedPostCycleValue - startingValue,
    shortTermTaxDelta,
    longTermTaxDelta,
    estimatedTotalTax: shortTermTaxDelta + longTermTaxDelta,
    matchedSellCount,
    unmatchedSellCount,
    disclosure: AUTOPILOT_IMPACT_DISCLOSURE,
  };
}
