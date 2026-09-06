import type { CardInventory, PricingAnalysis, TargetWatchlist, ValuationSource } from '../../types';
import type { DataSourceVariant } from '../../components/DataSourceBadge';
import { resolveAnalysisValue, selectPreferredValuation } from '../pricing/compConsensus';

const SOURCE_PRIORITY: Record<ValuationSource, number> = {
  'ebay-api': 3,
  'historical-comps': 2,
  gemini: 1,
  fallback: 0,
};

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
export const FRESH_VERIFIABLE_COVERAGE_TARGET_PCT = 95;
const VERIFIABLE_SOURCES: ReadonlySet<ValuationSource> = new Set<ValuationSource>([
  'ebay-api',
  'historical-comps',
]);

function toMillis(iso?: string): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  return Number.isNaN(ts) ? null : ts;
}

function isStale(ts: number | null, nowMs: number): boolean {
  if (ts === null) return true;
  return nowMs - ts >= STALE_AFTER_MS;
}

function inferSourceFromAnalysis(analysis: PricingAnalysis, nowMs: number = Date.now()): ValuationSource {
  if (analysis.valuationSource === 'ebay-api') return 'ebay-api';
  const preferred = selectPreferredValuation({
    salesData: analysis.salesData,
    aiEstimate: analysis.estimatedValue,
    storedSource: analysis.valuationSource,
    storedTimestamp: analysis.valuationTimestamp || analysis.lastUpdated,
    nowMs,
  });
  if (preferred.method === 'sold-comp-consensus' || preferred.method === 'thin-comp-fallback') {
    return preferred.source;
  }
  if (analysis.valuationSource) return analysis.valuationSource;
  if ((analysis.salesData?.length || 0) >= 3) return 'historical-comps';
  return 'fallback';
}

function shouldApplyIncoming(
  existingSource: ValuationSource | undefined,
  existingTimestamp: string | undefined,
  incomingSource: ValuationSource,
  incomingTimestamp: string,
  nowMs: number = Date.now(),
): boolean {
  const incomingMs = toMillis(incomingTimestamp);
  if (incomingMs === null) return false;
  if (!existingSource) return true;

  const existingPriority = SOURCE_PRIORITY[existingSource];
  const incomingPriority = SOURCE_PRIORITY[incomingSource];
  const existingMs = toMillis(existingTimestamp);

  if (incomingPriority > existingPriority) return true;
  if (incomingPriority < existingPriority) {
    if (!isStale(existingMs, nowMs)) return false;
    return !isStale(incomingMs, nowMs);
  }
  if (existingMs === null) return true;
  return incomingMs >= existingMs;
}

export function applyPricingAnalysisToCard(
  card: CardInventory,
  analysis: PricingAnalysis,
  nowMs: number = Date.now(),
): CardInventory {
  const incomingSource = inferSourceFromAnalysis(analysis, nowMs);
  const incomingTimestamp = analysis.valuationTimestamp || analysis.lastUpdated || new Date(nowMs).toISOString();
  const existingTimestamp = card.valuationTimestamp || card.lastValuationDate;
  const resolved = resolveAnalysisValue(analysis, nowMs);

  if (!shouldApplyIncoming(card.valuationSource, existingTimestamp, incomingSource, incomingTimestamp, nowMs)) {
    return card;
  }

  return {
    ...card,
    currentValue: resolved.value,
    lastValuationDate: incomingTimestamp,
    valuationConfidence: resolved.confidence,
    pricingRationale: resolved.rationale || analysis.rationale || card.pricingRationale,
    searchUrl: analysis.searchUrl,
    salesData: analysis.salesData || card.salesData,
    valuationSource: resolved.source || incomingSource,
    valuationTimestamp: incomingTimestamp,
  };
}

export function applyPricingAnalysisToTarget(
  target: TargetWatchlist,
  analysis: PricingAnalysis,
  nowMs: number = Date.now(),
): TargetWatchlist {
  const incomingSource = inferSourceFromAnalysis(analysis, nowMs);
  const incomingTimestamp = analysis.valuationTimestamp || analysis.lastUpdated || new Date(nowMs).toISOString();
  const resolved = resolveAnalysisValue(analysis, nowMs);

  if (
    !shouldApplyIncoming(
      target.valuationSource,
      target.valuationTimestamp,
      incomingSource,
      incomingTimestamp,
      nowMs,
    )
  ) {
    return target;
  }

  return {
    ...target,
    currentMarketPrice: resolved.value,
    searchUrl: analysis.searchUrl,
    pricingRationale: resolved.rationale || analysis.rationale || target.pricingRationale,
    salesData: analysis.salesData || target.salesData,
    valuationSource: resolved.source || incomingSource,
    valuationTimestamp: incomingTimestamp,
  };
}

type ValuationCoverageEntity = Pick<CardInventory, 'valuationSource' | 'valuationTimestamp' | 'lastValuationDate' | 'salesData'>;

export function isVerifiableValuationSource(source: ValuationSource | undefined): boolean {
  return !!source && VERIFIABLE_SOURCES.has(source);
}

export function hasFreshVerifiableValuation(entity: ValuationCoverageEntity, nowMs: number = Date.now()): boolean {
  const inferredSource: ValuationSource =
    entity.valuationSource || ((entity.salesData?.length || 0) >= 3 ? 'historical-comps' : 'fallback');
  const ts = toMillis(entity.valuationTimestamp || entity.lastValuationDate);
  return isVerifiableValuationSource(inferredSource) && !isStale(ts, nowMs);
}

export function computeFreshVerifiableCoverage(
  entities: ValuationCoverageEntity[],
  nowMs: number = Date.now(),
): { total: number; covered: number; coveragePct: number } {
  const total = entities.length;
  if (total === 0) return { total, covered: 0, coveragePct: 0 };
  const covered = entities.reduce((count, entity) => count + (hasFreshVerifiableValuation(entity, nowMs) ? 1 : 0), 0);
  return {
    total,
    covered,
    coveragePct: Math.round((covered / total) * 100),
  };
}

type PrioritizableValuationEntity = {
  id: string;
  valuationSource?: ValuationSource;
  valuationTimestamp?: string;
  lastValuationDate?: string;
  salesData?: { soldAt: string }[];
};

/**
 * Sorts entities so stale/non-verifiable valuations are refreshed first.
 * Keeps determinism with id tiebreaking.
 */
export function sortByVerifiableRefreshPriority<T extends PrioritizableValuationEntity>(
  entities: T[],
  nowMs: number = Date.now(),
): T[] {
  return [...entities].sort((a, b) => {
    const aNeedsRefresh = hasFreshVerifiableValuation(a, nowMs) ? 0 : 1;
    const bNeedsRefresh = hasFreshVerifiableValuation(b, nowMs) ? 0 : 1;
    if (aNeedsRefresh !== bNeedsRefresh) return bNeedsRefresh - aNeedsRefresh;

    const aTs = toMillis(a.valuationTimestamp || a.lastValuationDate) ?? 0;
    const bTs = toMillis(b.valuationTimestamp || b.lastValuationDate) ?? 0;
    if (aTs !== bTs) return aTs - bTs;

    return a.id.localeCompare(b.id);
  });
}

export function getValuationSourceChipForSource(source: ValuationSource | undefined): { label: string; className: string } {
  switch (source) {
    case 'ebay-api':
      return {
        label: 'Live comps',
        className: 'text-brand-teal bg-brand-lime/5 border border-brand-teal/25',
      };
    case 'historical-comps':
      return {
        label: 'Historical comps',
        className: 'text-cyan-300 bg-cyan-500/10 border border-cyan-400/25',
      };
    case 'gemini':
      return {
        label: 'AI estimate',
        className: 'text-violet-300 bg-violet-500/10 border border-violet-400/25',
      };
    default:
      return {
        label: 'Estimate',
        className: 'text-brand-muted bg-brand-charcoal/50 border border-slate-700/50',
      };
  }
}

export function getValuationSourceChipForCard(card: Pick<CardInventory, 'valuationSource' | 'salesData' | 'currentValue' | 'valuationTimestamp' | 'lastValuationDate'>): {
  label: string;
  className: string;
} {
  const preferred = selectPreferredValuation({
    salesData: card.salesData,
    storedValue: card.currentValue,
    storedSource: card.valuationSource,
    storedTimestamp: card.valuationTimestamp || card.lastValuationDate,
  });
  if (preferred.method === 'sold-comp-consensus' || preferred.method === 'thin-comp-fallback') {
    return getValuationSourceChipForSource(preferred.source);
  }
  const source = card.valuationSource || ((card.salesData?.length || 0) >= 3 ? 'historical-comps' : 'fallback');
  return getValuationSourceChipForSource(source);
}

export function getValuationSourceChipForTarget(target: Pick<TargetWatchlist, 'valuationSource' | 'salesData'>): {
  label: string;
  className: string;
} {
  const source = target.valuationSource || ((target.salesData?.length || 0) >= 3 ? 'historical-comps' : 'fallback');
  return getValuationSourceChipForSource(source);
}

/**
 * Maps a `ValuationSource` plus freshness signal to a `DataSourceVariant`
 * understood by the shared `<DataSourceBadge />` component.
 *
 * - verifiable + fresh   -> 'live'
 * - verifiable + stale   -> 'stale'
 * - gemini               -> 'sample'   (AI estimate; not a verifiable source)
 * - fallback / unknown   -> 'mock'
 */
export function valuationSourceToBadgeVariant(
  source: ValuationSource | undefined,
  timestamp: string | undefined,
  nowMs: number = Date.now(),
): DataSourceVariant {
  const inferred: ValuationSource = source ?? 'fallback';
  if (inferred === 'ebay-api' || inferred === 'historical-comps') {
    const ts = timestamp ? Date.parse(timestamp) : NaN;
    if (Number.isNaN(ts)) return 'stale';
    return nowMs - ts >= STALE_AFTER_MS ? 'stale' : 'live';
  }
  if (inferred === 'gemini') return 'sample';
  return 'mock';
}

/**
 * Convenience wrapper for cards/targets that carry both `valuationSource`
 * and `valuationTimestamp`/`lastValuationDate`.
 */
export function valuationBadgeVariantForEntity(
  entity: {
    valuationSource?: ValuationSource;
    valuationTimestamp?: string;
    lastValuationDate?: string;
  },
  nowMs: number = Date.now(),
): DataSourceVariant {
  return valuationSourceToBadgeVariant(
    entity.valuationSource,
    entity.valuationTimestamp ?? entity.lastValuationDate,
    nowMs,
  );
}
