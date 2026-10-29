/**
 * Bought and sold at one seeded show, from the floor log and table notes.
 * Average position is how far the price sits from that card's low toward
 * its high. Left on the list are shopping lines not checked off and not
 * already bought or sold. Not a settlement and not a live tape.
 */
import type { SaleRange } from './saleRange';
import { rangeSeat } from './saleRange';
import { paidOnNote } from './showClose';
import { boughtLotShares, isLot } from './tableLot';

export const SHOW_DAY_RECAP_NOTE =
  'Bought and sold from the floor log and table notes at this seeded show. Average position is how far the price sits from that card\'s low toward its high. Left on the list are shopping lines you have not checked off and have not already bought or sold. Not a settlement and not a live tape.';

export interface RecapFill {
  id: string;
  player: string;
  usd: number;
  range: SaleRange | null;
}

export interface RecapLine {
  id: string;
  side: 'buy' | 'sell';
  player: string;
  usd: number | null;
  checked: boolean;
}

export interface RecapNote {
  id: string;
  result: string;
  askUsd: number;
  offerUsd: number;
  player?: string;
  cardId?: string;
  lines?: readonly { player?: string; cardId?: string; askUsd?: number }[];
}

export interface RecapDecision {
  opportunityId: string;
  player: string;
  call: string;
  tablePriceUsd: number | null;
  cardId: string | null;
}

export interface ShowDayRecap {
  buyCount: number;
  buyUsd: number;
  sellCount: number;
  sellUsd: number;
  positioned: number;
  offRange: number;
  average: number | null;
  under: number;
  inside: number;
  over: number;
  left: RecapLine[];
  copy: string;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function norm(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function playerName(value: string | undefined): string {
  const name = value?.trim() ?? '';
  return name || 'Card';
}

const EMPTY_RANGE: SaleRange = { source: 'none', low: null, median: null, high: null, count: 0 };

function position(usd: number, range: SaleRange): number | null {
  if (range.source === 'none' || range.low == null || range.high == null) return null;
  const span = range.high - range.low;
  if (span <= 0.001) {
    if (usd < range.low - 0.001) return 0;
    if (usd > range.high + 0.001) return 1;
    return 0.5;
  }
  return (usd - range.low) / span;
}

function nameList(rows: readonly { player: string }[]): string {
  if (rows.length === 0) return '';
  const shown = rows.slice(0, 4).map((row) => playerName(row.player));
  const more = rows.length - shown.length;
  return ` (${shown.join(', ')}${more > 0 ? `, and ${more} more` : ''})`;
}

function percent(average: number): string {
  const pct = Math.round(average * 1000) / 10;
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

function leftCopy(left: readonly RecapLine[]): string {
  if (left.length === 0) return 'Nothing left on the shopping list.';
  const shown = left.slice(0, 4).map((line) => `${playerName(line.player)} ${line.side}`);
  const more = left.length - shown.length;
  const extra = more > 0 ? `, and ${more} more` : '';
  return `Left on the list: ${shown.join(', ')}${extra}.`;
}

export function showDayRecap(input: {
  buys: readonly RecapFill[];
  sells: readonly RecapFill[];
  lines: readonly RecapLine[];
}): ShowDayRecap {
  const bought = new Set(input.buys.map((row) => norm(row.player)).filter(Boolean));
  const sold = new Set(input.sells.map((row) => norm(row.player)).filter(Boolean));
  const left = input.lines.filter((line) => {
    if (line.checked) return false;
    const name = norm(line.player);
    if (!name) return true;
    if (line.side === 'buy' && bought.has(name)) return false;
    if (line.side === 'sell' && sold.has(name)) return false;
    return true;
  });
  let buyUsd = 0;
  let sellUsd = 0;
  let positioned = 0;
  let offRange = 0;
  let under = 0;
  let inside = 0;
  let over = 0;
  let positionSum = 0;
  const place = (fill: RecapFill) => {
    const range = fill.range ?? EMPTY_RANGE;
    const seat = rangeSeat(fill.usd, range);
    const spot = position(fill.usd, range);
    if (seat === 'no range' || seat === 'no price' || spot == null) {
      offRange += 1;
      return;
    }
    positioned += 1;
    positionSum += spot;
    if (seat === 'under low') under += 1;
    else if (seat === 'over high') over += 1;
    else inside += 1;
  };
  for (const fill of input.buys) {
    buyUsd = cents(buyUsd + fill.usd);
    place(fill);
  }
  for (const fill of input.sells) {
    sellUsd = cents(sellUsd + fill.usd);
    place(fill);
  }
  const average = positioned > 0 ? positionSum / positioned : null;
  const seats: string[] = [];
  if (under > 0) seats.push(`${under} under the low`);
  if (inside > 0) seats.push(`${inside} inside`);
  if (over > 0) seats.push(`${over} over the high`);
  const seatSentence = average == null
    ? 'No bought or sold price sits on a sale range.'
    : `Average position is ${percent(average)} of the way from the low to the high across ${positioned} ${positioned === 1 ? 'card' : 'cards'} (${seats.join(', ')}).`;
  const offSentence = offRange > 0
    ? ` ${offRange} ${offRange === 1 ? 'price stays' : 'prices stay'} off the range.`
    : '';
  const copy = `Bought ${input.buys.length} for ${money(buyUsd)}${nameList(input.buys)}. Sold ${input.sells.length} for ${money(sellUsd)}${nameList(input.sells)}. ${seatSentence}${offSentence} ${leftCopy(left)} Not a settlement and not a live tape.`;
  return {
    buyCount: input.buys.length,
    buyUsd,
    sellCount: input.sells.length,
    sellUsd,
    positioned,
    offRange,
    average,
    under,
    inside,
    over,
    left,
    copy,
  };
}

export function recapFills(input: {
  notes: readonly RecapNote[];
  decisions: readonly RecapDecision[];
  rangeForId: (id: string) => SaleRange | null;
}): { buys: RecapFill[]; sells: RecapFill[] } {
  const buys: RecapFill[] = [];
  const sells: RecapFill[] = [];
  for (const note of input.notes) {
    if (note.result !== 'bought') continue;
    if (isLot(note)) {
      const shares = boughtLotShares(note);
      if (!shares) {
        const paid = paidOnNote(note);
        if (!paid) continue;
        buys.push({
          id: note.id,
          player: playerName(note.player),
          usd: paid.usd,
          range: null,
        });
        continue;
      }
      (note.lines ?? []).forEach((line, index) => {
        const usd = shares[index];
        if (usd == null || !(usd > 0)) return;
        buys.push({
          id: `${note.id}:${index}`,
          player: playerName(line.player),
          usd,
          range: line.cardId ? input.rangeForId(line.cardId) : null,
        });
      });
      continue;
    }
    const paid = paidOnNote(note);
    if (!paid) continue;
    buys.push({
      id: note.id,
      player: playerName(note.player),
      usd: paid.usd,
      range: note.cardId ? input.rangeForId(note.cardId) : null,
    });
  }
  for (const decision of input.decisions) {
    if (decision.call !== 'buy' && decision.call !== 'sell') continue;
    if (decision.tablePriceUsd == null || !(decision.tablePriceUsd > 0)) continue;
    const fill: RecapFill = {
      id: decision.opportunityId,
      player: playerName(decision.player),
      usd: cents(decision.tablePriceUsd),
      range: decision.cardId ? input.rangeForId(decision.cardId) : null,
    };
    if (decision.call === 'buy') buys.push(fill);
    else sells.push(fill);
  }
  return { buys, sells };
}

export function buildShowDayRecap(input: {
  notes: readonly RecapNote[];
  decisions: readonly RecapDecision[];
  lines: readonly RecapLine[];
  rangeForId: (id: string) => SaleRange | null;
}): ShowDayRecap {
  const fills = recapFills(input);
  return showDayRecap({ buys: fills.buys, sells: fills.sells, lines: input.lines });
}
