/**
 * Dollars of sparkline start between the weight-gap card and an equal share.
 * The move keeps that card's percent change and leaves the other cards put.
 * A fill is not a buy. A trim is not a sale.
 * Not a live Sports Card Investor or Market Movers index.
 */
import type { CardInventory } from '../../types';
import { MOVER_STABLE_BAND_PCT } from './portfolioMovers';
import { readIndexTape, type IndexBeatCall, type IndexBeatCard } from './indexBeat';
import { weightGap, type WeightGapCarry } from './weightGap';

export const EQUAL_SHARE_DISCLOSURE =
  'The dollars are that card\'s sparkline start against an equal share of the same start. The move keeps that card\'s percent change and leaves the other cards put. A fill is not a buy. A trim is not a sale. Not a live Sports Card Investor or Market Movers index.';

export const EQUAL_SHARE_NOTE =
  'A sold card, thin tape, and a sparkline that does not start above zero stay off. One usable card stays off. A gap of zero does not name a card. A tie does not name one card to move. A fill is not a buy. A trim is not a sale. A match, a beat, and a move that still lags stay off the alert. Not a live tape.';

export type EqualShareSide = 'trim' | 'fill' | 'even';

export interface EqualShareMove {
  id: string;
  player: string;
  side: EqualShareSide;
  moveUsd: number;
  fromUsd: number;
  equalUsd: number;
}

export interface EqualShareAlert {
  copy: string;
  player: string;
  cardId: string;
  href: string;
}

export interface EqualShare {
  scoped: boolean;
  call: IndexBeatCall;
  after: Exclude<IndexBeatCall, 'off'> | null;
  afterGapPct: number | null;
  held: number;
  cards: number;
  off: number;
  startUsd: number;
  gapPct: number | null;
  gapUsd: number | null;
  move: EqualShareMove | null;
  tied: EqualShareMove[];
  copy: string;
  alert: EqualShareAlert | null;
  disclosure: string;
}

interface Scored {
  gapPct: number;
  call: Exclude<IndexBeatCall, 'off'>;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  const rounded = Math.round(value * 10) / 10;
  return rounded === 0 ? 0 : rounded;
}

function money(value: number): string {
  return `$${cents(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function points(gapPct: number): string {
  const abs = Math.abs(gapPct).toFixed(1);
  return `${abs} ${abs === '1.0' ? 'point' : 'points'}`;
}

function quiet(scoped: boolean, held: number, off: number, copy: string): EqualShare {
  return {
    scoped,
    call: 'off',
    after: null,
    afterGapPct: null,
    held,
    cards: held - off,
    off,
    startUsd: 0,
    gapPct: null,
    gapUsd: null,
    move: null,
    tied: [],
    copy,
    alert: null,
    disclosure: EQUAL_SHARE_DISCLOSURE,
  };
}

function offCopy(scoped: boolean, held: number, usable: number): string {
  if (held === 0) {
    return scoped
      ? 'Equal share: no favorite is on this desk.'
      : 'Equal share: no held card is on this desk.';
  }
  if (usable === 1) {
    const who = scoped ? 'favorite' : 'card';
    const left = held - usable;
    const tail = left > 0 ? ` ${left} ${left === 1 ? 'card stays' : 'cards stay'} off.` : '';
    return `Equal share: one ${who} cannot move to an equal share against itself.${tail}`;
  }
  const noun = scoped
    ? (held === 1 ? 'favorite' : 'favorites')
    : (held === 1 ? 'held card' : 'held cards');
  const verb = held === 1 ? 'stays' : 'stay';
  return `Equal share: ${held} ${noun} ${verb} off this desk, so it does not name an equal share.`;
}

function score(cards: readonly IndexBeatCard[]): Scored {
  const start = cards.reduce((sum, card) => sum + card.from, 0);
  const end = cards.reduce((sum, card) => sum + card.to, 0);
  const bookPct = round1(start > 0 ? ((end - start) / start) * 100 : 0);
  const indexPct = round1(cards.reduce((sum, card) => sum + card.changePct, 0) / cards.length);
  const gapPct = round1(bookPct - indexPct);
  const call: Exclude<IndexBeatCall, 'off'> = gapPct > MOVER_STABLE_BAND_PCT
    ? 'beat'
    : gapPct < -MOVER_STABLE_BAND_PCT
      ? 'lag'
      : 'match';
  return { gapPct, call };
}

function moveFor(card: IndexBeatCard, cards: readonly IndexBeatCard[], start: number): EqualShareMove {
  const target = (start - card.from) / (cards.length - 1);
  const moveUsd = cents(target - card.from);
  const side: EqualShareSide = moveUsd > 0 ? 'fill' : moveUsd < 0 ? 'trim' : 'even';
  return {
    id: card.id,
    player: card.player,
    side,
    moveUsd,
    fromUsd: cents(card.from),
    equalUsd: cents(target),
  };
}

function shifted(cards: readonly IndexBeatCard[], card: IndexBeatCard, equalUsd: number): IndexBeatCard[] {
  const scale = card.from > 0 ? equalUsd / card.from : 1;
  return cards.map((row) => (
    row.id === card.id ? { ...row, from: equalUsd, to: row.to * scale } : row
  ));
}

function names(cards: readonly { player: string }[]): string {
  if (cards.length === 1) return cards[0].player;
  if (cards.length === 2) return `${cards[0].player} and ${cards[1].player}`;
  if (cards.length === 3) return `${cards[0].player}, ${cards[1].player}, and ${cards[2].player}`;
  return `${cards.length} cards`;
}

function where(side: EqualShareSide): string {
  return side === 'trim' ? 'above' : 'below';
}

function honest(side: EqualShareSide): string {
  if (side === 'fill') return ' That is a fill, not a buy.';
  if (side === 'trim') return ' That is a trim of sparkline start, not a sale.';
  return '';
}

function outcome(
  before: Exclude<IndexBeatCall, 'off'>,
  after: Exclude<IndexBeatCall, 'off'>,
  afterGapPct: number,
): string {
  if (after === 'match') return 'match the index';
  const word = after === before ? `still ${after}` : after;
  return `${word} the index by ${points(afterGapPct)}`;
}

function today(
  scoped: boolean,
  gapPct: number,
  gapUsd: number,
  call: Exclude<IndexBeatCall, 'off'>,
): string {
  const who = scoped ? 'These favorites are' : 'The book is';
  if (gapUsd === 0) return `${who} even with the index on the dollars today.`;
  const place = gapUsd > 0 ? 'ahead of' : 'behind';
  let line = `${who} ${money(Math.abs(gapUsd))} ${place} the index today.`;
  if (call === 'match') {
    line += ` Those ${points(gapPct)} are inside the 2-point band, so the dollars matched.`;
  } else {
    line += ` That gap is ${points(gapPct)}.`;
  }
  return line;
}

function tieSentence(moves: readonly EqualShareMove[]): string {
  const first = moves[0];
  const same = moves.every((move) => move.moveUsd === first.moveUsd && move.side === first.side);
  if (same && first.side === 'even') {
    return `${names(moves)} already sit at an equal share. A tie does not name one card to move.`;
  }
  if (same) {
    return `${names(moves)} are each ${money(Math.abs(first.moveUsd))} of that start ${where(first.side)} an equal share. A tie does not name one card to move.`;
  }
  const parts = moves.map((move) => (
    move.side === 'even'
      ? `${move.player} already sits at an equal share`
      : `${move.player} is ${money(Math.abs(move.moveUsd))} ${where(move.side)}`
  ));
  const listed = parts.length === 2
    ? `${parts[0]}, and ${parts[1]}`
    : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  return `${listed}. A tie does not name one card to move.`;
}

function moveSentence(
  move: EqualShareMove,
  before: Exclude<IndexBeatCall, 'off'>,
  after: Exclude<IndexBeatCall, 'off'>,
  afterGapPct: number,
  startUsd: number,
): string {
  if (move.side === 'even') {
    return `${move.player} already sits at an equal share of the ${money(startUsd)} start.`;
  }
  const verb = move.side === 'fill' ? 'Adding that start' : 'Moving that start to an equal share';
  return `${move.player} is ${money(Math.abs(move.moveUsd))} of the ${money(startUsd)} start ${where(move.side)} an equal share. ${verb}, with the same percent change, would ${outcome(before, after, afterGapPct)}.${honest(move.side)}`;
}

function alertFor(
  scoped: boolean,
  call: IndexBeatCall,
  carry: WeightGapCarry | null,
  move: EqualShareMove | null,
  after: Exclude<IndexBeatCall, 'off'> | null,
  afterGapPct: number | null,
): EqualShareAlert | null {
  if (call !== 'lag' || carry == null || move == null || move.side === 'even') return null;
  if (!(carry.partPct > 50) || after == null || after === 'lag' || afterGapPct == null) return null;
  const who = scoped ? 'These favorites' : 'The book';
  const action = move.side === 'fill'
    ? `Adding that start to ${move.player}`
    : `Moving ${move.player} to an equal share`;
  const result = after === 'match' ? 'would match the index' : `would beat the index by ${points(afterGapPct)}`;
  return {
    copy: `Equal share: ${who} lagged. ${action} ${result}.${honest(move.side)} Not a live tape.`,
    player: move.player,
    cardId: move.id,
    href: `/audit-dossier?cardId=${encodeURIComponent(move.id)}`,
  };
}

export function equalShare(inventory: readonly CardInventory[], ids?: readonly string[]): EqualShare {
  const tape = readIndexTape(inventory, ids);
  const gap = weightGap(inventory, ids);
  if (tape.call === 'off' || gap.call === 'off' || tape.gapPct == null || gap.gapPct == null || gap.gapUsd == null) {
    return quiet(tape.scoped, tape.held, tape.off, offCopy(tape.scoped, tape.held, tape.cards.length));
  }
  const start = tape.cards.reduce((sum, card) => sum + card.from, 0);
  const startUsd = cents(start);
  const base = {
    scoped: tape.scoped,
    call: gap.call,
    held: tape.held,
    cards: tape.cards.length,
    off: tape.off,
    startUsd,
    gapPct: gap.gapPct,
    gapUsd: gap.gapUsd,
    disclosure: EQUAL_SHARE_DISCLOSURE,
  };
  const offNote = tape.off > 0
    ? ` ${tape.off} ${tape.off === 1 ? 'card stays' : 'cards stay'} off.`
    : '';
  const close = `${today(tape.scoped, gap.gapPct, gap.gapUsd, gap.call)}${offNote} Not a live Sports Card Investor or Market Movers index.`;
  if (gap.gapPct === 0) {
    const who = tape.scoped ? 'These favorites moved' : 'The book moved';
    return {
      ...base,
      after: null,
      afterGapPct: null,
      move: null,
      tied: [],
      copy: `Equal share: ${who} with the equal-weighted index on the ${money(startUsd)} start, so no card is named.${offNote} Not a live Sports Card Investor or Market Movers index.`,
      alert: null,
    };
  }
  const carriers = gap.carry != null ? [gap.carry] : gap.tied;
  if (carriers.length === 0) {
    return {
      ...base,
      after: null,
      afterGapPct: null,
      move: null,
      tied: [],
      copy: `Equal share: no card's extra weight names an equal share. ${close}`,
      alert: null,
    };
  }
  const byId = new Map(tape.cards.map((card) => [card.id, card]));
  const moves = carriers
    .map((carrier) => byId.get(carrier.id))
    .filter((card): card is IndexBeatCard => card != null)
    .map((card) => moveFor(card, tape.cards, start));
  if (moves.length === 0) {
    return {
      ...base,
      after: null,
      afterGapPct: null,
      move: null,
      tied: [],
      copy: `Equal share: no card's extra weight names an equal share. ${close}`,
      alert: null,
    };
  }
  if (moves.length !== 1) {
    return {
      ...base,
      after: null,
      afterGapPct: null,
      move: null,
      tied: moves,
      copy: `Equal share: ${tieSentence(moves)} ${close}`,
      alert: null,
    };
  }
  const move = moves[0];
  const card = byId.get(move.id);
  const afterScore = card != null && move.side !== 'even'
    ? score(shifted(tape.cards, card, move.equalUsd))
    : { gapPct: gap.gapPct, call: gap.call };
  return {
    ...base,
    after: afterScore.call,
    afterGapPct: afterScore.gapPct,
    move,
    tied: [],
    copy: `Equal share: ${moveSentence(move, gap.call, afterScore.call, afterScore.gapPct, startUsd)} ${close}`,
    alert: alertFor(tape.scoped, gap.call, gap.carry, move, afterScore.call, afterScore.gapPct),
  };
}
