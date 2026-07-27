/**
 * Formats consensus market ledger context for the War Room committee prompt.
 */
import type { CardInventory } from '../../types';
import { buildConsensusLedger, rankQuotes } from '../pricing/consensusMarketLedger';
import { preferRealCompsWhenConfigured } from '../featureFlags';

const TOP_QUOTES = 8;

export function buildWarRoomLedgerContext(inventory: CardInventory[]): string {
  const ledger = buildConsensusLedger(inventory);
  const liveFlag = preferRealCompsWhenConfigured();
  const top = rankQuotes(ledger.quotes).slice(0, TOP_QUOTES);
  const quoteLines =
    top.length === 0
      ? '(no priced assets)'
      : top
          .map(
            (q) =>
              `- ${q.player}: $${q.fmv.toLocaleString()} | ${q.label} | conf=${q.confidence.toFixed(2)} | fresh=${q.fresh}`,
          )
          .join('\n');

  const mix = Object.entries(ledger.sourceMix)
    .map(([k, v]) => `${k}:${v}`)
    .join(', ');

  return [
    'CONSENSUS MARKET LEDGER (book of record — prefer verifiable sources over AI estimates):',
    `Live comps flag (USE_REAL_EBAY): ${liveFlag ? 'ON' : 'OFF'}`,
    `Book FMV: $${ledger.totalFmv.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    `Quoted assets: ${ledger.quotedCount}/${ledger.cardCount}`,
    `Fresh verifiable coverage: ${ledger.freshVerifiablePct}% (target ${ledger.coverageTargetPct}%)`,
    `Source mix: ${mix || 'n/a'}`,
    'Top quotes:',
    quoteLines,
  ].join('\n');
}
