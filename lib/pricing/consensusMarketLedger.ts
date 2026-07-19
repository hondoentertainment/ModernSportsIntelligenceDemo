/**
 * Consensus market ledger — single FMV quote with ranked provenance.
 * Prefer live eBay comps, then historical comps, then Gemini, then fallback.
 * Never silent: every quote carries source + freshness + confidence.
 *
 * @see lib/utils/valuationProvenance.ts
 */
import type { CardInventory, ValuationSource } from '../../types';
import {
  computeFreshVerifiableCoverage,
  FRESH_VERIFIABLE_COVERAGE_TARGET_PCT,
  isVerifiableValuationSource,
} from '../utils/valuationProvenance';

const SOURCE_RANK: Record<ValuationSource, number> = {
  'ebay-api': 4,
  'historical-comps': 3,
  gemini: 2,
  fallback: 1,
};

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export type LedgerSourceKind = ValuationSource | 'mixed';

export interface ConsensusQuote {
  cardId: string;
  player: string;
  fmv: number;
  source: LedgerSourceKind;
  confidence: number;
  valuationTimestamp: string | null;
  fresh: boolean;
  verifiable: boolean;
  label: string;
}

export interface ConsensusLedgerSummary {
  asOf: string;
  cardCount: number;
  quotedCount: number;
  totalFmv: number;
  verifiablePct: number;
  freshVerifiablePct: number;
  coverageTargetPct: number;
  meetsCoverageTarget: boolean;
  sourceMix: Record<string, number>;
  quotes: ConsensusQuote[];
}

function toMs(iso?: string | null): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  return Number.isNaN(ts) ? null : ts;
}

function labelFor(source: LedgerSourceKind, fresh: boolean): string {
  if (source === 'ebay-api') return fresh ? 'Live eBay comps' : 'Stale eBay comps';
  if (source === 'historical-comps') return fresh ? 'Historical comps' : 'Stale historical comps';
  if (source === 'gemini') return 'AI estimate';
  if (source === 'mixed') return 'Mixed book';
  return 'Fallback estimate';
}

export function quoteCard(card: CardInventory, nowMs: number = Date.now()): ConsensusQuote | null {
  const fmv = Number(card.currentValue) || 0;
  if (fmv <= 0) return null;

  const source = (card.valuationSource ?? 'fallback') as ValuationSource;
  const ts = card.valuationTimestamp || card.lastValuationDate || null;
  const ms = toMs(ts);
  const fresh = ms !== null && nowMs - ms < STALE_AFTER_MS;
  const verifiable = isVerifiableValuationSource(source);

  return {
    cardId: card.id,
    player: card.player,
    fmv,
    source,
    confidence: Math.max(0, Math.min(1, card.valuationConfidence ?? (verifiable ? 0.75 : 0.45))),
    valuationTimestamp: ts,
    fresh,
    verifiable,
    label: labelFor(source, fresh),
  };
}

/** Rank quotes so the book surface shows highest-trust prices first. */
export function rankQuotes(quotes: ConsensusQuote[]): ConsensusQuote[] {
  return [...quotes].sort((a, b) => {
    const rankA = SOURCE_RANK[a.source === 'mixed' ? 'fallback' : a.source] ?? 0;
    const rankB = SOURCE_RANK[b.source === 'mixed' ? 'fallback' : b.source] ?? 0;
    if (rankB !== rankA) return rankB - rankA;
    if (a.fresh !== b.fresh) return a.fresh ? -1 : 1;
    return b.fmv - a.fmv;
  });
}

export function buildConsensusLedger(
  inventory: CardInventory[],
  nowMs: number = Date.now(),
): ConsensusLedgerSummary {
  const quotes = rankQuotes(
    inventory.map((c) => quoteCard(c, nowMs)).filter((q): q is ConsensusQuote => q !== null),
  );
  const coverage = computeFreshVerifiableCoverage(inventory, nowMs);
  const sourceMix: Record<string, number> = {};
  for (const q of quotes) {
    sourceMix[q.source] = (sourceMix[q.source] ?? 0) + 1;
  }
  const totalFmv = quotes.reduce((sum, q) => sum + q.fmv, 0);
  const verifiableCount = quotes.filter((q) => q.verifiable).length;
  const verifiablePct = quotes.length === 0 ? 0 : Math.round((verifiableCount / quotes.length) * 1000) / 10;

  return {
    asOf: new Date(nowMs).toISOString(),
    cardCount: inventory.length,
    quotedCount: quotes.length,
    totalFmv,
    verifiablePct,
    freshVerifiablePct: coverage.pct,
    coverageTargetPct: FRESH_VERIFIABLE_COVERAGE_TARGET_PCT,
    meetsCoverageTarget: coverage.pct >= FRESH_VERIFIABLE_COVERAGE_TARGET_PCT,
    sourceMix,
    quotes,
  };
}
