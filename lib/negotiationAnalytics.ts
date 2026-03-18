import { store } from './dal/syncStore';
import { NegotiationSession } from '../types';

const STORAGE_KEY = 'msi-negotiation-history';

export interface NegotiationRecord {
  id: string;
  itemName: string;
  listingPrice: number;
  finalPrice: number;
  maxWillingToPay: number;
  discount: number;         // % saved from listing
  roundCount: number;
  outcome: 'accepted' | 'rejected' | 'countered' | 'walked';
  playbook?: string;
  timestamp: string;
  durationMs: number;
}

export interface NegotiationStats {
  totalNegotiations: number;
  winRate: number;              // % accepted
  avgDiscount: number;          // average % saved
  totalSaved: number;           // total $ saved across all deals
  avgRounds: number;
  avgTimeToClose: number;       // ms
  walkAwayRate: number;
  bestDeal: NegotiationRecord | null;
  byPlaybook: Record<string, { count: number; winRate: number; avgDiscount: number }>;
}

/** Record a completed negotiation */
export function recordNegotiation(
  session: NegotiationSession,
  playbook?: string
): NegotiationRecord {
  const history = getHistory();

  const finalPrice = session.status === 'accepted' ? session.currentUserOffer : session.sellerAsk;
  const discount = session.targetItem.price > 0
    ? ((session.targetItem.price - finalPrice) / session.targetItem.price) * 100
    : 0;

  const record: NegotiationRecord = {
    id: session.id,
    itemName: session.targetItem.name,
    listingPrice: session.targetItem.price,
    finalPrice,
    maxWillingToPay: session.maxWillingToPay,
    discount: Math.round(discount * 10) / 10,
    roundCount: session.messages.filter(m => m.sender === 'user').length,
    outcome: session.status === 'accepted' ? 'accepted' : 'rejected',
    playbook,
    timestamp: new Date().toISOString(),
    durationMs: new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime()
  };

  history.push(record);
  store.set(STORAGE_KEY, history);
  return record;
}

/** Get negotiation history */
export function getHistory(): NegotiationRecord[] {
  return store.get<NegotiationRecord[]>(STORAGE_KEY, []);
}

/** Calculate aggregate negotiation statistics */
export function getStats(): NegotiationStats {
  const history = getHistory();

  if (history.length === 0) {
    return {
      totalNegotiations: 0,
      winRate: 0,
      avgDiscount: 0,
      totalSaved: 0,
      avgRounds: 0,
      avgTimeToClose: 0,
      walkAwayRate: 0,
      bestDeal: null,
      byPlaybook: {}
    };
  }

  const accepted = history.filter(r => r.outcome === 'accepted');
  const walked = history.filter(r => r.outcome === 'walked' || r.outcome === 'rejected');

  const totalSaved = accepted.reduce((sum, r) => sum + (r.listingPrice - r.finalPrice), 0);
  const avgDiscount = accepted.length > 0
    ? accepted.reduce((sum, r) => sum + r.discount, 0) / accepted.length
    : 0;
  const avgRounds = history.reduce((sum, r) => sum + r.roundCount, 0) / history.length;
  const avgTime = history.reduce((sum, r) => sum + r.durationMs, 0) / history.length;

  // Best deal by discount %
  const bestDeal = accepted.length > 0
    ? accepted.reduce((best, r) => r.discount > best.discount ? r : best)
    : null;

  // Stats by playbook
  const byPlaybook: Record<string, { count: number; winRate: number; avgDiscount: number }> = {};
  const grouped = new Map<string, NegotiationRecord[]>();
  history.forEach(r => {
    const key = r.playbook || 'Manual';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(r);
  });

  grouped.forEach((records, key) => {
    const wins = records.filter(r => r.outcome === 'accepted');
    byPlaybook[key] = {
      count: records.length,
      winRate: records.length > 0 ? (wins.length / records.length) * 100 : 0,
      avgDiscount: wins.length > 0
        ? wins.reduce((s, r) => s + r.discount, 0) / wins.length
        : 0
    };
  });

  return {
    totalNegotiations: history.length,
    winRate: (accepted.length / history.length) * 100,
    avgDiscount: Math.round(avgDiscount * 10) / 10,
    totalSaved: Math.round(totalSaved),
    avgRounds: Math.round(avgRounds * 10) / 10,
    avgTimeToClose: Math.round(avgTime),
    walkAwayRate: history.length > 0 ? (walked.length / history.length) * 100 : 0,
    bestDeal,
    byPlaybook
  };
}
