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

/** ISO / date-only stamp for chip tooltips, or null if missing / unparseable. */
export function formatValuationTimestamp(isoOrYmd: string | undefined, nowMs: number = Date.now()): string | null {
  if (!isoOrYmd) return null;
  const t = parseValuationInstant(isoOrYmd);
  if (t === null) return null;
  const ageMs = nowMs - t;
  if (ageMs < MS_PER_DAY) {
    const hours = Math.max(0, Math.floor(ageMs / 3_600_000));
    return hours < 1 ? 'priced <1h ago' : `priced ${hours}h ago`;
  }
  const ymd = new Date(t).toISOString().slice(0, 10);
  return `priced ${ymd}`;
}

/**
 * Formats stored confidence. Values &gt; 1 are treated as already-percent (Gemini path);
 * 0–1 values are treated as fractions (ledger / analysis path).
 */
export function formatValuationConfidence(confidence: number | undefined): string | null {
  if (confidence == null || Number.isNaN(confidence)) return null;
  const pct = confidence > 1 ? confidence : confidence * 100;
  if (pct < 0 || pct > 100) return null;
  return `${Math.round(pct)}% conf`;
}

export function buildValuationProvenanceTitle(input: {
  timestamp?: string;
  lastValuationDate?: string;
  confidence?: number;
  rationale?: string;
  nowMs?: number;
}): string | undefined {
  const when = formatValuationTimestamp(input.timestamp || input.lastValuationDate, input.nowMs);
  const conf = formatValuationConfidence(input.confidence);
  const parts = [when, conf].filter(Boolean) as string[];
  if (input.rationale?.trim()) {
    parts.push(input.rationale.trim().slice(0, 160));
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}
