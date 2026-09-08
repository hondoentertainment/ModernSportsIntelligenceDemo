/**
 * Phase 33 leftover — advisory Auto-Pilot before/after NAV + rough ST/LT tax.
 * Uses existing FiscalService exit helpers. Not live marketplace execution.
 *
 * NAV treats a sell as holding → cash and a buy as cash → asset at cost, so
 * converting a marked position does not inflate or destroy portfolio value.
 */
import type { AutonomousAction, CardInventory } from '../../types';
import { computePortfolioStats, filterActiveHoldings } from '../portfolioUtils';
import { FiscalService } from '../utils/FiscalService';

export const AUTOPILOT_IMPACT_DISCLOSURE =
  'Advisory simulation only — estimated NAV delta and rough short-term / long-term tax using existing fiscal helpers. Not live marketplace execution or tax advice.';

export interface AutopilotImpactPreview {
  startingValue: number;
  projectedBuySpend: number;
  projectedSellValue: number;
  projectedDisposedAssetValue: number;
  projectedAcquiredAssetValue: number;
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

export interface MatchInventoryCardOptions {
  /** Prefer this lot when present (sell actions should carry inventoryCardId). */
  inventoryCardId?: string;
  /** When several year+player holdings exist, keep the unique currentValue match. */
  amount?: number;
}

function actionable(actions: AutonomousAction[]): AutonomousAction[] {
  return actions.filter((action) => action.policyDecision !== 'blocked');
}

function yearPlayerKey(card: CardInventory): string {
  return `${card.year} ${card.player}`.trim().toLowerCase();
}

function uniqueHolding(rows: CardInventory[]): CardInventory | undefined {
  return rows.length === 1 ? rows[0] : undefined;
}

function disambiguateHoldings(
  rows: CardInventory[],
  amount: number | undefined,
): CardInventory | undefined {
  const unique = uniqueHolding(rows);
  if (unique) return unique;
  if (amount == null || Number.isNaN(amount)) return undefined;
  return uniqueHolding(rows.filter((card) => (card.currentValue || 0) === amount));
}

export function matchInventoryCard(
  inventory: CardInventory[],
  assetName: string,
  options?: MatchInventoryCardOptions,
): CardInventory | undefined {
  const holdings = filterActiveHoldings(inventory);
  const cardId = options?.inventoryCardId?.trim();
  if (cardId) {
    const byId = holdings.find((card) => card.id === cardId);
    if (byId) return byId;
  }

  const needle = assetName.trim().toLowerCase();
  if (!needle) return undefined;

  const exact = holdings.filter((card) => yearPlayerKey(card) === needle);
  if (exact.length > 0) return disambiguateHoldings(exact, options?.amount);

  const loose = holdings.filter((card) => {
    const player = card.player.trim().toLowerCase();
    return player.length > 0 && needle.includes(player);
  });
  return disambiguateHoldings(loose, options?.amount);
}

export function simulateAutopilotImpact(
  inventory: CardInventory[],
  actions: AutonomousAction[],
): AutopilotImpactPreview {
  const startingValue = computePortfolioStats(inventory).nav;
  const live = actionable(actions);

  let projectedBuySpend = 0;
  let projectedSellValue = 0;
  let projectedDisposedAssetValue = 0;
  let projectedAcquiredAssetValue = 0;
  let shortTermTaxDelta = 0;
  let longTermTaxDelta = 0;
  let matchedSellCount = 0;
  let unmatchedSellCount = 0;
  const disposedIds = new Set<string>();

  for (const action of live) {
    if (action.type === 'BUY') {
      projectedBuySpend += action.amount;
      projectedAcquiredAssetValue += action.amount;
      continue;
    }
    if (action.type !== 'SELL') continue;

    projectedSellValue += action.amount;
    const card = matchInventoryCard(inventory, action.assetName, {
      inventoryCardId: action.inventoryCardId,
      amount: action.amount,
    });
    if (!card || disposedIds.has(card.id)) {
      unmatchedSellCount += 1;
      // Unknown or already-disposed lot: convert cash at the action amount (NAV-neutral).
      projectedDisposedAssetValue += action.amount;
      continue;
    }

    disposedIds.add(card.id);
    matchedSellCount += 1;
    projectedDisposedAssetValue += card.currentValue || 0;
    const exit = FiscalService.simulateExit(card, action.amount);
    if (exit.taxTreatment === 'Long Term') {
      longTermTaxDelta += exit.estimatedTax;
    } else {
      shortTermTaxDelta += exit.estimatedTax;
    }
  }

  const projectedNetCashDelta = projectedSellValue - projectedBuySpend;
  const projectedPostCycleValue =
    startingValue - projectedDisposedAssetValue + projectedAcquiredAssetValue + projectedNetCashDelta;

  return {
    startingValue,
    projectedBuySpend,
    projectedSellValue,
    projectedDisposedAssetValue,
    projectedAcquiredAssetValue,
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
