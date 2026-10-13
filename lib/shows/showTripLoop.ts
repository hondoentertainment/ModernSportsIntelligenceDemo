/**
 * Trip budget, floor calls, and post-show recap for a seeded local card show.
 * Builds on the buying desk. Does not scrape promoters, read live fares, or
 * flip VITE_FF_REAL_* flags. Collection writes are whatever the collector types.
 */
import type { CardInventory, League, Sport, TargetWatchlist } from '../../types';
import { store } from '../dal/syncStore';
import type { ShowBuyOpportunity } from './showBuyingDesk';

export const SHOW_TRIP_CASH_KEY = 'msi_show_trip_cash_v1';
export const SHOW_TRIP_DECISIONS_KEY = 'msi_show_floor_decisions_v1';

export const SHOW_TRIP_LOOP_DISCLOSURE =
  'Trip budget, floor prices, and the recap use this seeded show calendar and your local book. Travel is a distance-band stub, not a live fare. Marks stay on demo or stale tape until live eBay is on. Filing a buy or a sale writes what you typed into the collection — not a marketplace fill and not live Market Movers or Sports Card Investor parity.';

export const TRAVEL_ESTIMATE_NOTE =
  'Travel dollars are a distance-band stub (parking and gas, or a weekend placeholder). Not a live fare, gas quote, or hotel API.';

export type TripIntent = 'buy' | 'sell' | 'pack';
export type FloorCall = 'buy' | 'pass' | 'sell';
export type VersusMark = 'under' | 'at' | 'over' | 'unknown';

export interface TripLineItem {
  id: string;
  player: string;
  intent: TripIntent;
  askUsd: number | null;
  markUsd: number | null;
  cardId: string | null;
  sport: Sport | null;
  year: number | null;
  setName: string | null;
  costBasisUsd: number | null;
  detail: string;
}

export interface BudgetLine {
  id: 'admission' | 'travel' | 'buy-reserve' | 'sell-credit';
  label: string;
  amountUsd: number;
  note: string;
}

export interface TripBudget {
  showId: string;
  lines: BudgetLine[];
  admissionUsd: number;
  travelUsd: number;
  travelLabel: string;
  buyReserveUsd: number;
  sellCreditUsd: number;
  unpricedBuys: number;
  unpricedSells: number;
  netNeedUsd: number;
  suggestedCashUsd: number;
  disclosure: string;
}

export interface BudgetFit {
  cashUsd: number;
  fits: boolean;
  shortfallUsd: number;
  surplusUsd: number;
}

export interface FloorDecision {
  opportunityId: string;
  showId: string;
  player: string;
  call: FloorCall;
  tablePriceUsd: number | null;
  markUsd: number | null;
  cardId: string | null;
  sport: Sport | null;
  year: number | null;
  setName: string | null;
  costBasisUsd: number | null;
  versusMark: VersusMark;
  decidedAt: string;
}

export interface ShowRecap {
  showId: string;
  buyCount: number;
  passCount: number;
  sellCount: number;
  buySpendUsd: number;
  sellProceedsUsd: number;
  paperGainUsd: number;
  markedBuySpendUsd: number;
  buysMissingMark: number;
  realizedGainUsd: number;
  sellsMissingBasis: number;
  overheadUsd: number;
  netCashUsd: number;
  cashBudgetUsd: number;
  budgetRemainingUsd: number;
  paperRoiPct: number | null;
  disclosure: string;
}

export interface ShowSalePatch {
  status: 'sold';
  salePrice: number;
  saleDate: string;
  realizedGainLoss?: number;
  notes: string;
  pricingRationale: string;
}

const CALLS: ReadonlySet<string> = new Set(['buy', 'pass', 'sell']);
const VERSUS: ReadonlySet<string> = new Set(['under', 'at', 'over', 'unknown']);

export function roundUsd(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function formatTripUsd(value: number): string {
  const rounded = roundUsd(value);
  const abs = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${rounded < 0 ? '-' : ''}$${abs}`;
}

export function parseCashInput(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,]/g, '');
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0) return null;
  return roundUsd(value);
}

function positiveMoney(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value < 0) return null;
  return roundUsd(value);
}

function ceilToTen(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.ceil(value / 10) * 10;
}

export function yearFromText(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

export function leagueForSport(sport: Sport | null): League {
  if (sport === 'Baseball') return 'MLB';
  if (sport === 'Basketball') return 'NBA';
  if (sport === 'Football') return 'NFL';
  return 'Other';
}

export function estimateTravel(distanceMiles: number | null): { usd: number; label: string } {
  if (distanceMiles == null || !Number.isFinite(distanceMiles) || distanceMiles < 0) {
    return { usd: 0, label: 'Distance unknown — travel left at $0' };
  }
  if (distanceMiles <= 30) return { usd: 12, label: 'Local drive (≤30 mi) — parking and gas stub' };
  if (distanceMiles <= 50) return { usd: 25, label: 'Nearby drive (≤50 mi) — parking and gas stub' };
  if (distanceMiles <= 200) return { usd: 70, label: 'Regional drive (≤200 mi) — gas stub' };
  return { usd: 220, label: 'Beyond 200 mi — weekend travel stub, not a fare' };
}

function intentFor(opportunity: ShowBuyOpportunity): TripIntent {
  if (opportunity.kind === 'sell-into-room' || opportunity.kind === 'lot-negotiate') return 'sell';
  if (opportunity.action === 'buy-at-show') return 'buy';
  return 'pack';
}

function norm(value: string): string {
  return value.trim().toLowerCase();
}

export function toTripLine(
  opportunity: ShowBuyOpportunity,
  inventory: CardInventory[],
  targets: TargetWatchlist[] = [],
  fallbackSport: Sport | null = null,
): TripLineItem {
  const card = opportunity.cardId
    ? inventory.find((row) => row.id === opportunity.cardId)
    : inventory.find((row) => row.status !== 'sold' && norm(row.player) === norm(opportunity.player));
  const target = opportunity.targetId
    ? targets.find((row) => row.id === opportunity.targetId)
    : targets.find((row) => norm(row.player) === norm(opportunity.player));
  const year = card?.year ?? yearFromText(opportunity.detail) ?? yearFromText(target?.cardDescription ?? '');
  const mark = positiveMoney(opportunity.consensusMark) ?? positiveMoney(card?.currentValue) ?? positiveMoney(target?.targetPrice);
  return {
    id: opportunity.id,
    player: opportunity.player.trim() || 'Unknown player',
    intent: intentFor(opportunity),
    askUsd: positiveMoney(opportunity.askPrice),
    markUsd: mark,
    cardId: card?.id ?? opportunity.cardId,
    sport: card?.sport ?? target?.sport ?? fallbackSport,
    year,
    setName: card?.set?.trim() || null,
    costBasisUsd: card && Number.isFinite(card.purchasePrice) && card.purchasePrice >= 0
      ? roundUsd(card.purchasePrice)
      : null,
    detail: opportunity.detail,
  };
}

function reserveFor(item: TripLineItem): number | null {
  if (item.intent === 'buy') return item.askUsd ?? item.markUsd;
  if (item.intent === 'sell') return item.markUsd ?? item.askUsd;
  return null;
}

export function buildTripBudget(input: {
  showId: string;
  admissionUsd: number;
  distanceMiles: number | null;
  items: TripLineItem[];
}): TripBudget {
  const admission = positiveMoney(input.admissionUsd) ?? 0;
  const travel = estimateTravel(input.distanceMiles);
  let buyReserve = 0;
  let sellCredit = 0;
  let unpricedBuys = 0;
  let unpricedSells = 0;

  for (const item of input.items) {
    const price = reserveFor(item);
    if (item.intent === 'buy') {
      if (price == null) unpricedBuys += 1;
      else buyReserve = roundUsd(buyReserve + price);
    } else if (item.intent === 'sell') {
      if (price == null) unpricedSells += 1;
      else sellCredit = roundUsd(sellCredit + price);
    }
  }

  const netNeed = roundUsd(Math.max(0, admission + travel.usd + buyReserve - sellCredit));
  const suggested = ceilToTen(Math.max(netNeed, admission));
  const lines: BudgetLine[] = [
    { id: 'admission', label: 'Admission', amountUsd: admission, note: 'Seeded calendar door price.' },
    { id: 'travel', label: 'Travel stub', amountUsd: travel.usd, note: travel.label },
    {
      id: 'buy-reserve',
      label: 'Buy reserve',
      amountUsd: buyReserve,
      note: unpricedBuys > 0
        ? `${unpricedBuys} buy call${unpricedBuys === 1 ? '' : 's'} had no ask or mark and stayed out of the reserve.`
        : 'Sum of buy-at-show asks, or the local mark when the ask is missing.',
    },
    {
      id: 'sell-credit',
      label: 'Sell credit',
      amountUsd: sellCredit,
      note: unpricedSells > 0
        ? `${unpricedSells} sell call${unpricedSells === 1 ? '' : 's'} had no mark and stayed out of the credit. Advisory only.`
        : 'Local marks on cards you might sell into the room. Not a locked offer.',
    },
  ];

  return {
    showId: input.showId,
    lines,
    admissionUsd: admission,
    travelUsd: travel.usd,
    travelLabel: travel.label,
    buyReserveUsd: buyReserve,
    sellCreditUsd: sellCredit,
    unpricedBuys,
    unpricedSells,
    netNeedUsd: netNeed,
    suggestedCashUsd: suggested,
    disclosure: SHOW_TRIP_LOOP_DISCLOSURE,
  };
}

export function assessBudget(netNeedUsd: number, cashUsd: number): BudgetFit {
  const cash = Number.isFinite(cashUsd) && cashUsd >= 0 ? roundUsd(cashUsd) : 0;
  const need = roundUsd(Math.max(0, Number.isFinite(netNeedUsd) ? netNeedUsd : 0));
  const delta = roundUsd(cash - need);
  return {
    cashUsd: cash,
    fits: delta >= 0,
    shortfallUsd: delta < 0 ? roundUsd(-delta) : 0,
    surplusUsd: delta > 0 ? delta : 0,
  };
}

export function versusMark(tableUsd: number | null, markUsd: number | null): VersusMark {
  if (tableUsd == null || markUsd == null || !Number.isFinite(tableUsd) || !Number.isFinite(markUsd)) {
    return 'unknown';
  }
  const delta = roundUsd(tableUsd - markUsd);
  if (Math.abs(delta) < 0.5) return 'at';
  return delta < 0 ? 'under' : 'over';
}

export function allowedCalls(item: TripLineItem): FloorCall[] {
  const calls: FloorCall[] = [];
  if (item.intent !== 'sell') calls.push('buy');
  if (item.intent === 'sell' || item.cardId) calls.push('sell');
  calls.push('pass');
  return calls;
}

export function suggestedTablePrice(item: TripLineItem, call: 'buy' | 'sell'): number | null {
  if (call === 'buy') return item.askUsd ?? item.markUsd;
  return item.markUsd ?? item.costBasisUsd ?? item.askUsd;
}

export function normalizeFloorDecision(input: {
  item: TripLineItem;
  showId: string;
  call: FloorCall;
  tablePriceUsd: number | null;
  now?: string;
}): FloorDecision | null {
  const showId = input.showId.trim();
  const opportunityId = input.item.id.trim();
  if (!showId || !opportunityId) return null;
  if (!allowedCalls(input.item).includes(input.call)) return null;
  const decidedAt = input.now ?? new Date().toISOString();
  if (input.call === 'pass') {
    return {
      opportunityId,
      showId,
      player: input.item.player.trim() || 'Unknown player',
      call: 'pass',
      tablePriceUsd: null,
      markUsd: input.item.markUsd,
      cardId: input.item.cardId,
      sport: input.item.sport,
      year: input.item.year,
      setName: input.item.setName,
      costBasisUsd: input.item.costBasisUsd,
      versusMark: 'unknown',
      decidedAt,
    };
  }
  const price = positiveMoney(input.tablePriceUsd);
  if (price == null) return null;
  return {
    opportunityId,
    showId,
    player: input.item.player.trim() || 'Unknown player',
    call: input.call,
    tablePriceUsd: price,
    markUsd: input.item.markUsd,
    cardId: input.item.cardId,
    sport: input.item.sport,
    year: input.item.year,
    setName: input.item.setName,
    costBasisUsd: input.item.costBasisUsd,
    versusMark: versusMark(price, input.item.markUsd),
    decidedAt,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function isDecision(value: unknown): value is FloorDecision {
  if (!value || typeof value !== 'object') return false;
  const row = value as FloorDecision;
  if (typeof row.opportunityId !== 'string' || row.opportunityId.trim() === '') return false;
  if (typeof row.showId !== 'string' || row.showId.trim() === '') return false;
  if (typeof row.player !== 'string' || row.player.trim() === '') return false;
  if (typeof row.call !== 'string' || !CALLS.has(row.call)) return false;
  if (typeof row.versusMark !== 'string' || !VERSUS.has(row.versusMark)) return false;
  if (typeof row.decidedAt !== 'string' || row.decidedAt.trim() === '') return false;
  if (row.call === 'pass') return row.tablePriceUsd == null;
  return typeof row.tablePriceUsd === 'number' && Number.isFinite(row.tablePriceUsd) && row.tablePriceUsd >= 0;
}

export function readCashBudget(showId: string): number | null {
  const map = asRecord(store.get<unknown>(SHOW_TRIP_CASH_KEY, {}));
  const value = map[showId];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return roundUsd(value);
}

export function saveCashBudget(showId: string, cashUsd: number): number | null {
  const id = showId.trim();
  const cash = positiveMoney(cashUsd);
  if (!id || cash == null) return null;
  const next = asRecord(store.get<unknown>(SHOW_TRIP_CASH_KEY, {}));
  const clean: Record<string, number> = {};
  for (const [key, value] of Object.entries(next)) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) clean[key] = roundUsd(value);
  }
  clean[id] = cash;
  store.set(SHOW_TRIP_CASH_KEY, clean);
  return cash;
}

export function readFloorDecisions(showId?: string): FloorDecision[] {
  const raw = store.get<unknown>(SHOW_TRIP_DECISIONS_KEY, []);
  if (!Array.isArray(raw)) return [];
  const rows = raw.filter(isDecision);
  if (!showId) return rows;
  return rows.filter((row) => row.showId === showId);
}

export function saveFloorDecision(decision: FloorDecision): FloorDecision | null {
  if (!isDecision(decision)) return null;
  const others = readFloorDecisions().filter(
    (row) => !(row.showId === decision.showId && row.opportunityId === decision.opportunityId),
  );
  store.set(SHOW_TRIP_DECISIONS_KEY, [...others, decision]);
  return decision;
}

export function clearFloorDecision(showId: string, opportunityId: string): void {
  const next = readFloorDecisions().filter(
    (row) => !(row.showId === showId && row.opportunityId === opportunityId),
  );
  store.set(SHOW_TRIP_DECISIONS_KEY, next);
}

export function buildShowRecap(input: {
  budget: TripBudget;
  cashUsd: number;
  decisions: FloorDecision[];
}): ShowRecap {
  const decisions = input.decisions.filter((row) => row.showId === input.budget.showId);
  let buySpend = 0;
  let sellProceeds = 0;
  let paperGain = 0;
  let markedBuySpend = 0;
  let buysMissingMark = 0;
  let realized = 0;
  let sellsMissingBasis = 0;
  let buyCount = 0;
  let passCount = 0;
  let sellCount = 0;

  for (const row of decisions) {
    if (row.call === 'pass') {
      passCount += 1;
      continue;
    }
    const price = row.tablePriceUsd ?? 0;
    if (row.call === 'buy') {
      buyCount += 1;
      buySpend = roundUsd(buySpend + price);
      if (row.markUsd == null) buysMissingMark += 1;
      else {
        markedBuySpend = roundUsd(markedBuySpend + price);
        paperGain = roundUsd(paperGain + (row.markUsd - price));
      }
    } else {
      sellCount += 1;
      sellProceeds = roundUsd(sellProceeds + price);
      if (row.costBasisUsd == null) sellsMissingBasis += 1;
      else realized = roundUsd(realized + (price - row.costBasisUsd));
    }
  }

  const overhead = roundUsd(input.budget.admissionUsd + input.budget.travelUsd);
  const netCash = roundUsd(overhead + buySpend - sellProceeds);
  const fit = assessBudget(input.budget.netNeedUsd, input.cashUsd);
  const remaining = roundUsd(fit.cashUsd - netCash);
  const paperRoiPct = markedBuySpend > 0 ? roundUsd((paperGain / markedBuySpend) * 100) : null;

  return {
    showId: input.budget.showId,
    buyCount,
    passCount,
    sellCount,
    buySpendUsd: buySpend,
    sellProceedsUsd: sellProceeds,
    paperGainUsd: paperGain,
    markedBuySpendUsd: markedBuySpend,
    buysMissingMark,
    realizedGainUsd: realized,
    sellsMissingBasis,
    overheadUsd: overhead,
    netCashUsd: netCash,
    cashBudgetUsd: fit.cashUsd,
    budgetRemainingUsd: remaining,
    paperRoiPct,
    disclosure: SHOW_TRIP_LOOP_DISCLOSURE,
  };
}

function yearFromDate(iso: string): number {
  const year = Number(iso.slice(0, 4));
  return year >= 1900 && year <= 2099 ? year : 2026;
}

export function collectionDraftId(showId: string, opportunityId: string): string {
  return `show-floor:${showId}:${opportunityId}`.slice(0, 96);
}

export function buildCollectionDraft(input: {
  decision: FloorDecision;
  showName: string;
  purchaseDate: string;
}): CardInventory | null {
  if (input.decision.call !== 'buy' || input.decision.tablePriceUsd == null || !input.decision.sport) return null;
  const purchaseDate = /^\d{4}-\d{2}-\d{2}/.test(input.purchaseDate)
    ? input.purchaseDate.slice(0, 10)
    : '2026-01-01';
  const year = input.decision.year && input.decision.year >= 1900 && input.decision.year <= 2099
    ? input.decision.year
    : yearFromDate(purchaseDate);
  const showName = input.showName.trim() || 'Local card show';
  return {
    id: collectionDraftId(input.decision.showId, input.decision.opportunityId),
    player: input.decision.player,
    year,
    manufacturer: 'Show purchase',
    cardNumber: '',
    set: input.decision.setName?.trim() || 'Show floor',
    sport: input.decision.sport,
    league: leagueForSport(input.decision.sport),
    isAutographed: false,
    condition: 'Raw',
    isGraded: false,
    purchasePrice: input.decision.tablePriceUsd,
    purchaseDate,
    currentValue: input.decision.markUsd ?? undefined,
    lastValuationDate: purchaseDate,
    pricingRationale: 'Local or demo mark captured on a seeded card-show recap. Not a live sold comp.',
    notes: `Filed from the ${showName} floor log. Seeded show calendar — confirm the card in hand. Not a marketplace fill.`,
    status: 'active',
    taxBasis: input.decision.tablePriceUsd,
  };
}

export function buildSalePatch(input: {
  decision: FloorDecision;
  purchaseDate: string;
  existingNotes?: string;
}): ShowSalePatch | null {
  if (input.decision.call !== 'sell' || input.decision.tablePriceUsd == null || !input.decision.cardId) return null;
  const saleDate = /^\d{4}-\d{2}-\d{2}/.test(input.purchaseDate)
    ? input.purchaseDate.slice(0, 10)
    : '2026-01-01';
  const line = `Show recap ${saleDate}: sold at ${formatTripUsd(input.decision.tablePriceUsd)}. Advisory floor log — not a marketplace settlement.`;
  const prior = input.existingNotes?.trim();
  const patch: ShowSalePatch = {
    status: 'sold',
    salePrice: input.decision.tablePriceUsd,
    saleDate,
    notes: prior ? `${prior} ${line}` : line,
    pricingRationale: 'Sale price is the table number you logged. Not a live marketplace print.',
  };
  if (input.decision.costBasisUsd != null) {
    patch.realizedGainLoss = roundUsd(input.decision.tablePriceUsd - input.decision.costBasisUsd);
  }
  return patch;
}
