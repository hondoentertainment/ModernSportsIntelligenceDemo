/**
 * Thin P2P intent board — bids/asks as local advisory intents.
 * Not an order book, not matching, not escrow, not MSI-house inventory.
 */
import { store } from '../dal/syncStore';
import type { CardInventory } from '../../types';

export const P2P_INTENT_BOARD_KEY = 'msi_p2p_intents_v1';

export const P2P_INTENT_DISCLOSURE =
  'Advisory intent board only — not live trading, not a P2P exchange, and not order matching or escrow. MSI does not take inventory.';

export const MAX_OPEN_INTENTS = 40;

export type IntentSide = 'bid' | 'ask';
export type IntentStatus = 'open' | 'withdrawn';
export type IntentSource = 'local_inventory' | 'manual';

export interface P2PIntent {
  id: string;
  side: IntentSide;
  player: string;
  cardId: string | null;
  year: number | null;
  manufacturer: string | null;
  set: string | null;
  limitPrice: number;
  note: string;
  createdAt: string;
  status: IntentStatus;
  source: IntentSource;
  advisoryOnly: true;
}

export interface PostIntentInput {
  side: IntentSide;
  player?: string;
  cardId?: string | null;
  year?: number | null;
  manufacturer?: string | null;
  set?: string | null;
  limitPrice: number;
  note?: string;
  source?: IntentSource;
}

export interface IntentBoardSummary {
  openBids: number;
  openAsks: number;
  totalOpen: number;
}

function cardValue(card: CardInventory): number {
  return card.currentValue || card.purchasePrice || 0;
}

function isHeld(card: CardInventory): boolean {
  return card.status !== 'sold';
}

function trimText(value: unknown, max = 160): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function asSide(value: unknown): IntentSide | null {
  return value === 'bid' || value === 'ask' ? value : null;
}

function asStatus(value: unknown): IntentStatus {
  return value === 'withdrawn' ? 'withdrawn' : 'open';
}

function asSource(value: unknown): IntentSource {
  return value === 'manual' ? 'manual' : 'local_inventory';
}

function asPositivePrice(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function asYear(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 1869 || n > 2100) return null;
  return Math.round(n);
}

function newIntentId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `intent-${crypto.randomUUID()}`;
  }
  return `intent-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePlayerKey(player: string): string {
  return player.trim().toLowerCase();
}

function heldCard(inventory: CardInventory[] | undefined, cardId: string | null | undefined): CardInventory | null {
  if (!cardId || !inventory) return null;
  return inventory.find((c) => c.id === cardId && isHeld(c)) ?? null;
}

export function normalizeIntent(raw: unknown): P2PIntent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<P2PIntent>;
  const side = asSide(o.side);
  const player = trimText(o.player, 80);
  const limitPrice = asPositivePrice(o.limitPrice);
  if (!side || !player || limitPrice == null) return null;
  const cardId = trimText(o.cardId, 80) || null;
  return {
    id: trimText(o.id, 80) || newIntentId(),
    side,
    player,
    cardId,
    year: asYear(o.year),
    manufacturer: trimText(o.manufacturer, 80) || null,
    set: trimText(o.set, 80) || null,
    limitPrice,
    note: trimText(o.note, 200),
    createdAt: typeof o.createdAt === 'string' && o.createdAt ? o.createdAt : new Date().toISOString(),
    status: asStatus(o.status),
    source: asSource(o.source),
    advisoryOnly: true,
  };
}

export function normalizeIntents(raw: unknown): P2PIntent[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: P2PIntent[] = [];
  for (const row of raw) {
    const intent = normalizeIntent(row);
    if (!intent || seen.has(intent.id)) continue;
    seen.add(intent.id);
    out.push(intent);
  }
  return out;
}

export function listIntents(): P2PIntent[] {
  return normalizeIntents(store.get<unknown>(P2P_INTENT_BOARD_KEY, []));
}

export function listOpenIntents(): P2PIntent[] {
  return listIntents().filter((intent) => intent.status === 'open');
}

export function summarizeIntentBoard(intents: P2PIntent[] = listIntents()): IntentBoardSummary {
  const open = intents.filter((intent) => intent.status === 'open');
  const openBids = open.filter((intent) => intent.side === 'bid').length;
  const openAsks = open.filter((intent) => intent.side === 'ask').length;
  return { openBids, openAsks, totalOpen: open.length };
}

export function suggestAskFromCard(card: CardInventory): PostIntentInput {
  return {
    side: 'ask',
    player: card.player,
    cardId: card.id,
    year: card.year,
    manufacturer: card.manufacturer,
    set: card.set,
    limitPrice: cardValue(card) || 1,
    source: 'local_inventory',
  };
}

function persist(intents: P2PIntent[]): P2PIntent[] {
  store.set(P2P_INTENT_BOARD_KEY, intents);
  return intents;
}

export function postIntent(input: PostIntentInput, inventory: CardInventory[] = []): P2PIntent {
  const side = asSide(input.side);
  if (!side) {
    throw new Error('Intent side must be bid or ask.');
  }

  const card = heldCard(inventory, input.cardId);
  if (side === 'ask' && !card) {
    throw new Error('Sell intents must use a held local inventory card.');
  }

  const player = trimText(card?.player ?? input.player, 80);
  const limitPrice = asPositivePrice(input.limitPrice);
  if (!player) {
    throw new Error('Player name is required.');
  }
  if (limitPrice == null) {
    throw new Error('Limit price must be a positive number.');
  }

  const draft: P2PIntent = {
    id: newIntentId(),
    side,
    player,
    cardId: card?.id ?? (trimText(input.cardId, 80) || null),
    year: asYear(card?.year ?? input.year),
    manufacturer: trimText(card?.manufacturer ?? input.manufacturer, 80) || null,
    set: trimText(card?.set ?? input.set, 80) || null,
    limitPrice,
    note: trimText(input.note, 200),
    createdAt: new Date().toISOString(),
    status: 'open',
    source: card ? 'local_inventory' : asSource(input.source ?? (input.cardId ? 'local_inventory' : 'manual')),
    advisoryOnly: true,
  };

  const current = listIntents();
  const open = current.filter((intent) => intent.status === 'open');
  const duplicate = open.find((intent) => {
    if (intent.side !== draft.side) return false;
    if (draft.side === 'ask' && draft.cardId) return intent.cardId === draft.cardId;
    return normalizePlayerKey(intent.player) === normalizePlayerKey(draft.player);
  });

  if (duplicate) {
    const updated: P2PIntent = {
      ...duplicate,
      ...draft,
      id: duplicate.id,
      createdAt: duplicate.createdAt,
    };
    return persist(current.map((intent) => (intent.id === duplicate.id ? updated : intent))).find((i) => i.id === duplicate.id)!;
  }

  if (open.length >= MAX_OPEN_INTENTS) {
    throw new Error(`At most ${MAX_OPEN_INTENTS} open intents can be posted in this demo board.`);
  }

  persist([draft, ...current]);
  return draft;
}

export function withdrawIntent(id: string): P2PIntent | null {
  const current = listIntents();
  const target = current.find((intent) => intent.id === id);
  if (!target || target.status === 'withdrawn') return target ?? null;
  const next: P2PIntent = { ...target, status: 'withdrawn' };
  persist(current.map((intent) => (intent.id === id ? next : intent)));
  return next;
}

export function intentBoardDisclaimer(): string {
  return P2P_INTENT_DISCLOSURE;
}
