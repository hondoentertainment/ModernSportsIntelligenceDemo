/**
 * Server-side consensus ledger (mirrors lib/pricing/consensusMarketLedger.ts).
 * Kept under api/lib so Vercel serverless bundling stays self-contained.
 */

export type ValuationSource = 'ebay-api' | 'historical-comps' | 'gemini' | 'fallback';

export interface LedgerCardInput {
  id: string;
  player: string;
  currentValue?: number;
  valuationSource?: ValuationSource;
  valuationTimestamp?: string;
  lastValuationDate?: string;
  valuationConfidence?: number;
}

export interface ConsensusQuote {
  cardId: string;
  player: string;
  fmv: number;
  source: ValuationSource;
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

const SOURCE_RANK: Record<ValuationSource, number> = {
  'ebay-api': 4,
  'historical-comps': 3,
  gemini: 2,
  fallback: 1,
};
const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const COVERAGE_TARGET = 95;
const VERIFIABLE = new Set<ValuationSource>(['ebay-api', 'historical-comps']);

function toMs(iso?: string | null): number | null {
  if (!iso) return null;
  const ts = Date.parse(iso);
  return Number.isNaN(ts) ? null : ts;
}

function labelFor(source: ValuationSource, fresh: boolean): string {
  if (source === 'ebay-api') return fresh ? 'Live eBay comps' : 'Stale eBay comps';
  if (source === 'historical-comps') return fresh ? 'Historical comps' : 'Stale historical comps';
  if (source === 'gemini') return 'AI estimate';
  return 'Fallback estimate';
}

export function buildConsensusLedger(
  inventory: LedgerCardInput[],
  nowMs: number = Date.now(),
): ConsensusLedgerSummary {
  const quotes: ConsensusQuote[] = [];
  let freshVerifiable = 0;
  let priced = 0;

  for (const card of inventory) {
    const fmv = Number(card.currentValue) || 0;
    if (fmv <= 0) continue;
    priced += 1;
    const source = (card.valuationSource ?? 'fallback') as ValuationSource;
    const ts = card.valuationTimestamp || card.lastValuationDate || null;
    const ms = toMs(ts);
    const fresh = ms !== null && nowMs - ms < STALE_AFTER_MS;
    const verifiable = VERIFIABLE.has(source);
    if (verifiable && fresh) freshVerifiable += 1;
    quotes.push({
      cardId: card.id,
      player: card.player,
      fmv,
      source,
      confidence: Math.max(0, Math.min(1, card.valuationConfidence ?? (verifiable ? 0.75 : 0.45))),
      valuationTimestamp: ts,
      fresh,
      verifiable,
      label: labelFor(source, fresh),
    });
  }

  quotes.sort((a, b) => {
    const d = (SOURCE_RANK[b.source] ?? 0) - (SOURCE_RANK[a.source] ?? 0);
    if (d !== 0) return d;
    if (a.fresh !== b.fresh) return a.fresh ? -1 : 1;
    return b.fmv - a.fmv;
  });

  const sourceMix: Record<string, number> = {};
  for (const q of quotes) sourceMix[q.source] = (sourceMix[q.source] ?? 0) + 1;
  const verifiableCount = quotes.filter((q) => q.verifiable).length;
  const freshVerifiablePct = priced === 0 ? 0 : Math.round((freshVerifiable / priced) * 1000) / 10;
  const verifiablePct =
    quotes.length === 0 ? 0 : Math.round((verifiableCount / quotes.length) * 1000) / 10;

  return {
    asOf: new Date(nowMs).toISOString(),
    cardCount: inventory.length,
    quotedCount: quotes.length,
    totalFmv: quotes.reduce((s, q) => s + q.fmv, 0),
    verifiablePct,
    freshVerifiablePct,
    coverageTargetPct: COVERAGE_TARGET,
    meetsCoverageTarget: freshVerifiablePct >= COVERAGE_TARGET,
    sourceMix,
    quotes,
  };
}
