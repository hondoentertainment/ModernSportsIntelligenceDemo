/**
 * Rank seeded local card shows against the collector's book.
 * Prices stay on demo/stale tape unless the caller says live comps are on.
 * This module does not read or flip VITE_FF_REAL_* flags.
 */
import type { CardInventory, Sport, TargetWatchlist } from '../../types';
import { findDealCandidates, type DealLiteCandidate } from '../analytics/dealFinderLite';
import { listPortfolioMovers, type MoverRow } from '../analytics/portfolioMovers';
import {
  LOCAL_CARD_SHOW_DISCLOSURE,
  LOCAL_CARD_SHOW_SOURCE,
  distanceMiles,
  listResolvedLocalCardShows,
  type ResolvedLocalCardShow,
} from './localCardShowCatalog';

export const SHOW_BUYING_DESK_DISCLOSURE =
  `${LOCAL_CARD_SHOW_DISCLOSURE} Buy and attend calls use collection gaps, deal-finder lite, portfolio movers, and the local show bag. Marks stay on demo or stale local tape until live eBay is on. Not live Market Movers or Sports Card Investor parity.`;

export const TAPE_LABEL_DEMO = 'Local / demo tape';
export const TAPE_LABEL_LIVE = 'Live comps';
export const NEARBY_MILES = 50;
export const REGIONAL_MILES = 200;
export const WORTH_ATTENDING_SCORE = 55;
export const BUY_AT_SHOW_SCORE = 70;
export const MOVER_SIGNAL_PCT = 8;

export type ShowGeoStatus = 'nearby' | 'regional' | 'far' | 'unknown';
export type ShowVerdict = 'buy-at-show' | 'worth-attending' | 'sell-into-show' | 'watch' | 'skip';
export type OpportunityKind =
  | 'collection-gap'
  | 'deal-finder'
  | 'mover-dip'
  | 'sell-into-room'
  | 'show-bag'
  | 'lot-negotiate';
export type OpportunityAction = 'buy-at-show' | 'bring-to-negotiate' | 'pack-show-bag';

export interface ShowBagHint {
  id: string;
  label: string;
  section: string;
  packed: boolean;
}

export interface ShowBuyOpportunity {
  id: string;
  showId: string;
  kind: OpportunityKind;
  action: OpportunityAction;
  player: string;
  detail: string;
  why: string;
  tapeLabel: string;
  consensusMark: number | null;
  askPrice: number | null;
  discountPct: number | null;
  cardId: string | null;
  targetId: string | null;
  compsHref: string | null;
  collectionHref: string;
  showBagHref: string;
  score: number;
}

export interface RankedLocalShow {
  show: ResolvedLocalCardShow;
  distanceMiles: number | null;
  geoStatus: ShowGeoStatus;
  worthAttendingScore: number;
  verdict: ShowVerdict;
  opportunities: ShowBuyOpportunity[];
  reasons: string[];
  tapeLabel: string;
}

export interface ShowBuyingDeskReport {
  shows: RankedLocalShow[];
  headline: RankedLocalShow | null;
  geoStatus: 'provided' | 'unavailable';
  tapeLabel: string;
  disclosure: string;
  catalogSource: typeof LOCAL_CARD_SHOW_SOURCE;
  emptyReason: string | null;
  opportunityCount: number;
}

export interface RankShowBuyingDeskInput {
  shows: ResolvedLocalCardShow[];
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  deals?: DealLiteCandidate[];
  gainers?: MoverRow[];
  losers?: MoverRow[];
  showBagItems?: ShowBagHint[];
  geo?: { lat: number; lng: number } | null;
  cityQuery?: string;
  sport?: Sport | 'all';
  liveTape?: boolean;
}

const VERDICT_RANK: Record<ShowVerdict, number> = {
  'buy-at-show': 0,
  'worth-attending': 1,
  'sell-into-show': 2,
  watch: 3,
  skip: 4,
};

function norm(value: string): string {
  return value.trim().toLowerCase();
}

function tapeLabel(liveTape: boolean): string {
  return liveTape ? TAPE_LABEL_LIVE : TAPE_LABEL_DEMO;
}

function tapeNote(liveTape: boolean): string {
  return liveTape
    ? 'Live comps flag is on — still confirm the table ask in person.'
    : 'Local / demo tape — not a live eBay sold and not a Market Movers print.';
}

function holdingsForPlayer(inventory: CardInventory[], player: string): CardInventory[] {
  const key = norm(player);
  return inventory.filter((card) => card.status !== 'sold' && norm(card.player) === key);
}

function yearInText(text: string): string | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : null;
}

export function isCollectionGap(target: TargetWatchlist, inventory: CardInventory[]): boolean {
  if (target.status !== 'active') return false;
  const holdings = holdingsForPlayer(inventory, target.player);
  if (holdings.length === 0) return true;
  const year = yearInText(`${target.cardDescription} ${target.notes ?? ''}`);
  if (year && !holdings.some((card) => String(card.year) === year)) return true;
  return false;
}

function sportForPlayer(
  player: string,
  inventory: CardInventory[],
  targets: TargetWatchlist[],
): Sport | null {
  const key = norm(player);
  const card = inventory.find((row) => row.status !== 'sold' && norm(row.player) === key);
  if (card) return card.sport;
  const target = targets.find((row) => norm(row.player) === key);
  return target?.sport ?? null;
}

function cardForPlayer(inventory: CardInventory[], player: string): CardInventory | undefined {
  return holdingsForPlayer(inventory, player)[0];
}

function showCoversSport(show: ResolvedLocalCardShow, sport: Sport | null): boolean {
  if (!sport) return false;
  return show.sports.includes(sport);
}

function focusHit(show: ResolvedLocalCardShow, player: string): boolean {
  const key = norm(player);
  return show.focusPlayers.some((name) => norm(name) === key);
}

function geoStatusFor(miles: number | null): ShowGeoStatus {
  if (miles == null) return 'unknown';
  if (miles <= NEARBY_MILES) return 'nearby';
  if (miles <= REGIONAL_MILES) return 'regional';
  return 'far';
}

function timingPoints(show: ResolvedLocalCardShow): number {
  if (show.status === 'in-progress') return 28;
  if (show.daysUntilStart <= 14) return 24;
  if (show.daysUntilStart <= 45) return 16;
  if (show.daysUntilStart <= 90) return 8;
  return 2;
}

function distancePoints(show: ResolvedLocalCardShow, status: ShowGeoStatus): number {
  if (status === 'nearby') return 22;
  if (status === 'regional') return 12;
  if (status === 'unknown') return 6;
  return show.vendorCount >= 400 ? 8 : 0;
}

function compsHref(cardId: string | null): string | null {
  return cardId ? `/compare?card1=${encodeURIComponent(cardId)}` : null;
}

function opportunityShell(
  showId: string,
  kind: OpportunityKind,
  action: OpportunityAction,
  player: string,
  detail: string,
  why: string,
  liveTape: boolean,
  score: number,
  extra: Partial<ShowBuyOpportunity> = {},
): ShowBuyOpportunity {
  return {
    id: `${showId}:${kind}:${norm(player) || kind}`,
    showId,
    kind,
    action,
    player,
    detail,
    why,
    tapeLabel: tapeLabel(liveTape),
    consensusMark: null,
    askPrice: null,
    discountPct: null,
    cardId: null,
    targetId: null,
    compsHref: compsHref(extra.cardId ?? null),
    collectionHref: '/collection',
    showBagHref: '/card-show-mode',
    score,
    ...extra,
  };
}

function bagMention(items: ShowBagHint[], player: string): ShowBagHint | undefined {
  const key = norm(player);
  if (!key) return undefined;
  return items.find((item) => norm(item.label).includes(key));
}

function matchesQuery(show: ResolvedLocalCardShow, cityQuery: string, sport: Sport | 'all'): boolean {
  if (sport !== 'all' && !show.sports.includes(sport)) return false;
  const query = cityQuery.trim().toLowerCase();
  if (!query) return true;
  const hay = `${show.city} ${show.state} ${show.name} ${show.venue}`.toLowerCase();
  return hay.includes(query);
}

function buildOpportunities(
  show: ResolvedLocalCardShow,
  inventory: CardInventory[],
  targets: TargetWatchlist[],
  deals: DealLiteCandidate[],
  gainers: MoverRow[],
  losers: MoverRow[],
  showBagItems: ShowBagHint[],
  liveTape: boolean,
): ShowBuyOpportunity[] {
  const rows: ShowBuyOpportunity[] = [];
  const seen = new Set<string>();

  const push = (row: ShowBuyOpportunity) => {
    const key = `${row.kind}:${norm(row.player)}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push(row);
  };

  for (const target of targets) {
    if (!isCollectionGap(target, inventory)) continue;
    if (!showCoversSport(show, target.sport)) continue;
    const focused = focusHit(show, target.player) || show.focusPlayers.length === 0;
    const score = (focused ? 26 : 16) + (target.priority === 'High' ? 4 : 0);
    const bag = bagMention(showBagItems, target.player);
    const packNote = bag
      ? bag.packed
        ? ' Already in the show bag.'
        : ' Not packed yet — add it to the show bag before you go.'
      : ' Pack the target on the show bag if you decide to attend.';
    const card = cardForPlayer(inventory, target.player);
    push(
      opportunityShell(
        show.id,
        'collection-gap',
        'buy-at-show',
        target.player,
        target.cardDescription,
        `Collection gap in ${target.sport}. Tables here cover that sport.${packNote} ${tapeNote(liveTape)}`,
        liveTape,
        score,
        {
          askPrice: target.currentMarketPrice ?? null,
          consensusMark: target.targetPrice > 0 ? target.targetPrice : null,
          cardId: card?.id ?? null,
          targetId: target.id,
        },
      ),
    );
  }

  for (const deal of deals) {
    const sport = sportForPlayer(deal.player, inventory, targets);
    if (!showCoversSport(show, sport)) continue;
    const score = (deal.greatDeal ? 18 : 10) + (focusHit(show, deal.player) ? 6 : 0);
    const card = cardForPlayer(inventory, deal.player);
    push(
      opportunityShell(
        show.id,
        'deal-finder',
        'buy-at-show',
        deal.player,
        deal.detail,
        `${deal.rationale} Ask the same name at this show if a dealer has it. ${tapeNote(liveTape)}`,
        liveTape,
        score,
        {
          askPrice: deal.askPrice,
          consensusMark: deal.consensusMark,
          discountPct: deal.discountPct,
          cardId: card?.id ?? null,
          targetId: deal.kind === 'target' || deal.kind === 'watchlist' ? deal.id : null,
        },
      ),
    );
  }

  for (const mover of losers) {
    if (mover.changePct > -MOVER_SIGNAL_PCT) continue;
    const card = inventory.find((row) => row.id === mover.cardId);
    const sport = card?.sport ?? sportForPlayer(mover.player, inventory, targets);
    if (!showCoversSport(show, sport)) continue;
    push(
      opportunityShell(
        show.id,
        'mover-dip',
        'buy-at-show',
        mover.player,
        `${mover.year} ${mover.set}`,
        `Local book is ${mover.changePct.toFixed(1)}% vs the stored snapshot. A table ask under that mark is the buy. ${tapeNote(liveTape)}`,
        liveTape,
        14,
        {
          consensusMark: mover.to,
          cardId: mover.cardId,
          discountPct: Math.abs(mover.changePct),
        },
      ),
    );
  }

  for (const mover of gainers) {
    if (mover.changePct < MOVER_SIGNAL_PCT) continue;
    const card = inventory.find((row) => row.id === mover.cardId);
    const sport = card?.sport ?? sportForPlayer(mover.player, inventory, targets);
    if (!showCoversSport(show, sport)) continue;
    const bag = bagMention(showBagItems, mover.player);
    push(
      opportunityShell(
        show.id,
        'sell-into-room',
        'bring-to-negotiate',
        mover.player,
        `${mover.year} ${mover.set}`,
        `Local book is up ${mover.changePct.toFixed(1)}%. Bring it for a lot conversation${bag?.packed ? ' — already packed' : ''}. Advisory only, no live fill. ${tapeNote(liveTape)}`,
        liveTape,
        12,
        {
          consensusMark: mover.to,
          cardId: mover.cardId,
        },
      ),
    );
  }

  for (const item of showBagItems) {
    if (!item.packed) continue;
    if (item.section === 'supplies') continue;
    const player = knownPlayerInLabel(item.label, inventory, targets);
    if (!player) continue;
    const sport = sportForPlayer(player, inventory, targets);
    if (!showCoversSport(show, sport)) continue;
    if (rows.some((row) => norm(row.player) === norm(player))) continue;
    const card = cardForPlayer(inventory, player);
    push(
      opportunityShell(
        show.id,
        'show-bag',
        'pack-show-bag',
        player,
        item.label,
        `Packed on the local show bag (${item.section}). Confirm the table price against the local mark before you trade. ${tapeNote(liveTape)}`,
        liveTape,
        8,
        { cardId: card?.id ?? null },
      ),
    );
  }

  const lotPlayers = rows
    .filter((row) => row.kind === 'sell-into-room' || row.kind === 'show-bag')
    .map((row) => row.player);
  const packedNegotiate = showBagItems.filter((item) => {
    if (!item.packed) return false;
    if (item.section !== 'review' && item.section !== 'consign') return false;
    const player = knownPlayerInLabel(item.label, inventory, targets);
    return player != null && showCoversSport(show, sportForPlayer(player, inventory, targets));
  });
  const lotNames = [...new Set([...lotPlayers, ...packedNegotiate.map((item) => knownPlayerInLabel(item.label, inventory, targets) ?? '')])]
    .filter(Boolean);
  if (lotNames.length >= 2) {
    push(
      opportunityShell(
        show.id,
        'lot-negotiate',
        'bring-to-negotiate',
        lotNames.slice(0, 3).join(', '),
        `${lotNames.length} cards for one booth`,
        `Bundle ${lotNames.length} cards at one table instead of single-card asks. Arena lot pricing stays advisory — no escrow and no live marketplace fill. ${tapeNote(liveTape)}`,
        liveTape,
        10,
      ),
    );
  }

  return rows.sort((a, b) => b.score - a.score || a.player.localeCompare(b.player));
}

function knownPlayerInLabel(
  label: string,
  inventory: CardInventory[],
  targets: TargetWatchlist[],
): string | null {
  const hay = norm(label);
  const names = [
    ...inventory.filter((card) => card.status !== 'sold').map((card) => card.player),
    ...targets.map((target) => target.player),
  ];
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  unique.sort((a, b) => b.length - a.length);
  const hit = unique.find((name) => hay.includes(norm(name)));
  return hit ?? null;
}

function verdictFor(score: number, opportunities: ShowBuyOpportunity[]): ShowVerdict {
  const buy = opportunities.some((row) => row.action === 'buy-at-show');
  const sell = opportunities.some((row) => row.kind === 'sell-into-room' || row.kind === 'lot-negotiate');
  if (buy && score >= BUY_AT_SHOW_SCORE) return 'buy-at-show';
  if (score >= WORTH_ATTENDING_SCORE) return 'worth-attending';
  if (sell && score >= 40) return 'sell-into-show';
  if (score >= 28 || opportunities.length > 0) return 'watch';
  return 'skip';
}

function reasonsFor(
  show: ResolvedLocalCardShow,
  miles: number | null,
  geo: ShowGeoStatus,
  opportunities: ShowBuyOpportunity[],
): string[] {
  const reasons: string[] = [];
  if (show.status === 'in-progress') reasons.push('Show is open now.');
  else reasons.push(show.daysUntilStart === 1 ? 'Opens tomorrow.' : `Opens in ${show.daysUntilStart} days.`);
  if (geo === 'unknown') reasons.push('Distance unknown — location is off.');
  else if (miles != null) reasons.push(`${miles.toFixed(0)} mi · ${geo}.`);
  const gaps = opportunities.filter((row) => row.kind === 'collection-gap').length;
  const buys = opportunities.filter((row) => row.kind === 'deal-finder' || row.kind === 'mover-dip').length;
  const sells = opportunities.filter((row) => row.kind === 'sell-into-room' || row.kind === 'lot-negotiate').length;
  if (gaps > 0) reasons.push(`${gaps} collection gap${gaps === 1 ? '' : 's'} match this room.`);
  if (buys > 0) reasons.push(`${buys} buy signal${buys === 1 ? '' : 's'} from deals or local movers.`);
  if (sells > 0) reasons.push('Bring cards to negotiate — advisory lot only.');
  if (opportunities.length === 0) {
    reasons.push('No buy call yet. Add a watchlist gap or a local mover in a sport this show covers.');
  }
  return reasons.slice(0, 4);
}

export function rankShowBuyingDesk(input: RankShowBuyingDeskInput): ShowBuyingDeskReport {
  const liveTape = input.liveTape === true;
  const label = tapeLabel(liveTape);
  const cityQuery = input.cityQuery ?? '';
  const sport = input.sport ?? 'all';
  const geo = input.geo ?? null;
  const filtered = input.shows.filter((show) => matchesQuery(show, cityQuery, sport));

  if (filtered.length === 0) {
    return {
      shows: [],
      headline: null,
      geoStatus: geo ? 'provided' : 'unavailable',
      tapeLabel: label,
      disclosure: SHOW_BUYING_DESK_DISCLOSURE,
      catalogSource: LOCAL_CARD_SHOW_SOURCE,
      emptyReason: input.shows.length === 0
        ? 'The seeded show calendar is empty.'
        : 'No seeded shows match that city or sport. Clear the filter to see the full calendar.',
      opportunityCount: 0,
    };
  }

  const ranked = filtered.map((show) => {
    const miles = geo ? distanceMiles(geo, { lat: show.lat, lng: show.lng }) : null;
    const geoStatus = geoStatusFor(miles);
    const opportunities = buildOpportunities(
      show,
      input.inventory,
      input.targets ?? [],
      input.deals ?? [],
      input.gainers ?? [],
      input.losers ?? [],
      input.showBagItems ?? [],
      liveTape,
    );
    const opportunityPoints = opportunities.reduce((sum, row) => sum + row.score, 0);
    const worthAttendingScore = Math.min(
      100,
      timingPoints(show) + distancePoints(show, geoStatus) + Math.min(50, opportunityPoints),
    );
    return {
      show,
      distanceMiles: miles,
      geoStatus,
      worthAttendingScore,
      verdict: verdictFor(worthAttendingScore, opportunities),
      opportunities,
      reasons: reasonsFor(show, miles, geoStatus, opportunities),
      tapeLabel: label,
    } satisfies RankedLocalShow;
  });

  ranked.sort((a, b) => {
    const byVerdict = VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict];
    if (byVerdict !== 0) return byVerdict;
    if (b.worthAttendingScore !== a.worthAttendingScore) return b.worthAttendingScore - a.worthAttendingScore;
    return a.show.daysUntilStart - b.show.daysUntilStart || a.show.city.localeCompare(b.show.city);
  });

  const headline = ranked.find((row) => row.verdict !== 'skip') ?? ranked[0] ?? null;
  return {
    shows: ranked,
    headline,
    geoStatus: geo ? 'provided' : 'unavailable',
    tapeLabel: label,
    disclosure: SHOW_BUYING_DESK_DISCLOSURE,
    catalogSource: LOCAL_CARD_SHOW_SOURCE,
    emptyReason: null,
    opportunityCount: ranked.reduce((sum, row) => sum + row.opportunities.length, 0),
  };
}

export function assembleShowBuyingDesk(input: {
  inventory: CardInventory[];
  targets?: TargetWatchlist[];
  showBagItems?: ShowBagHint[];
  geo?: { lat: number; lng: number } | null;
  cityQuery?: string;
  sport?: Sport | 'all';
  liveTape?: boolean;
  now?: Date;
  shows?: ResolvedLocalCardShow[];
  deals?: DealLiteCandidate[];
  gainers?: MoverRow[];
  losers?: MoverRow[];
}): ShowBuyingDeskReport {
  const targets = input.targets ?? [];
  const deals = input.deals ?? findDealCandidates(input.inventory, targets, { limit: 12 }).candidates;
  const movers = input.gainers || input.losers
    ? null
    : listPortfolioMovers(input.inventory, { limit: 8 });
  return rankShowBuyingDesk({
    shows: input.shows ?? listResolvedLocalCardShows(input.now ?? new Date()),
    inventory: input.inventory,
    targets,
    deals,
    gainers: input.gainers ?? movers?.gainers ?? [],
    losers: input.losers ?? movers?.losers ?? [],
    showBagItems: input.showBagItems,
    geo: input.geo,
    cityQuery: input.cityQuery,
    sport: input.sport,
    liveTape: input.liveTape,
  });
}

export function verdictLabel(verdict: ShowVerdict): string {
  switch (verdict) {
    case 'buy-at-show':
      return 'Buy at show';
    case 'worth-attending':
      return 'Worth attending';
    case 'sell-into-show':
      return 'Sell into the room';
    case 'watch':
      return 'Watch';
    default:
      return 'Low fit';
  }
}

export function opportunityLabel(kind: OpportunityKind): string {
  switch (kind) {
    case 'collection-gap':
      return 'Collection gap';
    case 'deal-finder':
      return 'Deal finder';
    case 'mover-dip':
      return 'Buy the dip';
    case 'sell-into-room':
      return 'Sell into the room';
    case 'show-bag':
      return 'Show bag';
    default:
      return 'Lot negotiation';
  }
}
