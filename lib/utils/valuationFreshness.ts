/**
 * Collection UI hints for valuation age and liquidity bands.
 * Stale threshold is UI-only; liquidity threshold matches LiquidityService / marketDepth heuristics (score &lt; 40).
 */

export const VALUATION_STALE_AFTER_DAYS = 7;

/** Same cutoff as LiquidityService.generateExitRecommendation and detectIlliquidityOpportunities. */
export const LOW_LIQUIDITY_SCORE_THRESHOLD = 40;

const MS_PER_DAY = 86_400_000;

function parseValuationInstant(isoOrYmd: string): number | null {
  const trimmed = isoOrYmd.trim();
  if (!trimmed) return null;
  const withTime = trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00`;
  const t = Date.parse(withTime);
  return Number.isNaN(t) ? null : t;
}

/** Whole calendar days since lastValuationDate (floor). */
export function valuationAgeDays(lastValuationDate: string, nowMs: number = Date.now()): number | null {
  const t = parseValuationInstant(lastValuationDate);
  if (t === null) return null;
  return Math.floor((nowMs - t) / MS_PER_DAY);
}

export function isValuationStale(lastValuationDate: string | undefined, nowMs: number = Date.now()): boolean {
  if (!lastValuationDate) return false;
  const days = valuationAgeDays(lastValuationDate, nowMs);
  return days !== null && days >= VALUATION_STALE_AFTER_DAYS;
}

/** Short label for a stale chip, or null if fresh / missing / unparseable. */
export function getStaleValuationLabel(lastValuationDate: string | undefined, nowMs: number = Date.now()): string | null {
  if (!lastValuationDate || !isValuationStale(lastValuationDate, nowMs)) return null;
  const days = valuationAgeDays(lastValuationDate, nowMs)!;
  return `${days}d`;
}

export function isThinLiquidityScore(liquidityScore: number | undefined): boolean {
  return liquidityScore !== undefined && liquidityScore < LOW_LIQUIDITY_SCORE_THRESHOLD;
}
