/**
 * Sell and trade-in planner for the local book.
 * Reads portfolio insights (duplicates, cost-basis losers, unrealized P/L),
 * orders duplicate extras with the existing tax-lot selector, and prices
 * exits with FiscalService venue fees. Wash-sale flags use the same 30-day
 * window as the holding-horizon rail. Advisory only.
 */
import type { CardInventory } from '../../types';
import { buildPortfolioInsights } from './portfolioInsights';
import {
  WASH_SALE_WINDOW_DAYS,
  analyzeHoldingHorizon,
  type WashSaleProximity,
} from './holdingHorizon';
import { FiscalService, type ExitSimulationResult } from '../utils/FiscalService';
import {
  LOT_METHOD_DISCLAIMER,
  SPECIFIC_ID_MISSING,
  selectLotsByMethod,
  type CostBasisMethod,
} from '../utils/taxLotService';
import { preferredValuationForCard } from '../pricing/compConsensus';

export const SELL_TRADE_PLANNER_DISCLOSURE =
  'Local book only. Duplicate extras, cost-basis losers, and unrealized gains come from the portfolio desk. Lot order uses the saved FIFO, LIFO, specific-ID, or average-cost choice. Average cost here is the mean all-in cost of that duplicate stack, not a portfolio-wide average. Proceeds subtract the existing eBay (~13%) or card-show (~4%) fee heuristic, then estimated tax on gains. A loss next to a same-card copy bought inside 30 days is held back as a wash-sale flag. Not a live listing, not a dealer quote, not IRS Form 8949 completeness, and not a Sports Card Investor or Market Movers sale feed.';

export const SUGGESTION_LIMIT = 8;
export const HOLD_LIMIT = 6;
const NEAR_LONG_TERM_DAYS = 45;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SellTradeAction = 'sell' | 'trade-in' | 'hold';
export type SellTradeReason = 'duplicate' | 'cost-basis-loser' | 'unrealized-gain';
export type SellVenue = 'eBay' | 'Card Show';

export interface SellTradeRow {
  cardId: string;
  player: string;
  label: string;
  action: SellTradeAction;
  reason: SellTradeReason;
  venue: SellVenue;
  mark: number;
  costBasis: number;
  unrealized: number;
  feeAmount: number;
  netProceeds: number;
  estimatedTax: number;
  cashAfterTax: number;
  holdingPeriod: ExitSimulationResult['taxTreatment'];
  daysToLongTerm: number;
  washSale: WashSaleProximity;
  washSaleDisallowed: number;
  note: string;
}

export interface SellTradeTotals {
  count: number;
  grossMark: number;
  fees: number;
  netProceeds: number;
  estimatedTax: number;
  cashAfterTax: number;
}

export interface SellTradePlan {
  method: CostBasisMethod;
  bookUnrealized: number;
  duplicateExtraCopies: number;
  duplicateExtraMark: number;
  loserCount: number;
  suggestions: SellTradeRow[];
  holds: SellTradeRow[];
  omittedCount: number;
  totals: SellTradeTotals;
  specificIdNote: string | null;
  lotDisclosure: string;
  emptyReason: string | null;
  disclosure: string;
}

export interface SellTradePlanOptions {
  nowMs?: number;
  method?: CostBasisMethod;
  specificLotIds?: string[];
}

interface Priced {
  card: CardInventory;
  mark: number;
  allIn: number;
  gain: number;
}

interface Stack {
  keeper: Priced;
  extras: Priced[];
  average: number;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number | null | undefined): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return 0;
  return cents(value);
}

function norm(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function identityKey(card: CardInventory): string {
  return [norm(card.player), String(card.year), norm(card.manufacturer), norm(card.set), norm(card.cardNumber)].join('|');
}

function cardLabel(card: CardInventory): string {
  const number = card.cardNumber?.trim() ? `#${card.cardNumber.trim()}` : 'no number';
  return `${card.year} ${card.manufacturer} ${card.set} ${number}`.replace(/\s+/g, ' ').trim();
}

function dollars(value: number): string {
  return `$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

function withBasis(card: CardInventory, basis: number): CardInventory {
  return {
    ...card,
    purchasePrice: basis,
    gradingFees: 0,
    shippingFees: 0,
    insuranceFees: 0,
    overheadCost: 0,
    taxBasis: undefined,
  };
}

function priceCard(card: CardInventory, nowMs: number): Priced {
  const preferred = preferredValuationForCard(card, nowMs);
  const allIn = cents(
    money(card.purchasePrice) + money(card.gradingFees) + money(card.shippingFees) + money(card.insuranceFees),
  );
  const mark = money(preferred.value);
  return { card, mark, allIn, gain: cents(mark - allIn) };
}

function isActionable(card: CardInventory): boolean {
  return card.status !== 'sold' && card.status !== 'consignment';
}

function buildStacks(rows: Priced[]): Stack[] {
  const groups = new Map<string, Priced[]>();
  for (const row of rows) {
    const key = identityKey(row.card);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const stacks: Stack[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const ordered = [...group].sort((a, b) => {
      if (b.mark !== a.mark) return b.mark - a.mark;
      const graded = Number(b.card.isGraded) - Number(a.card.isGraded);
      if (graded !== 0) return graded;
      return a.card.id.localeCompare(b.card.id);
    });
    const average = cents(group.reduce((sum, row) => sum + row.allIn, 0) / group.length);
    stacks.push({ keeper: ordered[0], extras: ordered.slice(1), average });
  }
  return stacks;
}

function quoteExit(card: CardInventory, basis: number, mark: number, venue: SellVenue, asOf: Date) {
  const exit = FiscalService.simulateExit(withBasis(card, basis), mark, undefined, asOf);
  const venueRow = exit.venueEstimates.find((row) => row.venue === venue)!;
  const feeAmount = cents(venueRow.saleFees);
  const netProceeds = cents(mark - feeAmount);
  const estimatedTax = cents(venueRow.estimatedTax);
  return {
    exit,
    venue,
    feeAmount,
    netProceeds,
    estimatedTax,
    cashAfterTax: cents(netProceeds - estimatedTax),
  };
}

function recentSibling(card: CardInventory, peers: CardInventory[], asOfMs: number): number | null {
  let closest: number | null = null;
  for (const other of peers) {
    if (other.id === card.id) continue;
    const acquired = Date.parse(other.purchaseDate || '');
    if (!Number.isFinite(acquired)) continue;
    const days = Math.round(Math.abs(asOfMs - acquired) / DAY_MS);
    if (days > WASH_SALE_WINDOW_DAYS) continue;
    if (closest == null || days < closest) closest = days;
  }
  return closest;
}

function emptyTotals(): SellTradeTotals {
  return { count: 0, grossMark: 0, fees: 0, netProceeds: 0, estimatedTax: 0, cashAfterTax: 0 };
}

function sumTotals(rows: SellTradeRow[]): SellTradeTotals {
  return rows.reduce(
    (totals, row) => ({
      count: totals.count + 1,
      grossMark: cents(totals.grossMark + row.mark),
      fees: cents(totals.fees + row.feeAmount),
      netProceeds: cents(totals.netProceeds + row.netProceeds),
      estimatedTax: cents(totals.estimatedTax + row.estimatedTax),
      cashAfterTax: cents(totals.cashAfterTax + row.cashAfterTax),
    }),
    emptyTotals(),
  );
}

function emptyPlan(
  method: CostBasisMethod,
  bookUnrealized: number,
  reason: string,
  specificIdNote: string | null = null,
): SellTradePlan {
  return {
    method,
    bookUnrealized,
    duplicateExtraCopies: 0,
    duplicateExtraMark: 0,
    loserCount: 0,
    suggestions: [],
    holds: [],
    omittedCount: 0,
    totals: emptyTotals(),
    specificIdNote,
    lotDisclosure: LOT_METHOD_DISCLAIMER,
    emptyReason: reason,
    disclosure: SELL_TRADE_PLANNER_DISCLOSURE,
  };
}

function orderExtras(
  extras: Priced[],
  method: CostBasisMethod,
  specificLotIds: string[],
  stackAverage: number,
): Priced[] {
  const matchCount =
    method === 'SpecificID' ? extras.filter((row) => specificLotIds.includes(row.card.id)).length : extras.length;
  if (matchCount === 0) return [];
  const lots = extras.map((row) => ({
    lotId: row.card.id,
    dateAcquired: row.card.purchaseDate || '',
    costBasis: method === 'AvgCost' ? stackAverage : row.allIn,
    description: cardLabel(row.card),
  }));
  const selectedIds = selectLotsByMethod(lots, matchCount, method, specificLotIds).selected.map((lot) => lot.lotId);
  const byId = new Map(extras.map((row) => [row.card.id, row]));
  return selectedIds.map((id) => byId.get(id)!);
}

/**
 * Suggest which active cards to sell or trade in, and which losses to hold
 * because a same-card copy was acquired inside the wash-sale window.
 */
export function buildSellTradePlan(
  inventory: readonly CardInventory[],
  options: SellTradePlanOptions = {},
): SellTradePlan {
  const method = options.method ?? 'FIFO';
  const specificLotIds = [...new Set((options.specificLotIds ?? []).map((id) => id.trim()).filter(Boolean))];
  const nowMs = options.nowMs ?? Date.now();
  const asOf = new Date(nowMs);
  const insights = buildPortfolioInsights(inventory, { limit: 50, nowMs });

  if (inventory.length === 0) {
    return emptyPlan(method, 0, 'No cards in the local book.');
  }

  const priced = inventory.filter(isActionable).map((card) => priceCard(card, nowMs)).filter((row) => row.mark > 0 || row.allIn > 0);
  if (priced.length === 0) {
    const onlyConsignment = inventory.every((card) => card.status === 'consignment' || card.status === 'sold');
    const reason = inventory.every((card) => card.status === 'sold')
      ? 'No active holdings to sell or trade in.'
      : onlyConsignment
        ? 'Consigned cards stay with the partner. Nothing else is on the book to sell or trade in.'
        : 'No active holdings to sell or trade in.';
    return emptyPlan(method, insights.totals.unrealized, reason);
  }

  const horizon = analyzeHoldingHorizon([...inventory], asOf);
  const horizonById = new Map(horizon.rows.map((row) => [row.cardId, row]));
  const stacks = buildStacks(priced);
  const extraIds = new Set(stacks.flatMap((stack) => stack.extras.map((row) => row.card.id)));
  const keeperIds = new Set(stacks.map((stack) => stack.keeper.card.id));
  const peersByKey = new Map<string, CardInventory[]>();
  for (const row of priced) {
    const key = identityKey(row.card);
    const list = peersByKey.get(key);
    if (list) list.push(row.card);
    else peersByKey.set(key, [row.card]);
  }

  const draft: SellTradeRow[] = [];

  for (const stack of stacks) {
    const ordered = orderExtras(stack.extras, method, specificLotIds, stack.average);
    for (const extra of ordered) {
      const basis = method === 'AvgCost' ? stack.average : extra.allIn;
      const trade = quoteExit(extra.card, basis, extra.mark, 'Card Show', asOf);
      const listed = quoteExit(extra.card, basis, extra.mark, 'eBay', asOf);
      const averageNote =
        method === 'AvgCost' && basis !== extra.allIn
          ? ` Average cost of this stack (${dollars(basis)}) replaces this copy’s own basis.`
          : '';
      draft.push({
        cardId: extra.card.id,
        player: extra.card.player,
        label: cardLabel(extra.card),
        action: 'trade-in',
        reason: 'duplicate',
        venue: 'Card Show',
        mark: extra.mark,
        costBasis: basis,
        unrealized: cents(extra.mark - basis),
        feeAmount: trade.feeAmount,
        netProceeds: trade.netProceeds,
        estimatedTax: trade.estimatedTax,
        cashAfterTax: trade.cashAfterTax,
        holdingPeriod: trade.exit.taxTreatment,
        daysToLongTerm: trade.exit.daysToLongTerm,
        washSale: 'clear',
        washSaleDisallowed: 0,
        note: `Extra copy. Card-show trade-in nets ${dollars(trade.netProceeds)} after the ~4% fee. An eBay list would net ${dollars(listed.netProceeds)} after ~13%.${averageNote}`,
      });
    }
  }

  for (const row of priced) {
    if (extraIds.has(row.card.id) || keeperIds.has(row.card.id)) continue;
    if (row.gain < 0) {
      const sale = quoteExit(row.card, row.allIn, row.mark, 'eBay', asOf);
      draft.push({
        cardId: row.card.id,
        player: row.card.player,
        label: cardLabel(row.card),
        action: 'sell',
        reason: 'cost-basis-loser',
        venue: 'eBay',
        mark: row.mark,
        costBasis: row.allIn,
        unrealized: row.gain,
        feeAmount: sale.feeAmount,
        netProceeds: sale.netProceeds,
        estimatedTax: sale.estimatedTax,
        cashAfterTax: sale.cashAfterTax,
        holdingPeriod: sale.exit.taxTreatment,
        daysToLongTerm: sale.exit.daysToLongTerm,
        washSale: 'clear',
        washSaleDisallowed: 0,
        note: `Below all-in cost by ${dollars(Math.abs(row.gain))}. eBay sale nets ${dollars(sale.netProceeds)} after the ~13% fee.`,
      });
      continue;
    }
    if (row.gain < 25) continue;
    const sale = quoteExit(row.card, row.allIn, row.mark, 'eBay', asOf);
    const nearLongTerm = sale.exit.taxTreatment === 'Short Term' && sale.exit.daysToLongTerm > 0 && sale.exit.daysToLongTerm <= NEAR_LONG_TERM_DAYS;
    if (nearLongTerm) {
      draft.push({
        cardId: row.card.id,
        player: row.card.player,
        label: cardLabel(row.card),
        action: 'hold',
        reason: 'unrealized-gain',
        venue: 'eBay',
        mark: row.mark,
        costBasis: row.allIn,
        unrealized: row.gain,
        feeAmount: sale.feeAmount,
        netProceeds: sale.netProceeds,
        estimatedTax: sale.estimatedTax,
        cashAfterTax: sale.cashAfterTax,
        holdingPeriod: sale.exit.taxTreatment,
        daysToLongTerm: sale.exit.daysToLongTerm,
        washSale: 'clear',
        washSaleDisallowed: 0,
        note: `Short-term with ${sale.exit.daysToLongTerm} days until long-term treatment. Waiting may lower the estimated tax.`,
      });
      continue;
    }
    if (sale.exit.taxTreatment !== 'Long Term') continue;
    if (sale.netProceeds <= row.allIn) continue;
    draft.push({
      cardId: row.card.id,
      player: row.card.player,
      label: cardLabel(row.card),
      action: 'sell',
      reason: 'unrealized-gain',
      venue: 'eBay',
      mark: row.mark,
      costBasis: row.allIn,
      unrealized: row.gain,
      feeAmount: sale.feeAmount,
      netProceeds: sale.netProceeds,
      estimatedTax: sale.estimatedTax,
      cashAfterTax: sale.cashAfterTax,
      holdingPeriod: sale.exit.taxTreatment,
      daysToLongTerm: sale.exit.daysToLongTerm,
      washSale: 'clear',
      washSaleDisallowed: 0,
      note: `Long-term and still ahead after the ~13% eBay fee (${dollars(sale.netProceeds)} net).`,
    });
  }

  const pricedById = new Map(priced.map((row) => [row.card.id, row]));
  const flagged = draft.map((row) => {
    const card = pricedById.get(row.cardId)!;
    const peers = peersByKey.get(identityKey(card.card))!;
    const siblingDays = row.netProceeds < row.costBasis ? recentSibling(card.card, peers, nowMs) : null;
    const horizonRow = horizonById.get(row.cardId);
    if (siblingDays != null) {
      const disallowed = cents(Math.max(0, row.costBasis - row.netProceeds));
      return {
        ...row,
        action: 'hold' as const,
        washSale: 'restricted' as const,
        washSaleDisallowed: disallowed,
        note: `Loss sits inside the ${WASH_SALE_WINDOW_DAYS}-day window of another same-card copy acquired ${siblingDays}d away. About ${dollars(disallowed)} of the loss is flagged as disallowed. Heuristic only — not a wash-sale determination.`,
      };
    }
    if (horizonRow && horizonRow.washSaleProximity !== 'clear' && horizonRow.washSaleDetail) {
      return {
        ...row,
        washSale: 'watch' as const,
        note: `${row.note} ${horizonRow.washSaleDetail}`,
      };
    }
    return row;
  });

  const holds = flagged
    .filter((row) => row.action === 'hold')
    .sort((a, b) => {
      const rank = { restricted: 0, watch: 1, clear: 2 };
      const washDelta = rank[a.washSale] - rank[b.washSale];
      if (washDelta !== 0) return washDelta;
      return a.daysToLongTerm - b.daysToLongTerm || a.cardId.localeCompare(b.cardId);
    });
  const actionable = flagged
    .filter((row) => row.action !== 'hold')
    .sort((a, b) => {
      const reasonRank = { duplicate: 0, 'cost-basis-loser': 1, 'unrealized-gain': 2 };
      const reasonDelta = reasonRank[a.reason] - reasonRank[b.reason];
      if (reasonDelta !== 0) return reasonDelta;
      if (a.reason === 'duplicate') return 0;
      if (a.reason === 'cost-basis-loser') return a.unrealized - b.unrealized || a.cardId.localeCompare(b.cardId);
      return b.unrealized - a.unrealized || a.cardId.localeCompare(b.cardId);
    });

  const suggestions = actionable.slice(0, SUGGESTION_LIMIT);
  const visibleHolds = holds.slice(0, HOLD_LIMIT);
  const omittedCount = actionable.length - suggestions.length + (holds.length - visibleHolds.length);

  const keptSpecific = specificLotIds.filter((id) => keeperIds.has(id));
  const named = new Set(flagged.map((row) => row.cardId));
  const missingSpecific = specificLotIds.filter((id) => !named.has(id) && !keeperIds.has(id));
  const notes: string[] = [];
  if (method === 'SpecificID' && specificLotIds.length === 0 && insights.duplicateExtraCopies > 0) {
    notes.push('Specific identification is selected and no lots are marked, so duplicate extras are not named. Mark lots on the tax report.');
  }
  if (missingSpecific.length > 0) notes.push(SPECIFIC_ID_MISSING);
  if (keptSpecific.length > 0) {
    notes.push('A marked lot is the copy this desk keeps (highest mark, graded on a tie) and is not listed for sale.');
  }

  const loserCount = priced.filter((row) => row.gain < 0).length;
  const emptyReason =
    suggestions.length === 0 && visibleHolds.length === 0
      ? 'Nothing in this book stands out to sell or trade in. No duplicate extras, cost-basis losers, or long-term winners that clear fees.'
      : null;

  return {
    method,
    bookUnrealized: insights.totals.unrealized,
    duplicateExtraCopies: insights.duplicateExtraCopies,
    duplicateExtraMark: insights.duplicateExtraMark,
    loserCount,
    suggestions,
    holds: visibleHolds,
    omittedCount,
    totals: sumTotals(suggestions),
    specificIdNote: notes.length > 0 ? notes.join(' ') : null,
    lotDisclosure: LOT_METHOD_DISCLAIMER,
    emptyReason,
    disclosure: SELL_TRADE_PLANNER_DISCLOSURE,
  };
}
