/**
 * Per-show shopping list from the collector's watchlist and the local book.
 * Target buy prices use preferred valuation (sold comps, then stored marks).
 * Duplicate extras match the portfolio desk: same player, year, manufacturer,
 * set, and card number. This module does not read or flip VITE_FF_REAL_* flags.
 */
import type { CardInventory, Sport, TargetWatchlist } from '../../types';
import {
  preferredValuationForCard,
  preferredValuationForTarget,
} from '../pricing/compConsensus';
import { gapHunts } from '../collector/floorPack';
import type { ResolvedLocalCardShow } from './localCardShowCatalog';
import { TAPE_LABEL_DEMO, TAPE_LABEL_LIVE, isCollectionGap } from './showBuyingDesk';

export const SHOW_SHOPPING_LIST_DISCLOSURE =
  'Watchlist, started-set holes, and duplicate extras. Set holes use a short demo checklist, not a Beckett registry. Not a dealer inventory and not live Market Movers or Sports Card Investor parity.';

export type ShopLineKind = 'collection-gap' | 'watchlist' | 'set-hole' | 'duplicate-sell' | 'duplicate-trade';
export type ShopSide = 'buy' | 'sell';

export interface ShopLine {
  id: string;
  showId: string;
  kind: ShopLineKind;
  side: ShopSide;
  player: string;
  detail: string;
  sport: Sport;
  targetBuyUsd: number | null;
  marketMarkUsd: number | null;
  collectorCeilingUsd: number | null;
  priceSource: string;
  tapeLabel: string;
  why: string;
  cardId: string | null;
  targetId: string | null;
  copies: number | null;
  extraCopies: number | null;
}

export interface ShowShoppingList {
  showId: string;
  buys: ShopLine[];
  sells: ShopLine[];
  tapeLabel: string;
  disclosure: string;
  emptyReason: string | null;
}

const PRIORITY_RANK: Record<TargetWatchlist['priority'], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

function positiveMoney(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return roundUsd(value);
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function tapeLabel(liveTape: boolean): string {
  return liveTape ? TAPE_LABEL_LIVE : TAPE_LABEL_DEMO;
}

function tapeNote(liveTape: boolean): string {
  return liveTape ? 'Live comps flag is on.' : 'Local / demo tape.';
}

function showCovers(show: ResolvedLocalCardShow, sport: Sport | null | undefined): boolean {
  if (!sport) return false;
  return show.sports.includes(sport);
}

function cardDetail(card: CardInventory): string {
  const number = card.cardNumber?.trim() ? `#${card.cardNumber.trim()}` : 'no number';
  return `${card.year} ${card.manufacturer} ${card.set} ${number}`.replace(/\s+/g, ' ').trim();
}

function identityKey(card: CardInventory): string {
  return [norm(card.player), String(card.year), norm(card.manufacturer), norm(card.set), norm(card.cardNumber)].join('|');
}

interface PricedCopy {
  card: CardInventory;
  mark: number;
  source: string;
}

function priceCopy(card: CardInventory, nowMs: number): PricedCopy {
  const valuation = preferredValuationForCard(card, nowMs);
  return {
    card,
    mark: positiveMoney(valuation.value) ?? 0,
    source: valuation.label,
  };
}

function buyPrice(target: TargetWatchlist, nowMs: number): {
  targetBuyUsd: number | null;
  marketMarkUsd: number | null;
  collectorCeilingUsd: number | null;
  priceSource: string;
} {
  const valuation = preferredValuationForTarget(target, nowMs);
  const market = positiveMoney(valuation.value);
  const ceiling = positiveMoney(target.targetPrice);
  if (market != null && ceiling != null) {
    const targetBuyUsd = roundUsd(Math.min(market, ceiling));
    const priceSource = market <= ceiling
      ? `${valuation.label} is at or under your collector target`
      : 'Collector target is under the local mark';
    return { targetBuyUsd, marketMarkUsd: market, collectorCeilingUsd: ceiling, priceSource };
  }
  if (market != null) {
    return {
      targetBuyUsd: market,
      marketMarkUsd: market,
      collectorCeilingUsd: null,
      priceSource: valuation.label,
    };
  }
  if (ceiling != null) {
    return {
      targetBuyUsd: ceiling,
      marketMarkUsd: null,
      collectorCeilingUsd: ceiling,
      priceSource: 'Collector target',
    };
  }
  return {
    targetBuyUsd: null,
    marketMarkUsd: null,
    collectorCeilingUsd: null,
    priceSource: 'No local mark',
  };
}

interface ExtraCopy {
  extra: PricedCopy;
  keeper: PricedCopy;
  copies: number;
  extraCopies: number;
}

function duplicateExtras(inventory: readonly CardInventory[], nowMs: number): ExtraCopy[] {
  const groups = new Map<string, PricedCopy[]>();
  for (const card of inventory) {
    if (card.status === 'sold') continue;
    if (!norm(card.player)) continue;
    const priced = priceCopy(card, nowMs);
    const key = identityKey(card);
    const group = groups.get(key);
    if (group) group.push(priced);
    else groups.set(key, [priced]);
  }

  const extras: ExtraCopy[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ordered = [...group].sort((a, b) => {
      if (b.mark !== a.mark) return b.mark - a.mark;
      const gradedA = a.card.isGraded ? 1 : 0;
      const gradedB = b.card.isGraded ? 1 : 0;
      if (gradedB !== gradedA) return gradedB - gradedA;
      return a.card.id.localeCompare(b.card.id);
    });
    const keeper = ordered[0];
    const rest = ordered.slice(1).filter((row) => row.card.status !== 'consignment');
    for (const extra of rest) {
      extras.push({
        extra,
        keeper,
        copies: group.length,
        extraCopies: ordered.length - 1,
      });
    }
  }
  return extras;
}

function keeperNote(keeper: CardInventory): string {
  if (!keeper.isGraded) return 'Keep the higher local mark.';
  const slab = [keeper.gradingCompany, keeper.grade].map((part) => part?.trim()).filter(Boolean).join(' ');
  return slab ? `Keep the higher mark (${slab}).` : 'Keep the higher local mark.';
}

export function shopLineLabel(kind: ShopLineKind): string {
  switch (kind) {
    case 'collection-gap':
      return 'Collection gap';
    case 'watchlist':
      return 'Watchlist';
    case 'set-hole':
      return 'Set hole';
    case 'duplicate-trade':
      return 'Trade duplicate';
    default:
      return 'Sell duplicate';
  }
}

export function buildShowShoppingList(input: {
  show: ResolvedLocalCardShow;
  inventory: readonly CardInventory[];
  targets?: readonly TargetWatchlist[];
  liveTape?: boolean;
  nowMs?: number;
}): ShowShoppingList {
  const liveTape = input.liveTape === true;
  const label = tapeLabel(liveTape);
  const nowMs = input.nowMs ?? Date.now();
  const note = tapeNote(liveTape);
  const targets = input.targets ?? [];
  const buys: ShopLine[] = [];

  for (const target of targets) {
    if (target.status !== 'active') continue;
    if (!norm(target.player)) continue;
    if (!showCovers(input.show, target.sport)) continue;
    const gap = isCollectionGap(target, [...input.inventory]);
    const price = buyPrice(target, nowMs);
    const focused = input.show.focusPlayers.length === 0
      || input.show.focusPlayers.some((name) => norm(name) === norm(target.player));
    const focusNote = focused && input.show.focusPlayers.length > 0
      ? ' This room highlights that name.'
      : '';
    buys.push({
      id: `${input.show.id}:buy:${target.id}`,
      showId: input.show.id,
      kind: gap ? 'collection-gap' : 'watchlist',
      side: 'buy',
      player: target.player.trim(),
      detail: target.cardDescription.trim() || 'Watchlist target',
      sport: target.sport,
      targetBuyUsd: price.targetBuyUsd,
      marketMarkUsd: price.marketMarkUsd,
      collectorCeilingUsd: price.collectorCeilingUsd,
      priceSource: price.priceSource,
      tapeLabel: label,
      why: gap
        ? `Collection gap in ${target.sport}.${focusNote} ${note}`
        : `Already in the book.${focusNote} ${note}`,
      cardId: null,
      targetId: target.id,
      copies: null,
      extraCopies: null,
    });
  }

  buys.sort((a, b) => {
    const gap = (a.kind === 'collection-gap' ? 0 : 1) - (b.kind === 'collection-gap' ? 0 : 1);
    if (gap !== 0) return gap;
    const targetA = targets.find((row) => row.id === a.targetId);
    const targetB = targets.find((row) => row.id === b.targetId);
    const priority = PRIORITY_RANK[targetA?.priority ?? 'Low'] - PRIORITY_RANK[targetB?.priority ?? 'Low'];
    if (priority !== 0) return priority;
    return a.player.localeCompare(b.player) || a.detail.localeCompare(b.detail);
  });

  for (const hunt of gapHunts({
    show: input.show,
    inventory: input.inventory,
    claimed: buys.map((row) => ({ player: row.player, detail: row.detail })),
  })) {
    const focusNote = hunt.focused ? ' This room highlights that name.' : '';
    buys.push({
      id: `${input.show.id}:set:${hunt.setId}:${hunt.number}`,
      showId: input.show.id,
      kind: 'set-hole',
      side: 'buy',
      player: hunt.player.trim(),
      detail: `${hunt.setLabel} #${hunt.number}`,
      sport: hunt.sport,
      targetBuyUsd: hunt.estimateUsd > 0 ? hunt.estimateUsd : null,
      marketMarkUsd: null,
      collectorCeilingUsd: hunt.estimateUsd > 0 ? hunt.estimateUsd : null,
      priceSource: 'Demo checklist estimate',
      tapeLabel: label,
      why: `Demo checklist hole in ${hunt.setLabel}.${focusNote} ${note}`,
      cardId: null,
      targetId: null,
      copies: null,
      extraCopies: null,
    });
  }

  const buyPlayers = new Set(buys.map((row) => norm(row.player)));
  const sells: ShopLine[] = [];
  for (const row of duplicateExtras(input.inventory, nowMs)) {
    const card = row.extra.card;
    if (!showCovers(input.show, card.sport)) continue;
    const trade = buyPlayers.has(norm(card.player));
    const mark = positiveMoney(row.extra.mark);
    sells.push({
      id: `${input.show.id}:sell:${card.id}`,
      showId: input.show.id,
      kind: trade ? 'duplicate-trade' : 'duplicate-sell',
      side: 'sell',
      player: card.player.trim(),
      detail: cardDetail(card),
      sport: card.sport,
      targetBuyUsd: mark,
      marketMarkUsd: mark,
      collectorCeilingUsd: null,
      priceSource: mark == null ? 'No local mark' : row.extra.source,
      tapeLabel: label,
      why: `${trade ? 'On the buy list. ' : ''}${keeperNote(row.keeper.card)} ${note}`,
      cardId: card.id,
      targetId: null,
      copies: row.copies,
      extraCopies: row.extraCopies,
    });
  }

  sells.sort((a, b) => {
    const trade = (a.kind === 'duplicate-trade' ? 0 : 1) - (b.kind === 'duplicate-trade' ? 0 : 1);
    if (trade !== 0) return trade;
    const mark = (b.marketMarkUsd ?? 0) - (a.marketMarkUsd ?? 0);
    if (mark !== 0) return mark;
    return a.player.localeCompare(b.player) || a.id.localeCompare(b.id);
  });

  const emptyReason = buys.length === 0 && sells.length === 0
    ? 'No active watchlist rows or started-set holes match this show.'
    : null;

  return {
    showId: input.show.id,
    buys,
    sells,
    tapeLabel: label,
    disclosure: SHOW_SHOPPING_LIST_DISCLOSURE,
    emptyReason,
  };
}
