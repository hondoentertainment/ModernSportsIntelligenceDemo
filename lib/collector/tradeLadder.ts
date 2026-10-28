/**
 * Places each side of a local trade on that card's ladder.
 * Give is the local mark on the sell ladder (ask, take, pass).
 * Receive is the local mark on the buy ladder (open, fair, walk).
 * Cash you add is not a card, so it is not a rung.
 * A watchlist target and trip cash do not cap this walk.
 * A card with no range, and a mark of zero, stay off the count.
 * Sold comps when stored. Otherwise the same demo sketch.
 * Not a dealer fill and not a live tape.
 */
import { buyLadder, sellLadder } from './offerLadder';
import {
  buyScoreCopy,
  buySeat,
  sellScoreCopy,
  sellSeat,
  type BuySeat,
  type SellSeat,
} from './ladderScore';
import type { SaleRange } from './saleRange';

export const TRADE_LADDER_NOTE =
  'Give is the local mark on that card\'s sell ladder. Receive is the local mark on that card\'s buy ladder. Cash you add is not a rung. A card with no range, and a mark of zero, stay off this count. Sold comps when stored. Otherwise a demo sketch. Not a dealer fill and not a live tape.';

export type TradeLadderCall =
  | 'no score'
  | 'both inside'
  | 'give inside'
  | 'receive inside'
  | 'giving under'
  | 'receiving over'
  | 'both past';

export interface TradeLadderCard {
  id: string;
  player: string;
  usd: number;
  range?: SaleRange | null;
}

export interface TradeLadderLine {
  id: string;
  player: string;
  onLadder: boolean;
  copy: string;
}

export interface TradeLadder {
  give: TradeLadderLine[];
  receive: TradeLadderLine[];
  giveSeats: Record<SellSeat, number>;
  receiveSeats: Record<BuySeat, number>;
  giveOff: number;
  receiveOff: number;
  call: TradeLadderCall;
}

const SELL_ORDER: SellSeat[] = ['at or over ask', 'down to take', 'down to pass', 'under pass'];
const BUY_ORDER: BuySeat[] = ['at or under open', 'up to fair', 'up to walk', 'over walk'];

function emptyGive(): Record<SellSeat, number> {
  return { 'at or over ask': 0, 'down to take': 0, 'down to pass': 0, 'under pass': 0 };
}

function emptyReceive(): Record<BuySeat, number> {
  return { 'at or under open': 0, 'up to fair': 0, 'up to walk': 0, 'over walk': 0 };
}

function playerName(player: string): string {
  const name = typeof player === 'string' ? player.trim() : '';
  return name || 'Held card';
}

function offLine(card: TradeLadderCard, player: string): TradeLadderLine {
  return { id: card.id, player, onLadder: false, copy: `${player} stays off the ladder.` };
}

function giveLine(card: TradeLadderCard, seats: Record<SellSeat, number>): TradeLadderLine {
  const player = playerName(card.player);
  const ladder = card.range ? sellLadder(card.range) : null;
  const seat = sellSeat(card.usd, ladder);
  if (seat == null) return offLine(card, player);
  seats[seat] += 1;
  return { id: card.id, player, onLadder: true, copy: sellScoreCopy(card.usd, ladder, player) as string };
}

function receiveLine(card: TradeLadderCard, seats: Record<BuySeat, number>): TradeLadderLine {
  const player = playerName(card.player);
  const ladder = card.range ? buyLadder(card.range) : null;
  const seat = buySeat(card.usd, ladder);
  if (seat == null) return offLine(card, player);
  seats[seat] += 1;
  return { id: card.id, player, onLadder: true, copy: buyScoreCopy(card.usd, ladder, player) as string };
}

function scored(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}

function callOf(giveSeats: Record<SellSeat, number>, receiveSeats: Record<BuySeat, number>): TradeLadderCall {
  const giveScored = scored(giveSeats);
  const receiveScored = scored(receiveSeats);
  if (giveScored + receiveScored <= 0) return 'no score';
  const giveUnder = giveSeats['under pass'] > 0;
  const receiveOver = receiveSeats['over walk'] > 0;
  if (giveUnder && receiveOver) return 'both past';
  if (giveUnder) return 'giving under';
  if (receiveOver) return 'receiving over';
  if (giveScored > 0 && receiveScored > 0) return 'both inside';
  if (giveScored > 0) return 'give inside';
  return 'receive inside';
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function sidePhrase(counts: number[], labels: string[]): string {
  const parts: string[] = [];
  counts.forEach((count, index) => {
    if (count > 0) parts.push(`${count} ${labels[index]}`);
  });
  return parts.join(', ');
}

function callCopy(ladder: TradeLadder): string {
  if (ladder.call === 'both past') {
    return 'A card you give is under the pass, and a card you receive is over the walk.';
  }
  if (ladder.call === 'giving under') return 'A card you give is under the pass.';
  if (ladder.call === 'receiving over') return 'A card you receive is over the walk.';
  if (ladder.call === 'both inside') return 'Both sides sit on the rungs.';
  if (ladder.call === 'give inside') {
    return scored(ladder.giveSeats) === 1
      ? 'The card you give sits on the rungs.'
      : 'The cards you give sit on the rungs.';
  }
  return scored(ladder.receiveSeats) === 1
    ? 'The card you receive sits on the rungs.'
    : 'The cards you receive sit on the rungs.';
}

function offCopy(giveOff: number, receiveOff: number): string {
  if (giveOff > 0 && receiveOff > 0) {
    return ` ${countPhrase(giveOff, 'give card', 'give cards')} and ${countPhrase(receiveOff, 'receive card', 'receive cards')} stay off the ladder.`;
  }
  if (giveOff > 0) {
    return ` ${countPhrase(giveOff, 'give card stays off the ladder.', 'give cards stay off the ladder.')}`;
  }
  if (receiveOff > 0) {
    return ` ${countPhrase(receiveOff, 'receive card stays off the ladder.', 'receive cards stay off the ladder.')}`;
  }
  return '';
}

export function tradeLadder(
  give: readonly TradeLadderCard[],
  receive: readonly TradeLadderCard[],
): TradeLadder {
  const giveSeats = emptyGive();
  const receiveSeats = emptyReceive();
  const giveLines = give.map((card) => giveLine(card, giveSeats));
  const receiveLines = receive.map((card) => receiveLine(card, receiveSeats));
  return {
    give: giveLines,
    receive: receiveLines,
    giveSeats,
    receiveSeats,
    giveOff: giveLines.filter((line) => !line.onLadder).length,
    receiveOff: receiveLines.filter((line) => !line.onLadder).length,
    call: callOf(giveSeats, receiveSeats),
  };
}

export function tradeLadderCopy(ladder: TradeLadder): string {
  if (ladder.give.length + ladder.receive.length === 0) {
    return 'No card is on this trade yet. Cash you add is not a rung. Not a live tape.';
  }
  if (ladder.call === 'no score') {
    return 'No mark on this trade sits on a sale range. A card with no range, and a mark of zero, stay off this count. Cash is not a rung. Not a live tape.';
  }
  const give = sidePhrase(
    SELL_ORDER.map((seat) => ladder.giveSeats[seat]),
    ['at or over the ask', 'down to the take', 'down to the pass', 'under the pass'],
  );
  const receive = sidePhrase(
    BUY_ORDER.map((seat) => ladder.receiveSeats[seat]),
    ['at or under the open', 'up to the fair', 'up to the walk', 'over the walk'],
  );
  const parts = [give ? `give ${give}` : '', receive ? `receive ${receive}` : ''].filter(Boolean);
  return `Trade ladder: ${parts.join(', ')}. ${callCopy(ladder)}${offCopy(ladder.giveOff, ladder.receiveOff)} Cash is not a rung. Not a dealer fill and not a live tape.`;
}
