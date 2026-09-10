/**
 * Phase B pricing-truth classifiers — UI scaffold only.
 *
 * Preference order (when the real eBay flag is off, still prefer any sold-comp
 * / consensus ledger over unlabeled AI):
 *   1. eBay / sold-comp consensus
 *   2. Portfolio / historical / thin comps
 *   3. AI / stored estimate fallback
 *
 * Does not flip VITE_FF_REAL_* flags, invent confidence, or claim live
 * Market Movers / multi-marketplace parity.
 */
import type { CardInventory, TargetWatchlist, ValuationSource } from '../../types';
import { preferRealCompsWhenConfigured } from '../featureFlags';
import {
  FRESH_COMP_WINDOW_MS,
  MIN_COMPS_FOR_CONSENSUS,
  THIN_COMP_MAX,
  preferredValuationForCard,
  preferredValuationForTarget,
  type CompSelectionMethod,
  type PreferredValuation,
} from './compConsensus';
import {
  LOW_LIQUIDITY_SCORE_THRESHOLD,
  VALUATION_STALE_AFTER_DAYS,
  formatValuationConfidence,
  formatValuationTimestamp,
  isThinLiquidityScore,
  isValuationStale,
  valuationAgeDays,
} from '../utils/valuationFreshness';

export const PRICING_TRUTH_SOURCE_PRIORITY = [
  'ebay-sold-comps',
  'portfolio-historical-comps',
  'ai-estimate-fallback',
] as const;

export type PricingTruthSourceTier = (typeof PRICING_TRUTH_SOURCE_PRIORITY)[number] | 'unavailable';

export const PRICING_TRUTH_THRESHOLDS = {
  valuationStaleAfterDays: VALUATION_STALE_AFTER_DAYS,
  soldCompFreshWindowDays: FRESH_COMP_WINDOW_MS / (24 * 60 * 60 * 1000),
  thinTapeMaxComps: THIN_COMP_MAX,
  minCompsForConsensus: MIN_COMPS_FOR_CONSENSUS,
  lowLiquidityScoreBelow: LOW_LIQUIDITY_SCORE_THRESHOLD,
} as const;

export const CONFIDENCE_UNKNOWN_LABEL = 'conf unknown';

export const PRICING_TRUTH_SLA_NOTE =
  'Provenance SLA scaffold: source, freshness, disclosed confidence, and comps count. Full freshness SLA against live eBay tape still needs #77.';

export type StaleReason = 'valuation-stamp' | 'stale-comp-tape' | 'both';
export type LowLiquidityReason = 'thin-tape' | 'liquidity-score';

export interface PricingTruthFlags {
  stale: boolean;
  staleReason: StaleReason | null;
  staleDays: number | null;
  staleLabel: string | null;
  lowLiquidity: boolean;
  thinTape: boolean;
  lowLiquidityReasons: LowLiquidityReason[];
  lowLiquidityLabel: string | null;
}

export interface PricingTruthSourceChip {
  label: string;
  className: string;
}

export interface PricingTruthProvenance {
  value: number;
  source: ValuationSource;
  method: CompSelectionMethod;
  sourceTier: PricingTruthSourceTier;
  sourceChip: PricingTruthSourceChip;
  freshnessTimestamp: string | null;
  freshnessLabel: string | null;
  confidence: number | null;
  confidenceKnown: boolean;
  confidenceLabel: string;
  rationale: string;
  compCount: number;
  freshCompCount: number;
  flags: PricingTruthFlags;
  title: string;
}

const CHIP_SOLD = 'text-cyan-300 bg-cyan-500/10 border border-cyan-400/25';
const CHIP_LIVE = 'text-brand-teal bg-brand-lime/5 border border-brand-teal/25';
const CHIP_AI = 'text-violet-300 bg-violet-500/10 border border-violet-400/25';
const CHIP_MUTED = 'text-brand-muted bg-brand-charcoal/50 border border-slate-700/50';

export function classifySourceTier(preferred: PreferredValuation): PricingTruthSourceTier {
  if (preferred.method === 'unavailable') return 'unavailable';
  if (preferred.method === 'sold-comp-consensus' || preferred.source === 'ebay-api') {
    return 'ebay-sold-comps';
  }
  if (preferred.method === 'thin-comp-fallback' || preferred.source === 'historical-comps') {
    return 'portfolio-historical-comps';
  }
  return 'ai-estimate-fallback';
}

export function honestSourceChip(
  preferred: PreferredValuation,
  liveEbay: boolean = preferRealCompsWhenConfigured(),
): PricingTruthSourceChip {
  if (preferred.method === 'sold-comp-consensus') {
    if (preferred.source === 'ebay-api' && liveEbay) {
      return { label: 'Live comps', className: CHIP_LIVE };
    }
    return { label: 'Sold comps', className: CHIP_SOLD };
  }
  if (preferred.method === 'thin-comp-fallback') {
    return { label: 'Thin sold comps', className: CHIP_SOLD };
  }
  if (preferred.source === 'ebay-api') {
    return liveEbay
      ? { label: 'Live comps', className: CHIP_LIVE }
      : { label: 'Sold comps', className: CHIP_SOLD };
  }
  if (preferred.source === 'historical-comps') {
    return { label: 'Historical comps', className: CHIP_SOLD };
  }
  if (preferred.method === 'ai-estimate' || preferred.source === 'gemini') {
    return { label: 'AI estimate', className: CHIP_AI };
  }
  if (preferred.method === 'stored') {
    return { label: 'Stored mark', className: CHIP_MUTED };
  }
  return { label: 'Estimate', className: CHIP_MUTED };
}

export function classifyStaleData(input: {
  preferred: PreferredValuation;
  timestamp?: string;
  lastValuationDate?: string;
  nowMs?: number;
}): Pick<PricingTruthFlags, 'stale' | 'staleReason' | 'staleDays' | 'staleLabel'> {
  const nowMs = input.nowMs ?? Date.now();
  const stamp = input.timestamp || input.lastValuationDate;
  const stampStale = isValuationStale(stamp, nowMs);
  const tapeStale =
    input.preferred.stale &&
    (input.preferred.method === 'sold-comp-consensus' ||
      input.preferred.method === 'thin-comp-fallback' ||
      input.preferred.method === 'unavailable');
  const stale = stampStale || tapeStale;
  const staleDays = stamp ? valuationAgeDays(stamp, nowMs) : null;
  let staleReason: StaleReason | null = null;
  if (stampStale && tapeStale) staleReason = 'both';
  else if (stampStale) staleReason = 'valuation-stamp';
  else if (tapeStale) staleReason = 'stale-comp-tape';

  let staleLabel: string | null = null;
  if (stale) {
    if (staleDays != null && staleDays >= VALUATION_STALE_AFTER_DAYS) {
      staleLabel = `Stale · ${staleDays}d`;
    } else {
      staleLabel = 'Stale';
    }
  }

  return { stale, staleReason, staleDays, staleLabel };
}

export function classifyLowLiquidity(input: {
  preferred: PreferredValuation;
  liquidityScore?: number;
}): Pick<PricingTruthFlags, 'lowLiquidity' | 'thinTape' | 'lowLiquidityReasons' | 'lowLiquidityLabel'> {
  const thinTape =
    input.preferred.thinMarket ||
    input.preferred.method === 'thin-comp-fallback' ||
    (input.preferred.compCount > 0 && input.preferred.compCount <= THIN_COMP_MAX);
  const scoreLow = isThinLiquidityScore(input.liquidityScore);
  const lowLiquidityReasons: LowLiquidityReason[] = [];
  if (thinTape) lowLiquidityReasons.push('thin-tape');
  if (scoreLow) lowLiquidityReasons.push('liquidity-score');
  const lowLiquidity = lowLiquidityReasons.length > 0;
  let lowLiquidityLabel: string | null = null;
  if (thinTape) lowLiquidityLabel = 'Thin tape';
  else if (scoreLow) lowLiquidityLabel = 'Low liquidity';

  return { lowLiquidity, thinTape, lowLiquidityReasons, lowLiquidityLabel };
}

/**
 * Surface confidence only when a disclosed formula or stored model score exists.
 * Hardcoded AI / stored fallbacks in selectPreferredValuation stay internal.
 */
export function resolveDisclosedConfidence(
  preferred: PreferredValuation,
  storedConfidence?: number,
): { value: number | null; known: boolean; label: string } {
  if (preferred.method === 'sold-comp-consensus') {
    const label = formatValuationConfidence(preferred.confidence);
    return {
      value: preferred.confidence,
      known: label != null,
      label: label ?? CONFIDENCE_UNKNOWN_LABEL,
    };
  }
  if (storedConfidence != null && Number.isFinite(storedConfidence) && storedConfidence > 0) {
    const label = formatValuationConfidence(storedConfidence);
    return {
      value: storedConfidence,
      known: label != null,
      label: label ?? CONFIDENCE_UNKNOWN_LABEL,
    };
  }
  return { value: null, known: false, label: CONFIDENCE_UNKNOWN_LABEL };
}

export function assemblePricingTruth(
  preferred: PreferredValuation,
  extras: {
    timestamp?: string;
    lastValuationDate?: string;
    liquidityScore?: number;
    storedConfidence?: number;
    storedRationale?: string;
    nowMs?: number;
  } = {},
): PricingTruthProvenance {
  const nowMs = extras.nowMs ?? Date.now();
  const freshnessTimestamp = extras.timestamp || extras.lastValuationDate || null;
  const freshnessLabel = formatValuationTimestamp(freshnessTimestamp ?? undefined, nowMs);
  const flags: PricingTruthFlags = {
    ...classifyStaleData({
      preferred,
      timestamp: extras.timestamp,
      lastValuationDate: extras.lastValuationDate,
      nowMs,
    }),
    ...classifyLowLiquidity({ preferred, liquidityScore: extras.liquidityScore }),
  };
  const confidence = resolveDisclosedConfidence(preferred, extras.storedConfidence);
  const sourceChip = honestSourceChip(preferred);
  const rationale = (preferred.rationale || extras.storedRationale || '').trim();
  const titleParts = [
    sourceChip.label,
    freshnessLabel,
    confidence.label,
    preferred.compCount > 0 ? `${preferred.compCount} comps` : null,
    rationale ? rationale.slice(0, 160) : null,
  ].filter(Boolean) as string[];

  return {
    value: preferred.value,
    source: preferred.source,
    method: preferred.method,
    sourceTier: classifySourceTier(preferred),
    sourceChip,
    freshnessTimestamp,
    freshnessLabel,
    confidence: confidence.value,
    confidenceKnown: confidence.known,
    confidenceLabel: confidence.label,
    rationale,
    compCount: preferred.compCount,
    freshCompCount: preferred.freshCompCount,
    flags,
    title: titleParts.join(' · '),
  };
}

export function buildPricingTruthForCard(
  card: Pick<
    CardInventory,
    | 'currentValue'
    | 'valuationSource'
    | 'valuationTimestamp'
    | 'lastValuationDate'
    | 'salesData'
    | 'liquidityScore'
    | 'valuationConfidence'
    | 'pricingRationale'
  >,
  nowMs: number = Date.now(),
): PricingTruthProvenance {
  return assemblePricingTruth(preferredValuationForCard(card, nowMs), {
    timestamp: card.valuationTimestamp,
    lastValuationDate: card.lastValuationDate,
    liquidityScore: card.liquidityScore,
    storedConfidence: card.valuationConfidence,
    storedRationale: card.pricingRationale,
    nowMs,
  });
}

export function buildPricingTruthForTarget(
  target: Pick<
    TargetWatchlist,
    'currentMarketPrice' | 'valuationSource' | 'valuationTimestamp' | 'salesData' | 'pricingRationale'
  >,
  nowMs: number = Date.now(),
): PricingTruthProvenance {
  return assemblePricingTruth(preferredValuationForTarget(target, nowMs), {
    timestamp: target.valuationTimestamp,
    storedRationale: target.pricingRationale,
    nowMs,
  });
}

export function chipsFromPricingTruth(truth: PricingTruthProvenance): {
  sourceChip: PricingTruthSourceChip;
  staleLabel: string | null;
  thinMarket: boolean;
  lowLiquidityLabel: string | null;
  compsCount: number;
  title: string;
} {
  return {
    sourceChip: truth.sourceChip,
    staleLabel: truth.flags.staleLabel,
    thinMarket: truth.flags.lowLiquidity,
    lowLiquidityLabel: truth.flags.lowLiquidityLabel,
    compsCount: truth.compCount,
    title: truth.title,
  };
}
