import type { CardInventory, League } from '../../types';

export interface TradeProposal {
  id: string;
  giveCardId: string;
  givePlayer: string;
  giveValue: number;
  receiveCardId: string | null;
  receivePlayer: string;
  receiveValue: number;
  cashDelta: number;
  concentrationFrom: string;
  concentrationPct: number;
  rationale: string;
  advisoryOnly: true;
  source: 'local_inventory';
}

const CONCENTRATION_THRESHOLD = 35;

function cardValue(card: CardInventory): number {
  return card.currentValue || card.purchasePrice || 0;
}

function activeCards(inventory: CardInventory[]): CardInventory[] {
  return inventory.filter((c) => c.status !== 'sold' && cardValue(c) > 0);
}

function sharePct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

/**
 * Advisory "Card A for Card B + cash" ideas from local inventory only.
 * Not a marketplace, not an order book.
 */
export function generateTradeProposals(inventory: CardInventory[]): TradeProposal[] {
  const cards = activeCards(inventory);
  if (cards.length < 2) return [];

  const total = cards.reduce((sum, c) => sum + cardValue(c), 0);
  const proposals: TradeProposal[] = [];

  const byPlayer = new Map<string, CardInventory[]>();
  const byLeague = new Map<League, CardInventory[]>();
  for (const card of cards) {
    const pKey = card.player.toLowerCase();
    byPlayer.set(pKey, [...(byPlayer.get(pKey) ?? []), card]);
    byLeague.set(card.league, [...(byLeague.get(card.league) ?? []), card]);
  }

  const concentratedPlayers = [...byPlayer.entries()]
    .map(([key, group]) => ({
      key,
      group,
      value: group.reduce((s, c) => s + cardValue(c), 0),
    }))
    .filter((row) => sharePct(row.value, total) >= CONCENTRATION_THRESHOLD)
    .sort((a, b) => b.value - a.value);

  const concentratedLeagues = [...byLeague.entries()]
    .map(([league, group]) => ({
      league,
      group,
      value: group.reduce((s, c) => s + cardValue(c), 0),
    }))
    .filter((row) => sharePct(row.value, total) >= CONCENTRATION_THRESHOLD)
    .sort((a, b) => b.value - a.value);

  const underweightLeague = [...byLeague.entries()]
    .map(([league, group]) => ({
      league,
      group,
      value: group.reduce((s, c) => s + cardValue(c), 0),
    }))
    .sort((a, b) => a.value - b.value)[0];

  const usedGive = new Set<string>();

  const tryPair = (
    give: CardInventory,
    receive: CardInventory | undefined,
    concentrationFrom: string,
    concentrationPct: number,
    why: string,
  ) => {
    if (!receive || receive.id === give.id || usedGive.has(give.id)) return;
    usedGive.add(give.id);
    const giveValue = cardValue(give);
    const receiveValue = cardValue(receive);
    const cashDelta = Math.round((giveValue - receiveValue) * 100) / 100;
    const cashLabel = cashDelta >= 0
      ? `+ $${Math.abs(cashDelta).toLocaleString()} cash in`
      : `+ $${Math.abs(cashDelta).toLocaleString()} cash out`;
    proposals.push({
      id: `trade-${give.id}-${receive.id}`,
      giveCardId: give.id,
      givePlayer: give.player,
      giveValue,
      receiveCardId: receive.id,
      receivePlayer: receive.player,
      receiveValue,
      cashDelta,
      concentrationFrom,
      concentrationPct: Math.round(concentrationPct),
      rationale: `${why} Suggested swap: ${give.player} for ${receive.player} ${cashLabel}. Advisory only — local inventory, not a live marketplace.`,
      advisoryOnly: true,
      source: 'local_inventory',
    });
  };

  for (const row of concentratedPlayers.slice(0, 2)) {
    const give = [...row.group].sort((a, b) => cardValue(b) - cardValue(a))[0];
    const diversifiers = cards
      .filter((c) => c.player.toLowerCase() !== row.key)
      .sort((a, b) => cardValue(a) - cardValue(b));
    const receive = diversifiers[0];
    tryPair(
      give,
      receive,
      give.player,
      sharePct(row.value, total),
      `${give.player} is ${sharePct(row.value, total).toFixed(0)}% of NAV.`,
    );
  }

  for (const row of concentratedLeagues.slice(0, 2)) {
    if (proposals.length >= 4) break;
    const give = [...row.group].sort((a, b) => cardValue(b) - cardValue(a))[0];
    const receivePool = underweightLeague && underweightLeague.league !== row.league
      ? underweightLeague.group
      : cards.filter((c) => c.league !== row.league);
    const receive = [...receivePool].sort((a, b) => cardValue(a) - cardValue(b))[0];
    tryPair(
      give,
      receive,
      row.league,
      sharePct(row.value, total),
      `${row.league} is ${sharePct(row.value, total).toFixed(0)}% of NAV.`,
    );
  }

  return proposals.slice(0, 4);
}
