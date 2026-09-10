/**
 * Deal Finder lite — flag watchlist / target / scan candidates below consensus
 * or fee-aware break-even. Uses existing pricing + break-even paths only.
 */
import type { CardInventory, TargetWatchlist } from '../../types';
import { calculateBreakEven } from './breakEvenService';
import { preferredValuationForCard, preferredValueForCard, isThinCompSet } from '../pricing/compConsensus';

export const GREAT_DEAL_DISCOUNT_PCT = 15;
export const DEAL_FINDER_LITE_DISCLOSURE =
  `Great-deal filter: ask is at least ${GREAT_DEAL_DISCOUNT_PCT}% below the local consensus mark, or below the fee-aware eBay break-even on a matching holding. Watchlist / target / scan candidates only — no new marketplace scrape and not live Sports Card Investor Deals.`;

export type DealLiteKind = 'watchlist' | 'target' | 'holding-scan';

export interface DealLiteCandidate {
  id: string;
  kind: DealLiteKind;
  player: string;
  detail: string;
  askPrice: number;
  consensusMark: number | null;
  breakEvenPrice: number | null;
  discountPct: number | null;
  belowConsensus: boolean;
  belowBreakEven: boolean;
  greatDeal: boolean;
  thinTape: boolean;
  rationale: string;
}

export interface DealFinderLiteReport {
  candidates: DealLiteCandidate[];
  greatDeals: DealLiteCandidate[];
  emptyReason: string | null;
  thresholdPct: number;
  disclosure: string;
}

function usablePrice(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
}

function discountPct(consensus: number | null, ask: number): number | null {
  if (consensus == null || consensus <= 0) return null;
  return Math.round(((consensus - ask) / consensus) * 1000) / 10;
}

function playerKey(value: string): string {
  return value.trim().toLowerCase();
}

function matchHolding(inventory: CardInventory[], target: TargetWatchlist): CardInventory | undefined {
  const key = playerKey(target.player);
  const hay = `${target.cardDescription} ${target.player}`.toLowerCase();
  const active = inventory.filter((card) => card.status !== 'sold' && playerKey(card.player) === key);
  if (active.length === 0) return undefined;
  const tighter = active.find((card) => hay.includes(String(card.year)) || hay.includes(card.set.toLowerCase()));
  return tighter ?? active[0];
}

export function scoreDealCandidate(input: {
  id: string;
  kind: DealLiteKind;
  player: string;
  detail: string;
  askPrice: number;
  consensusMark: number | null;
  breakEvenPrice: number | null;
  thinTape: boolean;
}): DealLiteCandidate | null {
  const ask = usablePrice(input.askPrice);
  if (ask == null) return null;
  const consensus = usablePrice(input.consensusMark);
  const breakEven = usablePrice(input.breakEvenPrice);
  const pct = discountPct(consensus, ask);
  const belowConsensus = pct != null && pct > 0;
  const belowBreakEven = breakEven != null && ask < breakEven;
  const greatDeal = (pct != null && pct >= GREAT_DEAL_DISCOUNT_PCT) || belowBreakEven;
  if (!belowConsensus && !belowBreakEven && !greatDeal) return null;

  const rationale = greatDeal
    ? pct != null && pct >= GREAT_DEAL_DISCOUNT_PCT
      ? `Ask is ${pct.toFixed(1)}% below local consensus (≥ ${GREAT_DEAL_DISCOUNT_PCT}% great-deal threshold).`
      : `Ask $${Math.round(ask).toLocaleString()} is below the fee-aware eBay break-even of $${Math.round(breakEven ?? 0).toLocaleString()}.`
    : belowConsensus
      ? `Ask is ${pct?.toFixed(1)}% below consensus — flagged, but short of the ${GREAT_DEAL_DISCOUNT_PCT}% great-deal cut.`
      : 'Ask is below fee-aware break-even on the matching holding.';

  return {
    id: input.id,
    kind: input.kind,
    player: input.player,
    detail: input.detail,
    askPrice: ask,
    consensusMark: consensus,
    breakEvenPrice: breakEven,
    discountPct: pct,
    belowConsensus,
    belowBreakEven,
    greatDeal,
    thinTape: input.thinTape || consensus == null,
    rationale: input.thinTape ? `${rationale} Thin or unmatched tape — not a live listing book.` : rationale,
  };
}

function scoreTarget(
  target: TargetWatchlist,
  inventory: CardInventory[],
): DealLiteCandidate | null {
  if (target.status !== 'active') return null;
  const ask = usablePrice(target.currentMarketPrice);
  if (ask == null) return null;
  const match = matchHolding(inventory, target);
  const consensus = match
    ? usablePrice(preferredValueForCard(match) || match.currentValue)
    : usablePrice(target.targetPrice);
  const breakEven = match ? calculateBreakEven(match, 'ebay').breakEvenPrice : null;
  const thin = match ? isThinCompSet(match.salesData) : true;
  return scoreDealCandidate({
    id: `target-${target.id}`,
    kind: match ? 'watchlist' : 'target',
    player: target.player,
    detail: target.cardDescription,
    askPrice: ask,
    consensusMark: consensus,
    breakEvenPrice: breakEven,
    thinTape: thin,
  });
}

function scoreHoldingScan(card: CardInventory): DealLiteCandidate | null {
  if (card.status === 'sold') return null;
  const preferred = preferredValuationForCard(card);
  const consensus = usablePrice(preferred.value);
  const ask = usablePrice(card.currentValue);
  if (consensus == null || ask == null) return null;
  if (preferred.method !== 'sold-comp-consensus' && preferred.method !== 'thin-comp-fallback') return null;
  const breakEven = calculateBreakEven(card, 'ebay').breakEvenPrice;
  return scoreDealCandidate({
    id: `scan-${card.id}`,
    kind: 'holding-scan',
    player: card.player,
    detail: `${card.year} ${card.set}`,
    askPrice: ask,
    consensusMark: consensus,
    breakEvenPrice: breakEven,
    thinTape: preferred.thinMarket || isThinCompSet(card.salesData),
  });
}

export function findDealCandidates(
  inventory: CardInventory[],
  targets: TargetWatchlist[] = [],
  options?: { greatDealsOnly?: boolean; limit?: number },
): DealFinderLiteReport {
  const limit = options?.limit ?? 8;
  const fromTargets = targets
    .map((target) => scoreTarget(target, inventory))
    .filter((row): row is DealLiteCandidate => row != null);
  const fromHoldings = inventory
    .map((card) => scoreHoldingScan(card))
    .filter((row): row is DealLiteCandidate => row != null);

  const merged = [...fromTargets, ...fromHoldings].sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  const greatDeals = merged.filter((row) => row.greatDeal);
  const candidates = (options?.greatDealsOnly ? greatDeals : merged).slice(0, limit);

  let emptyReason: string | null = null;
  if (inventory.length === 0 && targets.length === 0) {
    emptyReason = 'Add holdings or watchlist targets to scan for asks below local consensus.';
  } else if (merged.length === 0) {
    emptyReason = 'No watchlist / target / scan asks currently sit below consensus or fee-aware break-even.';
  }

  return {
    candidates,
    greatDeals: greatDeals.slice(0, limit),
    emptyReason: candidates.length === 0 ? emptyReason : null,
    thresholdPct: GREAT_DEAL_DISCOUNT_PCT,
    disclosure: DEAL_FINDER_LITE_DISCLOSURE,
  };
}
