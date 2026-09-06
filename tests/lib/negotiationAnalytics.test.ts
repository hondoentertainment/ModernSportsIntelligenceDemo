import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import type { NegotiationSession } from '../../types';
import {
  NEGOTIATION_HISTORY_KEY,
  computeNegotiationStats,
  deriveArenaOutcome,
  discountPct,
  emptyNegotiationStats,
  formatDurationMs,
  formatRatePct,
  getHistory,
  getNegotiationIntel,
  getStats,
  isNegotiationRecord,
  recordNegotiation,
  recordWalkAway,
  recordsFromAcquisitionSessions,
  safeDurationMs,
  type AcquisitionSessionSnapshot,
  type NegotiationRecord,
} from '../../lib/trading/negotiationAnalytics';

function arenaSession(overrides: Partial<NegotiationSession> = {}): NegotiationSession {
  return {
    id: 'arena-1',
    targetItem: { id: 'card-1', name: 'Ohtani RC', price: 200, image: '' },
    currentUserOffer: 160,
    sellerAsk: 180,
    maxWillingToPay: 175,
    status: 'accepted',
    messages: [
      { id: 'm1', sender: 'seller', content: 'Ask', timestamp: '2026-03-01T10:00:00.000Z' },
      { id: 'm2', sender: 'user', content: 'Offer', timestamp: '2026-03-01T10:05:00.000Z', offerAmount: 160 },
    ],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:30:00.000Z',
    ...overrides,
  };
}

function record(overrides: Partial<NegotiationRecord> = {}): NegotiationRecord {
  return {
    id: 'r1',
    itemName: 'Card',
    listingPrice: 100,
    finalPrice: 80,
    maxWillingToPay: 90,
    discount: 20,
    roundCount: 2,
    outcome: 'accepted',
    timestamp: '2026-03-01T00:00:00.000Z',
    durationMs: 3_600_000,
    ...overrides,
  };
}

describe('negotiationAnalytics helpers', () => {
  beforeEach(() => {
    store.remove(NEGOTIATION_HISTORY_KEY);
  });

  it('returns empty stats for no history', () => {
    const empty = computeNegotiationStats([]);
    expect(empty).toEqual(emptyNegotiationStats());
    expect(getStats()).toEqual(emptyNegotiationStats());
  });

  it('computes win rate, discount, time-to-close, and walk/incomplete', () => {
    const stats = computeNegotiationStats([
      record({ id: 'w1', outcome: 'accepted', discount: 20, listingPrice: 100, finalPrice: 80, durationMs: 3_600_000, roundCount: 2 }),
      record({ id: 'w2', outcome: 'accepted', discount: 10, listingPrice: 200, finalPrice: 180, durationMs: 1_800_000, roundCount: 4 }),
      record({ id: 'w3', outcome: 'walked', discount: 0, listingPrice: 50, finalPrice: 50, durationMs: 600_000, roundCount: 1 }),
      record({ id: 'w4', outcome: 'countered', discount: 0, listingPrice: 75, finalPrice: 70, durationMs: 120_000, roundCount: 1 }),
    ]);

    expect(stats.totalNegotiations).toBe(4);
    expect(stats.winRate).toBe(50);
    expect(stats.avgDiscount).toBe(15);
    expect(stats.totalSaved).toBe(40);
    expect(stats.avgRounds).toBe(2);
    expect(stats.avgTimeToClose).toBe(Math.round((3_600_000 + 1_800_000) / 2));
    expect(stats.walkAwayRate).toBe(25);
    expect(stats.incompleteRate).toBe(25);
    expect(stats.walkIncompleteRate).toBe(50);
    expect(stats.bestDeal?.id).toBe('w1');
  });

  it('falls back to closed sessions for time-to-close when there are no wins', () => {
    const stats = computeNegotiationStats([
      record({ id: 'a', outcome: 'walked', durationMs: 1_000 }),
      record({ id: 'b', outcome: 'rejected', durationMs: 3_000 }),
    ]);
    expect(stats.winRate).toBe(0);
    expect(stats.avgDiscount).toBe(0);
    expect(stats.avgTimeToClose).toBe(2000);
    expect(stats.walkAwayRate).toBe(100);
    expect(stats.walkIncompleteRate).toBe(100);
    expect(stats.bestDeal).toBeNull();
  });

  it('groups playbook stats and treats missing playbook as Manual', () => {
    const stats = computeNegotiationStats([
      record({ id: 'p1', playbook: 'Lowball & Walk', outcome: 'accepted', discount: 30 }),
      record({ id: 'p2', playbook: 'Lowball & Walk', outcome: 'walked', discount: 0 }),
      record({ id: 'p3', outcome: 'accepted', discount: 5 }),
    ]);
    expect(stats.byPlaybook['Lowball & Walk'].count).toBe(2);
    expect(stats.byPlaybook['Lowball & Walk'].winRate).toBe(50);
    expect(stats.byPlaybook['Lowball & Walk'].avgDiscount).toBe(30);
    expect(stats.byPlaybook.Manual.count).toBe(1);
    expect(stats.byPlaybook.Manual.winRate).toBe(100);
  });

  it('formats duration and rate edges', () => {
    expect(formatDurationMs(0)).toBe('—');
    expect(formatDurationMs(-5)).toBe('—');
    expect(formatDurationMs(Number.NaN)).toBe('—');
    expect(formatDurationMs(30_000)).toBe('<1m');
    expect(formatDurationMs(5 * 60_000)).toBe('5m');
    expect(formatDurationMs(90 * 60_000)).toBe('1.5h');
    expect(formatDurationMs(12 * 60 * 60_000)).toBe('12h');
    expect(formatDurationMs(72 * 60 * 60_000)).toBe('3d');
    expect(formatRatePct(12.34)).toBe('12.3%');
    expect(formatRatePct(Number.NaN)).toBe('—');
  });

  it('computes discount and duration guards', () => {
    expect(discountPct(0, 10)).toBe(0);
    expect(discountPct(100, 75)).toBe(25);
    expect(safeDurationMs('bad', 'also-bad')).toBe(0);
    expect(safeDurationMs('2026-03-01T12:00:00.000Z', '2026-03-01T10:00:00.000Z')).toBe(0);
    expect(safeDurationMs('2026-03-01T10:00:00.000Z', '2026-03-01T10:05:00.000Z')).toBe(5 * 60_000);
  });

  it('validates stored records and ignores garbage history', () => {
    expect(isNegotiationRecord(null)).toBe(false);
    expect(isNegotiationRecord({ id: 'x' })).toBe(false);
    store.set(NEGOTIATION_HISTORY_KEY, [{ id: 'nope' }, 'bad', record({ id: 'ok' })]);
    expect(getHistory().map((row) => row.id)).toEqual(['ok']);
    store.set(NEGOTIATION_HISTORY_KEY, { not: 'an-array' });
    expect(getHistory()).toEqual([]);
  });

  it('records accepted and walk-away Arena outcomes, replacing the same session id', () => {
    const accepted = recordNegotiation(arenaSession(), 'Fair Market Anchor', 'accepted');
    expect(accepted.outcome).toBe('accepted');
    expect(accepted.discount).toBe(20);
    expect(accepted.playbook).toBe('Fair Market Anchor');
    expect(accepted.roundCount).toBe(1);
    expect(accepted.durationMs).toBe(30 * 60_000);

    const walked = recordWalkAway(arenaSession({ status: 'active' }), 'Lowball & Walk');
    expect(walked.outcome).toBe('walked');
    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0].playbook).toBe('Lowball & Walk');
  });

  it('derives Arena outcomes from session status when not explicit', () => {
    expect(deriveArenaOutcome(arenaSession({ status: 'accepted' }))).toBe('accepted');
    expect(deriveArenaOutcome(arenaSession({ status: 'rejected' }))).toBe('rejected');
    expect(deriveArenaOutcome(arenaSession({ status: 'active' }))).toBe('walked');
    expect(deriveArenaOutcome(arenaSession({ status: 'countered' }))).toBe('walked');
    expect(deriveArenaOutcome(arenaSession({ status: 'accepted' }), 'walked')).toBe('walked');
  });

  it('maps acquisition sessions and reports intel source honestly', () => {
    const sessions: AcquisitionSessionSnapshot[] = [
      {
        id: 'neg-win',
        listingTitle: 'Wemby',
        listingPrice: 1000,
        currentOffer: 900,
        stage: 'accepted',
        startedAt: '2026-03-08T10:00:00.000Z',
        updatedAt: '2026-03-10T10:00:00.000Z',
        rounds: 4,
        finalPrice: 900,
      },
      {
        id: 'neg-walk',
        listingTitle: 'Judge',
        listingPrice: 500,
        currentOffer: 400,
        stage: 'rejected',
        startedAt: '2026-03-09T10:00:00.000Z',
        updatedAt: '2026-03-09T12:00:00.000Z',
        rounds: 3,
      },
      {
        id: 'neg-open',
        listingTitle: 'Trout',
        listingPrice: 800,
        currentOffer: 700,
        stage: 'counter',
        startedAt: '2026-03-13T08:00:00.000Z',
        updatedAt: '2026-03-13T09:00:00.000Z',
        rounds: 2,
      },
    ];

    const mapped = recordsFromAcquisitionSessions(sessions);
    expect(mapped.map((row) => row.outcome)).toEqual(['accepted', 'walked', 'countered']);
    expect(mapped[0].discount).toBe(10);

    expect(getNegotiationIntel([]).source).toBe('empty');
    expect(getNegotiationIntel(mapped).source).toBe('simulated');
    expect(getNegotiationIntel(mapped).stats.winRate).toBeCloseTo(100 / 3, 5);

    recordNegotiation(arenaSession({ id: 'arena-own' }), 'Manual', 'accepted');
    expect(getNegotiationIntel([]).source).toBe('arena');
    expect(getNegotiationIntel(mapped).source).toBe('mixed');
    expect(getNegotiationIntel(mapped).arenaCount).toBe(1);
    expect(getNegotiationIntel(mapped).simulatedCount).toBe(3);
  });

  it('does not double-count extra records that share an Arena id', () => {
    recordNegotiation(arenaSession({ id: 'shared' }), 'Manual', 'accepted');
    const extras = recordsFromAcquisitionSessions([
      {
        id: 'shared',
        listingTitle: 'Dup',
        listingPrice: 10,
        currentOffer: 10,
        stage: 'accepted',
        startedAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T01:00:00.000Z',
        rounds: 1,
        finalPrice: 10,
      },
    ]);
    const intel = getNegotiationIntel(extras);
    expect(intel.records).toHaveLength(1);
    expect(intel.simulatedCount).toBe(0);
  });
});
