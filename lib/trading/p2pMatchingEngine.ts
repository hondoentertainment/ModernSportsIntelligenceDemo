/**
 * P2P matching-engine lite on top of msi_p2p_intents_v1.
 * Local match suggestions + reputation stub + escrow state machine / ledger.
 * No real-money escrow and no live fills.
 */
import { store } from '../dal/syncStore';
import {
  listOpenIntents,
  type P2PIntent,
} from '../utils/p2pIntentBoard';

export const P2P_MATCH_DISCLOSURE =
  'Local match suggestions only — not a live exchange, not real-money escrow, and not MSI-house inventory.';

export const P2P_REPUTATION_KEY = 'msi_p2p_reputation_v1';
export const P2P_ESCROW_KEY = 'msi_p2p_escrow_v1';
export const P2P_ESCROW_LEDGER_KEY = 'msi_p2p_escrow_ledger_v1';

export type MatchQuality = 'crosses' | 'near' | 'watch';
export type ReputationBand = 'unproven' | 'reliable' | 'disputed';
export type EscrowState = 'none' | 'offered' | 'funded_stub' | 'released_stub' | 'disputed' | 'cancelled';
export type EscrowEvent = 'offer' | 'fund_stub' | 'release_stub' | 'dispute' | 'cancel';

export interface P2PMatchSuggestion {
  id: string;
  bidId: string;
  askId: string;
  player: string;
  bidPrice: number;
  askPrice: number;
  spread: number;
  quality: MatchQuality;
  advisoryOnly: true;
}

export interface ReputationStats {
  completed: number;
  disputed: number;
  withdrawn: number;
  open: number;
}

export interface ReputationStub {
  score: number;
  band: ReputationBand;
  stats: ReputationStats;
  disclosure: string;
}

export interface EscrowStub {
  id: string;
  matchId: string;
  state: EscrowState;
  amount: number;
  updatedAt: string;
}

export interface EscrowLedgerEntry {
  id: string;
  escrowId: string;
  event: EscrowEvent;
  from: EscrowState;
  to: EscrowState;
  note: string;
  at: string;
}

const ESCROW_TRANSITIONS: Record<EscrowState, Partial<Record<EscrowEvent, EscrowState>>> = {
  none: { offer: 'offered', cancel: 'cancelled' },
  offered: { fund_stub: 'funded_stub', cancel: 'cancelled', dispute: 'disputed' },
  funded_stub: { release_stub: 'released_stub', dispute: 'disputed', cancel: 'cancelled' },
  released_stub: {},
  disputed: { cancel: 'cancelled', release_stub: 'released_stub' },
  cancelled: {},
};

function playerKey(player: string): string {
  return player.trim().toLowerCase();
}

export function classifyMatchQuality(spread: number): MatchQuality {
  if (spread >= 0) return 'crosses';
  if (spread >= -25) return 'near';
  return 'watch';
}

export function suggestMatches(intents: P2PIntent[] = listOpenIntents()): P2PMatchSuggestion[] {
  const open = intents.filter((intent) => intent.status === 'open');
  const bids = open.filter((intent) => intent.side === 'bid');
  const asks = open.filter((intent) => intent.side === 'ask');
  const out: P2PMatchSuggestion[] = [];
  const seen = new Set<string>();

  for (const bid of bids) {
    for (const ask of asks) {
      if (playerKey(bid.player) !== playerKey(ask.player)) continue;
      if (bid.year && ask.year && bid.year !== ask.year) continue;
      const id = `match-${bid.id}-${ask.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      const spread = Math.round((bid.limitPrice - ask.limitPrice) * 100) / 100;
      out.push({
        id,
        bidId: bid.id,
        askId: ask.id,
        player: ask.player,
        bidPrice: bid.limitPrice,
        askPrice: ask.limitPrice,
        spread,
        quality: classifyMatchQuality(spread),
        advisoryOnly: true,
      });
    }
  }

  return out.sort((a, b) => b.spread - a.spread);
}

export function scoreReputation(stats: ReputationStats): ReputationStub {
  const completed = Math.max(0, stats.completed);
  const disputed = Math.max(0, stats.disputed);
  const withdrawn = Math.max(0, stats.withdrawn);
  const open = Math.max(0, stats.open);
  const attempts = completed + disputed + withdrawn;
  const completionRatio = attempts === 0 ? 0.45 : completed / attempts;
  const disputePenalty = disputed * 18;
  const withdrawPenalty = withdrawn * 4;
  const openNudge = Math.min(8, open * 2);
  const raw = Math.round(completionRatio * 100 - disputePenalty - withdrawPenalty + openNudge);
  const score = Math.min(100, Math.max(0, raw));
  let band: ReputationBand = 'unproven';
  if (disputed > 0 || score < 40) band = 'disputed';
  else if (completed >= 2 && score >= 60) band = 'reliable';
  return {
    score,
    band,
    stats: { completed, disputed, withdrawn, open },
    disclosure: P2P_MATCH_DISCLOSURE,
  };
}

export function readReputationStats(): ReputationStats {
  const raw = store.get<Partial<ReputationStats>>(P2P_REPUTATION_KEY, {
    completed: 0,
    disputed: 0,
    withdrawn: 0,
    open: listOpenIntents().length,
  });
  return {
    completed: Number(raw?.completed) || 0,
    disputed: Number(raw?.disputed) || 0,
    withdrawn: Number(raw?.withdrawn) || 0,
    open: Number.isFinite(Number(raw?.open)) ? Number(raw?.open) : listOpenIntents().length,
  };
}

export function writeReputationStats(partial: Partial<ReputationStats>): ReputationStats {
  const next = { ...readReputationStats(), ...partial };
  store.set(P2P_REPUTATION_KEY, next);
  return next;
}

export function localReputation(): ReputationStub {
  return scoreReputation(readReputationStats());
}

export function transitionEscrow(current: EscrowState, event: EscrowEvent): EscrowState | null {
  return ESCROW_TRANSITIONS[current][event] ?? null;
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listEscrowStubs(): EscrowStub[] {
  const raw = store.get<EscrowStub[]>(P2P_ESCROW_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function listEscrowLedger(): EscrowLedgerEntry[] {
  const raw = store.get<EscrowLedgerEntry[]>(P2P_ESCROW_LEDGER_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function applyEscrowEvent(
  match: Pick<P2PMatchSuggestion, 'id' | 'askPrice' | 'bidPrice'>,
  event: EscrowEvent,
  note = '',
): { escrow: EscrowStub; ledger: EscrowLedgerEntry } | null {
  const current = listEscrowStubs();
  const existing = current.find((row) => row.matchId === match.id);
  const from: EscrowState = existing?.state ?? 'none';
  const to = transitionEscrow(from, event);
  if (!to) return null;

  const now = new Date().toISOString();
  const escrow: EscrowStub = {
    id: existing?.id ?? newId('escrow'),
    matchId: match.id,
    state: to,
    amount: Math.min(match.askPrice, match.bidPrice),
    updatedAt: now,
  };
  const ledger: EscrowLedgerEntry = {
    id: newId('ledger'),
    escrowId: escrow.id,
    event,
    from,
    to,
    note: note.slice(0, 160),
    at: now,
  };

  const next = existing
    ? current.map((row) => (row.id === escrow.id ? escrow : row))
    : [escrow, ...current];
  store.set(P2P_ESCROW_KEY, next.slice(0, 80));
  store.set(P2P_ESCROW_LEDGER_KEY, [ledger, ...listEscrowLedger()].slice(0, 200));

  if (to === 'released_stub') {
    const stats = readReputationStats();
    writeReputationStats({ completed: stats.completed + 1 });
  }
  if (to === 'disputed') {
    const stats = readReputationStats();
    writeReputationStats({ disputed: stats.disputed + 1 });
  }

  return { escrow, ledger };
}

export function escrowLabel(state: EscrowState): string {
  switch (state) {
    case 'offered':
      return 'Escrow offered (stub)';
    case 'funded_stub':
      return 'Funded stub — no real money';
    case 'released_stub':
      return 'Released stub';
    case 'disputed':
      return 'Disputed (local)';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'No escrow';
  }
}
