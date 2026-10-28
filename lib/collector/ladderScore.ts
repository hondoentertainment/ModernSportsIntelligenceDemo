/**
 * Places the number you typed on the offer ladder already on the card.
 * A buy sits at or under the open, up to the fair, up to the walk, or over the walk.
 * A sell sits at or over the ask, down to the take, down to the pass, or under the pass.
 * A bought note over the walk, or a pass at or under the walk, is the line the week keeps.
 * Sold comps when stored. Otherwise the same demo sketch.
 * Not a settlement and not a live tape.
 */
import { buyLadder, type BuyLadder, type SellLadder } from './offerLadder';
import { rangeForSeat, type SaleRange } from './saleRange';
import { boughtLotShares } from './tableLot';

export const LADDER_SCORE_NOTE =
  'The number on that row sits on the ladder. A buy over the walk, or a pass at or under the walk, is the line the week keeps. Sold comps when stored. Otherwise a demo sketch. Not a live tape.';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type BuySeat = 'at or under open' | 'up to fair' | 'up to walk' | 'over walk';
export type SellSeat = 'at or over ask' | 'down to take' | 'down to pass' | 'under pass';

const BUY_PHRASE: Record<BuySeat, string> = {
  'at or under open': 'at or under the open',
  'up to fair': 'up to the fair',
  'up to walk': 'up to the walk',
  'over walk': 'over the walk',
};

const SELL_PHRASE: Record<SellSeat, string> = {
  'at or over ask': 'at or over the ask',
  'down to take': 'down to the take',
  'down to pass': 'down to the pass',
  'under pass': 'under the pass',
};
export type TableCall =
  'inside walk' | 'over walk' | 'left the walk' | 'pass held' | 'open inside' | 'open over';

export interface TableScore {
  call: TableCall;
  copy: string;
}

export interface TableNoteInput {
  result: string;
  offerUsd: number;
  askUsd: number;
}

export interface WeekNote extends TableNoteInput {
  cardId?: string;
  savedAt?: string;
  lines?: readonly { cardId?: string; askUsd?: number | null }[];
}

export interface WeekLadder {
  inside: number;
  over: number;
  left: number;
  held: number;
  openInside: number;
  openOver: number;
  scored: number;
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
  const rounded = cents(value);
  return rounded > 0 ? rounded : null;
}

function tape(source: 'comps' | 'demo', grade?: string | null): string {
  const where = source === 'comps' ? 'sold comps' : 'demo sales';
  return grade ? `${grade} ${where}` : where;
}

function buySeatOf(value: number, ladder: BuyLadder): BuySeat {
  if (value <= ladder.open + 0.001) return 'at or under open';
  if (value <= ladder.fair + 0.001) return 'up to fair';
  if (value <= ladder.walk + 0.001) return 'up to walk';
  return 'over walk';
}

export function buySeat(usd: number | null | undefined, ladder: BuyLadder | null): BuySeat | null {
  if (ladder == null || ladder.blocked) return null;
  const value = positive(usd);
  if (value == null) return null;
  return buySeatOf(value, ladder);
}

function buyLine(value: number, ladder: BuyLadder, seat: BuySeat, noun: string): string {
  return `${noun} ${money(value)} is ${BUY_PHRASE[seat]} on ${tape(ladder.source, ladder.band)} (open ${money(ladder.open)}, fair ${money(ladder.fair)}, walk ${money(ladder.walk)}).`;
}

export function buyScoreCopy(
  usd: number | null | undefined,
  ladder: BuyLadder | null,
  noun: string
): string | null {
  if (ladder == null || ladder.blocked) return null;
  const value = positive(usd);
  if (value == null) return null;
  return buyLine(value, ladder, buySeatOf(value, ladder), noun);
}

function sellSeatOf(value: number, ladder: SellLadder): SellSeat {
  if (value + 0.001 >= ladder.ask) return 'at or over ask';
  if (value + 0.001 >= ladder.take) return 'down to take';
  if (value + 0.001 >= ladder.passUnder) return 'down to pass';
  return 'under pass';
}

export function sellSeat(
  usd: number | null | undefined,
  ladder: SellLadder | null
): SellSeat | null {
  if (ladder == null) return null;
  const value = positive(usd);
  if (value == null) return null;
  return sellSeatOf(value, ladder);
}

function sellLine(value: number, ladder: SellLadder, seat: SellSeat, noun: string): string {
  return `${noun} ${money(value)} is ${SELL_PHRASE[seat]} on ${tape(ladder.source, ladder.band)} (ask ${money(ladder.ask)}, take ${money(ladder.take)}, pass under ${money(ladder.passUnder)}).`;
}

export function sellScoreCopy(
  usd: number | null | undefined,
  ladder: SellLadder | null,
  noun: string
): string | null {
  if (ladder == null) return null;
  const value = positive(usd);
  if (value == null) return null;
  return sellLine(value, ladder, sellSeatOf(value, ladder), noun);
}

export function tableScore(note: TableNoteInput, ladder: BuyLadder | null): TableScore | null {
  if (ladder == null || ladder.blocked) return null;
  let noun = 'This ask';
  let usd: number | null = null;
  if (note.result === 'bought') {
    noun = 'Paid';
    usd = positive(note.offerUsd) ?? positive(note.askUsd);
  } else if (note.result === 'passed') {
    noun = 'This ask';
    usd = positive(note.askUsd);
  } else if (note.result === 'open') {
    const offer = positive(note.offerUsd);
    if (offer != null) {
      noun = 'This offer';
      usd = offer;
    } else {
      noun = 'This ask';
      usd = positive(note.askUsd);
    }
  } else {
    return null;
  }
  if (usd == null) return null;
  const seat = buySeatOf(usd, ladder);
  const line = buyLine(usd, ladder, seat, noun);
  const over = seat === 'over walk';
  if (note.result === 'bought') {
    return {
      call: over ? 'over walk' : 'inside walk',
      copy: `${line} ${over ? 'Bought over the walk.' : 'Bought inside the walk.'}`,
    };
  }
  if (note.result === 'passed') {
    return {
      call: over ? 'pass held' : 'left the walk',
      copy: `${line} ${over ? 'The pass held.' : 'The pass left a number at or under the walk.'}`,
    };
  }
  return {
    call: over ? 'open over' : 'open inside',
    copy: `${line} ${over ? 'Still open, over the walk.' : 'Still open, at or under the walk.'}`,
  };
}

function tally(count: number, singular: string, plural = singular): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function addCall(week: WeekLadder, call: TableScore['call']): void {
  week.scored += 1;
  if (call === 'inside walk') week.inside += 1;
  else if (call === 'over walk') week.over += 1;
  else if (call === 'left the walk') week.left += 1;
  else if (call === 'pass held') week.held += 1;
  else if (call === 'open inside') week.openInside += 1;
  else week.openOver += 1;
}

export function weekLadder(
  notes: readonly WeekNote[],
  ranges: Readonly<Record<string, SaleRange | null | undefined>>,
  now = Date.now()
): WeekLadder {
  const week: WeekLadder = {
    inside: 0,
    over: 0,
    left: 0,
    held: 0,
    openInside: 0,
    openOver: 0,
    scored: 0,
  };
  for (const note of notes) {
    const saved = Date.parse(note.savedAt ?? '');
    if (!Number.isFinite(saved) || saved > now || saved < now - WEEK_MS) continue;
    if ((note.lines?.length ?? 0) >= 2) {
      const shares = note.result === 'bought' ? boughtLotShares(note) : null;
      if (note.result === 'bought' && !shares) continue;
      (note.lines ?? []).forEach((line, index) => {
        const cardId = line.cardId?.trim() ?? '';
        const ask = positive(line.askUsd);
        const paid = shares ? shares[index] : ask;
        if (!cardId || ask == null || paid == null) return;
        const range = ranges[cardId];
        if (range == null) return;
        const scored = tableScore(
          {
            result: note.result,
            offerUsd: note.result === 'bought' ? paid : 0,
            askUsd: note.result === 'bought' ? paid : ask,
          },
          buyLadder(range),
        );
        if (scored == null) return;
        addCall(week, scored.call);
      });
      continue;
    }
    const cardId = note.cardId?.trim() ?? '';
    if (!cardId) continue;
    const range = ranges[cardId];
    if (range == null) continue;
    const scored = tableScore(note, buyLadder(range));
    if (scored == null) continue;
    addCall(week, scored.call);
  }
  return week;
}

export function weekLadderCopy(week: WeekLadder): string {
  if (week.scored <= 0) {
    return 'No dated table note sits on a sale range this week. Notes with no date, and notes with no card in the book, stay off this count. Not a live tape.';
  }
  const open = week.openInside + week.openOver;
  return `Ladder this week: ${tally(week.inside, 'bought inside the walk')}, ${tally(week.over, 'bought over the walk')}, ${tally(week.left, 'pass left the walk', 'passes left the walk')}, ${tally(week.held, 'pass held', 'passes held')}, ${tally(open, 'still open')}. Not a settlement and not a live tape.`;
}

export function cardRanges(
  cards: readonly {
    id: string;
    currentValue?: number;
    purchasePrice?: number;
    isGraded?: boolean;
    gradingCompany?: string | null;
    grade?: string | null;
    salesData?: readonly { price: number; totalPrice?: number; soldAt?: string; title?: string; condition?: string }[];
  }[]
): Record<string, SaleRange> {
  const ranges: Record<string, SaleRange> = {};
  for (const card of cards) {
    if (!card.id) continue;
    ranges[card.id] = rangeForSeat(card);
  }
  return ranges;
}
