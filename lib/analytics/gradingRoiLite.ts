/**
 * Priority 3.2 lite — raw vs PSA 9/10 estimate from disclosed multipliers
 * or sold comps when titles mention those grades. Live PSA stays owner-held.
 */
import type { CardInventory, MarketComp } from '../../types';
import { preferredValueForCard } from '../pricing/compConsensus';

export const GRADING_ROI_LITE_DISCLOSURE =
  'Simulated / market-comp estimate only. PSA 9/10 marks use sold-comp titles when present, otherwise disclosed multipliers. Live PSA tape stays owner-held — not a submission quote.';

export const PSA_ECONOMY_FEE = 25;
export const PSA9_MULTIPLIER = 1.6;
export const PSA10_MULTIPLIER = 3.5;

export type GradingRoiSource = 'comps' | 'simulated';
export type GradingRoiRecommendation = 'Submit' | 'Hold Raw';

export interface GradingRoiLite {
  cardId: string;
  player: string;
  rawValue: number;
  psa9Estimate: number;
  psa10Estimate: number;
  gradingFee: number;
  netAfterFee9: number;
  netAfterFee10: number;
  roi9: number;
  roi10: number;
  source: GradingRoiSource;
  recommendation: GradingRoiRecommendation;
  rationale: string;
  advisoryOnly: true;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function compPrice(comp: MarketComp): number {
  const total = typeof comp.totalPrice === 'number' ? comp.totalPrice : NaN;
  if (Number.isFinite(total) && total > 0) return total;
  return Number.isFinite(comp.price) && comp.price > 0 ? comp.price : 0;
}

export function extractGradeCompMedian(sales: MarketComp[] | undefined, grade: 9 | 10): number | null {
  if (!sales || sales.length === 0) return null;
  const prices = sales
    .filter((row) => {
      const title = row.title ?? '';
      if (grade === 10) return /psa\s*10\b/i.test(title);
      return /psa\s*9\b/i.test(title) && !/psa\s*10\b/i.test(title);
    })
    .map(compPrice)
    .filter((price) => price > 0);
  return median(prices);
}

function rawMark(card: CardInventory): number {
  return preferredValueForCard(card) || card.currentValue || card.purchasePrice || 0;
}

export function estimateGradingRoiLite(card: CardInventory, fee: number = PSA_ECONOMY_FEE): GradingRoiLite | null {
  if (card.status === 'sold') return null;
  if (card.isGraded) return null;
  const rawValue = rawMark(card);
  if (rawValue <= 0) return null;

  const psa9Comp = extractGradeCompMedian(card.salesData, 9);
  const psa10Comp = extractGradeCompMedian(card.salesData, 10);
  const usedComps = psa9Comp != null || psa10Comp != null;
  const psa9Estimate = psa9Comp ?? rawValue * PSA9_MULTIPLIER;
  const psa10Estimate = psa10Comp ?? rawValue * PSA10_MULTIPLIER;
  const cost = rawValue + fee;
  const netAfterFee9 = psa9Estimate - cost;
  const netAfterFee10 = psa10Estimate - cost;
  const roi9 = cost > 0 ? (netAfterFee9 / cost) * 100 : 0;
  const roi10 = cost > 0 ? (netAfterFee10 / cost) * 100 : 0;
  const recommendation: GradingRoiRecommendation = roi10 >= 20 ? 'Submit' : 'Hold Raw';
  const source: GradingRoiSource = usedComps ? 'comps' : 'simulated';
  const rationale = usedComps
    ? `Sold-comp titles mentioning PSA 9/10 underpin the estimate; missing grades fall back to ${PSA9_MULTIPLIER}x / ${PSA10_MULTIPLIER}x. Fee $${fee} (economy heuristic).`
    : `No PSA 9/10 sold comps on this card — using disclosed ${PSA9_MULTIPLIER}x / ${PSA10_MULTIPLIER}x multipliers plus a $${fee} economy fee. Not live PSA.`;

  return {
    cardId: card.id,
    player: card.player,
    rawValue,
    psa9Estimate,
    psa10Estimate,
    gradingFee: fee,
    netAfterFee9,
    netAfterFee10,
    roi9,
    roi10,
    source,
    recommendation,
    rationale,
    advisoryOnly: true,
  };
}

export function listGradingRoiLite(cards: CardInventory[], limit = 6): GradingRoiLite[] {
  return cards
    .map((card) => estimateGradingRoiLite(card))
    .filter((row): row is GradingRoiLite => row != null)
    .sort((a, b) => b.roi10 - a.roi10)
    .slice(0, limit);
}
