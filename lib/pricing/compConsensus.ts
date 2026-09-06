/**
 * Comp-regression / consensus selection — prefer sold/historical comps over AI-only
 * estimates when comps exist. Does not flip VITE_FF_REAL_* flags.
 *
 * Freshness window for sold comps is 90 days (comp tape), distinct from the
 * 7-day valuation-stamp stale chip used in collection UI.
 */
import type { CardInventory, MarketComp, PricingAnalysis, ValuationSource } from '../../types';

export const MIN_COMPS_FOR_CONSENSUS = 3;
export const FRESH_COMP_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
export const THIN_COMP_MAX = 2;

export type CompSelectionMethod =
  | 'sold-comp-consensus'
  | 'thin-comp-fallback'
  | 'ai-estimate'
  | 'stored'
  | 'unavailable';

export interface SoldCompLike {
  price: number;
  soldAt: string;
}

export interface CompConsensus {
  median: number;
  trimmedMean: number;
  low: number;
  high: number;
  count: number;
  freshCount: number;
  oldestSoldAt: string | null;
  newestSoldAt: string | null;
  thin: boolean;
  stale: boolean;
  asOf: string;
}

export interface PreferredValuation {
  value: number;
  source: ValuationSource;
  confidence: number;
  thinMarket: boolean;
  stale: boolean;
  label: string;
  method: CompSelectionMethod;
  rationale: string;
  compCount: number;
  freshCompCount: number;
}

function parseSoldAt(soldAt: string | undefined): number | null {
  if (!soldAt) return null;
  const trimmed = soldAt.trim();
  if (!trimmed) return null;
  const withTime = trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00`;
  const ts = Date.parse(withTime);
  return Number.isNaN(ts) ? null : ts;
}

function usablePrice(price: number | undefined): number | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return price;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function trimmedMean(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length < 5) {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const inner = sorted.slice(1, -1);
  return inner.reduce((sum, v) => sum + v, 0) / inner.length;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function isFreshSoldComp(soldAt: string | undefined, nowMs: number = Date.now()): boolean {
  const ts = parseSoldAt(soldAt);
  if (ts === null) return false;
  return nowMs - ts < FRESH_COMP_WINDOW_MS && nowMs - ts >= 0;
}

export function isThinCompSet(sales: SoldCompLike[] | undefined): boolean {
  const usable = (sales ?? []).filter((s) => usablePrice(s.price) !== null);
  return usable.length > 0 && usable.length <= THIN_COMP_MAX;
}

export function computeSoldCompConsensus(
  sales: SoldCompLike[] | undefined,
  nowMs: number = Date.now(),
): CompConsensus | null {
  const rows = (sales ?? [])
    .map((sale) => {
      const price = usablePrice(sale.price);
      const ts = parseSoldAt(sale.soldAt);
      if (price === null) return null;
      return { price, ts, soldAt: sale.soldAt };
    })
    .filter((row): row is { price: number; ts: number | null; soldAt: string } => row !== null);

  if (rows.length === 0) return null;

  const prices = rows.map((r) => r.price);
  const dated = rows.filter((r) => r.ts !== null) as { price: number; ts: number; soldAt: string }[];
  const fresh = dated.filter((r) => nowMs - r.ts < FRESH_COMP_WINDOW_MS && nowMs - r.ts >= 0);
  const oldest = dated.length ? dated.reduce((a, b) => (a.ts < b.ts ? a : b)) : null;
  const newest = dated.length ? dated.reduce((a, b) => (a.ts > b.ts ? a : b)) : null;

  return {
    median: roundCents(median(prices)),
    trimmedMean: roundCents(trimmedMean(prices)),
    low: roundCents(Math.min(...prices)),
    high: roundCents(Math.max(...prices)),
    count: rows.length,
    freshCount: fresh.length,
    oldestSoldAt: oldest?.soldAt ?? null,
    newestSoldAt: newest?.soldAt ?? null,
    thin: rows.length <= THIN_COMP_MAX,
    stale: fresh.length === 0,
    asOf: newest ? new Date(newest.ts).toISOString() : new Date(nowMs).toISOString(),
  };
}

function labelFor(method: CompSelectionMethod, thin: boolean, stale: boolean): string {
  if (method === 'sold-comp-consensus') {
    if (stale) return 'Stale sold comps';
    return 'Sold-comp consensus';
  }
  if (method === 'thin-comp-fallback') {
    return thin ? 'Thin sold comps' : 'Thin / stale comps';
  }
  if (method === 'ai-estimate') return 'AI estimate';
  if (method === 'stored') return 'Stored mark';
  return 'No mark';
}

export function selectPreferredValuation(input: {
  salesData?: SoldCompLike[] | MarketComp[];
  aiEstimate?: number;
  storedValue?: number;
  storedSource?: ValuationSource;
  storedTimestamp?: string;
  nowMs?: number;
}): PreferredValuation {
  const nowMs = input.nowMs ?? Date.now();
  const consensus = computeSoldCompConsensus(input.salesData, nowMs);
  const ai = usablePrice(input.aiEstimate);
  const stored = usablePrice(input.storedValue);

  if (consensus && consensus.count >= MIN_COMPS_FOR_CONSENSUS && consensus.freshCount >= 1) {
    const source: ValuationSource =
      input.storedSource === 'ebay-api' ? 'ebay-api' : 'historical-comps';
    return {
      value: consensus.median,
      source,
      confidence: Math.min(0.92, 0.68 + consensus.freshCount * 0.04),
      thinMarket: false,
      stale: false,
      label: labelFor('sold-comp-consensus', false, false),
      method: 'sold-comp-consensus',
      rationale: `Median of ${consensus.count} sold comps (${consensus.freshCount} within 90d). Range $${consensus.low}–$${consensus.high}.`,
      compCount: consensus.count,
      freshCompCount: consensus.freshCount,
    };
  }

  if (consensus && consensus.count >= 1) {
    const source: ValuationSource = 'historical-comps';
    const thin = consensus.thin || consensus.stale;
    return {
      value: consensus.median,
      source,
      confidence: consensus.thin ? 0.42 : 0.55,
      thinMarket: thin,
      stale: consensus.stale,
      label: labelFor('thin-comp-fallback', consensus.thin, consensus.stale),
      method: 'thin-comp-fallback',
      rationale: consensus.thin
        ? `Only ${consensus.count} sold comp${consensus.count === 1 ? '' : 's'} — thin tape. Demo-honest fallback, not a deep book.`
        : `Sold comps exist but none cleared in the last 90 days. Using stale tape median $${consensus.median}.`,
      compCount: consensus.count,
      freshCompCount: consensus.freshCount,
    };
  }

  if (ai !== null) {
    return {
      value: roundCents(ai),
      source: 'gemini',
      confidence: 0.45,
      thinMarket: true,
      stale: false,
      label: labelFor('ai-estimate', true, false),
      method: 'ai-estimate',
      rationale: 'No sold comps on file. Showing the AI estimate with a demo/sample label — not a verified clearing price.',
      compCount: 0,
      freshCompCount: 0,
    };
  }

  if (stored !== null) {
    const source = input.storedSource ?? 'fallback';
    return {
      value: roundCents(stored),
      source,
      confidence: source === 'ebay-api' || source === 'historical-comps' ? 0.7 : 0.4,
      thinMarket: source === 'gemini' || source === 'fallback',
      stale: false,
      label: labelFor('stored', false, false),
      method: 'stored',
      rationale: 'Using the last stored mark. No sold-comp tape to reconcile against.',
      compCount: 0,
      freshCompCount: 0,
    };
  }

  return {
    value: 0,
    source: 'fallback',
    confidence: 0,
    thinMarket: true,
    stale: true,
    label: labelFor('unavailable', true, true),
    method: 'unavailable',
    rationale: 'No sold comps, AI estimate, or stored mark.',
    compCount: 0,
    freshCompCount: 0,
  };
}

export function preferredValuationForCard(
  card: Pick<
    CardInventory,
    'currentValue' | 'valuationSource' | 'valuationTimestamp' | 'lastValuationDate' | 'salesData'
  >,
  nowMs: number = Date.now(),
): PreferredValuation {
  return selectPreferredValuation({
    salesData: card.salesData,
    storedValue: card.currentValue,
    storedSource: card.valuationSource,
    storedTimestamp: card.valuationTimestamp || card.lastValuationDate,
    nowMs,
  });
}

export function preferredValueForCard(
  card: Pick<CardInventory, 'currentValue' | 'valuationSource' | 'valuationTimestamp' | 'lastValuationDate' | 'salesData'>,
  nowMs: number = Date.now(),
): number {
  return preferredValuationForCard(card, nowMs).value;
}

/** When Gemini analysis carries sold comps, prefer the consensus mark over the AI point. */
export function resolveAnalysisValue(analysis: PricingAnalysis, nowMs: number = Date.now()): {
  value: number;
  source: ValuationSource;
  confidence: number;
  rationale?: string;
} {
  const preferred = selectPreferredValuation({
    salesData: analysis.salesData,
    aiEstimate: analysis.estimatedValue,
    storedSource: analysis.valuationSource,
    storedTimestamp: analysis.valuationTimestamp || analysis.lastUpdated,
    nowMs,
  });
  if (preferred.method === 'sold-comp-consensus' || preferred.method === 'thin-comp-fallback') {
    return {
      value: preferred.value,
      source: preferred.source,
      confidence: preferred.confidence,
      rationale: preferred.rationale,
    };
  }
  const source: ValuationSource =
    analysis.valuationSource ||
    ((analysis.salesData?.length || 0) >= MIN_COMPS_FOR_CONSENSUS ? 'historical-comps' : analysis.valuationSource || 'gemini');
  return {
    value: analysis.estimatedValue,
    source,
    confidence: analysis.confidence,
    rationale: analysis.rationale,
  };
}
