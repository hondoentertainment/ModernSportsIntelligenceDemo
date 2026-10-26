/**
 * Three numbers from the sale range already on the card.
 * Buying: open at the low, fair at the median, walk at the high.
 * A target the collector already set can pull the walk down.
 * Cash still left before that buy, cheapest first, can cap the walk.
 * Selling: ask the high, take the median, pass under the low.
 * Stored sold comps when present. Otherwise the same demo sketch.
 * Not a dealer quote and not a live tape.
 */
import type { SaleRange } from './saleRange';

export const OFFER_LADDER_NOTE =
  'Open at the low, fair at the median, walk at the high. A target you already set can pull the walk down. Not a dealer quote and not a live tape.';

export const OFFER_LADDER_CASH_NOTE =
  'Cash still left before that buy, cheapest first, can cap the walk. Cash or a target under the low is not an offer.';

export const SELL_LADDER_NOTE =
  'Ask the high, take the median, pass under the low. Cost on the sell planner is the all-in basis already on that row. Not a dealer bid and not a live tape.';

export type WalkFrom = 'high' | 'target' | 'cash';
export type BuyBlock = 'target' | 'cash' | 'both';
export type CostSeat = 'over high' | 'over low';

export interface BuyLadder {
  source: 'comps' | 'demo';
  open: number;
  fair: number;
  walk: number;
  walkFrom: WalkFrom;
  medianAboveWalk: boolean;
  blocked: BuyBlock | null;
  low: number;
  targetUsd: number | null;
  cashUsd: number | null;
}

export interface SellLadder {
  source: 'comps' | 'demo';
  ask: number;
  take: number;
  passUnder: number;
  costUsd: number | null;
  costSeat: CostSeat | null;
}

export interface LadderCaps {
  targetUsd?: number | null;
  cashUsd?: number | null;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  const rounded = cents(value);
  return `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function positive(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return cents(value);
}

function cashOrNull(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return cents(value);
}

function band(source: 'comps' | 'demo'): string {
  return source === 'comps' ? 'sold comps' : 'demo sales';
}

function usable(range: SaleRange): range is SaleRange & {
  source: 'comps' | 'demo';
  low: number;
  median: number;
  high: number;
} {
  return range.source !== 'none' && range.low != null && range.median != null && range.high != null;
}

export function buyLadder(range: SaleRange, caps: LadderCaps = {}): BuyLadder | null {
  if (!usable(range)) return null;
  const low = cents(range.low);
  const median = cents(range.median);
  const high = cents(range.high);
  const target = positive(caps.targetUsd);
  const cash = cashOrNull(caps.cashUsd);
  const targetUnder = target != null && target < low;
  const cashUnder = cash != null && cash < low;
  let blocked: BuyBlock | null = null;
  if (targetUnder && cashUnder) blocked = 'both';
  else if (targetUnder) blocked = 'target';
  else if (cashUnder) blocked = 'cash';

  let walk = high;
  let walkFrom: WalkFrom = 'high';
  if (!blocked && target != null && target < walk) {
    walk = cents(target);
    walkFrom = 'target';
  }
  if (!blocked && cash != null && cash < walk) {
    walk = cents(cash);
    walkFrom = 'cash';
  }
  const fair = cents(Math.min(median, walk));
  return {
    source: range.source,
    open: low,
    fair,
    walk,
    walkFrom,
    medianAboveWalk: median > walk + 0.001,
    blocked,
    low,
    targetUsd: target,
    cashUsd: cash,
  };
}

export function buyLadderCopy(ladder: BuyLadder | null): string | null {
  if (ladder == null) return null;
  const where = band(ladder.source);
  if (ladder.blocked === 'both' && ladder.targetUsd != null && ladder.cashUsd != null) {
    return `Your target ${money(ladder.targetUsd)} and cash left ${money(ladder.cashUsd)} are under the low of ${where} (${money(ladder.low)}). No offer inside that range.`;
  }
  if (ladder.blocked === 'target' && ladder.targetUsd != null) {
    return `Your target ${money(ladder.targetUsd)} is under the low of ${where} (${money(ladder.low)}). No offer inside that range.`;
  }
  if (ladder.blocked === 'cash' && ladder.cashUsd != null) {
    return `Cash left ${money(ladder.cashUsd)} is under the low of ${where} (${money(ladder.low)}). No offer inside that range.`;
  }
  if (ladder.blocked) return null;
  const walkNote = ladder.walkFrom === 'target'
    ? ' Walk is the target you set.'
    : ladder.walkFrom === 'cash'
      ? ladder.medianAboveWalk
        ? ' Walk is the cash left, under the median.'
        : ' Walk is the cash left.'
      : '';
  return `Open ${money(ladder.open)}, fair ${money(ladder.fair)}, walk ${money(ladder.walk)} on ${where}.${walkNote}`;
}

export function sellLadder(range: SaleRange, costUsd?: number | null): SellLadder | null {
  if (!usable(range)) return null;
  const low = cents(range.low);
  const high = cents(range.high);
  const cost = positive(costUsd);
  let costSeat: CostSeat | null = null;
  if (cost != null && cost > high) costSeat = 'over high';
  else if (cost != null && cost > low) costSeat = 'over low';
  return {
    source: range.source,
    ask: high,
    take: cents(range.median),
    passUnder: low,
    costUsd: cost,
    costSeat,
  };
}

export function sellLadderCopy(ladder: SellLadder | null): string | null {
  if (ladder == null) return null;
  let costNote = '';
  if (ladder.costUsd != null && ladder.costSeat === 'over high') {
    costNote = ` Cost ${money(ladder.costUsd)} is over the high.`;
  } else if (ladder.costUsd != null && ladder.costSeat === 'over low') {
    costNote = ` Cost ${money(ladder.costUsd)} is over the low.`;
  }
  return `Ask ${money(ladder.ask)}, take ${money(ladder.take)}, pass under ${money(ladder.passUnder)} on ${band(ladder.source)}.${costNote}`;
}

export function ladderCashRoom(
  lines: readonly { id: string; usd: number | null }[],
  cashUsd: number | null,
): Record<string, number | null> {
  const room: Record<string, number | null> = {};
  const cash = cashOrNull(cashUsd);
  if (cash == null) {
    for (const line of lines) room[line.id] = null;
    return room;
  }
  const priced: { id: string; usd: number }[] = [];
  for (const line of lines) {
    if (line.usd == null || !Number.isFinite(line.usd) || line.usd < 0) {
      room[line.id] = null;
      continue;
    }
    priced.push({ id: line.id, usd: cents(line.usd) });
  }
  priced.sort((a, b) => a.usd - b.usd || a.id.localeCompare(b.id));
  let left = cash;
  for (const line of priced) {
    room[line.id] = left;
    if (line.usd <= left + 1e-9) left = cents(left - line.usd);
  }
  return room;
}

export function shopLadderCopy(input: {
  side: 'buy' | 'sell';
  kind: string;
  range: SaleRange | null;
  targetUsd?: number | null;
  cashUsd?: number | null;
}): string | null {
  if (input.kind === 'set-hole' || input.range == null) return null;
  if (input.side === 'sell') return sellLadderCopy(sellLadder(input.range));
  return buyLadderCopy(buyLadder(input.range, {
    targetUsd: input.targetUsd,
    cashUsd: input.cashUsd,
  }));
}
