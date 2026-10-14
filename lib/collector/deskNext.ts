/**
 * Local collector desk: show-day checks, comps snapshot, trade balance,
 * box location, and a demo weekly recap. No live tape.
 */
import type { CardInventory } from '../../types';
import { store } from '../dal/syncStore';

export const DESK_NOTE = 'Demo local book. Not a live tape.';

const DAY_KEY = 'msi_show_day_v1';
const PLACE_KEY = 'msi_card_place_v1';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type Place = 'binder' | 'box' | 'slab';
export type PlaceFilter = Place | 'all';

export interface DayLine {
  id: string;
  side: 'buy' | 'sell';
  player: string;
  usd: number | null;
}

export interface TradeSide {
  id: string;
  player: string;
  usd: number;
}

export interface CompsSnapshot {
  source: 'comps' | 'demo' | 'none';
  points: number[];
  median: number | null;
}

interface SaleLike {
  price: number;
  totalPrice?: number;
  soldAt?: string;
}

export function markOf(card: { currentValue?: number; purchasePrice?: number }): number {
  if (typeof card.currentValue === 'number' && Number.isFinite(card.currentValue)) return card.currentValue;
  return card.purchasePrice ?? 0;
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return roundUsd(value);
}

export function dayLeft(cashUsd: number | null, openBuyUsd: number): number | null {
  if (cashUsd == null || !Number.isFinite(cashUsd)) return null;
  return roundUsd(cashUsd - openBuyUsd);
}

export function readChecked(showId: string): string[] {
  const map = store.get<Record<string, string[]>>(DAY_KEY, {});
  const rows = map?.[showId];
  return Array.isArray(rows) ? rows.filter((id) => typeof id === 'string').slice(0, 80) : [];
}

export function writeChecked(showId: string, ids: string[]): string[] {
  const map = store.get<Record<string, string[]>>(DAY_KEY, {});
  const next = Array.isArray(ids) ? ids.filter((id) => typeof id === 'string').slice(0, 80) : [];
  store.set(DAY_KEY, { ...(map ?? {}), [showId]: next });
  return next;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function compsSnapshot(
  card: { id: string; currentValue?: number; purchasePrice?: number; salesData?: readonly SaleLike[] },
  limit = 6,
): CompsSnapshot {
  const real = (card.salesData ?? [])
    .map((sale) => ({
      price: typeof sale.totalPrice === 'number' && sale.totalPrice > 0 ? sale.totalPrice : sale.price,
      soldAt: sale.soldAt ?? '',
    }))
    .filter((sale) => sale.price > 0 && sale.soldAt)
    .sort((a, b) => a.soldAt.localeCompare(b.soldAt))
    .slice(-limit)
    .map((sale) => sale.price);
  if (real.length > 0) return { source: 'comps', points: real, median: median(real) };
  const base = markOf(card);
  if (!(base > 0)) return { source: 'none', points: [], median: null };
  let h = hash(card.id || 'card');
  const points: number[] = [];
  for (let i = 0; i < limit; i += 1) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    points.push(Math.max(1, Math.round(base * (1 + ((h % 21) - 10) / 100))));
  }
  return { source: 'demo', points, median: median(points) };
}

export function tradeFairness(give: TradeSide[], receive: TradeSide[], cashUsd: number): {
  giveUsd: number;
  receiveUsd: number;
  net: number;
  gapPct: number;
  call: 'fair' | 'you ahead' | 'you short';
} {
  const giveUsd = roundUsd(give.reduce((sum, row) => sum + row.usd, 0));
  const receiveUsd = roundUsd(receive.reduce((sum, row) => sum + row.usd, 0));
  const cash = Number.isFinite(cashUsd) ? cashUsd : 0;
  const net = roundUsd(receiveUsd - giveUsd - cash);
  const base = Math.max(giveUsd + Math.max(cash, 0), receiveUsd, 1);
  const gapPct = Math.round((net / base) * 1000) / 10;
  const call = Math.abs(gapPct) <= 5 ? 'fair' : net > 0 ? 'you ahead' : 'you short';
  return { giveUsd, receiveUsd, net, gapPct, call };
}

export function readPlaces(): Record<string, Place> {
  const raw = store.get<Record<string, string>>(PLACE_KEY, {});
  const places: Record<string, Place> = {};
  if (!raw || typeof raw !== 'object') return places;
  for (const [id, place] of Object.entries(raw)) {
    if (place === 'binder' || place === 'box' || place === 'slab') places[id] = place;
  }
  return places;
}

export function setPlace(cardId: string, place: Place | ''): Record<string, Place> {
  const next = readPlaces();
  if (place === 'binder' || place === 'box' || place === 'slab') next[cardId] = place;
  else delete next[cardId];
  store.set(PLACE_KEY, next);
  return next;
}

export function filterByPlace<T extends { id: string }>(cards: T[], places: Record<string, Place>, place: PlaceFilter): T[] {
  if (place === 'all') return cards;
  return cards.filter((card) => places[card.id] === place);
}

export interface WeeklyRecap {
  nowUsd: number;
  deltaUsd: number;
  buyCount: number;
  buyUsd: number;
  sellCount: number;
  sellUsd: number;
  movers: { id: string; player: string; delta: number }[];
}

export function weeklyRecap(cards: CardInventory[], now = Date.now()): WeeklyRecap {
  const held = cards.filter((card) => card.status !== 'sold' && card.status !== 'consignment');
  let nowUsd = 0;
  let thenUsd = 0;
  const movers: WeeklyRecap['movers'] = [];
  for (const card of held) {
    const mark = markOf(card);
    const cost = card.purchasePrice || 0;
    const start = Date.parse(card.purchaseDate);
    nowUsd += mark;
    let past = mark;
    if (Number.isFinite(start)) {
      if (start >= now - WEEK_MS) past = 0;
      else {
        const span = now - start;
        const t = span <= 0 ? 1 : Math.max(0, (now - WEEK_MS - start) / span);
        past = cost + (mark - cost) * t;
      }
    }
    thenUsd += past;
    movers.push({ id: card.id, player: card.player, delta: Math.round(mark - past) });
  }
  const inWeek = (iso: string | undefined) => {
    const t = Date.parse(iso || '');
    return Number.isFinite(t) && t >= now - WEEK_MS && t <= now;
  };
  const buys = cards.filter((card) => card.status !== 'sold' && inWeek(card.purchaseDate));
  const sells = cards.filter((card) => card.status === 'sold' && inWeek(card.saleDate));
  movers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return {
    nowUsd: Math.round(nowUsd),
    deltaUsd: Math.round(nowUsd - thenUsd),
    buyCount: buys.length,
    buyUsd: Math.round(buys.reduce((sum, card) => sum + (card.purchasePrice || 0), 0)),
    sellCount: sells.length,
    sellUsd: Math.round(sells.reduce((sum, card) => sum + (card.salePrice || 0), 0)),
    movers: movers.slice(0, 3),
  };
}
