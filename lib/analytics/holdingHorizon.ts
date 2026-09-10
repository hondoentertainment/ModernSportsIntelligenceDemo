/**
 * Wash-sale / ST–LT holding-horizon rail (lite).
 * Uses the same day-count heuristic as Fiscal / tax-lot helpers.
 * Advisory only — not broker tax advice or IRS completeness.
 */
import type { CardInventory } from '../../types';

export const HOLDING_HORIZON_DISCLOSURE =
  'Advisory holding-horizon rail. Days held, short-term vs long-term, and 30-day wash-sale proximity are heuristics from local lots — not tax advice or IRS Form 8949 completeness.';

export const WASH_SALE_WINDOW_DAYS = 30;
export const LONG_TERM_DAYS = 365;
const ONE_YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type HorizonTreatment = 'Short-Term' | 'Long-Term';
export type WashSaleProximity = 'clear' | 'watch' | 'restricted';

export interface HoldingHorizonRow {
  cardId: string;
  player: string;
  daysHeld: number;
  treatment: HorizonTreatment;
  daysToLongTerm: number;
  washSaleProximity: WashSaleProximity;
  washSaleDetail: string | null;
}

export interface HoldingHorizonSummary {
  asOf: string;
  active: number;
  shortTerm: number;
  longTerm: number;
  approachingLongTerm: number;
  washSaleWatch: number;
  rows: HoldingHorizonRow[];
  disclosure: string;
}

function parseTime(raw?: string): number | null {
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : null;
}

export function daysHeld(purchaseDate: string, asOf: Date = new Date(), saleDate?: string): number {
  const acquired = parseTime(purchaseDate);
  if (acquired == null) return 0;
  const disposed = saleDate ? parseTime(saleDate) ?? asOf.getTime() : asOf.getTime();
  return Math.max(0, Math.round((disposed - acquired) / DAY_MS));
}

export function holdingTreatment(purchaseDate: string, asOf: Date = new Date(), saleDate?: string): HorizonTreatment {
  const acquired = parseTime(purchaseDate);
  if (acquired == null) return 'Short-Term';
  const disposed = saleDate ? parseTime(saleDate) ?? asOf.getTime() : asOf.getTime();
  return disposed - acquired >= ONE_YEAR_MS ? 'Long-Term' : 'Short-Term';
}

export function daysToLongTerm(purchaseDate: string, asOf: Date = new Date()): number {
  const held = daysHeld(purchaseDate, asOf);
  return Math.max(0, LONG_TERM_DAYS - held);
}

function identityHint(card: CardInventory): string {
  return [card.player, card.year, card.set, card.cardNumber]
    .map((v) => String(v ?? '').trim().toLowerCase())
    .join('|');
}

function playerKey(card: CardInventory): string {
  return String(card.player ?? '').trim().toLowerCase();
}

export function isSoldLotLoss(card: CardInventory): boolean {
  if (typeof card.realizedGainLoss === 'number' && Number.isFinite(card.realizedGainLoss)) {
    return card.realizedGainLoss < 0;
  }
  const proceeds = card.salePrice;
  const basis = card.purchasePrice;
  if (typeof proceeds !== 'number' || typeof basis !== 'number') return false;
  if (!Number.isFinite(proceeds) || !Number.isFinite(basis)) return false;
  return proceeds < basis;
}

function washProximityForActive(
  card: CardInventory,
  sold: CardInventory[],
): { proximity: WashSaleProximity; detail: string | null } {
  const windowMs = WASH_SALE_WINDOW_DAYS * DAY_MS;
  const acquired = parseTime(card.purchaseDate);
  if (acquired == null) return { proximity: 'clear', detail: null };
  const selfKey = identityHint(card);
  const selfPlayer = playerKey(card);

  let closestDays: number | null = null;
  let closestPlayer = '';
  for (const lot of sold) {
    const soldAt = parseTime(lot.saleDate);
    if (soldAt == null) continue;
    const delta = Math.abs(acquired - soldAt);
    if (delta > windowMs) continue;
    const sameIdentity = identityHint(lot) === selfKey;
    const samePlayer = playerKey(lot) === selfPlayer && selfPlayer.length > 0;
    if (!sameIdentity && !samePlayer) continue;
    const days = Math.round(delta / DAY_MS);
    if (closestDays == null || days < closestDays) {
      closestDays = days;
      closestPlayer = lot.player;
    }
    if (sameIdentity) {
      return {
        proximity: 'restricted',
        detail: `Recent sale of the same lot is within the ${WASH_SALE_WINDOW_DAYS}-day wash-sale window (${days}d).`,
      };
    }
  }

  if (closestDays != null) {
    return {
      proximity: 'watch',
      detail: `Recent ${closestPlayer} sale is ${closestDays}d away — repurchase proximity warning (heuristic).`,
    };
  }
  return { proximity: 'clear', detail: null };
}

export function analyzeHoldingHorizon(
  inventory: CardInventory[],
  asOf: Date = new Date(),
): HoldingHorizonSummary {
  const sold = inventory.filter(
    (card) => card.status === 'sold' && Boolean(card.saleDate) && isSoldLotLoss(card),
  );
  const active = inventory.filter((card) => card.status !== 'sold');

  const rows = active
    .filter((card) => Boolean(card.purchaseDate))
    .map((card) => {
      const held = daysHeld(card.purchaseDate, asOf);
      const treatment = holdingTreatment(card.purchaseDate, asOf);
      const wash = washProximityForActive(card, sold);
      return {
        cardId: card.id,
        player: card.player,
        daysHeld: held,
        treatment,
        daysToLongTerm: daysToLongTerm(card.purchaseDate, asOf),
        washSaleProximity: wash.proximity,
        washSaleDetail: wash.detail,
      };
    })
    .sort((a, b) => {
      const rank = { restricted: 0, watch: 1, clear: 2 };
      const washDelta = rank[a.washSaleProximity] - rank[b.washSaleProximity];
      if (washDelta !== 0) return washDelta;
      return a.daysToLongTerm - b.daysToLongTerm;
    });

  return {
    asOf: asOf.toISOString(),
    active: rows.length,
    shortTerm: rows.filter((row) => row.treatment === 'Short-Term').length,
    longTerm: rows.filter((row) => row.treatment === 'Long-Term').length,
    approachingLongTerm: rows.filter((row) => row.treatment === 'Short-Term' && row.daysToLongTerm <= 45).length,
    washSaleWatch: rows.filter((row) => row.washSaleProximity !== 'clear').length,
    rows,
    disclosure: HOLDING_HORIZON_DISCLOSURE,
  };
}
