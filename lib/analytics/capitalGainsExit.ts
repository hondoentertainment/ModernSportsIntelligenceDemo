/**
 * Phase 27 Fiscal Shield leftover — advisory “sell this year vs next” ST/LT compare.
 * Wraps FiscalService.simulateExit. Not IRS Form 8949 / Schedule D completeness.
 */
import type { CardInventory } from '../../types';
import { FiscalService, type ExitSimulationResult } from '../utils/FiscalService';

export const CAPITAL_GAINS_EXIT_DISCLOSURE =
  'Advisory ST/LT simulation using existing fiscal helpers. Sell-this-year vs next-year is a holding-period heuristic — not tax advice or IRS regulatory completeness.';

export interface YearVsNextHolding {
  cardId: string;
  player: string;
  targetPrice: number;
  thisYear: ExitSimulationResult;
  nextYear: ExitSimulationResult;
  netDelta: number;
  taxDelta: number;
  recommendation: 'sell_this_year' | 'wait_until_next' | 'neutral';
  reason: string;
}

export interface YearVsNextSummary {
  asOf: string;
  thisYearLabel: string;
  nextYearLabel: string;
  holdings: YearVsNextHolding[];
  thisYearNet: number;
  nextYearNet: number;
  thisYearTax: number;
  nextYearTax: number;
  disclosure: string;
}

function activeHoldings(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((item) => item.status !== 'sold' && (item.currentValue || item.purchasePrice || 0) > 0);
}

function targetPriceFor(item: CardInventory): number {
  return item.currentValue || item.purchasePrice || 0;
}

function classify(thisYear: ExitSimulationResult, nextYear: ExitSimulationResult): YearVsNextHolding['recommendation'] {
  const delta = nextYear.netProfit - thisYear.netProfit;
  if (delta > 25) return 'wait_until_next';
  if (delta < -25) return 'sell_this_year';
  return 'neutral';
}

/**
 * Compare selling each holding now (current ST/LT treatment) versus on Jan 2 of next year.
 * Next-year path uses the same mark and FiscalService fee/tax math at that as-of date.
 */
export function simulateCapitalGainsYearVsNext(
  inventory: CardInventory[],
  asOf: Date = new Date(),
): YearVsNextSummary {
  const thisYearLabel = String(asOf.getFullYear());
  const nextYearLabel = String(asOf.getFullYear() + 1);
  const nextYearAsOf = new Date(asOf.getFullYear() + 1, 0, 2);

  const holdings = activeHoldings(inventory).map((item) => {
    const targetPrice = targetPriceFor(item);
    const thisYear = FiscalService.simulateExit(item, targetPrice, undefined, asOf);
    const nextYear = FiscalService.simulateExit(item, targetPrice, undefined, nextYearAsOf);
    const recommendation = classify(thisYear, nextYear);
    const netDelta = nextYear.netProfit - thisYear.netProfit;
    const taxDelta = nextYear.estimatedTax - thisYear.estimatedTax;
    let reason = 'Net after fees and estimated tax is similar in both years.';
    if (recommendation === 'wait_until_next') {
      reason = thisYear.taxTreatment === 'Short Term' && nextYear.taxTreatment === 'Long Term'
        ? `Waiting until ${nextYearLabel} may flip this lot to long-term treatment (est. +$${Math.round(netDelta).toLocaleString()} net).`
        : `Next-year net is higher by about $${Math.round(netDelta).toLocaleString()} after the same fee heuristic.`;
    } else if (recommendation === 'sell_this_year') {
      reason = `Selling in ${thisYearLabel} keeps more after estimated tax/fees (about $${Math.round(Math.abs(netDelta)).toLocaleString()}).`;
    }
    return {
      cardId: item.id,
      player: item.player,
      targetPrice,
      thisYear,
      nextYear,
      netDelta,
      taxDelta,
      recommendation,
      reason,
    };
  }).sort((a, b) => Math.abs(b.netDelta) - Math.abs(a.netDelta));

  return {
    asOf: asOf.toISOString(),
    thisYearLabel,
    nextYearLabel,
    holdings,
    thisYearNet: holdings.reduce((sum, row) => sum + row.thisYear.netProfit, 0),
    nextYearNet: holdings.reduce((sum, row) => sum + row.nextYear.netProfit, 0),
    thisYearTax: holdings.reduce((sum, row) => sum + row.thisYear.estimatedTax, 0),
    nextYearTax: holdings.reduce((sum, row) => sum + row.nextYear.estimatedTax, 0),
    disclosure: CAPITAL_GAINS_EXIT_DISCLOSURE,
  };
}

export function simulateCapitalGainsYearVsNextForCard(
  card: CardInventory,
  asOf: Date = new Date(),
): YearVsNextHolding | null {
  return simulateCapitalGainsYearVsNext([card], asOf).holdings[0] ?? null;
}
