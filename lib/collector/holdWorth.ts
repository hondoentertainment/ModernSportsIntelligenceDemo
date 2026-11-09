/**
 * Dollars the hold call is worth on demo or stale tape.
 * The fee is the existing ~4% card-show heuristic. The rates are the
 * sell planner's exit simulator defaults: 35% while the gain is
 * short-term and 20% once it is long-term. The line is the same
 * 365.25-day test as inventory age. The eBay fee stays off this desk.
 * Not a tax determination and not a live tape.
 */
import { holdCallFor, storedMarkUsd, type ShowHoldCall } from './holdingBuckets';
import { acquiredDay, holdAge, type HoldTreatment } from './inventoryAge';
import { exitMath } from './showExit';

export const SHORT_TERM_TAX_RATE = 0.35;
export const LONG_TERM_TAX_RATE = 0.2;

export const HOLD_WORTH_NOTE =
  'Hold worth prices the gain after the ~4% card-show fee at the sell planner\'s 35% short-term and 20% long-term rates. Waiting on a hold keeps the difference between those rates. A card that is already long-term, and a card that is not ahead after the fee, keep nothing more. A recorded short-term sale names what that short-term rate cost versus long-term. A price you have not recorded yet uses that price, not the stored mark, and the same 45-day window. A missing mark, a buy that is not filed, a short-term gain more than 45 days from the line, a sale with no holding dates, and a sale with no gain stay off. Not a tax determination and not a live tape.';

const NAME_LIMIT = 4;

export interface GainWorth {
  realizedUsd: number;
  taxNowUsd: number;
  taxLongTermUsd: number;
  keptUsd: number;
}

export interface HoldWorthSource {
  player: string;
  holdCall?: ShowHoldCall | null;
  treatment?: HoldTreatment | null;
  realizedUsd?: number | null;
  holdRealizedUsd?: number | null;
}

export interface ExitHoldRow {
  player: string;
  held: boolean;
  cardId: string | null;
  takenUsd: number;
  costUsd: number | null;
}

interface Named {
  player: string;
  keptUsd: number;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function percentRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function gainWorth(
  realizedUsd: number | null | undefined,
  treatment: HoldTreatment | null | undefined,
): GainWorth | null {
  if (typeof realizedUsd !== 'number' || !Number.isFinite(realizedUsd)) return null;
  if (treatment !== 'short-term' && treatment !== 'long-term') return null;
  const realized = cents(realizedUsd);
  if (realized <= 0) {
    return { realizedUsd: realized, taxNowUsd: 0, taxLongTermUsd: 0, keptUsd: 0 };
  }
  const taxLongTermUsd = cents(realized * LONG_TERM_TAX_RATE);
  const taxNowUsd = treatment === 'long-term' ? taxLongTermUsd : cents(realized * SHORT_TERM_TAX_RATE);
  return {
    realizedUsd: realized,
    taxNowUsd,
    taxLongTermUsd,
    keptUsd: treatment === 'short-term' ? cents(taxNowUsd - taxLongTermUsd) : 0,
  };
}

export function holdWorthLine(call: ShowHoldCall, worth: GainWorth | null): string {
  const longRate = percentRate(LONG_TERM_TAX_RATE);
  if (call === 'hold' && worth != null && worth.keptUsd > 0) {
    return `Waiting on this mark keeps ${money(worth.keptUsd)} versus the ${longRate} long-term rate. Estimated tax is ${money(worth.taxNowUsd)} while it is short-term. Not a tax determination.`;
  }
  if (call === 'clear') {
    return `Waiting keeps nothing more. This mark is already on the ${longRate} long-term rate. Not a tax determination.`;
  }
  if (call === 'under') {
    return 'Waiting keeps nothing more. This mark is not ahead after the card-show fee, so estimated tax stays off. Not a tax determination.';
  }
  if (worth == null) return '';
  return 'Waiting keeps nothing more on this mark. Not a tax determination.';
}

function names(players: readonly string[]): string {
  const shown = players.slice(0, NAME_LIMIT);
  const more = players.length - shown.length;
  const extra = more > 0 ? `, and ${more} more` : '';
  return ` (${shown.join(', ')}${extra})`;
}

function sumKept(rows: readonly Named[]): number {
  return rows.reduce((total, row) => cents(total + row.keptUsd), 0);
}

function rateSentence(): string {
  return `Estimated tax is ${percentRate(SHORT_TERM_TAX_RATE)} while the gain is short-term and ${percentRate(LONG_TERM_TAX_RATE)} once it is long-term, on the gain after the ~4% card-show fee.`;
}

function flatPhrase(count: number): string {
  return count === 1
    ? '1 card already long-term or under the fee keeps nothing more'
    : `${count} cards already long-term or under the fee keep nothing more`;
}

export function holdWorthCopy(
  unsold: readonly HoldWorthSource[],
  sold: readonly HoldWorthSource[],
): string {
  const waits: Named[] = [];
  const flats: string[] = [];
  for (const row of unsold) {
    if (row.holdCall !== 'hold' && row.holdCall !== 'clear' && row.holdCall !== 'under') continue;
    const worth = gainWorth(row.holdRealizedUsd, row.treatment);
    if (row.holdCall === 'hold' && worth != null && worth.keptUsd > 0) {
      waits.push({ player: row.player, keptUsd: worth.keptUsd });
      continue;
    }
    if (worth == null && row.holdCall === 'hold') continue;
    flats.push(row.player);
  }
  const left: Named[] = [];
  for (const row of sold) {
    if (row.treatment !== 'short-term') continue;
    const worth = gainWorth(row.realizedUsd, 'short-term');
    if (worth == null || worth.realizedUsd <= 0 || worth.keptUsd <= 0) continue;
    left.push({ player: row.player, keptUsd: worth.keptUsd });
  }
  if (waits.length + flats.length + left.length === 0) return '';
  const parts: string[] = [];
  if (waits.length > 0) {
    const noun = waits.length === 1 ? '1 card' : `${waits.length} cards`;
    parts.push(
      `waiting keeps ${money(sumKept(waits))} on the stored mark for ${noun} inside the hold window${names(waits.map((row) => row.player))}.`,
    );
  }
  if (flats.length > 0) parts.push(`${flatPhrase(flats.length)}${names(flats)}.`);
  if (left.length > 0) {
    const lead = left.length === 1
      ? 'a recorded short-term sale left'
      : 'recorded short-term sales left';
    parts.push(
      `${lead} ${money(sumKept(left))} versus the ${percentRate(LONG_TERM_TAX_RATE)} long-term rate${names(left.map((row) => row.player))}.`,
    );
  }
  return `Hold worth: ${parts.join(' ')} ${rateSentence()} Not a tax determination.`;
}

function offSentence(): string {
  return 'Hold worth: this price stays off. A missing purchase date, no cost, and a short-term gain more than 45 days from the line stay off. Not a tax determination.';
}

export function exitHoldWorthCopy(input: {
  rows: readonly ExitHoldRow[];
  cards: readonly { id: string; purchaseDate?: string }[];
  now?: number;
}): string {
  const now = input.now ?? Date.now();
  const byId = new Map(input.cards.map((card) => [card.id, card]));
  const waits: Named[] = [];
  const clears: string[] = [];
  const unders: string[] = [];
  const quiet: string[] = [];
  let held = 0;
  let off = 0;
  for (const row of input.rows) {
    if (!row.held) continue;
    held += 1;
    const card = row.cardId ? byId.get(row.cardId) : undefined;
    const age = holdAge(acquiredDay(card?.purchaseDate, undefined), now, null, true);
    const call = age == null
      ? null
      : holdCallFor({
        treatment: age.treatment,
        daysToLongTerm: age.daysToLongTerm,
        markUsd: storedMarkUsd(row.takenUsd),
        costUsd: row.costUsd,
      });
    if (age == null || call == null) {
      off += 1;
      continue;
    }
    const worth = gainWorth(exitMath(row.takenUsd, row.costUsd).realizedUsd, age.treatment);
    if (call === 'hold' && worth != null && worth.keptUsd > 0) {
      waits.push({ player: row.player, keptUsd: worth.keptUsd });
    } else if (call === 'hold') quiet.push(row.player);
    else if (call === 'clear') clears.push(row.player);
    else unders.push(row.player);
  }
  if (held === 0) return '';
  if (waits.length + clears.length + unders.length + quiet.length === 0) return offSentence();
  const parts: string[] = [];
  if (waits.length > 0) {
    const noun = waits.length === 1 ? '1 card' : `${waits.length} cards`;
    parts.push(
      `waiting keeps ${money(sumKept(waits))} versus taking this price now for ${noun} inside the hold window${names(waits.map((row) => row.player))}.`,
    );
  }
  if (clears.length > 0) {
    const lead = clears.length === 1
      ? '1 price is already long-term, so waiting keeps nothing more'
      : `${clears.length} prices are already long-term, so waiting keeps nothing more`;
    parts.push(`${lead}${names(clears)}.`);
  }
  if (unders.length > 0) {
    const lead = unders.length === 1
      ? '1 price is not ahead after the card-show fee, so waiting keeps nothing more'
      : `${unders.length} prices are not ahead after the card-show fee, so waiting keeps nothing more`;
    parts.push(`${lead}${names(unders)}.`);
  }
  if (quiet.length > 0) {
    const lead = quiet.length === 1
      ? '1 card inside the hold window keeps nothing more'
      : `${quiet.length} cards inside the hold window keep nothing more`;
    parts.push(`${lead}${names(quiet)}.`);
  }
  if (off > 0) {
    parts.push(off === 1 ? '1 price stays off.' : `${off} prices stay off.`);
  }
  return `Hold worth: ${parts.join(' ')} ${rateSentence()} Not a tax determination.`;
}
