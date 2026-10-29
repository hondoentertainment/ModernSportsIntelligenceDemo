/**
 * When a dealer's ask is over the walk, meet halfway back to that walk.
 * Trade plus cash gives one held card at its local mark and cash for the
 * rest of the ask. The card you would take is scored at its fair, on the
 * same trade balancer as the collection desk.
 * Not a dealer fill and not a live tape.
 */
import { tradeFairness, type TradeSide } from './deskNext';
import { buyLadder } from './offerLadder';
import type { SaleRange } from './saleRange';
import { tradeLadder, tradeLadderCopy, type TradeLadderCard } from './tradeLadder';

export const COUNTER_OFFER_NOTE =
  'When the ask is over the walk, the split is halfway from that walk to the ask. Trade plus cash gives one held card at its local mark and cash for the rest of the ask. The card you would take is scored at its fair. Not a dealer fill and not a live tape.';

export interface CounterHeld {
  id: string;
  player: string;
  usd: number;
  range?: SaleRange | null;
}

export interface CounterTrade {
  giveId: string;
  givePlayer: string;
  giveUsd: number;
  cashUsd: number;
  receiveUsd: number;
  call: 'fair' | 'you ahead' | 'you short';
  net: number;
  gapPct: number;
  ladderCopy: string;
}

export interface CounterOffer {
  splitUsd: number;
  walkUsd: number;
  askUsd: number;
  trade: CounterTrade | null;
  copy: string;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

function money(value: number): string {
  const rounded = cents(value);
  return `$${rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function playerName(player: string): string {
  const name = player.trim();
  return name || 'Held card';
}

export function counterOffer(input: {
  askUsd: number;
  player: string;
  receiveId: string;
  range: SaleRange | null;
  held: readonly CounterHeld[];
}): CounterOffer | null {
  if (!input.range || !Number.isFinite(input.askUsd) || input.askUsd <= 0) return null;
  const ladder = buyLadder(input.range);
  if (!ladder) return null;
  const ask = cents(input.askUsd);
  if (ask <= ladder.walk + 0.001) return null;
  const split = cents((ask + ladder.walk) / 2);
  const splitCopy = `Their ${money(ask)} is over the walk (${money(ladder.walk)}). Split the difference at ${money(split)}. That split is still over the walk.`;

  const receive: TradeLadderCard = {
    id: input.receiveId || 'receive',
    player: playerName(input.player),
    usd: ladder.fair,
    range: input.range,
  };
  let best: CounterTrade | null = null;
  for (const card of input.held) {
    if (!card.id || card.id === input.receiveId) continue;
    if (!Number.isFinite(card.usd) || card.usd <= 0 || card.usd >= ask) continue;
    const giveUsd = cents(card.usd);
    const cashUsd = cents(ask - giveUsd);
    if (!(cashUsd > 0)) continue;
    const giveSide: TradeSide = { id: card.id, player: playerName(card.player), usd: giveUsd };
    const receiveSide: TradeSide = { id: receive.id, player: receive.player, usd: ladder.fair };
    const fairness = tradeFairness([giveSide], [receiveSide], cashUsd);
    const ladderCopy = tradeLadderCopy(tradeLadder(
      [{ id: card.id, player: giveSide.player, usd: giveUsd, range: card.range }],
      [receive],
    ));
    const name = giveSide.player;
    const better = best == null
      || cashUsd < best.cashUsd - 0.001
      || (Math.abs(cashUsd - best.cashUsd) <= 0.001 && name.localeCompare(best.givePlayer) < 0)
      || (Math.abs(cashUsd - best.cashUsd) <= 0.001 && name === best.givePlayer && card.id.localeCompare(best.giveId) < 0);
    if (!better) continue;
    best = {
      giveId: card.id,
      givePlayer: name,
      giveUsd,
      cashUsd,
      receiveUsd: ladder.fair,
      call: fairness.call,
      net: fairness.net,
      gapPct: fairness.gapPct,
      ladderCopy,
    };
  }

  const tradeCopy = best
    ? `Trade plus cash: give ${best.givePlayer} (${money(best.giveUsd)}) and ${money(best.cashUsd)} cash. You receive ${playerName(input.player)} at its fair (${money(best.receiveUsd)}), not at their ask. ${best.call} · give ${money(best.giveUsd)} · receive ${money(best.receiveUsd)} · net ${money(best.net)}. ${best.ladderCopy}`
    : 'No held card is under that ask, so there is no trade-plus-cash on this book. Not a dealer fill and not a live tape.';
  return {
    splitUsd: split,
    walkUsd: ladder.walk,
    askUsd: ask,
    trade: best,
    copy: `${splitCopy} ${tradeCopy}`,
  };
}
