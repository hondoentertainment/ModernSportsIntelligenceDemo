import { store } from '../dal/syncStore';
import { NegotiationSession } from '../../types';

export const NEGOTIATION_HISTORY_KEY = 'msi-negotiation-history';

export type NegotiationOutcome = 'accepted' | 'rejected' | 'countered' | 'walked';

export interface NegotiationRecord {
  id: string;
  itemName: string;
  listingPrice: number;
  finalPrice: number;
  maxWillingToPay: number;
  discount: number; // % saved from listing
  roundCount: number;
  outcome: NegotiationOutcome;
  playbook?: string;
  timestamp: string;
  durationMs: number;
}

export interface NegotiationStats {
  totalNegotiations: number;
  winRate: number; // % accepted
  avgDiscount: number; // average % saved on accepted deals
  totalSaved: number; // total $ saved across accepted deals
  avgRounds: number;
  avgTimeToClose: number; // ms
  walkAwayRate: number; // walked + rejected
  incompleteRate: number; // still-open / countered
  walkIncompleteRate: number; // non-wins (walk + incomplete)
  bestDeal: NegotiationRecord | null;
  byPlaybook: Record<string, { count: number; winRate: number; avgDiscount: number }>;
}

export type NegotiationIntelSource = 'empty' | 'arena' | 'simulated' | 'mixed';

export interface NegotiationIntel {
  stats: NegotiationStats;
  source: NegotiationIntelSource;
  records: NegotiationRecord[];
  arenaCount: number;
  simulatedCount: number;
}

/** Minimal campaign-session shape so Arena analytics stay decoupled from the acquisition module. */
export interface AcquisitionSessionSnapshot {
  id: string;
  listingTitle: string;
  listingPrice: number;
  currentOffer: number;
  stage: string;
  startedAt: string;
  updatedAt: string;
  rounds: number;
  finalPrice?: number;
  savings?: number;
}

const OUTCOMES: ReadonlySet<string> = new Set(['accepted', 'rejected', 'countered', 'walked']);

export function emptyNegotiationStats(): NegotiationStats {
  return {
    totalNegotiations: 0,
    winRate: 0,
    avgDiscount: 0,
    totalSaved: 0,
    avgRounds: 0,
    avgTimeToClose: 0,
    walkAwayRate: 0,
    incompleteRate: 0,
    walkIncompleteRate: 0,
    bestDeal: null,
    byPlaybook: {},
  };
}

export function isNegotiationRecord(raw: unknown): raw is NegotiationRecord {
  if (!raw || typeof raw !== 'object') return false;
  const record = raw as Partial<NegotiationRecord>;
  return (
    typeof record.id === 'string' &&
    record.id.length > 0 &&
    typeof record.itemName === 'string' &&
    typeof record.listingPrice === 'number' &&
    Number.isFinite(record.listingPrice) &&
    typeof record.finalPrice === 'number' &&
    Number.isFinite(record.finalPrice) &&
    typeof record.discount === 'number' &&
    Number.isFinite(record.discount) &&
    typeof record.roundCount === 'number' &&
    Number.isFinite(record.roundCount) &&
    typeof record.outcome === 'string' &&
    OUTCOMES.has(record.outcome) &&
    typeof record.durationMs === 'number' &&
    Number.isFinite(record.durationMs)
  );
}

export function safeDurationMs(startIso: string, endIso: string): number {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return end - start;
}

export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const minutes = ms / 60_000;
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 48) {
    const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10;
    return `${rounded}h`;
  }
  return `${Math.round(hours / 24)}d`;
}

export function formatRatePct(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${Math.round(value * 10) / 10}%`;
}

export function discountPct(listingPrice: number, finalPrice: number): number {
  if (!Number.isFinite(listingPrice) || listingPrice <= 0 || !Number.isFinite(finalPrice)) return 0;
  return Math.round(((listingPrice - finalPrice) / listingPrice) * 1000) / 10;
}

export function deriveArenaOutcome(
  session: NegotiationSession,
  explicit?: NegotiationOutcome
): NegotiationOutcome {
  if (explicit && OUTCOMES.has(explicit)) return explicit;
  if (session.status === 'accepted') return 'accepted';
  if (session.status === 'rejected') return 'rejected';
  if (session.status === 'countered' || session.status === 'active') return 'walked';
  return 'rejected';
}

function outcomeFromAcquisitionStage(stage: string): NegotiationOutcome {
  if (stage === 'accepted') return 'accepted';
  if (stage === 'rejected' || stage === 'expired') return 'walked';
  return 'countered';
}

export function recordsFromAcquisitionSessions(
  sessions: AcquisitionSessionSnapshot[]
): NegotiationRecord[] {
  if (!Array.isArray(sessions)) return [];
  return sessions.filter((session) => session && typeof session.id === 'string').map((session) => {
    const outcome = outcomeFromAcquisitionStage(session.stage);
    const listingPrice = Number.isFinite(session.listingPrice) ? session.listingPrice : 0;
    const offer = Number.isFinite(session.currentOffer) ? session.currentOffer : 0;
    const acceptedPrice = Number.isFinite(session.finalPrice) ? session.finalPrice : offer;
    const finalPrice = outcome === 'accepted' ? acceptedPrice : offer;
    return {
      id: session.id,
      itemName: session.listingTitle || 'Campaign listing',
      listingPrice,
      finalPrice,
      maxWillingToPay: listingPrice,
      discount: discountPct(listingPrice, finalPrice),
      roundCount: Number.isFinite(session.rounds) ? session.rounds : 0,
      outcome,
      playbook: 'Campaign',
      timestamp: session.updatedAt,
      durationMs: safeDurationMs(session.startedAt, session.updatedAt),
    };
  });
}

export function computeNegotiationStats(history: NegotiationRecord[]): NegotiationStats {
  if (!Array.isArray(history) || history.length === 0) {
    return emptyNegotiationStats();
  }

  const accepted = history.filter((record) => record.outcome === 'accepted');
  const walked = history.filter((record) => record.outcome === 'walked' || record.outcome === 'rejected');
  const incomplete = history.filter((record) => record.outcome === 'countered');
  const closed = history.filter(
    (record) => record.outcome === 'accepted' || record.outcome === 'walked' || record.outcome === 'rejected'
  );

  const totalSaved = accepted.reduce((sum, record) => sum + (record.listingPrice - record.finalPrice), 0);
  const avgDiscount =
    accepted.length > 0
      ? accepted.reduce((sum, record) => sum + record.discount, 0) / accepted.length
      : 0;
  const avgRounds = history.reduce((sum, record) => sum + record.roundCount, 0) / history.length;
  const timeSource = accepted.length > 0 ? accepted : closed;
  const avgTime =
    timeSource.length > 0
      ? timeSource.reduce((sum, record) => sum + Math.max(0, record.durationMs), 0) / timeSource.length
      : 0;

  const bestDeal =
    accepted.length > 0
      ? accepted.reduce((best, record) => (record.discount > best.discount ? record : best))
      : null;

  const byPlaybook: Record<string, { count: number; winRate: number; avgDiscount: number }> = {};
  const grouped = new Map<string, NegotiationRecord[]>();
  history.forEach((record) => {
    const key = record.playbook || 'Manual';
    const bucket = grouped.get(key);
    if (bucket) bucket.push(record);
    else grouped.set(key, [record]);
  });

  grouped.forEach((records, key) => {
    const wins = records.filter((record) => record.outcome === 'accepted');
    byPlaybook[key] = {
      count: records.length,
      winRate: records.length > 0 ? (wins.length / records.length) * 100 : 0,
      avgDiscount:
        wins.length > 0 ? wins.reduce((sum, record) => sum + record.discount, 0) / wins.length : 0,
    };
  });

  const total = history.length;
  return {
    totalNegotiations: total,
    winRate: (accepted.length / total) * 100,
    avgDiscount: Math.round(avgDiscount * 10) / 10,
    totalSaved: Math.round(totalSaved),
    avgRounds: Math.round(avgRounds * 10) / 10,
    avgTimeToClose: Math.round(avgTime),
    walkAwayRate: (walked.length / total) * 100,
    incompleteRate: (incomplete.length / total) * 100,
    walkIncompleteRate: ((walked.length + incomplete.length) / total) * 100,
    bestDeal,
    byPlaybook,
  };
}

/** Record a completed or abandoned Arena session. Replaces any prior row for the same session id. */
export function recordNegotiation(
  session: NegotiationSession,
  playbook?: string,
  outcome?: NegotiationOutcome
): NegotiationRecord {
  const history = getHistory();
  const resolved = deriveArenaOutcome(session, outcome);
  const finalPrice =
    resolved === 'accepted' ? session.currentUserOffer : session.currentUserOffer || session.sellerAsk;
  const messages = Array.isArray(session.messages) ? session.messages : [];

  const record: NegotiationRecord = {
    id: session.id,
    itemName: session.targetItem?.name || 'Negotiation',
    listingPrice: session.targetItem?.price ?? 0,
    finalPrice,
    maxWillingToPay: session.maxWillingToPay,
    discount: discountPct(session.targetItem?.price ?? 0, finalPrice),
    roundCount: messages.filter((message) => message.sender === 'user').length,
    outcome: resolved,
    playbook,
    timestamp: new Date().toISOString(),
    durationMs: safeDurationMs(session.createdAt, session.updatedAt),
  };

  const next = history.filter((row) => row.id !== record.id);
  next.push(record);
  store.set(NEGOTIATION_HISTORY_KEY, next);
  return record;
}

export function recordWalkAway(session: NegotiationSession, playbook?: string): NegotiationRecord {
  return recordNegotiation(session, playbook, 'walked');
}

export function getHistory(): NegotiationRecord[] {
  const raw = store.get<unknown>(NEGOTIATION_HISTORY_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isNegotiationRecord);
}

export function getStats(): NegotiationStats {
  return computeNegotiationStats(getHistory());
}

export function getNegotiationIntel(extraRecords: NegotiationRecord[] = []): NegotiationIntel {
  const arena = getHistory();
  const arenaIds = new Set(arena.map((record) => record.id));
  const extras = Array.isArray(extraRecords) ? extraRecords.filter(isNegotiationRecord) : [];
  const simulated = extras.filter((record) => !arenaIds.has(record.id));
  const records = [...arena, ...simulated];

  let source: NegotiationIntelSource = 'empty';
  if (arena.length > 0 && simulated.length > 0) source = 'mixed';
  else if (arena.length > 0) source = 'arena';
  else if (simulated.length > 0) source = 'simulated';

  return {
    stats: computeNegotiationStats(records),
    source,
    records,
    arenaCount: arena.length,
    simulatedCount: simulated.length,
  };
}
