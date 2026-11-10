/**
 * Which unsold card to sell first when the table needs cash.
 * Under and clear come off before a hold, because waiting keeps
 * nothing more. A hold breaks from the smallest dollars kept, the
 * same difference hold worth already prices after the ~4% card-show
 * fee. The line is the UTC day that hold crosses into long-term.
 * The eBay fee stays off this desk. Not a tax determination and not
 * a live tape.
 */
import { store } from '../dal/syncStore';
import { haggleSnapshot } from '../shows/showHaggleLog';
import { readFloorDecisions } from '../shows/showTripLoop';
import type { ShowHoldCall } from './holdingBuckets';
import { gainWorth } from './holdWorth';
import type { HoldTreatment } from './inventoryAge';
import { exitMath } from './showExit';
import { showPnl, type PnlBookCard } from './showPnl';

export const HOLD_QUEUE_CASH_KEY = 'msi_hold_queue_cash_need';

export const HOLD_QUEUE_NOTE =
  'Hold queue names which unsold card to sell first when the table needs cash. Under and clear come off before a hold, because waiting keeps nothing more. A hold breaks from the smallest dollars kept, the same 35% versus 20% difference after the ~4% card-show fee. The line is the UTC day that hold crosses the 365-day line, and the daily figure is those dollars divided by the days left. Cash is the stored mark after that fee. A typed need on this browser takes whole cards until the cash is covered and names what that gives up. A blank amount lists the order. A need of $0 takes no card. A card that raises nothing does not cover the need. A missing mark, a buy that is not filed, and a short-term gain more than 45 days from the line stay off. A price you have not recorded yet stays on the show exit. Not a tax determination, not the eBay fee, and not a live tape.';

const NAME_LIMIT = 4;
const CASH_CAP = 1_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const CALL_RANK: Record<ShowHoldCall, number> = { under: 0, clear: 1, hold: 2 };

export interface HoldQueueSource {
  id: string;
  player: string;
  holdCall?: ShowHoldCall | null;
  treatment?: HoldTreatment | null;
  daysToLongTerm?: number | null;
  holdMarkUsd?: number | null;
  holdRealizedUsd?: number | null;
}

export interface HoldQueueRow {
  id: string;
  player: string;
  call: ShowHoldCall;
  cashUsd: number;
  keptUsd: number;
  daysToLongTerm: number | null;
  lineOn: string | null;
  perDayUsd: number | null;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function playerName(player: string): string {
  const trimmed = player.trim();
  return trimmed || 'Unsold card';
}

export function parseCashNeed(raw: string): number | null {
  const trimmed = raw.trim().replace(/[$,]/g, '');
  if (!trimmed || !/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value > CASH_CAP) return null;
  return cents(value);
}

export function readHoldQueueNeed(): number | null {
  const value = store.get<unknown>(HOLD_QUEUE_CASH_KEY, null);
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > CASH_CAP) return null;
  return cents(value);
}

export function cashNeedDraft(value: number | null): string {
  return value == null ? '' : String(value);
}

function asOf(now?: number): number {
  return typeof now === 'number' && Number.isFinite(now) ? now : Date.now();
}

function lineOn(now: number, days: number): string {
  const today = new Date(now).toISOString().slice(0, 10);
  const start = Date.parse(`${today}T00:00:00.000Z`);
  return new Date(start + days * DAY_MS).toISOString().slice(0, 10);
}

function finiteMark(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null;
  return cents(value);
}

export function holdQueueRows(unsold: readonly HoldQueueSource[], now?: number): HoldQueueRow[] {
  const clock = asOf(now);
  const rows: HoldQueueRow[] = [];
  for (const row of unsold) {
    if (row.holdCall !== 'hold' && row.holdCall !== 'clear' && row.holdCall !== 'under') continue;
    const mark = finiteMark(row.holdMarkUsd);
    if (mark == null) continue;
    const worth = gainWorth(row.holdRealizedUsd, row.treatment);
    const keptUsd = row.holdCall === 'hold' && worth != null ? worth.keptUsd : 0;
    const days = row.holdCall === 'hold'
      && typeof row.daysToLongTerm === 'number'
      && Number.isFinite(row.daysToLongTerm)
      && row.daysToLongTerm > 0
      ? row.daysToLongTerm
      : null;
    const dated = keptUsd > 0 && days != null;
    rows.push({
      id: row.id,
      player: playerName(row.player),
      call: row.holdCall,
      cashUsd: exitMath(mark, null).netUsd,
      keptUsd,
      daysToLongTerm: dated ? days : null,
      lineOn: dated ? lineOn(clock, days) : null,
      perDayUsd: dated ? cents(keptUsd / days) : null,
    });
  }
  rows.sort((a, b) => {
    const rank = CALL_RANK[a.call] - CALL_RANK[b.call];
    if (rank !== 0) return rank;
    if (a.call === 'hold' && a.keptUsd !== b.keptUsd) return a.keptUsd - b.keptUsd;
    if (a.cashUsd !== b.cashUsd) return b.cashUsd - a.cashUsd;
    const name = a.player.localeCompare(b.player);
    if (name !== 0) return name;
    return a.id.localeCompare(b.id);
  });
  return rows;
}

function listed(items: readonly string[]): string {
  const shown = items.slice(0, NAME_LIMIT);
  const extra = items.length - shown.length;
  if (extra > 0) return `${shown.join(', ')}, and ${extra} more`;
  if (shown.length === 1) return shown[0];
  if (shown.length === 2) return `${shown[0]} and ${shown[1]}`;
  return `${shown.slice(0, -1).join(', ')}, and ${shown[shown.length - 1]}`;
}

function perDayPhrase(row: HoldQueueRow): string {
  if (row.perDayUsd != null && row.perDayUsd > 0) return `${money(row.perDayUsd)} a day`;
  return 'under $0.01 a day';
}

function cardBit(row: HoldQueueRow): string {
  const cash = `raises ${money(row.cashUsd)} after the card-show fee`;
  if (row.call === 'hold' && row.keptUsd > 0 && row.lineOn) {
    return `${row.player} (${cash}, gives up ${money(row.keptUsd)}, line ${row.lineOn}, ${perDayPhrase(row)})`;
  }
  if (row.call === 'hold' && row.keptUsd > 0) {
    return `${row.player} (${cash}, gives up ${money(row.keptUsd)})`;
  }
  if (row.call === 'hold') {
    return `${row.player} (${cash}, gives up nothing)`;
  }
  return `${row.player} (${cash}, ${row.call}, waiting keeps nothing more)`;
}

function staySentence(rows: readonly HoldQueueRow[]): string {
  if (rows.length === 0) return '';
  const kept = rows.reduce((total, row) => cents(total + row.keptUsd), 0);
  const soonest = rows.map((row) => row.lineOn).filter((day): day is string => Boolean(day)).sort()[0];
  if (rows.length === 1) {
    const row = rows[0];
    const when = row.lineOn ? ` until ${row.lineOn}, ${perDayPhrase(row)}` : '';
    return `${row.player} stays a hold. Waiting keeps ${money(kept)}${when}.`;
  }
  const line = soonest ? ` The soonest line is ${soonest}.` : '';
  return `${listed(rows.map((row) => row.player))} stay holds. Waiting keeps ${money(kept)}.${line}`;
}

function coverSentence(rows: readonly HoldQueueRow[], need: number): string {
  const payers = rows.filter((row) => row.cashUsd > 0);
  if (payers.length === 0) {
    const stay = staySentence(rows.filter((row) => row.call === 'hold' && row.keptUsd > 0));
    return `${money(need)} at the table stays uncovered. No listed card raises cash after the card-show fee. ${stay}`.trim();
  }
  const taken: HoldQueueRow[] = [];
  let cash = 0;
  for (const row of payers) {
    taken.push(row);
    cash = cents(cash + row.cashUsd);
    if (cash >= need) break;
  }
  const takenIds = new Set(taken.map((row) => row.id));
  const kept = taken.reduce((total, row) => cents(total + (row.call === 'hold' ? row.keptUsd : 0)), 0);
  const short = cents(need - cash);
  const give = kept > 0 ? `Gives up ${money(kept)}` : 'Gives up nothing';
  const shortBit = short > 0 ? ` and is still short ${money(short)}` : '';
  const stay = staySentence(rows.filter((row) => row.call === 'hold' && row.keptUsd > 0 && !takenIds.has(row.id)));
  return `${money(need)} at the table takes ${listed(taken.map((row) => row.player))}. ${give}${shortBit}. ${stay}`.trim();
}

function usableNeed(cashNeed: number | null | undefined): number | null {
  if (typeof cashNeed !== 'number' || !Number.isFinite(cashNeed) || cashNeed < 0 || cashNeed > CASH_CAP) return null;
  return cents(cashNeed);
}

export function holdQueueCopy(
  unsold: readonly HoldQueueSource[],
  cashNeed: number | null = null,
  now?: number,
): string {
  const rows = holdQueueRows(unsold, asOf(now));
  if (rows.length === 0) return '';
  const need = usableNeed(cashNeed);
  const order = `Order: ${listed(rows.map(cardBit))}.`;
  const lead = need == null
    ? 'sell under and clear before a hold, because waiting keeps nothing more.'
    : need === 0
      ? 'a table need of $0 takes no card. Sell under and clear before a hold, because waiting keeps nothing more.'
      : coverSentence(rows, need);
  return `Hold queue: ${lead} ${order} Not a tax determination and not a live tape.`;
}

export function loadHoldQueueUnsold(inventory: readonly PnlBookCard[], now?: number) {
  return showPnl({
    notes: haggleSnapshot(),
    decisions: readFloorDecisions(),
    inventory,
    now: asOf(now),
  }).unsold;
}
